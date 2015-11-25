var fs = require('fs');
var path = require('path');
var Q = require('q');

var config = require('../config');

var AUTOMOCKS_DIR = path.join(__dirname, 'automocks');

module.exports = function(nock) {
  
  if (config.isRecordingMocks || !config.useAutomocks) {
    console.warn('Ignoring automocks.');
    return;
  }
  
  function mockUsingAutomock (mock) {
    if (mock.method !== 'GET') {
      console.error('Only GET methods are supported. Igoring', mock.method, mock.url);
      return;
    }
    console.log('Mocking', mock.url, 'from automocks');
    nock.get(mock.url).reply(200, mock.response);
  }
  
  return Q.ninvoke(fs, 'readdir', AUTOMOCKS_DIR).done(function (files) {
    files
      .map(function (file) {
        return require(path.join(AUTOMOCKS_DIR, file));
      })
      .map(mockUsingAutomock);
  });
  
};