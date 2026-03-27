const express = require('express');
const router = express.Router();
const { getDb, addToWallet, deductFromWallet } = require('../db/database');
const https = require('https');

// ===== REAL SPORTS CONFIG =====
// Get a free API key from https://the-odds-api.com/ (500 req/month free)
// Set as environment variable ODDS_API_KEY or hardcode below
const ODDS_API_KEY = process.env.ODDS_API_KEY || '';
const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';
const REAL_SPORTS_ENABLED = ODDS_API_KEY.length > 10;

function fetchJSON(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'CaseSim/3.0' } }, (res) => {
      if (res.statusCode !== 200) { resolve(null); return; }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
    }).on('error', () => resolve(null));
  });
}

// Fetch real upcoming matches from The Odds API
async function fetchRealSportsMatches() {
  if (!REAL_SPORTS_ENABLED) return [];
  try {
    // Fetch from multiple sports
    const sports = ['americanfootball_nfl', 'basketball_nba', 'baseball_mlb', 'icehockey_nhl', 'soccer_epl', 'mma_mixed_martial_arts'];
    const allMatches = [];

    for (const sport of sports) {
      const url = `${ODDS_API_BASE}/sports/${sport}/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h&oddsFormat=decimal`;
      const data = await fetchJSON(url);
      if (!data || !Array.isArray(data)) continue;

      for (const event of data) {
        if (!event.home_team || !event.away_team) continue;
        // Get best odds from bookmakers
        let homeOdds = 2.0, awayOdds = 2.0;
        if (event.bookmakers && event.bookmakers.length > 0) {
          const bk = event.bookmakers[0];
          const market = bk.markets && bk.markets.find(m => m.key === 'h2h');
          if (market && market.outcomes) {
            const home = market.outcomes.find(o => o.name === event.home_team);
            const away = market.outcomes.find(o => o.name === event.away_team);
            if (home) homeOdds = home.price;
            if (away) awayOdds = away.price;
          }
        }

        const sportLabel = sport.split('_')[0].toUpperCase();
        allMatches.push({
          team1: event.home_team,
          team2: event.away_team,
          team1_odds: Math.round(homeOdds * 100) / 100,
          team2_odds: Math.round(awayOdds * 100) / 100,
          map: sportLabel,
          format: 'real',
          starts_at: Math.floor(new Date(event.commence_time).getTime() / 1000),
          event_id: event.id,
        });
      }
    }
    console.log('[Sports] Fetched ' + allMatches.length + ' real matches from The Odds API');
    return allMatches;
  } catch (e) {
    console.error('[Sports] Odds API error:', e.message);
    return [];
  }
}

// Fetch real scores/results
async function fetchRealResults() {
  if (!REAL_SPORTS_ENABLED) return [];
  try {
    const sports = ['americanfootball_nfl', 'basketball_nba', 'baseball_mlb', 'icehockey_nhl', 'soccer_epl', 'mma_mixed_martial_arts'];
    const results = [];
    for (const sport of sports) {
      const url = `${ODDS_API_BASE}/sports/${sport}/scores/?apiKey=${ODDS_API_KEY}&daysFrom=1`;
      const data = await fetchJSON(url);
      if (!data || !Array.isArray(data)) continue;
      for (const event of data) {
        if (!event.completed || !event.scores) continue;
        const homeScore = event.scores.find(s => s.name === event.home_team);
        const awayScore = event.scores.find(s => s.name === event.away_team);
        results.push({
          event_id: event.id,
          home_team: event.home_team,
          away_team: event.away_team,
          score1: homeScore ? parseInt(homeScore.score) : 0,
          score2: awayScore ? parseInt(awayScore.score) : 0,
        });
      }
    }
    return results;
  } catch (e) { return []; }
}

