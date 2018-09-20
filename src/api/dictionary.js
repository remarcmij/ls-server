const { Router } = require('express');
const _ = require('lodash');
const dict = require('../database/dictionary');

const CHUNK_SIZE = 50;
const COUNTRY_LANG_REGEX = /^[a-z]{2}(?:-[A-Z]{2})?$/;

const clientError = res => res.status(400).json({ message: 'Invalid query.' });

function searchWord(req, res) {
  const {
    term: words, lang, attr, chunk = 0,
  } = req.query;

  if (words == null) {
    clientError(res);
    return;
  }

  if (lang != null && !COUNTRY_LANG_REGEX.test(lang)) {
    clientError(res);
    return;
  }

  if (attr != null && attr !== 'k' && attr !== 'r') {
    clientError(res);
    return;
  }

  const promises = words.split(/\s*,\s*/).map(word => (lemmas) => {
    if (lemmas.length !== 0) {
      return Promise.resolve(lemmas);
    }
    return dict.searchWord(word, lang, attr, chunk, CHUNK_SIZE);
  });

  promises.reduce((prev, next) => prev.then(next), Promise.resolve([]))
    .then((rows) => {
      if (rows.length > 0) {
        const more = rows.length === CHUNK_SIZE;
        const lemmas = _.uniqBy(rows, lemma => lemma.text);
        res.json({ lemmas, more });
      } else {
        res.status(404).json({ message: 'Not found.' });
      }
    })
    .catch(error => res.status(500).json(error));
}

function searchCompletions(req, res) {
  const { term, lang } = req.query;

  if (term == null) {
    clientError(res);
    return;
  }

  if (lang != null && !COUNTRY_LANG_REGEX.test(lang)) {
    clientError(res);
    return;
  }

  dict.searchCompletions(term, lang)
    .then(completions => res.json({ completions }))
    .catch(error => res.status(500).json(error));
}

const router = Router();
router
  .get('/word', searchWord)
  .get('/completion', searchCompletions);

module.exports = router;
