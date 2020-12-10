async function writeVideoPublishingFailedEvent(err, context) {
  const command = context.command;
  const messageStore = context.messageStore;

  const transcodingFailedEvent = {
    id: uuid.v4(),
    type: "VideoPublishingFailed",
    metadata: {
      traceId: command.metadata.traceId,
      userId: command.metadata.userId
    },
    data: {
      ownerId: command.data.ownerId,
      sourceUri: command.data.sourceUri,
      videoId: command.data.videoId,
      reason: err.message
    }
  };
  const streamName = `videoPublishing-${command.data.videoId}`;
  await messageStore.write(streamName, transcodingFailedEvent);
  return context;
}

module.exports = writeVideoPublishingFailedEvent;
