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

const { project } = require('../../message-store')
const projection = require('./video-publishing-projection')

test('Not published unless VideoPublished event present', t => {
  const actual = project([], projection)

  t.equals(actual.publishingAttempted, false, 'Is not published')

  t.end()
})

test('Applying a VideoPublished event', t => {
  const traceId = uuid()
  const userId = uuid()
  const sourceUri = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  const transcodedUri = 'https://www.youtube.com/watch?v=GI_P3UtZXAA'
  const videoId = uuid()

  const event = {
    id: uuid(),
    type: 'VideoPublished',
    metadata: {
      traceId,
      userId
    },
    data: {
      videoId,
      ownerId: userId,
      sourceUri,
      transcodedUri
    }
  }

  const actual = project([event], projection)

  t.equals(actual.id, videoId, 'Got the video id')
  t.equals(actual.ownerId, userId, 'Got the owner id')
  t.ok(actual.publishingAttempted, 'is published')
  t.equals(actual.sourceUri, sourceUri, 'Applied the source URI')
  t.equals(actual.transcodedUri, transcodedUri, 'Applied transcodedUri')

  t.end()
})

test('Applying a VideoPublishingFailed event', t => {
  const traceId = uuid()
  const userId = uuid()
  const sourceUri = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  const videoId = uuid()

  const event = {
    id: uuid(),
    type: 'VideoPublishingFailed',
    metadata: {
      traceId,
      userId
    },
    data: {
      videoId,
      ownerId: userId,
      sourceUri,
      reason: 'I said so'
    }
  }

  const actual = project([event], projection)

  t.equals(actual.id, videoId, 'Got the video id')
  t.equals(actual.ownerId, userId, 'Got the owner id')
  t.ok(actual.publishingAttempted, 'publishing failed')
  t.equals(actual.sourceUri, sourceUri, 'Applied the source URI')

  t.end()
})

test('Applying a VideoNamed event', t => {
  const traceId = uuid()
  const name = 'name'
  const userId = uuid()

  const videoNamedEvent = {
    id: uuid(),
    type: 'VideoNamed',
    metadata: {
      traceId,
      userId
    },
    data: {
      name
    },
    globalPosition: 42
  }

  const actual = project([videoNamedEvent], projection)

  t.equals(actual.name, name, 'The projection got the video name')
  t.equals(actual.sequence, videoNamedEvent.globalPosition, 'Got the named id')

  t.end()
})
