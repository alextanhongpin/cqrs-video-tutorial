/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
/**
 * @description Loads the video whose id is at context.videoId and whose
 * user's id is at context.userId into the context
 * @param {object} context
 * @param {object} context.queries
 * @param {function} context.queries.videoByIdAndUserId The loading
 * function
 * @param {string} context.videoId The videoId to load
 */
function loadVideo (context) {
  const { queries, userId, videoId } = context

  return queries.videoByIdAndUserId(videoId, userId).then(video => {
    context.video = video

    return context
  })
}

module.exports = loadVideo
