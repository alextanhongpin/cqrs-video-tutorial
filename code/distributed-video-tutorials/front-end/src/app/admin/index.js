/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const camelCaseKeys = require('camelcase-keys')
const express = require('express')

function createHandlers ({ queries }) {
  function handleUsersIndex (req, res) {
    return queries
      .usersIndex()
      .then(users =>
        res.render('admin/templates/users-index', { users: users })
      )
  }

  function handleShowUser (req, res) {
    const userPromise = queries.user(req.params.id) // (1)
    const loginEventsPromise = queries.userLoginEvents(req.params.id)
    const viewingEventsPromise = queries.userViewingEvents(req.params.id)

    return Promise.all([ // (2)
      userPromise,
      loginEventsPromise,
      viewingEventsPromise
    ]).then(values => {
      const user = values[0] // (3)
      const loginEvents = values[1]
      const viewingEvents = values[2]

      return res.render('admin/templates/user', { // (4)
        user: user,
        loginEvents: loginEvents,
        viewingEvents: viewingEvents
      })
    })
  }

  function handleMessagesIndex (req, res) {
    return queries
      .messages()
      .then(messages =>
        res.render('admin/templates/messages-index', { messages })
      )
  }

  function handleCorrelatedMessagesIndex (req, res) {
    const traceId = req.params.traceId

    return queries
      .correlatedMessages(traceId)
      .then(messages =>
        res.render('admin/templates/messages-index', {
          messages,
          title: 'Correlated Messages'
        })
      )
  }

  function handleUserMessagesIndex (req, res) {
    const userId = req.params.userId

    return res.send(
      `<troll>This handler is left as an exercise for the reader.</troll>
      If it weren't an excercise for the reader, you'd be looking at messages
      for user ${userId}'`
    )
  }

  function handleShowStream (req, res) {
    const streamName = req.params.streamName

    return queries.streamName(streamName).then(messages =>
      res.render('admin/templates/messages-index', {
        messages: messages,
        title: `Stream: ${streamName}`
      })
    )
  }

  function handleShowMessage (req, res) {
    const messageId = req.params.id

    return queries
      .message(messageId)
      .then(message =>
        res.render('admin/templates/message', { message: message })
      )
  }

  function handleStreamsIndex (req, res) {
    return queries
      .streams()
      .then(streams => res.render('admin/templates/streams-index', { streams }))
  }

  function handleSubscriberPositions (req, res) {
    return queries
      .subscriberPositions()
      .then(positions =>
        res.render('admin/templates/subscriber-positions', { positions })
      )
  }

  return {
    handleUsersIndex,
    handleShowUser,
    handleMessagesIndex,
    handleCorrelatedMessagesIndex,
    handleUserMessagesIndex,
    handleShowStream,
    handleShowMessage,
    handleStreamsIndex,
    handleSubscriberPositions
  }
}

function createQueries ({ db, messageStoreDb }) {
  function usersIndex () {
    return db
      .then(client => client('admin_users').orderBy('email', 'ASC'))
      .then(camelCaseKeys)
  }

  function user (id) {
    return db
      .then(client => client('admin_users').where({ id: id }))
      .then(camelCaseKeys)
      .then(rows => rows[0])
  }

  function userLoginEvents (userId) {
    return messageStoreDb.query(
      `
        SELECT
          * 
        FROM 
          messages 
        WHERE stream_name=$1
        ORDER BY global_position ASC
      `,
      [`authentication-${userId}`]
    )
      .then(res => res.rows)
      .then(camelCaseKeys)
  }

  function userViewingEvents (userId) {
    return messageStoreDb.query(
      `
        SELECT
          *
        FROM 
          messages 
        WHERE category(stream_name) = 'viewing' AND metadata->>'userId' = $1
        ORDER BY global_position ASC
      `,
      [userId]
    )
      .then(res => res.rows)
      .then(camelCaseKeys)
  }

  function messages () {
    return messageStoreDb.query(
      'SELECT * FROM messages ORDER BY global_position ASC'
    )
      .then(res => res.rows)
      .then(camelCaseKeys)
  }

  function correlatedMessages (traceId) {
    return messageStoreDb.query(
      `SELECT * FROM messages WHERE metadata->>'traceId' = $1`,
      [traceId]
    )
      .then(res => res.rows)
      .then(camelCaseKeys)
  }

  function streamName (streamName) {
    return messageStoreDb.query(
      `
        SELECT
          *
        FROM
          messages
        WHERE stream_name = $1
        ORDER BY global_position ASC
      `,
      [ streamName ]
    )
      .then(res => res.rows)
      .then(camelCaseKeys)
  }

  function message (id) {
    return messageStoreDb.query(
      'SELECT * FROM messages WHERE id = $1',
      [id]
    )
      .then(res => res.rows)
      .then(camelCaseKeys)
      .then(rows => rows[0])
  }

  function streams () {
    return db
      .then(client =>
        client('admin_streams').orderBy('stream_name', 'ASC')
      )
      .then(camelCaseKeys)
  }

  function subscriberPositions () {
    return db.then(client =>
      client('admin_subscriber_positions').then(camelCaseKeys)
    )
  }

  return {
    usersIndex,
    user,
    userLoginEvents,
    userViewingEvents,
    messages,
    correlatedMessages,
    streamName,
    message,
    streams,
    subscriberPositions
  }
}

function createAdminApplication ({ db, messageStoreDb }) {
  const queries = createQueries({ db, messageStoreDb })
  const handlers = createHandlers({ queries })

  const router = express.Router()

  router.route('/users').get(handlers.handleUsersIndex)
  router.route('/users/:id').get(handlers.handleShowUser)

  router.route('/messages/:id').get(handlers.handleShowMessage)
  router.route('/messages').get(handlers.handleMessagesIndex)
  // ...
  router
    .route('/correlated-messages/:traceId')
    .get(handlers.handleCorrelatedMessagesIndex)
  // ...
  router.route('/user-messages/:userId').get(handlers.handleUserMessagesIndex)
  router.route('/streams/:streamName').get(handlers.handleShowStream)
  router.route('/streams').get(handlers.handleStreamsIndex)

  router.route('/subscriber-positions').get(handlers.handleSubscriberPositions)

  return {
    handlers,
    queries,
    router
  }
}

module.exports = createAdminApplication
