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

const registered = {
  id: uuid(),
  type: 'Registered',
  metadata: {
    traceId: uuid(),
    userId: uuid()
  },
  data: {
    userId: uuid(),
    email: 'test@example.com',
    passwordHash: 'notahash'
  }
}
registered.streamName =
  `identity-${registered.metadata.userId}`

test('It aggregates user registrations', t => {
  return (
    reset()
      .then(() =>
        config.userCredentialsAggregator.handlers.Registered(
          registered
        )
      )
      // Process it a second time for idempotence
      .then(() =>
        config.userCredentialsAggregator.handlers.Registered(
          registered
        )
      )
      .then(() =>
        config.db
          .then(client =>
            client('user_credentials')
              .where({ id: registered.data.userId })
              .limit(1)
          )
          .then(camelCaseKeys)
          .then(([userCredential]) => {
            t.ok(userCredential, 'Got the user credential')
            t.equal(
              userCredential.id,
              registered.data.userId,
              'Correct user id'
            )
            t.equal(
              userCredential.email,
              registered.data.email,
              'Correct email'
            )
            t.equal(
              userCredential.passwordHash,
              registered.data.passwordHash,
              'Correct passwordHash'
            )
          })
      )
  )
})
