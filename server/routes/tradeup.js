const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { getSkinPrice } = require('../data/skinPrices');
const { generateServerSeed, generateClientSeed, fairRandom, getWear } = require('../services/rng');
const { cases } = require('../services/skinData');

// CS2 Trade-Up Contract — 1:1 replica of how it works in-game
//
// Rules:
// 1. Exactly 10 skins of the SAME rarity
// 2. Output is ONE TIER UP from the input rarity
// 3. Output skin comes from the SAME COLLECTION(S) as the inputs
// 4. If inputs are from multiple collections, probability is weighted by count
//    e.g., 7 from Chroma + 3 from Clutch = 70% Chroma output, 30% Clutch
// 5. Output float = average input float, scaled to output skin's float range
// 6. ALL inputs must be StatTrak to get a StatTrak output
// 7. Stickers CANNOT be traded up (not eligible)
// 8. Covert is the highest tradeable rarity — no trading up to knives/gloves
// 9. Consumer Grade and Industrial Grade CAN be traded up

const RARITY_UPGRADE = {
  'Consumer Grade': 'Industrial Grade',
  'Industrial Grade': 'Mil-Spec',
  'Mil-Spec': 'Restricted',
  'Restricted': 'Classified',
  'Classified': 'Covert',
  'Covert': 'Rare Special',
};

// Build a lookup: skin_name -> [{ case_id, case_name, skin }]
// This tells us which collection(s) a skin belongs to
function buildSkinToCollectionMap() {
  const map = {};
  for (const c of cases) {
    // Only weapon cases and collections — not sticker capsules or souvenir packages
    if (c.type === 'sticker_capsule' || c.type === 'souvenir_package') continue;

    for (const skin of (c.skins || [])) {
      if (!map[skin.name]) map[skin.name] = [];
      map[skin.name].push({
        case_id: c.id,
        case_name: c.name,
        skin,
      });
    }
  }
  return map;
}

// Build a lookup: case_id + rarity -> [skins]
// For finding possible outputs from a specific collection at a specific rarity
function buildCollectionOutputMap() {
  const map = {};
  for (const c of cases) {
    if (c.type === 'sticker_capsule' || c.type === 'souvenir_package') continue;

    for (const skin of (c.skins || [])) {
      const key = c.id + '|' + skin.rarity;
      if (!map[key]) map[key] = [];
      map[key].push({
        ...skin,
        case_id: c.id,
        case_name: c.name,
      });
    }

    // Include knives/gloves as Rare Special outputs for this case
    for (const rare of (c.rare_special || [])) {
      if (rare.name && rare.name.includes('|')) {
        const key = c.id + '|Rare Special';
        if (!map[key]) map[key] = [];
        map[key].push({
          ...rare,
          rarity: 'Rare Special',
          case_id: c.id,
          case_name: c.name,
        });
      }
    }
  }
  return map;
}

const skinCollectionMap = buildSkinToCollectionMap();
const collectionOutputMap = buildCollectionOutputMap();

