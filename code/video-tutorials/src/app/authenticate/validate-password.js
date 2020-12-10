/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const bcrypt = require('bcrypt')

const CredentialMismatchError =
  require('../errors/credential-mismatch-error')

/**
 * @description Compares the supplied password to the one on file
 * @param {object} context The action context
 * @param {string} context.password The password to validate
 * @param {object} context.userCredential The userCredential to check
 * against
 * @param {string} context.userCredential.passwordHash The password to
 * check against
 * @returns {Promise{object}} A Promise resolving to the original context
 * @throws {AuthenticationError} An AuthenticationError if an incorrect password
 * was given
 */
function validatePassword (context) {
  return bcrypt
    .compare(context.password, context.userCredential.passwordHash)
    .then(matched => {
      if (!matched) {
        throw new CredentialMismatchError()
      }

      return context
    })
}

module.exports = validatePassword