// Import real matches into DB (runs every 15 min)
async function syncRealMatches() {
  if (!REAL_SPORTS_ENABLED) return;
  const db = getDb();
  const matches = await fetchRealSportsMatches();
  const now = Math.floor(Date.now() / 1000);

  for (const m of matches) {
    // Skip if already exists (by team names + start time)
    const existing = db.prepare('SELECT id FROM sports_matches WHERE team1 = ? AND team2 = ? AND starts_at = ?').get(m.team1, m.team2, m.starts_at);
    if (existing) continue;
    // Only add matches starting in the next 48 hours
    if (m.starts_at - now > 48 * 3600) continue;

    db.prepare('INSERT INTO sports_matches (team1, team2, team1_odds, team2_odds, map, format, status, starts_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(m.team1, m.team2, m.team1_odds, m.team2_odds, m.map, m.format, 'upcoming', m.starts_at);
  }
}

// Resolve real match results (runs every 15 min)
async function resolveRealMatches() {
  if (!REAL_SPORTS_ENABLED) return;
  const db = getDb();
  const results = await fetchRealResults();

  for (const r of results) {
    // Find matching live/upcoming match
    const match = db.prepare("SELECT * FROM sports_matches WHERE team1 = ? AND team2 = ? AND format = 'real' AND status IN ('upcoming', 'live')").get(r.home_team, r.away_team);
    if (!match) continue;

    const winner = r.score1 > r.score2 ? 'team1' : 'team2';
    db.prepare('UPDATE sports_matches SET status = ?, score1 = ?, score2 = ?, resolved_at = ? WHERE id = ?')
      .run('completed', r.score1, r.score2, Math.floor(Date.now() / 1000), match.id);

    // Resolve bets
    const bets = db.prepare("SELECT * FROM sports_bets WHERE match_id = ? AND status = 'pending'").all(match.id);
    for (const bet of bets) {
      if (bet.bet_type === 'winner' && bet.selection === winner) {
        const payout = Math.round((Number(bet.amount) * Number(bet.odds_at_bet)) * 100) / 100;
        const player = db.prepare('SELECT wallet FROM players WHERE id = ?').get(bet.player_id);
        const newWallet = Math.round(((Number(player.wallet) || 0) + payout) * 100) / 100;
        db.prepare('UPDATE players SET wallet = ? WHERE id = ?').run(newWallet, bet.player_id);
        db.prepare("UPDATE sports_bets SET status = 'won', payout = ? WHERE id = ?").run(payout, bet.id);
      } else if (bet.bet_type === 'winner') {
        db.prepare("UPDATE sports_bets SET status = 'lost' WHERE id = ?").run(bet.id);
      }
    }
  }
}

// ===== DB SETUP =====
function ensureTables() {
  const db = getDb();
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS sports_matches (
      id INTEGER PRIMARY KEY,
      team1 TEXT NOT NULL,
      team2 TEXT NOT NULL,
      team1_odds REAL NOT NULL,
      team2_odds REAL NOT NULL,
      map TEXT,
      format TEXT DEFAULT 'bo1',
      status TEXT DEFAULT 'upcoming',
      score1 INTEGER DEFAULT 0,
      score2 INTEGER DEFAULT 0,
      round_log TEXT,
      starts_at INTEGER,
      resolved_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    )`);
  } catch (e) { /* exists */ }
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS sports_bets (
      id INTEGER PRIMARY KEY,
      match_id INTEGER,
      player_id INTEGER,
      bet_type TEXT NOT NULL,
      selection TEXT NOT NULL,
      amount REAL NOT NULL,
      odds_at_bet REAL NOT NULL,
      payout REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      timestamp INTEGER DEFAULT (strftime('%s','now'))
    )`);
  } catch (e) { /* exists */ }
}

let tablesReady = false;
function init() {
  if (!tablesReady) {
    ensureTables();
    tablesReady = true;
  }
}

