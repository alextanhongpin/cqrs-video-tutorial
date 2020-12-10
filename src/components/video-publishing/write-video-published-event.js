const uuid = require("uuid");

async function writeVideoPublishedEvent(context) {
  const command = context.command;
  const messageStore = context.messageStore;
  const event = {
    id: uuid.v4(),
    type: "VideoPublished",
    metadata: {
      traceId: command.metadata.traceId,
      userId: command.metadata.userId
    },
    data: {
      ownerId: command.data.ownerId,
      sourceUri: command.data.sourceUri,
      transcodedUri: context.transcodedUri,
      videoId: command.data.videoId
    }
  };

  const streamName = `videoPublishing-${command.data.videoId}`;
  await messageStore.write(streamName, event);
  return context;
}

module.exports = writeVideoPublishedEvent;
