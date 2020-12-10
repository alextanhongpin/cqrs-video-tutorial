const AlreadySentRegistrationEmailError = require("./already-sent-registration-email-error");

function ensureRegistrationEmailNotSent(context) {
  if (context.identity.registrationEmailSent) {
    throw new AlreadySentRegistrationEmailError();
  }
  return context;
}

module.exports = ensureRegistrationEmailNotSent;
