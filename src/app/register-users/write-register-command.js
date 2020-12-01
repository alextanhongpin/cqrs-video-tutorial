const uuid = require("uuid");

function writeRegisterCommand(context) {
  const userId = context.attributes.id;
  const stream = `identity:command-${userId}`;
  const command = {
    id: uuid.v4(),
    type: "Register",
    metadata: {
      traceId: context.traceId,
      userId
    },
    data: {
      userId,
      email: context.attributes.email,
      passwordHash: context.passwordHash
    }
  };
  return context.messageStore.write(stream, command);
}

module.exports = writeRegisterCommand;
