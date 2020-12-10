/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
/*
The system makes heavy use of dependency injection.  This file wires up all the
dependencies, making use of the environment.
*/

// Primitives
const createKnexClient = require('./knex-client') 
const createHomeApp = require('./app/home')

// ...

const createRecordViewingsApp = require('./app/record-viewings') 

function createConfig ({ env }) {

  // ...
  const db = createKnexClient({ 
    connectionString: env.databaseUrl
  })
  const homeApp = createHomeApp({ db }) 

  const recordViewingsApp = createRecordViewingsApp({ db }) 

  return {
    env,
    // ...
    db,
    homeApp, 
    recordViewingsApp 
  }
}

module.exports = createConfig
