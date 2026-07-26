const express = require('express');
const { pool } = require('../db');
const { computeSeasonTotals, computeWeekTotals } = require('../scoring');
const asyncHandler = require('../asyncHandler');

const router = express.Router();

async function serializeSeason(season) {
  const { rows: weeksRaw } = await pool.query(
    'SELECT * FROM weeks WHERE season_id = $1 ORDER BY week_number',
    [season.id]
  );
  const weeks = await Promise.all(
    weeksRaw.map(async (w) => ({ ...w, totals: await computeWeekTotals(w.id) }))
  );

  return {
    ...season,
    weeks,
    totals: await computeSeasonTotals(season.id),
  };
}

router.get('/current', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM seasons WHERE status = 'active' ORDER BY id DESC LIMIT 1"
  );
  if (rows.length === 0) return res.json(null);
  res.json(await serializeSeason(rows[0]));
}));

router.post('/', asyncHandler(async (req, res) => {
  const { rows: existingRows } = await pool.query("SELECT * FROM seasons WHERE status = 'active'");
  if (existingRows.length > 0) return res.status(400).json({ error: 'An active season already exists' });

  const { name, week_count } = req.body;
  const weekCount = Number.isInteger(week_count) && week_count > 0 ? week_count : 4;
  const { rows: maxRows } = await pool.query('SELECT MAX(number) AS "maxNumber" FROM seasons');
  const number = (maxRows[0].maxNumber || 0) + 1;

  const { rows: seasonRows } = await pool.query(
    'INSERT INTO seasons (number, name, week_count) VALUES ($1, $2, $3) RETURNING *',
    [number, name || null, weekCount]
  );
  const season = seasonRows[0];
  await pool.query('INSERT INTO weeks (season_id, week_number) VALUES ($1, 1)', [season.id]);

  res.status(201).json(await serializeSeason(season));
}));

router.post('/:id/end', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM seasons WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Season not found' });
  const season = rows[0];

  await pool.query("UPDATE seasons SET status = 'completed' WHERE id = $1", [season.id]);
  await pool.query(
    "UPDATE weeks SET status = 'completed' WHERE season_id = $1 AND status = 'active'",
    [season.id]
  );

  const { rows: updatedRows } = await pool.query('SELECT * FROM seasons WHERE id = $1', [season.id]);
  res.json(await serializeSeason(updatedRows[0]));
}));

router.post('/:id/weeks', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM seasons WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Season not found' });
  const season = rows[0];
  if (season.status !== 'active') return res.status(400).json({ error: 'Season is not active' });

  const { rows: weeks } = await pool.query(
    'SELECT * FROM weeks WHERE season_id = $1 ORDER BY week_number',
    [season.id]
  );
  if (weeks.length >= season.week_count) {
    return res.status(400).json({ error: 'Season has reached its week limit' });
  }

  const currentWeek = weeks[weeks.length - 1];
  if (currentWeek) {
    await pool.query("UPDATE weeks SET status = 'completed' WHERE id = $1", [currentWeek.id]);
  }
  const { rows: newWeekRows } = await pool.query(
    'INSERT INTO weeks (season_id, week_number) VALUES ($1, $2) RETURNING *',
    [season.id, weeks.length + 1]
  );

  // Carry over anything not ticked off yet; only completed items are left behind.
  if (currentWeek) {
    await pool.query(
      `INSERT INTO quests (week_id, category, name, difficulty, assignee)
       SELECT $1, category, name, difficulty, assignee
       FROM quests WHERE week_id = $2 AND completed = FALSE`,
      [newWeekRows[0].id, currentWeek.id]
    );
  }

  const { rows: updatedRows } = await pool.query('SELECT * FROM seasons WHERE id = $1', [season.id]);
  res.status(201).json(await serializeSeason(updatedRows[0]));
}));

module.exports = router;
