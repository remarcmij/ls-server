const log = require('../services/logger');
const db = require('./db');

function searchWord(word, lang, attr, chunk, chunkSize) {
  log.debug(`Searching word: ${word}`);

  const values = [word];
  let sql = 'SELECT * FROM DictView WHERE word=?';

  if (lang) {
    sql += ' AND lang=?';
    values.push(lang);
  }

  if (attr) {
    sql += ' AND attr=?';
    values.push(attr);
  }

  sql += ` LIMIT ${chunk * chunkSize}, ${chunkSize}`;

  return db.query(sql, values);
}

function makeStopTerm(term) {
  const lastCharCode = term.charCodeAt(term.length - 1);
  return term.slice(0, -1) + String.fromCharCode(lastCharCode + 1);
}

function searchCompletions(term, lang) {
  const values = [term, makeStopTerm(term)];
  let sql = 'SELECT word, lang FROM AutoComplete WHERE word >= ? AND word < ?';

  if (lang) {
    sql += ' AND lang=?';
    values.push(lang);
  }

  return db.query(sql, values);
}


module.exports = {
  searchWord,
  searchCompletions,
};
