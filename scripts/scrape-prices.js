#!/usr/bin/env node
/**
 * CSGOSKINS.GG Price Scraper
 *
 * Run: node scripts/scrape-prices.js
 *
 * Scrapes real prices from CSGOSKINS.GG for every skin in the game.
 * Outputs server/data/prices.json which the server loads on startup.
 * Run once a day or whenever you want updated prices.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load all skin names from allCases.js
const { getAllMarketHashNames, cases } = require('../server/services/skinData');

const OUTPUT_FILE = path.join(__dirname, '..', 'server', 'data', 'prices.json');
const DELAY_MS = 3000; // 3 seconds between requests to avoid rate limiting
const BASE_URL = 'https://csgoskins.gg/items/';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Convert skin name to CSGOSKINS.GG URL slug
 * "AK-47 | Redline" -> "ak-47-redline"
 */
function skinToSlug(name) {
  return name
    .toLowerCase()
    .replace(/\u2122/g, '') // remove trademark symbol
    .replace(/\s*\|\s*/g, '-')
    .replace(/'/g, '')
    .replace(/\./g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Fetch a page via HTTPS and return the HTML
 */
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchPage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode === 429) {
        resolve(null); // rate limited
        return;
      }
      if (res.statusCode !== 200) {
        resolve(null);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(null));
    req.setTimeout(15000, () => { req.destroy(); resolve(null); });
  });
}

/**
 * Parse prices from CSGOSKINS.GG HTML
 */
function parsePrices(html) {
  if (!html) return null;

  const conditions = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];
  const result = { base: {}, stattrak: {} };

  // Extract the price table section - look for condition names followed by prices
  for (const cond of conditions) {
    // Base price: look for "condition" followed by "$X.XX" or "Not possible"
    const baseRegex = new RegExp(`(?<!StatTrak\\s)${cond.replace('-', '\\-')}[\\s\\S]*?(?:\\$([\\.\\d,]+)|Not possible)`, 'i');
    const stRegex = new RegExp(`StatTrak\\s+${cond.replace('-', '\\-')}[\\s\\S]*?(?:\\$([\\.\\d,]+)|Not possible)`, 'i');

    const baseMatch = html.match(baseRegex);
    if (baseMatch) {
      result.base[cond] = baseMatch[1] ? parseFloat(baseMatch[1].replace(/,/g, '')) : 0;
    }

    const stMatch = html.match(stRegex);
    if (stMatch) {
      result.stattrak[cond] = stMatch[1] ? parseFloat(stMatch[1].replace(/,/g, '')) : 0;
    }
  }

  // Only return if we got at least one price
  const hasBase = Object.values(result.base).some(v => v > 0);
  const hasSt = Object.values(result.stattrak).some(v => v > 0);
  if (!hasBase && !hasSt) return null;

  return result;
}

/**
 * Alternative: Use Steam Market API as fallback
 */
function fetchSteamPrice(marketHashName) {
  const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encodeURIComponent(marketHashName)}`;
  return new Promise((resolve) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    }, (res) => {
      if (res.statusCode !== 200) { resolve(null); return; }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.success) { resolve(null); return; }
          const priceStr = json.median_price || json.lowest_price;
          if (!priceStr) { resolve(null); return; }
          resolve(parseFloat(priceStr.replace(/[$,]/g, '')));
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

/**
 * Build unique skin list from all cases
 */
function buildSkinList() {
  const skins = new Set();
  for (const c of cases) {
    for (const skin of (c.skins || [])) {
      skins.add(skin.name);
    }
    for (const rare of (c.rare_special || [])) {
      // Knives/gloves have format "★ Karambit | Doppler"
      if (rare.name) skins.add(rare.name);
    }
  }
  return [...skins];
}

async function main() {
  console.log('=== CSGOSKINS.GG Price Scraper ===\n');

  // Load existing prices if any
  let existing = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      console.log(`Loaded ${Object.keys(existing).length} existing prices`);
    } catch { }
  }

  const allSkins = buildSkinList();
  console.log(`Found ${allSkins.length} unique skins across all cases\n`);

  // Filter to regular weapon skins (skip knife base names without finishes)
  const weaponSkins = allSkins.filter(name => {
    // Skip bare knife names like "★ Karambit" without a finish
    if (name.startsWith('\u2605') && !name.includes('|')) return false;
    return true;
  });

  console.log(`Scraping ${weaponSkins.length} skins from CSGOSKINS.GG...\n`);

  let scraped = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < weaponSkins.length; i++) {
    const skinName = weaponSkins[i];
    const slug = skinToSlug(skinName);
    const url = BASE_URL + slug;

    // Skip if we already have fresh data (less than 24h old)
    if (existing[skinName] && existing[skinName]._ts) {
      const age = Date.now() - existing[skinName]._ts;
      if (age < 24 * 60 * 60 * 1000) {
        skipped++;
        continue;
      }
    }

    process.stdout.write(`[${i + 1}/${weaponSkins.length}] ${skinName}... `);

    const html = await fetchPage(url);

    if (html === null) {
      // Rate limited or error — try Steam API as fallback
      process.stdout.write('CSGOSKINS blocked, trying Steam... ');
      const wears = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];
      const prices = { base: {}, stattrak: {}, _ts: Date.now(), _src: 'steam' };
      let gotAny = false;

      for (const w of wears) {
        const hashName = `${skinName} (${w})`;
        const price = await fetchSteamPrice(hashName);
        if (price !== null && price > 0) {
          prices.base[w] = price;
          gotAny = true;
        }
        await sleep(1500);
      }

      if (gotAny) {
        existing[skinName] = prices;
        scraped++;
        console.log('OK (Steam)');
      } else {
        failed++;
        console.log('FAILED');
      }

      await sleep(DELAY_MS * 2); // longer delay after rate limit
      continue;
    }

    const prices = parsePrices(html);
    if (prices) {
      prices._ts = Date.now();
      prices._src = 'csgoskins';
      existing[skinName] = prices;
      scraped++;

      const baseStr = Object.entries(prices.base)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => `${k.split(' ').map(w => w[0]).join('')}=$${v}`)
        .join(' ');
      console.log(`OK - ${baseStr}`);
    } else {
      failed++;
      console.log('NO DATA');
    }

    await sleep(DELAY_MS);
  }

  // Save results
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existing, null, 2));

  console.log(`\n=== DONE ===`);
  console.log(`Scraped: ${scraped}`);
  console.log(`Skipped (fresh): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total in database: ${Object.keys(existing).length}`);
  console.log(`Saved to: ${OUTPUT_FILE}`);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
