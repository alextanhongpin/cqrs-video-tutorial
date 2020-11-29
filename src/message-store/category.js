function category(streamName) {
  // Double equals to catch null and undefined
  if (streamName == null) {
    return "";
  }

  return streamName.split("-")[0];
}

module.exports = category;