// ===== CS:GO TEAM DATA =====
const TEAMS = [
  { name: 'Navi', rating: 95, color: '#f0c000' },
  { name: 'FaZe', rating: 92, color: '#e04040' },
  { name: 'G2', rating: 90, color: '#222222' },
  { name: 'Vitality', rating: 91, color: '#ffd700' },
  { name: 'MOUZ', rating: 87, color: '#e01020' },
  { name: 'Spirit', rating: 88, color: '#5050e0' },
  { name: 'Heroic', rating: 84, color: '#3366cc' },
  { name: 'Cloud9', rating: 85, color: '#009fdf' },
  { name: 'Liquid', rating: 86, color: '#002b5c' },
  { name: 'ENCE', rating: 82, color: '#1d428a' },
  { name: 'Astralis', rating: 83, color: '#e41e24' },
  { name: 'NiP', rating: 81, color: '#c9a64a' },
  { name: 'Fnatic', rating: 80, color: '#ff5900' },
  { name: 'BIG', rating: 79, color: '#222222' },
  { name: 'Complexity', rating: 78, color: '#00213a' },
  { name: 'Monte', rating: 76, color: '#1a1a2e' },
];

const MAPS = ['Dust2', 'Mirage', 'Inferno', 'Nuke', 'Ancient', 'Anubis', 'Vertigo'];

// ===== ODDS CALCULATION =====
function calculateOdds(rating1, rating2) {
  // Convert ratings to win probabilities using Elo-like formula
  const diff = rating1 - rating2;
  const prob1 = 1 / (1 + Math.pow(10, -diff / 20));
  const prob2 = 1 - prob1;

  // Convert to decimal odds with ~5% margin
  const margin = 1.05;
  const odds1 = Math.round((margin / prob1) * 100) / 100;
  const odds2 = Math.round((margin / prob2) * 100) / 100;

  return { odds1: Math.max(1.05, odds1), odds2: Math.max(1.05, odds2), prob1, prob2 };
}

// ===== MATCH GENERATION =====
function generateMatches() {
  init();
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);

  // Count upcoming matches
  const upcoming = db.prepare(
    "SELECT COUNT(*) as c FROM sports_matches WHERE status = 'upcoming'"
  ).get();
  if (upcoming && upcoming.c >= 6) return; // Max 6 upcoming

  // Generate 3-4 new matches
  const count = 3 + Math.floor(Math.random() * 2);
  const shuffled = [...TEAMS].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count && i * 2 + 1 < shuffled.length; i++) {
    const team1 = shuffled[i * 2];
    const team2 = shuffled[i * 2 + 1];
    const map = MAPS[Math.floor(Math.random() * MAPS.length)];
    const format = Math.random() > 0.7 ? 'bo3' : 'bo1';
    const { odds1, odds2 } = calculateOdds(team1.rating, team2.rating);

    // Match starts in 5-15 minutes
    const startsAt = now + 300 + Math.floor(Math.random() * 600);

    db.prepare(`INSERT INTO sports_matches (team1, team2, team1_odds, team2_odds, map, format, status, starts_at)
      VALUES (?, ?, ?, ?, ?, ?, 'upcoming', ?)`).run(
      team1.name, team2.name, odds1, odds2, map, format, startsAt
    );
  }
}

// ===== MATCH SIMULATION =====
function simulateRound(team1Rating, team2Rating) {
  // Simulate a single round
  const diff = team1Rating - team2Rating;
  const prob1 = 1 / (1 + Math.pow(10, -diff / 25));
  return Math.random() < prob1 ? 1 : 2;
}

function simulateMap(team1, team2) {
  const team1Data = TEAMS.find(t => t.name === team1) || { rating: 80 };
  const team2Data = TEAMS.find(t => t.name === team2) || { rating: 80 };

  let score1 = 0, score2 = 0;
  const rounds = [];

  // First half (12 rounds)
  for (let i = 0; i < 12; i++) {
    const winner = simulateRound(team1Data.rating, team2Data.rating);
    if (winner === 1) score1++; else score2++;
    rounds.push({ round: i + 1, winner, score: [score1, score2] });
  }

  // Second half (swap sides — slight adjustment)
  for (let i = 12; i < 24; i++) {
    const winner = simulateRound(team1Data.rating + 1, team2Data.rating + 1);
    if (winner === 1) score1++; else score2++;
    rounds.push({ round: i + 1, winner, score: [score1, score2] });

    // Check for win at 13 rounds
    if (score1 >= 13 || score2 >= 13) break;
  }

  // Overtime if tied 12-12
  while (score1 === score2) {
    // OT: first to 4 with 3 round halves
    let otScore1 = 0, otScore2 = 0;
    for (let j = 0; j < 6; j++) {
      const winner = simulateRound(team1Data.rating, team2Data.rating);
      if (winner === 1) { otScore1++; score1++; } else { otScore2++; score2++; }
      rounds.push({ round: rounds.length + 1, winner, score: [score1, score2] });
      if (otScore1 >= 4 || otScore2 >= 4) break;
    }
  }

  return { score1, score2, rounds, winner: score1 > score2 ? 1 : 2 };
}

