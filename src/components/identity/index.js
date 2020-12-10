const loadIdentity = require("./load-identity");
const ensureNotRegistered = require("./ensure-not-registered");
const writeRegisteredEvent = require("./write-registered-event");
const AlreadySentRegistrationEmailError = require("./already-sent-registration-email-error");
const AlreadyRegisteredError = require("./already-registered-error");
const ensureRegistrationEmailNotSent = require("./ensure-registration-email-not-sent");
const renderRegistrationEmail = require("./render-registration-email");
const writeSendCommand = require("./write-send-command");
const writeRegistrationEmailSentEvent = require("./write-registration-email-sent-event");

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
        if (error instanceof AlreadyRegisteredError) {
          return;
        }
        throw error;
      }
    }
  };
}

function createIdentityEventHandlers({ messageStore }) {
  return {
    Registered: async event => {
      const context = {
        messageStore,
        event,
        identityId: event.data.userId
      };
      try {
        const identityContext = await loadIdentity(context);
        const notSendContext = await ensureRegistrationEmailNotSent(
          identityContext
        );
        const renderContext = await renderRegistrationEmail(notSendContext);
        const event = writeSendCommand(renderContext);
        return event;
      } catch (error) {
        if (error instanceof AlreadySentRegistrationEmailError) {
          return;
        }
        throw error;
      }
    }
  };
}

function streamNameToId(streamName) {
  return streamName.split(/-(.+)/)[1];
}

function createSendEmailEventHandler({ messageStore }) {
  return {
    Sent: async event => {
      const originStreamName = event.metadata.originStreamName;
      const identityId = streamNameToId(originStreamName);
      const context = {
        messageStore,
        event,
        identityId
      };

      try {
        const identityContext = await loadIdentity(context);
        const notSentContext = await ensureRegistrationEmailNotSent(
          identityContext
        );
        const event = await writeRegistrationEmailSentEvent(notSentContext);
        return event;
      } catch (error) {
        if (error instanceof AlreadySentRegistrationEmailError) {
          return;
        }
        throw error;
      }
    }
  };
}

function build({ messageStore }) {
  const identityCommandHandlers = createIdentityCommandHandlers({
    messageStore
  });
  const identityEventHandlers = createIdentityEventHandlers({ messageStore });

  const identityCommandSubscription = messageStore.createSubscription({
    streamName: "identity:command",
    handlers: identityCommandHandlers,
    subscriberId: "components:identity:command"
  });
  const identityEventSubscription = messageStore.createSubscription({
    streamName: "identity",
    handlers: identityEventHandlers,
    subscriberId: "components:identity"
  });

  const sendEmailEventHandlers = createSendEmailEventHandler({ messageStore });
  const sendEmailEventSubscription = messageStore.createSubscription({
    streamName: "sendEmail",
    handlers: sendEmailEventHandlers,
    originStreamName: "identity",
    subscriberId: "components:identity:sendEmailEvents"
  });

  function start() {
    identityCommandSubscription.start();
    identityEventSubscription.start();
    sendEmailEventSubscription.start();
  }

  return {
    identityCommandHandlers,
    identityEventHandlers,
    sendEmailEventHandlers,
    start
  };
}

module.exports = build;
