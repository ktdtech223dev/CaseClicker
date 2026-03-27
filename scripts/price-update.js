#!/usr/bin/env node
/**
 * CS2 Price Scraper v6 — Bulk-First Edition
 * ==========================================
 * Run:  node scripts/price-update.js
 *
 * Strategy: Fetch BULK databases first (1 request = ALL items), then
 * per-skin scrape only for gaps. Finishes in minutes, not hours.
 *
 * Phase 1 — BULK (2 requests total, ~10 seconds):
 *   1. Skinport API       — ALL items, suggested/min/max/median prices
 *   2. CSGO.TM API        — ALL items, market price + volume
 *
 * Phase 2 — PER-SKIN (only for items missing from bulk):
 *   3. CSGOSKINS.GG       — 1 page = all wears + StatTrak + Souvenir
 *   4. Steam Market       — fallback, only when everything else fails
 *
 * Covers: ALL skins, knives, gloves, stickers, cases in the game
 * Estimation fills any remaining gaps via wear depreciation curves
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '..', 'server', 'data', 'prices.json');
const GG_DELAY = 1500;
const STEAM_DELAY = 3500;

// ========================== HELPERS ==========================

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function log(msg) { process.stdout.write(msg); }
function logln(msg) { console.log(msg); }

function fetchJSON(url, headers = {}) {
  return new Promise((resolve) => {
    const h = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'application/json,text/html,*/*',
      ...headers,
    };
    const req = https.get(url, { headers: h }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchJSON(res.headers.location, headers).then(resolve); return;
      }
      if (res.statusCode === 429) { resolve({ _rateLimit: true }); return; }
      if (res.statusCode !== 200) { resolve(null); return; }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(30000, () => { req.destroy(); resolve(null); });
  });
}

function fetchHTML(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchHTML(res.headers.location).then(resolve); return;
      }
      if (res.statusCode === 429) { resolve('_RATELIMIT_'); return; }
      if (res.statusCode !== 200) { resolve(null); return; }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(null));
  });
}

// ========================== BULK SOURCE 1: SKINPORT ==========================
// 1 request = ALL CS2 items with suggested_price, min, max, median

async function fetchSkinportBulk() {
  logln('  [Skinport] Fetching all items...');
  const data = await fetchJSON('https://api.skinport.com/v1/items?app_id=730&currency=USD');
  if (!data || !Array.isArray(data)) { logln('  [Skinport] FAILED'); return {}; }

  const map = {};
  for (const item of data) {
    if (!item.market_hash_name || !item.suggested_price) continue;
    map[item.market_hash_name] = {
      price: item.suggested_price,
      min: item.min_price || 0,
      max: item.max_price || 0,
      median: item.median_price || 0,
    };
  }
  logln('  [Skinport] Got ' + Object.keys(map).length + ' items');
  return map;
}

// ========================== BULK SOURCE 2: CSGO.TM ==========================
// 1 request = ALL CS2 items with price + volume

async function fetchCsgoTmBulk() {
  logln('  [CSGO.TM] Fetching all items...');
  const data = await fetchJSON('https://market.csgo.com/api/v2/prices/USD.json');
  if (!data || !data.items) { logln('  [CSGO.TM] FAILED'); return {}; }

  const map = {};
  for (const item of data.items) {
    if (!item.market_hash_name || !item.price) continue;
    map[item.market_hash_name] = {
      price: item.price,
      volume: item.volume || 0,
    };
  }
  logln('  [CSGO.TM] Got ' + Object.keys(map).length + ' items');
  return map;
}

// ========================== PARSE BULK INTO SKIN PRICES ==========================

