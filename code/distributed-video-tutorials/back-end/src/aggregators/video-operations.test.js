/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const test = require('blue-tape')
const camelCaseKeys = require('camelcase-keys')
const uuid = require('uuid/v4')

const { config, reset } = require('../test-helper')

test('It picks up a successful operation', t => {
  const traceId = uuid()
  const userId = uuid()
  const videoId = uuid()

  const videoNamedEvent = {
    id: uuid(),
    type: 'VideoNamed',
    metadata: {
      traceId,
      userId
    },
    data: {
      name: 'name'
    }
  }
  videoNamedEvent.streamName = `videos-${videoId}`

  return (
    reset()
      .then(() =>
        config.videoOperationsAggregator.handlers.VideoNamed(videoNamedEvent)
      )
      // Toss the idempotence in too
      .then(() =>
        config.videoOperationsAggregator.handlers.VideoNamed(videoNamedEvent)
      )
      .then(() =>
        config.db
          .then(client =>
            client('video_operations')
              .where({ trace_id: traceId })
              .limit(1)
              .then(camelCaseKeys)
          )
          .then(([operation]) => {
            t.ok(operation, 'Got the operation record')
            t.equals(operation.videoId, videoId, 'Recorded the video id')
            t.true(operation.succeeded, 'It succeeded')
            t.notOk(operation.failureReason, 'There is no failure reason')
          })
      )
  )
})

test('It picks up a non-successful operation', t => {
  const traceId = uuid()
  const userId = uuid()
  const videoId = uuid()

  const VideoNameRejectedEvent = {
    id: uuid(),
    type: 'VideoNameRejected',
    metadata: {
      traceId,
      userId
    },
    data: {
      name: 'name',
      reason: 'The test decreed it'
    }
  }
  VideoNameRejectedEvent.streamName = `videos-${videoId}`

  return (
    reset()
      .then(() =>
        config.videoOperationsAggregator.handlers.VideoNameRejected(
          VideoNameRejectedEvent
        )
      )
      // Toss the idempotence in too
      .then(() =>
        config.videoOperationsAggregator.handlers.VideoNameRejected(
          VideoNameRejectedEvent
        )
      )
      .then(() =>
        config.db
          .then(client =>
            client('video_operations')
              .where({ trace_id: traceId })
              .limit(1)
              .then(camelCaseKeys)
          )
          .then(([operation]) => {
            t.ok(operation, 'Got the operation record')
            t.equals(operation.videoId, videoId, 'Recorded the video id')
            t.notOk(operation.succeeded, 'It did not succeed')
            t.equals(
              operation.failureReason,
              VideoNameRejectedEvent.data.reason,
              'Picked up the failure reason'
            )
          })
      )
  )
})
