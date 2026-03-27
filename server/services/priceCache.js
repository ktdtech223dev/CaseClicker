const fetch = require('node-fetch');
const { getDb } = require('../db/database');
const { getSkinPrice, getWearKey } = require('../data/skinPrices');

const STEAM_API_BASE = 'https://steamcommunity.com/market/priceoverview/';
const TTL = 24 * 60 * 60; // 24 hours in seconds

// Rarity-based fallback price ranges (USD)
const FALLBACK_PRICE_RANGES = {
  'Consumer Grade':  { min: 0.03,   max: 0.10 },
  'Industrial Grade': { min: 0.10,  max: 0.50 },
  'Mil-Spec':        { min: 0.50,   max: 5.00 },
  'Restricted':      { min: 2.00,   max: 20.00 },
  'Classified':      { min: 10.00,  max: 80.00 },
  'Covert':          { min: 30.00,  max: 300.00 },
  'Rare Special':    { min: 100.00, max: 5000.00 },
};

// Simple string hash for deterministic seeded randomness
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return hash;
}

// Seeded pseudo-random number between 0 and 1 based on a string
function seededRandom(seed) {
  const h = hashString(seed);
  // Use the hash to generate a float between 0 and 1
  return ((h & 0x7fffffff) % 10000) / 10000;
}

/**
 * Generate a deterministic fallback price based on rarity and skin name.
 * The price is randomized within the rarity range but consistent for the same skin name.
 */
function generateFallbackPrice(rarity, skinName) {
  const range = FALLBACK_PRICE_RANGES[rarity] || { min: 0.10, max: 1.00 };
  const t = seededRandom(skinName || rarity);
  const price = range.min + t * (range.max - range.min);
  return Math.round(price * 100) / 100;
}

// Timestamp of the last Steam API call, used for rate-limit spacing
let lastSteamCallTime = 0;

/**
 * Wait until at least 1 second has passed since the last Steam API call.
 */
async function rateLimitDelay() {
  const now = Date.now();
  const elapsed = now - lastSteamCallTime;
  if (elapsed < 1000) {
    await new Promise(r => setTimeout(r, 1000 - elapsed));
  }
}

async function fetchSteamPrice(marketHashName) {
  try {
    await rateLimitDelay();
    lastSteamCallTime = Date.now();

    const url = `${STEAM_API_BASE}?appid=730&currency=1&market_hash_name=${encodeURIComponent(marketHashName)}`;
    const res = await fetch(url, { timeout: 8000 });
    if (!res.ok) return null;
    const data = await res.json();

    if (!data.success) return null;

    // Prefer median_price for accuracy, fall back to lowest_price
    const priceStr = data.median_price || data.lowest_price;
    if (!priceStr) return null;

    const parsed = parseFloat(priceStr.replace(/[$,]/g, ''));
    if (isNaN(parsed) || parsed <= 0) return null;
    return parsed;
  } catch (e) {
    console.error(`Price fetch failed for ${marketHashName}:`, e.message);
    return null;
  }
}

function getCachedPrice(marketHashName) {
  const db = getDb();
  const row = db.prepare('SELECT price_usd, last_fetched FROM price_cache WHERE market_hash_name = ?').get(marketHashName);
  if (row && (Date.now() / 1000 - row.last_fetched) < TTL) {
    return row.price_usd;
  }
  return null;
}

function getAnyCachedPrice(marketHashName) {
  const db = getDb();
  const row = db.prepare('SELECT price_usd FROM price_cache WHERE market_hash_name = ?').get(marketHashName);
  return row ? row.price_usd : null;
}

function setCachedPrice(marketHashName, price) {
  const db = getDb();
  db.prepare(
    'INSERT OR REPLACE INTO price_cache (market_hash_name, price_usd, last_fetched) VALUES (?, ?, ?)'
  ).run(marketHashName, price, Math.floor(Date.now() / 1000));
}

