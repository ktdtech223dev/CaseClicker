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

// ===== SEED MARKETS (fallback if Polymarket API is blocked) =====
const SEED_MARKETS = [
  // Politics
  { id: 'seed-1', question: 'Will Donald Trump complete his full second term as President?', outcomes: ['Yes','No'], prices: [0.82, 0.18], category: 'politics', volume: '5200000', end_date: '2029-01-20' },
  { id: 'seed-2', question: 'Will the US enter a recession in 2025?', outcomes: ['Yes','No'], prices: [0.38, 0.62], category: 'politics', volume: '3100000', end_date: '2025-12-31' },
  { id: 'seed-3', question: 'Will there be a US government shutdown in 2025?', outcomes: ['Yes','No'], prices: [0.44, 0.56], category: 'politics', volume: '1800000', end_date: '2025-12-31' },
  { id: 'seed-4', question: 'Will the Republican Party win the 2026 midterm elections?', outcomes: ['Yes','No'], prices: [0.55, 0.45], category: 'politics', volume: '2400000', end_date: '2026-11-03' },
  { id: 'seed-5', question: 'Will Elon Musk leave the Trump administration by end of 2025?', outcomes: ['Yes','No'], prices: [0.61, 0.39], category: 'politics', volume: '4100000', end_date: '2025-12-31' },
  { id: 'seed-6', question: 'Will the US impose 25%+ tariffs on all Chinese goods in 2025?', outcomes: ['Yes','No'], prices: [0.72, 0.28], category: 'politics', volume: '3300000', end_date: '2025-12-31' },
  // Crypto
  { id: 'seed-7', question: 'Will Bitcoin reach $150,000 in 2025?', outcomes: ['Yes','No'], prices: [0.47, 0.53], category: 'crypto', volume: '8700000', end_date: '2025-12-31' },
  { id: 'seed-8', question: 'Will Ethereum reach $5,000 in 2025?', outcomes: ['Yes','No'], prices: [0.41, 0.59], category: 'crypto', volume: '4200000', end_date: '2025-12-31' },
  { id: 'seed-9', question: 'Will a spot Ethereum ETF launch in the US in 2025?', outcomes: ['Yes','No'], prices: [0.88, 0.12], category: 'crypto', volume: '2900000', end_date: '2025-12-31' },
  { id: 'seed-10', question: 'Will the US create a national Bitcoin reserve in 2025?', outcomes: ['Yes','No'], prices: [0.55, 0.45], category: 'crypto', volume: '6100000', end_date: '2025-12-31' },
  { id: 'seed-11', question: 'Will Bitcoin\'s market cap exceed $3 trillion in 2025?', outcomes: ['Yes','No'], prices: [0.43, 0.57], category: 'crypto', volume: '3700000', end_date: '2025-12-31' },
  { id: 'seed-12', question: 'Will Solana reach $500 in 2025?', outcomes: ['Yes','No'], prices: [0.36, 0.64], category: 'crypto', volume: '2100000', end_date: '2025-12-31' },
  // Sports
  { id: 'seed-13', question: 'Will the Golden State Warriors make the NBA Playoffs in 2025?', outcomes: ['Yes','No'], prices: [0.29, 0.71], category: 'sports', volume: '1200000', end_date: '2025-06-30' },
  { id: 'seed-14', question: 'Will a new Formula 1 world champion be crowned in 2025?', outcomes: ['Yes','No'], prices: [0.68, 0.32], category: 'sports', volume: '1900000', end_date: '2025-12-01' },
  { id: 'seed-15', question: 'Will the Kansas City Chiefs win the Super Bowl in 2026?', outcomes: ['Yes','No'], prices: [0.22, 0.78], category: 'sports', volume: '3400000', end_date: '2026-02-08' },
  { id: 'seed-16', question: 'Will Lionel Messi retire from professional soccer in 2025?', outcomes: ['Yes','No'], prices: [0.19, 0.81], category: 'sports', volume: '890000', end_date: '2025-12-31' },
  { id: 'seed-17', question: 'Will a team outside the "Big 6" win the Premier League in 2024-25?', outcomes: ['Yes','No'], prices: [0.08, 0.92], category: 'sports', volume: '1400000', end_date: '2025-05-25' },
  // Tech / Business
  { id: 'seed-18', question: 'Will Apple release an AI-focused device (not iPhone/Mac) in 2025?', outcomes: ['Yes','No'], prices: [0.34, 0.66], category: 'tech', volume: '2200000', end_date: '2025-12-31' },
  { id: 'seed-19', question: 'Will OpenAI release GPT-5 in 2025?', outcomes: ['Yes','No'], prices: [0.76, 0.24], category: 'tech', volume: '5500000', end_date: '2025-12-31' },
  { id: 'seed-20', question: 'Will Tesla stock (TSLA) be above $400 on Dec 31 2025?', outcomes: ['Yes','No'], prices: [0.48, 0.52], category: 'tech', volume: '3800000', end_date: '2025-12-31' },
  { id: 'seed-21', question: 'Will SpaceX Starship reach orbit in 2025?', outcomes: ['Yes','No'], prices: [0.84, 0.16], category: 'tech', volume: '2700000', end_date: '2025-12-31' },
  { id: 'seed-22', question: 'Will the S&P 500 end 2025 higher than it started?', outcomes: ['Yes','No'], prices: [0.57, 0.43], category: 'tech', volume: '4600000', end_date: '2025-12-31' },
];

