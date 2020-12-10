/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const bodyParser = require('body-parser')
const camelCaseKeys = require('camelcase-keys')
const express = require('express')
const uuid = require('uuid/v4')

function createActions ({ messageStore, queries }) {
  function publishVideo (context, videoId, sourceUri) {
    const publishVideoCommand = {
      id: uuid(),
      type: 'PublishVideo',
      metadata: {
        traceId: context.traceId,
        userId: context.userId
      },
      data: {
        ownerId: context.userId,
        sourceUri: sourceUri,
        videoId: videoId
      }
    }
    const streamName = `videoPublishing:command-${videoId}`

    return messageStore.write(streamName, publishVideoCommand)
  }

  // ...
  function nameVideo (context, videoId, name) {
    const nameVideoCommand = {
      id: uuid(),
      type: 'NameVideo',
      metadata: {
        traceId: context.traceId,
        userId: context.userId
      },
      data: {
        name,
        videoId
      }
    }
    const streamName = `videoPublishing:command-${videoId}`

    return messageStore.write(streamName, nameVideoCommand)
  }

  return {
    publishVideo,
    // ...
    nameVideo
  }
}

function createHandlers ({ actions, queries }) {
  function handlePublishVideo (req, res, next) {
    return actions
      .publishVideo(req.context, req.body.videoId, req.body.url)
      .then(() => res.json('"ok"'))
      .catch(next)
  }

  function handleDashboard (req, res, next) {
    return queries
      .videosByOwnerId(req.context.userId)
      .then(videos => {
        const newVideoId = uuid()
        const renderContext = { newVideoId, videos }

        res.render('creators-portal/templates/dashboard', renderContext)
      })
      .catch(next)
  }

  function handleNameVideo (req, res, next) {
    const videoId = req.params.id
    const name = req.body.name

    actions
      .nameVideo(req.context, videoId, name)
      .then(() =>
        res.redirect(
          `/creators-portal/video-operations/${req.context.traceId}`
        )
      )
      .catch(next)
  }

  function handleShowVideo (req, res, next) {
    const videoId = req.params.id
    const ownerId = req.context.userId

    return queries
      .videoByIdAndOwnerId(videoId, ownerId)
      .then(video => {
        const template = video
          ? 'creators-portal/templates/video'
          : 'common-templates/404'

        return res.render(template, { video })
      })
      .catch(next)
  }

  function handleShowVideoOperation (req, res, next) {
    return queries.videoOperationByTraceId(req.params.traceId)
      .then(operation => {
        if (!operation || !operation.succeeded) {
          return res.render(
            'creators-portal/templates/video-operation',
            { operation }
          )
        }

        return res.redirect(
          `/creators-portal/videos/${operation.videoId}`
        )
      })
  }

  return {
    handlePublishVideo,
    handleDashboard,
    handleShowVideo,
    handleNameVideo,
    handleShowVideoOperation
  }
}

function createQueries ({ db }) {
  function videosByOwnerId (ownerId) {
    return db.then(client =>
      client('creators_portal_videos')
        .where({ owner_id: ownerId })
    )
      .then(camelCaseKeys)
  }

  function videoByIdAndOwnerId (id, ownerId) {
    const queryParams = {
      id,
      owner_id: ownerId
    }

    return db.then(client =>
      client('creators_portal_videos')
        .where(queryParams)
        .limit(1)
    )
      .then(camelCaseKeys)
      .then(rows => rows[0])
  }

  function videoOperationByTraceId (traceId) {
    return db.then(client =>
      client('video_operations')
        .where({ trace_id: traceId })
        .limit(1)
    )
      .then(camelCaseKeys)
      .then(rows => rows[0])
  }

  return { videosByOwnerId, videoByIdAndOwnerId, videoOperationByTraceId }
}

function createCreatorsPortal ({ db, messageStore }) {
  const queries = createQueries({ db })
  const actions = createActions({ messageStore, queries })
  const handlers = createHandlers({ actions, queries })

  const router = express.Router()

  router
    .route('/videos/:id/name')
    .post(bodyParser.urlencoded({ extended: false }), handlers.handleNameVideo)
  router.route('/video-operations/:traceId')
    .get(handlers.handleShowVideoOperation)

  router
    .route('/publish-video')
    .post(bodyParser.json(), handlers.handlePublishVideo) 
  router.route('/videos/:id').get(handlers.handleShowVideo) 
  router.route('/').get(handlers.handleDashboard) 
  
  return { handlers, router }
}

module.exports = createCreatorsPortal
