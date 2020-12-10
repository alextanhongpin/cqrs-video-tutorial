async function sendEmail(context) {
  const justSendIt = context.justSendIt;
  const sendCommand = context.sendCommand;
  const systemSenderEmailAddress = context.systemSenderEmailAddress;

  const email = {
    from: systemSenderEmailAddress,
    to: sendCommand.data.to,
    subject: sendCommand.data.subject,
    text: sendCommand.data.text,
    html: sendCommand.data.html
  };

  await justSendIt(email);
  return context;
}

module.exports = sendEmail;
