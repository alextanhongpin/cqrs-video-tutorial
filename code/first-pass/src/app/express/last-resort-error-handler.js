/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
function lastResortErrorHandler (err, req, res, next) {
  const traceId = req.context ? req.context.traceId : 'none'
  console.error(traceId, err)

  res.status(500).send('error')
}

module.exports = lastResortErrorHandler
