const express = require('express');
const router = express.Router();
const { getDb, addToWallet, deductFromWallet } = require('../db/database');

// GET /api/trades/inventory/:playerId - Get any player's inventory (public view)
router.get('/inventory/:playerId', (req, res) => {
  const db = getDb();
  const items = db.prepare(
    'SELECT * FROM inventory WHERE player_id = ? ORDER BY obtained_at DESC'
  ).all(req.params.playerId);
  res.json(items);
});

// POST /api/trades/create - Create a trade request
router.post('/create', (req, res) => {
  const db = getDb();
  const { fromPlayerId, toPlayerId, offerSkinIds, requestSkinIds, cashOffer } = req.body;

  if (!fromPlayerId || !toPlayerId) {
    return res.status(400).json({ error: 'Both players are required' });
  }
  if (fromPlayerId === toPlayerId) {
    return res.status(400).json({ error: 'Cannot trade with yourself' });
  }
  if ((!offerSkinIds || offerSkinIds.length === 0) && (!cashOffer || cashOffer <= 0) &&
      (!requestSkinIds || requestSkinIds.length === 0)) {
    return res.status(400).json({ error: 'Trade must include at least one item or cash' });
  }

  // Verify fromPlayer exists and has enough cash
  const fromPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(fromPlayerId);
  if (!fromPlayer) return res.status(404).json({ error: 'Sender not found' });

  if (cashOffer && cashOffer > 0 && fromPlayer.wallet < cashOffer) {
    return res.status(400).json({ error: 'Insufficient funds for cash offer' });
  }

  // Verify toPlayer exists
  const toPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(toPlayerId);
  if (!toPlayer) return res.status(404).json({ error: 'Recipient not found' });

  // Verify all offered skins belong to fromPlayer
  if (offerSkinIds && offerSkinIds.length > 0) {
    for (const skinId of offerSkinIds) {
      const item = db.prepare('SELECT id FROM inventory WHERE id = ? AND player_id = ?').get(skinId, fromPlayerId);
      if (!item) return res.status(400).json({ error: `Skin ${skinId} not in your inventory` });
    }
  }

  // Verify all requested skins belong to toPlayer
  if (requestSkinIds && requestSkinIds.length > 0) {
    for (const skinId of requestSkinIds) {
      const item = db.prepare('SELECT id FROM inventory WHERE id = ? AND player_id = ?').get(skinId, toPlayerId);
      if (!item) return res.status(400).json({ error: `Skin ${skinId} not in recipient inventory` });
    }
  }

  // Check for duplicate pending trades
  const existing = db.prepare(
    "SELECT id FROM trades WHERE from_player_id = ? AND to_player_id = ? AND status = 'pending'"
  ).get(fromPlayerId, toPlayerId);
  if (existing) {
    return res.status(400).json({ error: 'You already have a pending trade with this player' });
  }

  const result = db.prepare(
    'INSERT INTO trades (from_player_id, to_player_id, offer_skin_ids, request_skin_ids, cash_offer) VALUES (?, ?, ?, ?, ?)'
  ).run(
    fromPlayerId,
    toPlayerId,
    JSON.stringify(offerSkinIds || []),
    JSON.stringify(requestSkinIds || []),
    cashOffer || 0
  );

  const trade = db.prepare('SELECT * FROM trades WHERE id = ?').get(result.lastInsertRowid);
  res.json(trade);
});

// GET /api/trades/pending/:playerId - Get pending trades for a player
router.get('/pending/:playerId', (req, res) => {
  const db = getDb();
  const playerId = Number(req.params.playerId);

  const trades = db.prepare(
    "SELECT * FROM trades WHERE (from_player_id = ? OR to_player_id = ?) AND status = 'pending' ORDER BY created_at DESC"
  ).all(playerId, playerId);

  // Enrich with player names and skin details
  const enriched = trades.map(trade => {
    const fromPlayer = db.prepare('SELECT id, name, color FROM players WHERE id = ?').get(trade.from_player_id);
    const toPlayer = db.prepare('SELECT id, name, color FROM players WHERE id = ?').get(trade.to_player_id);

    const offerIds = JSON.parse(trade.offer_skin_ids || '[]');
    const requestIds = JSON.parse(trade.request_skin_ids || '[]');

    const offerSkins = offerIds.map(id =>
      db.prepare('SELECT * FROM inventory WHERE id = ?').get(id)
    ).filter(Boolean);

    const requestSkins = requestIds.map(id =>
      db.prepare('SELECT * FROM inventory WHERE id = ?').get(id)
    ).filter(Boolean);

    return {
      ...trade,
      fromPlayer,
      toPlayer,
      offerSkins,
      requestSkins,
    };
  });

  res.json(enriched);
});

