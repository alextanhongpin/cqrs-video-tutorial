const FAKE_TRANSCODING_DESTINATION = "https://youtube.com";

function transcodeVideo(context) {
  console.log("video transcoded");

  const { video } = context;
  context.transcodeUri = FAKE_TRANSCODING_DESTINATION;
  consle.log(`Transcode ${video.sourceUri} to ${context.transcodedUri}`);
  return context;
}

module.exports = transcodeVideo;
