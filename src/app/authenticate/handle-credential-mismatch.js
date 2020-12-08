const uuid = require("uuid");
const AuthenticationError = require("../errors/authentication-error");

async function handleCredentialMismatch(context) {
  const event = {
    id: uuid.v4(),
    type: "UserLoginFailed",
    metadata: {
      traceId: context.traceId,
      userId: null
    },
    data: {
      userId: context.userCredential.id,
      reason: "Incorrect password"
    }
  };

  const streamName = `authentication-${context.userCredential.id}`;

  await context.messageStore.write(streamName, event);
  throw new AuthenticationError();
}

module.exports = handleCredentialMismatch;