function simulateMatch(match) {
  const db = getDb();

  if (match.format === 'bo3') {
    // Best of 3 maps
    let maps1 = 0, maps2 = 0;
    let totalScore1 = 0, totalScore2 = 0;
    const allRounds = [];
    const mapList = [...MAPS].sort(() => Math.random() - 0.5).slice(0, 3);

    for (let m = 0; m < 3 && maps1 < 2 && maps2 < 2; m++) {
      const result = simulateMap(match.team1, match.team2);
      totalScore1 += result.score1;
      totalScore2 += result.score2;
      allRounds.push({ map: mapList[m], ...result });
      if (result.winner === 1) maps1++; else maps2++;
    }

    const winner = maps1 > maps2 ? 1 : 2;
    db.prepare(
      'UPDATE sports_matches SET status = ?, score1 = ?, score2 = ?, round_log = ?, resolved_at = ? WHERE id = ?'
    ).run('completed', maps1, maps2, JSON.stringify(allRounds), Math.floor(Date.now() / 1000), match.id);

    return { winner, score1: maps1, score2: maps2 };
  } else {
    // BO1
    const result = simulateMap(match.team1, match.team2);
    db.prepare(
      'UPDATE sports_matches SET status = ?, score1 = ?, score2 = ?, round_log = ?, resolved_at = ? WHERE id = ?'
    ).run('completed', result.score1, result.score2, JSON.stringify(result.rounds), Math.floor(Date.now() / 1000), match.id);

    return { winner: result.winner, score1: result.score1, score2: result.score2 };
  }
}

function processLiveMatches() {
  init();
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);

  // Move upcoming matches to live when start time passes
  const readyToStart = db.prepare(
    "SELECT * FROM sports_matches WHERE status = 'upcoming' AND starts_at <= ?"
  ).all(now);

  for (const match of readyToStart) {
    db.prepare("UPDATE sports_matches SET status = 'live' WHERE id = ?").run(match.id);
  }

  // Simulate live matches (progress rounds)
  const liveMatches = db.prepare(
    "SELECT * FROM sports_matches WHERE status = 'live'"
  ).all();

  for (const match of liveMatches) {
    // Simulate the full match
    const result = simulateMatch(match);

    // Resolve bets
    resolveBets(match.id, result.winner, match);
  }
}

