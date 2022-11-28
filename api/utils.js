const handleSql = require('./db');
const _ = require('lodash');
const axios = require('axios');
let cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const insertJobs = (data) => {
  let { keys, values } = Object.entries(data)
    .sort()
    .reduce(
      (pre, [k, v]) => ({
        keys: [...(pre.keys || []), k],
        values: [...(pre.values || []), `'${v}'`],
      }),
      {}
    );
  keys = keys.join(',');
  values = `(${values.join(',')})`;
  return `INSERT INTO users (${keys}) VALUES ${values};`;
};

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
    let createSql = insertJobs(data);
    await handleSql(createSql);
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
    try {
      const { data } = await axios({
        url: `http://zhourunfa888.com/index/index/ajaxgetbalance.html`,
        headers: {
          accept: '*/*',
          'accept-language': 'zh-CN,zh;q=0.9',
          'cache-control': 'no-cache',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          pragma: 'no-cache',
          'proxy-connection': 'keep-alive',
          'x-requested-with': 'XMLHttpRequest',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
          cookie: `Hm_lvt_dd219329afac342521844220206d70a7==${Date.now()}; Hm_lpvt_dd219329afac342521844220206d70a7=${Date.now()}`,
          Referer: `http://zhourunfa888.com/index/index/address/search/${address}/page/1/which/trc20.html`,
        },
        method: 'post',
        data: { search: address },
      });
      if (!_.isEmpty(data?.data)) {
        const { TRX_TOTAL: trx, USDT_TOTAL: usdt } = data?.data || {};
        return { trx, usdt };
      }
    } catch (error) {
      console.log('error:', error);
    }
  },
  /** 查询u明细 */
  checkUDetail,
  /** 获取当前汇率 */
  getOk,
};

async function getOk() {
  try {
    let options = {
      uri: `https://www.okx.com/v3/c2c/tradingOrders/books?t=${Date.now()}&quoteCurrency=CNY&baseCurrency=USDT&side=sell&paymentMethod=all&userType=all&showTrade=false&receivingAds=false&showFollow=false&showAlreadyTraded=false&isAbleFilter=false&urlId=3`,
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
    const curOptions =
      data?.data?.sell?.map(({ nickName, price }) => ({
        nickName,
        price,
      })) || [];

    let randomIndex = [];
    let randomList = [];
    let count = 0;
    while (count <= 10) {
      let index = Math.floor(
        Math.random() * Math.round(curOptions.length / 1.5)
      );
      if (!randomIndex.includes(index)) {
        randomIndex.push(index);
        randomList.push(curOptions[index]);
        count++;
      }
    }

    randomList = randomList.sort((a, b) => a.price - b.price);

    return randomList;
  } catch (error) {
    console.log('cloudscrapererror:', error);
    return [];
  }
}

async function checkUDetail(address) {
  try {
    const { data } = await axios({
      url: `http://zhourunfa888.com/index/index/address/search/${address}/page/1/which/trc20.html`,
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'proxy-connection': 'keep-alive',
        'x-requested-with': 'XMLHttpRequest',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
        cookie: `Hm_lvt_dd219329afac342521844220206d70a7==${Date.now()}; Hm_lpvt_dd219329afac342521844220206d70a7=${Date.now()}`,
        Referer: 'http://zhourunfa888.com/',
      },
    });
    const $ = cheerio.load(data);
    let kaijiangData = [];
    let tr = $('.table-responsive  .mt-2  tr');

    tr?.map((x, e) => {
      if (x > 0) {
        let obj = {};
        $(e)
          ?.find('.text-break')
          ?.each((index, e) => {
            let text = $(e).text().trim();
            text = text === address ? '它' : text;
            if (index === 0) {
              obj.time = text;
              obj.isToday = dayjs(obj.time).isSame(dayjs(new Date()), 'day');
            }
            if (index === 1) {
              obj.out = text;
            }
            if (index === 2) {
              obj.on = text;
            }
            if (index === 4) {
              let price = $(e).find('.badge').text().replace(/\s+/g, '');
              obj.price = price;
            }
          });
        if (obj.isToday) {
          if (obj.on === '它') {
            obj.text = `<b>${obj.time}</b> <code>${obj.out}</code>向<b>它</b>转账 <b>${obj.price}U</b>\n`;
          }

          if (obj.out === '它') {
            obj.text = `<b>${obj.time}</b> <b>它</b>向<code>${
              obj.on
            }</code>转账 <b>${Math.abs(obj.price)}U</b>\n`;
          }

          kaijiangData.push(obj);
        }
      }
    });
    console.log('kaijiangData:', kaijiangData);
    if (!_.isEmpty(kaijiangData)) {
      return kaijiangData;
    }
  } catch (error) {
    console.log('error:', error);
  }
}

checkUDetail('TNANMFXnTZ5UBsHx4Hk7ViTgXu8KgwPfdh');

module.exports = options;
