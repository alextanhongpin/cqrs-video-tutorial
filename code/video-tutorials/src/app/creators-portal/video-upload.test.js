/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const Bluebird = require('bluebird')
const test = require('blue-tape')
const snakeCaseKeys = require('snakecase-keys')
const uuid = require('uuid/v4')

const { config, reset } = require('../../test-helper')

test('Notifying server of an upload triggers PublishVideo command', t => {
  const creatorId = uuid()
  const videoId = uuid()
  
  const creator = {
    id: creatorId,
    email: 'creator@example.com',
    passwordHash: 'notahash'
  }

  let resolveRequestPromise = null
  const waitForRequestToFinish = new Bluebird(resolve => {
    resolveRequestPromise = resolve
  }).timeout(2000)

  const req = {
    body: {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoId
    },
    context: {
      traceId: uuid(),
      userId: creator.id
    }
  }

  const res = {
    json: resolveRequestPromise
  }

  const commandStreamName = `videoPublishing:command-${req.body.videoId}`

  return reset()
    .then(() =>
      config.db.then(client =>
        client('user_credentials').insert(snakeCaseKeys(creator))
      )
    )
    .then(() => config.creatorsPortalApp.handlers.handlePublishVideo(req, res))
    .then(() => waitForRequestToFinish)
    .then(() =>
      // Having received the notification, we expect there to be an event for
      // this in the videos stream
      config.messageStore.read(commandStreamName).then(messages => {
        t.equal(messages.length, 1, 'There is only 1 message')
        t.equal(
          messages[0].type,
          'PublishVideo',
          'It is a PublishVideo command'
        )
        t.equals(messages[0].data.videoId, req.body.videoId, 'Same videoId')
      })
    )
})
