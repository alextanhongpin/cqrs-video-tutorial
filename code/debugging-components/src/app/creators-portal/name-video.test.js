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

test('Submitting a valid name video command', t => {
  const video = {
    id: uuid(),
    ownerId: uuid(),
    sourceUri: 'sourceUri',
    transcodedUri: 'transcodedUri',
    position: 1
  }
  const newName = 'let us name it'

  // Fake the session cookie
  const cookie = getSessionCookie(video.ownerId)

  return reset()
    .then(() =>
      config.db.then(client =>
        client('creators_portal_videos').insert(snakeCaseKeys(video))
      )
    )
    .then(() =>
      supertest(app)
        .post(`/creators-portal/videos/${video.id}/name`)
        .set('cookie', [cookie])
        .type('form')
        .send({ name: newName })
        .expect(302)
    )
    .then(() =>
      config.messageStore
        .read(`videoPublishing:command-${video.id}`)
        .then(retrievedMessages => {
          t.equal(retrievedMessages.length, 1, '1 message written')

          const nameVideoCommand = retrievedMessages[0]
          t.equal(
            nameVideoCommand.type,
            'NameVideo',
            'It is a NameVideo command'
          )
          t.equal(
            nameVideoCommand.streamName,
            `videoPublishing:command-${video.id}`,
            'Written to the video service command stream'
          )
          t.equal(nameVideoCommand.data.name, newName, 'Got the new name')
        })
    )
})
