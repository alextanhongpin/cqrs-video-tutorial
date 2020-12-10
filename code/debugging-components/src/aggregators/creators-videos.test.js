/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
// File is commented out until its chapter is back in
const test = require('blue-tape')
const camelCaseKeys = require('camelcase-keys')
const snakeCaseKeys = require('snakecase-keys')
const uuid = require('uuid/v4')

const { config, reset } = require('../test-helper')

test('Handling a VideoPublished event', t => {
  const traceId = uuid()
  const userId = uuid()
  const sourceUri = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  const transcodedUri = 'https://www.youtube.com/watch?v=GI_P3UtZXAA'
  const videoId = uuid()

  const event = {
    type: 'VideoPublished',
    metadata: {
      traceId,
      userId
    },
    data: {
      ownerId: userId,
      sourceUri,
      transcodedUri,
      videoId
    },
    position: 3,
    streamName: `videoPublishing-${videoId}`
  }

  return (
    reset()
      .then(() =>
        config.creatorsVideosAggregator.handlers.VideoPublished(event)
      )
      // Handle it again for idempotence!
      .then(() =>
        config.creatorsVideosAggregator.handlers.VideoPublished(event)
      )
      .then(() =>
        config.db.then(client =>
          client('creators_portal_videos')
            .where({ owner_id: userId })
            .then(camelCaseKeys)
            .then(rows => {
              t.equal(rows.length, 1, 'Only one video recorded')

              const row = rows[0]

              t.equal(row.ownerId, userId, 'Correct owner id')
              t.equal(row.name, null, 'The name is not set')
              t.equal(row.description, null, 'The description is not set')
              t.equal(row.views, 0, 'No views recorded')
              t.equal(row.sourceUri, sourceUri, 'Correct source uri')
              t.equal(
                row.transcodedUri,
                transcodedUri,
                'Correct transcoded uri'
              )
              t.equal(row.position, event.position, 'Got the position')
            })
        )
      )
  )
})

test('Handling a VideoNamed event', t => {
  const traceId = uuid()
  const video = {
    id: uuid(),
    name: '',
    ownerId: uuid(),
    sourceUri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    transcodedUri: 'https://www.youtube.com/watch?v=GI_P3UtZXAA',
    position: 3
  }

  const videoNamedEvent = {
    id: uuid(),
    type: 'VideoNamed',
    metdata: {
      traceId,
      userId: video.userId
    },
    data: {
      name: 'what is my name again?'
    },
    position: 4,
    streamName: `videoPublishing-${video.id}`
  }

  return reset()
    .then(() =>
      config.db.then(client =>
        client('creators_portal_videos').insert(snakeCaseKeys(video))
      )
    )
    .then(() =>
      config.creatorsVideosAggregator.handlers.VideoNamed(videoNamedEvent)
    )
    .then(() =>
      config.db.then(client =>
        client('creators_portal_videos')
          .where({ id: video.id })
          .then(camelCaseKeys)
          .then(rows => rows[0])
      )
    )
    .then(v => {
      t.equal(v.name, videoNamedEvent.data.name, 'Updated the name')
      t.equal(v.position, videoNamedEvent.position, 'Got the position')
    })
})

test('Handling a VideoNamed event is idempotent', t => {
  const traceId = uuid()
  const video = {
    id: uuid(),
    name: 'The position is greater than the event we see a second time',
    ownerId: uuid(),
    sourceUri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    transcodedUri: 'https://www.youtube.com/watch?v=GI_P3UtZXAA',
    position: 5
  }

  const videoNamedEvent = {
    id: uuid(),
    type: 'VideoNamed',
    metdata: {
      traceId,
      userId: video.userId
    },
    data: {
      name: 'Try to set it back'
    },
    position: 4,
    streamName: `videoPublishing-${video.id}`
  }

  return reset()
    .then(() =>
      config.db.then(client =>
        client('creators_portal_videos').insert(snakeCaseKeys(video))
      )
    )
    .then(() =>
      config.creatorsVideosAggregator.handlers.VideoNamed(videoNamedEvent)
    )
    .then(() =>
      config.db.then(client =>
        client('creators_portal_videos')
          .where({ id: video.id })
          .then(camelCaseKeys)
          .then(rows => rows[0])
      )
    )
    .then(v => {
      t.equal(v.name, video.name, 'did not change name')
      t.equal(v.position, video.position, 'Position remained the same')
    })
})
