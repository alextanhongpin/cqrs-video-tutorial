const express = require("express");
const camelCaseKeys = require("camelcase-keys");
const loadExistingIdentity = require("./load-existing-entity");
const writeRegisterCommand = require("./write-register-command");
const hashPassword = require("./hash-password");
const ensureThereWasNoExistingIdentity = require("./ensure-there-was-no-existing-identity");
const validate = require("./validate");
const uuid = require("uuid");

function createQueries({ db }) {
  async function byEmail(email) {
    const [row] = await db`
        SELECT * 
        FROM user_credential
        WHERE email = ${email}
        LIMIT 1
      `;
    return camelCaseKeys(row);
  }

  return {
    byEmail
  };
}

function createActions({ messageStore, queries }) {
  async function registerUser(traceId, attributes) {
    const context = {
      attributes,
      traceId,
      messageStore,
      queries
    };

    validate(context);
    const identity = await loadExistingIdentity(context);
    await ensureThereWasNoExistingIdentity(identity);
    const hashed = await hashPassword(identity);
    const output = await writeRegisterCommand(hashed);
    return output;
  }

  return {
    registerUser
  };
}
function createHandlers({ actions }) {
  function handleRegistrationForm(req, res) {
    const userId = uuid.v4();

    res.render("app/register-users/templates/register", { userId });
  }

  function handleRegistrationComplete(req, res) {
    res.render("app/register-users/templates/registration-complete");
  }

  async function handleRegisterUser(req, res) {
    const attributes = {
      id: req.body.id,
      email: req.body.email,
      password: req.body.password
    };

    try {
      await actions.registerUser(req.context.traceId, attributes);
      return res.redirect(301, "/register/registration-complete");
    } catch (err) {
      return res.status(400).render("app/register-users/templates/register", {
        userId: attributes.id,
        errors: err.errors
      });
    }
  }

  return {
    handleRegistrationForm,
    handleRegistrationComplete,
    handleRegisterUser
  };
}

function build({ db, messageStore }) {
  const queries = createQueries({ db });
  const actions = createActions({ messageStore, queries });
  const handlers = createHandlers({ actions });
  const router = express.Router();

  router
    .route("/")
    .get(handlers.handleRegistrationForm)
    .post(express.urlencoded({ extended: false }), handlers.handleRegisterUser);

  router
    .route("/registration-complete")
    .get(handlers.handleRegistrationComplete);

  return {
    actions,
    router,
    handlers,
    queries
  };
}

module.exports = build;
