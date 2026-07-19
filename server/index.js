const { createApp } = require('./app');

const PORT = process.env.PORT || 4001;

createApp()
  .then((app) => {
    app.listen(PORT, () => console.log(`Quest Ledger API listening on :${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
