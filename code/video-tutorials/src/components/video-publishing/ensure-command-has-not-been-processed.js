/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const CommandAlreadyProcessedError =
  require('./command-already-processed-error')

/**
 * @description IDEMPOTENCE CHECK! Make sure we haven't processed this command
 * already.
 * @param {object} context
 * @param {string} context.commandId The id of the command we're processing
 * @param {object} context.video The video under consideration
 * @param {array<string>} context.video.lastMessageProcessed The id of the last
 * message that is part of the video's state
 * @returns {object} The `context`
 */
function ensureCommandHasNotBeenProcessed (context) {
  const command = context.command
  const video = context.video

  if (video.sequence > command.globalPosition) {
    throw new CommandAlreadyProcessedError()
  }

  return context
}

module.exports = ensureCommandHasNotBeenProcessed