function parseBulkForSkin(skinName, skinportMap, csgoTmMap, itemType) {
  const wears = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];
  const result = { base: {}, stattrak: {}, souvenir: {} };
  let anyData = false;

  if (itemType === 'sticker' || itemType === 'case') {
    const prices = [];
    const sp = skinportMap[skinName];
    const tm = csgoTmMap[skinName];
    if (sp && sp.price > 0) prices.push(sp.price);
    if (tm && tm.price > 0) prices.push(tm.price);
    if (prices.length > 0) {
      result.base['Field-Tested'] = Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100;
      return result;
    }
    return null;
  }

  for (const w of wears) {
    const hashName = skinName + ' (' + w + ')';
    const prices = [];

    // Base
    const sp = skinportMap[hashName];
    const tm = csgoTmMap[hashName];
    if (sp && sp.price > 0) prices.push(sp.price);
    if (tm && tm.price > 0) prices.push(tm.price);
    if (prices.length > 0) {
      result.base[w] = Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100;
      anyData = true;
    }

    // StatTrak
    const stHash = 'StatTrak\u2122 ' + skinName + ' (' + w + ')';
    const stPrices = [];
    const stSp = skinportMap[stHash];
    const stTm = csgoTmMap[stHash];
    if (stSp && stSp.price > 0) stPrices.push(stSp.price);
    if (stTm && stTm.price > 0) stPrices.push(stTm.price);
    if (stPrices.length > 0) {
      result.stattrak[w] = Math.round((stPrices.reduce((a, b) => a + b, 0) / stPrices.length) * 100) / 100;
      anyData = true;
    }

    // Souvenir
    const svHash = 'Souvenir ' + skinName + ' (' + w + ')';
    const svPrices = [];
    const svSp = skinportMap[svHash];
    const svTm = csgoTmMap[svHash];
    if (svSp && svSp.price > 0) svPrices.push(svSp.price);
    if (svTm && svTm.price > 0) svPrices.push(svTm.price);
    if (svPrices.length > 0) {
      result.souvenir[w] = Math.round((svPrices.reduce((a, b) => a + b, 0) / svPrices.length) * 100) / 100;
      anyData = true;
    }
  }

  if (!anyData) return null;
  if (!Object.values(result.stattrak).some(v => v > 0)) delete result.stattrak;
  if (!Object.values(result.souvenir).some(v => v > 0)) delete result.souvenir;
  return result;
}

// ========================== PER-SKIN: CSGOSKINS.GG ==========================

let ggDelay = GG_DELAY;

function skinToSlug(name) {
  return name.toLowerCase()
    .replace(/\u2605\s*/g, '').replace(/\u2122/g, '')
    .replace(/\s*\|\s*/g, '-').replace(/'/g, '').replace(/\./g, '')
    .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function parseGGPage(html) {
  if (!html || typeof html !== 'string') return null;
  const conditions = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];
  const result = { base: {}, stattrak: {}, souvenir: {} };
  const lines = html.replace(/<[^>]*>/g, '\n').split('\n').map(l => l.trim()).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    for (const cond of conditions) {
      if (lines[i] === 'Souvenir ' + cond) {
        const n = lines[i + 1];
        if (n === 'Not possible') result.souvenir[cond] = 0;
        else if (n && n.startsWith('$')) result.souvenir[cond] = parseFloat(n.replace(/[$,]/g, ''));
      } else if (lines[i] === 'StatTrak ' + cond) {
        const n = lines[i + 1];
        if (n === 'Not possible') result.stattrak[cond] = 0;
        else if (n && n.startsWith('$')) result.stattrak[cond] = parseFloat(n.replace(/[$,]/g, ''));
      } else if (lines[i] === cond) {
        const prev = i > 0 ? lines[i - 1] : '';
        if (!prev.includes('StatTrak') && !prev.includes('Souvenir')) {
          const n = lines[i + 1];
          if (n === 'Not possible') result.base[cond] = 0;
          else if (n && n.startsWith('$')) result.base[cond] = parseFloat(n.replace(/[$,]/g, ''));
        }
      }
    }
  }

  const hasBase = Object.values(result.base).some(v => v > 0);
  const hasST = Object.values(result.stattrak).some(v => v > 0);
  const hasSov = Object.values(result.souvenir).some(v => v > 0);
  if (!hasBase && !hasST && !hasSov) return null;
  if (!hasST) delete result.stattrak;
  if (!hasSov) delete result.souvenir;
  return result;
}

async function fetchGGPrices(skinName) {
  const slug = skinToSlug(skinName);
  for (let attempt = 0; attempt < 2; attempt++) {
    const html = await fetchHTML('https://csgoskins.gg/items/' + slug);
    if (html === '_RATELIMIT_') {
      ggDelay = Math.min(ggDelay * 2, 20000);
      log('[gg-429,' + Math.round(ggDelay / 1000) + 's] ');
      await sleep(ggDelay);
      continue;
    }
    ggDelay = GG_DELAY;
    const parsed = parseGGPage(html);
    if (parsed) return parsed;
    if (attempt < 1) await sleep(2000);
  }
  return null;
}

