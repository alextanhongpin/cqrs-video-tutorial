/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
/**
 * @description Sends the registration email
 * @param {object} context The context
 * @param {string} context.systemSenderEmailAddress The email address the system
 * users when it sends emails
 * @param {object} sendCommand The Send command we're handling
 * @param {function} justSendIt A function that just sends the email
 */
function sendEmail (context) {
  const justSendIt = context.justSendIt
  const sendCommand = context.sendCommand
  const systemSenderEmailAddress = context.systemSenderEmailAddress

  const email = { 
    from: systemSenderEmailAddress,
    to: sendCommand.data.to,
    subject: sendCommand.data.subject,
    text: sendCommand.data.text,
    html: sendCommand.data.html
  }

  return justSendIt(email)
    .then(() => context)
}

module.exports = sendEmail
