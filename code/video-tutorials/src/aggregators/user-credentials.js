/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
function createHandlers ({ queries }) {
  return {
    Registered: event =>
      queries.createUserCredential(
        event.data.userId,
        event.data.email,
        event.data.passwordHash
      )
  }
}

function createQueries ({ db }) {
  function createUserCredential (id, email, passwordHash) {
    const rawQuery = `
      INSERT INTO
        user_credentials (id, email, password_hash)
      VALUES
        (:id, :email, :passwordHash)
      ON CONFLICT DO NOTHING
    `

    return db.then(client =>
      client.raw(rawQuery, { id, email, passwordHash }))
  }

  return { createUserCredential }
}

function build ({ db, messageStore }) {
  const queries = createQueries({ db })
  const handlers = createHandlers({ queries })
  const subscription = messageStore.createSubscription({
    streamName: 'identity',
    handlers,
    subscriberId: 'aggregators:user-credentials'
  })

  function start () {
    subscription.start()
  }

  return {
    handlers,
    queries,
    start
  }
}

module.exports = build
