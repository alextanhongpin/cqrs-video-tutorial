/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const Bluebird = require('bluebird')

const AlreadyPublishedError = require('./already-published-error')
const ensurePublishingNotAttempted =
  require('./ensure-publishing-not-attempted')
const loadVideo = require('./load-video')
const transcodeVideo = require('./transcode-video')
const writeVideoPublishedEvent = require('./write-video-published-event')
const writeVideoPublishingFailedEvent =
  require('./write-video-publishing-failed-event')

const CommandAlreadyProcessedError =
  require('./command-already-processed-error')
const ensureCommandHasNotBeenProcessed =
  require('./ensure-command-has-not-been-processed')
const ensureNameIsValid = require('./ensure-name-is-valid')
const ValidationError = require('./validation-error')
const writeVideoNamedEvent = require('./write-video-named-event')
const writeVideoNameRejectedEvent = require('./write-video-name-rejected-event')

function createHandlers ({ messageStore }) {
  return {
    NameVideo: command => {
      const context = { // (1)
        command: command,
        messageStore: messageStore
      }

      return Bluebird.resolve(context)
        .then(loadVideo) // (2)
        .then(ensureCommandHasNotBeenProcessed)
        .then(ensureNameIsValid)
        .then(writeVideoNamedEvent)
        .catch(CommandAlreadyProcessedError, () => {}) // (3)
        .catch( // (4)
          ValidationError,
          err => writeVideoNameRejectedEvent(context, err.message)
        )
    },
    // ...

    PublishVideo: command => {
      const context = { 
        command: command,
        messageStore: messageStore
      }

      return (
        Bluebird.resolve(context) 
          .then(loadVideo)
          .then(ensurePublishingNotAttempted)
          .then(transcodeVideo)
          .then(writeVideoPublishedEvent)
          .catch(AlreadyPublishedError, () => {})
          .catch(err => writeVideoPublishingFailedEvent(err, context))
      )
    }
  }
}

function build ({ messageStore }) {
  const handlers = createHandlers({ messageStore })
  const subscription = messageStore.createSubscription({
    streamName: 'videoPublishing:command',
    handlers: handlers,
    subscriberId: `video-publishing`
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
