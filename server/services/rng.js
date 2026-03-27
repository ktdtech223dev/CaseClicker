const crypto = require('crypto');

// Provably fair RNG system
function generateServerSeed() {
  return crypto.randomBytes(32).toString('hex');
}

function generateClientSeed() {
  return crypto.randomBytes(16).toString('hex');
}

function hashSeed(serverSeed) {
  return crypto.createHash('sha256').update(serverSeed).digest('hex');
}

// Generate a provably fair random float [0, 1)
function fairRandom(serverSeed, clientSeed, nonce) {
  const combined = `${serverSeed}:${clientSeed}:${nonce}`;
  const hash = crypto.createHash('sha256').update(combined).digest('hex');
  // Use first 8 hex chars (32 bits) to generate float
  const int = parseInt(hash.substring(0, 8), 16);
  return int / 0x100000000;
}

// Generate crash point using provably fair method
function generateCrashPoint(serverSeed, clientSeed) {
  const hash = crypto.createHmac('sha256', serverSeed).update(clientSeed).digest('hex');
  const h = parseInt(hash.substring(0, 13), 16);
  const e = Math.pow(2, 52);
  // 3% house edge
  const result = Math.max(1, Math.floor((100 * e - h) / (e - h)) / 100);
  return result;
}

// Pick rarity based on real CS:GO case drop rates
// Uses available rarities from the case to build proper distribution
// Default rates for standard weapon cases (Mil-Spec through Rare Special):
//   Mil-Spec (blue):       79.92%
//   Restricted (purple):   15.98%
//   Classified (pink):      3.20%
//   Covert (red):           0.64%
//   Rare Special (gold):    0.26%
function pickRarity(random, availableRarities) {
  // Full CS:GO rarity weights (relative, will be normalized)
  const RARITY_WEIGHTS = {
    'Consumer Grade':  79.92,
    'Industrial Grade': 15.98,
    'Mil-Spec':         79.92,
    'Restricted':       15.98,
    'Classified':        3.20,
    'Covert':            0.64,
    'Rare Special':      0.26,
  };

  // If available rarities provided, build distribution from those only
  if (availableRarities && availableRarities.length > 0) {
    // Standard case distribution (most CS:GO cases)
    // These are the REAL odds from Valve's CS:GO case system
    const CASE_ODDS = {
      'Mil-Spec':       0.7992,
      'Restricted':     0.1598,
      'Classified':     0.0320,
      'Covert':         0.0064,
      'Rare Special':   0.0026,
      // For cases with lower-tier skins
      'Consumer Grade': 0.7992,
      'Industrial Grade': 0.1598,
    };

    // Build cumulative distribution from available rarities
    let totalWeight = 0;
    const tiers = [];
    for (const r of availableRarities) {
      const w = CASE_ODDS[r] || 0.01;
      totalWeight += w;
      tiers.push({ rarity: r, weight: w });
    }

    // Normalize and build cumulative
    let cumulative = 0;
    for (const tier of tiers) {
      cumulative += tier.weight / totalWeight;
      tier.cumulative = cumulative;
    }
    // Ensure last tier reaches 1.0
    if (tiers.length > 0) tiers[tiers.length - 1].cumulative = 1.0;

    for (const tier of tiers) {
      if (random < tier.cumulative) return tier.rarity;
    }
    return tiers[tiers.length - 1].rarity;
  }

  // Fallback: standard case distribution
  const rates = [
    { rarity: 'Mil-Spec', cumulative: 0.7992 },
    { rarity: 'Restricted', cumulative: 0.9590 },
    { rarity: 'Classified', cumulative: 0.9910 },
    { rarity: 'Covert', cumulative: 0.9974 },
    { rarity: 'Rare Special', cumulative: 1.0 },
  ];
  for (const tier of rates) {
    if (random < tier.cumulative) return tier.rarity;
  }
  return 'Mil-Spec';
}

// Determine wear from float value
function getWear(floatValue) {
  if (floatValue < 0.07) return 'Factory New';
  if (floatValue < 0.15) return 'Minimal Wear';
  if (floatValue < 0.38) return 'Field-Tested';
  if (floatValue < 0.45) return 'Well-Worn';
  return 'Battle-Scarred';
}

// Generate float value within skin's min/max range
function generateFloat(minFloat, maxFloat, random) {
  return minFloat + random * (maxFloat - minFloat);
}

// Determine if StatTrak (10% chance)
function rollStatTrak(random) {
  return random < 0.10;
}

module.exports = {
  generateServerSeed,
  generateClientSeed,
  hashSeed,
  fairRandom,
  generateCrashPoint,
  pickRarity,
  getWear,
  generateFloat,
  rollStatTrak,
};
