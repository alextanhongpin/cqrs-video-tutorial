/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const videoStatuses = require('./video-statuses')

function streamToEntityId (stream) {
  return stream.split(/-(.+)/)[1]
}

function createHandlers ({ messageStore, queries }) {
  return {
    VideoPublished: event =>
      queries.createVideo(
        event.data.videoId,
        event.data.ownerId,
        event.data.sourceUri,
        event.data.transcodedUri,
        event.position
      ),

    VideoNamed: event =>
      queries.updateVideoName(
        streamToEntityId(event.streamName),
        event.position,
        event.data.name
      ),

    VideoTranscodingFailed: event =>
      queries.updateVideoStatus(
        streamToEntityId(event.streamName),
        event.position,
        videoStatuses.failed
      )
  }
}

function createQueries ({ db }) {
  function createVideo (
    id,
    ownerId,
    sourceUri,
    transcodedUri,
    position
  ) {
    const video = {
      id,
      ownerId,
      sourceUri,
      transcodedUri,
      position
    }

    const raw = `
      INSERT INTO
        creators_portal_videos (
          id,
          owner_id,
          source_uri,
          transcoded_uri,
          position
        )
      VALUES
        (:id, :ownerId, :sourceUri, :transcodedUri, :position)
      ON CONFLICT (id) DO NOTHING
    `

    return db.then(client => client.raw(raw, video))
  }

  function updateVideoName (id, position, name) {
    return db.then(client =>
      client('creators_portal_videos')
        .update({ name, position })
        .where({ id })
        .where('position', '<', position)
    )
  }

  return {
    createVideo,
    updateVideoName
  }
}

function build ({ db, messageStore }) {
  const queries = createQueries({ db })
  const handlers = createHandlers({ messageStore, queries })
  const subscription = messageStore.createSubscription({
    streamName: 'videoPublishing',
    handlers,
    subscriberId: 'aggregators:creators-videos'
  })

  function start () {
    subscription.start()
  }

  return {
    handlers,
    queries,
    start
  }
}

module.exports = build
