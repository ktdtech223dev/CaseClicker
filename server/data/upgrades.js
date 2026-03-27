const UPGRADE_TIERS = [
  { id: 'silver', name: 'Silver', unlockAt: 0 },
  { id: 'gold_nova', name: 'Gold Nova', unlockAt: 500 },
  { id: 'master_guardian', name: 'Master Guardian', unlockAt: 10000 },
  { id: 'global_elite', name: 'Global Elite', unlockAt: 250000 },
];

const UPGRADES = {
  // Silver tier
  glock_taps: { name: 'Glock Taps', tier: 'silver', type: 'click', value: 0.01, baseCost: 1, desc: '+$0.01/click' },
  usp_precision: { name: 'USP Precision', tier: 'silver', type: 'click', value: 0.03, baseCost: 5, desc: '+$0.03/click' },
  p250_rounds: { name: 'P250 Rounds', tier: 'silver', type: 'auto', value: 0.05, baseCost: 8, desc: '+$0.05/sec' },
  mp9_spray: { name: 'MP9 Spray', tier: 'silver', type: 'auto', value: 0.15, baseCost: 25, desc: '+$0.15/sec' },
  nova_pump: { name: 'Nova Pump', tier: 'silver', type: 'click', value: 0.10, baseCost: 50, desc: '+$0.10/click' },
  // Gold Nova tier
  famas_burst: { name: 'FAMAS Burst', tier: 'gold_nova', type: 'auto', value: 0.50, baseCost: 100, desc: '+$0.50/sec' },
  galil_spray: { name: 'Galil Spray', tier: 'gold_nova', type: 'auto', value: 1.00, baseCost: 250, desc: '+$1.00/sec' },
  ak47_onetap: { name: 'AK-47 One Tap', tier: 'gold_nova', type: 'click', value: 0.50, baseCost: 300, desc: '+$0.50/click' },
  m4a4_spray: { name: 'M4A4 Spray Control', tier: 'gold_nova', type: 'auto', value: 2.50, baseCost: 750, desc: '+$2.50/sec' },
  awp_sniper: { name: 'AWP Sniper', tier: 'gold_nova', type: 'click', value: 2.00, baseCost: 1000, desc: '+$2.00/click' },
  // Master Guardian tier
  sg553_scope: { name: 'SG 553 Scope', tier: 'master_guardian', type: 'auto', value: 5.00, baseCost: 2500, desc: '+$5.00/sec' },
  aug_zoom: { name: 'AUG Zoom', tier: 'master_guardian', type: 'auto', value: 10.00, baseCost: 5000, desc: '+$10.00/sec' },
  scar20_auto: { name: 'SCAR-20 Auto', tier: 'master_guardian', type: 'auto', value: 25.00, baseCost: 15000, desc: '+$25.00/sec' },
  negev_spray: { name: 'Negev Spray', tier: 'master_guardian', type: 'auto', value: 50.00, baseCost: 40000, desc: '+$50.00/sec' },
  knife_collection: { name: 'Knife Collection', tier: 'master_guardian', type: 'click', value: 10.00, baseCost: 50000, desc: '+$10.00/click' },
  // Global Elite tier
  dragon_lore: { name: 'Dragon Lore', tier: 'global_elite', type: 'auto', value: 100.00, baseCost: 100000, desc: '+$100.00/sec' },
  howl_power: { name: 'Howl Power', tier: 'global_elite', type: 'auto', value: 250.00, baseCost: 300000, desc: '+$250.00/sec' },
  karambit_fade: { name: 'Karambit Fade', tier: 'global_elite', type: 'click', value: 50.00, baseCost: 500000, desc: '+$50.00/click' },
  arms_empire: { name: 'Arms Empire', tier: 'global_elite', type: 'auto', value: 1000.00, baseCost: 1000000, desc: '+$1,000/sec' },
  case_hardened_throne: { name: 'Case Hardened Throne', tier: 'global_elite', type: 'multiplier', value: 0.10, baseCost: 2500000, desc: '+10% all income' },
};

function getUpgradeCost(upgradeId, currentLevel) {
  const upgrade = UPGRADES[upgradeId];
  if (!upgrade) return Infinity;
  return Math.round(upgrade.baseCost * Math.pow(1.5, currentLevel) * 100) / 100;
}

function getTierForUpgrade(upgradeId) {
  const upgrade = UPGRADES[upgradeId];
  if (!upgrade) return null;
  return UPGRADE_TIERS.find(t => t.id === upgrade.tier);
}

module.exports = { UPGRADES, UPGRADE_TIERS, getUpgradeCost, getTierForUpgrade };
