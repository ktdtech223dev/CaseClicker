// ============================================================================
// CS:GO Complete Case & Skin Database
// ============================================================================
// Contains ALL CS:GO weapon cases, sticker capsules, souvenir packages,
// and the complete knife/glove pool. Each case includes real CS:GO skin names
// with proper rarity distribution.
// ============================================================================

// ---------------------------------------------------------------------------
// KNIFE DEFINITIONS - All CS:GO knife types with finish variants
// ---------------------------------------------------------------------------
const KNIFE_TYPES = [
  { name: '★ Karambit', min_float: 0.00, max_float: 1.00 },
  { name: '★ M9 Bayonet', min_float: 0.00, max_float: 1.00 },
  { name: '★ Bayonet', min_float: 0.00, max_float: 1.00 },
  { name: '★ Butterfly Knife', min_float: 0.00, max_float: 1.00 },
  { name: '★ Huntsman Knife', min_float: 0.00, max_float: 1.00 },
  { name: '★ Falchion Knife', min_float: 0.00, max_float: 1.00 },
  { name: '★ Flip Knife', min_float: 0.00, max_float: 1.00 },
  { name: '★ Gut Knife', min_float: 0.00, max_float: 1.00 },
  { name: '★ Shadow Daggers', min_float: 0.00, max_float: 1.00 },
  { name: '★ Bowie Knife', min_float: 0.00, max_float: 1.00 },
  { name: '★ Navaja Knife', min_float: 0.00, max_float: 1.00 },
  { name: '★ Stiletto Knife', min_float: 0.00, max_float: 1.00 },
  { name: '★ Talon Knife', min_float: 0.00, max_float: 1.00 },
  { name: '★ Ursus Knife', min_float: 0.00, max_float: 1.00 },
  { name: '★ Classic Knife', min_float: 0.00, max_float: 1.00 },
  { name: '★ Paracord Knife', min_float: 0.00, max_float: 1.00 },
  { name: '★ Survival Knife', min_float: 0.00, max_float: 1.00 },
  { name: '★ Nomad Knife', min_float: 0.00, max_float: 1.00 },
  { name: '★ Skeleton Knife', min_float: 0.00, max_float: 1.00 },
  { name: '★ Kukri Knife', min_float: 0.00, max_float: 1.00 },
];

// Knife finish patterns available on most knives
const KNIFE_FINISHES = [
  'Doppler', 'Marble Fade', 'Tiger Tooth', 'Fade', 'Crimson Web',
  'Slaughter', 'Case Hardened', 'Blue Steel', 'Vanilla', 'Lore',
  'Autotronic', 'Gamma Doppler', 'Bright Water', 'Freehand',
  'Rust Coat', 'Night', 'Ultraviolet', 'Damascus Steel', 'Stained',
  'Urban Masked', 'Boreal Forest', 'Forest DDPAT', 'Safari Mesh',
  'Scorched', 'Black Laminate',
];

// ---------------------------------------------------------------------------
// GLOVE DEFINITIONS - All CS:GO glove types with finish variants
// ---------------------------------------------------------------------------
const GLOVE_TYPES = [
  { name: '★ Sport Gloves', min_float: 0.06, max_float: 1.00 },
  { name: '★ Specialist Gloves', min_float: 0.06, max_float: 1.00 },
  { name: '★ Driver Gloves', min_float: 0.06, max_float: 1.00 },
  { name: '★ Hand Wraps', min_float: 0.06, max_float: 1.00 },
  { name: '★ Moto Gloves', min_float: 0.06, max_float: 1.00 },
  { name: '★ Hydra Gloves', min_float: 0.06, max_float: 1.00 },
  { name: '★ Broken Fang Gloves', min_float: 0.06, max_float: 1.00 },
];

const GLOVE_FINISHES = [
  // Sport Gloves
  'Pandora\'s Box', 'Hedge Maze', 'Superconductor', 'Arid', 'Vice', 'Omega', 'Amphibious', 'Bronze Morph', 'Scarlet Shamagh', 'Nocts', 'Slingshot',
  // Specialist Gloves
  'Crimson Kimono', 'Emerald Web', 'Fade', 'Mogul', 'Foundation', 'Crimson Web', 'Forest DDPAT', 'Buckshot', 'Tiger Strike', 'Marble Fade', 'Lt. Commander',
  // Driver Gloves
  'King Snake', 'Imperial Plaid', 'Crimson Weave', 'Diamondback', 'Lunar Weave', 'Convoy', 'Racing Green', 'Overtake', 'Queen Jaguar', 'Snow Leopard', 'Black Tie', 'Rezan the Red',
  // Hand Wraps
  'Cobalt Skulls', 'Overprint', 'Slaughter', 'Leather', 'Spruce DDPAT', 'Badlands', 'Duct Tape', 'Arboreal', 'Giraffe', 'Cashmere', 'Desert Shamagh', 'CAUTION!',
  // Moto Gloves
  'Spearmint', 'Cool Mint', 'Boom!', 'Eclipse', 'Transport', 'Polygon', 'Turtle', 'POW!', 'Finish Line', 'Blood Pressure', 'Smoke Out', '3rd Commando Company',
  // Hydra Gloves
  'Case Hardened', 'Emerald', 'Rattler', 'Mangrove',
  // Broken Fang Gloves
  'Yellow-banded', 'Unhinged', 'Needle Point', 'Jade',
];

// ---------------------------------------------------------------------------
// KNIFE FINISH PRICES - Market-accurate price ranges (USD) per finish
// ---------------------------------------------------------------------------
const KNIFE_FINISH_PRICES = {
  // Doppler variants -- base prices before knife multiplier
  'Doppler': { min: 130, max: 500 },
  'Doppler Ruby': { min: 1500, max: 8000 },
  'Doppler Sapphire': { min: 1500, max: 8000 },
  'Doppler Black Pearl': { min: 800, max: 4000 },
  'Doppler Phase 1': { min: 130, max: 400 },
  'Doppler Phase 2': { min: 160, max: 500 },
  'Doppler Phase 3': { min: 120, max: 380 },
  'Doppler Phase 4': { min: 150, max: 480 },
  // Gamma Doppler variants
  'Gamma Doppler': { min: 140, max: 550 },
  'Gamma Doppler Emerald': { min: 1200, max: 7000 },
  // High-tier finishes
  'Marble Fade': { min: 200, max: 2000 },
  'Tiger Tooth': { min: 150, max: 800 },
  'Fade': { min: 200, max: 3000 },
  'Crimson Web': { min: 100, max: 1500 },
  'Slaughter': { min: 100, max: 600 },
  'Case Hardened': { min: 100, max: 2000 },
  'Lore': { min: 200, max: 1500 },
  'Autotronic': { min: 100, max: 500 },
  // Mid-tier finishes
  'Vanilla': { min: 80, max: 800 },
  'Blue Steel': { min: 70, max: 280 },
  'Black Laminate': { min: 80, max: 350 },
  'Bright Water': { min: 70, max: 220 },
  'Freehand': { min: 55, max: 180 },
  'Night': { min: 60, max: 400 },
  'Ultraviolet': { min: 60, max: 350 },
  'Damascus Steel': { min: 65, max: 260 },
  // Low-tier finishes
  'Rust Coat': { min: 45, max: 180 },
  'Stained': { min: 45, max: 175 },
  'Urban Masked': { min: 35, max: 130 },
  'Boreal Forest': { min: 35, max: 130 },
  'Forest DDPAT': { min: 35, max: 130 },
  'Safari Mesh': { min: 30, max: 100 },
  'Scorched': { min: 30, max: 100 },
};

// Knife-specific price multipliers (some knives are more valuable)
const KNIFE_PRICE_MULTIPLIERS = {
  '★ Butterfly Knife': 2.5,   // Most expensive
  '★ Karambit': 2.0,
  '★ M9 Bayonet': 1.5,
  '★ Talon Knife': 1.3,
  '★ Skeleton Knife': 1.1,
  '★ Bayonet': 1.0,           // Baseline
  '★ Kukri Knife': 0.95,
  '★ Huntsman Knife': 0.85,
  '★ Stiletto Knife': 0.8,
  '★ Classic Knife': 0.75,
  '★ Flip Knife': 0.7,        // Budget tier
  '★ Bowie Knife': 0.65,
  '★ Ursus Knife': 0.65,
  '★ Falchion Knife': 0.6,
  '★ Paracord Knife': 0.55,
  '★ Survival Knife': 0.55,
  '★ Nomad Knife': 0.55,
  '★ Shadow Daggers': 0.5,
  '★ Navaja Knife': 0.5,
  '★ Gut Knife': 0.5,         // Cheapest
};

