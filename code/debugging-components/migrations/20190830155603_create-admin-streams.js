/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
exports.up = function up (knex) {
  return knex.schema.createTable('admin_streams', table => {
    table.string('stream_name').primary()
    table.integer('message_count').defaultsTo(0)
    table.string('last_message_id')
    table.integer('last_message_global_position').defaultsTo(0)
  })
}

exports.down = knex => knex.schema.dropTable('admin_streams')
