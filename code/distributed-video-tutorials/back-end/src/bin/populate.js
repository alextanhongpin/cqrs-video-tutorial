/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
/*
This script is used in the Debugging Services chapter to populate the message
store with some known test data.  If you come across this sooner and are
wondering what the heck this is about, well, that's what the heck this is
about.
*/

const Bluebird = require('bluebird')

const events = require('../../example-messages/commands.json')
const createConfig = require('../config')
const env = require('../env')

const config = createConfig({ env })

Bluebird.each(events, event =>
  config.messageStore.write(event.streamName, event.event)
)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Populated with test data.  The game is afoot!')
  })
  .finally(() => config.db
    .then(client => client.destroy())
    .then(config.messageStore.stop)
  )
