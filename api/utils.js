const handleSql = require('./db');
const _ = require('lodash');
const axios = require('axios');
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
    const [user, account] = result.map((x) => x.value[0]);
    console.log('user:', user);
    console.log('account:', account);
    return {
      user,
      account,
    };
  },
  /** 记录账本 */
  async calcStart() {
    let createSql = `insert into accounts set ? ;`;
  },
  async getBigUsdt() {
    let res = '';
    res = await axios({
      url: `https://www.okx.com/v3/c2c/tradingOrders/books?t=${Date.now()}&quoteCurrency=CNY&baseCurrency=USDT&side=buy&paymentMethod=all&userType=all&showTrade=false&showFollow=false&showAlreadyTraded=false&isAbleFilter=false`,
      hedaers: {
        accept: 'application/json',
        'accept-language': 'zh-CN',
        'app-type': 'web',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'sec-ch-ua':
          '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'x-cdn': 'https://static.okx.com',
        'x-utc': '8',
        Referer: 'https://www.okx.com/cn/p2p-markets/cny/sell-usdt',
        cookie:
          '__cf_bm=2NXSe_wxSN8OtfRMKLzXucO28V7GOdN7VbGXFgi1oB8-1669442396-0-AYhPbDTlhrVYQM+rLPgij/eVcNnNkgv6YoYkeP9eOdtbDlcWC5TKduo1lF9Nv/WN34mOck7AAgR/LF7d6SFsLXY=',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
      },
    }).catch((x) => {
      console.log('x:', x);
      res = x.data;
    });

    return res;
  },
};

module.exports = options;
