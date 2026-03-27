/**
 * Price Fetcher v3 — Bulk to SQLite
 * ==================================
 * On startup: fetches ALL prices from Skinport + CSGO.TM (2 requests, ~10s)
 * Writes directly to price_cache SQLite table (persists on Railway volume)
 * Also writes prices.json as backup
 * Refreshes every 6 hours automatically
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PRICES_FILE = path.join(__dirname, '..', 'data', 'prices.json');
const REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

function fetchJSON(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    }, (res) => {
      if (res.statusCode !== 200) { resolve(null); return; }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(30000, () => { req.destroy(); resolve(null); });
  });
}

async function fetchSkinportBulk() {
  console.log('[PriceFetcher] Fetching Skinport bulk...');
  try {
    const data = await fetchJSON('https://api.skinport.com/v1/items?app_id=730&currency=USD');
    if (!data || !Array.isArray(data)) { console.log('[PriceFetcher] Skinport: no data (may be IP-blocked), skipping'); return {}; }
  const map = {};
  for (const item of data) {
    if (!item.market_hash_name) continue;
    map[item.market_hash_name] = item.suggested_price || item.min_price || 0;
  }
  console.log('[PriceFetcher] Skinport: ' + Object.keys(map).length + ' items');
  return map;
  } catch (e) { console.log('[PriceFetcher] Skinport error: ' + e.message); return {}; }
}

async function fetchCsgoTmBulk() {
  console.log('[PriceFetcher] Fetching CSGO.TM bulk...');
  const data = await fetchJSON('https://market.csgo.com/api/v2/prices/USD.json');
  if (!data || !data.items) { console.log('[PriceFetcher] CSGO.TM FAILED'); return {}; }
  const map = {};
  for (const item of data.items) {
    if (!item.market_hash_name) continue;
    const p = parseFloat(item.price);
    if (p > 0) map[item.market_hash_name] = p;
  }
  console.log('[PriceFetcher] CSGO.TM: ' + Object.keys(map).length + ' items');
  return map;
}

async function refreshAllPrices() {
  const { getDb } = require('../db/database');
  const db = getDb();
  if (!db) { console.log('[PriceFetcher] DB not ready, skipping'); return; }

  console.log('[PriceFetcher] Starting bulk price refresh...');
  const start = Date.now();

  const skinportMap = await fetchSkinportBulk();
  const csgoTmMap = await fetchCsgoTmBulk();

  const spCount = Object.keys(skinportMap).length;
  const tmCount = Object.keys(csgoTmMap).length;

  if (spCount === 0 && tmCount === 0) {
    console.log('[PriceFetcher] Both sources failed — keeping existing prices');
    // Still try to load prices.json into price_cache if it exists
    try {
      const pricesFile = path.join(__dirname, '..', 'data', 'prices.json');
      if (fs.existsSync(pricesFile)) {
        const jsonPrices = JSON.parse(fs.readFileSync(pricesFile, 'utf8'));
        const wears = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];
        const now = Math.floor(Date.now() / 1000);
        let loaded = 0;
        db.exec('BEGIN TRANSACTION');
        for (const [skinName, data] of Object.entries(jsonPrices)) {
          if (!data.base) continue;
          for (const w of wears) {
            if (data.base[w] > 0) {
              const hash = skinName + ' (' + w + ')';
              db.prepare('INSERT OR REPLACE INTO price_cache (market_hash_name, price_usd, last_fetched) VALUES (?, ?, ?)').run(hash, data.base[w], now);
              loaded++;
            }
            if (data.stattrak && data.stattrak[w] > 0) {
              const stHash = 'StatTrak\u2122 ' + skinName + ' (' + w + ')';
              db.prepare('INSERT OR REPLACE INTO price_cache (market_hash_name, price_usd, last_fetched) VALUES (?, ?, ?)').run(stHash, data.stattrak[w], now);
              loaded++;
            }
          }
        }
        db.exec('COMMIT');
        db.save();
        console.log('[PriceFetcher] Loaded ' + loaded + ' prices from prices.json into SQLite');
      }
    } catch (e) { console.log('[PriceFetcher] prices.json fallback error: ' + e.message); }
    return;
  }

  // Merge all market_hash_names from both sources
  const allNames = new Set([...Object.keys(skinportMap), ...Object.keys(csgoTmMap)]);
  console.log('[PriceFetcher] Unique items across sources: ' + allNames.size);

  // Write to price_cache SQLite table (sql.js compatible — no .transaction())
  const now = Math.floor(Date.now() / 1000);
  let written = 0;

  db.exec('BEGIN TRANSACTION');
  for (const name of allNames) {
    const prices = [];
    const spVal = skinportMap[name];
    const tmVal = csgoTmMap[name];
    // Handle both number and object formats
    const spPrice = typeof spVal === 'object' ? (spVal && spVal.price) : spVal;
    const tmPrice = typeof tmVal === 'object' ? (tmVal && tmVal.price) : tmVal;
    if (spPrice > 0) prices.push(parseFloat(spPrice));
    if (tmPrice > 0) prices.push(parseFloat(tmPrice));
    if (prices.length > 0) {
      const avg = Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100;
      if (avg > 0) {
        db.prepare('INSERT OR REPLACE INTO price_cache (market_hash_name, price_usd, last_fetched) VALUES (?, ?, ?)').run(name, avg, now);
        written++;
      }
    }
  }
  db.exec('COMMIT');
  db.save(); // flush to disk (Railway volume)
  console.log('[PriceFetcher] Written ' + written + ' prices to SQLite');

  // Also write prices.json for the getSkinPrice fallback
  try {
    const { cases: allCases } = require('./skinData');
    const wears = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];
    const skinNames = new Set();
    for (const c of allCases) {
      for (const s of (c.skins || [])) skinNames.add(s.name);
      for (const r of (c.rare_special || [])) {
        if (r.name && r.name.includes('|')) skinNames.add(r.name);
      }
    }

    let existing = {};
    try { if (fs.existsSync(PRICES_FILE)) existing = JSON.parse(fs.readFileSync(PRICES_FILE, 'utf8')); } catch {}

    let jsonUpdated = 0;
    for (const skinName of skinNames) {
      const entry = existing[skinName] || { base: {} };
      let changed = false;
      for (const w of wears) {
        // Base
        const hash = skinName + ' (' + w + ')';
        const p = [];
        if (skinportMap[hash] > 0) p.push(skinportMap[hash]);
        if (csgoTmMap[hash] > 0) p.push(csgoTmMap[hash]);
        if (p.length > 0) {
          if (!entry.base) entry.base = {};
          entry.base[w] = Math.round((p.reduce((a, b) => a + b, 0) / p.length) * 100) / 100;
          changed = true;
        }
        // StatTrak
        const stHash = 'StatTrak\u2122 ' + skinName + ' (' + w + ')';
        const sp = [];
        if (skinportMap[stHash] > 0) sp.push(skinportMap[stHash]);
        if (csgoTmMap[stHash] > 0) sp.push(csgoTmMap[stHash]);
        if (sp.length > 0) {
          if (!entry.stattrak) entry.stattrak = {};
          entry.stattrak[w] = Math.round((sp.reduce((a, b) => a + b, 0) / sp.length) * 100) / 100;
          changed = true;
        }
      }
      if (changed) { entry._ts = Date.now(); existing[skinName] = entry; jsonUpdated++; }
    }
    fs.writeFileSync(PRICES_FILE, JSON.stringify(existing, null, 2));
    console.log('[PriceFetcher] prices.json updated: ' + jsonUpdated + ' skins');
  } catch (e) {
    console.log('[PriceFetcher] prices.json write failed: ' + e.message);
  }

  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log('[PriceFetcher] Done in ' + elapsed + 's — ' + written + ' prices written to SQLite');
}

function startPriceRefreshLoop() {
  // Run immediately after 3 seconds (let DB init first)
  setTimeout(() => {
    refreshAllPrices().catch(e => console.error('[PriceFetcher] Error:', e.message));
  }, 3000);

  // Then every 6 hours
  setInterval(() => {
    refreshAllPrices().catch(e => console.error('[PriceFetcher] Error:', e.message));
  }, REFRESH_INTERVAL);
}

module.exports = { refreshAllPrices, startPriceRefreshLoop };
