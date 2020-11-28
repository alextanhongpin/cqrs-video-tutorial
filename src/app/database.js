const postgres = require("postgres");
const { defined } = require("./defined");

const config = () => ({
  host: defined("DB_HOST"),
  port: defined("DB_PORT"),
  database: defined("DB_NAME"),
  username: defined("DB_USER"),
  password: defined("DB_PASS"),
  max: 10,
  timeout: 0
});

const connect = (opts = config()) => postgres(opts);

module.exports = {
  config,
  connect
};
