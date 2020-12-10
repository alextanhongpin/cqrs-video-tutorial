/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const express = require('express')
const uuid = require('uuid/v4')

function createActions ({
  messageStore // (1)
}) {
  function recordViewing (traceId, videoId, userId) {
    const streamName = `viewing-${videoId}` // (2)
    const viewedEvent = { // (3)
      id: uuid(),
      type: 'VideoViewed',
      metadata: {
        traceId,
        userId
      },
      data: {
        userId,
        videoId
      }
    }
    
    return messageStore.write(streamName, viewedEvent) // (4)
  }

  return {
    recordViewing
  }
}

function createHandlers ({ actions }) {
  function handleRecordViewing (req, res) {
    return actions
      .recordViewing(
        req.context.traceId,
        req.params.videoId,
        req.context.userId
      )
      .then(() => res.redirect('/'))
  }

  return {
    handleRecordViewing
  }
}

function createRecordViewings ({
  messageStore
}) {
  const actions = createActions({
    messageStore
  })
  // ... rest of the body omitted
  const handlers = createHandlers({ actions }) 

  const router = express.Router() 

  router.route('/:videoId').post(handlers.handleRecordViewing) 

  return { actions, handlers, router }
}

module.exports = createRecordViewings
