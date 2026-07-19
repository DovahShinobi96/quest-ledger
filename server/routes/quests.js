const express = require('express');
const { pool } = require('../db');
const asyncHandler = require('../asyncHandler');

const router = express.Router();

const CATEGORIES = ['Proactive', 'Leisure', 'Health'];
const ASSIGNEES = ['jake', 'paula', 'both'];

router.post('/weeks/:weekId/quests', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM weeks WHERE id = $1', [req.params.weekId]);
  if (rows.length === 0) return res.status(404).json({ error: 'Week not found' });
  const week = rows[0];
  if (week.status !== 'active') return res.status(400).json({ error: 'Week is not active' });

  const { category, name, difficulty, assignee } = req.body;
  if (!CATEGORIES.includes(category)) return res.status(400).json({ error: 'Invalid category' });
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
    return res.status(400).json({ error: 'Difficulty must be an integer 1-5' });
  }
  if (!ASSIGNEES.includes(assignee)) return res.status(400).json({ error: 'Invalid assignee' });

  const { rows: questRows } = await pool.query(
    'INSERT INTO quests (week_id, category, name, difficulty, assignee) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [week.id, category, name.trim(), difficulty, assignee]
  );

  res.status(201).json(questRows[0]);
}));

router.patch('/quests/:id', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM quests WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Quest not found' });

  const completed = !!req.body.completed;
  const { rows: updatedRows } = await pool.query(
    'UPDATE quests SET completed = $1, completed_at = $2 WHERE id = $3 RETURNING *',
    [completed, completed ? new Date().toISOString() : null, req.params.id]
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
