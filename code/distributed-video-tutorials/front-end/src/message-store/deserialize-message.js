/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
/**
 * @description The Message Store is a PostgreSQL database, and idiomatic RDBMSs
 * tend to use snake_casing.  Also, `position` and `global_position` come back
 * as strings, and we need them as numbers.  This function deals with that.
 */
function deserializeMessage (rawMessage) {
  if (!rawMessage) {
    return null
  }

  return {
    id: rawMessage.id,
    streamName: rawMessage.stream_name,
    type: rawMessage.type,
    position: parseInt(rawMessage.position, 10),
    globalPosition: parseInt(rawMessage.global_position, 10),
    data: rawMessage.data ? JSON.parse(rawMessage.data) : {},
    metadata: rawMessage.metadata ? JSON.parse(rawMessage.metadata) : {},
    time: rawMessage.time
  }
}

module.exports = deserializeMessage
