/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
/*
The application layer of the system uses [express](https://expressjs.com/) to
handle routing HTTP requests.  This file sets up the express application.
*/
const express = require('express')
const { join } = require('path')

const mountMiddleware = require('./mount-middleware')
const mountRoutes = require('./mount-routes')

function createExpressApp ({ config, env }) { // (1)
  const app = express() // (2)

  // Configure PUG
  app.set('views', join(__dirname, '..')) // (3)
  app.set('view engine', 'pug')

  mountMiddleware(app, env) // (4)
  mountRoutes(app, config) // (5)

  return app
}

module.exports = createExpressApp
