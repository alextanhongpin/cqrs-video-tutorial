/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
function createIdentityHandlers ({ queries }) {
  return {
    Registered: event =>
      queries
        .ensureUser(event.data.userId)
        .then(() =>
          queries.setEmail(
            event.data.userId,
            event.data.email,
            event.globalPosition
          )
        ),

    RegistrationEmailSent: event => queries
      .ensureUser(event.data.userId)
      .then(() =>
        queries.markRegistrationEmailSent(
          event.data.userId,
          event.globalPosition
        )
      )
  }
}

function createAuthenticationHandlers ({ queries }) {
  return {
    UserLoggedIn: event => queries
      .ensureUser(event.data.userId)
      .then(() =>
        queries.incrementLogin(event.data.userId, event.globalPosition)
      )
  }
}

function createQueries ({ db }) {
  function ensureUser (id) {
    const rawQuery = `
      INSERT INTO 
        admin_users (id)
      VALUES
        (:id)
      ON CONFLICT DO NOTHING
    `

    return db.then(client => client.raw(rawQuery, { id }))
  }

  function incrementLogin (id, eventGlobalPosition) {
    const rawQuery = `
      UPDATE
        admin_users
      SET
        login_count = login_count + 1,
        last_authentication_event_global_position = :eventGlobalPosition
      WHERE
        id = :id AND
        last_authentication_event_global_position < :eventGlobalPosition
    `

    return db.then(client =>
      client.raw(rawQuery, { id: id, eventGlobalPosition: eventGlobalPosition })
    )
  }

  function markRegistrationEmailSent (id, eventGlobalPosition) {
    return db.then(
      client =>
        client('admin_users')
          .update({
            registration_email_sent: true,
            last_identity_event_global_position: eventGlobalPosition
          })
          .where(
            'last_identity_event_global_position',
            '<',
            eventGlobalPosition
          )
          .where({ id: id })
    )
  }

  function setEmail (id, email, eventGlobalPosition) {
    return db.then(
      client =>
        client('admin_users')
          .update({
            email: email,
            last_identity_event_global_position: eventGlobalPosition
          })
          .where(
            'last_identity_event_global_position',
            '<',
            eventGlobalPosition
          )
          .where({ id: id })
    )
  }

  return {
    ensureUser,
    incrementLogin,
    markRegistrationEmailSent,
    setEmail
  }
}

function build ({ db, messageStore }) {
  const queries = createQueries({ db })
  const identityHandlers = createIdentityHandlers({ queries }) // (1)
  const identitySubscription = messageStore.createSubscription({
    streamName: 'identity',
    handlers: identityHandlers,
    subscriberId: 'e482ed56-311c-486c-9bb8-8c2e2ca6f6f4'
  })

  const authenticationHandlers = createAuthenticationHandlers({ queries }) // (2)
  const authenticationSubscription = messageStore.createSubscription({
    streamName: 'authentication',
    handlers: authenticationHandlers,
    subscriberId: '18b4c5d6-1f30-4a67-9b61-76a42884a9bb'
  })

  function start () { // (3)
    identitySubscription.start()
    authenticationSubscription.start()
  }

  return {
    authenticationHandlers,
    identityHandlers,
    queries,
    start
  }
}

module.exports = build
