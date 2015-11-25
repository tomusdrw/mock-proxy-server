var fs = require('fs');
var Q = require('q');
var PassThrough = require('stream').PassThrough;
var concat = require('concat-stream');
var path = require('path');

var config = require('./config');

var MOCKS_PATH = path.join(__dirname, 'mocks') + path.sep;

module.exports = {
  getMocks: function () {
    return Q.ninvoke(fs, 'readdir', MOCKS_PATH).then(function (files) {
      return files
        .filter(function (file) {
          return fs.statSync(MOCKS_PATH + file).isFile();
        })
        .map(function (file) {
          return require(MOCKS_PATH + file);
        });
    });
  },

  recordRequestAndGetSink: function (req, res) {
    if (!config.isRecordingMocks) {
      return res;
    }

    if (req.url.indexOf('/api') !== 0) {
      return res;
    }

    var mock = {
      method: req.method,
      url: req.url,
      query: req.query
    };

    console.log('Recording request', mock.url);

    var stream = new PassThrough();
    var concatStream = concat(function (response) {
      try {
        mock.response = JSON.parse(response.toString('utf8'));
      } catch (e) {
        mock.response = undefined;
      }

      var fileName = [
        mock.method,
        mock.url.replace(/\//g, '_')
      ].join('_') + '.json';

      fs.writeFile(path.join(MOCKS_PATH, 'automocks', fileName), JSON.stringify(mock, null, 2), 'utf8', function (err) {
        if (err) {
          throw err;
        }
      });
    });

    // pipe data to concat
    stream.pipe(concatStream);
    // Pipe data to response too
    stream.pipe(res);

    return stream;
  }

};
