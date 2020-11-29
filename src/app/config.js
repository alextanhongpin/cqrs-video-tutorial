const { connect, config } = require("./database");
const migrate = require("./migrate");
const createHomeApp = require("./home");
const createRecordViewingsApp = require("./record-viewings");
const createMessageStore = require("../message-store");
const createHomePageAggregator = require("../aggregators/home-page");

async function createConfig({ env }) {
  const db = await connect();
  await migrate();

  const messageStoreDb = await connect({
    ...config(),
    database: "message_store",
    connection: {
      search_path: "message_store,public"
    }
  });

  const messageStore = createMessageStore({ db: messageStoreDb });
  const homeApp = createHomeApp({ db });
  const homePageAggregator = createHomePageAggregator({
    db,
    messageStore
  });
  const recordViewingsApp = createRecordViewingsApp({ messageStore });

  const aggregators = [homePageAggregator];
  const components = [];

  return {
    env,
    homeApp,
    recordViewingsApp,
    messageStore,
    aggregators,
    components
  };
}

module.exports = createConfig;