function resolveBets(matchId, winner, match) {
  const db = getDb();

  const bets = db.prepare(
    "SELECT * FROM sports_bets WHERE match_id = ? AND status = 'pending'"
  ).all(matchId);

  const updatedMatch = db.prepare('SELECT * FROM sports_matches WHERE id = ?').get(matchId);
  const totalRounds = (updatedMatch.score1 || 0) + (updatedMatch.score2 || 0);

  for (const bet of bets) {
    let won = false;
    let payout = 0;

    switch (bet.bet_type) {
      case 'winner': {
        const winTeam = winner === 1 ? match.team1 : match.team2;
        won = bet.selection === winTeam;
        payout = won ? Math.round(bet.amount * bet.odds_at_bet * 100) / 100 : 0;
        break;
      }
      case 'over_rounds': {
        const threshold = parseFloat(bet.selection);
        won = totalRounds > threshold;
        payout = won ? Math.round(bet.amount * bet.odds_at_bet * 100) / 100 : 0;
        break;
      }
      case 'under_rounds': {
        const threshold = parseFloat(bet.selection);
        won = totalRounds < threshold;
        payout = won ? Math.round(bet.amount * bet.odds_at_bet * 100) / 100 : 0;
        break;
      }
      default:
        won = false;
    }

    const status = won ? 'won' : 'lost';
    db.prepare('UPDATE sports_bets SET status = ?, payout = ? WHERE id = ?')
      .run(status, payout, bet.id);

    if (won && payout > 0) {
      addToWallet(bet.player_id, payout);
      db.prepare('UPDATE players SET total_earned = total_earned + ? WHERE id = ?')
        .run(payout - bet.amount, bet.player_id);

      db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
        .run(bet.player_id, 'sports_win', payout, `Won sports bet: ${match.team1} vs ${match.team2}`);

      // Wall post for big wins (5x+ payout)
      if (payout >= bet.amount * 5) {
        const player = db.prepare('SELECT name FROM players WHERE id = ?').get(bet.player_id);
        if (player) {
          db.prepare('INSERT INTO wall_posts (player_id, message, type) VALUES (?, ?, ?)')
            .run(bet.player_id, `${player.name} hit a ${bet.odds_at_bet}x sports bet on ${bet.selection}! Won $${payout.toFixed(2)}`, 'sports');
        }
      }
    }

    // Log game history
    db.prepare('INSERT INTO game_history (game_type, player_id, wager, result, profit_loss) VALUES (?, ?, ?, ?, ?)')
      .run('sports', bet.player_id, bet.amount, won ? 'win' : 'loss', won ? payout - bet.amount : -bet.amount);
  }
}

// ===== BACKGROUND LOOPS =====
function startSportsEngine() {
  generateMatches();

  // Generate new matches every 5 minutes
  setInterval(() => {
    generateMatches();
  }, 5 * 60 * 1000);

  // Process live matches every 15 seconds
  setInterval(() => {
    processLiveMatches();
  }, 15 * 1000);
}

// ===== ROUTES =====

// GET /api/sports/matches — upcoming matches with odds
router.get('/matches', (req, res) => {
  init();
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);

  const matches = db.prepare(
    "SELECT * FROM sports_matches WHERE status = 'upcoming' ORDER BY starts_at ASC"
  ).all();

  const result = matches.map(m => {
    const team1Data = TEAMS.find(t => t.name === m.team1) || { color: '#666' };
    const team2Data = TEAMS.find(t => t.name === m.team2) || { color: '#666' };
    return {
      ...m,
      team1_color: team1Data.color,
      team2_color: team2Data.color,
      time_until_start: Math.max(0, m.starts_at - now),
      over_under_line: m.format === 'bo3' ? 2.5 : 26.5,
      over_odds: 1.85 + Math.random() * 0.3,
      under_odds: 1.85 + Math.random() * 0.3,
    };
  });

  res.json(result);
});

// GET /api/sports/live — currently running matches
router.get('/live', (req, res) => {
  init();
  const db = getDb();

  const matches = db.prepare(
    "SELECT * FROM sports_matches WHERE status = 'live' ORDER BY starts_at ASC"
  ).all();

  const result = matches.map(m => {
    const team1Data = TEAMS.find(t => t.name === m.team1) || { color: '#666' };
    const team2Data = TEAMS.find(t => t.name === m.team2) || { color: '#666' };
    let roundLog = [];
    try { roundLog = JSON.parse(m.round_log || '[]'); } catch (e) {}
    return {
      ...m,
      team1_color: team1Data.color,
      team2_color: team2Data.color,
      round_log: roundLog,
    };
  });

  res.json(result);
});

// GET /api/sports/results — completed matches
router.get('/results', (req, res) => {
  init();
  const db = getDb();
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  const matches = db.prepare(
    "SELECT * FROM sports_matches WHERE status = 'completed' ORDER BY resolved_at DESC LIMIT ?"
  ).all(limit);

  const result = matches.map(m => {
    const team1Data = TEAMS.find(t => t.name === m.team1) || { color: '#666' };
    const team2Data = TEAMS.find(t => t.name === m.team2) || { color: '#666' };
    return {
      ...m,
      team1_color: team1Data.color,
      team2_color: team2Data.color,
    };
  });

  res.json(result);
});

