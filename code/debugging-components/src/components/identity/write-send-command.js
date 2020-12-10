/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const uuidv4 = require('uuid/v4') // (1)
const uuidv5 = require('uuid/v5')

const uuidv5Namespace = '0c46e0b7-dfaf-443a-b150-053b67905cc2' // (2)

/**
 * @description Writes a command to send the registration email
 * @param {object} context The context
 * @param {object} context.messageStore A reference to the Message Store
 * @param {object} context.identity The identity we're sending the email to
 * @param {object} context.event The event that we're handling
 * @return {Promise} A Promise that resolves to the context
 */
function writeSendCommand (context, err) { // (3)
  const event = context.event
  const identity = context.identity
  const email = context.email

  const emailId = uuidv5(identity.email, uuidv5Namespace)

  const sendEmailCommand = { // (4)
    id: uuidv4(),
    type: 'Send',
    metadata: {
      originStreamName: `identity-${identity.id}`,
      traceId: event.metadata.traceId,
      userId: event.metadata.userId
    },
    data: {
      emailId,
      to: identity.email,
      subject: email.subject,
      text: email.text,
      html: email.html
    }
  }
  const streamName = `sendEmail:command-${emailId}` // (5)

  return context.messageStore
    .write(streamName, sendEmailCommand)
    .then(() => context)
}

module.exports = writeSendCommand
