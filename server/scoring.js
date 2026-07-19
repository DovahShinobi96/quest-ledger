const { pool } = require('./db');

function emptyTotals() {
  return {
    jake: { points: 0, difficulty: 0 },
    paula: { points: 0, difficulty: 0 },
  };
}

async function computeWeekTotals(weekId) {
  const { rows: quests } = await pool.query('SELECT * FROM quests WHERE week_id = $1', [weekId]);
  const totals = emptyTotals();
  for (const q of quests) {
    if (!q.completed) continue;
    totals[q.assignee].points += 1;
    totals[q.assignee].difficulty += q.difficulty;
  }
  return totals;
}

async function computeSeasonTotals(seasonId) {
  const { rows: weeks } = await pool.query('SELECT id FROM weeks WHERE season_id = $1', [seasonId]);
  const totals = emptyTotals();
  for (const w of weeks) {
    const weekTotals = await computeWeekTotals(w.id);
    totals.jake.points += weekTotals.jake.points;
    totals.jake.difficulty += weekTotals.jake.difficulty;
    totals.paula.points += weekTotals.paula.points;
    totals.paula.difficulty += weekTotals.paula.difficulty;
  }
  return totals;
}

module.exports = { computeWeekTotals, computeSeasonTotals };
