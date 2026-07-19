const express = require('express');
const cors = require('cors');

const { init } = require('./db');
const participantsRouter = require('./routes/participants');
const seasonsRouter = require('./routes/seasons');
const weeksRouter = require('./routes/weeks');
const questsRouter = require('./routes/quests');

const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

async function main() {
  await init();

  const app = express();
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json());

  app.use('/api/participants', participantsRouter);
  app.use('/api/seasons', seasonsRouter);
  app.use('/api/weeks', weeksRouter);
  app.use('/api', questsRouter);

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => console.log(`Quest Ledger API listening on :${PORT}`));
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
