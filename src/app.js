require('dotenv').config();
const { promisify } = require('util');
const express = require('express');
const http = require('http');
const middleware = require('./middleware');
const mkdirp = promisify(require('mkdirp'));
const path = require('path');
const routes = require('./routes');
const log = require('./services/logger');

const app = express();

async function start() {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  app.enable('trust proxy');

  middleware(app);
  routes(app);

  try {
    await mkdirp(path.join(__dirname, '../logs/'));
    const port = process.env.PORT || 8080;

    http.createServer(app)
      .listen(port, process.env.IP, () => {
        log.info(`Express server listening on ${port}, in ${process.env.NODE_ENV} mode`);
      });
  } catch (err) {
    log.error(err);
  }
}

start();

module.exports = {
  app,
};