// Glove finish prices
const GLOVE_FINISH_PRICES = {
  "Pandora's Box": { min: 1000, max: 8000 },
  'Hedge Maze': { min: 400, max: 2000 },
  'Superconductor': { min: 400, max: 2000 },
  'Vice': { min: 300, max: 1500 },
  'Crimson Kimono': { min: 500, max: 3000 },
  'Emerald Web': { min: 300, max: 1500 },
  'Fade': { min: 500, max: 3000 },
  'King Snake': { min: 300, max: 1500 },
  'Crimson Weave': { min: 200, max: 1000 },
  'Cobalt Skulls': { min: 200, max: 800 },
  'Spearmint': { min: 500, max: 3000 },
  'Cool Mint': { min: 200, max: 1000 },
  // Default for unlisted finishes
  'default': { min: 80, max: 500 },
};

// Rarity-based price ranges for regular skins
const RARITY_PRICE_RANGES = {
  'Consumer Grade': { min: 0.03, max: 0.50 },
  'Industrial Grade': { min: 0.10, max: 2.00 },
  'Mil-Spec': { min: 0.50, max: 8.00 },
  'Restricted': { min: 2.00, max: 25.00 },
  'Classified': { min: 8.00, max: 100.00 },
  'Covert': { min: 25.00, max: 500.00 },
};

// ---------------------------------------------------------------------------
// Knife pools per case era
// ---------------------------------------------------------------------------
const CLASSIC_KNIVES = KNIFE_TYPES.filter(k =>
  ['★ Karambit', '★ M9 Bayonet', '★ Bayonet', '★ Flip Knife', '★ Gut Knife'].includes(k.name)
);

const HUNTSMAN_KNIVES = [
  ...CLASSIC_KNIVES,
  KNIFE_TYPES.find(k => k.name === '★ Huntsman Knife'),
];

const CHROMA_KNIVES = [
  ...CLASSIC_KNIVES,
  KNIFE_TYPES.find(k => k.name === '★ Butterfly Knife'),
  KNIFE_TYPES.find(k => k.name === '★ Huntsman Knife'),
  KNIFE_TYPES.find(k => k.name === '★ Falchion Knife'),
];

const SHADOW_KNIVES = [
  KNIFE_TYPES.find(k => k.name === '★ Shadow Daggers'),
  KNIFE_TYPES.find(k => k.name === '★ Falchion Knife'),
  KNIFE_TYPES.find(k => k.name === '★ Bowie Knife'),
];

const GAMMA_KNIVES = CLASSIC_KNIVES;

const SPECTRUM_KNIVES = [
  KNIFE_TYPES.find(k => k.name === '★ Butterfly Knife'),
  KNIFE_TYPES.find(k => k.name === '★ Huntsman Knife'),
  KNIFE_TYPES.find(k => k.name === '★ Falchion Knife'),
  KNIFE_TYPES.find(k => k.name === '★ Bowie Knife'),
  KNIFE_TYPES.find(k => k.name === '★ Shadow Daggers'),
];

const CLUTCH_KNIVES = [
  KNIFE_TYPES.find(k => k.name === '★ Navaja Knife'),
  KNIFE_TYPES.find(k => k.name === '★ Stiletto Knife'),
  KNIFE_TYPES.find(k => k.name === '★ Talon Knife'),
  KNIFE_TYPES.find(k => k.name === '★ Ursus Knife'),
];

const HORIZON_KNIVES = CLUTCH_KNIVES;

const DANGER_ZONE_KNIVES = [
  KNIFE_TYPES.find(k => k.name === '★ Classic Knife'),
  KNIFE_TYPES.find(k => k.name === '★ Paracord Knife'),
  KNIFE_TYPES.find(k => k.name === '★ Survival Knife'),
  KNIFE_TYPES.find(k => k.name === '★ Nomad Knife'),
  KNIFE_TYPES.find(k => k.name === '★ Skeleton Knife'),
];

const PRISMA_KNIVES = CLASSIC_KNIVES;

const REVOLUTION_KNIVES = [
  KNIFE_TYPES.find(k => k.name === '★ Kukri Knife'),
  ...CLASSIC_KNIVES,
];

const KILOWATT_KNIVES = [
  KNIFE_TYPES.find(k => k.name === '★ Kukri Knife'),
  ...CLASSIC_KNIVES,
];

// Glove pool for glove cases - generates glove + finish combinations with prices
const GLOVE_POOL = (() => {
  const specials = [];
  for (const glove of GLOVE_TYPES) {
    // Pick 3-5 random finishes per glove type
    const finishes = [...GLOVE_FINISHES].sort(() => Math.random() - 0.5).slice(0, 4);
    for (const finish of finishes) {
      const priceRange = GLOVE_FINISH_PRICES[finish] || GLOVE_FINISH_PRICES['default'];
      specials.push({
        name: `${glove.name} | ${finish}`,
        rarity: 'Rare Special',
        min_float: glove.min_float,
        max_float: glove.max_float,
        image_id: '',
        price_range: {
          min: priceRange.min,
          max: priceRange.max,
        },
      });
    }
  }
  return specials;
})();

// Helper to build rare_special entries from a knife pool with finish + price data
function buildRareSpecial(pool) {
  const specials = [];
  for (const knife of pool.filter(Boolean)) {
    // Pick 3-5 random finishes per knife for this case
    const finishes = [...KNIFE_FINISHES].sort(() => Math.random() - 0.5).slice(0, 4);
    for (const finish of finishes) {
      const priceRange = KNIFE_FINISH_PRICES[finish] || { min: 50, max: 300 };
      const multiplier = KNIFE_PRICE_MULTIPLIERS[knife.name] || 1.0;
      specials.push({
        name: finish === 'Vanilla' ? knife.name : `${knife.name} | ${finish}`,
        rarity: 'Rare Special',
        min_float: knife.min_float,
        max_float: knife.max_float,
        image_id: '',
        price_range: {
          min: Math.round(priceRange.min * multiplier),
          max: Math.round(priceRange.max * multiplier),
        },
      });
    }
  }
  return specials;
}

