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
 * @description Writes an event letting us know that email was sent
 * @param {object} context The context
 * @param {string} context.traceId The traceId
 * @param {object} context.messageStore A reference to the Message Store
 * @param {function} context.messageStore.write A function for writing events
 * @param {string} context.sendCommand The command we're handling
 * @return {Promise} A Promise resolving to the context
 */
function writeSentEvent (context) {
  const sendCommand = context.sendCommand
  const streamName = `sendEmail-${sendCommand.data.emailId}`
  const event = {
    id: uuid(),
    type: 'Sent',
    metadata: {
      originStreamName: sendCommand.metadata.originStreamName,
      traceId: sendCommand.metadata.traceId,
      userId: sendCommand.metadata.userId
    },
    data: sendCommand.data
  }

  return context.messageStore.write(streamName, event)
    .then(() => context)
}

module.exports = writeSentEvent
