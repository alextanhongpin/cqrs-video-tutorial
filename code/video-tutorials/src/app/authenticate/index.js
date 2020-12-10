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

const AuthenticationError = require('../errors/authentication-error')
const CredentialsMismatchError = require('../errors/credential-mismatch-error')
const NotFoundError = require('../errors/not-found-error')
const handleCredentialNotFound = require('./handle-credential-not-found')
const handleCredentialsMismatch = require('./handle-credential-mismatch')
const loadUserCredential = require('./load-user-credential')
const ensureUserCredentialFound = require('./ensure-user-credential-found')
const validatePassword = require('./validate-password')
const writeLoggedInEvent = require('./write-logged-in-event')

function createActions ({ messageStore, queries }) {
  function authenticate (traceId, email, password) {
    const context = {
      traceId,
      email,
      messageStore,
      password,
      queries
    }

    return Bluebird.resolve(context)
      .then(loadUserCredential)
      .then(ensureUserCredentialFound)
      .then(validatePassword)
      .then(writeLoggedInEvent)
      .catch(NotFoundError, () => handleCredentialNotFound(context))
      .catch(CredentialsMismatchError, () =>
        handleCredentialsMismatch(context)
      )
  }

  return { authenticate }
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

function createHandlers ({ actions }) {
  function handleAuthenticate (req, res, next) {
    const {
      body: { email, password },
      context: { traceId }
    } = req

    return actions
      .authenticate(traceId, email, password) // (1)
      .then(context => { // (2)
        req.session.userId = context.userCredential.id
        res.redirect('/')
      })
      .catch(AuthenticationError, () => // (3)
        res
          .status(401)
          .render('authenticate/templates/login-form', { errors: true })
      )
      .catch(next) // (4)
  }

  function handleLogOut (req, res) {
    req.session = null
    res.redirect('/')
  }

  function handleShowLoginForm (req, res) {
    res.render('authenticate/templates/login-form')
  }

  return { handleAuthenticate, handleLogOut, handleShowLoginForm }
}

function build ({ db, messageStore }) {
  const queries = createQueries({ db })
  const actions = createActions({ messageStore, queries })
  const handlers = createHandlers({ actions })

  const router = express.Router()

  router
    .route('/log-in')
    .get(handlers.handleShowLoginForm)
    // ...
    .post(
      bodyParser.urlencoded({ extended: false }),
      handlers.handleAuthenticate
    )

  router.route('/log-out').get(handlers.handleLogOut)

  return { actions, handlers, queries, router }
}

module.exports = build
