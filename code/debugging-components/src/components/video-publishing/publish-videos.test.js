/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const test = require('blue-tape')
const uuid = require('uuid/v4')

const { config, reset } = require('../../test-helper')
const createVideoPublishingComponent = require('./')

test('Handling a PublishVideo command', t => {
  const traceId = uuid()
  const ownerId = uuid()
  const userId = uuid()
  const sourceUri = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  const videoId = uuid()

  const command = {
    id: uuid(),
    type: 'PublishVideo',
    metadata: {
      traceId,
      userId
    },
    data: {
      ownerId,
      sourceUri,
      videoId
    }
  }

  return reset()
    .then(() => config.videoPublishingComponent.handlers.PublishVideo(command))
    .then(() =>
      // Send it a second time to check idempotence
      config.videoPublishingComponent.handlers.PublishVideo(command)
    )
    .then(() =>
      config.messageStore.read(`videoPublishing-${videoId}`).then(messages => {
        t.equal(messages.length, 1, '1 event written')

        const event = messages[0]

        t.equal(event.type, 'VideoPublished', 'It is a VideoPublished event')
        t.equal(event.data.ownerId, ownerId, 'Belongs to the user')
        t.equal(event.data.videoId, videoId, 'Has the same id')
      })
    )
})

test('Handling a PublishVideo command is idempotent in failure', t => {
  const traceId = uuid()
  const ownerId = uuid()
  const userId = uuid()
  const sourceUri = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  const videoId = uuid()

  const command = {
    id: uuid(),
    type: 'PublishVideo',
    metadata: {
      traceId,
      userId
    },
    data: {
      ownerId,
      sourceUri,
      videoId
    }
  }

  const failedEvent = {
    id: uuid(),
    type: 'VideoPublishingFailed',
    metadata: {
      traceId,
      userId
    },
    data: {
      ownerId,
      sourceUri,
      videoId,
      reason: 'I said so'
    }
  }
  const videoStream = `videoPublishing-${videoId}`

  return reset()
    .then(() => config.messageStore.write(videoStream, failedEvent))
    .then(() => config.videoPublishingComponent.handlers.PublishVideo(command))
    .then(() =>
      // Send it a second time to check idempotence
      config.videoPublishingComponent.handlers.PublishVideo(command)
    )
    .then(() =>
      config.messageStore.read(videoStream).then(messages => {
        t.equal(messages.length, 1, '1 event written')

        const event = messages[0]

        t.equal(
          event.type,
          'VideoPublishingFailed',
          'It is a VideoPublished event'
        )
        t.equal(event.data.ownerId, ownerId, 'Belongs to the user')
        t.equal(event.data.videoId, videoId, 'Has the same id')
      })
    )
})

test('Writes a VideoPublishingFailed event when publishing fails', t => {
  function lousyFetch () { // (1)
    throw new Error('No can haz fetch')
  }
  const lousyMessageStore = {
    ...config.messageStore,
    fetch: lousyFetch
  }
  const videoPublishingComponent = createVideoPublishingComponent({ // (2)
    messageStore: lousyMessageStore
  })
  const traceId = uuid() // (3)
  const ownerId = uuid()
  const userId = uuid()
  const sourceUri = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  const videoId = uuid()

  const command = {
    id: uuid(),
    type: 'PublishVideo',
    metadata: {
      traceId,
      userId
    },
    data: {
      ownerId,
      sourceUri,
      videoId
    }
  }

  return videoPublishingComponent.handlers.PublishVideo(command)
    .then(() => // (4)
      config.messageStore.read(`videoPublishing-${videoId}`).then(messages => { // (5)
        t.equal(messages.length, 1, '1 event written')

        t.equal(messages[0].type, 'VideoPublishingFailed', 'It failed')
        t.equal(messages[0].data.reason, 'No can haz fetch')
      })
    )
})
