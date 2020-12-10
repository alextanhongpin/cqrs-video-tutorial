/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
function streamToSubscriberId (stream) {
  return stream.split(/-(.+)/)[1]
}

function createHandlers ({ queries }) {
  return {
    Read: event => {
      const subscriberId = streamToSubscriberId(event.streamName)

      return queries.upsertPosition(
        subscriberId,
        event.data.position,
        event.globalPosition
      )
    }
  }
}

function createQueries ({ db }) {
  function upsertPosition (subscriberId, position, lastMessageGlobalPosition) {
    const rawQuery = `
      INSERT INTO 
        admin_subscriber_positions (
          id,
          position,
          last_message_global_position
        )
      VALUES
        (:subscriberId, :position, :lastMessageGlobalPosition)
      ON CONFLICT (id) DO UPDATE
        SET
          position = :position,
          last_message_global_position = :lastMessageGlobalPosition
        WHERE
          admin_subscriber_positions.last_message_global_position < 
            :lastMessageGlobalPosition
    `

    return db.then(client =>
      client.raw(rawQuery, { subscriberId, position, lastMessageGlobalPosition })
    )
  }

  return { upsertPosition }
}

function build ({ db, messageStore }) {
  const queries = createQueries({ db })
  const handlers = createHandlers({ queries })
  const subscription = messageStore.createSubscription({
    streamName: 'subscriberPosition',
    handlers: handlers,
    subscriberId: '88f8757e-2738-434c-9c8e-c1f073e9f192'
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
