/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
/*
Normally we could just use the install.sh script in the Eventide
Message Store repo.  However, those scripts need to create a database and a
role.  Heroku doesn't allow us to do those functions, so we have this script.
It just executes the scripts that run after database and role creation.
*/
const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

function notInEnv (key) {
  return typeof process.env[key] === 'undefined'
}

const requiredEnvVars = [
  'PGHOST',
  'PGPORT',
  'PGUSER',
  'PGPASSWORD',
  'PGDATABASE'
]
const missingEnvVars = requiredEnvVars.filter(notInEnv)

if (missingEnvVars.length > 0) {
  console.log('The following required variables are missing from your env:\n')
  console.log(missingEnvVars.join('\n'))

  process.exit(1)
}

const eventideRootPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@eventide',
  'message-db',
  'database'
)

function sqlFilesInDirectory (directory) {
  const dir = path.join(eventideRootPath, directory)

  return fs.readdirSync(dir)
    .map(file => path.join(dir, file))
}

function install () {
  const sqlFiles = [
    ...sqlFilesInDirectory('schema'),
    ...sqlFilesInDirectory('extensions'),
    ...sqlFilesInDirectory('tables'),
    ...sqlFilesInDirectory('types'),
    ...sqlFilesInDirectory('functions'),
    ...sqlFilesInDirectory('indexes'),
    ...sqlFilesInDirectory('views')
  ]

  sqlFiles.forEach(file => {
    childProcess.execSync(`psql -f ${file}`)
  })
}

install()
