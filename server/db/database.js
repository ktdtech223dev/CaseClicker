const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Use user's appdata for DB in packaged Electron, project root otherwise
function getDbPath() {
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    // Electron portable — save next to the exe
    return path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'casesim.db');
  }
  if (process.env.APPDATA && process.resourcesPath) {
    // Electron installed — save in appdata
    const dir = path.join(process.env.APPDATA, 'CaseClicker');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, 'casesim.db');
  }
  // Railway — use persistent volume if available
  if (process.env.RAILWAY_VOLUME_MOUNT_PATH) {
    return path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'casesim.db');
  }
  // Dev / fallback — save in project root
  return path.join(__dirname, '..', '..', 'casesim.db');
}

const DB_PATH = getDbPath();
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;
let SQL = null;

// Compatibility wrapper around sql.js to mimic better-sqlite3 API
// so all route files work unchanged
class StatementWrapper {
  constructor(database, sql) {
    this._db = database;
    this._sql = sql;
  }

  run(...params) {
    const flatParams = flattenParams(params);
    this._db.run(this._sql, flatParams);
    const lastId = this._db.exec('SELECT last_insert_rowid() as id');
    const changes = this._db.getRowsModified();
    return {
      lastInsertRowid: lastId.length > 0 ? lastId[0].values[0][0] : 0,
      changes,
    };
  }

  get(...params) {
    const flatParams = flattenParams(params);
    try {
      const stmt = this._db.prepare(this._sql);
      if (flatParams.length > 0) stmt.bind(flatParams);
      if (stmt.step()) {
        const cols = stmt.getColumnNames();
        const vals = stmt.get();
        stmt.free();
        const row = {};
        for (let i = 0; i < cols.length; i++) row[cols[i]] = vals[i];
        return row;
      }
      stmt.free();
      return undefined;
    } catch (e) {
      console.error('SQL get error:', e.message, this._sql);
      return undefined;
    }
  }

  all(...params) {
    const flatParams = flattenParams(params);
    try {
      const stmt = this._db.prepare(this._sql);
      if (flatParams.length > 0) stmt.bind(flatParams);
      const rows = [];
      while (stmt.step()) {
        const cols = stmt.getColumnNames();
        const vals = stmt.get();
        const row = {};
        for (let i = 0; i < cols.length; i++) row[cols[i]] = vals[i];
        rows.push(row);
      }
      stmt.free();
      return rows;
    } catch (e) {
      console.error('SQL all error:', e.message, this._sql);
      return [];
    }
  }
}

function flattenParams(params) {
  if (params.length === 0) return [];
  if (params.length === 1 && Array.isArray(params[0])) return params[0];
  return params;
}

class DatabaseWrapper {
  constructor(sqlDb) {
    this._db = sqlDb;
  }

  prepare(sql) {
    return new StatementWrapper(this._db, sql);
  }

  exec(sql) {
    this._db.run(sql);
  }

  pragma(str) {
    try {
      this._db.run(`PRAGMA ${str}`);
    } catch (e) {
      // Some pragmas may not be supported in sql.js
    }
  }

  // Save database to disk
  save() {
    try {
      const data = this._db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_PATH, buffer);
    } catch (e) {
      console.error('DB save error:', e.message);
    }
  }
}

let dbWrapper = null;
let saveInterval = null;

