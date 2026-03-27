// All 80 achievements — organized by category
// Each has: id, name, desc, icon (category keyword for SVG), threshold (for progress tracking)

export const ACHIEVEMENTS = {
  // ===== CASES (12) =====
  first_case: { name: 'First Case', desc: 'Open your first case', icon: 'cases', threshold: 1, stat: 'total_cases_opened' },
  opened_10_cases: { name: 'Getting Started', desc: 'Open 10 cases', icon: 'cases', threshold: 10, stat: 'total_cases_opened' },
  opened_50_cases: { name: 'Case Fan', desc: 'Open 50 cases', icon: 'cases', threshold: 50, stat: 'total_cases_opened' },
  opened_100_cases: { name: 'Case Addict', desc: 'Open 100 cases', icon: 'cases', threshold: 100, stat: 'total_cases_opened' },
  opened_500_cases: { name: 'Case Hoarder', desc: 'Open 500 cases', icon: 'cases', threshold: 500, stat: 'total_cases_opened' },
  opened_1000_cases: { name: 'Case Veteran', desc: 'Open 1,000 cases', icon: 'cases', threshold: 1000, stat: 'total_cases_opened' },
  first_knife: { name: 'Knife Collector', desc: 'Unbox your first knife', icon: 'knife', threshold: 1 },
  first_glove: { name: 'Glove Dropper', desc: 'Unbox your first pair of gloves', icon: 'glove', threshold: 1 },
  first_covert: { name: 'Seeing Red', desc: 'Unbox a Covert (red) item', icon: 'covert', threshold: 1 },
  first_stattrak: { name: 'StatTrak Hunter', desc: 'Unbox a StatTrak item', icon: 'stattrak', threshold: 1 },
  first_souvenir: { name: 'Souvenir Collector', desc: 'Unbox a Souvenir item', icon: 'souvenir', threshold: 1 },
  open_all_cases: { name: 'Case Completionist', desc: 'Open at least 1 of every case type', icon: 'trophy', threshold: 1 },

  // ===== CLICKING (6) =====
  click_100: { name: 'Clicker', desc: 'Click 100 times', icon: 'click', threshold: 100, stat: 'total_clicks' },
  click_1000: { name: 'Trigger Discipline', desc: 'Click 1,000 times', icon: 'click', threshold: 1000, stat: 'total_clicks' },
  click_10000: { name: 'Trigger Happy', desc: 'Click 10,000 times', icon: 'click', threshold: 10000, stat: 'total_clicks' },
  click_100000: { name: 'Carpal Tunnel', desc: 'Click 100,000 times', icon: 'click', threshold: 100000, stat: 'total_clicks' },
  click_500000: { name: 'Machine Gun', desc: 'Click 500,000 times', icon: 'click', threshold: 500000, stat: 'total_clicks' },
  speed_demon: { name: 'Speed Demon', desc: 'Click 20 times in 5 seconds', icon: 'speed', threshold: 1 },

  // ===== EARNINGS (8) =====
  earn_100: { name: 'Pocket Change', desc: 'Earn $100 lifetime', icon: 'earnings', threshold: 100, stat: 'total_earned' },
  earn_1000: { name: 'Stacks', desc: 'Earn $1,000 lifetime', icon: 'earnings', threshold: 1000, stat: 'total_earned' },
  earn_10000: { name: 'Five Figures', desc: 'Earn $10,000 lifetime', icon: 'earnings', threshold: 10000, stat: 'total_earned' },
  earn_100k: { name: 'Six Figures', desc: 'Earn $100,000 lifetime', icon: 'earnings', threshold: 100000, stat: 'total_earned' },
  earn_1m: { name: 'Millionaire', desc: 'Earn $1,000,000 lifetime', icon: 'earnings', threshold: 1000000, stat: 'total_earned' },
  earn_10m: { name: 'Multi-Millionaire', desc: 'Earn $10,000,000 lifetime', icon: 'earnings', threshold: 10000000, stat: 'total_earned' },
  earn_100m: { name: 'Tycoon', desc: 'Earn $100,000,000 lifetime', icon: 'earnings', threshold: 100000000, stat: 'total_earned' },
  earn_1b: { name: 'Billionaire', desc: 'Earn $1,000,000,000 lifetime', icon: 'earnings', threshold: 1000000000, stat: 'total_earned' },

  // ===== GAMBLING (17) =====
  won_first_coinflip: { name: 'Lucky Flip', desc: 'Win your first coinflip', icon: 'coinflip', threshold: 1 },
  won_10_coinflips: { name: 'Lucky Flipper', desc: 'Win 10 coinflips', icon: 'coinflip', threshold: 10 },
  won_50_coinflips: { name: 'Coin Master', desc: 'Win 50 coinflips', icon: 'coinflip', threshold: 50 },
  won_100_coinflips: { name: 'Flip Legend', desc: 'Win 100 coinflips', icon: 'coinflip', threshold: 100 },
  coinflip_streak_5: { name: 'Hot Streak', desc: 'Win 5 coinflips in a row', icon: 'streak', threshold: 1 },
  crash_2x: { name: 'Double Up', desc: 'Cash out at 2x or higher in Crash', icon: 'crash', threshold: 1 },
  crash_5x: { name: 'High Flyer', desc: 'Cash out at 5x or higher in Crash', icon: 'crash', threshold: 1 },
  crash_10x: { name: 'To The Moon', desc: 'Cash out at 10x or higher in Crash', icon: 'crash', threshold: 1 },
  crash_25x: { name: 'Stratosphere', desc: 'Cash out at 25x or higher in Crash', icon: 'crash', threshold: 1 },
  crash_50x: { name: 'Orbit', desc: 'Cash out at 50x or higher in Crash', icon: 'crash', threshold: 1 },
  crash_100x: { name: 'Interstellar', desc: 'Cash out at 100x or higher in Crash', icon: 'crash', threshold: 1 },
  roulette_green: { name: 'Green Machine', desc: 'Hit green on Roulette', icon: 'roulette', threshold: 1 },
  roulette_green_3x: { name: 'Triple Green', desc: 'Hit green 3 times', icon: 'roulette', threshold: 3 },
  roulette_streak_5: { name: 'Roulette Royale', desc: 'Win 5 roulette bets in a row', icon: 'streak', threshold: 1 },
  jackpot_win: { name: 'Jackpot Winner', desc: 'Win a jackpot game', icon: 'jackpot', threshold: 1 },
  jackpot_win_5: { name: 'Jackpot King', desc: 'Win 5 jackpot games', icon: 'jackpot', threshold: 5 },
  jackpot_biggest_pot: { name: 'High Roller Pot', desc: 'Win the biggest jackpot pot', icon: 'jackpot', threshold: 1 },

  // ===== TRADING (6) =====
  first_trade: { name: 'First Trade', desc: 'Complete your first trade', icon: 'trading', threshold: 1 },
  traded_10: { name: 'Trader', desc: 'Complete 10 trades', icon: 'trading', threshold: 10 },
  traded_50: { name: 'Merchant', desc: 'Complete 50 trades', icon: 'trading', threshold: 50 },
  first_tradeup: { name: 'Trade Up Artist', desc: 'Complete your first trade-up contract', icon: 'tradeup', threshold: 1 },
  tradeup_10: { name: 'Upgrade Expert', desc: 'Complete 10 trade-up contracts', icon: 'tradeup', threshold: 10 },
  tradeup_covert: { name: 'Red Alert', desc: 'Trade up to a Covert item', icon: 'covert', threshold: 1 },

  // ===== INVENTORY (12) =====
  inventory_10: { name: 'Collector', desc: 'Own 10 items in inventory', icon: 'inventory', threshold: 10 },
  inventory_50: { name: 'Hoarder', desc: 'Own 50 items in inventory', icon: 'inventory', threshold: 50 },
  inventory_100: { name: 'Armory', desc: 'Own 100 items in inventory', icon: 'inventory', threshold: 100 },
  inventory_500: { name: 'Arsenal', desc: 'Own 500 items in inventory', icon: 'inventory', threshold: 500 },
  inventory_worth_1k: { name: 'Stacked', desc: 'Inventory worth $1,000+', icon: 'earnings', threshold: 1000 },
  inventory_worth_10k: { name: 'Wealthy', desc: 'Inventory worth $10,000+', icon: 'earnings', threshold: 10000 },
  inventory_worth_100k: { name: 'Rich', desc: 'Inventory worth $100,000+', icon: 'earnings', threshold: 100000 },
  inventory_worth_1m: { name: 'Inventory Mogul', desc: 'Inventory worth $1,000,000+', icon: 'earnings', threshold: 1000000 },
  own_knife: { name: 'Sharp Dressed', desc: 'Own a knife', icon: 'knife', threshold: 1 },
  own_glove: { name: 'Gloved Up', desc: 'Own a pair of gloves', icon: 'glove', threshold: 1 },
  own_5_knives: { name: 'Knife Collection', desc: 'Own 5 knives', icon: 'knife', threshold: 5 },
  collection_complete: { name: 'Completionist', desc: 'Own 1 skin from every case', icon: 'trophy', threshold: 1 },

  // ===== PRESTIGE (9) =====
  first_prestige: { name: 'Ranked Up', desc: 'Prestige for the first time', icon: 'prestige', threshold: 1, stat: 'prestige_level' },
  prestige_3: { name: 'Triple Prestige', desc: 'Prestige 3 times', icon: 'prestige', threshold: 3, stat: 'prestige_level' },
  prestige_5: { name: 'Veteran', desc: 'Prestige 5 times', icon: 'prestige', threshold: 5, stat: 'prestige_level' },
  prestige_10: { name: 'Legend', desc: 'Prestige 10 times', icon: 'prestige', threshold: 10, stat: 'prestige_level' },
  prestige_max: { name: 'Max Prestige', desc: 'Reach the maximum prestige level', icon: 'prestige', threshold: 20 },
  silver_rank: { name: 'Silver Elite', desc: 'Reach Silver rank', icon: 'rank', threshold: 1 },
  gold_nova_rank: { name: 'Gold Nova', desc: 'Reach Gold Nova rank', icon: 'rank', threshold: 1 },
  master_guardian_rank: { name: 'Master Guardian', desc: 'Reach Master Guardian rank', icon: 'rank', threshold: 1 },
  global_elite_rank: { name: 'The Global Elite', desc: 'Reach Global Elite rank', icon: 'rank', threshold: 1 },

  // ===== SOCIAL (4) =====
  first_wall_post: { name: 'First Post', desc: 'Make your first wall post', icon: 'social', threshold: 1 },
  wall_post_10: { name: 'Regular Poster', desc: 'Make 10 wall posts', icon: 'social', threshold: 10 },
  first_trade_sent: { name: 'Trade Offer', desc: 'Send your first trade offer', icon: 'trading', threshold: 1 },
  trade_accepted: { name: 'Deal Done', desc: 'Have a trade accepted', icon: 'trading', threshold: 1 },

  // ===== MISC (11) =====
  daily_streak_3: { name: 'Committed', desc: 'Maintain a 3-day login streak', icon: 'daily', threshold: 3 },
  daily_streak_7: { name: 'Dedicated', desc: 'Maintain a 7-day login streak', icon: 'daily', threshold: 7 },
  daily_streak_14: { name: 'Devoted', desc: 'Maintain a 14-day login streak', icon: 'daily', threshold: 14 },
  daily_streak_30: { name: 'Loyal', desc: 'Maintain a 30-day login streak', icon: 'daily', threshold: 30 },
  offline_earn_100: { name: 'AFK Earner', desc: 'Collect $100 in offline earnings', icon: 'offline', threshold: 100 },
  offline_earn_1000: { name: 'AFK Farmer', desc: 'Collect $1,000 in offline earnings', icon: 'offline', threshold: 1000 },
  big_spender: { name: 'Big Spender', desc: 'Spend $100 total on cases', icon: 'spend', threshold: 100 },
  whale: { name: 'Whale', desc: 'Spend $10,000 total on cases', icon: 'spend', threshold: 10000 },
  name_tag_used: { name: 'Name Tag', desc: 'Rename a weapon', icon: 'nametag', threshold: 1 },
  sell_100_skins: { name: 'Liquidator', desc: 'Sell 100 skins', icon: 'sell', threshold: 100 },
  bulk_sell_25: { name: 'Fire Sale', desc: 'Sell 25+ items at once', icon: 'sell', threshold: 1 },
};

