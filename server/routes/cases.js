const express = require('express');
const router = express.Router();
const { getDb, addToWallet, deductFromWallet } = require('../db/database');
const { getCaseById, getAllCases } = require('../services/skinData');
const { getPrice, FALLBACK_PRICES, getFallbackPrice } = require('../services/priceCache');
const { generateServerSeed, generateClientSeed, fairRandom, pickRarity, getWear, generateFloat, rollStatTrak } = require('../services/rng');
const { getSkinPrice } = require('../data/skinPrices');

// GET /api/cases - list all cases
router.get('/', (req, res) => {
  res.json(getAllCases());
});

// GET /api/cases/:id - get case details with skins
router.get('/:id', (req, res) => {
  const caseData = getCaseById(req.params.id);
  if (!caseData) return res.status(404).json({ error: 'Case not found' });
  res.json(caseData);
});

// POST /api/cases/open - open a case
router.post('/open', async (req, res) => {
  const db = getDb();
  const { playerId, caseId } = req.body;

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const caseData = getCaseById(caseId);
  if (!caseData) return res.status(404).json({ error: 'Case not found' });

  const totalCost = caseData.price + 2.49; // case + key
  if (player.wallet < totalCost) {
    return res.status(400).json({ error: 'Not enough money', required: totalCost, wallet: player.wallet });
  }

  // Deduct cost
  deductFromWallet(playerId, totalCost);
  db.prepare('UPDATE players SET total_cases_opened = total_cases_opened + 1 WHERE id = ?')
    .run(playerId);

  // Generate provably fair result
  const serverSeed = generateServerSeed();
  const clientSeed = generateClientSeed();

  // Determine available rarities in this case
  const skinRarities = [...new Set(caseData.skins.map(s => s.rarity))];
  const availableRarities = [...skinRarities];
  if (caseData.rare_special && caseData.rare_special.length > 0) {
    availableRarities.push('Rare Special');
  }

  // Roll rarity using real CS:GO odds, scoped to this case's available rarities
  const rarityRoll = fairRandom(serverSeed, clientSeed, 0);
  const rarity = pickRarity(rarityRoll, availableRarities);

  // Pick skin from appropriate pool
  let skinPool;
  if (rarity === 'Rare Special') {
    skinPool = caseData.rare_special;
  } else {
    skinPool = caseData.skins.filter(s => s.rarity === rarity);
    if (skinPool.length === 0) skinPool = caseData.skins;
  }

  const skinRoll = fairRandom(serverSeed, clientSeed, 1);
  const selectedSkin = skinPool[Math.floor(skinRoll * skinPool.length)];

  // Generate float and wear
  const floatRoll = fairRandom(serverSeed, clientSeed, 2);
  const floatValue = generateFloat(selectedSkin.min_float, selectedSkin.max_float, floatRoll);
  const wear = getWear(floatValue);

  // StatTrak roll
  const stattrakRoll = fairRandom(serverSeed, clientSeed, 3);
  const isStatTrak = rollStatTrak(stattrakRoll);

  // Build market hash name
  const stPrefix = isStatTrak ? 'StatTrak\u2122 ' : '';
  const marketHashName = `${stPrefix}${selectedSkin.name} (${wear})`;

  // Try price_cache first (real Steam data), then fall back to hardcoded database
  const cached = db.prepare('SELECT price_usd FROM price_cache WHERE market_hash_name = ?').get(marketHashName);
  let price;
  if (cached && cached.price_usd > 0) {
    price = cached.price_usd;
  } else {
    price = getSkinPrice(marketHashName, wear, selectedSkin.rarity);
  }
  if (isNaN(price) || price <= 0) price = 1;

  // Save to inventory
  const result = db.prepare(
    'INSERT INTO inventory (player_id, skin_name, market_hash_name, wear, float_value, stattrak, image_url, rarity, case_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(playerId, selectedSkin.name, marketHashName, wear, floatValue, isStatTrak ? 1 : 0, selectedSkin.image_id, selectedSkin.rarity, caseData.name);

  // Log transaction
  db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
    .run(playerId, 'case_open', -totalCost, `Opened ${caseData.name} - Got ${marketHashName}`);

  const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);

  // Build reel items (60+ items for animation)
  const reelItems = [];
  for (let i = 0; i < 70; i++) {
    const rRoll = Math.random();
    const rRarity = pickRarity(rRoll, availableRarities);
    let pool = rRarity === 'Rare Special' ? caseData.rare_special : caseData.skins.filter(s => s.rarity === rRarity);
    if (!pool || pool.length === 0) pool = caseData.skins;
    const s = pool[Math.floor(Math.random() * pool.length)];
    const fv = generateFloat(s.min_float, s.max_float, Math.random());
    reelItems.push({
      name: s.name,
      rarity: s.rarity,
      image_id: s.image_id,
      wear: getWear(fv),
    });
  }

  // Insert winning item at position 55-60
  const winPos = 55 + Math.floor(Math.random() * 5);
  reelItems[winPos] = {
    name: selectedSkin.name,
    rarity: selectedSkin.rarity,
    image_id: selectedSkin.image_id,
    wear: wear,
    isWinner: true,
  };

  res.json({
    skin: {
      id: result.lastInsertRowid,
      name: selectedSkin.name,
      market_hash_name: marketHashName,
      rarity: selectedSkin.rarity,
      wear,
      float_value: floatValue,
      stattrak: isStatTrak,
      image_id: selectedSkin.image_id,
      price,
      case_name: caseData.name,
    },
    reel: reelItems,
    winPosition: winPos,
    player: updatedPlayer,
    provablyFair: {
      serverSeed,
      clientSeed,
      serverSeedHash: require('../services/rng').hashSeed(serverSeed),
    },
  });
});