// ===== POLYMARKET API =====
function fetchJSON(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      timeout: 10000,
    }, (res) => {
      console.log('[Predictions] HTTP ' + res.statusCode + ' from ' + url.substring(0, 80));
      if (res.statusCode !== 200) { resolve(null); return; }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { console.log('[Predictions] JSON parse error:', e.message); resolve(null); } });
    });
    req.on('error', (e) => { console.log('[Predictions] Fetch error: ' + e.message); resolve(null); });
    req.on('timeout', () => { console.log('[Predictions] Request timeout for ' + url.substring(0, 60)); req.destroy(); resolve(null); });
  });
}

async function fetchPolymarketData() {
  // Try multiple Polymarket endpoints in order
  const endpoints = [
    'https://gamma-api.polymarket.com/markets?limit=20&active=true&closed=false&order=liquidityNum&ascending=false',
    'https://gamma-api.polymarket.com/markets?limit=20&active=true&closed=false&order=volumeNum&ascending=false',
    'https://gamma-api.polymarket.com/markets?limit=20&active=true',
  ];

  let rawMarkets = null;
  for (const url of endpoints) {
    rawMarkets = await fetchJSON(url);
    if (rawMarkets && Array.isArray(rawMarkets) && rawMarkets.length > 0) {
      console.log('[Predictions] Got ' + rawMarkets.length + ' markets from ' + url.substring(0, 60));
      break;
    }
  }

  if (!rawMarkets || !Array.isArray(rawMarkets) || rawMarkets.length === 0) {
    console.log('[Predictions] All Polymarket endpoints failed or blocked — returning empty');
    return [];
  }

  const allMarkets = [];
  const seen = new Set();

  for (const m of rawMarkets) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);

    if (!m.question || !m.outcomes || !m.outcomePrices) continue;
    const endDate = m.endDate ? new Date(m.endDate) : null;
    if (endDate && endDate < new Date()) continue;

    let outcomes, prices;
    try {
      outcomes = typeof m.outcomes === 'string' ? JSON.parse(m.outcomes) : m.outcomes;
      prices = typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices;
    } catch { continue; }

    if (!outcomes || outcomes.length < 2) continue;

    const q = m.question.toLowerCase();
    let category = 'general';
    if (q.includes('bitcoin') || q.includes('ethereum') || q.includes('crypto') || q.includes('btc') || q.includes('solana')) category = 'crypto';
    else if (q.includes('president') || q.includes('trump') || q.includes('election') || q.includes('congress') || q.includes('democrat') || q.includes('republican') || q.includes('senate') || q.includes('tariff')) category = 'politics';
    else if (q.includes('nba') || q.includes('nfl') || q.includes('mlb') || q.includes('super bowl') || q.includes('world cup') || q.includes('formula') || q.includes('champion')) category = 'sports';
    else if (q.includes('apple') || q.includes('tesla') || q.includes('openai') || q.includes('google') || q.includes('stock') || q.includes('s&p') || q.includes('spacex')) category = 'tech';

    allMarkets.push({
      polymarket_id: String(m.id),
      question: m.question,
      outcomes: JSON.stringify(outcomes),
      outcome_prices: JSON.stringify(prices.map(p => parseFloat(p))),
      category,
      volume: m.volume || m.volumeNum || '0',
      end_date: m.endDate || null,
    });
  }

  return allMarkets;
}

