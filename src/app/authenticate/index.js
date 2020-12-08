const express = require("express");
const camelCaseKeys = require("camelcase-keys");
const loadUserCredential = require("./load-user-credential");
const ensureUserCredentialFound = require("./ensure-user-credential-found");
const validatePassword = require("./validate-password");
const writeLoggedInEvent = require("./write-logged-in-event");

function createQueries({ db }) {
  async function byEmail(email) {
    const [row] = await db`
      SELECT *
      FROM user_credential
      WHERE email = ${email}
    `;
    return camelCaseKeys(row);
  }

  return {
    byEmail
  };
}

function createActions({ messageStore, queries }) {
  async function authenticate(traceId, email, password) {
    const context = {
      traceId,
      email,
      messageStore,
      password,
      queries
    };

    try {
      const credential = await loadUserCredential(context);
      const validCredential = await ensureUserCredentialFound(credential);
      const validPassword = await validatePassword(validCredential);
      const event = await writeLoggedInEvent(validPassword);
      return event;
    } catch (error) {
      console.log({ error });
      if (error instanceof NotFoundError) {
        handleCredentialNotFound(context);
      } else if (error instanceof CredentialMismatchError) {
        handleCredentialMismatch(context);
      } else {
        throw error;
      }
    }
  }

  return {
    authenticate
  };
}
function createHandlers({ actions }) {
  function handleShowLoginForm(req, res) {
    res.render("app/authenticate/templates/login-form");
  }

  function handleLogOut(req, res) {
    req.session = null;
    res.redirect("/");
  }

  async function handleAuthenticate(req, res) {
    const {
      body: { email, password },
      context: { traceId }
    } = req;

    try {
      const context = await actions.authenticate(traceId, email, password);
      req.session.userId = context.userCredential.id;
      res.redirect("/");
    } catch (error) {
      res
        .status(401)
        .render("app/authenticate/templates/login-form", { errors: true });
    }
  }

  return {
    handleShowLoginForm,
    handleLogOut,
    handleAuthenticate
  };
}

function build({ db, messageStore }) {
  const queries = createQueries({ db });
  const actions = createActions({ messageStore, queries });
  const handlers = createHandlers({ actions });

  const router = express.Router();
  router
    .route("/log-in")
    .get(handlers.handleShowLoginForm)
    .post(express.urlencoded({ extended: false }), handlers.handleAuthenticate);

  router.route("/log-out").get(handlers.handleLogOut);

  return {
    actions,
    handlers,
    queries,
    router
  };
}

module.exports = build;
