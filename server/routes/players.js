const express = require('express');
const router = express.Router();
const { getDb, addToWallet, deductFromWallet } = require('../db/database');
const { UPGRADES, UPGRADE_TIERS, getUpgradeCost, getTierForUpgrade } = require('../data/upgrades');
const { getSkinPrice } = require('../data/skinPrices');

// GET /api/players - list all players
router.get('/', (req, res) => {
  const db = getDb();
  const players = db.prepare('SELECT * FROM players ORDER BY id').all();
  res.json(players);
});

// POST /api/players - create player
router.post('/', (req, res) => {
  const db = getDb();
  const { name, avatar, ngames_id, color } = req.body;
  const result = db.prepare(
    'INSERT INTO players (name, avatar, ngames_id, color) VALUES (?, ?, ?, ?)'
  ).run(name, avatar, ngames_id || null, color || '#ffffff');
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid);
  res.json(player);
});

// PUT /api/players/:id - update player
router.put('/:id', (req, res) => {
  const db = getDb();
  const body = req.body;
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  // Only update fields explicitly provided (not undefined/null)
  // This prevents COALESCE(0, wallet) from zeroing out the wallet
  const fields = ['wallet', 'total_cases_opened', 'total_earned', 'total_clicks', 'click_value', 'auto_income'];
  const updates = [];
  const values = [];
  for (const f of fields) {
    if (body[f] !== undefined && body[f] !== null) {
      updates.push(f + ' = ?');
      values.push(body[f]);
    }
  }

  if (updates.length > 0) {
    values.push(req.params.id);
    db.prepare('UPDATE players SET ' + updates.join(', ') + ' WHERE id = ?').run(...values);
  }

  const updated = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// GET /api/players/:id/inventory - prices from price_cache > prices.json > hardcoded
router.get('/:id/inventory', (req, res) => {
  const db = getDb();
  const items = db.prepare('SELECT * FROM inventory WHERE player_id = ? ORDER BY obtained_at DESC').all(req.params.id);

  const getCache = db.prepare('SELECT price_usd FROM price_cache WHERE market_hash_name = ?');

  for (const item of items) {
    let price = 0;
    const hashName = item.market_hash_name || '';

    // Skip price_cache for stickers/gloves — bulk APIs return bad prices
    const isSticker = /^sticker\s*\|/i.test(hashName);
    const isGlove = /gloves|wraps/i.test(hashName);
    if (!isSticker && !isGlove) {
      // Priority 1: price_cache exact match
      const cached = getCache.get(hashName);
      if (cached && cached.price_usd > 0) {
        price = cached.price_usd;
      }
      // Priority 2: price_cache without wear
      if (price <= 0) {
        const noWear = hashName.replace(/\s*\((?:Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)\s*$/i, '');
        if (noWear !== hashName) {
          const cached2 = getCache.get(noWear);
          if (cached2 && cached2.price_usd > 0) price = cached2.price_usd;
        }
      }
    }

    // Priority 3: getSkinPrice (prices.json > hardcoded > rarity fallback)
    if (price <= 0) {
      const base = item.skin_name || '';
      const wear = item.wear || 'Field-Tested';
      const fullName = item.stattrak ? ('StatTrak ' + base) : base;
      price = getSkinPrice(fullName, wear, item.rarity);
    }

    item.price = (isNaN(price) || price <= 0) ? 1 : Math.round(price * 100) / 100;
  }

  res.json(items);
});

// POST /api/players/:id/click - handle click income
router.post('/:id/click', (req, res) => {
  const db = getDb();
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const clickVal = Number(player.click_value) || 0.01;
  const prestMult = Number(player.prestige_multiplier) || 1;
  const globalMult = Number(player.global_multiplier) || 0;
  const earned = Math.round(clickVal * prestMult * (1 + globalMult) * 100) / 100;

  // Use explicit CAST to handle sql.js type issues — wallet might be stored as TEXT
  const now = Math.floor(Date.now() / 1000);
  if (earned > 0) {
    const currentWallet = Number(player.wallet) || 0;
    const currentEarned = Number(player.total_earned) || 0;
    const currentLifetime = Number(player.lifetime_earned) || 0;
    const currentClicks = Number(player.total_clicks) || 0;
    db.prepare('UPDATE players SET wallet = ?, total_earned = ?, total_clicks = ?, lifetime_earned = ?, last_active_at = ? WHERE id = ?')
      .run(
        Math.round((currentWallet + earned) * 100) / 100,
        Math.round((currentEarned + earned) * 100) / 100,
        currentClicks + 1,
        Math.round((currentLifetime + earned) * 100) / 100,
        now,
        req.params.id
      );
  } else {
    db.prepare('UPDATE players SET total_clicks = total_clicks + 1, last_active_at = ? WHERE id = ?')
      .run(now, req.params.id);
  }

  const updated = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  res.json({ player: updated, earned });
});

// POST /api/players/:id/upgrade - purchase upgrade
router.post('/:id/upgrade', (req, res) => {
  const db = getDb();
  const { upgrade_type } = req.body;
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const upgrade = UPGRADES[upgrade_type];
  if (!upgrade) return res.status(400).json({ error: 'Invalid upgrade' });

  // Validate tier unlock
  const tier = getTierForUpgrade(upgrade_type);
  if (tier && (player.lifetime_earned || 0) < tier.unlockAt) {
    return res.status(400).json({ error: `Requires ${tier.name} tier (earn $${tier.unlockAt} lifetime)` });
  }

  // Get current level
  let row = db.prepare('SELECT level FROM upgrades WHERE player_id = ? AND upgrade_type = ?').get(req.params.id, upgrade_type);
  const level = row ? row.level : 0;
  const cost = getUpgradeCost(upgrade_type, level);

  const playerWallet = Number(player.wallet) || 0;
  if (playerWallet < cost) return res.status(400).json({ error: 'Not enough money' });

  db.prepare('UPDATE players SET wallet = ? WHERE id = ?').run(Math.round((playerWallet - cost) * 100) / 100, req.params.id);

  // Refresh player after wallet deduction to get current values
  const afterDeduct = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (upgrade.type === 'click') {
    db.prepare('UPDATE players SET click_value = ? WHERE id = ?').run(Math.round(((Number(afterDeduct.click_value) || 0.01) + upgrade.value) * 10000) / 10000, req.params.id);
  } else if (upgrade.type === 'auto') {
    db.prepare('UPDATE players SET auto_income = ? WHERE id = ?').run(Math.round(((Number(afterDeduct.auto_income) || 0) + upgrade.value) * 10000) / 10000, req.params.id);
  } else if (upgrade.type === 'multiplier') {
    db.prepare('UPDATE players SET global_multiplier = ? WHERE id = ?').run(Math.round(((Number(afterDeduct.global_multiplier) || 0) + upgrade.value) * 10000) / 10000, req.params.id);
  }

  db.prepare('INSERT INTO upgrades (player_id, upgrade_type, level) VALUES (?, ?, 1) ON CONFLICT(player_id, upgrade_type) DO UPDATE SET level = level + 1')
    .run(req.params.id, upgrade_type);

  db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
    .run(req.params.id, 'upgrade', -cost, `Purchased ${upgrade.name} (Level ${level + 1})`);

  // Free case drop on every upgrade purchase
  const caseNames = ['CS:GO Weapon Case', 'Chroma Case', 'Clutch Case', 'Danger Zone Case',
    'Dreams & Nightmares Case', 'Fracture Case', 'Gallery Case', 'Kilowatt Case',
    'Operation Riptide Case', 'Revolution Case', 'Recoil Case', 'Snakebite Case', 'Spectrum 2 Case'];
  const caseDrop = caseNames[Math.floor(Math.random() * caseNames.length)];
  // Credit $4.98 (case + key) so they can open it free
  const preDropPlayer = db.prepare('SELECT wallet, cases_dropped FROM players WHERE id = ?').get(req.params.id);
  db.prepare('UPDATE players SET wallet = ?, cases_dropped = ? WHERE id = ?')
    .run(Math.round(((Number(preDropPlayer.wallet) || 0) + 4.98) * 100) / 100, (Number(preDropPlayer.cases_dropped) || 0) + 1, req.params.id);
  db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
    .run(req.params.id, 'case_drop', 4.98, `Level up reward: Free ${caseDrop}`);

  const updated = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  const upgradeLevels = db.prepare('SELECT upgrade_type, level FROM upgrades WHERE player_id = ?').all(req.params.id);
  res.json({ player: updated, upgrades: upgradeLevels, cost: Math.round(cost * 100) / 100, caseDrop });
});

// GET /api/players/:id/upgrades
router.get('/:id/upgrades', (req, res) => {
  const db = getDb();
  const upgrades = db.prepare('SELECT upgrade_type, level FROM upgrades WHERE player_id = ?').all(req.params.id);
  res.json(upgrades);
});

// POST /api/players/:id/auto-income - collect auto income
router.post('/:id/auto-income', (req, res) => {
  const db = getDb();
  const { seconds } = req.body;
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const autoVal = Number(player.auto_income) || 0;
  const prestMult = Number(player.prestige_multiplier) || 1;
  const globalMult = Number(player.global_multiplier) || 0;
  const autoIncome = autoVal * prestMult * (1 + globalMult);
  const earned = Math.round(autoIncome * (Number(seconds) || 1) * 100) / 100;
  if (earned > 0) {
    const now = Math.floor(Date.now() / 1000);
    const newWallet = Math.round(((Number(player.wallet) || 0) + earned) * 100) / 100;
    const newEarned = Math.round(((Number(player.total_earned) || 0) + earned) * 100) / 100;
    const newLifetime = Math.round(((Number(player.lifetime_earned) || 0) + earned) * 100) / 100;
    db.prepare('UPDATE players SET wallet = ?, total_earned = ?, lifetime_earned = ?, last_active_at = ? WHERE id = ?')
      .run(newWallet, newEarned, newLifetime, now, req.params.id);
  }

  const updated = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  res.json({ player: updated, earned });
});

// POST /api/players/:id/reset - reset player data
router.post('/:id/reset', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE players SET wallet = 10.00, total_cases_opened = 0, total_earned = 0, total_clicks = 0, click_value = 0.01, auto_income = 0, prestige_level = 0, prestige_multiplier = 1.0, lifetime_earned = 0, global_multiplier = 0, cases_dropped = 0 WHERE id = ?')
    .run(req.params.id);
  db.prepare('DELETE FROM inventory WHERE player_id = ?').run(req.params.id);
  db.prepare('DELETE FROM upgrades WHERE player_id = ?').run(req.params.id);
  db.prepare('DELETE FROM transactions WHERE player_id = ?').run(req.params.id);
  db.prepare('DELETE FROM game_history WHERE player_id = ?').run(req.params.id);
  db.prepare('DELETE FROM achievements WHERE player_id = ?').run(req.params.id);
  db.prepare('DELETE FROM daily_bonus WHERE player_id = ?').run(req.params.id);
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  res.json(player);
});

// POST /api/players/admin/master-reset - reset ALL player data
router.post('/admin/master-reset', (req, res) => {
  const db = getDb();
  const { confirmCode } = req.body;
  // Require confirmation to prevent accidental resets
  if (confirmCode !== 'RESET_ALL_PLAYERS') {
    return res.status(400).json({ error: 'Invalid confirmation code' });
  }
  // Reset all players to defaults
  db.prepare('UPDATE players SET wallet = 10.00, total_cases_opened = 0, total_earned = 0, total_clicks = 0, click_value = 0.01, auto_income = 0, prestige_level = 0, prestige_multiplier = 1.0, lifetime_earned = 0, global_multiplier = 0, cases_dropped = 0').run();
  // Clear all related tables
  db.prepare('DELETE FROM inventory').run();
  db.prepare('DELETE FROM upgrades').run();
  db.prepare('DELETE FROM transactions').run();
  db.prepare('DELETE FROM game_history').run();
  db.prepare('DELETE FROM achievements').run();
  db.prepare('DELETE FROM daily_bonus').run();
  db.prepare('DELETE FROM wall_posts').run();
  try { db.prepare('DELETE FROM trades').run(); } catch(e) {}
  try { db.prepare('DELETE FROM jackpot_history').run(); } catch(e) {}
  const players = db.prepare('SELECT * FROM players ORDER BY id').all();
  res.json({ success: true, message: 'All player data has been reset', players });
});

// GET /api/players/:id/achievements
router.get('/:id/achievements', (req, res) => {
  const db = getDb();
  const achievements = db.prepare('SELECT * FROM achievements WHERE player_id = ?').all(req.params.id);
  res.json(achievements);
});

// POST /api/players/:id/achievements
router.post('/:id/achievements', (req, res) => {
  const db = getDb();
  const { achievement_id } = req.body;
  try {
    db.prepare('INSERT OR IGNORE INTO achievements (player_id, achievement_id) VALUES (?, ?)')
      .run(req.params.id, achievement_id);
    res.json({ success: true, achievement_id });
  } catch (e) {
    res.json({ success: false, already_unlocked: true });
  }
});

// POST /api/players/:id/collect-offline
router.post('/:id/collect-offline', (req, res) => {
  const db = getDb();
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const now = Math.floor(Date.now() / 1000);
  const lastActive = player.last_active_at || now;
  const elapsed = Math.min(now - lastActive, 28800); // cap at 8 hours

  if (elapsed < 60) return res.json({ player, earned: 0, elapsed: 0 }); // less than 1 min, skip

  const autoIncome = player.auto_income * (player.prestige_multiplier || 1) * (1 + (player.global_multiplier || 0));
  const earned = Math.round(autoIncome * elapsed * 0.5 * 100) / 100; // 50% efficiency offline

  if (earned > 0) {
    addToWallet(player.id, earned);
    db.prepare('UPDATE players SET total_earned = total_earned + ?, lifetime_earned = lifetime_earned + ?, last_active_at = ? WHERE id = ?')
      .run(earned, earned, now, player.id);
  } else {
    db.prepare('UPDATE players SET last_active_at = ? WHERE id = ?').run(now, player.id);
  }

  const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(player.id);
  res.json({ player: updatedPlayer, earned, elapsed });
});

// GET /api/players/:id/daily-bonus
router.get('/:id/daily-bonus', (req, res) => {
  const db = getDb();
  const bonus = db.prepare('SELECT * FROM daily_bonus WHERE player_id = ?').get(req.params.id);
  const now = Math.floor(Date.now() / 1000);
  const canClaim = !bonus || (now - bonus.last_claim) >= 86400; // 24 hours
  const streak = bonus ? bonus.streak : 0;
  res.json({ canClaim, streak, lastClaim: bonus ? bonus.last_claim : 0 });
});

// POST /api/players/:id/daily-bonus
router.post('/:id/daily-bonus', (req, res) => {
  const db = getDb();
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const now = Math.floor(Date.now() / 1000);
  const bonus = db.prepare('SELECT * FROM daily_bonus WHERE player_id = ?').get(player.id);

  if (bonus && (now - bonus.last_claim) < 86400) {
    return res.status(400).json({ error: 'Already claimed today' });
  }

  // Calculate streak
  let streak = 1;
  if (bonus) {
    const gap = now - bonus.last_claim;
    if (gap < 172800) { // within 48 hours
      streak = Math.min((bonus.streak || 0) + 1, 7);
    }
    // else streak resets to 1
  }

  const rewards = [1, 5, 15, 50, 150, 500, 2000];
  const reward = rewards[streak - 1] || rewards[0];

  // Upsert daily bonus
  db.prepare('INSERT OR REPLACE INTO daily_bonus (player_id, last_claim, streak) VALUES (?, ?, ?)')
    .run(player.id, now, streak);

  // Add reward to wallet
  addToWallet(player.id, reward);
  db.prepare('UPDATE players SET total_earned = total_earned + ?, lifetime_earned = lifetime_earned + ? WHERE id = ?')
    .run(reward, reward, player.id);

  db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
    .run(player.id, 'daily_bonus', reward, `Daily bonus day ${streak}: +$${reward}`);

  const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(player.id);
  res.json({ player: updatedPlayer, reward, streak, day: streak });
});

// POST /api/players/inventory/:itemId/lock - toggle lock on an inventory item
router.post('/inventory/:itemId/lock', (req, res) => {
  const db = getDb();
  const item = db.prepare('SELECT * FROM inventory WHERE id = ?').get(req.params.itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const newLocked = item.locked ? 0 : 1;
  db.prepare('UPDATE inventory SET locked = ? WHERE id = ?').run(newLocked, req.params.itemId);

  res.json({ id: item.id, locked: newLocked });
});

module.exports = router;
