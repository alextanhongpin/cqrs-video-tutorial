/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
// eslint-disable-next-line import/no-extraneous-dependencies
const Bluebird = require('bluebird')
const test = require('blue-tape')
const { readdirSync, unlinkSync } = require('fs')
// eslint-disable-next-line import/no-extraneous-dependencies
const keygrip = require('keygrip')
const { join } = require('path')

const { app, config } = require('./')

const pathToEmailFiles = join(__dirname, '..', 'tmp', 'email')

test.onFinish(() => {
  config.db
    .then(client => client.destroy())

  config.messageStore.stop()
})

/* eslint-disable no-console */
process.on('unhandledRejection', err => {
  console.error('Uh-oh. Unhandled Rejection')
  console.error(err)

  process.exit(1)
})
/* eslint-enable no-console */

function countEmailFiles () {
  const files = readdirSync(pathToEmailFiles)

  return files.filter(f => f !== '.gitkeep').length
}

function deleteEmailFiles () {
  const files = readdirSync(pathToEmailFiles)

  files
    .filter(f => f !== '.gitkeep')
    .forEach(f => unlinkSync(join(pathToEmailFiles, f)))
}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-z]{4}-[1-5][0-9a-z]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function isUuid (str) {
  return str.match(uuidRegex)
}

function reset () {
  deleteEmailFiles()

  const tablesToWipe = [
    'pages',
    'user_credentials',
    'creators_portal_videos',
    'video_operations',
    'admin_subscriber_positions',
    'admin_streams',
    'admin_users'
  ]

  return Bluebird.each(tablesToWipe, table =>
    config.db.then(client => client(table).del())
  )
}

function getSessionCookie (userId) {
  // See https://medium.com/the-node-js-collection/how-to-mock-an-express-session-fe62baf5a611
  const cookie = Buffer.from(JSON.stringify({ userId })).toString('base64')
  const kg = keygrip([config.env.cookieSecret])
  const hash = kg.sign(`session=${cookie}`)

  return `session=${cookie}; session.sig=${hash};`
}

function createMessageStoreWithWriteSink (sink) {
  const writeSink = (stream, message, expectedVersion) => {
    sink.push({ stream, message, expectedVersion })

    return Promise.resolve(true)
  }

  return { ...config.messageStore, write: writeSink }
}

module.exports = {
  app,
  config,
  countEmailFiles,
  createMessageStoreWithWriteSink,
  deleteEmailFiles,
  isUuid,
  getSessionCookie,
  reset
}
