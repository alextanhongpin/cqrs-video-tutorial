const AuthenticationError = require("../errors/authentication-error");

function handleCredentialNotFound(context) {
  throw new AuthenticationError();
}

module.exports = handleCredentialNotFound;