// ========================== PER-SKIN: STEAM MARKET ==========================

let steamDelay = STEAM_DELAY;

async function fetchSteamPrice(marketHashName) {
  const url = 'https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=' + encodeURIComponent(marketHashName);
  const data = await fetchJSON(url);
  if (data && data._rateLimit) {
    steamDelay = Math.min(steamDelay * 2, 45000);
    return null;
  }
  steamDelay = STEAM_DELAY;
  if (!data || !data.success) return null;
  const priceStr = data.median_price || data.lowest_price;
  if (!priceStr) return null;
  const price = parseFloat(priceStr.replace(/[$,]/g, ''));
  return isNaN(price) || price <= 0 ? null : price;
}

async function getSteamFT(skinName) {
  // Only fetch FT — minimal calls, just to get an anchor price
  const p = await fetchSteamPrice(skinName + ' (Field-Tested)');
  if (!p) return null;
  return { base: { 'Field-Tested': p } };
}

// ========================== WEAR ESTIMATION CURVES ==========================

const WEAR_CURVES = {
  knife:  { 'Factory New': 1.00, 'Minimal Wear': 0.92, 'Field-Tested': 0.85, 'Well-Worn': 0.80, 'Battle-Scarred': 0.75 },
  glove:  { 'Factory New': 1.00, 'Minimal Wear': 0.90, 'Field-Tested': 0.80, 'Well-Worn': 0.72, 'Battle-Scarred': 0.65 },
  high:   { 'Factory New': 1.00, 'Minimal Wear': 0.55, 'Field-Tested': 0.35, 'Well-Worn': 0.30, 'Battle-Scarred': 0.28 },
  mid:    { 'Factory New': 1.00, 'Minimal Wear': 0.45, 'Field-Tested': 0.25, 'Well-Worn': 0.20, 'Battle-Scarred': 0.18 },
  low:    { 'Factory New': 1.00, 'Minimal Wear': 0.35, 'Field-Tested': 0.15, 'Well-Worn': 0.12, 'Battle-Scarred': 0.10 },
};

function getCurveType(rarity, type) {
  if (type === 'knife') return 'knife';
  if (type === 'glove') return 'glove';
  if (['Covert', 'Classified', 'Rare Special'].includes(rarity)) return 'high';
  if (rarity === 'Restricted') return 'mid';
  return 'low';
}

function fillMissingWears(priceObj, rarity, type) {
  const wears = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];
  const curve = WEAR_CURVES[getCurveType(rarity, type)];

  for (const variant of ['base', 'stattrak', 'souvenir']) {
    if (!priceObj[variant]) continue;
    const known = {};
    for (const w of wears) {
      if (typeof priceObj[variant][w] === 'number' && priceObj[variant][w] > 0) known[w] = priceObj[variant][w];
    }
    if (Object.keys(known).length === 0 || Object.keys(known).length >= 4) continue;

    let anchorWear = null, anchorPrice = 0;
    for (const w of ['Field-Tested', 'Minimal Wear', 'Factory New', 'Well-Worn', 'Battle-Scarred']) {
      if (known[w] > 0) { anchorWear = w; anchorPrice = known[w]; break; }
    }
    if (!anchorWear) continue;

    const fnEquiv = anchorPrice / curve[anchorWear];
    for (const w of wears) {
      if (!known[w]) {
        const est = Math.round(fnEquiv * curve[w] * 100) / 100;
        if (est > 0) priceObj[variant][w] = est;
      }
    }
  }
  return priceObj;
}

// ========================== MERGE PRICES ==========================

function mergePrices(...sources) {
  const wears = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];
  const result = { base: {}, stattrak: {}, souvenir: {} };

  for (const w of wears) {
    const bv = sources.map(s => s && s.base && s.base[w]).filter(p => p > 0);
    if (bv.length > 0) result.base[w] = Math.round((bv.reduce((a, b) => a + b, 0) / bv.length) * 100) / 100;

    const sv = sources.map(s => s && s.stattrak && s.stattrak[w]).filter(p => p > 0);
    if (sv.length > 0) result.stattrak[w] = Math.round((sv.reduce((a, b) => a + b, 0) / sv.length) * 100) / 100;

    const ov = sources.map(s => s && s.souvenir && s.souvenir[w]).filter(p => p > 0);
    if (ov.length > 0) result.souvenir[w] = Math.round((ov.reduce((a, b) => a + b, 0) / ov.length) * 100) / 100;
  }

  if (!Object.values(result.stattrak).some(v => v > 0)) delete result.stattrak;
  if (!Object.values(result.souvenir).some(v => v > 0)) delete result.souvenir;
  return result;
}

