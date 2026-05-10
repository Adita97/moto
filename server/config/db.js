const initSqlJs = require("sql.js");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const env = require("./env");

const dbPath = path.resolve(__dirname, "../../", env.DB_PATH);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

let rawDb = null;

function saveDb() {
  if (rawDb) {
    const data = rawDb.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

let saveTimer = null;
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveDb();
    saveTimer = null;
  }, 500);
}

// Wrapper that mimics better-sqlite3's synchronous API
const db = {
  prepare(sql) {
    return {
      run(...params) {
        rawDb.run(sql, params);
        scheduleSave();
        const rid = rawDb.exec("SELECT last_insert_rowid()");
        return { lastInsertRowid: rid[0]?.values[0]?.[0] };
      },
      get(...params) {
        const stmt = rawDb.prepare(sql);
        if (params.length) stmt.bind(params);
        if (stmt.step()) {
          const cols = stmt.getColumnNames();
          const vals = stmt.get();
          stmt.free();
          const row = {};
          cols.forEach((c, i) => (row[c] = vals[i]));
          return row;
        }
        stmt.free();
        return undefined;
      },
      all(...params) {
        const stmt = rawDb.prepare(sql);
        if (params.length) stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
          const cols = stmt.getColumnNames();
          const vals = stmt.get();
          const row = {};
          cols.forEach((c, i) => (row[c] = vals[i]));
          rows.push(row);
        }
        stmt.free();
        return rows;
      },
    };
  },
  exec(sql) {
    rawDb.exec(sql);
    scheduleSave();
  },
};

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath);
    rawDb = new SQL.Database(buf);
  } else {
    rawDb = new SQL.Database();
  }

  rawDb.exec("PRAGMA foreign_keys = ON");

  // Run migrations
  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         TEXT PRIMARY KEY,
      username   TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      family     TEXT NOT NULL,
      used       INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS videos (
      id           TEXT PRIMARY KEY,
      youtube_url  TEXT NOT NULL,
      youtube_id   TEXT NOT NULL,
      title_en     TEXT NOT NULL,
      title_fr     TEXT NOT NULL,
      title_ro     TEXT NOT NULL,
      desc_en      TEXT,
      desc_fr      TEXT,
      desc_ro      TEXT,
      thumbnail    TEXT,
      published_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bikes (
      id         TEXT PRIMARY KEY,
      brand      TEXT NOT NULL,
      model      TEXT NOT NULL,
      year       INTEGER NOT NULL,
      color      TEXT,
      engine     TEXT,
      power      TEXT,
      torque     TEXT,
      weight     TEXT,
      top_speed  TEXT,
      mileage    TEXT,
      hero_video TEXT,
      story_en   TEXT,
      story_fr   TEXT,
      story_ro   TEXT,
      photos     TEXT NOT NULL DEFAULT '[]',
      is_active  INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed admin user if none exist
  const stmt = rawDb.prepare("SELECT COUNT(*) as count FROM users");
  stmt.step();
  const count = stmt.get()[0];
  stmt.free();

  if (count === 0) {
    const id = uuidv4().replace(/-/g, "");
    rawDb.run(
      "INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)",
      [id, env.ADMIN_USERNAME, env.ADMIN_PASSWORD_HASH],
    );
    saveDb();
    console.log(`Admin user "${env.ADMIN_USERNAME}" created.`);
  }

  // Seed default bike if none exist
  const bikeStmt = rawDb.prepare("SELECT COUNT(*) as count FROM bikes");
  bikeStmt.step();
  const bikeCount = bikeStmt.get()[0];
  bikeStmt.free();

  if (bikeCount === 0) {
    const bikeId = uuidv4().replace(/-/g, "");
    const defaultPhotos = JSON.stringify([
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1920&q=85",
      "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800&q=85",
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=85",
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=85",
      "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=85",
    ]);
    rawDb.run(
      `INSERT INTO bikes (id, brand, model, year, color, engine, power, torque, weight, top_speed, mileage, hero_video, story_en, story_fr, story_ro, photos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bikeId,
        "Kawasaki",
        "Z900RS",
        2023,
        "Candy Emerald Green",
        "948 cc inline-4",
        "111 hp @ 8,500 rpm",
        "98.5 Nm @ 6,600 rpm",
        "214 kg (dry)",
        "225 km/h (est.)",
        "12,450 km",
        "/hero.mp4",
        "This is where your personal story goes.",
        "C'est ici que va votre histoire personnelle.",
        "Aici vine povestea ta personală.",
        defaultPhotos,
      ],
    );
    saveDb();
    console.log("Default bike created.");
  }

  // Save on exit
  process.on("exit", saveDb);
  process.on("SIGINT", () => {
    saveDb();
    process.exit();
  });
  process.on("SIGTERM", () => {
    saveDb();
    process.exit();
  });

  return db;
}

module.exports = { initDb, db };
