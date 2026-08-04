const express = require('express');
const { pool } = require('../db');
const asyncHandler = require('../asyncHandler');

const router = express.Router();

const CATEGORIES = ['Productive', 'Hobbies', 'Health'];
const ASSIGNEES = ['jake', 'paula', 'both'];

router.post('/weeks/:weekId/quests', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM weeks WHERE id = $1', [req.params.weekId]);
  if (rows.length === 0) return res.status(404).json({ error: 'Week not found' });
  const week = rows[0];
  if (week.status !== 'active') return res.status(400).json({ error: 'Week is not active' });

  const { category, name, difficulty, assignee, target_count } = req.body;
  if (!CATEGORIES.includes(category)) return res.status(400).json({ error: 'Invalid category' });
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
    return res.status(400).json({ error: 'Difficulty must be an integer 1-5' });
  }
  if (!ASSIGNEES.includes(assignee)) return res.status(400).json({ error: 'Invalid assignee' });
  const targetCount = target_count === undefined ? 1 : target_count;
  if (!Number.isInteger(targetCount) || targetCount < 1 || targetCount > 14) {
    return res.status(400).json({ error: 'Target count must be an integer 1-14' });
  }

  // 'both' is a creation-time convenience only: it expands into two
  // independent rows (one per participant) rather than being stored as-is,
  // so completing one copy never affects the other person's.
  const owners = assignee === 'both' ? ['jake', 'paula'] : [assignee];
  const created = [];
  for (const owner of owners) {
    const { rows: questRows } = await pool.query(
      'INSERT INTO quests (week_id, category, name, difficulty, assignee, target_count) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [week.id, category, name.trim(), difficulty, owner, targetCount]
    );
    created.push(questRows[0]);
  }

  res.status(201).json(created);
}));

router.patch('/quests/:id', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM quests WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Quest not found' });
  const quest = rows[0];

  let progress;
  if (req.body.progress !== undefined) {
    if (!Number.isInteger(req.body.progress) || req.body.progress < 0) {
      return res.status(400).json({ error: 'Progress must be a non-negative integer' });
    }
    progress = Math.min(req.body.progress, quest.target_count);
  } else {
    // Back-compat for plain single-tick quests toggled via {completed}.
    progress = req.body.completed ? quest.target_count : 0;
  }
  const completed = progress >= quest.target_count;

  const { rows: updatedRows } = await pool.query(
    'UPDATE quests SET progress = $1, completed = $2, completed_at = $3 WHERE id = $4 RETURNING *',
    [progress, completed, completed ? new Date().toISOString() : null, req.params.id]
  );

  res.json(updatedRows[0]);
}));

router.delete('/quests/:id', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM quests WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Quest not found' });

  await pool.query('DELETE FROM quests WHERE id = $1', [req.params.id]);
  res.status(204).end();
}));

module.exports = router;
