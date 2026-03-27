const express = require('express');
const router = express.Router();
const { getDb, deductFromWallet } = require('../db/database');

const NAMETAG_COST = 1.99; // Cost to rename a skin

// POST /api/rename - rename a skin with a name tag
router.post('/', (req, res) => {
  const db = getDb();
  const { playerId, inventoryId, newName } = req.body;

  if (!newName || newName.trim().length === 0 || newName.length > 40) {
    return res.status(400).json({ error: 'Name must be 1-40 characters' });
  }

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  if (player.wallet < NAMETAG_COST) return res.status(400).json({ error: 'Not enough money for Name Tag ($1.99)' });

  const item = db.prepare('SELECT * FROM inventory WHERE id = ? AND player_id = ?').get(inventoryId, playerId);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  // Deduct cost
  deductFromWallet(playerId, NAMETAG_COST);

  // Update name (store custom name separately from skin_name)
  db.prepare('UPDATE inventory SET custom_name = ? WHERE id = ?').run(newName.trim(), inventoryId);

  db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
    .run(playerId, 'rename', -NAMETAG_COST, `Renamed "${item.skin_name}" to "${newName.trim()}"`);

  const updated = db.prepare('SELECT * FROM inventory WHERE id = ?').get(inventoryId);
  const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);

  res.json({ item: updated, player: updatedPlayer });
});

// POST /api/rename/remove - remove custom name
router.post('/remove', (req, res) => {
  const db = getDb();
  const { playerId, inventoryId } = req.body;

  const item = db.prepare('SELECT * FROM inventory WHERE id = ? AND player_id = ?').get(inventoryId, playerId);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  db.prepare('UPDATE inventory SET custom_name = NULL WHERE id = ?').run(inventoryId);
  const updated = db.prepare('SELECT * FROM inventory WHERE id = ?').get(inventoryId);
  res.json({ item: updated });
});

module.exports = router;
