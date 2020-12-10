/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const test = require('blue-tape')
const uuid = require('uuid/v4')

const { config, createMessageStoreWithWriteSink, reset } =
  require('../../test-helper')
const createIdentityComponent = require('./')

test('Processes a valid user registration', t => {
  const userId = uuid()
  const register = {
    id: uuid(),
    type: 'Register',
    metadata: {
      traceId: uuid(),
      userId
    },
    data: {
      userId,
      email: 'test@example.com',
      passwordHash: 'notahash'
    }
  }
  register.streamName = `identity:command-${userId}`

  const expectedStreamName = `identity-${userId}`

  return reset()
    .then(() =>
      config.identityComponent.identityCommandHandlers.Register(register)
    )
    .then(() =>
      // Handle it again to check idempotence
      config.identityComponent.identityCommandHandlers.Register(register)
    )
    .then(() =>
      config.messageStore.read(expectedStreamName).then(retrievedMessages => {
        t.equal(retrievedMessages.length, 1, '1 message retrieved')
        t.equal(
          retrievedMessages[0].type,
          'Registered',
          'It was a `Registered` event'
        )
        t.equal(
          retrievedMessages[0].metadata.traceId,
          register.metadata.traceId,
          'It has the same `traceId` as the command'
        )
        t.equal(
          retrievedMessages[0].data.userId,
          register.data.userId,
          'It has the same `userId` as the command'
        )
        t.equal(
          retrievedMessages[0].data.email,
          register.data.email,
          'It has the same `email` as the command'
        )
        t.equal(
          retrievedMessages[0].data.passwordHash,
          register.data.passwordHash,
          'It has the same `passwordHash` as the command'
        )
      })
    )
})

test('It writes the command to send the registration email', t => {
  const userId = uuid()
  const registered = {
    id: uuid(),
    type: 'Registered',
    metadata: {
      traceId: uuid(),
      userId
    },
    data: {
      userId,
      email: 'user@example.com',
      passwordHash: 'notahash'
    }
  }

  // We need to see what was written in this test, and we don't know what
  // identifier the Registered handler will use for the email.
  const writes = []
  const messageStoreWithWriteSink = createMessageStoreWithWriteSink(writes)
  const identityComponent = createIdentityComponent({
    messageStore: messageStoreWithWriteSink
  })

  return config.messageStore.write(`identity-${userId}`, registered)
    .then(() => identityComponent.identityEventHandlers.Registered(registered))
    .then(() => identityComponent.identityEventHandlers.Registered(registered))
    .then(() => {
      t.equals(writes.length, 2, '2 messages written')

      const sendEmailCommand = writes[0].message

      t.equals(sendEmailCommand.type, 'Send', 'It is a send')
      t.equals(sendEmailCommand.data.to, registered.data.email)
      t.equals(
        sendEmailCommand.data.subject,
        'Welcome to the site!',
        'Correct subject'
      )
      t.equals(
        sendEmailCommand.data.text,
        'WELCOME TO THE SITE!',
        'Correct text'
      )
      t.equals(
        sendEmailCommand.data.html,
        '<h1>Welcome to the site!</h1>',
        'Correct html'
      )
      t.equals(writes[0].stream, writes[1].stream, 'Same stream')
    })
})

test('Processes a Sent event when it originated it', t => {
  const userId = uuid()
  const sent = {
    id: uuid(),
    type: 'Sent',
    metadata: {
      originStreamName: `identity-${userId}`,
      traceId: uuid(),
      userId
    },
    data: {
      emailId: uuid(),
      to: 'to',
      from: 'from',
      subject: 'subject',
      text: 'text',
      html: 'html'
    }
  }

  return config.identityComponent.sendEmailEventHandlers.Sent(sent)
    .then(() => config.identityComponent.sendEmailEventHandlers.Sent(sent))
    .then(() => config.messageStore.read(`identity-${userId}`)
      .then(retrievedMessages => {
        t.equals(retrievedMessages.length, 1, '1 message written')

        t.equals(
          retrievedMessages[0].type,
          'RegistrationEmailSent',
          'Correct type'
        )
        t.equals(
          retrievedMessages[0].data.emailId,
          sent.data.emailId,
          'Correct emailId'
        )
        t.equals(
          retrievedMessages[0].data.userId,
          userId,
          'Correct userId'
        )
      })
    )
})

test('Does not process a Sent event when it did not originated it', t => {
  const userId = uuid()
  const emailId = uuid()
  const sent = {
    id: uuid(),
    type: 'Sent',
    metadata: {
      originStreamName: `notIdentity-${userId}`,
      traceId: uuid(),
      userId
    },
    data: {
      emailId,
      to: 'to',
      from: 'from',
      subject: 'subject',
      text: 'text',
      html: 'html'
    }
  }
  const streamName = `sendEmail-${emailId}`

  const subscription = config.messageStore.createSubscription({
    streamName: 'sendEmail',
    handlers: config.identityComponent.sendEmailEventHandlers,
    originStreamName: 'identity',
    subscriberId: 'components:identity:sendEmailEvents'
  })

  return config.messageStore.write(streamName, sent)
    .then(subscription.tick())
    .then(() => config.messageStore.read(`identity-${userId}`)
      .then(retrievedMessages => {
        t.equals(retrievedMessages.length, 0, '0 messages written')
      }))
})

test('It does not send the email command if email already sent', t => {
  const userId = uuid()
  const registered = {
    id: uuid(),
    type: 'Registered',
    metadata: {
      traceId: uuid(),
      userId
    },
    data: {
      userId,
      email: 'test@example.com',
      passwordHash: 'notahash'
    }
  }
  const registrationEmailSent = {
    id: uuid(),
    type: 'RegistrationEmailSent',
    metadata: {
      traceId: uuid(),
      userId
    },
    data: {
      emailId: uuid(),
      userId
    }
  }

  // We need to see what was written in this test, and we don't know what
  // identifier the Registered handler will use for the email.
  const writes = []
  const messageStoreWithWriteSink = createMessageStoreWithWriteSink(writes)
  const identityComponent = createIdentityComponent({
    messageStore: messageStoreWithWriteSink
  })

  // First, write the identity events to the actual store
  return config.messageStore.write(`identity-${userId}`, registered)
    .then(() =>
      config.messageStore.write(`identity-${userId}`, registrationEmailSent)
    )
    // Then use the identityComponent with the write sink
    .then(() => identityComponent.identityEventHandlers.Registered(registered))
    .then(() => {
      t.equals(writes.length, 0, 'No writes')
    })
})
