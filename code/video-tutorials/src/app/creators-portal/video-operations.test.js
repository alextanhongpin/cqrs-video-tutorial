/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const test = require('blue-tape')
const snakeCaseKeys = require('snakecase-keys')
const supertest = require('supertest')
const uuid = require('uuid/v4')

const { app, config, getSessionCookie, reset } = require('../../test-helper')

test('Requesting a video operation that has not finished', t => {
  const traceId = uuid()
  const userId = uuid()

  const cookie = getSessionCookie(userId)

  return reset()
    .then(() =>
      supertest(app)
        .get(`/creators-portal/video-operations/${traceId}`)
        .set('cookie', [cookie])
        .expect(200)
    )
    .then(res => {
      t.ok(
        res.text.includes('setTimeout'),
        'Got the response where it will poll for completion later'
      )
    })
})

test('Requesting a video operation that succeeded', t => {
  const traceId = uuid()
  const userId = uuid()
  const videoId = uuid()

  const cookie = getSessionCookie(userId)

  const operation = {
    traceId,
    videoId,
    succeeded: true,
    failureReason: null
  }

  return reset()
    .then(() =>
      config.db.then(client =>
        client('video_operations').insert(snakeCaseKeys(operation))
      )
    )
    .then(() =>
      supertest(app)
        .get(`/creators-portal/video-operations/${traceId}`)
        .set('cookie', [cookie])
        .expect(302)
    )
    .then(res => {
      t.ok(res.header.location.includes(videoId), 'It redirected')
    })
})

test('Requesting a video operation that failed', t => {
  const traceId = uuid()
  const userId = uuid()
  const videoId = uuid()

  const cookie = getSessionCookie(userId)

  const operation = {
    traceId,
    videoId,
    succeeded: false,
    failureReason: 'The test said so'
  }

  return reset()
    .then(() =>
      config.db.then(client =>
        client('video_operations').insert(snakeCaseKeys(operation))
      )
    )
    .then(() =>
      supertest(app)
        .get(`/creators-portal/video-operations/${traceId}`)
        .set('cookie', [cookie])
        .expect(200)
    )
    .then(res => {
      t.ok(
        res.text.includes('Operation failed'),
        'Informed the user of the failure'
      )
    })
})
