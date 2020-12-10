/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const dotenv = require('dotenv')

const envFromRealEnvironment = process.env.NODE_ENV || 'development'
const path = `.env.${envFromRealEnvironment}`

dotenv.config({ path, silent: envFromRealEnvironment === 'production' })

module.exports = process.env.DATABASE_URL
