/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const Bluebird = require('bluebird')

const ensureNotRegistered = require('./ensure-not-registered')
const ensureRegistrationEmailNotSent =
  require('./ensure-registration-email-not-sent')
const loadIdentity = require('./load-identity')
const renderRegistrationEmail = require('./render-registration-email')
const writeRegistrationEmailSentEvent =
  require('./write-registration-email-sent-event')
const writeRegisteredEvent = require('./write-registered-event')
const writeSendCommand = require('./write-send-command')
const AlreadyRegsiteredError = require('./already-registered-error')
const AlreadySentRegistrationEmailError =
  require('./already-sent-registration-email-error')

function streamNameToId (streamName) {
  return streamName.split(/-(.+)/)[1]
}

function createIdentityCommandHandlers ({ messageStore }) {
  return {
    Register: command => {
      const context = { 
        messageStore: messageStore,
        command,
        identityId: command.data.userId
      }

      return Bluebird.resolve(context)
        .then(loadIdentity)
        .then(ensureNotRegistered)
        .then(writeRegisteredEvent)
        .catch(AlreadyRegsiteredError, () => {})
    }
  }
}

function createIdentityEventHandlers ({ messageStore }) {
  return {
    Registered: event => {
      const context = {
        messageStore: messageStore,
        event,
        identityId: event.data.userId
      }

      return Bluebird.resolve(context)
        .then(loadIdentity)
        .then(ensureRegistrationEmailNotSent)
        .then(renderRegistrationEmail)
        .then(writeSendCommand)
        .catch(AlreadySentRegistrationEmailError, () => {})
    }
  }
}

function createSendEmailEventHandlers ({ messageStore }) {
  return {
    Sent: event => {
      const originStreamName = event.metadata.originStreamName 
      const identityId = streamNameToId(originStreamName)

      const context = {
        messageStore,
        event,
        identityId
      }

      return Bluebird.resolve(context)
        .then(loadIdentity)
        .then(ensureRegistrationEmailNotSent)
        .then(writeRegistrationEmailSentEvent)
        .catch(AlreadySentRegistrationEmailError, () => {})
    }
  }
}

function build ({ messageStore }) {
  // ...
  const identityCommandHandlers =
    createIdentityCommandHandlers({ messageStore })
  const identityCommandSubscription = messageStore.createSubscription({
    streamName: 'identity:command',
    handlers: identityCommandHandlers,
    subscriberId: 'components:identity:command'
  })

  const identityEventHandlers = createIdentityEventHandlers({ messageStore })
  const identityEventSubscription = messageStore.createSubscription({
    streamName: 'identity',
    handlers: identityEventHandlers,
    subscriberId: 'components:identity'
  })

  const sendEmailEventHandlers = createSendEmailEventHandlers({ messageStore })
  const sendEmailEventSubscription = messageStore.createSubscription({
    streamName: 'sendEmail',
    handlers: sendEmailEventHandlers,
    originStreamName: 'identity',
    subscriberId: 'components:identity:sendEmailEvents'
  })

  function start () { 
    identityCommandSubscription.start()
    identityEventSubscription.start()
    sendEmailEventSubscription.start()
  }

  return {
    identityCommandHandlers,
    identityEventHandlers,
    sendEmailEventHandlers,
    start
  }
}

module.exports = build
