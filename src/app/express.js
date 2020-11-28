const express = require("express");
const { join } = require("path");
const { mountMiddlewares } = require("./middleware");
const { mountRoutes } = require("./route");

function createExpressApp({ config, env }) {
  const app = express();

  app.set("views", join(__dirname, ".."));
  app.set("view engine", "pug");
  mountMiddlewares(app, env);
  mountRoutes(app, config);

  return app;
}

module.exports = createExpressApp;
