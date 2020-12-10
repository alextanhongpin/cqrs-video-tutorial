/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
function VersionConflictError (stream, expected, actual) {
  Error.captureStackTrace(this, this.constructor)
  const message = [
    'VersionConflict: stream',
    stream,
    'expected version',
    expected,
    'but was at version',
    actual
  ].join(' ')

  this.message = message
  this.name = 'VersionConflictError'
}

VersionConflictError.prototype = Object.create(Error.prototype)
VersionConflictError.prototype.constructor = VersionConflictError

module.exports = VersionConflictError
