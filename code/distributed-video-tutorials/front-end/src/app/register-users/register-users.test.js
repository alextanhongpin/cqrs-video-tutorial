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

const { app, config, reset } = require('../../test-helper')

test('It catches a duplicate email', t => {
  const existingIdentity = {
    id: uuid(),
    email: 'existing@example.com',
    passwordHash: 'notahash'
  }

  return reset()
    .then(() =>
      config.db.then(client =>
        client('user_credentials').insert(
          snakeCaseKeys(existingIdentity)
        )
      )
    )
    .then(() =>
      supertest(app)
        .post('/register')
        .type('form')
        .send({ email: existingIdentity.email, password: 'doesnotmatter' })
        .expect(400)
    )
    .then(res => {
      t.assert(res.text.includes('already taken'))
    })
})

test('It catches a bad email and password', t => {
  const attributes = {
    email: 'not an email',
    password: 'short'
  }

  return supertest(app)
    .post('/register')
    .type('form')
    .send(attributes)
    .expect(400)
    .then(res => {
      t.assert(res.text.includes('too short'), 'Caught too short password')
      t.assert(res.text.includes('not a valid'), 'Caught invalid email')
    })
})

test('It issues the registration command when user submits good data ', t => {
  // Good data is:
  // - An email that looks like an email
  // - An email address that hasn't been used before
  // - A password that is at least 8 characters long

  const userId = uuid() // (1)
  const attributes = {
    id: userId,
    email: 'finally@example.com',
    password: 'adsfasdf'
  }

  return supertest(app) // (2)
    .post('/register')
    .type('form')
    .send(attributes)
    .expect(301)
    .then(res => {
      t.assert(res.headers.location.includes('registration-complete'))
    })
    .then(() => // (3)
      config.messageStore
        .read(`identity:command-${userId}`)
        .then(retrievedMessages => {
          t.equal(retrievedMessages.length, 1, 'There is 1 message')
          // Various assertions to make sure the command was filled out right
          t.equal(
            retrievedMessages[0].type,
            'Register',
            'It is a register command'
          )
          t.equal(
            retrievedMessages[0].data.email,
            attributes.email,
            'It is the correct email'
          )
          t.ok(
            retrievedMessages[0].metadata.traceId,
            'It has a traceId'
          )
          t.equal(
            retrievedMessages[0].metadata.userId,
            userId,
            'Used the supplied userId'
          )
          t.equal(
            retrievedMessages[0].data.userId,
            userId,
            'The userId is in the payload'
          )
        })
    )
})

