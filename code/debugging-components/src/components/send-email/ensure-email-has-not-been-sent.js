/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const AlreadySentError = require('./already-sent-error')

/**
 * @description Checks the projected stream to see if the email has already been
 * sent
 * @param {object} context The context this is happening in
 * @param {object} context.email The projected email
 * @param {bool} context.email.isSent If the email has already been sent
 * @throws {AlreadySentError} If the email has already been sent
 */
function ensureEmailHasNotBeenSent (context) {
  if (context.email.isSent) {
    throw new AlreadySentError()
  }

  return context
}

module.exports = ensureEmailHasNotBeenSent
