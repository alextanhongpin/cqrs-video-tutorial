/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const express = require('express')
const { join } = require('path')

const attachLocals = require('./attach-locals') 
const lastResortErrorHandler = require('./last-resort-error-handler')
const primeRequestContext = require('./prime-request-context')

/**
 * @description Mounts all the application-level middleware on our Express
 * application
 * @param {obect} app Express application
 */
function mountMiddleware (app, env) { 
  app.use(lastResortErrorHandler) 
  app.use(primeRequestContext)
  app.use(attachLocals)
  app.use(
    express.static(join(__dirname, '..', 'public'), { maxAge: 86400000 }))
}

module.exports = mountMiddleware
