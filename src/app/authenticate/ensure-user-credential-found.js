const NotFoundError = require("../errors/not-found-error");

function ensureUserCredentialFound(context) {
  if (!context.userCredential) {
    throw new NotFoundError("no record found with that email");
  }
  return context;
}

module.exports = ensureUserCredentialFound;
