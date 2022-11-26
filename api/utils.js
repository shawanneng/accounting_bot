const handleSql = require('./db');
const _ = require('lodash');
const axios = require('./app/request');
const FormData = require('form-data');
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
    let formdata = new FormData();

    formdata.append(
      'url',
      `https://apilist.tronscanapi.com/api/account/token_asset_overview?address=${address}`
    );
    formdata.append('seltype', 'get');
    formdata.append('ck', '');
    formdata.append('header', '');
    formdata.append('parms', '');
    formdata.append('proxy', '');
    formdata.append('code', 'utf8');
    formdata.append('j', '1');
    formdata.append('ct', 'application/x-www-form-urlencoded');

    const { data } = await axios({
      url: `http://coolaf.com/tool/ajaxgp`,
      method: 'POST',
      headers: {
        ...formdata.getHeaders(),
        accept: 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'x-requested-with': 'XMLHttpRequest',
        Referer: 'http://coolaf.com/',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
      },
      method: 'post',
      data: formdata,
    });
    let body = [];
    try {
      body = JSON.parse(data?.data?.response);
    } catch (error) {}
    // const { data } = await axios({
    //   url: `https://apilist.tronscanapi.com/api/account/token_asset_overview?address=${address}`,
    //   headers: {
    //     accept: 'application/json, text/plain, */*',
    //     'accept-language': 'zh-CN,zh;q=0.9',
    //     // 'cache-control': 'no-cache',
    //     // pragma: 'no-cache',
    //     // 'sec-ch-ua':
    //     //   '"Google Chrome";v="105", ")Not;A=Brand";v="8", "Chromium";v="105"',
    //     // 'sec-ch-ua-mobile': '?0',
    //     // 'sec-ch-ua-platform': '"Windows"',
    //     // 'sec-fetch-dest': 'empty',
    //     'sec-fetch-mode': 'cors',
    //     'sec-fetch-site': 'cross-site',
    //     Referer: 'https://tronscan.org/',
    //     'Referrer-Policy': 'strict-origin-when-cross-origin',
    //     'User-Agent':
    //       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
    //   },
    // });
    let res =
      body?.data?.reduce((x, y) => {
        switch (y.tokenAbbr) {
          case 'trx':
            x.trx = y.assetInTrx;
            break;
          case 'USDT':
            x.usdt = y.assetInUsd;
            break;
        }
        return x;
      }, {}) || {};
    return res;
  },
};

options.checkUaddress('TCFJCdAQkRvitKzJruuyivVWwmWxrc5yKU').then((res) => {
  console.log('res:', res);
});
module.exports = options;