// POST /api/cases/open-multi - open multiple cases at once
router.post('/open-multi', async (req, res) => {
  const db = getDb();
  const { playerId, caseId, count } = req.body;

  const openCount = Math.min(Math.max(parseInt(count) || 1, 1), 50); // 1-50

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const caseData = getCaseById(caseId);
  if (!caseData) return res.status(404).json({ error: 'Case not found' });

  const costPerCase = caseData.price + 2.49; // case + key
  const totalCost = costPerCase * openCount;
  if (player.wallet < totalCost) {
    return res.status(400).json({ error: 'Not enough money', required: totalCost, wallet: player.wallet });
  }

  // Deduct total cost and increment cases opened by count
  deductFromWallet(playerId, totalCost);
  db.prepare('UPDATE players SET total_cases_opened = total_cases_opened + ? WHERE id = ?')
    .run(openCount, playerId);

  // Determine available rarities in this case
  const skinRarities = [...new Set(caseData.skins.map(s => s.rarity))];
  const availableRarities = [...skinRarities];
  if (caseData.rare_special && caseData.rare_special.length > 0) {
    availableRarities.push('Rare Special');
  }

  const results = [];
  for (let i = 0; i < openCount; i++) {
    const serverSeed = generateServerSeed();
    const clientSeed = generateClientSeed();

    const rarityRoll = fairRandom(serverSeed, clientSeed, 0);
    const rarity = pickRarity(rarityRoll, availableRarities);

    let skinPool;
    if (rarity === 'Rare Special') {
      skinPool = caseData.rare_special;
    } else {
      skinPool = caseData.skins.filter(s => s.rarity === rarity);
      if (skinPool.length === 0) skinPool = caseData.skins;
    }

    const skinRoll = fairRandom(serverSeed, clientSeed, 1);
    const selectedSkin = skinPool[Math.floor(skinRoll * skinPool.length)];

    const floatRoll = fairRandom(serverSeed, clientSeed, 2);
    const floatValue = generateFloat(selectedSkin.min_float, selectedSkin.max_float, floatRoll);
    const wear = getWear(floatValue);

    const stattrakRoll = fairRandom(serverSeed, clientSeed, 3);
    const isStatTrak = rollStatTrak(stattrakRoll);

    const stPrefix = isStatTrak ? 'StatTrak\u2122 ' : '';
    const marketHashName = `${stPrefix}${selectedSkin.name} (${wear})`;

    // Try price_cache first (real Steam data), then fall back to hardcoded database
    const cachedMulti = db.prepare('SELECT price_usd FROM price_cache WHERE market_hash_name = ?').get(marketHashName);
    let price;
    if (cachedMulti && cachedMulti.price_usd > 0) {
      price = cachedMulti.price_usd;
    } else {
      price = getSkinPrice(marketHashName, wear, selectedSkin.rarity);
    }

    const result = db.prepare(
      'INSERT INTO inventory (player_id, skin_name, market_hash_name, wear, float_value, stattrak, image_url, rarity, case_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(playerId, selectedSkin.name, marketHashName, wear, floatValue, isStatTrak ? 1 : 0, selectedSkin.image_id, selectedSkin.rarity, caseData.name);

    db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
      .run(playerId, 'case_open', -costPerCase, `Opened ${caseData.name} - Got ${marketHashName}`);

    results.push({
      id: result.lastInsertRowid,
      name: selectedSkin.name,
      market_hash_name: marketHashName,
      rarity: selectedSkin.rarity,
      wear,
      float_value: floatValue,
      stattrak: isStatTrak,
      image_id: selectedSkin.image_id,
      price,
      case_name: caseData.name,
    });
  }

  const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);

  res.json({
    skins: results,
    player: updatedPlayer,
  });
});

module.exports = router;
