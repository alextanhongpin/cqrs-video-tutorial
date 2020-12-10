/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
/*
The system makes heavy use of dependency injection.  This file wires up all the
dependencies, making use of the environment.
*/

// Primitives
const createKnexClient = require('./knex-client')
const createHomeApp = require('./app/home')

// ...

const createRecordViewingsApp = require('./app/record-viewings')

const createPostgresClient = require('./postgres-client') 
const createMessageStore = require('./message-store') 
const createHomePageAggregator = require('./aggregators/home-page')
const createRegisterUsersApp = require('./app/register-users')
const createIdentityComponent = require('./components/identity') 
const createUserCredentialsAggregator = 
  require('./aggregators/user-credentials')
const createAuthenticateApp = require('./app/authenticate') 
const createPickupTransport = require('nodemailer-pickup-transport') 
const createSendEmailComponent = require('./components/send-email') 
const createCreatorsPortalApp = require('./app/creators-portal')
const createVideoPublishingComponent = require('./components/video-publishing')
const createCreatorsVideosAggregator = require('./aggregators/creators-videos')
const createVideoOperationsAggregator = // (1)
  require('./aggregators/video-operations')
const createAdminUsersAggregator = require('./aggregators/admin-users')
const createAdminApp = require('./app/admin')
const createAdminStreamAggregator = require('./aggregators/admin-streams')
const createAdminSubscriberPositionsAggregator =
  require('./aggregators/admin-subscriber-positions')

function createConfig ({ env }) {
  const knexClient = createKnexClient({
    connectionString: env.databaseUrl
  })
  const postgresClient = createPostgresClient({ 
    connectionString: env.messageStoreConnectionString
  })
  const messageStore = createMessageStore({ db: postgresClient }) 

  const homeApp = createHomeApp({ db: knexClient })
  const recordViewingsApp = createRecordViewingsApp({ messageStore }) 

  // ...
  const homePageAggregator = createHomePageAggregator({
    db: knexClient,
    messageStore
  })

  const registerUsersApp = createRegisterUsersApp({
    db: knexClient,
    messageStore
  })

  const identityComponent = createIdentityComponent({ messageStore }) 

  const userCredentialsAggregator = createUserCredentialsAggregator({ 
    db: knexClient,
    messageStore
  })
  const authenticateApp = createAuthenticateApp({ 
    db: knexClient,
    messageStore
  })
  const transport = createPickupTransport({ directory: env.emailDirectory }) 
  const sendEmailComponent = createSendEmailComponent({ 
    messageStore,
    systemSenderEmailAddress: env.systemSenderEmailAddress,
    transport
  })
  const creatorsPortalApp = createCreatorsPortalApp({
    db: knexClient,
    messageStore
  })
  const videoPublishingComponent = createVideoPublishingComponent({ messageStore })
  const creatorsVideosAggregator = createCreatorsVideosAggregator({
    db: knexClient,
    messageStore
  })
  const videoOperationsAggregator = createVideoOperationsAggregator({ // (2)
    db: knexClient,
    messageStore
  })
  const adminUsersAggregator = createAdminUsersAggregator({
    db: knexClient,
    messageStore
  })
  const adminApp = createAdminApp({
    db: knexClient,
    messageStoreDb: postgresClient
  })
  const adminStreamsAggregator = createAdminStreamAggregator({
    db: knexClient,
    messageStore
  })
  const adminSubscriberPositionsAggregator =
    createAdminSubscriberPositionsAggregator({ db: knexClient, messageStore })

  const aggregators = [
    homePageAggregator,
    // ...
    userCredentialsAggregator, 
    creatorsVideosAggregator,
    videoOperationsAggregator, // (3)
    adminUsersAggregator,
    adminStreamsAggregator,
    adminSubscriberPositionsAggregator
  ]

  const components = [
    // ...
    identityComponent, 
    sendEmailComponent, 
    videoPublishingComponent
  ]

  return {
    // ...
    env,
    db: knexClient,
    homeApp,
    recordViewingsApp,
    // ...
    messageStore, 
    homePageAggregator,
    aggregators,
    components,
    registerUsersApp,
    identityComponent, 
    userCredentialsAggregator, 
    authenticateApp, 
    sendEmailComponent, 
    creatorsPortalApp,
    videoPublishingComponent,
    creatorsVideosAggregator,
    videoOperationsAggregator, // (4)
    adminUsersAggregator,
    adminApp,
    adminStreamsAggregator,
    adminSubscriberPositionsAggregator
  }
}

module.exports = createConfig
