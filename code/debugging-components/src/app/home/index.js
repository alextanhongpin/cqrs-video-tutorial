/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const camelCaseKeys = require('camelcase-keys')
const express = require('express')

function createHandlers ({ queries }) {
  function home (req, res, next) {
    return queries
      .loadHomePage()
      .then(homePageData =>
        res.render('home/templates/home', homePageData.pageData)
      )
      .catch(next)
  }

  return {
    home
  }
}

function createQueries ({ db }) {
  function loadHomePage () {
    return db.then(client =>
      client('pages')
        .where({ page_name: 'home' })
        .limit(1)
        .then(camelCaseKeys)
        .then(rows => rows[0])
    )
  }

  return {
    loadHomePage
  }
}

function createHome ({ db }) {
  const queries = createQueries({ db })
  const handlers = createHandlers({ queries })

  const router = express.Router()

  router.route('/').get(handlers.home)

  return { handlers, queries, router }
}

module.exports = createHome
