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
    $any: event => queries.upsertStream(
      event.streamName,
      event.id,
      event.globalPosition
    )
  }
}

function createQueries ({ db }) {
  function upsertStream (streamName, id, globalPosition) {
    const rawQuery = `
      INSERT INTO 
        admin_streams (
          stream_name,
          message_count,
          last_message_id,
          last_message_global_position
        )
      VALUES
        (:streamName, 1, :id, :globalPosition)
      ON CONFLICT (stream_name) DO UPDATE
        SET
          message_count = admin_streams.message_count + 1,
          last_message_id = :id,
          last_message_global_position = :globalPosition
        WHERE
          admin_streams.last_message_global_position < :globalPosition
    `

    return db.then(
      client => client.raw(rawQuery, { streamName, id, globalPosition })
    )
  }

  return { upsertStream }
}

function build ({ db, messageStore }) {
  const queries = createQueries({ db })
  const handlers = createHandlers({ queries })
  const subscription = messageStore.createSubscription({
    streamName: '$all',
    handlers: handlers,
    subscriberId: '6db9a0ab-7679-4b02-b5ad-2ebc8ae06b6a'
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
