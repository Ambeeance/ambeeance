let expressPort = 8335;

try {
  if (process.env.AMBEEANCE_PORT) {
    expressPort = parseInt(process.env.AMBEEANCE_PORT);
  }
} catch (ignored) {
  expressPort = 8335; //BEES
}

module.exports = {
  expressPort,
};
