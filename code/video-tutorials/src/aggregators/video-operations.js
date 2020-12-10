/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const componentId = 'aggregators:video-operations'

function streamToEntityId (streamName) {
  return streamName.split(/-(.+)/)[1]
}

function createHandlers ({ queries }) {
  return {
    VideoNamed: event => {
      const videoId = streamToEntityId(event.streamName)
      const wasSuccessful = true
      const failureReason = null

      return queries.writeResult(
        event.metadata.traceId,
        videoId,
        wasSuccessful,
        failureReason
      )
    },

    VideoNameRejected: event => {
      const videoId = streamToEntityId(event.streamName)
      const wasSuccessful = false
      const failureReason = event.data.reason

      return queries.writeResult(
        event.metadata.traceId,
        videoId,
        wasSuccessful,
        failureReason
      )
    }
  }
}

function createQueries ({ db }) {
  function writeResult (traceId, videoId, wasSuccessful, failureReason) {
    const operation = {
      traceId,
      videoId,
      wasSuccessful,
      failureReason
    }

    const raw = `
      INSERT INTO
        video_operations (
          trace_id,
          video_id,
          succeeded,
          failure_reason
        )
      VALUES
        (:traceId, :videoId, :wasSuccessful, :failureReason)
      ON CONFLICT (trace_id) DO NOTHING
    `

    return db.then(client => client.raw(raw, operation))
  }

  return { writeResult }
}

function build ({ db, messageStore }) {
  const queries = createQueries({ db })
  const handlers = createHandlers({ queries })
  const subscription = messageStore.createSubscription({
    streamName: 'videoPublishing',
    handlers,
    subscriberId: componentId
  })

  function start (es) {
    subscription.start()
  }

  return {
    handlers,
    queries,
    start
  }
}

module.exports = build
