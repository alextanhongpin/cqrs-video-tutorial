const { connect, config } = require("./database");
const migrate = require("./migrate");

// Apps.
const createHomeApp = require("./home");
const createRecordViewingsApp = require("./record-viewings");
const createMessageStore = require("../message-store");
const createRegisterUsersApp = require("./register-users");
const createAuthenticateApp = require("./authenticate");

// Components.
const createIdentityComponent = require("../components/identity");

// Aggregators.
const createHomePageAggregator = require("../aggregators/home-page");
const createUserCredentialsAggregator = require("../aggregators/user-credentials");

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

  // Apps.
  const homeApp = createHomeApp({ db });
  const recordViewingsApp = createRecordViewingsApp({ messageStore });
  const registerUsersApp = createRegisterUsersApp({ db, messageStore });
  const authenticateApp = createAuthenticateApp({ db, messageStore });

  // Aggregators.
  const homePageAggregator = createHomePageAggregator({
    db,
    messageStore
  });
  const userCredentialsAggregator = createUserCredentialsAggregator({
    db,
    messageStore
  });

  // Components.
  const identityComponent = createIdentityComponent({ messageStore });

  const aggregators = [homePageAggregator, userCredentialsAggregator];
  const components = [identityComponent];

  return {
    env,
    aggregators,
    components,
    messageStore,

    // Apps.
    homeApp,
    recordViewingsApp,
    registerUsersApp,
    authenticateApp,

    // Aggregators.
    homePageAggregator,
    userCredentialsAggregator,

    // Components.
    identityComponent
  };
}

module.exports = createConfig;
