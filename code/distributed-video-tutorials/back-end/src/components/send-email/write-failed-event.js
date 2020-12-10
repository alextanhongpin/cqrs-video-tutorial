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
 * @description Writes an event letting us know that sending the registration
 * email failed
 * @param {object} context The context
 * @param {string} context.traceId The traceId
 * @param {string} context.userId The id of the user who initiated this
 * @param {object} context.messageStore A reference to the Message Store
 * @param {function} context.messageStore.write A function for writing events
 * @param {Error} err The error that occurred when trying to send the email
 * @return {Promise} A Promise that resolves to the context
 */
function writeFailedEvent (context, err) {
  const sendCommand = context.sendCommand
  const streamName = `sendEmail-${sendCommand.data.emailId}`
  const event = {
    id: uuid(),
    type: 'Failed',
    metadata: {
      originStreamName: sendCommand.metadata.originStreamName,
      traceId: sendCommand.metadata.traceId,
      userId: sendCommand.metadata.userId
    },
    data: {
      ...sendCommand.data,
      reason: err.message
    }
  }

  return context.messageStore.write(streamName, event)
    .then(() => context)
}

module.exports = writeFailedEvent
