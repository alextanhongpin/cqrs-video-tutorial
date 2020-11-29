const VersionConflictError = require("./version-conflict-error");
const versionConflictErrorRegex = /^Wrong.*Stream Version: (\d+)\)/;

function createWrite({ db }) {
  return async (streamName, message, expectedVersion) => {
    if (!message.type) {
      throw new Error("Messages must have a type");
    }

    try {
      const result = await db`
      SELECT message_store.write_message(
        ${message.id},
        ${streamName},
        ${message.type},
        ${db.json(message.data)},
        ${db.json(message.metadata)},
        ${expectedVersion}
      )
    `;
      return result;
    } catch (err) {
      const errorMatch = err.message.match(versionConflictErrorRegex);
      const notVersionConflict = errorMatch === null;
      if (notVersionConflict) {
        throw err;
      }
      const actualVersion = parseInt(errorMatch[1], 10);
      const versionConflictError = new VersionConflictError(
        streamName,
        actualVersion,
        expectedVersion
      );
      versionConflictError.stack = err.stack;
      throw versionConflictError;
    }
  };
}

module.exports = createWrite;
