require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy server/.env.example to server/.env and fill it in.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS seasons (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      number INTEGER NOT NULL,
      name TEXT,
      week_count INTEGER NOT NULL DEFAULT 4,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS weeks (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      season_id INTEGER NOT NULL REFERENCES seasons(id),
      week_number INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS quests (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      week_id INTEGER NOT NULL REFERENCES weeks(id),
      category TEXT NOT NULL CHECK (category IN ('Proactive', 'Leisure', 'Health')),
      name TEXT NOT NULL,
      difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
      assignee TEXT NOT NULL CHECK (assignee IN ('jake', 'paula')),
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      completed_at TIMESTAMPTZ
    );
  `);

  // Migration: earlier versions allowed assignee = 'both' on a single row,
  // shared by both people. 'both' is now expanded into two independent rows
  // at creation time instead, so split any existing 'both' rows into a
  // jake/paula pair (preserving completion state) before tightening the
  // constraint. Idempotent: once no 'both' rows remain, this is a no-op.
  await pool.query(`
    INSERT INTO quests (week_id, category, name, difficulty, assignee, completed, completed_at)
    SELECT week_id, category, name, difficulty, 'paula', completed, completed_at
    FROM quests WHERE assignee = 'both';

    UPDATE quests SET assignee = 'jake' WHERE assignee = 'both';
  `);
  await pool.query(`
    ALTER TABLE quests DROP CONSTRAINT IF EXISTS quests_assignee_check;
    ALTER TABLE quests ADD CONSTRAINT quests_assignee_check CHECK (assignee IN ('jake', 'paula'));
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM participants');
  if (rows[0].count === 0) {
    await pool.query('INSERT INTO participants (key, name) VALUES ($1, $2), ($3, $4)', [
      'jake', 'Jake',
      'paula', 'Paula',
    ]);
  }
}

module.exports = { pool, init };
