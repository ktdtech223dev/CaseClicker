const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

// GET /api/wall - get all wall posts (most recent first)
router.get('/', (req, res) => {
  const db = getDb();
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const offset = parseInt(req.query.offset) || 0;

  const posts = db.prepare(`
    SELECT w.*, p.name as player_name, p.color as player_color, p.ngames_id
    FROM wall_posts w
    LEFT JOIN players p ON w.player_id = p.id
    ORDER BY w.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  res.json(posts);
});

// POST /api/wall - create a wall post
router.post('/', (req, res) => {
  const db = getDb();
  const { playerId, message, type, skinData } = req.body;

  if (!playerId || !message) {
    return res.status(400).json({ error: 'playerId and message required' });
  }

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const result = db.prepare(`
    INSERT INTO wall_posts (player_id, message, type, skin_name, skin_rarity, skin_wear, skin_price, skin_image_id, case_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    playerId,
    message,
    type || 'general',
    skinData?.name || null,
    skinData?.rarity || null,
    skinData?.wear || null,
    skinData?.price || null,
    skinData?.image_id || null,
    skinData?.case_name || null
  );

  const post = db.prepare(`
    SELECT w.*, p.name as player_name, p.color as player_color
    FROM wall_posts w
    LEFT JOIN players p ON w.player_id = p.id
    WHERE w.id = ?
  `).get(result.lastInsertRowid);

  res.json(post);
});

// GET /api/wall/player/:playerId - get posts by a specific player
router.get('/player/:playerId', (req, res) => {
  const db = getDb();
  const limit = Math.min(parseInt(req.query.limit) || 30, 100);

  const posts = db.prepare(`
    SELECT w.*, p.name as player_name, p.color as player_color
    FROM wall_posts w
    LEFT JOIN players p ON w.player_id = p.id
    WHERE w.player_id = ?
    ORDER BY w.created_at DESC
    LIMIT ?
  `).all(req.params.playerId, limit);

  res.json(posts);
});

// GET /api/wall/type/:type - filter by type (unbox, knife, coinflip, crash, roulette)
router.get('/type/:type', (req, res) => {
  const db = getDb();
  const limit = Math.min(parseInt(req.query.limit) || 30, 100);

  const posts = db.prepare(`
    SELECT w.*, p.name as player_name, p.color as player_color
    FROM wall_posts w
    LEFT JOIN players p ON w.player_id = p.id
    WHERE w.type = ?
    ORDER BY w.created_at DESC
    LIMIT ?
  `).all(req.params.type, limit);

  res.json(posts);
});

module.exports = router;
