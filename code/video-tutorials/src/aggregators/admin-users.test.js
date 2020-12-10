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
const faker = require('faker')
const uuid = require('uuid/v4')

const { config, reset } = require('../test-helper')

function exampleRegisteredEvent ({ globalPosition, userId } = {}) {
  globalPosition = globalPosition || 1
  userId = userId || uuid()

  return {
    id: uuid(),
    type: 'Registered',
    metadata: {
      traceId: uuid(),
      userId
    },
    data: {
      userId,
      email: faker.internet.email(),
      passwordHash: 'notahash'
    },
    streamName: `identity-${userId}`,
    globalPosition
  }
}

function exampleLoginEvent ({ globalPosition, userId } = {}) {
  globalPosition = globalPosition || 1
  userId = userId || uuid()

  return {
    id: uuid(),
    type: 'UserLoggedIn',
    metadata: {
      traceId: uuid(),
      userId
    },
    data: { userId },
    streamName: `authentication-${userId}`,
    globalPosition
  }
}

function exampleRegistrationEmailSentEvent ({ globalPosition, userId } = {}) {
  globalPosition = globalPosition || 1
  userId = userId || uuid()

  return {
    id: uuid(),
    type: 'RegistrationEmailSent',
    metadata: {
      traceId: uuid(),
      userId
    },
    data: { userId },
    streamName: `registrationEmail-${userId}`,
    globalPosition
  }
}

test('It aggregates registration as first event', t => {
  const event = exampleRegisteredEvent()

  return reset()
    .then(() =>
      config.adminUsersAggregator.identityHandlers.Registered(event)
    )
    .then(() =>
      config.db
        .then(client =>
          client('admin_users')
            .where({ id: event.data.userId })
            .limit(1)
        )
        .then(camelCaseKeys)
        .then(([user]) => {
          t.ok(user, 'Got the user')
          t.equal(user.email, event.data.email, 'Correct email')
          t.equal(
            user.lastIdentityEventGlobalPosition,
            event.globalPosition,
            'Correct lastIdentityEventGlobalPosition'
          )
        })
    )
})

test('It aggregates login as first event', t => {
  const event = exampleLoginEvent()

  return reset()
    .then(() =>
      config.adminUsersAggregator.authenticationHandlers.UserLoggedIn(event)
    )
    .then(() =>
      config.db
        .then(client =>
          client('admin_users')
            .where({ id: event.data.userId })
            .limit(1)
        )
        .then(camelCaseKeys)
        .then(([user]) => {
          t.ok(user, 'Got the user')
          t.equal(user.loginCount, 1, '1 login')
          t.equal(
            user.lastAuthenticationEventGlobalPosition,
            event.globalPosition,
            'Correct lastAuthenticationEventGlobalPosition'
          )
        })
    )
})

test('The events can arrive in whatever order', t => {
  const userId = uuid()
  const registrationEvent = exampleRegisteredEvent({
    globalPosition: 1,
    userId
  })
  const emailEvent = exampleRegistrationEmailSentEvent({
    globalPosition: 6,
    userId
  })
  const loginEvent = exampleLoginEvent({
    globalPosition: 10,
    userId
  })
  
  const aggregator = config.adminUsersAggregator

  return reset()
    .then(() => aggregator.authenticationHandlers.UserLoggedIn(loginEvent))
    .then(() => aggregator.identityHandlers.Registered(registrationEvent))
    .then(() => aggregator.identityHandlers.RegistrationEmailSent(emailEvent))
    .then(() =>
      config.db
        .then(client =>
          client('admin_users')
            .where({ id: userId })
            .limit(1)
        )
        .then(camelCaseKeys)
        .then(([user]) => {
          t.ok(user, 'Got the user')
          t.equal(user.email, registrationEvent.data.email, 'Correct email')
          t.ok(user.registrationEmailSent, 'The email was sent')
          t.equal(
            user.lastIdentityEventGlobalPosition,
            emailEvent.globalPosition,
            'Correct lastIdentityEventGlobalPosition'
          )

          t.equal(user.loginCount, 1, '1 login')
          t.equal(
            user.lastAuthenticationEventGlobalPosition,
            loginEvent.globalPosition,
            'Correct lastAuthenticationEventGlobalPosition'
          )
        })
    )
})
