/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const test = require('blue-tape')
const supertest = require('supertest')
const uuid = require('uuid/v4')

const { app, config, reset } = require('../../test-helper')

test('It records viewing the video', t => {
  const videoId = uuid()

  return reset()
    .then(() =>
      supertest(app)
        .post(`/record-viewing/${videoId}`)
        .expect(302)
    )
    .then(() =>
      config.messageStore
        .read(`viewing-${videoId}`)
        .then(retrievedMessages => {
          t.equal(retrievedMessages.length, 1, '1 message')

          const message = retrievedMessages[0]

          t.equal(message.type, 'VideoViewed')
          t.ok(message.metadata.traceId, 'Got the trace id')
          t.notOk(message.metadata.userId, 'We do not know who it was')
          t.equal(
            message.streamName,
            `viewing-${videoId}`,
            'Correct stream id'
          )
        })
    )
})
