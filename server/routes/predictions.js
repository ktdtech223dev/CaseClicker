const express = require('express');
const router = express.Router();
const { getDb, addToWallet, deductFromWallet } = require('../db/database');
const https = require('https');

// ===== DB SETUP =====
function ensureTables() {
  const db = getDb();
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS prediction_markets (
      id INTEGER PRIMARY KEY,
      question TEXT NOT NULL,
      type TEXT NOT NULL,
      polymarket_id TEXT,
      outcomes TEXT,
      outcome_prices TEXT,
      yes_pool REAL DEFAULT 0,
      no_pool REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      category TEXT DEFAULT 'general',
      volume TEXT,
      end_date TEXT,
      created_at INTEGER DEFAULT (strftime('%s','now')),
      resolves_at INTEGER,
      result TEXT
    )`);
  } catch (e) { /* already exists */ }
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS prediction_bets (
      id INTEGER PRIMARY KEY,
      market_id INTEGER,
      player_id INTEGER,
      side TEXT NOT NULL,
      amount REAL NOT NULL,
      payout REAL DEFAULT 0,
      timestamp INTEGER DEFAULT (strftime('%s','now'))
    )`);
  } catch (e) { /* already exists */ }
}

let tablesReady = false;
function init() {
  if (!tablesReady) {
    ensureTables();
    tablesReady = true;
  }
}

// ===== POLYMARKET API =====
function fetchJSON(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'application/json' },
    }, (res) => {
      if (res.statusCode !== 200) {
        console.log('[Predictions] HTTP ' + res.statusCode + ' from ' + url.substring(0, 80));
        resolve(null);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
    }).on('error', (e) => { console.log('[Predictions] Fetch error: ' + e.message); resolve(null); });
  });
}

async function fetchPolymarketData() {
  const categories = [
    { tag: '', label: 'trending' },  // top by liquidity
    { tag: 'politics', label: 'politics' },
    { tag: 'crypto', label: 'crypto' },
    { tag: 'sports', label: 'sports' },
  ];

  const allMarkets = [];
  const seen = new Set();

  for (const cat of categories) {
    try {
      const tagParam = cat.tag ? `&tag=${cat.tag}` : '';
      const url = `https://gamma-api.polymarket.com/markets?limit=15&active=true&closed=false&order=liquidityNum&ascending=false${tagParam}`;
      const data = await fetchJSON(url);
      if (!data || !Array.isArray(data)) continue;

      for (const m of data) {
        if (seen.has(m.id)) continue;
        seen.add(m.id);

        // Skip tiny markets and expired ones
        if (!m.question || !m.outcomes || !m.outcomePrices) continue;
        const endDate = m.endDate ? new Date(m.endDate) : null;
        if (endDate && endDate < new Date()) continue;

        let outcomes, prices;
        try {
          outcomes = typeof m.outcomes === 'string' ? JSON.parse(m.outcomes) : m.outcomes;
          prices = typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices;
        } catch { continue; }

        if (!outcomes || outcomes.length < 2) continue;

        // Determine category
        const q = m.question.toLowerCase();
        let category = cat.label;
        if (q.includes('bitcoin') || q.includes('ethereum') || q.includes('crypto') || q.includes('btc')) category = 'crypto';
        else if (q.includes('president') || q.includes('trump') || q.includes('election') || q.includes('congress') || q.includes('democrat') || q.includes('republican')) category = 'politics';
        else if (q.includes('world cup') || q.includes('nba') || q.includes('nfl') || q.includes('mlb') || q.includes('march madness') || q.includes('super bowl')) category = 'sports';

        allMarkets.push({
          polymarket_id: String(m.id),
          question: m.question,
          outcomes: JSON.stringify(outcomes),
          outcome_prices: JSON.stringify(prices.map(p => parseFloat(p))),
          category,
          volume: m.volume || '0',
          end_date: m.endDate || null,
        });
      }
    } catch (e) {
      console.log('[Predictions] Polymarket fetch error for ' + cat.label + ':', e.message);
    }
  }

  return allMarkets;
}

