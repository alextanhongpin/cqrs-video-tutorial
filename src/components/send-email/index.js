const createSend = require("./send");
const AlreadySentError = require("./already-sent-error");
const ensureEmailHasNotBeenSent = require("./ensure-email-has-not-been-sent");
const loadEmail = require("./load-email");
const sendEmail = require("./send-email");
const writeFailedEvent = require("./write-failed-event");
const writeSentEvent = require("./write-sent-event");

function createHandlers({
  justSendIt,
  messageStore,
  systemSenderEmailAddress
}) {
  return {
    Send: async command => {
      const context = {
        messageStore,
        justSendIt,
        systemSenderEmailAddress,
        sendCommand: command
      };

      try {
        const emailContext = await loadEmail(context);
        const unsendEmailContext = await ensureEmailHasNotBeenSent(
          emailContext
        );
        const sentEmailContext = await sendEmail(unsendEmailContext);
        const event = await writeSentEvent(sentEmailContext);
        return event;
      } catch (error) {
        if (error instanceof AlreadySentError) {
          // No-op.
          return;
        }
        await writeFailedEvent(context, error);
        throw error;
      }
    }
  };
}

function build({ messageStore, systemSenderEmailAddress, transport }) {
  const justSendIt = createSend({ transport });
  const handlers = createHandlers({
    messageStore,
    justSendIt,
    systemSenderEmailAddress
  });

  const subscription = messageStore.createSubscription({
    streamName: "sendEmail:command",
    handlers,
    subscriberId: "components:send-email"
  });

  function start() {
    subscription.start();
  }

  return {
    handlers,
    start
  };
}

module.exports = build;
