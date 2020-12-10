/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const bcrypt = require('bcrypt')
const test = require('blue-tape')
const snakeCaseKeys = require('snakecase-keys')
const supertest = require('supertest')
const uuid = require('uuid/v4')

const { app, config, reset } = require('../../test-helper')

const userLoginFailedEventType = 'UserLoginFailed'

test('Logging in with incorrect password writes UserLoginFailed event', t => {
  const password = 'asdfasdf'
  const userId = uuid()
  const userCredential = {
    id: userId,
    email: 'test@example.com',
    passwordHash: bcrypt.hashSync(password, 1)
  }

  return reset()
    .then(() =>
      config.db.then(client =>
        client('user_credentials').insert(
          snakeCaseKeys(userCredential)
        )
      )
    )
    .then(() =>
      supertest(app)
        .post('/auth/log-in')
        .type('form')
        .send({ email: userCredential.email, password: 'nopenope' })
        .expect(401)
    )
    .then(() =>
      config.messageStore
        .read(`authentication-${userId}`)
        .then(retrievedMessages => {
          t.equal(retrievedMessages.length, 1, '1 message written')
          t.equal(
            retrievedMessages[0].type,
            userLoginFailedEventType,
            'Correct type'
          )
          t.equal(
            retrievedMessages[0].data.userId,
            userId,
            'It has the userId in the data'
          )
        })
    )
})

test('Logging in with valid credentials sets the session cookie', t => {
  const password = 'asdfasdf'
  const userId = uuid()
  const userCredential = {
    id: userId,
    email: 'test@example.com',
    passwordHash: bcrypt.hashSync(password, 1)
  }

  return reset()
    .then(() =>
      config.db.then(client =>
        client('user_credentials').insert(
          snakeCaseKeys(userCredential)
        )
      )
    )
    .then(() =>
      supertest(app)
        .post('/auth/log-in')
        .type('form')
        .send({ email: userCredential.email, password })
        .expect(302)
    )
    .then(res => {
      const cookieLine = res.headers['set-cookie'][0]
      const matches = cookieLine.match(/session=([a-zA-Z0-9]*)/)
      const sessionValue = matches[1]
      const decodedSession = Buffer.from(sessionValue, 'base64').toString(
        'utf8'
      )
      const session = JSON.parse(decodedSession)

      t.equal(res.headers.location, '/', 'Redirect to root')
      t.equal(session.userId, userCredential.id, 'Set the session cookie')
    })
})

test('Logging in with valid credentials writes the login event', t => {
  const password = 'asdfasdf'
  const userId = uuid()
  const userCredential = {
    id: userId,
    email: 'test@example.com',
    passwordHash: bcrypt.hashSync(password, 1)
  }

  return reset()
    .then(() =>
      config.db.then(client =>
        client('user_credentials').insert(
          snakeCaseKeys(userCredential)
        )
      )
    )
    .then(() =>
      supertest(app)
        .post('/auth/log-in')
        .type('form')
        .send({ email: userCredential.email, password })
        .expect(302)
    )
    .then(() =>
      config.messageStore.read(`authentication-${userId}`).then(messages => {
        t.equal(messages.length, 1, 'There is one message')
        t.equal(messages[0].type, 'UserLoggedIn', 'It is a logged in event')
        t.equal(messages[0].data.userId, userId, 'It has the userId')
      })
    )
})
