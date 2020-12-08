const uuid = require("uuid");

async function writeRegisteredEvent(context, err) {
  const command = context.command;

  const registeredEvent = {
    id: uuid.v4(),
    type: "Registered",
    metadata: {
      traceId: command.metadata.traceId,
      userId: command.metadata.userId
    },
    data: {
      userId: command.data.userId,
      email: command.data.email,
      passwordHash: command.data.passwordHash
    }
  };
  const identityStreamName = `identity-${command.data.userId}`;
  await context.messageStore.write(identityStreamName, registeredEvent);
  return context;
}

module.exports = writeRegisteredEvent;
