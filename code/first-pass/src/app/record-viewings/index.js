/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const express = require('express')

function createActions ({
  db
}) {
  function recordViewing (traceId, videoId) {
    // Return something Promise-based so that the endpoint doesn't crash
    return Promise.resolve(true)
  }

  return {
    recordViewing
  }
}

function createHandlers ({ actions }) {
  function handleRecordViewing (req, res) {
    return actions
      .recordViewing(req.context.traceId, req.params.videoId)
      .then(() => res.redirect('/'))
  }

  return {
    handleRecordViewing
  }
}

function createRecordViewings ({ 
  db
}) {
  const actions = createActions({
    db
  })
  const handlers = createHandlers({ actions }) 

  const router = express.Router() 

  router.route('/:videoId').post(handlers.handleRecordViewing) 

  return { actions, handlers, router }
}

module.exports = createRecordViewings
