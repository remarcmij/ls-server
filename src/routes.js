const dictionary = require('./api/dictionary');

module.exports = function routes(app) {
  app.use('/api/dictionary', dictionary);
  app.route('/*')
    .get((req, res) => {
      res.sendFile('index.html', { root: app.get('appPath') });
    });
};
