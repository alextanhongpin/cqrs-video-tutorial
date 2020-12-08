const identityProjection = {
  $init() {
    return {
      id: null,
      email: null,
      isRegistered: false
    };
  },
  Registered(identity, registered) {
    identity.id = registered.data.userId;
    identity.email = registered.data.email;
    identity.isRegistered = true;

    return identity;
  }
};

async function loadIdentity(context) {
  const { identityId, messageStore } = context;
  const identityStreamName = `identity-${identityId}`;

  const identity = await messageStore.fetch(
    identityStreamName,
    identityProjection
  );
  context.identity = identity;
  return context;
}

module.exports = loadIdentity;
