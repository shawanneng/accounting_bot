const axios = require('axios');

const instance = axios.create();
const headers = {
  'content-type': 'application/json',
  'accept-language': 'zh-CN,zh;q=0.9',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
};

Object.entries(headers).forEach(([key, value]) => {
  instance.defaults.headers[key] = value;
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
  (error) => ({})
);

module.exports = instance;