async function refreshMarkets() {
  init();
  const db = getDb();

  console.log('[Predictions] Fetching real-world markets from Polymarket...');
  const markets = await fetchPolymarketData();

  if (markets.length === 0) {
    console.log('[Predictions] No markets fetched');
    return;
  }

  const now = Math.floor(Date.now() / 1000);

  for (const m of markets) {
    // Check if market already exists
    const existing = db.prepare('SELECT id FROM prediction_markets WHERE polymarket_id = ?').get(m.polymarket_id);

    if (existing) {
      // Update prices
      db.prepare('UPDATE prediction_markets SET outcome_prices = ?, volume = ? WHERE polymarket_id = ?')
        .run(m.outcome_prices, m.volume, m.polymarket_id);
    } else {
      // Insert new market
      const resolves_at = m.end_date ? Math.floor(new Date(m.end_date).getTime() / 1000) : now + 86400 * 30;
      db.prepare(
        'INSERT INTO prediction_markets (question, type, polymarket_id, outcomes, outcome_prices, category, volume, end_date, resolves_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(m.question, 'polymarket', m.polymarket_id, m.outcomes, m.outcome_prices, m.category, m.volume, m.end_date, resolves_at, 'active');
    }
  }

  console.log('[Predictions] Loaded ' + markets.length + ' real-world markets');
}

// Refresh every 15 minutes
function startPredictionEngine() {
  // Delay start to let DB init
  setTimeout(() => {
    refreshMarkets().catch(e => console.error('[Predictions] Error:', e.message));
  }, 5000);

  setInterval(() => {
    refreshMarkets().catch(e => console.error('[Predictions] Error:', e.message));
  }, 15 * 60 * 1000);
}

// ===== API ROUTES =====

// GET /api/predictions - list active markets
router.get('/', async (req, res) => {
  init();
  const db = getDb();
  let markets = db.prepare(
    "SELECT * FROM prediction_markets WHERE status = 'active' ORDER BY CAST(volume AS REAL) DESC LIMIT 50"
  ).all();

  // If empty, trigger a fetch and return what we get
  if (markets.length === 0) {
    console.log('[Predictions] No markets in DB, triggering fetch...');
    try { await refreshMarkets(); } catch (e) { console.error('[Predictions] On-demand fetch error:', e.message); }
    markets = db.prepare(
      "SELECT * FROM prediction_markets WHERE status = 'active' ORDER BY CAST(volume AS REAL) DESC LIMIT 50"
    ).all();
  }

  // Parse JSON fields
  for (const m of markets) {
    try { m.outcomes = JSON.parse(m.outcomes); } catch { m.outcomes = ['Yes', 'No']; }
    try { m.outcome_prices = JSON.parse(m.outcome_prices); } catch { m.outcome_prices = [0.5, 0.5]; }
  }

  res.json(markets);
});

// POST /api/predictions/bet - place a bet
router.post('/bet', (req, res) => {
  init();
  const db = getDb();
  const { playerId, marketId, side, amount } = req.body;

  if (!playerId || !marketId || !side || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  if (player.wallet < amount) return res.status(400).json({ error: 'Insufficient funds' });

  const market = db.prepare('SELECT * FROM prediction_markets WHERE id = ?').get(marketId);
  if (!market || market.status !== 'active') return res.status(400).json({ error: 'Market not active' });

  // Deduct from wallet
  deductFromWallet(playerId, amount);

  // Update pool
  if (side === 'yes' || side === market.outcomes?.[0]) {
    db.prepare('UPDATE prediction_markets SET yes_pool = yes_pool + ? WHERE id = ?').run(amount, marketId);
  } else {
    db.prepare('UPDATE prediction_markets SET no_pool = no_pool + ? WHERE id = ?').run(amount, marketId);
  }

  // Record bet
  db.prepare('INSERT INTO prediction_bets (market_id, player_id, side, amount) VALUES (?, ?, ?, ?)')
    .run(marketId, playerId, side, amount);

  db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
    .run(playerId, 'prediction_bet', -amount, `Bet $${amount} on "${side}" — ${market.question.substring(0, 50)}`);

  const updated = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
  res.json({ success: true, player: updated });
});

// GET /api/predictions/my-bets/:playerId
router.get('/my-bets/:playerId', (req, res) => {
  init();
  const db = getDb();
  const bets = db.prepare(`
    SELECT pb.*, pm.question, pm.outcomes, pm.outcome_prices, pm.status as market_status, pm.result, pm.category
    FROM prediction_bets pb
    JOIN prediction_markets pm ON pb.market_id = pm.id
    WHERE pb.player_id = ?
    ORDER BY pb.timestamp DESC
    LIMIT 50
  `).all(req.params.playerId);

  for (const b of bets) {
    try { b.outcomes = JSON.parse(b.outcomes); } catch { b.outcomes = ['Yes', 'No']; }
    try { b.outcome_prices = JSON.parse(b.outcome_prices); } catch { b.outcome_prices = [0.5, 0.5]; }
  }

  res.json(bets);
});

// GET /api/predictions/history - resolved markets
router.get('/history', (req, res) => {
  init();
  const db = getDb();
  const markets = db.prepare(
    "SELECT * FROM prediction_markets WHERE status = 'resolved' ORDER BY resolves_at DESC LIMIT 30"
  ).all();

  for (const m of markets) {
    try { m.outcomes = JSON.parse(m.outcomes); } catch { m.outcomes = ['Yes', 'No']; }
    try { m.outcome_prices = JSON.parse(m.outcome_prices); } catch { m.outcome_prices = [0.5, 0.5]; }
  }

  res.json(markets);
});

// POST /api/predictions/resolve/:id - manually resolve a market (admin)
router.post('/resolve/:id', (req, res) => {
  init();
  const db = getDb();
  const { result } = req.body;
  const market = db.prepare('SELECT * FROM prediction_markets WHERE id = ?').get(req.params.id);
  if (!market) return res.status(404).json({ error: 'Market not found' });

  db.prepare('UPDATE prediction_markets SET status = ?, result = ? WHERE id = ?')
    .run('resolved', result, req.params.id);

  // Pay out winners
  const bets = db.prepare('SELECT * FROM prediction_bets WHERE market_id = ?').all(req.params.id);
  const totalPool = market.yes_pool + market.no_pool;

  for (const bet of bets) {
    if (bet.side === result) {
      const winPool = result === 'yes' ? market.yes_pool : market.no_pool;
      const share = winPool > 0 ? bet.amount / winPool : 0;
      const payout = Math.round(share * totalPool * 100) / 100;

      addToWallet(bet.player_id, payout);
      db.prepare('UPDATE prediction_bets SET payout = ? WHERE id = ?').run(payout, bet.id);
      db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
        .run(bet.player_id, 'prediction_win', payout, `Won $${payout} on "${market.question.substring(0, 40)}"`);
    }
  }

  res.json({ success: true, resolved: result, betsProcessed: bets.length });
});

module.exports = { router, startPredictionEngine };