// POST /api/trades/:tradeId/accept - Accept a trade
router.post('/:tradeId/accept', (req, res) => {
  const db = getDb();
  const tradeId = Number(req.params.tradeId);

  const trade = db.prepare("SELECT * FROM trades WHERE id = ? AND status = 'pending'").get(tradeId);
  if (!trade) return res.status(404).json({ error: 'Trade not found or already resolved' });

  const offerIds = JSON.parse(trade.offer_skin_ids || '[]');
  const requestIds = JSON.parse(trade.request_skin_ids || '[]');

  // Verify all skins still exist and belong to the correct players
  for (const id of offerIds) {
    const item = db.prepare('SELECT id FROM inventory WHERE id = ? AND player_id = ?').get(id, trade.from_player_id);
    if (!item) {
      db.prepare("UPDATE trades SET status = 'cancelled', resolved_at = strftime('%s','now') WHERE id = ?").run(tradeId);
      return res.status(400).json({ error: 'Trade cancelled - offered skins no longer available' });
    }
  }
  for (const id of requestIds) {
    const item = db.prepare('SELECT id FROM inventory WHERE id = ? AND player_id = ?').get(id, trade.to_player_id);
    if (!item) {
      db.prepare("UPDATE trades SET status = 'cancelled', resolved_at = strftime('%s','now') WHERE id = ?").run(tradeId);
      return res.status(400).json({ error: 'Trade cancelled - requested skins no longer available' });
    }
  }

  // Verify cash
  if (trade.cash_offer > 0) {
    const fromPlayer = db.prepare('SELECT wallet FROM players WHERE id = ?').get(trade.from_player_id);
    if (!fromPlayer || fromPlayer.wallet < trade.cash_offer) {
      db.prepare("UPDATE trades SET status = 'cancelled', resolved_at = strftime('%s','now') WHERE id = ?").run(tradeId);
      return res.status(400).json({ error: 'Trade cancelled - sender has insufficient funds' });
    }
  }

  // Execute the trade: transfer skins
  for (const id of offerIds) {
    db.prepare('UPDATE inventory SET player_id = ? WHERE id = ?').run(trade.to_player_id, id);
  }
  for (const id of requestIds) {
    db.prepare('UPDATE inventory SET player_id = ? WHERE id = ?').run(trade.from_player_id, id);
  }

  // Transfer cash
  if (trade.cash_offer > 0) {
    deductFromWallet(trade.from_player_id, trade.cash_offer);
    addToWallet(trade.to_player_id, trade.cash_offer);
  }

  // Mark trade as accepted
  db.prepare("UPDATE trades SET status = 'accepted', resolved_at = strftime('%s','now') WHERE id = ?").run(tradeId);

  // Log transactions
  const fromPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(trade.from_player_id);
  const toPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(trade.to_player_id);

  db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)').run(
    trade.from_player_id, 'trade', trade.cash_offer || 0,
    `Trade with ${toPlayer.name}: sent ${offerIds.length} skins, received ${requestIds.length} skins`
  );
  db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)').run(
    trade.to_player_id, 'trade', trade.cash_offer || 0,
    `Trade with ${fromPlayer.name}: received ${offerIds.length} skins, sent ${requestIds.length} skins`
  );

  res.json({ success: true, fromPlayer, toPlayer });
});

// POST /api/trades/:tradeId/decline - Decline a trade
router.post('/:tradeId/decline', (req, res) => {
  const db = getDb();
  const tradeId = Number(req.params.tradeId);

  const trade = db.prepare("SELECT * FROM trades WHERE id = ? AND status = 'pending'").get(tradeId);
  if (!trade) return res.status(404).json({ error: 'Trade not found or already resolved' });

  db.prepare("UPDATE trades SET status = 'declined', resolved_at = strftime('%s','now') WHERE id = ?").run(tradeId);
  res.json({ success: true });
});

// GET /api/trades/history/:playerId - Trade history
router.get('/history/:playerId', (req, res) => {
  const db = getDb();
  const playerId = Number(req.params.playerId);

  const trades = db.prepare(
    "SELECT * FROM trades WHERE (from_player_id = ? OR to_player_id = ?) AND status != 'pending' ORDER BY resolved_at DESC LIMIT 50"
  ).all(playerId, playerId);

  const enriched = trades.map(trade => {
    const fromPlayer = db.prepare('SELECT id, name, color FROM players WHERE id = ?').get(trade.from_player_id);
    const toPlayer = db.prepare('SELECT id, name, color FROM players WHERE id = ?').get(trade.to_player_id);
    return { ...trade, fromPlayer, toPlayer };
  });

  res.json(enriched);
});

module.exports = router;
