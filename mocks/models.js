module.exports = function (nock) {
  nock.get('/api/v2/models').reply(200, ['1']);
};
