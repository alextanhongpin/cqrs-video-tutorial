const AlreadySentError = require("./already-sent-error");

function ensureEmailHasNotBeenSent(context) {
  if (context.email.isSent) {
    throw new AlreadySentError();
  }

  return context;
}

module.exports = ensureEmailHasNotBeenSent;
