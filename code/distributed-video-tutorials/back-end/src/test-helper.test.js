/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
// Who'll test the testers?

const test = require('blue-tape')

const { isUuid } = require('./test-helper')

test('It recognizes a valid UUID', t => {
  t.ok(isUuid('4d8e1ff7-fa8b-4ab8-b40c-7ee8570c9b29'), 'Yup')

  t.end()
})

test('It catches an invalid UUID', t => {
  t.notOk(isUuid('not a uuid'), 'Nope')

  t.end()
})

test('It catches a string with invalid UUID version', t => {
  const onlyOffByVersion = '11111111-1111-0111-1111-111111111111'
  t.notOk(isUuid(onlyOffByVersion), 'Nope')

  t.end()
})
