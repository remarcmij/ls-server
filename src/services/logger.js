const winston = require('winston');

winston.level = process.env.LOG_LEVEL || 'info';

module.exports = {
  info: (...args) => winston.info(...args),
  log: (...args) => winston.log(...args),
  debug: (...args) => winston.debug(...args),
};
