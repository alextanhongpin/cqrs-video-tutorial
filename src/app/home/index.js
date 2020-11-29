const camelCaseKeys = require("camelcase-keys");
const express = require("express");

// Controllers.
function createHandlers({ queries }) {
  async function home(req, res, next) {
    try {
      const viewData = await queries.loadHomePage();
      return res.render("app/home/templates/home", viewData);
    } catch (error) {
      next(error);
    }
  }

  return {
    home
  };
}

// Services.
function createQueries({ db }) {
  async function loadHomePage() {
    const [row] = await db`
      SELECT *
      FROM page
      WHERE page_name = 'home'
    `;
    return camelCaseKeys(row);
  }
  return { loadHomePage };
}

// Routes.
function createHome({ db }) {
  const queries = createQueries({ db });
  const handlers = createHandlers({ queries });

  const router = express.Router();
  router.route("/").get(handlers.home);

  return { handlers, queries, router };
}

module.exports = createHome;
