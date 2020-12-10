const videoPublishingProjection = require("./video-publishing-projection");

async function loadVideo(context) {
  const { messageStore, command } = context;
  const videoStreamName = `videoPublishing-${command.data.videoId}`;

  const video = await messageStore.fetch(
    videoStreamName,
    videoPublishingProjection
  );
  context.video = video;
  return context;
}

module.exports = loadVideo;
