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

const { config, countEmailFiles, reset } = require('../../test-helper')
const createEmailService = require('./')
const SendError = require('./send-error')

test('Send command', t => {
  const userId = uuid()
  const emailId = uuid()
  const send = {
    id: uuid(),
    type: 'Send',
    metadata: {
      originStreamName: `identity-${userId}`,
      traceId: uuid(),
      userId
    },
    data: {
      emailId,
      to: 'test@example.com',
      from: 'no-reply@example.com',
      subject: 'Secrets of the universe',
      text: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      html: '<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">here</a>'
    }
  }
  send.streamName = `sendEmail:command-${emailId}`

  return reset()
    .then(() =>
      config.sendEmailComponent.handlers.Send(send)
    )
    // Once more for idempotence
    .then(() =>
      config.sendEmailComponent.handlers.Send(send)
    )
    .then(() =>
      config.messageStore.read(`sendEmail-${emailId}`)
        .then(writtenMessages => {
          t.equal(writtenMessages.length, 1, 'Only 1 message written')
          t.equal(
            writtenMessages[0].type,
            'Sent',
            'It is a Sent event'
          )
          t.equal(
            writtenMessages[0].metadata.traceId,
            send.metadata.traceId,
            'It chained the traceId'
          )
          t.equal(
            writtenMessages[0].metadata.originStreamName,
            send.metadata.originStreamName,
            'It chained the originStreamName'
          )
          t.equal(
            writtenMessages[0].streamName,
            `sendEmail-${emailId}`,
            'Written to the email\'s entity stream'
          )
          t.equal(
            writtenMessages[0].data.emailId,
            emailId,
            'It has the emailId'
          )
          t.equal(
            writtenMessages[0].data.to,
            send.data.to,
            'It copied the receiving address'
          )
          t.equal(
            writtenMessages[0].data.from,
            send.data.from,
            'It copied the sending address'
          )
          t.equal(
            writtenMessages[0].data.subject,
            send.data.subject,
            'It copied the subject'
          )
          t.equal(
            writtenMessages[0].data.text,
            send.data.text,
            'It copied the text body'
          )
          t.equal(
            writtenMessages[0].data.html,
            send.data.html,
            'It copied the html body'
          )
        })
    )
    .then(() => {
      const emailCount = countEmailFiles()

      t.equal(emailCount, 1, 'It sent 1 email')
    })
})

test('Captures non-domain errors when sending emails', t => {
  // Sometimes we may get an error because the physical act of sending the email
  // didn't work at the network layer or something.  We want to capture these
  // too.

  const failureMessage = 'I will always fail'
  const emailId = uuid()
  const traceId = uuid()
  const userId = uuid()
  const send = {
    id: uuid(),
    type: 'Send',
    metadata: {
      originStreamName: `identity-${userId}`,
      traceId,
      userId
    },
    data: {
      emailId,
      to: 'test@example.com',
      from: 'no-reply@example.com',
      subject: 'Secrets of the universe',
      text: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      html: '<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">here</a>'
    }
  }
  send.streamName = `sendEmail:command-${emailId}`

  const failureTransport = {
    send () {
      throw new SendError(failureMessage)
    }
  }

  const service = createEmailService({
    messageStore: config.messageStore,
    systemSenderEmailAddress: 'fail@example.com',
    transport: failureTransport
  })

  return reset()
    .then(() => service.handlers.Send(send))
    .then(() =>
      config.messageStore.read(`sendEmail-${emailId}`)
        .then(writtenMessages => {
          t.equal(writtenMessages.length, 1, '1 message written')
          t.equal(
            writtenMessages[0].type,
            'Failed',
            'Failure event'
          )
          t.equal(
            writtenMessages[0].data.reason,
            failureMessage,
            'Captured the reason'
          )
          t.equal(
            writtenMessages[0].data.emailId,
            emailId,
            'It has the emailId'
          )
          t.equal(
            writtenMessages[0].data.to,
            send.data.to,
            'It copied the receiving address'
          )
          t.equal(
            writtenMessages[0].data.from,
            send.data.from,
            'It copied the sending address'
          )
          t.equal(
            writtenMessages[0].data.subject,
            send.data.subject,
            'It copied the subject'
          )
          t.equal(
            writtenMessages[0].data.text,
            send.data.text,
            'It copied the text body'
          )
          t.equal(
            writtenMessages[0].data.html,
            send.data.html,
            'It copied the html body'
          )
        })
    )
    .then(() => {
      const emailCount = countEmailFiles()

      t.equal(emailCount, 0, 'No emails sent')
    })
})
