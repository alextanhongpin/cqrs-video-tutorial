/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const videoPublishingProjection = {
  $init () { 
    return {
      id: null,
      publishingAttempted: false,
      sourceUri: null,
      transcodedUri: null,
      sequence: 0,
      name: ''
    }
  },

  VideoNamed (video, videoNamed) {
    video.sequence = videoNamed.globalPosition
    video.name = videoNamed.data.name

    return video
  },

  VideoNameRejected (video, videoNameRejected) {
    video.sequence = videoNameRejected.globalPosition

    return video
  },

  VideoPublished (video, videoPublished) { 
    video.id = videoPublished.data.videoId
    video.publishingAttempted = true
    video.ownerId = videoPublished.data.ownerId
    video.sourceUri = videoPublished.data.sourceUri
    video.transcodedUri = videoPublished.data.transcodedUri

    return video
  },

  VideoPublishingFailed (video, videoPublishingFailed) { 
    video.id = videoPublishingFailed.data.videoId
    video.publishingAttempted = true
    video.ownerId = videoPublishingFailed.data.ownerId
    video.sourceUri = videoPublishingFailed.data.sourceUri

    return video
  }  
}

module.exports = videoPublishingProjection
