/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const Bluebird = require('bluebird')

const AlreadySentError = require('./already-sent-error')
const ensureEmailHasNotBeenSent =
  require('./ensure-email-has-not-been-sent')
const loadEmail = require('./load-email')
const createSend = require('./send')
const SendError = require('./send-error')
const sendEmail = require('./send-email')
const writeFailedEvent =
  require('./write-failed-event')
const writeSentEvent =
  require('./write-sent-event')

function createHandlers ({
  justSendIt,
  messageStore,
  systemSenderEmailAddress
}) {
  return {
    Send: command => {
      const context = {
        messageStore,
        justSendIt,
        systemSenderEmailAddress,
        sendCommand: command
      }

      return Bluebird.resolve(context)
        .then(loadEmail)
        .then(ensureEmailHasNotBeenSent)
        .then(sendEmail)
        .then(writeSentEvent)
        // If it's already sent, then we do a no-op
        .catch(AlreadySentError, () => {})
        .catch(
          SendError,
          err => writeFailedEvent(context, err)
        )
    }
  }
}

/**
 *
 * @param {object} param0
 * @param {object} param0.messageStore Reference ot the Message Store
 * @param {string} param0.systemSenderEmailAddress The email address to send
 * from when it's a system email (as opposed to an email send by another user)
 * @param {object} param0.transport The `node-mailer` transport
 */
function build ({
  messageStore,
  systemSenderEmailAddress,
  transport
}) {
  const justSendIt = createSend({ transport })
  const handlers = createHandlers({
    messageStore,
    justSendIt,
    systemSenderEmailAddress
  })
  const subscription = messageStore.createSubscription({
    streamName: 'sendEmail:command',
    handlers,
    subscriberId: 'components:send-email'
  })

  function start () {
    subscription.start()
  }

  return {
    handlers,
    start
  }
}

module.exports = build
