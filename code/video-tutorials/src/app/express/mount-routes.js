/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const mustBeLoggedIn = require('./must-be-logged-in')

/**
 * @description Mounts application routes into the Express application
 * @param {object} app Express app on which to mount the routes
 * @param {object} config A config object will all the parts of the system
 */
function mountRoutes (app, config) {
  app.use('/', config.homeApp.router)
  app.use('/record-viewing', config.recordViewingsApp.router)
  app.use('/register', config.registerUsersApp.router)
  app.use('/auth', config.authenticateApp.router)
  app.use('/creators-portal', mustBeLoggedIn, config.creatorsPortalApp.router)
  app.route('/admin').get((req, res) => res.redirect('/admin/users'))
  app.use('/admin', config.adminApp.router)
}

module.exports = mountRoutes
