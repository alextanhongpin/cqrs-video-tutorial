/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
// We're going to mock the transcoding to focus on the flow through
// microservices.
const FAKE_TRANSCODING_DESTINATION =
  'https://www.youtube.com/watch?v=GI_P3UtZXAA'

/**
 * @description Simulates actually making the call to transcode our video.
 * We do this as if ffmpeg or something like it were installed locally.
 */
function transcodeVideo (context) {
  console.log('We totally have a video transcoder installed that we are')
  console.log('totally calling in this function. If we did not have such')
  console.log('an awesome one installed locally, we could call into a')
  console.log('3rd-party API here instead.')

  const { video } = context
  context.transcodedUri = FAKE_TRANSCODING_DESTINATION 
  console.log(`Transcode ${video.sourceUri} to ${context.transcodedUri}`)

  return context
}

module.exports = transcodeVideo
