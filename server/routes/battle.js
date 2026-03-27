const express = require('express');
const { getDb, addToWallet, deductFromWallet } = require('../db/database');
const { getCaseById } = require('../services/skinData');
const { getSkinPrice } = require('../data/skinPrices');
const { generateServerSeed, generateClientSeed, fairRandom, pickRarity, getWear, generateFloat, rollStatTrak, hashSeed } = require('../services/rng');

module.exports = function(io) {
  const router = express.Router();

  // In-memory battle store
  const battles = new Map();
  let battleIdCounter = Date.now();

  function generateBattleId() {
    return `battle_${++battleIdCounter}`;
  }

  // Open a single case using the RNG system — returns the skin result
  function openCaseForBattle(caseData, seedOffset) {
    const serverSeed = generateServerSeed();
    const clientSeed = generateClientSeed();

    const skinRarities = [...new Set(caseData.skins.map(s => s.rarity))];
    const availableRarities = [...skinRarities];
    if (caseData.rare_special && caseData.rare_special.length > 0) {
      availableRarities.push('Rare Special');
    }

    const rarityRoll = fairRandom(serverSeed, clientSeed, seedOffset);
    const rarity = pickRarity(rarityRoll, availableRarities);

    let skinPool;
    if (rarity === 'Rare Special') {
      skinPool = caseData.rare_special;
    } else {
      skinPool = caseData.skins.filter(s => s.rarity === rarity);
      if (skinPool.length === 0) skinPool = caseData.skins;
    }

    const skinRoll = fairRandom(serverSeed, clientSeed, seedOffset + 1);
    const selectedSkin = skinPool[Math.floor(skinRoll * skinPool.length)];

    const floatRoll = fairRandom(serverSeed, clientSeed, seedOffset + 2);
    const floatValue = generateFloat(selectedSkin.min_float, selectedSkin.max_float, floatRoll);
    const wear = getWear(floatValue);

    const stattrakRoll = fairRandom(serverSeed, clientSeed, seedOffset + 3);
    const isStatTrak = rollStatTrak(stattrakRoll);

    const stPrefix = isStatTrak ? 'StatTrak\u2122 ' : '';
    const marketHashName = `${stPrefix}${selectedSkin.name} (${wear})`;

    // Get price
    const db = getDb();
    const cached = db.prepare('SELECT price_usd FROM price_cache WHERE market_hash_name = ?').get(marketHashName);
    let price;
    if (cached && cached.price_usd > 0) {
      price = cached.price_usd;
    } else {
      price = getSkinPrice(marketHashName, wear, selectedSkin.rarity);
    }
    if (isNaN(price) || price <= 0) price = 1;

    return {
      name: selectedSkin.name,
      market_hash_name: marketHashName,
      rarity: selectedSkin.rarity,
      wear,
      float_value: floatValue,
      stattrak: isStatTrak,
      image_id: selectedSkin.image_id,
      price: Math.round(price * 100) / 100,
      case_name: caseData.name,
      provablyFair: { serverSeed, clientSeed, hash: hashSeed(serverSeed) },
    };
  }

  // POST /api/battle/create — Create a new battle
  router.post('/create', (req, res) => {
    const db = getDb();
    const { playerId, caseId, wager, rounds } = req.body;

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const caseData = getCaseById(caseId);
    if (!caseData) return res.status(404).json({ error: 'Case not found' });

    const roundCount = Math.min(Math.max(parseInt(rounds) || 5, 1), 10);
    const caseCost = (caseData.price + 2.49) * roundCount;
    const totalCost = caseCost + (parseFloat(wager) || 0);

    if (player.wallet < totalCost) {
      return res.status(400).json({ error: 'Insufficient funds', required: totalCost, wallet: player.wallet });
    }

    // Deduct cost from player
    deductFromWallet(playerId, totalCost);

    const battleId = generateBattleId();
    const battle = {
      id: battleId,
      caseId,
      caseName: caseData.name,
      wager: parseFloat(wager) || 0,
      rounds: roundCount,
      currentRound: 0,
      status: 'waiting', // waiting, active, complete
      player1: {
        id: playerId,
        name: player.name,
        color: player.color,
        skins: [],
        totalValue: 0,
      },
      player2: null,
      winner: null,
      createdAt: Date.now(),
    };

    battles.set(battleId, battle);

    const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);

    io.emit('battle_update', { battleId, battle });

    res.json({ battleId, battle, player: updatedPlayer });
  });

  // POST /api/battle/join — Join battle (bot or opponent)
  router.post('/join', (req, res) => {
    const db = getDb();
    const { battleId, playerId } = req.body;

    const battle = battles.get(battleId);
    if (!battle) return res.status(404).json({ error: 'Battle not found' });
    if (battle.status !== 'waiting') return res.status(400).json({ error: 'Battle already started' });

    const caseData = getCaseById(battle.caseId);
    if (!caseData) return res.status(404).json({ error: 'Case not found' });

    // Bot opponent
    if (!playerId || playerId === 'bot') {
      battle.player2 = {
        id: 'bot',
        name: 'Bot',
        color: '#ff4444',
        skins: [],
        totalValue: 0,
        isBot: true,
      };
    } else {
      const player2 = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
      if (!player2) return res.status(404).json({ error: 'Player not found' });

      const caseCost = (caseData.price + 2.49) * battle.rounds;
      const totalCost = caseCost + battle.wager;
      if (player2.wallet < totalCost) {
        return res.status(400).json({ error: 'Opponent has insufficient funds' });
      }

      deductFromWallet(player2.id, totalCost);

      battle.player2 = {
        id: player2.id,
        name: player2.name,
        color: player2.color,
        skins: [],
        totalValue: 0,
      };
    }

    battle.status = 'active';
    battles.set(battleId, battle);

    io.emit('battle_update', { battleId, battle });

    res.json({ battleId, battle });
  });

  // GET /api/battle/state/:battleId — Get current battle state
  router.get('/state/:battleId', (req, res) => {
    const battle = battles.get(req.params.battleId);
    if (!battle) return res.status(404).json({ error: 'Battle not found' });
    res.json({ battleId: req.params.battleId, battle });
  });

  // POST /api/battle/open/:battleId — Open next case in battle
  router.post('/open/:battleId', (req, res) => {
    const db = getDb();
    const battle = battles.get(req.params.battleId);
    if (!battle) return res.status(404).json({ error: 'Battle not found' });
    if (battle.status !== 'active') return res.status(400).json({ error: 'Battle not active' });
    if (battle.currentRound >= battle.rounds) return res.status(400).json({ error: 'All rounds completed' });

    const caseData = getCaseById(battle.caseId);
    if (!caseData) return res.status(404).json({ error: 'Case not found' });

    // Open case for both sides
    const p1Skin = openCaseForBattle(caseData, battle.currentRound * 10);
    const p2Skin = openCaseForBattle(caseData, battle.currentRound * 10 + 5);

    battle.player1.skins.push(p1Skin);
    battle.player1.totalValue = Math.round((battle.player1.totalValue + p1Skin.price) * 100) / 100;

    battle.player2.skins.push(p2Skin);
    battle.player2.totalValue = Math.round((battle.player2.totalValue + p2Skin.price) * 100) / 100;

    battle.currentRound++;

    io.emit('battle_reveal', {
      battleId: req.params.battleId,
      round: battle.currentRound,
      player1Skin: p1Skin,
      player2Skin: p2Skin,
    });

    // Check if battle is complete
    if (battle.currentRound >= battle.rounds) {
      battle.status = 'complete';

      // Determine winner by total skin value
      const p1Total = battle.player1.totalValue;
      const p2Total = battle.player2.totalValue;
      const winnerId = p1Total >= p2Total ? battle.player1.id : battle.player2.id;
      const loserId = p1Total >= p2Total ? battle.player2.id : battle.player1.id;
      battle.winner = winnerId;

      const allSkins = [...battle.player1.skins, ...battle.player2.skins];
      const totalSkinValue = Math.round((p1Total + p2Total) * 100) / 100;

      // Give all skins to winner (save to inventory)
      if (winnerId !== 'bot') {
        for (const skin of allSkins) {
          db.prepare(
            'INSERT INTO inventory (player_id, skin_name, market_hash_name, wear, float_value, stattrak, image_url, rarity, case_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).run(winnerId, skin.name, skin.market_hash_name, skin.wear, skin.float_value, skin.stattrak ? 1 : 0, skin.image_id, skin.rarity, skin.case_name);
        }

        // Return wager to winner doubled
        if (battle.wager > 0) {
          addToWallet(winnerId, battle.wager * 2);
        }
      }

      // Record game history
      if (battle.player1.id !== 'bot') {
        const p1Won = winnerId === battle.player1.id;
        const p1Profit = p1Won ? (totalSkinValue - p1Total + battle.wager) : -(p1Total + battle.wager);
        db.prepare('INSERT INTO game_history (game_type, player_id, wager, result, profit_loss) VALUES (?, ?, ?, ?, ?)')
          .run('battle', battle.player1.id, battle.wager, p1Won ? 'win' : 'loss', p1Profit);
        db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
          .run(battle.player1.id, 'battle', p1Profit, `Battle ${p1Won ? 'won' : 'lost'} — ${battle.rounds} rounds`);
      }

      if (battle.player2.id !== 'bot') {
        const p2Won = winnerId === battle.player2.id;
        const p2Profit = p2Won ? (totalSkinValue - p2Total + battle.wager) : -(p2Total + battle.wager);
        db.prepare('INSERT INTO game_history (game_type, player_id, wager, result, profit_loss) VALUES (?, ?, ?, ?, ?)')
          .run('battle', battle.player2.id, battle.wager, p2Won ? 'win' : 'loss', p2Profit);
        db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
          .run(battle.player2.id, 'battle', p2Profit, `Battle ${p2Won ? 'won' : 'lost'} — ${battle.rounds} rounds`);
      }

      // Wall post
      const winnerName = winnerId === battle.player1.id ? battle.player1.name : battle.player2.name;
      if (winnerId !== 'bot') {
        const player = db.prepare('SELECT * FROM players WHERE id = ?').get(winnerId);
        if (player) {
          db.prepare(`
            INSERT INTO wall_posts (player_id, message, type)
            VALUES (?, ?, ?)
          `).run(winnerId, `${winnerName} won a Case Battle! ${battle.rounds} rounds, total value $${totalSkinValue.toFixed(2)}`, 'battle');
        }
      }

      io.emit('battle_complete', {
        battleId: req.params.battleId,
        winner: winnerId,
        winnerName,
        player1Total: p1Total,
        player2Total: p2Total,
        totalSkinValue,
      });

      // NGame session submit for human players
      // (handled client-side)
    }

    battles.set(req.params.battleId, battle);

    // Get updated players
    const p1Updated = battle.player1.id !== 'bot'
      ? db.prepare('SELECT * FROM players WHERE id = ?').get(battle.player1.id)
      : null;
    const p2Updated = battle.player2.id !== 'bot'
      ? db.prepare('SELECT * FROM players WHERE id = ?').get(battle.player2.id)
      : null;

    res.json({
      battleId: req.params.battleId,
      battle,
      round: battle.currentRound,
      player1Skin: p1Skin,
      player2Skin: p2Skin,
      player: p1Updated,
    });
  });

  // GET /api/battle/history/:playerId — Get battle history for a player
  router.get('/history/:playerId', (req, res) => {
    const db = getDb();
    const history = db.prepare(
      "SELECT * FROM game_history WHERE player_id = ? AND game_type = 'battle' ORDER BY id DESC LIMIT 20"
    ).all(req.params.playerId);
    res.json(history);
  });

  return router;
};
