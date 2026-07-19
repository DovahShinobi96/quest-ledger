const serverless = require('serverless-http');
const { createApp } = require('../../server/app');

let handlerPromise;

exports.handler = async (event, context) => {
  // Netlify may deliver either the original "/api/..." path or the function's
  // own "/.netlify/functions/api/..." path depending on redirect config;
  // normalize to "/api/..." so the Express app's routes always match.
  event.path = event.path.replace(/^\/\.netlify\/functions\/api/, '/api');

  if (!handlerPromise) {
    handlerPromise = createApp().then((app) => serverless(app));
  }
  const serverlessHandler = await handlerPromise;
  return serverlessHandler(event, context);
};
