const { v4: uuid } = require("uuid");

const category = require("./category");

function configureCreateSubscription({ read, readLastMessage, write }) {
  return ({
    streamName,
    handlers,
    messagesPerTick = 100,
    subscriberId,
    positionUpdateInterval = 100,
    originStreamName = null,
    tickIntervalMs = 100
  }) => {
    const subscriberStreamName = `subscriberPosition-${subscriberId}`;
    let currentPosition = 0;
    let messagesSinceLastPositionWrite = 0;
    let keepGoing = true;

    function filterOnOriginMatch(messages) {
      if (!originStreamName) return messages;

      return messages.filter(message => {
        const originCategory =
          message.metadata && category(message.metadata.originStreamName);
        return originStreamName === originCategory;
      });
    }

    async function loadPosition() {
      const message = await readLastMessage(subscriberStreamName);
      currentPosition = message?.data?.position ?? 0;
    }

    function updateReadPosition(position) {
      currentPosition = position;
      messagesSinceLastPositionWrite += 1;
      if (messagesSinceLastPositionWrite == positionUpdateInterval) {
        messagesSinceLastPositionWrite = 0;
        return writePosition(position);
      }
      return Promise.resolve(true);
    }

    function writePosition(position) {
      const positionEvent = {
        id: uuid(),
        type: "Read",
        data: { position }
      };
      return write(subscriberStreamName, positionEvent);
    }

    function getNextBatchOfMessages() {
      return read(streamName, currentPosition + 1, messagesPerTick).then(
        filterOnOriginMatch
      );
    }

    async function processBatch(messages) {
      const promises = messages.map(async message => {
        try {
          await handleMessage(message);
          await updateReadPosition(message.globalPosition);
        } catch (error) {
          console.log("processBatchError", error);
          throw error;
        }
      });
      try {
        const result = await Promise.all(promises);
        return result.length;
      } catch (error) {
        console.log("processBatchError", error);
        throw error;
      }
    }

    function handleMessage(message) {
      const handler = handlers[message.type] || handlers.$any;
      return handler ? handler(message) : Promise.resolve(true);
    }

    function start() {
      console.log(`Started ${subscriberId}`);
      return pool();
    }

    function stop() {
      console.log(`Stopped ${subscriberId}`);
      keepGoing = false;
    }

    async function delay(duration = 1000) {
      return new Promise(resolve =>
        setTimeout(() => {
          resolve();
        }, duration)
      );
    }

    async function pool() {
      await loadPosition();

      while (keepGoing) {
        const messagesProcessed = await tick();
        if (messagesProcessed === 0) {
          await delay(tickIntervalMs);
        }
      }
    }

    async function tick() {
      try {
        const messages = await getNextBatchOfMessages();
        const messageProcessed = await processBatch(messages);
        return messageProcessed;
      } catch (error) {
        console.error("Error processing batch", error);
        stop();
      }
    }

    return {
      loadPosition,
      start,
      stop,
      tick,
      writePosition
    };
  };
}

module.exports = configureCreateSubscription;