// Category groupings for the gallery
export const ACHIEVEMENT_CATEGORIES = [
  { id: 'cases', label: 'Cases', keys: ['first_case', 'opened_10_cases', 'opened_50_cases', 'opened_100_cases', 'opened_500_cases', 'opened_1000_cases', 'first_knife', 'first_glove', 'first_covert', 'first_stattrak', 'first_souvenir', 'open_all_cases'] },
  { id: 'clicking', label: 'Clicking', keys: ['click_100', 'click_1000', 'click_10000', 'click_100000', 'click_500000', 'speed_demon'] },
  { id: 'earnings', label: 'Earnings', keys: ['earn_100', 'earn_1000', 'earn_10000', 'earn_100k', 'earn_1m', 'earn_10m', 'earn_100m', 'earn_1b'] },
  { id: 'gambling', label: 'Gambling', keys: ['won_first_coinflip', 'won_10_coinflips', 'won_50_coinflips', 'won_100_coinflips', 'coinflip_streak_5', 'crash_2x', 'crash_5x', 'crash_10x', 'crash_25x', 'crash_50x', 'crash_100x', 'roulette_green', 'roulette_green_3x', 'roulette_streak_5', 'jackpot_win', 'jackpot_win_5', 'jackpot_biggest_pot'] },
  { id: 'trading', label: 'Trading', keys: ['first_trade', 'traded_10', 'traded_50', 'first_tradeup', 'tradeup_10', 'tradeup_covert'] },
  { id: 'inventory', label: 'Inventory', keys: ['inventory_10', 'inventory_50', 'inventory_100', 'inventory_500', 'inventory_worth_1k', 'inventory_worth_10k', 'inventory_worth_100k', 'inventory_worth_1m', 'own_knife', 'own_glove', 'own_5_knives', 'collection_complete'] },
  { id: 'prestige', label: 'Prestige', keys: ['first_prestige', 'prestige_3', 'prestige_5', 'prestige_10', 'prestige_max', 'silver_rank', 'gold_nova_rank', 'master_guardian_rank', 'global_elite_rank'] },
  { id: 'social', label: 'Social', keys: ['first_wall_post', 'wall_post_10', 'first_trade_sent', 'trade_accepted'] },
  { id: 'misc', label: 'Misc', keys: ['daily_streak_3', 'daily_streak_7', 'daily_streak_14', 'daily_streak_30', 'offline_earn_100', 'offline_earn_1000', 'big_spender', 'whale', 'name_tag_used', 'sell_100_skins', 'bulk_sell_25'] },
];

export function getAchievementInfo(id) {
  return ACHIEVEMENTS[id] || { name: id, desc: 'Unknown achievement', icon: 'unknown' };
}
