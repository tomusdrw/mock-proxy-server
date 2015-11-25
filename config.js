process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var config = {
  baseUrl: 'https://blockchain.info',
  port: process.env.PORT || 3000,
  isRecordingMocks: !!process.env.RECORD_MOCKS,
  useAutomocks: !!process.env.AUTO_MOCKS
};

module.exports = config;
