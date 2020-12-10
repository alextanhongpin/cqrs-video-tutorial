const AlreadyPublishedError = require("./already-published-error");
const ensurePublishingNotAttempted = require("./ensure-publishing-not-attempted");
const loadVideo = require("./load-video");
const transcodeVideo = require("./transcode-video");
const writeVideoPublishedEvent = require("./write-video-published-event");
const writeVideoPublishingFailedEvent = require("./write-video-publishing-failed-event");

function createHandlers({ messageStore }) {
  return {
    PublishVideo: async command => {
      const context = {
        command,
        messageStore
      };

      try {
        const videoContext = await loadVideo(context);
        const notAttemptedContext = await ensurePublishingNotAttempted(
          videoContext
        );
        const transcodedContext = await transcodeVideo(notAttemptedContext);
        const event = await writeVideoPublishedEvent(transcodedContext);
        return event;
      } catch (error) {
        if (error instanceof AlreadyPublishedError) {
          return;
        }
        return writeVideoPublishingFailedEvent(err, context);
      }
    }
  };
}

function build({ messageStore }) {
  const handlers = createHandlers({ messageStore });
  const subscription = messageStore.createSubscription({
    streamName: "videoPublishing:command",
    handlers,
    subscriberId: "video-publishing"
  });

  function start() {
    subscription.start();
  }

  return {
    handlers,
    start
  };
}

module.exports = build;
