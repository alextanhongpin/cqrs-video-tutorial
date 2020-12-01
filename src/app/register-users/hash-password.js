const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

async function hashPassword(context) {
  const passwordHash = await bcrypt.hash(
    context.attributes.password,
    SALT_ROUNDS
  );
  context.passwordHash = passwordHash;
  return context;
}

module.exports = hashPassword;
