const uuid = require("uuid");

async function writeRegistrationEmailSentEvent(context, err) {
  const event = context.event;
  const registrationEmailSentEvent = {
    id: uuid.v4(),
    type: "RegistrationEmailSent",
    metadata: {
      traceId: event.metadata.traceId,
      userId: event.metadata.userId
    },
    data: {
      userId: context.identityId,
      emailId: event.data.emailId
    }
  };

  const identityStreamName = event.metadata.originStreamName;

  await context.messageStore.write(
    identityStreamName,
    registrationEmailSentEvent
  );
  return context;
}

module.exports = writeRegistrationEmailSentEvent;
