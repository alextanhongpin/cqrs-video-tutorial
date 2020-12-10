/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const uuid = require('uuid/v4')

/**
 * @description Writes a VideoPublishingFailed event
 * @param {error} err The error that caused the process to fail
 * @param {object} context
 * @param {object} context.command The command we're processing
 * @returns {Promise<object>} A Promise resolving to the new `context`
 */
function writeVideoPublishingFailedEvent (err, context) {
  const command = context.command
  const messageStore = context.messageStore

  const transcodingFailedEvent = {
    id: uuid(),
    type: 'VideoPublishingFailed',
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
  }
  const streamName = `videoPublishing-${command.data.videoId}`

  return messageStore.write(streamName, transcodingFailedEvent)
    .then(() => context)
}

module.exports = writeVideoPublishingFailedEvent