// POST /api/tradeup/execute — execute a CS2-accurate trade-up contract
router.post('/execute', (req, res) => {
  const db = getDb();
  const { playerId, inventoryIds } = req.body;

  if (!inventoryIds || inventoryIds.length !== 10) {
    return res.status(400).json({ error: 'Trade-up requires exactly 10 items' });
  }

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  // Fetch all items
  const items = inventoryIds.map(id =>
    db.prepare('SELECT * FROM inventory WHERE id = ? AND player_id = ?').get(id, playerId)
  );

  if (items.some(i => !i)) {
    return res.status(400).json({ error: 'Some items not found in your inventory' });
  }

  // Rule: No stickers
  if (items.some(i => i.skin_name && i.skin_name.startsWith('Sticker'))) {
    return res.status(400).json({ error: 'Stickers cannot be used in trade-ups' });
  }

  // Rule: All same rarity
  const rarity = items[0].rarity;
  if (!items.every(i => i.rarity === rarity)) {
    return res.status(400).json({ error: 'All items must be the same rarity' });
  }

  // Rule: Rarity must be upgradeable (no Covert->Knife, no Rare Special)
  if (!RARITY_UPGRADE[rarity]) {
    return res.status(400).json({ error: `Cannot trade up ${rarity} items` });
  }

  const nextRarity = RARITY_UPGRADE[rarity];

  // ===== STEP 1: Determine which collections the inputs come from =====
  // Each input skin maps to one or more collections
  // We track how many inputs come from each collection
  const collectionCounts = {}; // case_id -> count
  const collectionNames = {}; // case_id -> case_name

  for (const item of items) {
    const skinName = item.skin_name;
    const collections = skinCollectionMap[skinName];

    if (collections && collections.length > 0) {
      // If a skin exists in multiple cases, use the case_name stored in inventory
      let bestMatch = collections[0];
      if (item.case_name) {
        const match = collections.find(c => c.case_name === item.case_name);
        if (match) bestMatch = match;
      }
      const caseId = bestMatch.case_id;
      collectionCounts[caseId] = (collectionCounts[caseId] || 0) + 1;
      collectionNames[caseId] = bestMatch.case_name;
    }
  }

  if (Object.keys(collectionCounts).length === 0) {
    return res.status(400).json({ error: 'Could not determine collections for input items' });
  }

  // ===== STEP 2: Build weighted output pool =====
  // Each collection contributes its next-rarity skins, weighted by how many inputs came from it
  const weightedOutputPool = []; // { skin, weight, case_id, case_name }

  for (const [caseId, count] of Object.entries(collectionCounts)) {
    const key = caseId + '|' + nextRarity;
    const outputSkins = collectionOutputMap[key] || [];

    if (outputSkins.length > 0) {
      // Each skin from this collection gets weight = count / outputSkins.length
      // This means: 7 inputs from Chroma with 2 Covert skins = each Covert gets 3.5 weight
      const weightPerSkin = count / outputSkins.length;
      for (const skin of outputSkins) {
        weightedOutputPool.push({
          skin,
          weight: weightPerSkin,
          case_id: caseId,
          case_name: collectionNames[caseId],
        });
      }
    }
  }

  if (weightedOutputPool.length === 0) {
    return res.status(400).json({ error: 'No possible trade-up outputs found for these collections at ' + nextRarity + ' rarity' });
  }

  // ===== STEP 3: Roll for output skin (weighted random) =====
  const serverSeed = generateServerSeed();
  const clientSeed = generateClientSeed();
  const totalWeight = weightedOutputPool.reduce((sum, e) => sum + e.weight, 0);
  const roll = fairRandom(serverSeed, clientSeed, 0) * totalWeight;

  let cumWeight = 0;
  let selected = weightedOutputPool[0];
  for (const entry of weightedOutputPool) {
    cumWeight += entry.weight;
    if (roll < cumWeight) {
      selected = entry;
      break;
    }
  }

  // ===== STEP 4: Calculate output float (CS2 formula) =====
  // Output float = average input float, mapped to the output skin's float range
  // Formula: outFloat = outMinFloat + avgInputFloat * (outMaxFloat - outMinFloat)
  const avgFloat = items.reduce((sum, i) => sum + (i.float_value || 0), 0) / items.length;
  const minF = selected.skin.min_float || 0;
  const maxF = selected.skin.max_float || 1;

  // Add tiny random variance (±0.01) like CS2 does
  const floatVariance = (fairRandom(serverSeed, clientSeed, 1) - 0.5) * 0.02;
  const rawFloat = minF + avgFloat * (maxF - minF) + floatVariance;
  const outputFloat = Math.min(maxF, Math.max(minF, Math.round(rawFloat * 100000000) / 100000000));
  const wear = getWear(outputFloat);

  // ===== STEP 5: StatTrak check =====
  // ALL 10 inputs must be StatTrak to get a StatTrak output
  const allStatTrak = items.every(i => i.stattrak === 1);
  const isStatTrak = allStatTrak;

  const stPrefix = isStatTrak ? 'StatTrak\u2122 ' : '';
  const marketHashName = stPrefix + selected.skin.name + ' (' + wear + ')';

  // Get price
  const price = getSkinPrice(marketHashName, wear, nextRarity);

  // ===== STEP 6: Execute the trade =====
  // Remove all 10 input items
  for (const id of inventoryIds) {
    db.prepare('DELETE FROM inventory WHERE id = ?').run(id);
  }

  // Add output item
  const result = db.prepare(
    'INSERT INTO inventory (player_id, skin_name, market_hash_name, wear, float_value, stattrak, image_url, rarity, case_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    playerId, selected.skin.name, marketHashName, wear, outputFloat,
    isStatTrak ? 1 : 0, selected.skin.image_id || '', nextRarity, selected.case_name
  );

  // Log transaction
  db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
    .run(playerId, 'tradeup', 0, 'Trade-up: 10x ' + rarity + ' \u2192 ' + marketHashName);

  // Build outcome probabilities for the response (so UI can show %)
  const outcomeProbs = weightedOutputPool.map(e => ({
    name: e.skin.name,
    case_name: e.case_name,
    chance: Math.round((e.weight / totalWeight) * 10000) / 100,
  }));

  res.json({
    input: {
      count: 10,
      rarity,
      avgFloat: Math.round(avgFloat * 100000000) / 100000000,
      collections: Object.entries(collectionCounts).map(([cid, cnt]) => ({
        case_name: collectionNames[cid],
        count: cnt,
        percentage: Math.round((cnt / 10) * 100),
      })),
    },
    output: {
      id: result.lastInsertRowid,
      name: selected.skin.name,
      market_hash_name: marketHashName,
      rarity: nextRarity,
      wear,
      float_value: outputFloat,
      stattrak: isStatTrak,
      image_id: selected.skin.image_id || '',
      case_name: selected.case_name,
      price: (isNaN(price) || price <= 0) ? 1 : price,
    },
    outcomePool: outcomeProbs,
    provablyFair: { serverSeed, clientSeed },
  });
});

