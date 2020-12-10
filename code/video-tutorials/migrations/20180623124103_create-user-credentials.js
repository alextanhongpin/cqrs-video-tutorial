/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
exports.up = function up (knex) {
  return knex.schema.createTable('user_credentials', table => {
    table.string('id').primary()
    table.string('email').notNullable()
    table.string('password_hash').notNullable()

    table.index('email')
  })
}

exports.down = knex => knex.schema.dropTable('user_credentials')
