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

test('Handles owner naming a video', t => {
  const traceId = uuid()
  const userId = uuid()
  const name = 'new name'
  const videoId = uuid()

  const nameVideoCommand = {
    id: uuid(),
    type: 'NameVideo',
    metadata: {
      traceId,
      userId
    },
    data: {
      name,
      videoId
    }
  }

  const videoPublished = {
    id: uuid(),
    type: 'VideoPublished',
    metadata: {
      traceId,
      userId
    },
    data: {
      ownerId: userId,
      sourceUri: 'this is not a uri',
      transcodedUri: 'neither is this',
      videoId
    }
  }

  const entityStream = `videoPublishing-${videoId}`
  const commandStream = `videoPublishing:command-${videoId}`

  return (
    reset()
      .then(() => config.messageStore.write(entityStream, videoPublished))
      // Write this to get the id of the command.  Used in idempotence check.
      .then(() => config.messageStore.write(commandStream, nameVideoCommand))
      .then(() =>
        config.messageStore.readLastMessage(commandStream).then(command =>
          config.videoPublishingComponent.handlers.NameVideo(command).then(() =>
            // Process it twice as an idempotence check
            config.videoPublishingComponent.handlers.NameVideo(command)
          )
        )
      )
      .then(() =>
        config.messageStore
          .read(`videoPublishing-${videoId}`)
          .then(retrievedMessages => {
            t.equal(retrievedMessages.length, 2, 'There are 2 events')

            const videoNamedEvent = retrievedMessages[1]

            t.equal(
              videoNamedEvent.type,
              'VideoNamed',
              'It is a VideoNamed event'
            )
            t.equal(
              videoNamedEvent.data.name,
              name,
              'It uses the supplied name'
            )
            t.equal(
              videoNamedEvent.streamName,
              `videoPublishing-${videoId}`,
              `Written to the video's publishing entity stream`
            )
          })
      )
  )
})

test('An invalid name is not allowed', t => {
  const traceId = uuid()
  const name = ''
  const ownerId = uuid()
  const videoId = uuid()

  const nameVideoCommand = {
    id: uuid(),
    type: 'NameVideo',
    metadata: {
      traceId,
      userId: ownerId
    },
    data: {
      name,
      videoId
    }
  }
  nameVideoCommand.stream = `videoPublishing:command-${videoId}`

  const videoPublishedEvent = {
    id: uuid(),
    type: 'VideoPublished',
    traceId,
    userId: ownerId,
    data: {
      ownerId,
      sourceUri: 'sourceUri',
      videoId
    }
  }

  return reset()
    .then(() =>
      config.messageStore.write(
        `videoPublishing-${videoId}`,
        videoPublishedEvent
      )
    )
    .then(() =>
      config.videoPublishingComponent.handlers.NameVideo(nameVideoCommand)
    )
    .then(() =>
      config.messageStore
        .read(`videoPublishing-${videoId}`)
        .then(retrievedMessages => {
          t.equal(retrievedMessages.length, 2, 'There are two events')

          const rejectedEvent = retrievedMessages[1]

          t.equal(
            rejectedEvent.type,
            'VideoNameRejected',
            'The video was not named'
          )

          t.ok(
            rejectedEvent.data.reason.includes('blank'),
            'Identified the name was blank'
          )

          t.equal(
            rejectedEvent.streamName,
            `videoPublishing-${videoId}`,
            `Written to the video's publishing stream`
          )
        })
    )
})
