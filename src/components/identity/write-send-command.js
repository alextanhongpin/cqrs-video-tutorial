const uuid = require("uuid");

const uuidv5Namespace = "02561cb6-4929-41ec-b84e-d3de370fd5d2";

async function writeSendCommand(context, err) {
  const event = context.event;
  const identity = context.identity;
  const email = context.email;

  const emailId = uuid.v5(identity.email, uuidv5Namespace);
  const sendEmailCommand = {
    id: uuid.v4(),
    type: "Send",
    metadata: {
      originStreamName: `identity-${identity.id}`,
      traceId: event.metadata.traceId,
      userId: event.metadata.userId
    },
    data: {
      emailId,
      to: identity.email,
      subject: email.subject,
      text: email.text,
      html: email.html
    }
  };
  const streamName = `sendEmail:command-${emailId}`;
  await context.messageStore.write(streamName, sendEmailCommand);
  return context;
}

module.exports = writeSendCommand;
