const emailProjection = {
  $init() {
    return { isSent: false };
  },
  Sent(email, sent) {
    email.isSent = true;
    return email;
  }
};

function loadEmail(context) {
  const { messageStore, sendCommand } = context;
  const streamName = `sendEmail-${sendCommand.data.emailId}`;
  return messageStore.fetch(streamName, emailProjection).then(email => {
    context.email = email;
    return context;
  });
}

module.exports = loadEmail;
