async function loadExistingIdentity(context) {
  const existingIdentity = await context.queries.byEmail(
    context.attributes.email
  );
  context.existingIdentity = existingIdentity;
  return context;
}

module.exports = loadExistingIdentity;
