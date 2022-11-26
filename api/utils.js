const handleSql = require('./db');
const _ = require('lodash');

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
};

module.exports = options;
