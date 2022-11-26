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
// const headers = {
//   'content-type': 'application/json',
//   'accept-language': 'zh-CN,zh;q=0.9',
//   'sec-fetch-dest': 'empty',
//   'sec-fetch-mode': 'cors',
//   'sec-fetch-site': 'cross-site',
//   'Referrer-Policy': 'strict-origin-when-cross-origin',
//   'user-agent':
//     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
// };

// Object.entries(headers).forEach(([key, value]) => {
//   instance.defaults.headers[key] = value;
// });

instance.interceptors.request.use(
  async (config) => {
    const rep = new RegExp(/^http(s)?:\/\/(.*?)\//);
    const [Referer] = rep.exec(config.url);
    config.headers.Referer = Referer;

    // try {
    //   const { data } = await axios({
    //     url: 'https://cn.lwwangluo.store/cn',
    //   });
    //   console.log('data:', data);
    //   const proxy = _.pick(data, ['host', 'port']);
    //   if (!_.isEmpty(proxy)) {
    //     config.proxy = proxy;
    //   }
    // } catch (error) {}
    return config;
  },
  (error) => ({})
);

instance.interceptors.response.use(
  (response) => response,
  (error) => ({ body: error.body, code: error.code, message: error.message })
);

module.exports = instance;
