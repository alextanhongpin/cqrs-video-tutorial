const bcrypt = require("bcrypt");

const CredentialMismatchError = require("../errors/credential-mismatch-error");

async function validatePassword(context) {
  const matched = await bcrypt.compare(
    context.password,
    context.userCredential.passwordHash
  );
  if (!matched) throw new CredentialMismatchError();

  return context;
}

module.exports = validatePassword;
