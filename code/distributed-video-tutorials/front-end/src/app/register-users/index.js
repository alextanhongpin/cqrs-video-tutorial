/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const Bluebird = require('bluebird')
const bodyParser = require('body-parser')
const camelCaseKeys = require('camelcase-keys')
const express = require('express')
const uuid = require('uuid/v4')

const ValidationError = require('../errors/validation-error')
const writeRegisterCommand = require('./write-register-command')
const hashPassword = require('./hash-password')
const loadExistingIdentity = require('./load-existing-identity')
const ensureThereWasNoExistingIdentity =
  require('./ensure-there-was-no-existing-identity')
const validate = require('./validate')

function createActions ({ messageStore, queries }) {
  /**
   * @description Do a superficial check, and if it passes, issue the command to
   * register the user
   * @param {string} traceId The trace id associated with this
   * action
   * @param {object} attributes The user-supplied attributes
   * @param {string} attributes.email The email the user is registering with
   * @param {string} attributes.password The password the user is registering
   * with
   */
  function registerUser (traceId, attributes) {
    const context = { attributes, traceId, messageStore, queries }

    return Bluebird.resolve(context)
      .then(validate)
      .then(loadExistingIdentity)
      .then(ensureThereWasNoExistingIdentity)
      .then(hashPassword)
      .then(writeRegisterCommand)
  }

  return {
    registerUser
  }
}

function createHandlers ({ actions }) {
  function handleRegistrationForm (req, res) {
    const userId = uuid()

    res.render('register-users/templates/register', { userId })
  }

  // ...
  function handleRegistrationComplete (req, res) {
    res.render('register-users/templates/registration-complete')
  }

  // ...
  function handleRegisterUser (req, res, next) { // (1)
    const attributes = {
      id: req.body.id,
      email: req.body.email,
      password: req.body.password
    }

    return actions
      .registerUser(req.context.traceId, attributes)
      .then(() => res.redirect(301, 'register/registration-complete')) // (2)
      .catch(ValidationError, err => // (3)
        res
          .status(400)
          .render(
            'register-users/templates/register',
            { userId: attributes.id, errors: err.errors }
          )
      )
      .catch(next) // (4)
  }

  return {
    handleRegistrationForm,
    handleRegistrationComplete,
    handleRegisterUser
  }
}

function createQueries ({ db }) {
  function byEmail (email) {
    return db
      .then(client =>
        client('user_credentials')
          .where({ email })
          .limit(1)
      )
      .then(camelCaseKeys)
      .then(rows => rows[0])
  }

  return { byEmail }
}

function build ({ db, messageStore }) {
  const queries = createQueries({ db })
  const actions = createActions({ messageStore, queries })
  const handlers = createHandlers({ actions })

  const router = express.Router()

  router // (5)
    .route('/')
    .get(handlers.handleRegistrationForm)
    .post(
      bodyParser.urlencoded({ extended: false }),
      handlers.handleRegisterUser
    )

  router // (6)
    .route('/registration-complete')
    .get(handlers.handleRegistrationComplete)

  return { actions, handlers, queries, router }
}

module.exports = build