async function initDb() {
  if (dbWrapper) return dbWrapper;

  SQL = await initSqlJs();

  // Load existing DB or create new
  let sqlDb;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(fileBuffer);
  } else {
    sqlDb = new SQL.Database();
  }

  dbWrapper = new DatabaseWrapper(sqlDb);

  // Run schema
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  // Split by semicolons and run each statement
  const statements = schema.split(';').filter(s => s.trim().length > 0);
  for (const stmt of statements) {
    try {
      sqlDb.run(stmt + ';');
    } catch (e) {
      // Table already exists etc - ignore
    }
  }

  // Migration: add new columns to players table
  const migrations = [
    'ALTER TABLE players ADD COLUMN prestige_level INTEGER DEFAULT 0',
    'ALTER TABLE players ADD COLUMN prestige_multiplier REAL DEFAULT 1.0',
    'ALTER TABLE players ADD COLUMN lifetime_earned REAL DEFAULT 0',
    'ALTER TABLE players ADD COLUMN last_active_at INTEGER DEFAULT 0',
    'ALTER TABLE players ADD COLUMN global_multiplier REAL DEFAULT 0',
    'ALTER TABLE players ADD COLUMN cases_dropped INTEGER DEFAULT 0',
    'ALTER TABLE inventory ADD COLUMN locked INTEGER DEFAULT 0',
  ];
  for (const sql of migrations) {
    try { dbWrapper.exec(sql); } catch (e) { /* column already exists */ }
  }

  // Seed default players if none exist
  const countResult = sqlDb.exec('SELECT COUNT(*) as c FROM players');
  const count = countResult.length > 0 ? countResult[0].values[0][0] : 0;
  if (count === 0) {
    sqlDb.run("INSERT INTO players (name, avatar, ngames_id, color, wallet) VALUES ('Keshawn', 'agent_ct_1', 'keshawn', '#80e060', 10.00)");
    sqlDb.run("INSERT INTO players (name, avatar, ngames_id, color, wallet) VALUES ('Sean', 'agent_ct_2', 'sean', '#f0c040', 10.00)");
    sqlDb.run("INSERT INTO players (name, avatar, ngames_id, color, wallet) VALUES ('Dart', 'agent_t_1', 'dart', '#e04040', 10.00)");
    sqlDb.run("INSERT INTO players (name, avatar, ngames_id, color, wallet) VALUES ('Amari', 'agent_t_2', 'amari', '#40c0e0', 10.00)");
  }

  // Auto-save every 10 seconds
  saveInterval = setInterval(() => dbWrapper.save(), 10000);

  // Save on exit
  process.on('exit', () => dbWrapper.save());
  process.on('SIGINT', () => { dbWrapper.save(); process.exit(); });
  process.on('SIGTERM', () => { dbWrapper.save(); process.exit(); });

  return dbWrapper;
}

// Synchronous getter - returns the wrapper after init
// For backward compatibility with getDb() calls in routes
function getDb() {
  if (!dbWrapper) {
    throw new Error('Database not initialized. Call await initDb() first.');
  }
  return dbWrapper;
}

/**
 * Safe wallet operations — reads current value, does math in JS, writes absolute result.
 * This avoids sql.js type coercion bugs where "wallet + ?" can produce NaN or 0.
 */
function addToWallet(playerId, amount) {
  const db = getDb();
  const player = db.prepare('SELECT wallet, total_earned, lifetime_earned FROM players WHERE id = ?').get(playerId);
  if (!player) return;
  const amt = Number(amount) || 0;
  if (amt === 0) return;
  const newWallet = Math.round(((Number(player.wallet) || 0) + amt) * 100) / 100;
  const newEarned = Math.round(((Number(player.total_earned) || 0) + (amt > 0 ? amt : 0)) * 100) / 100;
  const newLifetime = Math.round(((Number(player.lifetime_earned) || 0) + (amt > 0 ? amt : 0)) * 100) / 100;
  db.prepare('UPDATE players SET wallet = ?, total_earned = ?, lifetime_earned = ? WHERE id = ?')
    .run(newWallet, newEarned, newLifetime, playerId);
  return newWallet;
}

function deductFromWallet(playerId, amount) {
  const db = getDb();
  const player = db.prepare('SELECT wallet FROM players WHERE id = ?').get(playerId);
  if (!player) return false;
  const wallet = Number(player.wallet) || 0;
  const amt = Number(amount) || 0;
  if (wallet < amt) return false;
  db.prepare('UPDATE players SET wallet = ? WHERE id = ?')
    .run(Math.round((wallet - amt) * 100) / 100, playerId);
  return true;
}

module.exports = { initDb, getDb, addToWallet, deductFromWallet };
