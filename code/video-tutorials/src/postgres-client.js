/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const Bluebird = require('bluebird')
const pg = require('pg')

function createDatabase ({ connectionString }) {
  const client = new pg.Client({ connectionString, Promise: Bluebird }) // (1)

  let connectedClient = null // (2)

  function connect () {
    if (!connectedClient) {
      connectedClient = client.connect()
        .then(() => client.query('SET search_path = message_store, public'))
        .then(() => client)
    }

    return connectedClient
  }

  function query (sql, values = []) { // (3)
    return connect()
      .then(client => client.query(sql, values))
  }

  return { // (4)
    query,
    stop: () => client.end()
  }
}

module.exports = createDatabase
