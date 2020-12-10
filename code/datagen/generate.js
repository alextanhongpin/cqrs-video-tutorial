/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const bcrypt = require('bcrypt')
const faker = require('faker')
const fs = require('fs')
const uuid = require('uuid/v4')

function times (count) {
  return Array(count).fill()
}

const saltRounds = 10

const events = times(15).map((_, index) => {
  const userId = uuid()
  const name = faker.name
    .firstName()
    .toLowerCase()
    .split(' ')
    .join('.')
  const email = `${name}.${index}@example.com`
  const password = `password${index}`
  const passwordHash = bcrypt.hashSync(password, saltRounds)

  return {
    streamName: `identity:command-${userId}`,
    event: {
      id: uuid(),
      type: 'Register',
      metadata: {
        traceId: uuid(),
        userId,
      },
      data: { email, userId, passwordHash }
    }
  }
})

fs.writeFileSync('./commands.json', JSON.stringify(events, null, 2))
