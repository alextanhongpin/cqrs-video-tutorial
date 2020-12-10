/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const NotFoundError = require('../errors/not-found-error')

/**
 * @description Makes sure `context` has a `userCredential` on it
 * @param {object} context The action context
 * @param {object} context.userCredential Where the credential should be
 * @returns {object} The `context`
 * @throws NotFoundError
 */
function ensureUserCredentialFound (context) {
  if (!context.userCredential) {
    throw new NotFoundError('no record found with that email')
  }

  return context
}

module.exports = ensureUserCredentialFound
