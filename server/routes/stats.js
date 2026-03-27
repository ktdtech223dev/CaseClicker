const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

// GET /api/stats/:playerId
router.get('/:playerId', (req, res) => {
  const db = getDb();
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const inventoryCount = db.prepare('SELECT COUNT(*) as c FROM inventory WHERE player_id = ?').get(req.params.playerId).c;
  const inventoryValue = db.prepare('SELECT SUM(COALESCE((SELECT price_usd FROM price_cache WHERE price_cache.market_hash_name = inventory.market_hash_name), 0.10)) as total FROM inventory WHERE player_id = ?').get(req.params.playerId).total || 0;

  const gameStats = db.prepare(`
    SELECT game_type, COUNT(*) as games, SUM(CASE WHEN profit_loss > 0 THEN 1 ELSE 0 END) as wins,
    SUM(profit_loss) as total_profit
    FROM game_history WHERE player_id = ? GROUP BY game_type
  `).all(req.params.playerId);

  const bestDrop = db.prepare(`
    SELECT i.*, COALESCE(p.price_usd, 0.10) as price
    FROM inventory i LEFT JOIN price_cache p ON i.market_hash_name = p.market_hash_name
    WHERE i.player_id = ? ORDER BY COALESCE(p.price_usd, 0.10) DESC LIMIT 1
  `).get(req.params.playerId);

  const recentTransactions = db.prepare('SELECT * FROM transactions WHERE player_id = ? ORDER BY timestamp DESC LIMIT 20').all(req.params.playerId);

  res.json({
    player,
    inventoryCount,
    inventoryValue: Math.round(inventoryValue * 100) / 100,
    gameStats,
    bestDrop,
    recentTransactions,
  });
});

// GET /api/stats/leaderboard/all
router.get('/leaderboard/all', (req, res) => {
  const db = getDb();
  const players = db.prepare('SELECT * FROM players ORDER BY id').all();

  const leaderboard = players.map(p => {
    const inventoryValue = db.prepare('SELECT SUM(COALESCE((SELECT price_usd FROM price_cache WHERE price_cache.market_hash_name = inventory.market_hash_name), 0.10)) as total FROM inventory WHERE player_id = ?').get(p.id).total || 0;
    return {
      ...p,
      inventory_value: Math.round(inventoryValue * 100) / 100,
      net_worth: Math.round((p.wallet + inventoryValue) * 100) / 100,
    };
  });

  res.json(leaderboard);
});

// GET /api/stats/leaderboard/richest - Players sorted by net worth (wallet + inventory)
router.get('/leaderboard/richest', (req, res) => {
  const db = getDb();
  const players = db.prepare('SELECT * FROM players ORDER BY id').all();

  const leaderboard = players.map(p => {
    const inventoryValue = db.prepare('SELECT SUM(COALESCE((SELECT price_usd FROM price_cache WHERE price_cache.market_hash_name = inventory.market_hash_name), 0.10)) as total FROM inventory WHERE player_id = ?').get(p.id).total || 0;
    const netWorth = Math.round((p.wallet + inventoryValue) * 100) / 100;
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      stat: netWorth,
      wallet: Math.round(p.wallet * 100) / 100,
      inventory_value: Math.round(inventoryValue * 100) / 100,
    };
  });

  leaderboard.sort((a, b) => b.stat - a.stat);
  leaderboard.forEach((p, i) => { p.rank = i + 1; });

  res.json(leaderboard);
});

// GET /api/stats/leaderboard/cases - Players sorted by total_cases_opened
router.get('/leaderboard/cases', (req, res) => {
  const db = getDb();
  const players = db.prepare('SELECT id, name, color, total_cases_opened FROM players ORDER BY total_cases_opened DESC').all();

  const leaderboard = players.map((p, i) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    stat: p.total_cases_opened || 0,
    rank: i + 1,
  }));

  res.json(leaderboard);
});

// GET /api/stats/leaderboard/gamblers - Players sorted by total gambling profit
router.get('/leaderboard/gamblers', (req, res) => {
  const db = getDb();
  const players = db.prepare('SELECT id, name, color FROM players ORDER BY id').all();

  const leaderboard = players.map(p => {
    const row = db.prepare('SELECT COALESCE(SUM(profit_loss), 0) as total_profit FROM game_history WHERE player_id = ?').get(p.id);
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      stat: Math.round((row.total_profit || 0) * 100) / 100,
    };
  });

  leaderboard.sort((a, b) => b.stat - a.stat);
  leaderboard.forEach((p, i) => { p.rank = i + 1; });

  res.json(leaderboard);
});

// GET /api/stats/leaderboard/traders - Players sorted by total trade-ups completed
router.get('/leaderboard/traders', (req, res) => {
  const db = getDb();
  const players = db.prepare('SELECT id, name, color FROM players ORDER BY id').all();

  const leaderboard = players.map(p => {
    const row = db.prepare("SELECT COUNT(*) as total_trades FROM transactions WHERE player_id = ? AND type = 'tradeup'").get(p.id);
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      stat: row.total_trades || 0,
    };
  });

  leaderboard.sort((a, b) => b.stat - a.stat);
  leaderboard.forEach((p, i) => { p.rank = i + 1; });

  res.json(leaderboard);
});

// GET /api/stats/leaderboard/inventory - Players sorted by inventory value
router.get('/leaderboard/inventory', (req, res) => {
  const db = getDb();
  const players = db.prepare('SELECT id, name, color FROM players ORDER BY id').all();

  const leaderboard = players.map(p => {
    const row = db.prepare('SELECT SUM(COALESCE((SELECT price_usd FROM price_cache WHERE price_cache.market_hash_name = inventory.market_hash_name), 0.10)) as total FROM inventory WHERE player_id = ?').get(p.id);
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      stat: Math.round((row.total || 0) * 100) / 100,
    };
  });

  leaderboard.sort((a, b) => b.stat - a.stat);
  leaderboard.forEach((p, i) => { p.rank = i + 1; });

  res.json(leaderboard);
});

// GET /api/stats/leaderboard/best-drops - Top 20 best drops across all players
router.get('/leaderboard/best-drops', (req, res) => {
  const db = getDb();

  const drops = db.prepare(`
    SELECT
      i.id,
      i.player_id,
      i.skin_name,
      i.market_hash_name,
      i.wear,
      i.float_value,
      i.stattrak,
      i.rarity,
      i.case_name,
      i.image_url,
      COALESCE(pc.price_usd, 0.10) as price,
      p.name as player_name,
      p.color as player_color
    FROM inventory i
    LEFT JOIN price_cache pc ON i.market_hash_name = pc.market_hash_name
    LEFT JOIN players p ON i.player_id = p.id
    ORDER BY COALESCE(pc.price_usd, 0.10) DESC
    LIMIT 20
  `).all();

  const result = drops.map((d, i) => ({
    rank: i + 1,
    player_id: d.player_id,
    player_name: d.player_name,
    player_color: d.player_color,
    skin_name: d.skin_name,
    market_hash_name: d.market_hash_name,
    wear: d.wear,
    float_value: d.float_value,
    stattrak: d.stattrak,
    rarity: d.rarity,
    case_name: d.case_name,
    image_url: d.image_url,
    stat: Math.round(d.price * 100) / 100,
  }));

  res.json(result);
});

module.exports = router;
