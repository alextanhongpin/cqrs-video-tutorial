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

test('It aggregates the stream names', t => {
  const event1 = {
    id: uuid(),
    streamName: 'stream-12345',
    globalPosition: 1
  }

  // This is in the same stream to show that it can handle 2 in the same stream
  // without duplicates
  const event2 = {
    id: uuid(),
    streamName: 'stream-12345',
    globalPosition: 2
  }

  const event3 = {
    id: 3,
    streamName: 'stream-54321',
    globalPosition: 3
  }

  return (
    reset()
      .then(() => config.adminStreamsAggregator.handlers.$any(event1))
      // event1 again for idempotence
      .then(() => config.adminStreamsAggregator.handlers.$any(event1))
      .then(() => config.adminStreamsAggregator.handlers.$any(event2))
      .then(() => config.adminStreamsAggregator.handlers.$any(event3))
      .then(() =>
        config.db.then(client =>
          client('admin_streams').then(camelCaseKeys)
        )
      )
      .then(streams => {
        t.equal(streams.length, 2, 'Recorded 2 streams')

        const [stream12345, stream54321] = streams

        t.equal(
          stream12345.streamName,
          event1.streamName,
          'Correct stream name'
        )
        t.equal(
          stream54321.streamName,
          event3.streamName,
          'Correct stream name'
        )

        t.equal(stream12345.lastMessageId, event2.id, 'Correct id')
      })
  )
})
