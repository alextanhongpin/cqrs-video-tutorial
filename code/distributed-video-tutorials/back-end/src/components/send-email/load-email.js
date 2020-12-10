/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const emailProjection = { 
  $init () { return { isSent: false } },
  Sent (email, sent) {
    email.isSent = true

    return email
  }
}

/**
 * @description Loads the registration email stream found in
 * `context.registrationEmailStream`.
 * @param {object} context
 * @param {object} context.messageStore A reference to the Message Store
 * @param {object} context.sendCommand The command we're handling
 * @returns {Promise<object>} A promise that resolves to the new context
 */
function loadEmail (context) {
  const messageStore = context.messageStore
  const sendCommand = context.sendCommand
  const streamName = `sendEmail-${sendCommand.data.emailId}`

  return messageStore
    .fetch(streamName, emailProjection)
    .then(email => {
      context.email = email

      return context
    })
}

module.exports = loadEmail
