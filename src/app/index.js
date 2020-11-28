const createExpressApp = require("./express");
const createConfig = require("./config");
const env = require("./env");

async function start() {
  const config = await createConfig({ env });
  const app = createExpressApp({ config, env });
  app.listen(env.port, signalAppStart);
}

function signalAppStart() {
  console.log(`${env.appName} started`);
  console.table({ port: env.port, environment: env.env });
}

module.exports = {
  start
};
