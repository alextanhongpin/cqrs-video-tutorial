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
 * @description Writes a VideoPublished event
 * @param {object} context
 * @param {string} context.traceId The traceId for the event
 * @param {string} context.userId The id of the user who started this
 * operation
 * @param {string} context.entityStream The stream the publishing events are in
 * @returns {Promise<object>} A Promise resolving to the new `context`
 */
function writeVideoPublishedEvent (context) {
  const command = context.command
  const messageStore = context.messageStore

  const event = {
    id: uuid(),
    type: 'VideoPublished',
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
  }
  const streamName = `videoPublishing-${command.data.videoId}`

  return messageStore.write(streamName, event)
    .then(() => context)
}

module.exports = writeVideoPublishedEvent
