const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

const RANKS = [
  { level: 0, name: 'Unranked', requirement: 0, multiplier: 1.0 },
  { level: 1, name: 'Silver I', requirement: 1000, multiplier: 1.05 },
  { level: 2, name: 'Silver II', requirement: 5000, multiplier: 1.10 },
  { level: 3, name: 'Silver III', requirement: 15000, multiplier: 1.15 },
  { level: 4, name: 'Silver IV', requirement: 35000, multiplier: 1.20 },
  { level: 5, name: 'Silver Elite', requirement: 75000, multiplier: 1.30 },
  { level: 6, name: 'Silver Elite Master', requirement: 150000, multiplier: 1.40 },
  { level: 7, name: 'Gold Nova I', requirement: 400000, multiplier: 1.55 },
  { level: 8, name: 'Gold Nova II', requirement: 1000000, multiplier: 1.70 },
  { level: 9, name: 'Gold Nova III', requirement: 2500000, multiplier: 1.90 },
  { level: 10, name: 'Gold Nova Master', requirement: 6000000, multiplier: 2.15 },
  { level: 11, name: 'Master Guardian I', requirement: 15000000, multiplier: 2.40 },
  { level: 12, name: 'Master Guardian II', requirement: 40000000, multiplier: 2.70 },
  { level: 13, name: 'Master Guardian Elite', requirement: 100000000, multiplier: 3.10 },
  { level: 14, name: 'Distinguished Master Guardian', requirement: 250000000, multiplier: 3.60 },
  { level: 15, name: 'Legendary Eagle', requirement: 700000000, multiplier: 4.20 },
  { level: 16, name: 'Legendary Eagle Master', requirement: 2000000000, multiplier: 5.00 },
  { level: 17, name: 'Supreme Master First Class', requirement: 6000000000, multiplier: 6.00 },
  { level: 18, name: 'The Global Elite', requirement: 20000000000, multiplier: 7.50 },
];

// GET /api/prestige/:playerId - get prestige info
router.get('/:playerId', (req, res) => {
  const db = getDb();
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const currentLevel = player.prestige_level || 0;
  const currentRank = RANKS[currentLevel] || RANKS[0];
  const nextRank = RANKS[currentLevel + 1] || null;
  const lifetimeEarned = player.lifetime_earned || 0;

  res.json({
    currentRank,
    nextRank,
    lifetimeEarned,
    canPrestige: nextRank ? lifetimeEarned >= nextRank.requirement : false,
    allRanks: RANKS,
  });
});

// POST /api/prestige/:playerId - execute prestige
router.post('/:playerId', (req, res) => {
  const db = getDb();
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const currentLevel = player.prestige_level || 0;
  const nextRank = RANKS[currentLevel + 1];
  if (!nextRank) return res.status(400).json({ error: 'Already at max rank' });

  const lifetimeEarned = player.lifetime_earned || 0;
  if (lifetimeEarned < nextRank.requirement) {
    return res.status(400).json({ error: 'Not enough lifetime earnings', required: nextRank.requirement, current: lifetimeEarned });
  }

  // Reset player stats but keep lifetime data
  db.prepare(`UPDATE players SET
    wallet = 10.00,
    click_value = 0.01,
    auto_income = 0,
    total_cases_opened = 0,
    total_earned = 0,
    total_clicks = 0,
    global_multiplier = 0,
    cases_dropped = 0,
    prestige_level = ?,
    prestige_multiplier = ?
    WHERE id = ?`
  ).run(nextRank.level, nextRank.multiplier, player.id);

  // Clear upgrades for this player
  db.prepare('DELETE FROM upgrades WHERE player_id = ?').run(player.id);

  // Log the prestige
  db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
    .run(player.id, 'prestige', 0, `Prestiged to ${nextRank.name} (${nextRank.multiplier}x multiplier)`);

  const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(player.id);

  res.json({
    player: updatedPlayer,
    rank: nextRank,
    message: `Ranked up to ${nextRank.name}! ${nextRank.multiplier}x income multiplier active.`,
  });
});

module.exports = router;
module.exports.RANKS = RANKS;