// POST /api/sports/bet — place a bet
router.post('/bet', (req, res) => {
  init();
  const db = getDb();
  const { playerId, matchId, betType, selection, amount } = req.body;

  if (!playerId || !matchId || !betType || !selection || !amount) {
    return res.status(400).json({ error: 'playerId, matchId, betType, selection, and amount required' });
  }
  if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  if (player.wallet < amount) return res.status(400).json({ error: 'Insufficient funds' });

  const match = db.prepare(
    "SELECT * FROM sports_matches WHERE id = ? AND status = 'upcoming'"
  ).get(matchId);
  if (!match) return res.status(404).json({ error: 'Match not found or already started' });

  // Determine odds for bet
  let odds;
  switch (betType) {
    case 'winner':
      odds = selection === match.team1 ? match.team1_odds : match.team2_odds;
      break;
    case 'over_rounds':
      odds = 1.85 + Math.random() * 0.3;
      break;
    case 'under_rounds':
      odds = 1.85 + Math.random() * 0.3;
      break;
    default:
      return res.status(400).json({ error: 'Invalid bet type' });
  }

  odds = Math.round(odds * 100) / 100;

  // Deduct from wallet
  deductFromWallet(playerId, amount);

  // Record bet
  db.prepare(
    'INSERT INTO sports_bets (match_id, player_id, bet_type, selection, amount, odds_at_bet) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(matchId, playerId, betType, selection, amount, odds);

  // Transaction log
  db.prepare('INSERT INTO transactions (player_id, type, amount, description) VALUES (?, ?, ?, ?)')
    .run(playerId, 'sports_bet', -amount, `Sports bet on ${match.team1} vs ${match.team2}: ${betType} ${selection}`);

  const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);

  res.json({
    bet: { matchId, betType, selection, amount, odds },
    player: updatedPlayer,
  });
});

// GET /api/sports/my-bets/:playerId — player's bet history
router.get('/my-bets/:playerId', (req, res) => {
  init();
  const db = getDb();

  const bets = db.prepare(`
    SELECT sb.*, sm.team1, sm.team2, sm.score1, sm.score2, sm.status as match_status, sm.map, sm.format
    FROM sports_bets sb
    JOIN sports_matches sm ON sb.match_id = sm.id
    WHERE sb.player_id = ?
    ORDER BY sb.timestamp DESC
    LIMIT 50
  `).all(req.params.playerId);

  res.json(bets);
});

// GET /api/sports/teams — team info
router.get('/teams', (req, res) => {
  res.json(TEAMS.map(t => ({ name: t.name, color: t.color })));
});

// Delay engine start until DB is ready
setTimeout(() => {
  try { startSportsEngine(); } catch (e) { console.error('[Sports] Engine start failed:', e.message); }
}, 5000);

// ===== REAL SPORTS SYNC (if API key is set) =====
if (REAL_SPORTS_ENABLED) {
  console.log('[Sports] Real sports enabled via The Odds API');
  // Initial sync after 5 seconds
  setTimeout(() => {
    syncRealMatches().catch(e => console.error('[Sports] Sync error:', e.message));
  }, 5000);
  // Then every 15 minutes
  setInterval(() => {
    syncRealMatches().catch(e => console.error('[Sports] Sync error:', e.message));
    resolveRealMatches().catch(e => console.error('[Sports] Resolve error:', e.message));
  }, 15 * 60 * 1000);
} else {
  console.log('[Sports] Real sports disabled (no ODDS_API_KEY). Using simulated CS:GO matches.');
}

// Status endpoint
router.get('/status', (req, res) => {
  res.json({
    realSportsEnabled: REAL_SPORTS_ENABLED,
    simulatedEnabled: true,
    apiKeySet: ODDS_API_KEY.length > 0,
    message: REAL_SPORTS_ENABLED
      ? 'Real sports data active (NFL, NBA, MLB, NHL, Soccer, MMA)'
      : 'Set ODDS_API_KEY env var for real sports. Currently using simulated CS:GO matches.',
  });
});

module.exports = router;
