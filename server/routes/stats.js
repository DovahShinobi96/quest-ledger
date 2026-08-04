const express = require('express');
const { pool } = require('../db');
const { computeWeekTotals } = require('../scoring');
const asyncHandler = require('../asyncHandler');

const router = express.Router();

const CATEGORIES = ['Productive', 'Hobbies', 'Health'];
const PARTICIPANTS = ['jake', 'paula'];

router.get('/', asyncHandler(async (req, res) => {
  const { rows: weeks } = await pool.query(`
    SELECT weeks.id, weeks.week_number, seasons.number AS season_number
    FROM weeks
    JOIN seasons ON seasons.id = weeks.season_id
    ORDER BY seasons.number ASC, weeks.week_number ASC
  `);

  const weeklyHistory = await Promise.all(
    weeks.map(async (w) => ({
      label: `S${w.season_number} W${w.week_number}`,
      totals: await computeWeekTotals(w.id),
    }))
  );

  const { rows: categoryRows } = await pool.query(`
    SELECT assignee, category, COUNT(*)::int AS count
    FROM quests
    WHERE completed = TRUE
    GROUP BY assignee, category
  `);
  const categoryTotals = {
    jake: Object.fromEntries(CATEGORIES.map((c) => [c, 0])),
    paula: Object.fromEntries(CATEGORIES.map((c) => [c, 0])),
  };
  for (const row of categoryRows) {
    categoryTotals[row.assignee][row.category] = row.count;
  }

  const { rows: lifetimeRows } = await pool.query(`
    SELECT assignee, COUNT(*)::int AS points, COALESCE(SUM(difficulty), 0)::int AS difficulty
    FROM quests
    WHERE completed = TRUE
    GROUP BY assignee
  `);
  const lifetime = {
    jake: { points: 0, difficulty: 0 },
    paula: { points: 0, difficulty: 0 },
  };
  for (const row of lifetimeRows) {
    lifetime[row.assignee] = { points: row.points, difficulty: row.difficulty };
  }
  for (const who of PARTICIPANTS) {
    if (!lifetime[who]) lifetime[who] = { points: 0, difficulty: 0 };
  }

  res.json({ weeklyHistory, categoryTotals, lifetime });
}));

module.exports = router;
