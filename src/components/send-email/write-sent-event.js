const uuid = require("uuid");

async function writeSentEvent(context) {
  const sendCommand = context.sendCommand;
  const streamName = `sendEmail-${sendCommand.data.emailId}`;
  const event = {
    id: uuid.v4(),
    type: "Sent",
    metadata: {
      originStreamName: sendCommand.metadata.originStreamName,
      traceId: sendCommand.metadata.traceId,
      userId: sendCommand.metadata.userId
    },
    data: sendCommand.data
  };
  await context.messageStore.write(streamName, event);
  return context;
}

module.exports = writeSentEvent;
