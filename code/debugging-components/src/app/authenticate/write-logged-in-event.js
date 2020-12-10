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
 * @description Writes a UserLoggedIn event to record successful login
 * @param {object} context The context
 * @param {object} context.messageStore The messageStore
 * @param {object} context.userCredential The userCredential
 * @param {string} context.userCredential.id The userCredential's id
 * @returns {Promise<object>} A Promise resolving to the `context`.
 */
function writeLoggedInEvent (context) {
  const event = {
    id: uuid(),
    type: 'UserLoggedIn',
    metadata: {
      traceId: context.traceId,
      userId: context.userCredential.id
    },
    data: { userId: context.userCredential.id }
  }
  const streamName = `authentication-${context.userCredential.id}`

  return context.messageStore.write(streamName, event)
    .then(() => context)
}

module.exports = writeLoggedInEvent
