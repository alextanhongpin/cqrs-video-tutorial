/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const createExpressApp = require('./app/express') // (1)
const createConfig = require('./config')
const env = require('./env')

const config = createConfig({ env }) // (2)
const app = createExpressApp({ config, env })

function start () { // (3)
  app.listen(env.port, signalAppStart)
}

function signalAppStart () {
  console.log(`${env.appName} started`)
  console.table([['Port', env.port], ['Environment', env.env]])
}

module.exports = {
  app,
  config,
  start
}
