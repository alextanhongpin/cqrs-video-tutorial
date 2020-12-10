/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
/**
 * @description Returns the category of the supplied `streamName`
 * @param {string} streamName The streamName from which to extract the category
 * @returns {string} The category of the supplied `streamName`
 */
function category (streamName) {
  // Double equals to catch null and undefined
  if (streamName == null) {
    return ''
  }

  return streamName.split('-')[0]
}

module.exports = category