// ============================================================================
// ALL CASES
// ============================================================================
const cases = [

  // ==========================================================================
  // 1. CS:GO WEAPON CASE
  // ==========================================================================
  {
    id: 'csgo_weapon_case',
    name: 'CS:GO Weapon Case',
    type: 'weapon_case',
    price: 12.00,
    image: '',
    skins: [
      { name: 'AK-47 | Case Hardened', rarity: 'Covert', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'AWP | Lightning Strike', rarity: 'Covert', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'Desert Eagle | Hypnotic', rarity: 'Classified', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'M4A1-S | Dark Water', rarity: 'Classified', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'USP-S | Dark Water', rarity: 'Restricted', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Glock-18 | Dragon Tattoo', rarity: 'Restricted', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'SG 553 | Ultraviolet', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'AUG | Wings', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'MP7 | Skulls', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(CLASSIC_KNIVES),
  },

  // ==========================================================================
  // 2. CS:GO WEAPON CASE 2
  // ==========================================================================
  {
    id: 'csgo_weapon_case_2',
    name: 'CS:GO Weapon Case 2',
    type: 'weapon_case',
    price: 5.50,
    image: '',
    skins: [
      { name: 'M4A1-S | Bright Water', rarity: 'Covert', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'SSG 08 | Blood in the Water', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Five-SeveN | Case Hardened', rarity: 'Classified', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'P250 | Hive', rarity: 'Classified', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'FAMAS | Hexane', rarity: 'Restricted', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'Tec-9 | Blue Titanium', rarity: 'Restricted', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'MP9 | Hypnotic', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'Negev | Anodized Navy', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'MAG-7 | Memento', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(CLASSIC_KNIVES),
  },

  // ==========================================================================
  // 3. CS:GO WEAPON CASE 3
  // ==========================================================================
  {
    id: 'csgo_weapon_case_3',
    name: 'CS:GO Weapon Case 3',
    type: 'weapon_case',
    price: 3.50,
    image: '',
    skins: [
      { name: 'CZ75-Auto | Victoria', rarity: 'Covert', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'M4A1-S | Master Piece', rarity: 'Covert', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'Dual Berettas | Marina', rarity: 'Classified', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Desert Eagle | Conspiracy', rarity: 'Classified', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'PP-Bizon | Antique', rarity: 'Restricted', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'Sawed-Off | The Kraken', rarity: 'Restricted', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'SSG 08 | Abyss', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'UMP-45 | Caramel', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'M249 | Magma', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(CLASSIC_KNIVES),
  },

  // ==========================================================================
  // 4. eSports 2013 Case
  // ==========================================================================
  {
    id: 'esports_2013_case',
    name: 'eSports 2013 Case',
    type: 'weapon_case',
    price: 4.00,
    image: '',
    skins: [
      { name: 'AK-47 | Red Laminate', rarity: 'Covert', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'AWP | BOOM', rarity: 'Covert', min_float: 0.00, max_float: 0.18, image_id: '' },
      { name: 'P90 | Death by Kitty', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Desert Eagle | Cobalt Disruption', rarity: 'Classified', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'FAMAS | Spitfire', rarity: 'Restricted', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Galil AR | Orange DDPAT', rarity: 'Restricted', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'P250 | Splash', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'MP7 | Anodized Navy', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'Sawed-Off | Orange DDPAT', rarity: 'Mil-Spec', min_float: 0.00, max_float: 1.00, image_id: '' },
    ],
    rare_special: buildRareSpecial(CLASSIC_KNIVES),
  },

  // ==========================================================================
  // 5. eSports 2013 Winter Case
  // ==========================================================================
  {
    id: 'esports_2013_winter_case',
    name: 'eSports 2013 Winter Case',
    type: 'weapon_case',
    price: 2.50,
    image: '',
    skins: [
      { name: 'M4A4 | X-Ray', rarity: 'Covert', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'AK-47 | Red Laminate', rarity: 'Covert', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'AWP | Electric Hive', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'FAMAS | Afterimage', rarity: 'Classified', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Five-SeveN | Kami', rarity: 'Restricted', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'P90 | Trigon', rarity: 'Restricted', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'PP-Bizon | Water Sigil', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Nova | Ghost Camo', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Galil AR | Blue Titanium', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.08, image_id: '' },
    ],
    rare_special: buildRareSpecial(CLASSIC_KNIVES),
  },

  // ==========================================================================
  // 6. eSports 2014 Summer Case
  // ==========================================================================
  {
    id: 'esports_2014_summer_case',
    name: 'eSports 2014 Summer Case',
    type: 'weapon_case',
    price: 3.00,
    image: '',
    skins: [
      { name: 'AK-47 | Jaguar', rarity: 'Covert', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'M4A4 | Bullet Rain', rarity: 'Covert', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'P2000 | Corticera', rarity: 'Classified', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'CZ75-Auto | Tigris', rarity: 'Classified', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'Desert Eagle | Naga', rarity: 'Restricted', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'Nova | Koi', rarity: 'Restricted', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'XM1014 | Red Python', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'UMP-45 | Labyrinth', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Negev | Desert Strike', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(CLASSIC_KNIVES),
  },

  // ==========================================================================
  // 7. Operation Bravo Case
  // ==========================================================================
  {
    id: 'operation_bravo_case',
    name: 'Operation Bravo Case',
    type: 'weapon_case',
    price: 18.00,
    image: '',
    skins: [
      { name: 'AK-47 | Fire Serpent', rarity: 'Covert', min_float: 0.00, max_float: 0.76, image_id: '' },
      { name: 'AWP | Graphite', rarity: 'Covert', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'P2000 | Ocean Foam', rarity: 'Classified', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'Desert Eagle | Golden Koi', rarity: 'Classified', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'USP-S | Serum', rarity: 'Restricted', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'M4A4 | Zirka', rarity: 'Restricted', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'P90 | Emerald Dragon', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'SG 553 | Wave Spray', rarity: 'Mil-Spec', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'Nova | Tempest', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Dual Berettas | Black Limba', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(CLASSIC_KNIVES),
  },

  // ==========================================================================
  // 8. Operation Phoenix Case
  // ==========================================================================
  {
    id: 'operation_phoenix_case',
    name: 'Operation Phoenix Case',
    type: 'weapon_case',
    price: 3.50,
    image: '',
    skins: [
      { name: 'AK-47 | Redline', rarity: 'Covert', min_float: 0.10, max_float: 0.70, image_id: '' },
      { name: 'AWP | Asiimov', rarity: 'Covert', min_float: 0.18, max_float: 1.00, image_id: '' },
      { name: 'AUG | Chameleon', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'P90 | Asiimov', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Tec-9 | Sandstorm', rarity: 'Restricted', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'USP-S | Guardian', rarity: 'Restricted', min_float: 0.00, max_float: 0.40, image_id: '' },
      { name: 'SG 553 | Pulse', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'MP7 | Ocean Foam', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'Negev | Terrain', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MAG-7 | Bulldozer', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
    ],
    rare_special: buildRareSpecial(CLASSIC_KNIVES),
  },

  // ==========================================================================
  // 9. Operation Breakout Case
  // ==========================================================================
  {
    id: 'operation_breakout_case',
    name: 'Operation Breakout Case',
    type: 'weapon_case',
    price: 4.00,
    image: '',
    skins: [
      { name: 'M4A1-S | Cyrex', rarity: 'Covert', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Glock-18 | Water Elemental', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'P2000 | Fire Elemental', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'SSG 08 | Detour', rarity: 'Classified', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Desert Eagle | Conspiracy', rarity: 'Restricted', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'CZ75-Auto | Tigris', rarity: 'Restricted', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'P90 | Module', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'UMP-45 | Labyrinth', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Negev | Desert Strike', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'XM1014 | Quicksilver', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
    ],
    rare_special: buildRareSpecial([
      ...CLASSIC_KNIVES,
      KNIFE_TYPES.find(k => k.name === '★ Butterfly Knife'),
    ]),
  },

  // ==========================================================================
  // 10. Operation Vanguard Case
  // ==========================================================================
  {
    id: 'operation_vanguard_case',
    name: 'Operation Vanguard Case',
    type: 'weapon_case',
    price: 3.00,
    image: '',
    skins: [
      { name: 'AK-47 | Wasteland Rebel', rarity: 'Covert', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'M4A4 | Griffin', rarity: 'Covert', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'P2000 | Fire Elemental', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'FAMAS | Djinn', rarity: 'Classified', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'Five-SeveN | Monkey Business', rarity: 'Restricted', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'MAC-10 | Neon Rider', rarity: 'Restricted', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Sawed-Off | Highwayman', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MP9 | Dart', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'P90 | Elite Build', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'XM1014 | Tranquility', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
    ],
    rare_special: buildRareSpecial(HUNTSMAN_KNIVES),
  },

  // ==========================================================================
  // 11. Operation Wildfire Case
  // ==========================================================================
  {
    id: 'operation_wildfire_case',
    name: 'Operation Wildfire Case',
    type: 'weapon_case',
    price: 8.00,
    image: '',
    skins: [
      { name: 'AWP | Phobos', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'M4A4 | The Battlestar', rarity: 'Covert', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'FAMAS | Valence', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Desert Eagle | Kumicho Dragon', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Five-SeveN | Triumvirate', rarity: 'Restricted', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'MAC-10 | Lapis Gator', rarity: 'Restricted', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'UMP-45 | Primal Saber', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Sawed-Off | Origami', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'PP-Bizon | Fuel Rod', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Negev | Power Loader', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial([
      ...CLASSIC_KNIVES,
      KNIFE_TYPES.find(k => k.name === '★ Bowie Knife'),
    ]),
  },

  // ==========================================================================
  // 12. Operation Hydra Case
  // ==========================================================================
  {
    id: 'operation_hydra_case',
    name: 'Operation Hydra Case',
    type: 'weapon_case',
    price: 15.00,
    image: '',
    skins: [
      { name: 'M4A1-S | Decimator', rarity: 'Covert', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'AWP | Oni Taiji', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Five-SeveN | Hyper Beast', rarity: 'Classified', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'Dual Berettas | Cobra Strike', rarity: 'Classified', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Glock-18 | Off World', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'UMP-45 | Scaffold', rarity: 'Restricted', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MAG-7 | Hard Water', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'P250 | Red Rock', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'SCAR-20 | Blueprint', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MP5-SD | Gauss', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
    ],
    rare_special: buildRareSpecial(SPECTRUM_KNIVES),
  },

  // ==========================================================================
  // 13. Huntsman Case
  // ==========================================================================
  {
    id: 'huntsman_case',
    name: 'Huntsman Case',
    type: 'weapon_case',
    price: 2.50,
    image: '',
    skins: [
      { name: 'M4A1-S | Atomic Alloy', rarity: 'Covert', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'AK-47 | Vulcan', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'M4A4 | Desert-Strike', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'SCAR-20 | Cyrex', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'CZ75-Auto | Fuschia Is Now', rarity: 'Restricted', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'P2000 | Pulse', rarity: 'Restricted', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'PP-Bizon | Osiris', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Tec-9 | Isaac', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'XM1014 | Heaven Guard', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Galil AR | Kami', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
    ],
    rare_special: buildRareSpecial([
      KNIFE_TYPES.find(k => k.name === '★ Huntsman Knife'),
      ...CLASSIC_KNIVES,
    ]),
  },

  // ==========================================================================
  // 14. Winter Offensive Case
  // ==========================================================================
  {
    id: 'winter_offensive_case',
    name: 'Winter Offensive Case',
    type: 'weapon_case',
    price: 3.00,
    image: '',
    skins: [
      { name: 'M4A4 | Asiimov', rarity: 'Covert', min_float: 0.18, max_float: 1.00, image_id: '' },
      { name: 'AWP | Redline', rarity: 'Covert', min_float: 0.10, max_float: 0.70, image_id: '' },
      { name: 'P250 | Mehndi', rarity: 'Classified', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'Glock-18 | Steel Disruption', rarity: 'Classified', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'M4A1-S | Guardian', rarity: 'Restricted', min_float: 0.00, max_float: 0.40, image_id: '' },
      { name: 'Five-SeveN | Fowl Play', rarity: 'Restricted', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Nova | Rising Skull', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MP9 | Rose Iron', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Dual Berettas | Marina', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Galil AR | Cerberus', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.70, image_id: '' },
    ],
    rare_special: buildRareSpecial(CLASSIC_KNIVES),
  },

  // ==========================================================================
  // 15. Chroma Case
  // ==========================================================================
  {
    id: 'chroma_case',
    name: 'Chroma Case',
    type: 'weapon_case',
    price: 2.00,
    image: '',
    skins: [
      { name: 'M4A1-S | Hyper Beast', rarity: 'Covert', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'Galil AR | Chatterbox', rarity: 'Covert', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'AK-47 | Cartel', rarity: 'Classified', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'P250 | Muertos', rarity: 'Classified', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'FAMAS | Djinn', rarity: 'Restricted', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'MAC-10 | Malachite', rarity: 'Restricted', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'Sawed-Off | Serenity', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'M249 | System Lock', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Dual Berettas | Urban Shock', rarity: 'Mil-Spec', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'XM1014 | Quicksilver', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
    ],
    rare_special: buildRareSpecial(CHROMA_KNIVES),
  },

  // ==========================================================================
  // 16. Chroma 2 Case
  // ==========================================================================
  {
    id: 'chroma_2_case',
    name: 'Chroma 2 Case',
    type: 'weapon_case',
    price: 1.50,
    image: '',
    skins: [
      { name: 'M4A1-S | Hyper Beast', rarity: 'Covert', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'MAC-10 | Neon Rider', rarity: 'Covert', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'AK-47 | Elite Build', rarity: 'Classified', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Five-SeveN | Monkey Business', rarity: 'Classified', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'Glock-18 | Twilight Galaxy', rarity: 'Restricted', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'MP7 | Armor Core', rarity: 'Restricted', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MAG-7 | Heat', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Negev | Man-o\'-war', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'CZ75-Auto | Pole Position', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Sawed-Off | Origami', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(CHROMA_KNIVES),
  },

  // ==========================================================================
  // 17. Chroma 3 Case
  // ==========================================================================
  {
    id: 'chroma_3_case',
    name: 'Chroma 3 Case',
    type: 'weapon_case',
    price: 1.00,
    image: '',
    skins: [
      { name: 'M4A1-S | Chantico\'s Fire', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'PP-Bizon | Judgement of Anubis', rarity: 'Covert', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'SSG 08 | Ghost Crusader', rarity: 'Classified', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'UMP-45 | Primal Saber', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Tec-9 | Re-Entry', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Dual Berettas | Ventilators', rarity: 'Restricted', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'SG 553 | Atlas', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'P250 | Asiimov', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'XM1014 | Black Tie', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'G3SG1 | Orange Crash', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(CHROMA_KNIVES),
  },

  // ==========================================================================
  // 18. Falchion Case
  // ==========================================================================
  {
    id: 'falchion_case',
    name: 'Falchion Case',
    type: 'weapon_case',
    price: 1.00,
    image: '',
    skins: [
      { name: 'AK-47 | Aquamarine Revenge', rarity: 'Covert', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'AWP | Hyper Beast', rarity: 'Covert', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'M4A4 | Evil Daimyo', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'CZ75-Auto | Yellow Jacket', rarity: 'Classified', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'SG 553 | Cyrex', rarity: 'Restricted', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'P2000 | Handgun', rarity: 'Restricted', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Glock-18 | Bunsen Burner', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Negev | Loudmouth', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MP7 | Nemesis', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Nova | Ranger', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial([
      KNIFE_TYPES.find(k => k.name === '★ Falchion Knife'),
      ...CLASSIC_KNIVES,
    ]),
  },

  // ==========================================================================
  // 19. Shadow Case
  // ==========================================================================
  {
    id: 'shadow_case',
    name: 'Shadow Case',
    type: 'weapon_case',
    price: 0.80,
    image: '',
    skins: [
      { name: 'M4A1-S | Golden Coil', rarity: 'Covert', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'USP-S | Kill Confirmed', rarity: 'Covert', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'AK-47 | Frontside Misty', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'G3SG1 | Flux', rarity: 'Classified', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Galil AR | Stone Cold', rarity: 'Restricted', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MP7 | Special Delivery', rarity: 'Restricted', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'MAG-7 | Cobalt Core', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Glock-18 | Wraiths', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'P250 | Wingshot', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Dual Berettas | Dualing Dragons', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial([
      KNIFE_TYPES.find(k => k.name === '★ Shadow Daggers'),
      ...CLASSIC_KNIVES,
    ]),
  },

  // ==========================================================================
  // 20. Revolver Case
  // ==========================================================================
  {
    id: 'revolver_case',
    name: 'Revolver Case',
    type: 'weapon_case',
    price: 0.80,
    image: '',
    skins: [
      { name: 'M4A4 | Royal Paladin', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'R8 Revolver | Fade', rarity: 'Covert', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'AK-47 | Point Disarray', rarity: 'Classified', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'P90 | Shapewood', rarity: 'Classified', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'Tec-9 | Avalanche', rarity: 'Restricted', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'XM1014 | Teclu Burner', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Five-SeveN | Retrobution', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Negev | Power Loader', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Sawed-Off | Yorick', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'G3SG1 | Stinger', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(CHROMA_KNIVES),
  },

  // ==========================================================================
  // 21. Gamma Case
  // ==========================================================================
  {
    id: 'gamma_case',
    name: 'Gamma Case',
    type: 'weapon_case',
    price: 1.50,
    image: '',
    skins: [
      { name: 'M4A1-S | Mecha Industries', rarity: 'Covert', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Glock-18 | Wasteland Rebel', rarity: 'Covert', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'AWP | Phobos', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'SCAR-20 | Bloodsport', rarity: 'Classified', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'P250 | Iron Clad', rarity: 'Restricted', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'SG 553 | Triarch', rarity: 'Restricted', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Tec-9 | Ice Cap', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'R8 Revolver | Reboot', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'PP-Bizon | Harvester', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Nova | Exo', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(GAMMA_KNIVES),
  },

  // ==========================================================================
  // 22. Gamma 2 Case
  // ==========================================================================
  {
    id: 'gamma_2_case',
    name: 'Gamma 2 Case',
    type: 'weapon_case',
    price: 0.80,
    image: '',
    skins: [
      { name: 'AK-47 | Neon Rider', rarity: 'Covert', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Five-SeveN | Hyper Beast', rarity: 'Covert', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'FAMAS | Roll Cage', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Desert Eagle | Directive', rarity: 'Classified', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'USP-S | Cyrex', rarity: 'Restricted', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Glock-18 | Royal Legion', rarity: 'Restricted', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'P90 | Chopper', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'SCAR-20 | Jungle Slipstream', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MAG-7 | Petroglyph', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MP9 | Airlock', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
    ],
    rare_special: buildRareSpecial(GAMMA_KNIVES),
  },

  // ==========================================================================
  // 23. Glove Case
  // ==========================================================================
  {
    id: 'glove_case',
    name: 'Glove Case',
    type: 'weapon_case',
    price: 2.00,
    image: '',
    skins: [
      { name: 'M4A1-S | Decimator', rarity: 'Covert', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'USP-S | Cyrex', rarity: 'Covert', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Glock-18 | Ironwork', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Galil AR | Firefight', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'P2000 | Imperial Dragon', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Nova | Gila', rarity: 'Restricted', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'CZ75-Auto | Polymer', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Dual Berettas | Royal Consorts', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'SSG 08 | Dragonfire', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'MAG-7 | Sonar', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: GLOVE_POOL,
  },

  // ==========================================================================
  // 24. Spectrum Case
  // ==========================================================================
  {
    id: 'spectrum_case',
    name: 'Spectrum Case',
    type: 'weapon_case',
    price: 1.50,
    image: '',
    skins: [
      { name: 'AK-47 | Bloodsport', rarity: 'Covert', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'USP-S | Neo-Noir', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'M4A1-S | Decimator', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'AWP | Fever Dream', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'CZ75-Auto | Xiangliu', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Galil AR | Crimson Tsunami', rarity: 'Restricted', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MP7 | Aero', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Desert Eagle | Oxide Blaze', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'XM1014 | Seasons', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Sawed-Off | Zander', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(SPECTRUM_KNIVES),
  },

  // ==========================================================================
  // 25. Spectrum 2 Case
  // ==========================================================================
  {
    id: 'spectrum_2_case',
    name: 'Spectrum 2 Case',
    type: 'weapon_case',
    price: 0.50,
    image: '',
    skins: [
      { name: 'AK-47 | The Empress', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'M4A1-S | Leaded Glass', rarity: 'Covert', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'P250 | See Ya Later', rarity: 'Classified', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'CZ75-Auto | Tacticat', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'PP-Bizon | High Roller', rarity: 'Restricted', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'R8 Revolver | Llama Cannon', rarity: 'Restricted', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Sawed-Off | Morris', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Glock-18 | Off World', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'MP9 | Goo', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'XM1014 | Ziggy', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(SPECTRUM_KNIVES),
  },

  // ==========================================================================
  // 26. Clutch Case
  // ==========================================================================
  {
    id: 'clutch_case',
    name: 'Clutch Case',
    type: 'weapon_case',
    price: 0.30,
    image: '',
    skins: [
      { name: 'M4A4 | Neo-Noir', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'USP-S | Cortex', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'AUG | Stymphalian', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'AWP | Mortis', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'MAG-7 | SWAG-7', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Glock-18 | Moonrise', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'MP7 | Bloodsport', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'UMP-45 | Arctic Wolf', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Negev | Lionfish', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'R8 Revolver | Grip', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Nova | Wild Six', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: [
      ...buildRareSpecial(CLUTCH_KNIVES),
      ...GLOVE_POOL,
    ],
  },

  // ==========================================================================
  // 27. Horizon Case
  // ==========================================================================
  {
    id: 'horizon_case',
    name: 'Horizon Case',
    type: 'weapon_case',
    price: 0.20,
    image: '',
    skins: [
      { name: 'AK-47 | Neon Rider', rarity: 'Covert', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Desert Eagle | Code Red', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'CZ75-Auto | Eco', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'FAMAS | Eye of Athena', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Dual Berettas | Shred', rarity: 'Restricted', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MP7 | Powercore', rarity: 'Restricted', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'R8 Revolver | Survivalist', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'P90 | Traction', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'G3SG1 | High Seas', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Nova | Toy Soldier', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(HORIZON_KNIVES),
  },

  // ==========================================================================
  // 28. Danger Zone Case
  // ==========================================================================
  {
    id: 'danger_zone_case',
    name: 'Danger Zone Case',
    type: 'weapon_case',
    price: 0.10,
    image: '',
    skins: [
      { name: 'AK-47 | Asiimov', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'AWP | Neo-Noir', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'MP5-SD | Phosphor', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Desert Eagle | Mecha Industries', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Glock-18 | Oxide Blaze', rarity: 'Restricted', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'USP-S | Flashback', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'MAC-10 | Pipe Down', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'SG 553 | Danger Close', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Tec-9 | Fubar', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Sawed-Off | Black Sand', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'M249 | Emerald Poison Dart', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(DANGER_ZONE_KNIVES),
  },

  // ==========================================================================
  // 29. Prisma Case
  // ==========================================================================
  {
    id: 'prisma_case',
    name: 'Prisma Case',
    type: 'weapon_case',
    price: 0.10,
    image: '',
    skins: [
      { name: 'AWP | Atheris', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'AK-47 | Uncharted', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'R8 Revolver | Skull Crusher', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Five-SeveN | Angry Mob', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'XM1014 | Incinegator', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'AUG | Momentum', rarity: 'Restricted', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'P250 | Visions', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'MAC-10 | Whitefish', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Tec-9 | Bamboozle', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MP5-SD | Kitbash', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Galil AR | Akoben', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(PRISMA_KNIVES),
  },

  // ==========================================================================
  // 30. Prisma 2 Case
  // ==========================================================================
  {
    id: 'prisma_2_case',
    name: 'Prisma 2 Case',
    type: 'weapon_case',
    price: 0.05,
    image: '',
    skins: [
      { name: 'AK-47 | Phantom Disruptor', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'MAG-7 | Justice', rarity: 'Covert', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'AWP | Containment Breach', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'M4A1-S | Player Two', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Desert Eagle | Blue Ply', rarity: 'Restricted', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Glock-18 | Bullet Queen', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'SG 553 | Darkwing', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'CZ75-Auto | Distressed', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'SCAR-20 | Enforcer', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'P2000 | Acid Etched', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Sawed-Off | Apocalypto', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(PRISMA_KNIVES),
  },

  // ==========================================================================
  // 31. CS20 Case
  // ==========================================================================
  {
    id: 'cs20_case',
    name: 'CS20 Case',
    type: 'weapon_case',
    price: 0.15,
    image: '',
    skins: [
      { name: 'AWP | Wildfire', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'FAMAS | Commemoration', rarity: 'Covert', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Dual Berettas | Elite 1.6', rarity: 'Classified', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MP9 | Hydra', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Five-SeveN | Buddy', rarity: 'Restricted', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Tec-9 | Flash Out', rarity: 'Restricted', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'UMP-45 | Plastique', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'P250 | Inferno', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'SCAR-20 | Assault', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MAG-7 | Popdog', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(CLASSIC_KNIVES),
  },

  // ==========================================================================
  // 32. Shattered Web Case
  // ==========================================================================
  {
    id: 'shattered_web_case',
    name: 'Shattered Web Case',
    type: 'weapon_case',
    price: 1.50,
    image: '',
    skins: [
      { name: 'AK-47 | Panthera onca', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'AWP | Containment Breach', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'MP5-SD | Acid Wash', rarity: 'Classified', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Tec-9 | Decimator', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Dual Berettas | Balance', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'SG 553 | Colony IV', rarity: 'Restricted', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'PP-Bizon | Embargo', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Nova | Plume', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'G3SG1 | Black Sand', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'R8 Revolver | Memento', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: [
      ...buildRareSpecial(DANGER_ZONE_KNIVES),
      ...GLOVE_POOL,
    ],
  },

  // ==========================================================================
  // 33. Fracture Case
  // ==========================================================================
  {
    id: 'fracture_case',
    name: 'Fracture Case',
    type: 'weapon_case',
    price: 0.10,
    image: '',
    skins: [
      { name: 'Desert Eagle | Printstream', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Glock-18 | Vogue', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'M4A4 | Tooth Fairy', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'MAG-7 | Monster Call', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'P250 | Cyber Shell', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Galil AR | Connexion', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'SSG 08 | Mainframe 001', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Tec-9 | Brother', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'P90 | Freight', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'SG 553 | Ol\' Rusty', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'PP-Bizon | Runic', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(DANGER_ZONE_KNIVES),
  },

  // ==========================================================================
  // 34. Snakebite Case
  // ==========================================================================
  {
    id: 'snakebite_case',
    name: 'Snakebite Case',
    type: 'weapon_case',
    price: 0.15,
    image: '',
    skins: [
      { name: 'USP-S | Printstream', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'M4A1-S | Printstream', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'AK-47 | Slate', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Galil AR | Chromatic Aberration', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'MP9 | Food Chain', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'XM1014 | XOXO', rarity: 'Restricted', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'CZ75-Auto | Vendetta', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'P250 | Contaminant', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'R8 Revolver | Crazy 8', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Negev | dev_texture', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Nova | Clear Polymer', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.60, image_id: '' },
    ],
    rare_special: [
      ...buildRareSpecial(DANGER_ZONE_KNIVES),
      ...GLOVE_POOL,
    ],
  },

  // ==========================================================================
  // 35. Operation Riptide Case
  // ==========================================================================
  {
    id: 'operation_riptide_case',
    name: 'Operation Riptide Case',
    type: 'weapon_case',
    price: 0.30,
    image: '',
    skins: [
      { name: 'AK-47 | Leet Museo', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'SSG 08 | Turbo Peek', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Desert Eagle | Ocean Drive', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'M4A1-S | Night Terror', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Five-SeveN | Scrawl', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'FAMAS | ZX Spectron', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'MP9 | Mount Fuji', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'PP-Bizon | Space Cat', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MAG-7 | BI83 Spectrum', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Dual Berettas | Tread', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Glock-18 | Winterized', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: [
      ...buildRareSpecial(DANGER_ZONE_KNIVES),
      ...GLOVE_POOL,
    ],
  },

  // ==========================================================================
  // 36. Dreams & Nightmares Case
  // ==========================================================================
  {
    id: 'dreams_nightmares_case',
    name: 'Dreams & Nightmares Case',
    type: 'weapon_case',
    price: 0.20,
    image: '',
    skins: [
      { name: 'AK-47 | Nightwish', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'MP9 | Starlight Protector', rarity: 'Covert', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'USP-S | Ticket to Hell', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'FAMAS | Rapid Eye Movement', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Five-SeveN | Fairy Tale', rarity: 'Restricted', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'XM1014 | Zombie Offensive', rarity: 'Restricted', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'PP-Bizon | Space Cat', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MAG-7 | Foresight', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Dual Berettas | Melondrama', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'P2000 | Lifted Spirits', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Sawed-Off | Spirit Board', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(PRISMA_KNIVES),
  },

  // ==========================================================================
  // 37. Recoil Case
  // ==========================================================================
  {
    id: 'recoil_case',
    name: 'Recoil Case',
    type: 'weapon_case',
    price: 0.05,
    image: '',
    skins: [
      { name: 'AK-47 | Ice Coaled', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'USP-S | Printstream', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'AWP | Chromatic Aberration', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Glock-18 | Gold Toof', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'P250 | Visions', rarity: 'Restricted', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'SG 553 | Dragon Tech', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'M249 | Downtown', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'UMP-45 | Motorized', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MAC-10 | Monkeyflage', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Sawed-Off | Kiss Love', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'R8 Revolver | Banana Cannon', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.70, image_id: '' },
    ],
    rare_special: buildRareSpecial(DANGER_ZONE_KNIVES),
  },

  // ==========================================================================
  // 38. Revolution Case
  // ==========================================================================
  {
    id: 'revolution_case',
    name: 'Revolution Case',
    type: 'weapon_case',
    price: 0.05,
    image: '',
    skins: [
      { name: 'AK-47 | Head Shot', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'M4A1-S | Emphorosaur-S', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'AWP | Duality', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'P2000 | Wicked Sick', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Glock-18 | Umbral Rabbit', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'FAMAS | Rapid Eye Movement', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'MAC-10 | Saddler', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'UMP-45 | Wild Child', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'P90 | Neoqueen', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Tec-9 | Rebel', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'SG 553 | Cyberforce', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(REVOLUTION_KNIVES),
  },

  // ==========================================================================
  // 39. Gallery Case
  // ==========================================================================
  {
    id: 'gallery_case',
    name: 'Gallery Case',
    type: 'weapon_case',
    price: 0.03,
    image: '',
    skins: [
      { name: 'M4A4 | Etch Lord', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Glock-18 | Block-18', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'AK-47 | Inheritance', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'AWP | Crakow!', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'USP-S | The Traitor', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'MAC-10 | Toybox', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Desert Eagle | Sputnik', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Five-SeveN | Hybrid', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MP5-SD | Liquidation', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'P90 | Nostalgia', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Sawed-Off | Analog Input', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(REVOLUTION_KNIVES),
  },

  // ==========================================================================
  // 40. Kilowatt Case
  // ==========================================================================
  {
    id: 'kilowatt_case',
    name: 'Kilowatt Case',
    type: 'weapon_case',
    price: 1.00,
    image: '',
    skins: [
      { name: 'M4A1-S | Black Lotus', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'USP-S | Jawbreaker', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'AK-47 | Inheritance', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'AWP | Chrome Cannon', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Zeus x27 | Olympus', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Glock-18 | Block-18', rarity: 'Restricted', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'SSG 08 | Dezastre', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Nova | Dark Sigil', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'XM1014 | Irezumi', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'Tec-9 | Slag', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
      { name: 'MAC-10 | Light Box', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.80, image_id: '' },
    ],
    rare_special: buildRareSpecial(KILOWATT_KNIVES),
  },

  // ==========================================================================
  // STICKER CAPSULES
  // ==========================================================================
  {
    id: 'katowice_2014_legends',
    name: 'Katowice 2014 Legends (Holo/Foil)',
    type: 'sticker_capsule',
    price: 1800.00,
    image: '',
    skins: [
      { name: 'Sticker | Titan (Holo) | Katowice 2014', rarity: 'Covert', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | iBUYPOWER (Holo) | Katowice 2014', rarity: 'Covert', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Reason Gaming (Holo) | Katowice 2014', rarity: 'Classified', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Natus Vincere (Holo) | Katowice 2014', rarity: 'Classified', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Fnatic (Holo) | Katowice 2014', rarity: 'Restricted', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Virtus.Pro (Holo) | Katowice 2014', rarity: 'Restricted', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | NiP | Katowice 2014', rarity: 'Mil-Spec', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | compLexity Gaming | Katowice 2014', rarity: 'Mil-Spec', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | LGB eSports | Katowice 2014', rarity: 'Mil-Spec', min_float: 0, max_float: 0, image_id: '' },
    ],
    rare_special: [],
  },

  {
    id: 'cologne_2014_legends',
    name: 'ESL One Cologne 2014 Legends',
    type: 'sticker_capsule',
    price: 25.00,
    image: '',
    skins: [
      { name: 'Sticker | Fnatic (Holo) | Cologne 2014', rarity: 'Covert', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Natus Vincere (Holo) | Cologne 2014', rarity: 'Covert', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Virtus.Pro (Holo) | Cologne 2014', rarity: 'Classified', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | NiP (Holo) | Cologne 2014', rarity: 'Classified', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Team Dignitas (Holo) | Cologne 2014', rarity: 'Restricted', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Cloud9 | Cologne 2014', rarity: 'Restricted', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | LDLC | Cologne 2014', rarity: 'Mil-Spec', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | iBUYPOWER | Cologne 2014', rarity: 'Mil-Spec', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | HellRaisers | Cologne 2014', rarity: 'Mil-Spec', min_float: 0, max_float: 0, image_id: '' },
    ],
    rare_special: [],
  },

  {
    id: 'katowice_2015_legends',
    name: 'ESL One Katowice 2015 Legends (Holo/Foil)',
    type: 'sticker_capsule',
    price: 45.00,
    image: '',
    skins: [
      { name: 'Sticker | Fnatic (Holo) | Katowice 2015', rarity: 'Covert', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Natus Vincere (Holo) | Katowice 2015', rarity: 'Covert', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Virtus.Pro (Holo) | Katowice 2015', rarity: 'Classified', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | TSM (Holo) | Katowice 2015', rarity: 'Classified', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | EnVyUs (Holo) | Katowice 2015', rarity: 'Restricted', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Cloud9 (Holo) | Katowice 2015', rarity: 'Restricted', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | NiP | Katowice 2015', rarity: 'Mil-Spec', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Keyd Stars | Katowice 2015', rarity: 'Mil-Spec', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Penta Sports | Katowice 2015', rarity: 'Mil-Spec', min_float: 0, max_float: 0, image_id: '' },
    ],
    rare_special: [],
  },

  {
    id: 'community_sticker_capsule_1',
    name: 'Community Sticker Capsule 1',
    type: 'sticker_capsule',
    price: 15.00,
    image: '',
    skins: [
      { name: 'Sticker | Crown (Foil)', rarity: 'Covert', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Headhunter (Foil)', rarity: 'Covert', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Howling Dawn', rarity: 'Classified', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Flammable (Foil)', rarity: 'Classified', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Bomb Code', rarity: 'Restricted', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Headshot Guarantee', rarity: 'Restricted', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Lucky Cat (Foil)', rarity: 'Mil-Spec', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Sherry', rarity: 'Mil-Spec', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Chicken Lover', rarity: 'Mil-Spec', min_float: 0, max_float: 0, image_id: '' },
    ],
    rare_special: [],
  },

  {
    id: 'rio_2022_legends',
    name: 'IEM Rio 2022 Legends Sticker Capsule',
    type: 'sticker_capsule',
    price: 3.00,
    image: '',
    skins: [
      { name: 'Sticker | FaZe Clan (Holo) | Rio 2022', rarity: 'Covert', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | NAVI (Holo) | Rio 2022', rarity: 'Covert', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Heroic (Holo) | Rio 2022', rarity: 'Classified', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Outsiders (Holo) | Rio 2022', rarity: 'Classified', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Team Liquid (Holo) | Rio 2022', rarity: 'Restricted', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Cloud9 (Holo) | Rio 2022', rarity: 'Restricted', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | Fnatic | Rio 2022', rarity: 'Mil-Spec', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | MOUZ | Rio 2022', rarity: 'Mil-Spec', min_float: 0, max_float: 0, image_id: '' },
      { name: 'Sticker | BIG | Rio 2022', rarity: 'Mil-Spec', min_float: 0, max_float: 0, image_id: '' },
    ],
    rare_special: [],
  },

  // ==========================================================================
  // SOUVENIR PACKAGES
  // ==========================================================================
  {
    id: 'souvenir_dust2_2019',
    name: 'Souvenir Package - Dust II (Katowice 2019)',
    type: 'souvenir',
    price: 8.00,
    image: '',
    skins: [
      { name: 'Souvenir AK-47 | Safari Mesh', rarity: 'Covert', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir M4A4 | Urban DDPAT', rarity: 'Covert', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir AWP | Safari Mesh', rarity: 'Classified', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir P250 | Sand Dune', rarity: 'Classified', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Nova | Predator', rarity: 'Restricted', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Tec-9 | Groundwater', rarity: 'Restricted', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir G3SG1 | Desert Storm', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir XM1014 | Blue Spruce', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir MAC-10 | Palm', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
    ],
    rare_special: [],
  },

  {
    id: 'souvenir_mirage_2018',
    name: 'Souvenir Package - Mirage (London 2018)',
    type: 'souvenir',
    price: 6.00,
    image: '',
    skins: [
      { name: 'Souvenir M4A1-S | Hot Rod', rarity: 'Covert', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'Souvenir Desert Eagle | Mudder', rarity: 'Covert', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Glock-18 | Reactor', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Souvenir SSG 08 | Acid Fade', rarity: 'Classified', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'Souvenir MP9 | Hot Rod', rarity: 'Restricted', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'Souvenir Five-SeveN | Hot Shot', rarity: 'Restricted', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Souvenir MAG-7 | Sand Dune', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Negev | Army Sheen', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'Souvenir SG 553 | Waves Perforated', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
    ],
    rare_special: [],
  },

  {
    id: 'souvenir_inferno_2021',
    name: 'Souvenir Package - Inferno (Stockholm 2021)',
    type: 'souvenir',
    price: 7.00,
    image: '',
    skins: [
      { name: 'Souvenir M4A4 | Radiation Hazard', rarity: 'Covert', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir AK-47 | Emerald Pinstripe', rarity: 'Covert', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir P250 | Nuclear Threat', rarity: 'Classified', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir USP-S | Road Rash', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Souvenir Five-SeveN | Silver Quartz', rarity: 'Restricted', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'Souvenir MP7 | Gunsmoke', rarity: 'Restricted', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Sawed-Off | Snake Camo', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Tec-9 | Tornado', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir XM1014 | Grassland', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
    ],
    rare_special: [],
  },

  {
    id: 'souvenir_nuke_2022',
    name: 'Souvenir Package - Nuke (Antwerp 2022)',
    type: 'souvenir',
    price: 10.00,
    image: '',
    skins: [
      { name: 'Souvenir M4A4 | Radiation Hazard', rarity: 'Covert', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir P90 | Fallout Warning', rarity: 'Covert', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir USP-S | Nuclear Threat', rarity: 'Classified', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Glock-18 | Reactor', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Souvenir Five-SeveN | Silver Quartz', rarity: 'Restricted', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'Souvenir Tec-9 | Nuclear Threat', rarity: 'Restricted', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir PP-Bizon | Night Ops', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir MP7 | Army Recon', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Nova | Nuclear Waste', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
    ],
    rare_special: [],
  },

  {
    id: 'souvenir_overpass_2019',
    name: 'Souvenir Package - Overpass (Berlin 2019)',
    type: 'souvenir',
    price: 5.00,
    image: '',
    skins: [
      { name: 'Souvenir M4A1-S | Master Piece', rarity: 'Covert', min_float: 0.00, max_float: 1.00, image_id: '' },
      { name: 'Souvenir SSG 08 | Detour', rarity: 'Covert', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Souvenir AUG | Daedalus', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Souvenir P2000 | Granite Marbleized', rarity: 'Classified', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'Souvenir CZ75-Auto | Green Plaid', rarity: 'Restricted', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir UMP-45 | Scorched', rarity: 'Restricted', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir MAG-7 | Storm', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Sawed-Off | Sage Spray', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir MP9 | Storm', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
    ],
    rare_special: [],
  },

  {
    id: 'souvenir_cobblestone_2018',
    name: 'Souvenir Package - Cobblestone (London 2018)',
    type: 'souvenir',
    price: 150.00,
    image: '',
    skins: [
      { name: 'Souvenir AWP | Dragon Lore', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Souvenir M4A1-S | Knight', rarity: 'Covert', min_float: 0.00, max_float: 0.10, image_id: '' },
      { name: 'Souvenir CZ75-Auto | Victoria', rarity: 'Classified', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Tec-9 | Nuclear Threat', rarity: 'Classified', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir MP9 | Dark Age', rarity: 'Restricted', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Sawed-Off | Rust Coat', rarity: 'Restricted', min_float: 0.06, max_float: 1.00, image_id: '' },
      { name: 'Souvenir UMP-45 | Indigo', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir P250 | Gunsmoke', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Nova | Green Apple', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
    ],
    rare_special: [],
  },

  {
    id: 'souvenir_train_2019',
    name: 'Souvenir Package - Train (Berlin 2019)',
    type: 'souvenir',
    price: 15.00,
    image: '',
    skins: [
      { name: 'Souvenir M4A1-S | Knight', rarity: 'Covert', min_float: 0.00, max_float: 0.10, image_id: '' },
      { name: 'Souvenir P90 | Asiimov', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Souvenir SG 553 | Fallout Warning', rarity: 'Classified', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir MAG-7 | Irradiated Alert', rarity: 'Classified', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir MAC-10 | Nuclear Garden', rarity: 'Restricted', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir UMP-45 | Facility Dark', rarity: 'Restricted', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir P250 | Facility Draft', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Nova | Green Apple', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Tec-9 | Groundwater', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
    ],
    rare_special: [],
  },

  {
    id: 'souvenir_cache_2018',
    name: 'Souvenir Package - Cache (London 2018)',
    type: 'souvenir',
    price: 8.00,
    image: '',
    skins: [
      { name: 'Souvenir FAMAS | Spitfire', rarity: 'Covert', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir AK-47 | Emerald Pinstripe', rarity: 'Covert', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Desert Eagle | Naga', rarity: 'Classified', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Five-SeveN | Silver Quartz', rarity: 'Classified', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'Souvenir MAC-10 | Silver', rarity: 'Restricted', min_float: 0.00, max_float: 0.08, image_id: '' },
      { name: 'Souvenir MP9 | Storm', rarity: 'Restricted', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir SG 553 | Waves Perforated', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir G3SG1 | Jungle Dashed', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir P250 | Sand Dune', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
    ],
    rare_special: [],
  },

  {
    id: 'souvenir_vertigo_2019',
    name: 'Souvenir Package - Vertigo (Katowice 2019)',
    type: 'souvenir',
    price: 5.00,
    image: '',
    skins: [
      { name: 'Souvenir SSG 08 | Tropical Storm', rarity: 'Covert', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir AUG | Condemned', rarity: 'Covert', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir P90 | Glacier Mesh', rarity: 'Classified', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Five-SeveN | Contractor', rarity: 'Classified', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir UMP-45 | Indigo', rarity: 'Restricted', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir MAG-7 | Metallic DDPAT', rarity: 'Restricted', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Sawed-Off | Snake Camo', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir MP7 | Anodized Navy', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir P250 | Boreal Forest', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
    ],
    rare_special: [],
  },

  {
    id: 'souvenir_ancient_2021',
    name: 'Souvenir Package - Ancient (Stockholm 2021)',
    type: 'souvenir',
    price: 6.00,
    image: '',
    skins: [
      { name: 'Souvenir M4A1-S | Welcome to the Jungle', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Souvenir AK-47 | Panthera Onca', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Souvenir SSG 08 | Jungle Dashed', rarity: 'Classified', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir P250 | Visions', rarity: 'Classified', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Souvenir MP9 | Mount Fuji', rarity: 'Restricted', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Souvenir MAG-7 | Praetorian', rarity: 'Restricted', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Souvenir Negev | Terrain', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Nova | Walnut', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Sawed-Off | Clay Pigeon', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
    ],
    rare_special: [],
  },

  {
    id: 'souvenir_anubis_2023',
    name: 'Souvenir Package - Anubis (Paris 2023)',
    type: 'souvenir',
    price: 7.00,
    image: '',
    skins: [
      { name: 'Souvenir M4A1-S | Print Stream', rarity: 'Covert', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Souvenir USP-S | Ancient Visions', rarity: 'Covert', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Souvenir AK-47 | Ice Coaled', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Souvenir AWP | Capillary', rarity: 'Classified', min_float: 0.00, max_float: 0.70, image_id: '' },
      { name: 'Souvenir Glock-18 | Winterized', rarity: 'Restricted', min_float: 0.00, max_float: 0.50, image_id: '' },
      { name: 'Souvenir P250 | Cyber Shell', rarity: 'Restricted', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Souvenir MP7 | Mischief', rarity: 'Mil-Spec', min_float: 0.00, max_float: 0.60, image_id: '' },
      { name: 'Souvenir MAC-10 | Monkeyflage', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
      { name: 'Souvenir Nova | Toy Soldier', rarity: 'Mil-Spec', min_float: 0.06, max_float: 0.80, image_id: '' },
    ],
    rare_special: [],
  },

];

// ============================================================================
// RARITY DROP RATES (percentage chance per tier)
// ============================================================================
const RARITY_ODDS = {
  'Mil-Spec':     79.92,
  'Restricted':   15.98,
  'Classified':    3.20,
  'Covert':        0.64,
  'Rare Special':  0.26,
};

// ============================================================================
// WEAR CONDITION RANGES
// ============================================================================
const WEAR_RANGES = {
  'Factory New':     { min: 0.00, max: 0.07 },
  'Minimal Wear':    { min: 0.07, max: 0.15 },
  'Field-Tested':    { min: 0.15, max: 0.38 },
  'Well-Worn':       { min: 0.38, max: 0.45 },
  'Battle-Scarred':  { min: 0.45, max: 1.00 },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a case by its ID slug.
 * @param {string} id - The case ID (e.g. 'clutch_case')
 * @returns {Object|undefined}
 */
function getCaseById(id) {
  return cases.find(c => c.id === id);
}

/**
 * Get all cases, optionally filtered by type.
 * @param {string} [type] - Filter by type: 'weapon_case', 'sticker_capsule', 'souvenir', 'capsule'
 * @returns {Array}
 */
function getAllCases(type) {
  if (!type) return cases;
  return cases.filter(c => c.type === type);
}

/**
 * Get every unique skin/item market hash name across all cases.
 * @returns {string[]}
 */
function getAllMarketHashNames() {
  const names = new Set();
  for (const c of cases) {
    for (const skin of c.skins) {
      names.add(skin.name);
    }
    for (const item of c.rare_special) {
      names.add(item.name);
    }
  }
  return Array.from(names);
}

/**
 * Get all weapon cases (excludes sticker capsules and souvenirs).
 * @returns {Array}
 */
function getWeaponCases() {
  return cases.filter(c => c.type === 'weapon_case');
}

/**
 * Get all sticker capsules.
 * @returns {Array}
 */
function getStickerCapsules() {
  return cases.filter(c => c.type === 'sticker_capsule');
}

/**
 * Get all souvenir packages.
 * @returns {Array}
 */
function getSouvenirPackages() {
  return cases.filter(c => c.type === 'souvenir');
}

/**
 * Get a random wear value for a skin, clamped to its float range.
 * @param {Object} skin - Skin object with min_float and max_float
 * @returns {{ wear: number, condition: string }}
 */
function getRandomWear(skin) {
  const wear = skin.min_float + Math.random() * (skin.max_float - skin.min_float);
  let condition = 'Battle-Scarred';
  if (wear < 0.07) condition = 'Factory New';
  else if (wear < 0.15) condition = 'Minimal Wear';
  else if (wear < 0.38) condition = 'Field-Tested';
  else if (wear < 0.45) condition = 'Well-Worn';
  return { wear: parseFloat(wear.toFixed(8)), condition };
}

/**
 * Simulate opening a case and return the dropped item.
 * @param {string} caseId - The case ID to open
 * @returns {{ item: Object, wear: number, condition: string, isRareSpecial: boolean }}
 */
function simulateCaseOpening(caseId) {
  const caseData = getCaseById(caseId);
  if (!caseData) throw new Error(`Case not found: ${caseId}`);

  const roll = Math.random() * 100;
  let isRareSpecial = false;
  let pool;

  if (caseData.rare_special.length > 0 && roll < RARITY_ODDS['Rare Special']) {
    // Rare special drop (knife/glove)
    pool = caseData.rare_special;
    isRareSpecial = true;
  } else {
    // Normal skin drop - pick rarity tier
    const adjustedRoll = Math.random() * 100;
    let rarity;
    if (adjustedRoll < RARITY_ODDS['Covert']) {
      rarity = 'Covert';
    } else if (adjustedRoll < RARITY_ODDS['Covert'] + RARITY_ODDS['Classified']) {
      rarity = 'Classified';
    } else if (adjustedRoll < RARITY_ODDS['Covert'] + RARITY_ODDS['Classified'] + RARITY_ODDS['Restricted']) {
      rarity = 'Restricted';
    } else {
      rarity = 'Mil-Spec';
    }

    pool = caseData.skins.filter(s => s.rarity === rarity);
    if (pool.length === 0) {
      // Fallback if no skins of that rarity exist
      pool = caseData.skins;
    }
  }

  const item = pool[Math.floor(Math.random() * pool.length)];
  const { wear, condition } = getRandomWear(item);

  return {
    item: { ...item },
    wear,
    condition,
    isRareSpecial,
  };
}

/**
 * Get all knife types.
 * @returns {Array}
 */
function getAllKnives() {
  return KNIFE_TYPES;
}

/**
 * Get all glove types.
 * @returns {Array}
 */
function getAllGloves() {
  return GLOVE_TYPES;
}

/**
 * Get all knife finish names.
 * @returns {string[]}
 */
function getKnifeFinishes() {
  return KNIFE_FINISHES;
}

/**
 * Get all glove finish names.
 * @returns {string[]}
 */
function getGloveFinishes() {
  return GLOVE_FINISHES;
}

// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
  cases,
  KNIFE_TYPES,
  KNIFE_FINISHES,
  GLOVE_TYPES,
  GLOVE_FINISHES,
  KNIFE_FINISH_PRICES,
  KNIFE_PRICE_MULTIPLIERS,
  GLOVE_FINISH_PRICES,
  RARITY_PRICE_RANGES,
  RARITY_ODDS,
  WEAR_RANGES,
  getCaseById,
  getAllCases,
  getAllMarketHashNames,
  getWeaponCases,
  getStickerCapsules,
  getSouvenirPackages,
  getRandomWear,
  simulateCaseOpening,
  getAllKnives,
  getAllGloves,
  getKnifeFinishes,
  getGloveFinishes,
};
