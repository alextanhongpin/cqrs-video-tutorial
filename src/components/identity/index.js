const loadIdentity = require("./load-identity");
const ensureNotRegistered = require("./ensure-not-registered");
const writeRegisteredEvent = require("./write-registered-event");

function createIdentityCommandHandlers({ messageStore }) {
  return {
    Register: async command => {
      const context = {
        messageStore,
        command,
        identity: command.data.userId
      };

      try {
        const identityContext = await loadIdentity(context);
        const validIdentity = await ensureNotRegistered(identityContext);
        const event = await writeRegisteredEvent(validIdentity);
        return event;
      } catch (error) {
        throw error;
      }
    }
  };
}
function build({ messageStore }) {
  const identityCommandHandlers = createIdentityCommandHandlers({
    messageStore
  });

  const identityCommandSubscription = messageStore.createSubscription({
    streamName: "identity:command",
    handlers: identityCommandHandlers,
    subscriberId: "components:identity:command"
  });

  function start() {
    identityCommandSubscription.start();
  }

  return {
    identityCommandHandlers,
    start
  };
}

module.exports = build;
