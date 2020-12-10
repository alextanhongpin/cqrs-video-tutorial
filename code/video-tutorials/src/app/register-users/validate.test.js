/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const test = require('blue-tape')

const validate = require('./validate')

test('It notices an invalid email address', t => {
  const context = {
    attributes: {
      email: 'not an email'
    }
  }

  try {
    validate(context)

    t.fail('Getting here means there was no error')
  } catch (e) {
    const errors = JSON.parse(e.message.split('**')[1])
    t.equal(
      errors.email[0],
      'Email is not a valid email',
      'Noticed it was not an email'
    )
  }

  t.end()
})

test('Email must be present', t => {
  const context = {
    attributes: {
      email: ''
    }
  }

  try {
    validate(context)

    t.fail('Getting here means there was no error')
  } catch (e) {
    const errors = JSON.parse(e.message.split('**')[1])
    t.equal(
      errors.email[0],
      'Email is not a valid email',
      'Noticed it was not an email'
    )
  }

  t.end()
})

test('Password must be at least 8 characters long', t => {
  const context = {
    attributes: {
      password: 'short'
    }
  }

  try {
    validate(context)

    t.fail('Getting here means there was no error')
  } catch (e) {
    const errors = JSON.parse(e.message.split('**')[1])
    t.ok(
      errors.password[0].includes('too short'),
      'Noticed the password was too short'
    )
  }

  t.end()
})
