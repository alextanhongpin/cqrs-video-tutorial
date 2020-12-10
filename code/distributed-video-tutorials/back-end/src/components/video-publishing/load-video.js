/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const videoPublishingProjection = require('./video-publishing-projection')

/**
 * @description Loads the video whose id is at `context.videoId` and adds it to
 * `context`
 * @param {object} context
 * @param {object} context.messageStore A reference to the Message Store
 * @param {string} context.entityStream The stream the publishing events are in
 * @returns {Promise<object>} A Promise resolving to the new `context`
 */
function loadVideo (context) {
  const messageStore = context.messageStore
  const command = context.command
  const videoStreamName = `videoPublishing-${command.data.videoId}`

  return messageStore
    .fetch(videoStreamName, videoPublishingProjection)
    .then(video => {
      context.video = video

      return context
    })
}

module.exports = loadVideo
