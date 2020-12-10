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
 * @description Writes a VideoNamed event
 * @param {object} context
 * @param {object} context.command The command we're processing
 */
function writeVideoNamedEvent (context) {
  const command = context.command
  const messageStore = context.messageStore

  const videoNamedEvent = {
    id: uuid(),
    type: 'VideoNamed',
    metadata: {
      traceId: command.metadata.traceId,
      userId: command.metadata.userId
    },
    data: { name: command.data.name }
  }
  const streamName = `videoPublishing-${command.data.videoId}`

  return messageStore.write(streamName, videoNamedEvent).then(() => context)
}

module.exports = writeVideoNamedEvent
