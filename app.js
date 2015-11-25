var connect = require('connect');
var http = require('http');
var request = require('request');
var nock = require('nock');
var serveStatic = require('serve-static');

var config = require('./config');
var mocks = require('./mocks');

mocks.getMocks().done(function(mocks) {
  
  mocks.map(function(mock) {
    var n = nock(config.baseUrl, {allowUnmocked: true}).persist();
    mock(n);
  });
  
});

function rethrowError(err) {
  throw err;
}

var app = connect();

app.use('/app', serveStatic('../public'));

app.use(function(req, res) {
  var sink = mocks.recordRequestAndGetSink(req, res);
  
  delete req.headers.host;

  if (req.method === 'POST') {
    req.pipe(
        request.post({
          url: config.baseUrl + req.url,
          headers: req.headers
        })
      )
      .on('error', rethrowError)
      .pipe(sink);
    return;
  }

  if (req.method === 'PUT') {
    req.pipe(
        request.put({
          url: config.baseUrl + req.url,
          headers: req.headers
        })
      )
      .on('error', rethrowError)
      .pipe(sink);
    return;
  }

  if (req.method === 'DELETE') {
    request.del({
        url: config.baseUrl + req.url,
        headers: req.headers
      })
      .on('error', rethrowError)
      .pipe(sink);
    return;
  }

  // default
  request.get({
      url: config.baseUrl + req.url,
      headers: req.headers
    })
    .on('error', rethrowError)
    .pipe(sink);
});

http.createServer(app).listen(config.port, function(){
  console.log('Server listening on :' + config.port);
});

