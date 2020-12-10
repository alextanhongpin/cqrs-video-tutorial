/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
const nodemailer = require('nodemailer')

const SendError = require('./send-error')

function createSend ({ transport }) { 
  const sender = nodemailer.createTransport(transport)

  /**
   * @description Sends an email
   * @param {object} email
   * @param {string} email.from The address the email is coming from
   * @param {string} email.to The address to send the email to
   * @param {string} email.subject The email's subject
   * @param {string} email.text The plaintext version of the email
   * @param {string} email.html The html version of the email
   * @throws {SendError} If there was an error, normalize it into a SendError
   */
  return function send (email) { 
    const potentialError = new SendError() 

    return sender.sendMail(email) 
      .catch(err => {
        potentialError.message = err.message
        throw potentialError
      })
  }
}

module.exports = createSend
