/**
 * Price Loader — reads prices.json from the price-update script
 * Falls back to hardcoded skinPrices.js if prices.json doesn't exist
 */

const fs = require('fs');
const path = require('path');
const { getSkinPrice: getHardcodedPrice, RARITY_FALLBACK_PRICES } = require('./skinPrices');

const PRICES_FILE = path.join(__dirname, 'prices.json');

let scrapedPrices = {};
let lastLoadTime = 0;

/**
 * Load/reload prices.json (auto-refreshes every 5 min)
 */
function loadPrices() {
  const now = Date.now();
  if (now - lastLoadTime < 5 * 60 * 1000 && Object.keys(scrapedPrices).length > 0) return;

  try {
    if (fs.existsSync(PRICES_FILE)) {
      scrapedPrices = JSON.parse(fs.readFileSync(PRICES_FILE, 'utf8'));
      lastLoadTime = now;
      console.log(`[PriceLoader] Loaded ${Object.keys(scrapedPrices).length} scraped prices`);
    }
  } catch (e) {
    console.error('[PriceLoader] Error loading prices.json:', e.message);
  }
}

// Load on startup
loadPrices();

/**
 * Get wear key from full wear name
 */
function wearKey(wear) {
  const map = {
    'Factory New': 'Factory New',
    'Minimal Wear': 'Minimal Wear',
    'Field-Tested': 'Field-Tested',
    'Well-Worn': 'Well-Worn',
    'Battle-Scarred': 'Battle-Scarred',
  };
  return map[wear] || wear;
}

/**
 * Get the best price for a skin
 * Priority: scraped prices.json > hardcoded skinPrices.js > rarity fallback
 */
function getPrice(skinName, wear, rarity) {
  loadPrices(); // refresh if stale

  const isStatTrak = /StatTrak/i.test(skinName);
  const isSouvenir = /Souvenir/i.test(skinName);
  const baseName = skinName
    .replace(/^StatTrak.?\s*/i, '')
    .replace(/^Souvenir\s*/i, '')
    .trim();

  const w = wearKey(wear || 'Field-Tested');

  // 1. Check scraped prices.json
  const scraped = scrapedPrices[baseName];
  if (scraped) {
    if (isStatTrak && scraped.stattrak?.[w] > 0) return scraped.stattrak[w];
    if (!isStatTrak && !isSouvenir && scraped.base?.[w] > 0) return scraped.base[w];
    // For souvenir, use base * multiplier if no souvenir-specific data
    if (isSouvenir && scraped.base?.[w] > 0) {
      const base = scraped.base[w];
      if (base > 100) return Math.round(base * 3 * 100) / 100;
      if (base > 10) return Math.round(base * 5 * 100) / 100;
      return Math.round(base * 15 * 100) / 100;
    }
  }

  // 2. Fall back to hardcoded prices
  const hardcoded = getHardcodedPrice(skinName, wear, rarity);
  if (hardcoded > 0) return hardcoded;

  // 3. Rarity fallback
  return RARITY_FALLBACK_PRICES[rarity] || 1;
}

/**
 * Get all prices for a skin (for the tooltip/detail view)
 */
function getAllPrices(skinName) {
  loadPrices();

  const baseName = skinName
    .replace(/^StatTrak.?\s*/i, '')
    .replace(/^Souvenir\s*/i, '')
    .trim();

  const wears = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];
  const result = { base: {}, stattrak: {} };

  const scraped = scrapedPrices[baseName];

  for (const w of wears) {
    // Base
    if (scraped?.base?.[w] > 0) {
      result.base[w] = scraped.base[w];
    } else {
      const hp = getHardcodedPrice(baseName, w);
      if (hp > 0) result.base[w] = hp;
    }

    // StatTrak
    if (scraped?.stattrak?.[w] > 0) {
      result.stattrak[w] = scraped.stattrak[w];
    } else {
      const hp = getHardcodedPrice('StatTrak ' + baseName, w);
      if (hp > 0) result.stattrak[w] = hp;
    }
  }

  return result;
}

module.exports = { getPrice, getAllPrices, loadPrices };
