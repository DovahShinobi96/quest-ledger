const express = require('express');
const { pool } = require('../db');
const { computeWeekTotals } = require('../scoring');
const asyncHandler = require('../asyncHandler');

const router = express.Router();

router.get('/:id', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM weeks WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Week not found' });
  const week = rows[0];

  const { rows: quests } = await pool.query(
    'SELECT * FROM quests WHERE week_id = $1 ORDER BY id',
    [week.id]
  );
  res.json({ ...week, quests, totals: await computeWeekTotals(week.id) });
}));

module.exports = router;
