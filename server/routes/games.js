const express = require('express');
const { getDb, addToWallet, deductFromWallet } = require('../db/database');
const { generateServerSeed, generateClientSeed, fairRandom, generateCrashPoint, hashSeed } = require('../services/rng');
const { getSkinPrice: getSkinPriceFromDb } = require('../data/skinPrices');

module.exports = function(io) {
  const router = express.Router();

  // ======== COINFLIP ========
  router.post('/coinflip', (req, res) => {
    const db = getDb();
    const { playerId, wager, side } = req.body; // side: 'ct' or 't'

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    if (player.wallet < wager) return res.status(400).json({ error: 'Insufficient funds' });
    if (wager <= 0) return res.status(400).json({ error: 'Invalid wager' });

    // Deduct wager
    deductFromWallet(playerId, wager);

    // Provably fair flip
    const serverSeed = generateServerSeed();
    const clientSeed = generateClientSeed();
    const result = fairRandom(serverSeed, clientSeed, 0);
    const winSide = result < 0.5 ? 'ct' : 't';
    const won = side === winSide;
    const profitLoss = won ? wager : -wager;

    if (won) {
      addToWallet(playerId, wager * 2);
    }

    db.prepare('INSERT INTO game_history (game_type, player_id, wager, result, profit_loss) VALUES (?, ?, ?, ?, ?)')
      .run('coinflip', playerId, wager, won ? 'win' : 'loss', profitLoss);

    db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
      .run(playerId, 'coinflip', profitLoss, `Coinflip ${won ? 'won' : 'lost'} $${wager}`);

    const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);

    res.json({
      won,
      winSide,
      playerSide: side,
      wager,
      profitLoss,
      player: updatedPlayer,
      provablyFair: { serverSeed, clientSeed, hash: hashSeed(serverSeed) },
    });
  });

  // ======== CRASH ========
  let crashState = {
    phase: 'betting', // 'betting', 'running', 'crashed'
    bets: [],
    multiplier: 1.00,
    crashPoint: 0,
    serverSeed: null,
    clientSeed: null,
    timer: null,
    startTime: null,
  };

  // Bot configuration for crash
  const CRASH_BOT_NAMES = ['Bot_Alpha', 'Bot_Bravo', 'Bot_Charlie'];

  function addCrashBots() {
    const botCount = 1 + Math.floor(Math.random() * 3); // 1-3 bots
    const shuffled = [...CRASH_BOT_NAMES].sort(() => Math.random() - 0.5);
    for (let i = 0; i < botCount; i++) {
      const botName = shuffled[i];
      const amount = Math.round((5 + Math.random() * 95) * 100) / 100; // $5-$100
      const bet = {
        playerId: `bot_${botName.toLowerCase()}`,
        botName,
        isBot: true,
        amount,
        cashedOut: false,
        cashoutMult: 0,
        targetCashout: 1.2 + Math.random() * 3.8, // 1.2x-5x
      };
      crashState.bets.push(bet);
      io.emit('crash_bet', { playerId: bet.playerId, botName, isBot: true, amount });
    }
  }

  function processCrashBotCashouts() {
    for (const bet of crashState.bets) {
      if (bet.isBot && !bet.cashedOut && crashState.multiplier >= bet.targetCashout) {
        bet.cashedOut = true;
        bet.cashoutMult = crashState.multiplier;
        const payout = Math.round(bet.amount * crashState.multiplier * 100) / 100;
        io.emit('crash_cashout', {
          playerId: bet.playerId,
          botName: bet.botName,
          isBot: true,
          multiplier: crashState.multiplier,
          payout,
        });
      }
    }
  }

  function startCrashRound() {
    crashState.phase = 'betting';
    crashState.bets = [];
    crashState.multiplier = 1.00;
    crashState.serverSeed = generateServerSeed();
    crashState.clientSeed = generateClientSeed();
    crashState.crashPoint = generateCrashPoint(crashState.serverSeed, crashState.clientSeed);

    io.emit('crash_state', { phase: 'betting', countdown: 10 });

    // Add bot bets after a short random delay during the betting phase
    setTimeout(() => {
      if (crashState.phase === 'betting') {
        addCrashBots();
      }
    }, 2000 + Math.random() * 5000);

    // 10 second betting window
    setTimeout(() => {
      crashState.phase = 'running';
      crashState.startTime = Date.now();
      io.emit('crash_state', { phase: 'running' });

      // Update multiplier every 50ms
      crashState.timer = setInterval(() => {
        const elapsed = (Date.now() - crashState.startTime) / 1000;
        crashState.multiplier = Math.pow(Math.E, 0.06 * elapsed);
        crashState.multiplier = Math.round(crashState.multiplier * 100) / 100;

        // Check for bot cashouts
        processCrashBotCashouts();

        if (crashState.multiplier >= crashState.crashPoint) {
          // CRASH!
          clearInterval(crashState.timer);
          crashState.phase = 'crashed';
          crashState.multiplier = crashState.crashPoint;

          // Process busted bets (only real players get DB records)
          const db = getDb();
          for (const bet of crashState.bets) {
            if (!bet.cashedOut && !bet.isBot) {
              db.prepare('INSERT INTO game_history (game_type, player_id, wager, result, profit_loss) VALUES (?, ?, ?, ?, ?)')
                .run('crash', bet.playerId, bet.amount, 'bust', -bet.amount);
              db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
                .run(bet.playerId, 'crash', -bet.amount, `Crash busted at ${crashState.crashPoint}x`);
            }
          }

          io.emit('crash_state', {
            phase: 'crashed',
            crashPoint: crashState.crashPoint,
            bets: crashState.bets.map(b => ({
              playerId: b.playerId,
              playerName: b.playerName || null,
              botName: b.botName || null,
              isBot: b.isBot || false,
              amount: b.amount,
              cashedOut: b.cashedOut,
              cashoutMult: b.cashoutMult,
            })),
            provablyFair: { serverSeed: crashState.serverSeed, clientSeed: crashState.clientSeed },
          });

          // Start new round after 5 seconds
          setTimeout(startCrashRound, 5000);
        } else {
          io.emit('crash_tick', { multiplier: crashState.multiplier });
        }
      }, 50);
    }, 10000);
  }

  // Auto-start crash rounds
  startCrashRound();

  router.post('/crash/bet', (req, res) => {
    const db = getDb();
    const { playerId, amount } = req.body;

    if (crashState.phase !== 'betting') return res.status(400).json({ error: 'Betting is closed' });

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    if (player.wallet < amount) return res.status(400).json({ error: 'Insufficient funds' });
    if (amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    // Check if already bet
    if (crashState.bets.find(b => b.playerId === playerId)) {
      return res.status(400).json({ error: 'Already placed a bet' });
    }

    deductFromWallet(playerId, amount);
    crashState.bets.push({ playerId, playerName: player.name, amount, cashedOut: false, cashoutMult: 0 });

    const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
    io.emit('crash_bet', { playerId, playerName: player.name, amount });
    res.json({ success: true, player: updatedPlayer });
  });

  router.post('/crash/cashout', (req, res) => {
    const db = getDb();
    const { playerId } = req.body;

    if (crashState.phase !== 'running') return res.status(400).json({ error: 'Game not running' });

    const bet = crashState.bets.find(b => b.playerId === playerId && !b.cashedOut);
    if (!bet) return res.status(400).json({ error: 'No active bet' });

    bet.cashedOut = true;
    bet.cashoutMult = crashState.multiplier;
    const payout = Math.round(bet.amount * crashState.multiplier * 100) / 100;
    const profitLoss = payout - bet.amount;

    addToWallet(playerId, payout);

    db.prepare('INSERT INTO game_history (game_type, player_id, wager, result, profit_loss) VALUES (?, ?, ?, ?, ?)')
      .run('crash', playerId, bet.amount, `cashout_${crashState.multiplier}x`, profitLoss);

    db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
      .run(playerId, 'crash', profitLoss, `Crash cashout at ${crashState.multiplier}x (+$${payout})`);

    const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
    io.emit('crash_cashout', { playerId, multiplier: crashState.multiplier, payout });
    res.json({ success: true, multiplier: crashState.multiplier, payout, profitLoss, player: updatedPlayer });
  });

  router.get('/crash/state', (req, res) => {
    res.json({
      phase: crashState.phase,
      multiplier: crashState.multiplier,
      bets: crashState.bets.map(b => ({
        playerId: b.playerId,
        playerName: b.playerName || null,
        botName: b.botName || null,
        isBot: b.isBot || false,
        amount: b.amount,
        cashedOut: b.cashedOut,
        cashoutMult: b.cashoutMult,
      })),
    });
  });

  // ======== ROULETTE ========
  let rouletteState = {
    phase: 'betting', // 'betting', 'spinning', 'result'
    bets: [],
    result: null,
    timer: null,
  };

  const ROULETTE_SLOTS = [
    { number: 0, color: 'green' },
    { number: 1, color: 'red' }, { number: 2, color: 'black' },
    { number: 3, color: 'red' }, { number: 4, color: 'black' },
    { number: 5, color: 'red' }, { number: 6, color: 'black' },
    { number: 7, color: 'red' }, { number: 8, color: 'black' },
    { number: 9, color: 'red' }, { number: 10, color: 'black' },
    { number: 11, color: 'red' }, { number: 12, color: 'black' },
    { number: 13, color: 'red' }, { number: 14, color: 'black' },
  ];

  // Bot configuration for roulette
  const ROULETTE_BOT_NAMES = ['Bot_Delta', 'Bot_Echo', 'Bot_Foxtrot', 'Bot_Golf'];

  function addRouletteBots() {
    const botCount = 2 + Math.floor(Math.random() * 3); // 2-4 bots
    const shuffled = [...ROULETTE_BOT_NAMES].sort(() => Math.random() - 0.5);
    for (let i = 0; i < botCount; i++) {
      const botName = shuffled[i];
      const amount = Math.round((5 + Math.random() * 45) * 100) / 100; // $5-$50
      // Weighted random: mostly red/black, rarely green
      const rand = Math.random();
      const betType = rand < 0.45 ? 'red' : rand < 0.90 ? 'black' : 'green';
      const bet = {
        playerId: `bot_${botName.toLowerCase()}`,
        botName,
        isBot: true,
        amount,
        betType,
      };
      rouletteState.bets.push(bet);
      io.emit('roulette_bet', { playerId: bet.playerId, botName, isBot: true, amount, betType });
    }
  }

  function startRouletteRound() {
    rouletteState.phase = 'betting';
    rouletteState.bets = [];
    rouletteState.result = null;

    io.emit('roulette_state', { phase: 'betting', countdown: 15 });

    // Add bot bets after a random delay during the betting phase
    setTimeout(() => {
      if (rouletteState.phase === 'betting') {
        addRouletteBots();
      }
    }, 3000 + Math.random() * 8000);

    setTimeout(() => {
      rouletteState.phase = 'spinning';
      const serverSeed = generateServerSeed();
      const clientSeed = generateClientSeed();
      const roll = fairRandom(serverSeed, clientSeed, 0);
      const slotIndex = Math.floor(roll * ROULETTE_SLOTS.length);
      rouletteState.result = ROULETTE_SLOTS[slotIndex];

      io.emit('roulette_state', { phase: 'spinning', result: rouletteState.result, slotIndex });

      // Wait for spin animation (5 seconds)
      setTimeout(() => {
        rouletteState.phase = 'result';
        const db = getDb();
        const payouts = [];

        for (const bet of rouletteState.bets) {
          let multiplier = 0;
          if (bet.betType === rouletteState.result.color) {
            multiplier = rouletteState.result.color === 'green' ? 14 : 2;
          }

          const payout = bet.amount * multiplier;
          const profitLoss = payout - bet.amount;

          // Skip DB operations for bot bets
          if (!bet.isBot) {
            if (payout > 0) {
              addToWallet(bet.playerId, payout);
            }

            db.prepare('INSERT INTO game_history (game_type, player_id, wager, result, profit_loss) VALUES (?, ?, ?, ?, ?)')
              .run('roulette', bet.playerId, bet.amount, `${rouletteState.result.color}_${rouletteState.result.number}`, profitLoss);

            db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
              .run(bet.playerId, 'roulette', profitLoss, `Roulette ${profitLoss >= 0 ? 'won' : 'lost'} on ${bet.betType}`);
          }

          payouts.push({
            playerId: bet.playerId,
            botName: bet.botName || null,
            isBot: bet.isBot || false,
            betType: bet.betType,
            amount: bet.amount,
            payout,
            profitLoss,
          });
        }

        io.emit('roulette_result', {
          result: rouletteState.result,
          payouts,
          provablyFair: { serverSeed, clientSeed },
        });

        setTimeout(startRouletteRound, 5000);
      }, 5000);
    }, 15000);
  }

  startRouletteRound();

  router.post('/roulette/bet', (req, res) => {
    const db = getDb();
    const { playerId, amount, betType } = req.body; // betType: 'red', 'black', 'green'

    if (!['red', 'black', 'green'].includes(betType)) return res.status(400).json({ error: 'Invalid bet type' });

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    if (player.wallet < amount) return res.status(400).json({ error: 'Insufficient funds' });
    if (amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    // Deduct wager
    deductFromWallet(playerId, amount);

    // Provably fair spin
    const serverSeed = generateServerSeed();
    const clientSeed = generateClientSeed();
    const roll = fairRandom(serverSeed, clientSeed, 0);
    const slotIndex = Math.floor(roll * ROULETTE_SLOTS.length);
    const result = ROULETTE_SLOTS[slotIndex];

    // Calculate payout
    let multiplier = 0;
    if (betType === result.color) {
      multiplier = result.color === 'green' ? 14 : 2;
    }
    const payout = amount * multiplier;
    const profitLoss = payout - amount;

    if (payout > 0) {
      addToWallet(playerId, payout);
    }

    db.prepare('INSERT INTO game_history (game_type, player_id, wager, result, profit_loss) VALUES (?, ?, ?, ?, ?)')
      .run('roulette', playerId, amount, `${result.color}_${result.number}`, profitLoss);

    db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
      .run(playerId, 'roulette', profitLoss, `Roulette ${profitLoss >= 0 ? 'won' : 'lost'} on ${betType}`);

    const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);

    res.json({
      success: true,
      result,
      slotIndex,
      won: multiplier > 0,
      payout,
      profitLoss,
      player: updatedPlayer,
      provablyFair: { serverSeed, clientSeed, hash: hashSeed(serverSeed) },
    });
  });

  router.get('/roulette/state', (req, res) => {
    res.json({
      phase: rouletteState.phase,
      bets: rouletteState.bets.map(b => ({ playerId: b.playerId, botName: b.botName || null, isBot: b.isBot || false, amount: b.amount, betType: b.betType })),
      result: rouletteState.result,
    });
  });

  // ======== JACKPOT ========
  const RARITY_PRICES = {
    'Consumer Grade': 0.10,
    'Industrial Grade': 0.50,
    'Mil-Spec': 2.00,
    'Restricted': 8.00,
    'Classified': 35.00,
    'Covert': 150.00,
    'Rare Special': 500.00,
  };

  const PLAYER_COLORS = ['#80e060', '#f0c040', '#e04040', '#40c0e0', '#c060e0', '#e08040', '#60e0c0', '#e06080'];

  function getFallbackPrice(rarity) {
    return RARITY_PRICES[rarity] || 1.00;
  }

  function getSkinPrice(db, marketHashName, rarity) {
    // 1. Try price_cache first (real Steam data)
    const priceRow = db.prepare('SELECT price_usd FROM price_cache WHERE market_hash_name = ?').get(marketHashName);
    if (priceRow && priceRow.price_usd > 0) {
      return priceRow.price_usd;
    }
    // 2. Fall back to hardcoded skin price database (handles StatTrak internally)
    const hardcodedPrice = getSkinPriceFromDb(marketHashName, null, rarity);
    if (hardcodedPrice > 1.00 || !rarity) {
      return hardcodedPrice;
    }
    // 3. Ultimate fallback: rarity-based price
    return getFallbackPrice(rarity);
  }

  // Bot configuration for jackpot
  const JACKPOT_BOT_NAMES = ['Bot_Hotel', 'Bot_India', 'Bot_Juliet'];
  const JACKPOT_BOT_SKINS = [
    { skinName: 'P250 | Sand Dune', marketHashName: 'P250 | Sand Dune (Field-Tested)', rarity: 'Mil-Spec', imageUrl: '' },
    { skinName: 'Nova | Predator', marketHashName: 'Nova | Predator (Field-Tested)', rarity: 'Mil-Spec', imageUrl: '' },
    { skinName: 'MP7 | Forest DDPAT', marketHashName: 'MP7 | Forest DDPAT (Field-Tested)', rarity: 'Mil-Spec', imageUrl: '' },
    { skinName: 'SG 553 | Waves Perforated', marketHashName: 'SG 553 | Waves Perforated (Field-Tested)', rarity: 'Mil-Spec', imageUrl: '' },
    { skinName: 'MAG-7 | Sand Dune', marketHashName: 'MAG-7 | Sand Dune (Field-Tested)', rarity: 'Mil-Spec', imageUrl: '' },
    { skinName: 'FAMAS | Colony', marketHashName: 'FAMAS | Colony (Field-Tested)', rarity: 'Restricted', imageUrl: '' },
    { skinName: 'Galil AR | Sage Spray', marketHashName: 'Galil AR | Sage Spray (Field-Tested)', rarity: 'Restricted', imageUrl: '' },
    { skinName: 'PP-Bizon | Jungle Slipstream', marketHashName: 'PP-Bizon | Jungle Slipstream (Field-Tested)', rarity: 'Mil-Spec', imageUrl: '' },
  ];

  function addJackpotBot() {
    const botName = JACKPOT_BOT_NAMES[Math.floor(Math.random() * JACKPOT_BOT_NAMES.length)];
    const botId = `bot_${botName.toLowerCase()}`;
    const skinCount = 1 + Math.floor(Math.random() * 3); // 1-3 skins
    const shuffledSkins = [...JACKPOT_BOT_SKINS].sort(() => Math.random() - 0.5);

    // Assign bot a player color
    const colorIndex = Object.keys(jackpotState.players).length % PLAYER_COLORS.length;
    if (!jackpotState.players[botId]) {
      jackpotState.players[botId] = {
        name: botName,
        color: PLAYER_COLORS[colorIndex],
        totalValue: 0,
        skins: [],
        isBot: true,
      };
    }

    for (let i = 0; i < skinCount; i++) {
      const template = shuffledSkins[i % shuffledSkins.length];
      const price = Math.round((5 + Math.random() * 45) * 100) / 100; // $5-$50
      const skin = {
        inventoryId: `bot_inv_${Date.now()}_${i}`,
        skinName: template.skinName,
        marketHashName: template.marketHashName,
        imageUrl: template.imageUrl,
        rarity: template.rarity,
        price,
        playerId: botId,
        playerName: botName,
        isBot: true,
      };
      jackpotState.pot.push(skin);
      jackpotState.potValue += price;
      jackpotState.players[botId].totalValue += price;
      jackpotState.players[botId].skins.push({
        skinName: skin.skinName,
        marketHashName: skin.marketHashName,
        imageUrl: skin.imageUrl,
        rarity: skin.rarity,
        price: skin.price,
      });
    }

    io.emit('jackpot_update', getJackpotPublicState());
  }

  let jackpotState = {
    phase: 'waiting', // 'waiting', 'active', 'spinning', 'result'
    pot: [],
    potValue: 0,
    players: {},
    timer: null,
    countdown: 0,
    countdownInterval: null,
    serverSeed: null,
    clientSeed: null,
    winner: null,
    history: [],
    roundId: 0,
  };

  function resetJackpot() {
    if (jackpotState.timer) clearTimeout(jackpotState.timer);
    if (jackpotState.countdownInterval) clearInterval(jackpotState.countdownInterval);
    jackpotState.phase = 'waiting';
    jackpotState.pot = [];
    jackpotState.potValue = 0;
    jackpotState.players = {};
    jackpotState.timer = null;
    jackpotState.countdown = 0;
    jackpotState.countdownInterval = null;
    jackpotState.serverSeed = null;
    jackpotState.clientSeed = null;
    jackpotState.winner = null;
    jackpotState.roundId++;
  }

  function getJackpotPublicState() {
    const players = {};
    for (const [pid, p] of Object.entries(jackpotState.players)) {
      players[pid] = {
        name: p.name,
        color: p.color,
        totalValue: p.totalValue,
        skinCount: p.skins.length,
        skins: p.skins,
      };
    }
    return {
      phase: jackpotState.phase,
      potValue: jackpotState.potValue,
      pot: jackpotState.pot.map(s => ({
        skinName: s.skinName,
        marketHashName: s.marketHashName,
        imageUrl: s.imageUrl,
        rarity: s.rarity,
        price: s.price,
        playerId: s.playerId,
        playerName: s.playerName,
      })),
      players,
      countdown: jackpotState.countdown,
      winner: jackpotState.winner,
      history: jackpotState.history.slice(0, 10),
      serverSeedHash: jackpotState.serverSeed ? hashSeed(jackpotState.serverSeed) : null,
    };
  }

  function resolveJackpot() {
    const db = getDb();
    jackpotState.phase = 'spinning';
    io.emit('jackpot_spin', { potValue: jackpotState.potValue, players: getJackpotPublicState().players });

    // Provably fair winner selection
    const serverSeed = jackpotState.serverSeed;
    const clientSeed = jackpotState.clientSeed;
    const roll = fairRandom(serverSeed, clientSeed, 0); // [0, 1)
    const totalValue = jackpotState.potValue;
    const target = roll * totalValue;

    // Walk through players in deposit order, pick winner
    let cumulative = 0;
    let winnerId = null;
    for (const skin of jackpotState.pot) {
      cumulative += skin.price;
      if (cumulative > target && !winnerId) {
        winnerId = skin.playerId;
      }
    }
    // Fallback: last depositor
    if (!winnerId && jackpotState.pot.length > 0) {
      winnerId = jackpotState.pot[jackpotState.pot.length - 1].playerId;
    }

    const winnerInfo = jackpotState.players[winnerId];
    const winnerChance = winnerInfo ? ((winnerInfo.totalValue / totalValue) * 100).toFixed(1) : '0';

    // Calculate 5% house fee — remove cheapest skins
    const feeTarget = totalValue * 0.05;
    const sortedPot = [...jackpotState.pot].sort((a, b) => a.price - b.price);
    let feeCollected = 0;
    const feeSkins = [];
    const winningSkins = [];

    for (const skin of sortedPot) {
      if (feeCollected < feeTarget) {
        feeCollected += skin.price;
        feeSkins.push(skin);
      } else {
        winningSkins.push(skin);
      }
    }

    // If all skins went to fee (very small pot), winner gets nothing extra
    // Transfer winning skins to winner's inventory
    const transferStmt = db.prepare('UPDATE inventory SET player_id = ? WHERE id = ?');
    const deleteStmt = db.prepare('DELETE FROM inventory WHERE id = ?');

    // Only transfer real skins (not bot skins)
    const realWinningSkins = winningSkins.filter(s => !s.isBot);
    const realFeeSkins = feeSkins.filter(s => !s.isBot);
    const winnerIsBot = String(winnerId).startsWith('bot_');

    const transferMany = db.transaction(() => {
      if (!winnerIsBot) {
        for (const skin of realWinningSkins) {
          transferStmt.run(winnerId, skin.inventoryId);
        }
      }
      // Delete fee skins (house takes them) - only real skins
      for (const skin of realFeeSkins) {
        deleteStmt.run(skin.inventoryId);
      }
      // If a bot won, return real skins that aren't fee skins back...
      // Actually just delete the non-fee real skins too (house absorbs on bot win)
      if (winnerIsBot) {
        for (const skin of realWinningSkins) {
          deleteStmt.run(skin.inventoryId);
        }
      }
    });
    transferMany();

    // Record in game_history for each real participant only
    for (const [pid, pdata] of Object.entries(jackpotState.players)) {
      if (pdata.isBot) continue; // Skip bot players for DB records

      const isWinner = String(pid) === String(winnerId);
      const profitLoss = isWinner
        ? (winningSkins.reduce((s, sk) => s + sk.price, 0) - pdata.totalValue)
        : -pdata.totalValue;

      db.prepare('INSERT INTO game_history (game_type, player_id, wager, result, profit_loss) VALUES (?, ?, ?, ?, ?)')
        .run('jackpot', pid, pdata.totalValue, isWinner ? 'win' : 'loss', profitLoss);

      db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
        .run(pid, 'jackpot', profitLoss, isWinner
          ? `Jackpot won! ${winningSkins.length} skins (+$${profitLoss.toFixed(2)})`
          : `Jackpot lost $${pdata.totalValue.toFixed(2)}`);
    }

    jackpotState.winner = {
      playerId: winnerId,
      playerName: winnerInfo ? winnerInfo.name : 'Unknown',
      playerColor: winnerInfo ? winnerInfo.color : '#fff',
      totalWon: winningSkins.reduce((s, sk) => s + sk.price, 0),
      skinCount: winningSkins.length,
      chance: winnerChance,
    };
    jackpotState.phase = 'result';

    // Save to history
    jackpotState.history.unshift({
      winner: jackpotState.winner,
      potValue: totalValue,
      playerCount: Object.keys(jackpotState.players).length,
      skinCount: jackpotState.pot.length,
      provablyFair: { serverSeed, clientSeed, hash: hashSeed(serverSeed) },
    });
    if (jackpotState.history.length > 20) jackpotState.history = jackpotState.history.slice(0, 20);

    // Broadcast result after 3s spin animation delay
    setTimeout(() => {
      io.emit('jackpot_result', {
        winner: jackpotState.winner,
        potValue: totalValue,
        provablyFair: { serverSeed, clientSeed, hash: hashSeed(serverSeed) },
        players: getJackpotPublicState().players,
      });

      // Reset after 6 seconds to show result
      setTimeout(() => {
        resetJackpot();
        io.emit('jackpot_update', getJackpotPublicState());
      }, 6000);
    }, 3000);
  }

  router.post('/jackpot/deposit', (req, res) => {
    const db = getDb();
    const { playerId, inventoryIds } = req.body;

    if (!playerId || !inventoryIds || !Array.isArray(inventoryIds) || inventoryIds.length === 0) {
      return res.status(400).json({ error: 'Invalid deposit: provide playerId and inventoryIds array' });
    }

    if (jackpotState.phase === 'spinning' || jackpotState.phase === 'result') {
      return res.status(400).json({ error: 'Round is finishing, please wait' });
    }

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    // Validate and collect skins
    const skins = [];
    for (const invId of inventoryIds) {
      const item = db.prepare('SELECT * FROM inventory WHERE id = ? AND player_id = ?').get(invId, playerId);
      if (!item) {
        return res.status(400).json({ error: `Skin #${invId} not found in your inventory` });
      }
      // Check not already in pot
      if (jackpotState.pot.find(p => p.inventoryId === invId)) {
        return res.status(400).json({ error: `Skin #${invId} is already in the pot` });
      }
      const price = getSkinPrice(db, item.market_hash_name, item.rarity);
      skins.push({
        inventoryId: item.id,
        skinName: item.skin_name,
        marketHashName: item.market_hash_name,
        imageUrl: item.image_url,
        rarity: item.rarity,
        price: price,
        playerId: playerId,
        playerName: player.name,
      });
    }

    if (skins.length === 0) {
      return res.status(400).json({ error: 'No valid skins to deposit' });
    }

    // Assign player color if new
    if (!jackpotState.players[playerId]) {
      const colorIndex = Object.keys(jackpotState.players).length % PLAYER_COLORS.length;
      jackpotState.players[playerId] = {
        name: player.name,
        color: player.color || PLAYER_COLORS[colorIndex],
        totalValue: 0,
        skins: [],
      };
    }

    // Add skins to pot
    for (const skin of skins) {
      jackpotState.pot.push(skin);
      jackpotState.potValue += skin.price;
      jackpotState.players[playerId].totalValue += skin.price;
      jackpotState.players[playerId].skins.push({
        skinName: skin.skinName,
        marketHashName: skin.marketHashName,
        imageUrl: skin.imageUrl,
        rarity: skin.rarity,
        price: skin.price,
      });
    }

    // If first deposit, start the round timer
    if (jackpotState.phase === 'waiting') {
      jackpotState.phase = 'active';
      jackpotState.serverSeed = generateServerSeed();
      jackpotState.clientSeed = generateClientSeed();
      jackpotState.countdown = 30;

      // Countdown interval
      jackpotState.countdownInterval = setInterval(() => {
        jackpotState.countdown--;
        if (jackpotState.countdown <= 0) {
          clearInterval(jackpotState.countdownInterval);
          jackpotState.countdownInterval = null;
        }
        io.emit('jackpot_update', getJackpotPublicState());
      }, 1000);

      // After 15 seconds, if only 1 real player, add a bot
      setTimeout(() => {
        if (jackpotState.phase === 'active') {
          const realPlayers = Object.keys(jackpotState.players).filter(pid => !jackpotState.players[pid].isBot);
          if (realPlayers.length <= 1) {
            addJackpotBot();
          }
        }
      }, 15000);

      // Main timer to resolve
      jackpotState.timer = setTimeout(() => {
        if (jackpotState.countdownInterval) {
          clearInterval(jackpotState.countdownInterval);
          jackpotState.countdownInterval = null;
        }
        // Need at least 2 players or 2 skins
        if (Object.keys(jackpotState.players).length < 1 || jackpotState.pot.length < 1) {
          // Refund: return skins (no-op since we didn't remove them from inventory)
          resetJackpot();
          io.emit('jackpot_update', getJackpotPublicState());
          return;
        }
        resolveJackpot();
      }, 30000);
    }

    // Broadcast update
    io.emit('jackpot_update', getJackpotPublicState());

    res.json({
      success: true,
      deposited: skins.length,
      totalValue: skins.reduce((s, sk) => s + sk.price, 0),
      potValue: jackpotState.potValue,
    });
  });

  router.get('/jackpot/state', (req, res) => {
    res.json(getJackpotPublicState());
  });

  // ======== GAME HISTORY ========
  router.get('/history/:playerId', (req, res) => {
    const db = getDb();
    const history = db.prepare('SELECT * FROM game_history WHERE player_id = ? ORDER BY timestamp DESC LIMIT 50').all(req.params.playerId);
    res.json(history);
  });

  return router;
};