// GET /api/tradeup/eligible/:playerId — items eligible for trade-up, grouped by rarity
router.get('/eligible/:playerId', (req, res) => {
  const db = getDb();
  // Exclude stickers, Rare Special, and locked items
  const items = db.prepare(
    "SELECT * FROM inventory WHERE player_id = ? AND rarity != 'Rare Special' AND skin_name NOT LIKE 'Sticker%' AND (locked IS NULL OR locked = 0) ORDER BY rarity, skin_name"
  ).all(req.params.playerId);

  // Group by rarity
  const grouped = {};
  for (const item of items) {
    if (!RARITY_UPGRADE[item.rarity]) continue; // skip non-upgradeable rarities
    if (!grouped[item.rarity]) grouped[item.rarity] = [];
    grouped[item.rarity].push(item);
  }

  res.json(grouped);
});

// GET /api/tradeup/preview — preview possible outcomes for given items
router.get('/preview', (req, res) => {
  const { skinNames, rarity } = req.query;
  if (!skinNames || !rarity) return res.status(400).json({ error: 'skinNames and rarity required' });

  const nextRarity = RARITY_UPGRADE[rarity];
  if (!nextRarity) return res.status(400).json({ error: 'Cannot trade up ' + rarity });

  const names = skinNames.split(',');
  const collectionCounts = {};
  const collectionNames = {};

  for (const name of names) {
    const collections = skinCollectionMap[name.trim()];
    if (collections && collections.length > 0) {
      const caseId = collections[0].case_id;
      collectionCounts[caseId] = (collectionCounts[caseId] || 0) + 1;
      collectionNames[caseId] = collections[0].case_name;
    }
  }

  const pool = [];
  const totalInputs = names.length;

  for (const [caseId, count] of Object.entries(collectionCounts)) {
    const key = caseId + '|' + nextRarity;
    const outputSkins = collectionOutputMap[key] || [];
    const weightPerSkin = count / (outputSkins.length || 1);
    for (const skin of outputSkins) {
      pool.push({
        name: skin.name,
        case_name: collectionNames[caseId],
        rarity: nextRarity,
        weight: weightPerSkin,
      });
    }
  }

  const totalWeight = pool.reduce((sum, e) => sum + e.weight, 0);
  const outcomes = pool.map(e => ({
    name: e.name,
    case_name: e.case_name,
    chance: totalWeight > 0 ? Math.round((e.weight / totalWeight) * 10000) / 100 : 0,
  }));

  res.json({ nextRarity, outcomes });
});

module.exports = router;
