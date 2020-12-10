/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
exports.up = function up (knex) {
  return knex.schema.createTable('admin_users', table => {
    table.string('id').primary()
    table.string('email')
    table.integer('last_identity_event_global_position').defaultTo(0)
    table.integer('login_count').defaultTo(0)
    table.integer('last_authentication_event_global_position').defaultTo(0)
    table.boolean('registration_email_sent').defaultTo(false)

    table.index('email')
  })
}

exports.down = knex => knex.schema.dropTable('admin_users')
