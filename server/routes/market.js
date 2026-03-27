const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { getSkinPrice } = require('../data/skinPrices');

const MARKET_FEE = 0.07; // 7% fee

// POST /api/market/sell - sell a skin
router.post('/sell', (req, res) => {
  const db = getDb();
  const { inventoryId, playerId } = req.body;

  const item = db.prepare('SELECT * FROM inventory WHERE id = ? AND player_id = ?').get(inventoryId, playerId);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  if (item.locked) return res.status(400).json({ error: 'Item is locked. Unlock it before selling.' });

  let price = 0;
  const hashName = item.market_hash_name || '';
  const isSticker = /^sticker\s*\|/i.test(hashName);
  const isGlove = /gloves|wraps/i.test(hashName);

  // Skip price_cache for stickers/gloves — bulk APIs return bad prices
  if (!isSticker && !isGlove) {
    const cached = db.prepare('SELECT price_usd FROM price_cache WHERE market_hash_name = ?').get(hashName);
    if (cached && cached.price_usd > 0) {
      price = cached.price_usd;
    }
    if (price <= 0) {
      const noWear = hashName.replace(/\s*\((?:Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)\s*$/i, '');
      if (noWear !== hashName) {
        const cached2 = db.prepare('SELECT price_usd FROM price_cache WHERE market_hash_name = ?').get(noWear);
        if (cached2 && cached2.price_usd > 0) price = cached2.price_usd;
      }
    }
  }
  // Fallback to hardcoded database (always used for stickers)
  if (price <= 0) {
    price = getSkinPrice(hashName, item.wear, item.rarity);
  }
  if (isNaN(price) || price <= 0) price = 1;

  const sellPrice = Math.round(price * (1 - MARKET_FEE) * 100) / 100;

  // Get current wallet, add in JS, write absolute value
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
  const currentWallet = Number(player.wallet) || 0;
  const currentEarned = Number(player.total_earned) || 0;

  db.prepare('DELETE FROM inventory WHERE id = ?').run(inventoryId);
  db.prepare('UPDATE players SET wallet = ?, total_earned = ? WHERE id = ?')
    .run(
      Math.round((currentWallet + sellPrice) * 100) / 100,
      Math.round((currentEarned + sellPrice) * 100) / 100,
      playerId
    );

  db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
    .run(playerId, 'sell', sellPrice, 'Sold ' + item.market_hash_name + ' for $' + sellPrice);

  const updated = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
  res.json({ player: updated, payout: sellPrice, fee: Math.round(price * MARKET_FEE * 100) / 100, price });
});

// POST /api/market/sell-bulk - sell multiple skins
router.post('/sell-bulk', (req, res) => {
  const db = getDb();
  const { inventoryIds, playerId } = req.body;
  if (!inventoryIds || !inventoryIds.length) return res.status(400).json({ error: 'No items' });

  // Get current player wallet
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  let wallet = Number(player.wallet) || 0;
  let earned = Number(player.total_earned) || 0;

  let totalPayout = 0;
  let totalFee = 0;
  const sold = [];

  for (const invId of inventoryIds) {
    const item = db.prepare('SELECT * FROM inventory WHERE id = ? AND player_id = ?').get(invId, playerId);
    if (!item) continue;
    if (item.locked) continue; // Skip locked items

    let price = 0;
    const hashName = item.market_hash_name || '';
    const cached = db.prepare('SELECT price_usd FROM price_cache WHERE market_hash_name = ?').get(hashName);
    if (cached && cached.price_usd > 0) {
      price = cached.price_usd;
    }
    if (price <= 0) {
      const noWear = hashName.replace(/\s*\(Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred\)\s*$/i, '');
      if (noWear !== hashName) {
        const cached2 = db.prepare('SELECT price_usd FROM price_cache WHERE market_hash_name = ?').get(noWear);
        if (cached2 && cached2.price_usd > 0) price = cached2.price_usd;
      }
    }
    if (price <= 0) {
      price = getSkinPrice(hashName, item.wear, item.rarity);
    }
    if (isNaN(price) || price <= 0) price = 1;

    const sellPrice = Math.round(price * (1 - MARKET_FEE) * 100) / 100;
    const itemFee = Math.round(price * MARKET_FEE * 100) / 100;

    db.prepare('DELETE FROM inventory WHERE id = ?').run(item.id);
    db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
      .run(playerId, 'sell', sellPrice, 'Sold ' + item.market_hash_name);

    totalPayout += sellPrice;
    totalFee += itemFee;
    wallet += sellPrice;
    earned += sellPrice;
    sold.push({ id: item.id, name: item.market_hash_name, payout: sellPrice });
  }

  // Single wallet update with absolute values
  db.prepare('UPDATE players SET wallet = ?, total_earned = ? WHERE id = ?')
    .run(Math.round(wallet * 100) / 100, Math.round(earned * 100) / 100, playerId);

  const updated = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
  res.json({
    player: updated,
    sold,
    totalPayout: Math.round(totalPayout * 100) / 100,
    totalFee: Math.round(totalFee * 100) / 100,
  });
});

// GET /api/market/history/:playerId
router.get('/history/:playerId', (req, res) => {
  const db = getDb();
  const history = db.prepare(
    "SELECT * FROM transactions WHERE player_id = ? AND type = 'sell' ORDER BY timestamp DESC LIMIT 50"
  ).all(req.params.playerId);
  res.json(history);
});

// GET /api/prices/:market_hash_name
router.get('/prices/:market_hash_name', (req, res) => {
  const db = getDb();
  const marketHashName = decodeURIComponent(req.params.market_hash_name);
  const cached = db.prepare('SELECT price_usd FROM price_cache WHERE market_hash_name = ?').get(marketHashName);
  let price;
  if (cached && cached.price_usd > 0) {
    price = cached.price_usd;
  } else {
    price = getSkinPrice(marketHashName);
  }
  if (isNaN(price) || price <= 0) price = 1;
  res.json({ market_hash_name: req.params.market_hash_name, price });
});

module.exports = router;
