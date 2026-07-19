const express = require('express');
const cors = require('cors');

const { init } = require('./db');
const participantsRouter = require('./routes/participants');
const seasonsRouter = require('./routes/seasons');
const weeksRouter = require('./routes/weeks');
const questsRouter = require('./routes/quests');
const statsRouter = require('./routes/stats');

async function createApp() {
  await init();

  const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

  const app = express();
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json());

  app.use('/api/participants', participantsRouter);
  app.use('/api/seasons', seasonsRouter);
  app.use('/api/weeks', weeksRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api', questsRouter);

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
