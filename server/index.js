const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { initDb, getDb } = require('./db/database');
const { batchRefreshPrices } = require('./services/priceCache');
const { getAllMarketHashNames, cases } = require('./services/skinData');
const { resolveImages, resolveSingleImage } = require('./services/imageResolver');
const { startPriceRefreshLoop, refreshAllPrices } = require('./services/priceFetcher');

const playersRouter = require('./routes/players');
const casesRouter = require('./routes/cases');
const marketRouter = require('./routes/market');
const gamesRouter = require('./routes/games');
const statsRouter = require('./routes/stats');
const tradeupRouter = require('./routes/tradeup');
const renameRouter = require('./routes/rename');
const prestigeRouter = require('./routes/prestige');
const tradesRouter = require('./routes/trades');
const wallRouter = require('./routes/wall');
const { router: predictionsRouter, startPredictionEngine } = require('./routes/predictions');
const sportsRouter = require('./routes/sports');
const battleRouter = require('./routes/battle');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Serve static skin images
app.use('/skins', express.static(path.join(__dirname, '..', 'public', 'skins')));

// API Routes
app.use('/api/players', playersRouter);
app.use('/api/cases', casesRouter);
app.use('/api/market', marketRouter);
app.use('/api/games', gamesRouter(io));
app.use('/api/stats', statsRouter);
app.use('/api/tradeup', tradeupRouter);
app.use('/api/rename', renameRouter);
app.use('/api/prestige', prestigeRouter);
app.use('/api/trades', tradesRouter);
app.use('/api/wall', wallRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/sports', sportsRouter);
app.use('/api/battle', battleRouter(io));

// ===== ADMIN: Force refresh prices from Steam =====
app.post('/api/admin/refresh-prices', async (req, res) => {
  try {
    res.json({ status: 'started', message: 'Price refresh started in background. Check server logs for progress.' });
    // Run in background so we don't block the response
    refreshAllPrices().catch(e => console.error('[Admin] Price refresh error:', e.message));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: Clear all cached prices (forces fresh fetch on next load)
app.post('/api/admin/clear-price-cache', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM price_cache').run();
  res.json({ status: 'cleared', message: 'All cached prices deleted. Hardcoded prices will be used until Steam prices are re-fetched.' });
});

// Admin: Get price cache stats
app.get('/api/admin/price-stats', (req, res) => {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as c FROM price_cache').get();
  const fresh = db.prepare('SELECT COUNT(*) as c FROM price_cache WHERE (? - last_fetched) < 86400').get(Math.floor(Date.now() / 1000));
  const stale = db.prepare('SELECT COUNT(*) as c FROM price_cache WHERE (? - last_fetched) >= 86400').get(Math.floor(Date.now() / 1000));
  const sample = db.prepare('SELECT market_hash_name, price_usd, last_fetched FROM price_cache ORDER BY last_fetched DESC LIMIT 10').all();
  res.json({
    total: total.c,
    fresh: fresh.c,
    stale: stale.c,
    recentUpdates: sample.map(s => ({
      name: s.market_hash_name,
      price: s.price_usd,
      age: Math.round((Date.now() / 1000 - s.last_fetched) / 60) + ' minutes ago',
    })),
  });
});

// Skin price lookup endpoint — returns prices per wear condition
app.get('/api/prices/skin', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'name parameter required' });
  try {
    const { getSkinPrice } = require('./data/skinPrices');
    const wears = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];
    const prices = {};
    const stPrices = {};
    for (const w of wears) {
      // Use getSkinPrice for base prices (accurate hardcoded + fallback)
      prices[w] = getSkinPrice(name, w);
      // Use getSkinPrice with StatTrak prefix for proper tiered multiplier
      stPrices[w] = getSkinPrice('StatTrak\u2122 ' + name, w);
    }
    res.json({ name, prices, stattrak_prices: stPrices });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Image resolver endpoint — resolve skin image on demand
app.get('/api/images/resolve', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'name parameter required' });
  try {
    const imageUrl = await resolveSingleImage(name);
    if (imageUrl) {
      res.json({ image_url: imageUrl });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Skin price ticker - returns top traded skins with price changes
app.get('/api/ticker', (req, res) => {
  const db = getDb();
  // Get recently sold/opened skins with their prices
  const recent = db.prepare(`
    SELECT DISTINCT i.skin_name, i.rarity, i.wear,
      pc.price_usd as price, pc.last_fetched
    FROM inventory i
    LEFT JOIN price_cache pc ON i.market_hash_name = pc.market_hash_name
    ORDER BY i.obtained_at DESC LIMIT 50
  `).all();

  // Also get some popular skins from price cache
  const popular = db.prepare(`
    SELECT market_hash_name, price_usd as price, last_fetched
    FROM price_cache
    WHERE price_usd > 0
    ORDER BY price_usd DESC LIMIT 30
  `).all();

  // Build ticker items with simulated price changes
  const ticker = [];
  const seen = new Set();

  for (const item of [...recent, ...popular]) {
    const name = item.skin_name || item.market_hash_name;
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const price = item.price || 0;
    if (price <= 0) continue;
    // Simulate small price fluctuation (-5% to +5%)
    const change = (Math.random() - 0.48) * 0.1; // slightly biased positive
    const changePercent = Math.round(change * 10000) / 100;
    ticker.push({
      name: name.replace(/\s*\(.*?\)$/, ''), // strip wear from name
      price: Math.round(price * 100) / 100,
      change: changePercent,
      rarity: item.rarity || 'Mil-Spec',
    });
    if (ticker.length >= 40) break;
  }

  // If not enough from DB, add some hardcoded popular skins
  if (ticker.length < 15) {
    const defaults = [
      { name: 'AK-47 | Redline', price: 44.04, rarity: 'Classified' },
      { name: 'AWP | Asiimov', price: 164.92, rarity: 'Covert' },
      { name: 'M4A1-S | Hyper Beast', price: 145.23, rarity: 'Classified' },
      { name: 'Desert Eagle | Blaze', price: 1139.99, rarity: 'Covert' },
      { name: 'AK-47 | Vulcan', price: 258.22, rarity: 'Covert' },
      { name: 'USP-S | Kill Confirmed', price: 92.76, rarity: 'Covert' },
      { name: 'AWP | Dragon Lore', price: 3500, rarity: 'Covert' },
      { name: 'M4A4 | Howl', price: 3000, rarity: 'Covert' },
      { name: 'Glock-18 | Fade', price: 2500, rarity: 'Classified' },
      { name: 'AK-47 | Fire Serpent', price: 1231, rarity: 'Covert' },
      { name: 'AWP | Lightning Strike', price: 868.77, rarity: 'Covert' },
      { name: 'M4A1-S | Hot Rod', price: 1826, rarity: 'Covert' },
      { name: 'AK-47 | Case Hardened', price: 400, rarity: 'Covert' },
      { name: 'AWP | Printstream', price: 72, rarity: 'Covert' },
      { name: 'M4A4 | Neo-Noir', price: 55, rarity: 'Covert' },
    ];
    for (const d of defaults) {
      if (!seen.has(d.name)) {
        const change = (Math.random() - 0.48) * 0.1;
        ticker.push({ ...d, change: Math.round(change * 10000) / 100 });
      }
    }
  }

  res.json(ticker);
});

// Serve built client in production (only if dist exists)
const fs = require('fs');
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback — serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      res.sendFile(path.join(clientDist, 'index.html'));
    }
  });
}

// Socket.io for real-time games
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('join_game', (data) => {
    socket.join(data.gameRoom);
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

async function start() {
  // Initialize database (async for sql.js WASM loading)
  await initDb();
  console.log('Database initialized');

  // Resolve skin images from ByMykel CS2 API (don't block startup)
  resolveImages(cases).catch(e => console.error('Image resolve error:', e));

  // Start price refresh loop (fetches from Steam every 24hrs, doesn't block startup)
  const allNames = getAllMarketHashNames();
  console.log(`Loaded ${allNames.length} unique skins across all cases`);
  startPriceRefreshLoop();

  // Start prediction engine after DB is ready
  try { startPredictionEngine(); } catch (e) { console.error('Prediction engine error:', e.message); }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
