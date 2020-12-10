/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const uuid = require('uuid/v4')

const AuthenticationError = require('../errors/authentication-error')

/**
 * @description Writes a proper event when authentication fails due to a user
 * credential not being found
 * @param {object} context The context
 * @param {object} context.messageStore The messageStore
 * @param {object} context.userCredential The userCredential
 * @param {string} context.userCredential.id The userCredential's id
 */
function handleCredentialMismatch (context) {
  const event = {
    id: uuid(),
    type: 'UserLoginFailed',
    metadata: {
      traceId: context.traceId,
      userId: null
    },
    data: {
      userId: context.userCredential.id,
      reason: 'Incorrect password'
    }
  }
  const streamName = `authentication-${context.userCredential.id}`

  return context.messageStore.write(streamName, event).then(() => {
    throw new AuthenticationError()
  })
}

module.exports = handleCredentialMismatch
