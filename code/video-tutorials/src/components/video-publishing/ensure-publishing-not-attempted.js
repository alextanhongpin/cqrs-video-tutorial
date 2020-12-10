/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const AlreadyPublishedError = require('./already-published-error')

/**
 * @description IDEMPOTENCE CHECK! Make sure we've not already tried to publish
 * the video.
 * @param {object} context
 * @param {object} context.video The video under consideration
 * @param {bool} context.video.publishingAttempted Whether or not the publishing
 * has been attempted
 * @returns context A Promise resolving to the `context`
 */
function ensurePublishingNotAttempted (context) {
  const { video } = context

  if (video.publishingAttempted) {
    throw new AlreadyPublishedError()
  }

  return context
}

module.exports = ensurePublishingNotAttempted
