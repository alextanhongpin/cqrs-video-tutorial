const dbmigrate = require("db-migrate");

const migrate = async (options = {}, sshhh = true) => {
  const instance = dbmigrate.getInstance(true, options);
  instance.silence(sshhh);
  await instance.up();
};

module.exports = migrate;
