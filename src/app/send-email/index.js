const createSend = require("./send");

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
        const event = await writeSendEvent(sentEmailContext);
        return event;
      } catch (error) {
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
