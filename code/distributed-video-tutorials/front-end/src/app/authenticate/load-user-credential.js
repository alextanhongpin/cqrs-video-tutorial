/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
/**
 * @description Loads the user credential for the given email address into the
 * action context
 * @param {object} context The action context
 * @param {object} context.queries Reference to the queries
 * @param {function} context.queries.byEmail Function for querying by
 * email
 * @param {object} context.email The email to query by
 * @returns {Promise<object>} The context with the loaded user
 * @throws UserNotFoundError
 */
function loadUserCredential (context) {
  return context.queries
    .byEmail(context.email)
    .then(userCredential => {
      context.userCredential = userCredential

      return context
    })
}

module.exports = loadUserCredential
