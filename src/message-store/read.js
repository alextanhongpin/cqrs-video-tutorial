const deserializeMessage = require("./deserialize-message");

function createRead({ db }) {
  async function readLastMessage(streamName) {
    const [row] = await db`
      SELECT * 
      FROM message_store.get_last_stream_message(${streamName}::varchar)
    `;
    return deserializeMessage(row);
  }

  async function read(streamName, fromPosition = 0, maxMessages = 1000) {
    if (streamName.includes("-")) {
      const rows = await db`
        SELECT *
        FROM message_store.get_stream_messages(${streamName}::varchar, ${fromPosition}::bigint, ${maxMessages}::bigint)
      `;
      return rows.map(deserializeMessage);
    }
    const rows = await db`
      SELECT *
      FROM message_store.get_category_messages(${streamName}::varchar, ${fromPosition}::bigint, ${maxMessages}::bigint)
    `;
    return rows.map(deserializeMessage);
  }

  function project(events, projection) {
    return events.reduce((entity, event) => {
      if (!projection[event.type]) {
        return entity;
      }

      return projection[event.type](entity, event);
    }, projection.$init());
  }

  async function fetch(streamName, projection) {
    const messages = await read(streamName);
    const output = project(messages, projection);
    return output;
  }

  return {
    read,
    readLastMessage,
    fetch
  };
}

module.exports = createRead;
