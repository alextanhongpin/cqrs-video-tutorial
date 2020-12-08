const nodemailer = require("nodemailer");

const SendError = require("./send-error");

function createSend({ transport }) {
  const sender = nodemailer.createTransport(transport);
  return async function send(email) {
    try {
      const result = await sender.sendMail(email);
      return result;
    } catch (error) {
      throw new SendError(error.message);
    }
  };
}
