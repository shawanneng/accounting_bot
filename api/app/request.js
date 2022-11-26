const axios = require('axios');
const _ = require('lodash');
const https = require('https');
const http = require('http');
const instance = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  withCredentials: true,
  timeout: 5000,
});

instance.interceptors.request.use(
  async (config) => {
    const rep = new RegExp(/^http(s)?:\/\/(.*?)\//);
    const [Referer] = rep.exec(config.url);
    config.headers.Referer = Referer;

    return config;
  },
  (error) => ({})
);

instance.interceptors.response.use(
  (response) => response,
  (error) => ({ body: error.body, code: error.code, message: error.message })
);

module.exports = instance;
