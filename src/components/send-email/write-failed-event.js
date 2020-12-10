const uuid = require("uuid");
async function writeFailedEvent(context, err) {
  const sendCommand = context.sendCommand;
  const streamName = `sendEmail-${sendCommand.data.emailId}`;
  const event = {
    id: uuid.v4(),
    type: "Failed",
    metadata: {
      originStreamName: sendCommand.metadata.originStreamName,
      traceId: sendCommand.metadata.traceId,
      userId: sendCommand.metadata.userId
    },
    data: {
      ...sendCommand.data,
      reason: err.message
    }
  };

  await context.messageStore.write(streamName, event);
  return context;
}

module.exports = writeFailedEvent;
