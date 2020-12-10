/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const validate = require('validate.js')

const ValidationError = require('./validation-error')

const constraints = { 
  name: {
    presence: { allowEmpty: false }
  }
}

/**
 * @description Make sure the name follows our naming rules
 * @param {object} context
 * @param {object} context.name The proposed name
 * @returns context A Promise resolving to the `context`
 */
function ensureNameIsValid (context) {
  const command = context.command
  const validateMe = { name: command.data.name }
  const validationErrors = validate(validateMe, constraints)

  if (validationErrors) {
    throw new ValidationError(
      validationErrors,
      constraints,
      context.video
    )
  }

  return context
}

module.exports = ensureNameIsValid
