function defined(key) {
  const value = process.env[key];
  if (value === null || value === undefined)
    throw new Error(`${key} is not defined`);
  return value;
}

module.exports = { defined };
