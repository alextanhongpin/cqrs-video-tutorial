const packageJson = require("../../package.json");
const { defined } = require("./defined");

module.exports = {
  appName: defined("APP_NAME"),
  env: defined("NODE_ENV"),
  port: parseInt(defined("PORT"), 10),
  version: packageJson.version,
  emailDirectory: defined("EMAIL_DIRECTORY"),
  systemSenderEmailAddress: defined("SYSTEM_SENDER_EMAIL_ADDRESS")
};
