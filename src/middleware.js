const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const express = require('express');
const favicon = require('serve-favicon');
const morgan = require('morgan');
// const passport = require('passport');
const path = require('path');

const ONE_DAY_IN_SECS = 60 * 60 * 24;

function production(app) {
  const docRoot = path.join(__dirname, 'public');
  app.use(favicon(path.join(docRoot, 'favicon.ico')));
  app.use(express.static(docRoot, {
    maxAge: 0,
    setHeaders: (res, bundlePath) => {
      if (/\/[^/]+\.bundle\./.test(bundlePath) || /(?:otf|eot|svg|ttf|woff|woff2)$/.test(bundlePath)) {
        res.setHeader('Cache-Control', `public, max-age=${ONE_DAY_IN_SECS * 30}`);
      }
    },
  }));
  app.use('/assets', express.static(path.join(docRoot, 'assets'), { maxAge: '30d' }));
  app.use(express.static(docRoot));
  app.set('appPath', docRoot);
  app.use(morgan('combined'));
}

function development(app) {
  const docRoot = path.join(__dirname, '../public');
  app.use(favicon(path.join(docRoot, 'favicon.ico')));
  app.use(express.static(docRoot, {
    maxAge: 0,
    setHeaders: (res, bundlePath) => {
      if (/\/[^/]+\.bundle\./.test(bundlePath) || /(?:otf|eot|svg|ttf|woff|woff2)$/.test(bundlePath)) {
        res.setHeader('Cache-Control', 'public, max-age=1');
      }
    },
  }));
  app.use('/assets', express.static(path.join(docRoot, 'assets'), { maxAge: 1 }));
  app.use(express.static(docRoot));
  app.set('appPath', docRoot);
  app.use(morgan('dev'));
  app.use(errorHandler());
}

module.exports = function middleware(app) {
  app.use(cors());
  app.use(compression());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cookieParser());

  if (process.env.NODE_ENV === 'production') {
    production(app);
  } else {
    development(app);
  }
};
