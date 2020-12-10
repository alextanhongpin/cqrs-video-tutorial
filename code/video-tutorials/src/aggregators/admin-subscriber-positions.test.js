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

test('It aggregates component positions', t => {
  const subscriberId = uuid()
  const event = {
    id: uuid(),
    type: 'Read',
    data: {
      position: 3
    },
    streamName: `subscriberPosition-${subscriberId}`,
    globalPosition: 25
  }
  const aggregator = config.adminSubscriberPositionsAggregator

  return (
    reset()
      .then(() => aggregator.handlers.Read(event))
      // Idempotence
      .then(() => aggregator.handlers.Read(event))
      .then(() =>
        config.db.then(client =>
          client('admin_subscriber_positions').then(camelCaseKeys)
        )
      )
      .then(positions => {
        t.equal(positions.length, 1, 'Aggregated 1 position')
        t.equal(positions[0].id, subscriberId, 'Recorded the id')
        t.equal(
          positions[0].position,
          event.data.position,
          'Got the position'
        )
        t.equal(
          positions[0].lastMessageGlobalPosition,
          event.globalPosition,
          'Correct idempotence key'
        )
      })
  )
})
