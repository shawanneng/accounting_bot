const handleSql = require('./db');
const _ = require('lodash');
const axios = require('axios');
let cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');
const options = {
  /** 创建一个用户数据 */
  async createUid(data) {
    let usersql = `select * from  users where chatId = ${data.chatId} ;`;
    const [result] = await handleSql(usersql);
    if (!_.isEmpty(result)) {
      return {
        ...result,
        code: 201,
      };
    }
    let createSql = `insert into users set ? ;`;
    await handleSql(createSql, data);
    return { code: 200 };
  },
  /** 查询chatId有关的账单和汇率 */
  async selectMyAccount(chatId) {
    let usersql = `select * from  users where ? ;`;
    let accountsql = `select * from  accounts where ? ;`;
    const result = await Promise.allSettled([
      handleSql(usersql, { chatId }),
      handleSql(accountsql, { chatId }),
    ]);
    const [user, account = []] = result.map((x) => x.value);

    return {
      user: user?.[0],
      account,
    };
  },
  /** 记录账本 */
  async calcStart(data) {
    let createSql = `insert into accounts set ? ;`;
    await handleSql(createSql, data);
  },
  /** 清空账本 */
  async clear(chatId) {
    let clearSql = `delete  from accounts where chatId = ${chatId} ;`;
    await handleSql(clearSql);
  },
  /** 清空账本 */
  async setRate(rate, chatId) {
    let setSql = `update users SET ? where chatId = ${chatId} ;`;
    await handleSql(setSql, { rate });
  },
  /** 查询u账户余额 */
  async checkUaddress(address) {
    let body = {};
    await getOk();
    try {
      const { data } = await axios({
        url: `https://apilist.tronscanapi.com/api/account/token_asset_overview?address=${address}`,
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'zh-CN,zh;q=0.9',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          Referer: 'https://tronscan.org/',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
        },
      });
      body = data;
    } catch (error) {}
    let res =
      body?.data?.reduce((x, y) => {
        switch (y.tokenAbbr) {
          case 'trx':
            x.trx = y.assetInTrx.toFixed(2);
            break;
          case 'USDT':
            x.usdt = y.assetInUsd.toFixed(2);
            break;
        }
        return x;
      }, {}) || {};
    return res;
  },
  /** 获取当前汇率 */
  getOk,
};

async function getOk() {
  try {
    let options = {
      uri: `https://www.okx.com/v3/c2c/tradingOrders/books?t=${Date.now()}&quoteCurrency=cny&baseCurrency=usdt&side=buy&paymentMethod=all&userType=all&showTrade=false&receivingAds=false&showFollow=false&showAlreadyTraded=false&isAbleFilter=false`,
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-encoding': ' gzip, deflate, br',
        'accept-language': ' en-US,en;q=0.9',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'cross-site',
        'upgrade-insecure-requests': '1',
        'user-agent':
          'Mozilla/5.0 (Linux; Android 8.1.0; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36 PTST/221108.151815',
      },
      cloudflareTimeout: 5000,
      cloudflareMaxTimeout: 30000,
      followAllRedirects: true,
      challengesToSolve: 3,
      decodeEmails: false,
      gzip: true,
    };

    const res = await cloudscraper(options);
    const $ = cheerio.load(res);
    let html = $('body').html();
    let data = {};
    eval(`data = ${html}`);
    console.log('data:', data);
    const curOptions =
      res?.data?.buy?.map(({ nickName, price }) => ({
        nickName,
        price,
      })) || [];
    console.log('curOptions:', curOptions);
    return curOptions;
  } catch (error) {
    console.log('cloudscrapererror:', error);
    return [];
  }
}

module.exports = options;
