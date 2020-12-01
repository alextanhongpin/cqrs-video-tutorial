const ValidationError = require("../errors/validation-error");

function ensureThereWasNoExistingIdentity(context) {
  if (context.existingIdentity) {
    throw new ValidationError({ email: ["already taken"] });
  }
  return context;
}

module.exports = ensureThereWasNoExistingIdentity;