// Insert seed markets if DB is empty (guaranteed fallback)
function seedMarketsIfEmpty() {
  const db = getDb();
  const count = db.prepare("SELECT COUNT(*) as c FROM prediction_markets WHERE status = 'active'").get();
  if (count && count.c > 0) return;

  console.log('[Predictions] Seeding fallback markets...');
  const now = Math.floor(Date.now() / 1000);
  for (const m of SEED_MARKETS) {
    const existing = db.prepare('SELECT id FROM prediction_markets WHERE polymarket_id = ?').get(m.id);
    if (existing) continue;
    const resolves_at = m.end_date ? Math.floor(new Date(m.end_date).getTime() / 1000) : now + 86400 * 180;
    db.prepare(
      'INSERT INTO prediction_markets (question, type, polymarket_id, outcomes, outcome_prices, category, volume, end_date, resolves_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(m.question, 'curated', m.id, JSON.stringify(m.outcomes), JSON.stringify(m.prices), m.category, m.volume, m.end_date, resolves_at, 'active');
  }
  console.log('[Predictions] Seeded ' + SEED_MARKETS.length + ' fallback markets');
}

async function refreshMarkets() {
  init();
  const db = getDb();

  console.log('[Predictions] Fetching real-world markets from Polymarket...');
  const markets = await fetchPolymarketData();

  if (markets.length === 0) {
    console.log('[Predictions] Polymarket unavailable — using seed markets as fallback');
    seedMarketsIfEmpty();
    return;
  }

  const now = Math.floor(Date.now() / 1000);

  for (const m of markets) {
    const existing = db.prepare('SELECT id FROM prediction_markets WHERE polymarket_id = ?').get(m.polymarket_id);
    if (existing) {
      db.prepare('UPDATE prediction_markets SET outcome_prices = ?, volume = ? WHERE polymarket_id = ?')
        .run(m.outcome_prices, m.volume, m.polymarket_id);
    } else {
      const resolves_at = m.end_date ? Math.floor(new Date(m.end_date).getTime() / 1000) : now + 86400 * 30;
      db.prepare(
        'INSERT INTO prediction_markets (question, type, polymarket_id, outcomes, outcome_prices, category, volume, end_date, resolves_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(m.question, 'polymarket', m.polymarket_id, m.outcomes, m.outcome_prices, m.category, m.volume, m.end_date, resolves_at, 'active');
    }
  }

  console.log('[Predictions] Loaded ' + markets.length + ' real-world markets from Polymarket');
}

// Refresh every 15 minutes; seeds guaranteed fallback
function startPredictionEngine() {
  setTimeout(() => {
    init();
    // Always seed first so there's something immediately
    seedMarketsIfEmpty();
    // Then try Polymarket on top
    refreshMarkets().catch(e => console.error('[Predictions] Error:', e.message));
  }, 3000);

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

  // If empty, seed immediately then try Polymarket
  if (markets.length === 0) {
    console.log('[Predictions] No markets in DB — seeding + fetching...');
    try { seedMarketsIfEmpty(); } catch (e) {}
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