/**
 * Get the price for a skin.
 * Priority:
 *   1. Try Steam Market API (live price)
 *   2. If API fails, use fresh cache (<24hr)
 *   3. If no fresh cache, use any expired cache
 *   4. Try hardcoded SKIN_PRICES database
 *   5. If nothing else, use deterministic rarity-based fallback
 */
async function getPrice(marketHashName, rarity = 'Mil-Spec') {
  // 1. Try Steam API first for the freshest price
  const steamPrice = await fetchSteamPrice(marketHashName);
  if (steamPrice !== null) {
    setCachedPrice(marketHashName, steamPrice);
    return steamPrice;
  }

  // 2. Steam failed -- check fresh cache
  const freshCached = getCachedPrice(marketHashName);
  if (freshCached !== null) return freshCached;

  // 3. Check expired cache (stale is better than nothing)
  const anyCached = getAnyCachedPrice(marketHashName);
  if (anyCached !== null) return anyCached;

  // 4. Try hardcoded skin prices database
  // Extract wear from market hash name (e.g. "AK-47 | Redline (Field-Tested)")
  const wearMatch = marketHashName.match(/\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)/);
  const wear = wearMatch ? wearMatch[1] : 'Field-Tested';
  const baseName = marketHashName.replace(/\s*\(.*?\)\s*$/, '');
  const hardcodedPrice = getSkinPrice(baseName, wear, rarity);
  if (hardcodedPrice > 0) {
    return hardcodedPrice;
  }

  // 5. No data at all -- deterministic fallback
  return generateFallbackPrice(rarity, marketHashName);
}

/**
 * Batch-refresh prices for items whose cache is stale (>24hr).
 * Called on server startup. Includes 1s delay between API calls.
 */
async function batchRefreshPrices(marketHashNames) {
  const db = getDb();
  const stale = [];
  const now = Math.floor(Date.now() / 1000);

  for (const name of marketHashNames) {
    const row = db.prepare('SELECT last_fetched FROM price_cache WHERE market_hash_name = ?').get(name);
    if (!row || (now - row.last_fetched) >= TTL) {
      stale.push(name);
    }
  }

  const freshCount = marketHashNames.length - stale.length;
  console.log(`Price cache: ${freshCount} fresh, ${stale.length} need refresh`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < stale.length; i++) {
    const price = await fetchSteamPrice(stale[i]);
    if (price !== null) {
      setCachedPrice(stale[i], price);
      successCount++;
    } else {
      failCount++;
    }

    // Log progress every 50 items
    if ((i + 1) % 50 === 0) {
      console.log(`Price refresh progress: ${i + 1}/${stale.length} (${successCount} ok, ${failCount} failed)`);
    }
  }

  console.log(`Price refresh complete: ${successCount} updated, ${failCount} failed out of ${stale.length} stale`);
}

/**
 * Get a price using the skin's embedded price_range data, or fall back to rarity-based defaults.
 * Uses deterministic seeded randomness so the same skin always gets the same fallback price.
 * @param {string} rarity - The skin's rarity tier
 * @param {{ min: number, max: number }} [priceRange] - Optional price range from skin data
 * @param {string} [skinName] - Optional skin name for deterministic seeding
 * @returns {number} A price value in USD
 */
function getFallbackPrice(rarity, priceRange, skinName) {
  if (priceRange && priceRange.min && priceRange.max) {
    // Deterministic price within range, seeded by skin name
    const t = skinName ? seededRandom(skinName) : Math.random();
    return Math.round((priceRange.min + t * (priceRange.max - priceRange.min)) * 100) / 100;
  }
  // Fallback by rarity with deterministic seed
  return generateFallbackPrice(rarity, skinName || rarity);
}

// Legacy flat fallback prices (kept for backward compat, now derived from range midpoints)
const FALLBACK_PRICES = {
  'Consumer Grade': 0.05,
  'Industrial Grade': 0.25,
  'Mil-Spec': 2.00,
  'Restricted': 8.00,
  'Classified': 35.00,
  'Covert': 100.00,
  'Rare Special': 500.00,
};

module.exports = { getPrice, getCachedPrice, setCachedPrice, batchRefreshPrices, FALLBACK_PRICES, getFallbackPrice };