// ========================== SKIN LIST BUILDER ==========================

function buildSkinList() {
  const { cases: allCases } = require('../server/services/skinData');
  const skins = new Map();

  for (const c of allCases) {
    for (const skin of (c.skins || [])) {
      if (!skins.has(skin.name)) skins.set(skin.name, { rarity: skin.rarity, type: 'skin' });
    }
    for (const rare of (c.rare_special || [])) {
      if (rare.name && rare.name.includes('|')) {
        if (!skins.has(rare.name)) {
          skins.set(rare.name, {
            rarity: 'Rare Special',
            type: (rare.name.includes('Gloves') || rare.name.includes('Wraps')) ? 'glove' : 'knife',
          });
        }
      }
    }
    if (c.type === 'sticker_capsule') {
      for (const skin of (c.skins || [])) {
        if (!skins.has(skin.name)) skins.set(skin.name, { rarity: skin.rarity, type: 'sticker' });
      }
    }
    if (!skins.has(c.name)) skins.set(c.name, { rarity: 'Case', type: 'case', price: c.price });
  }

  return skins;
}

// ========================== MAIN ==========================

async function main() {
  console.log('');
  console.log('  ================================================================');
  console.log('  CS2 Price Scraper v6 — Bulk-First Edition');
  console.log('  Phase 1: Skinport + CSGO.TM bulk (2 requests, ~10 sec)');
  console.log('  Phase 2: CSGOSKINS.GG per-skin (gaps only)');
  console.log('  Phase 3: Steam Market (last resort, skips if throttled)');
  console.log('  + Wear estimation for any remaining gaps');
  console.log('  ================================================================');
  console.log('');

  // Load existing data
  let priceDB = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      priceDB = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      logln('Resumed: ' + Object.keys(priceDB).length + ' existing prices loaded\n');
    } catch { }
  }

  const skinMap = buildSkinList();
  logln('Found ' + skinMap.size + ' items to price\n');

  // ==================== PHASE 1: BULK FETCH ====================
  logln('--- PHASE 1: Bulk Fetch (2 requests) ---\n');
  const skinportMap = await fetchSkinportBulk();
  await sleep(1000);
  const csgoTmMap = await fetchCsgoTmBulk();

  const bulkTotal = Object.keys(skinportMap).length + Object.keys(csgoTmMap).length;
  logln('\nBulk databases loaded: ' + bulkTotal + ' total entries\n');

  // ==================== PHASE 2: Process each skin ====================
  logln('--- PHASE 2: Match + Gap Fill ---\n');

  const rarityOrder = ['Rare Special', 'Covert', 'Classified', 'Restricted', 'Mil-Spec', 'Industrial Grade', 'Consumer Grade', 'Case'];
  const sorted = [...skinMap.entries()].sort((a, b) =>
    rarityOrder.indexOf(a[1].rarity) - rarityOrder.indexOf(b[1].rarity)
  );

  let bulkHits = 0, ggHits = 0, steamHits = 0, estimated = 0, failed = 0, skipped = 0;
  const total = sorted.length;
  const startTime = Date.now();
  let ggCallCount = 0;

  for (let i = 0; i < total; i++) {
    const [skinName, info] = sorted[i];

    // Skip fresh (<24hr)
    if (priceDB[skinName] && priceDB[skinName]._ts && (Date.now() - priceDB[skinName]._ts) < 24 * 60 * 60 * 1000) {
      skipped++;
      continue;
    }

    const pct = Math.round((i / total) * 100);
    log('[' + pct + '%] [' + (i + 1) + '/' + total + '] ' + skinName + '... ');

    const sources = [];

    // --- Try bulk data first (instant, no API call) ---
    const bulkResult = parseBulkForSkin(skinName, skinportMap, csgoTmMap, info.type);
    if (bulkResult) {
      sources.push(bulkResult);
      bulkHits++;
      log('BULK ');
    }

    // --- Always try CSGOSKINS.GG (gets ST + Souvenir that bulk misses) ---
    if (info.type !== 'sticker' && info.type !== 'case') {
      try {
        const gg = await fetchGGPrices(skinName);
        if (gg) { sources.push(gg); ggHits++; log('GG '); }
        else log('gg- ');
        ggCallCount++;
      } catch { log('gg-err '); }
      await sleep(ggDelay);
    }

    // --- Steam as backup if we still have nothing ---
    if (sources.length === 0 && steamDelay < 10000) {
      try {
        const stm = await getSteamFT(skinName);
        if (stm) { sources.push(stm); steamHits++; log('STM '); }
        else log('stm- ');
      } catch { log('stm-err '); }
      await sleep(steamDelay);
    } else if (sources.length === 0) {
      log('skip-throttled ');
    }

    // --- Merge + estimate gaps ---
    if (sources.length > 0) {
      const merged = mergePrices(...sources);
      const beforeCount = Object.values(merged.base || {}).filter(v => v > 0).length;
      fillMissingWears(merged, info.rarity, info.type);
      const estCount = Object.values(merged.base || {}).filter(v => v > 0).length - beforeCount;
      if (estCount > 0) estimated += estCount;

      // Also estimate StatTrak from base if we have base but no ST
      if (!merged.stattrak && merged.base) {
        const ftBase = merged.base['Field-Tested'] || merged.base['Minimal Wear'] || 0;
        if (ftBase > 0 && info.type !== 'sticker' && info.type !== 'case') {
          const mult = ftBase > 500 ? 1.5 : ftBase > 100 ? 2.0 : ftBase > 20 ? 2.5 : 3.0;
          merged.stattrak = {};
          for (const [w, p] of Object.entries(merged.base)) {
            if (typeof p === 'number' && p > 0) {
              merged.stattrak[w] = Math.round(p * mult * 100) / 100;
            }
          }
        }
      }

      merged._ts = Date.now();
      merged._sources = sources.length;
      merged._rarity = info.rarity;
      merged._type = info.type;
      priceDB[skinName] = merged;

      const basePrices = Object.entries(merged.base || {})
        .filter(([, v]) => typeof v === 'number' && v > 0)
        .map(([k, v]) => k.substring(0, 2) + '=$' + v)
        .join(' ');
      const stCount = merged.stattrak ? Object.values(merged.stattrak).filter(v => typeof v === 'number' && v > 0).length : 0;
      logln('OK ' + basePrices + (stCount > 0 ? ' +' + stCount + 'ST' : '') + (estCount > 0 ? ' ~' + estCount + 'est' : ''));
    } else {
      failed++;
      logln('NO DATA');
    }

    // Auto-save every 25 skins
    if ((i + 1) % 25 === 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(priceDB, null, 2));
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      logln('  >> Saved ' + Object.keys(priceDB).length + ' [' + Math.floor(elapsed / 60) + 'm ' + (elapsed % 60) + 's] GG calls: ' + ggCallCount);
    }
  }

  // Final save
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(priceDB, null, 2));

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const totalPriced = Object.keys(priceDB).length;
  const withST = Object.values(priceDB).filter(p => p.stattrak && Object.values(p.stattrak).some(v => typeof v === 'number' && v > 0)).length;
  const withSov = Object.values(priceDB).filter(p => p.souvenir && Object.values(p.souvenir).some(v => typeof v === 'number' && v > 0)).length;

  console.log('');
  console.log('  ================================================================');
  console.log('  COMPLETE in ' + Math.floor(elapsed / 60) + 'm ' + (elapsed % 60) + 's');
  console.log('  ---- Source Hits ----');
  console.log('  Bulk (Skinport+TM): ' + bulkHits);
  console.log('  CSGOSKINS.GG:       ' + ggHits + ' (' + ggCallCount + ' calls)');
  console.log('  Steam Market:       ' + steamHits);
  console.log('  Estimated wears:    ' + estimated);
  console.log('  Skipped (fresh):    ' + skipped);
  console.log('  Failed:             ' + failed);
  console.log('  ---- Results ----');
  console.log('  Total priced:       ' + totalPriced);
  console.log('  With StatTrak:      ' + withST);
  console.log('  With Souvenir:      ' + withSov);
  console.log('  Output: ' + OUTPUT_FILE);
  console.log('  ================================================================');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
