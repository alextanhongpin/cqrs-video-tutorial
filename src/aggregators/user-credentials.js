function createQueries({ db }) {
  async function createUserCredential(id, email, passwordHash) {
    await db`
      INSERT INTO user_credential(id, email, password_hash)
      VALUES (${id}, ${email}, ${passwordHash})
      ON CONFLICT DO NOTHING
    `;
  }

  return {
    createUserCredential
  };
}

function createHandlers({ queries }) {
  return {
    Registered: async event =>
      queries.createUserCredential(
        event.data.userId,
        event.data.email,
        event.data.passwordHash
      )
  };
}

function build({ db, messageStore }) {
  const queries = createQueries({ db });
  const handlers = createHandlers({ queries });
  const subscription = messageStore.createSubscription({
    streamName: "identity",
    handlers,
    subscriberId: `aggregators:user-credentials`
  });

  function start() {
    subscription.start();
  }

  return {
    handlers,
    queries,
    start
  };
}

module.exports = build;
