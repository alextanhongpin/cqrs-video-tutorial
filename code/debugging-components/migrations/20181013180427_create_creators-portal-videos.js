/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
exports.up = function up (knex) {
  return knex.schema.createTable('creators_portal_videos', table => {
    table.string('id').primary()
    table.string('owner_id').notNullable()
    table.string('name')
    table.string('description')
    table.integer('views').defaultsTo(0)
    table.string('source_uri')
    table.string('transcoded_uri')
    table.integer('position').notNullable()
  })
}

exports.down = knex =>
  knex.schema.dropTable('creators_portal_videos')
