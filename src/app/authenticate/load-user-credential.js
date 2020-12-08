async function loadUserCredential(context) {
  const userCredential = await context.queries.byEmail(context.email);
  context.userCredential = userCredential;
  return context;
}

module.exports = loadUserCredential;
