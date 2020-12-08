const uuid = require("uuid");

async function writeLoggedInEvent(context) {
  const event = {
    id: uuid.v4(),
    type: "UserLoggedIn",
    metadata: {
      traceId: context.traceId,
      userId: context.userCredential.id
    },
    data: {
      userId: context.userCredential.id
    }
  };

  const streamName = `authenticate-${context.userCredential.id}`;

  await context.messageStore.write(streamName, event);
  return context;
}

module.exports = writeLoggedInEvent;
