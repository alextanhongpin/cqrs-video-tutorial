const { connect } = require("./database");
const migrate = require("./migrate");
const createHomeApp = require("./home");
const createRecordViewingsApp = require("./record-viewings");

async function createConfig({ env }) {
  const db = await connect();
  await migrate();

  const homeApp = createHomeApp({ db });
  const recordViewingsApp = createRecordViewingsApp({ db });
  return { env, homeApp, recordViewingsApp };
}

module.exports = createConfig;
