/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const createRead = require('./read')
const configureCreateSubscription = require('./subscribe')
// ...
const createWrite = require('./write')
const VersionConflictError = require('./version-conflict-error')

function createMessageStore ({ db }) {
  // ...
  const write = createWrite({ db })
  const read = createRead({ db })
  const createSubscription = configureCreateSubscription({
    read: read.read,
    readLastMessage: read.readLastMessage,
    write: write
  })

  return {
    write: write,
    // ...
    createSubscription,
    read: read.read,
    readLastMessage: read.readLastMessage,
    // ...
    fetch: read.fetch,
    stop: db.stop
  }
}

module.exports = exports = createMessageStore
exports.project = createRead.project
exports.VersionConflictError = VersionConflictError
