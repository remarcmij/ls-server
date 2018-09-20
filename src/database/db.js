const mysql = require('mysql');
const util = require('util');
const log = require('../services/logger');

const NS_PER_SEC = 1e9;
const NS_PER_MS = 1e6;

const {
  DB_HOST, DB_DATABASE, DB_USER, DB_PASSWORD, DB_PORT, DB_CONNECTION_LIMIT,
} = process.env;

const pool = mysql.createPool({
  connectionLimit: DB_CONNECTION_LIMIT,
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  port: DB_PORT,
  database: DB_DATABASE,
});


function query(sql, values = []) {
  if (process.env.LOG_LEVEL === 'silly') {
    log.log('silly', sql);
    log.log('silly', util.inspect(values));
  }

  const time = process.hrtime();
  return new Promise((resolve, reject) => {
    pool.getConnection((err1, con) => {
      if (err1) {
        reject(err1);
        return;
      }
      con.query(sql, values, (err2, rows) => {
        const diff = process.hrtime(time);
        const msElapsed = ((diff[0] * NS_PER_SEC) + diff[1]) / NS_PER_MS;
        log.debug(`Database query took ${msElapsed.toFixed(1)} ms`);
        con.release();
        if (err2) {
          reject(err2);
          return;
        }
        resolve(rows);
      });
    });
  });
}

module.exports = {
  query,
};
