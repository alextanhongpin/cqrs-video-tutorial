/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
exports.up = function up (knex) {
  return knex.schema.createTable('video_operations', table => {
    table.string('trace_id').primary()
    table.string('video_id').notNullable()
    table.bool('succeeded').notNullable()
    table.string('failure_reason')
  })
}

exports.down = knex => knex.schema.dropTable('video_operations')
