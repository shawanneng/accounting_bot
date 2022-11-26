process.env.NTBA_FIX_319 = 1;
// ysood@mailto.plus
require('dotenv').config();
const _ = require('lodash');
const TelegramBot = require('node-telegram-bot-api');
const { telegramConfig } = require('../server/configs');
const { createUid, selectMyAccount, calcStart } = require('./utils');
const dayjs = require('dayjs');
require('dayjs/locale/zh-cn');
dayjs.extend(require('dayjs/plugin/relativeTime'));
dayjs.locale('zh-cn');
const options = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        {
          text: '使用说明',
          url: 'https://t.me/tianxiawudi777',
        },
        { text: '担保大群', url: 'https://t.me/tianxiawudi777' },
      ],
    ],
  }),
};
module.exports = async (request, response) => {
  try {
    const { body } = request;

    if (body.message) {
      const {
        chat: { type, id, title },
        text,
        from: { username: userName, first_name, is_bot, id: chatId },
      } = body.message;
      let outMsg = '';

      const bot = new TelegramBot(telegramConfig.token);

      if (text === '开始') {
        if (type === 'supergroup' && !is_bot) {
          const { code, channelTitle } = await createUid({
            chatId,
            userName,
            userChannel: id,
            userTitle: first_name,
            channelTitle: title,
            rate: 7.25,
          });
          if (code === 200) {
            outMsg = `${first_name} 您好,欢迎使用 算账机器人,你已成功注册!可以点击下方按钮查看机器人使用说明使用 `;
          } else {
            outMsg = ` ${first_name}:您已经在${channelTitle}群内注册过,请直接开始使用吧!`;
          }
        }

        if (type !== 'supergroup') {
          outMsg = `请将 @well_account_bot 机器人拉入群组设置管理员后再进行使用`;
        }

        await bot.sendMessage(id, outMsg, options);
        const res = await getBigUsdt();
        await bot.sendMessage(id, JSON.stringify(res), options);
      }

      if (text) {
        let reg = new RegExp(/(\+|\-|)/g);
        const arithmetic = str.replace(reg, '').trim();
        if (Number.isFinite(+arithmetic)) {
          const { user, account } = await selectMyAccount(chatId);
          if (_.isEmpty(user)) {
            outMsg = '<strong>您还没有注册,请发送指令 开始 进行注册</strong>';
          } else {
            const { rate } = user;
            let current = {
              arithmetic: arithmetic,
              currentRate: rate,
              createTime: dayjs().valueOf(),
              channel: title,
              chatId,
            };

            if (text.includes('+')) {
              current.calcMethod = '+';
              current.text = '已入账';
            }
            if (text.includes('-')) {
              current.calcMethod = '-';
              current.text = '已下发';
            }

            await calcStart(current);
            const { out, on, outCount, onCount } = [...account, current].reduce(
              (x, y) => {
                const { arithmetic, calcMethod, currentRate, createTime } = y;
                let curtime = dayjs(createTime).format('YYYY-MM-DD HH:mm:ss');
                let u = (arithmetic / currentRate).toFixed(2);
                if (calcMethod === '+') {
                  x.on.push(
                    `${curtime}  ${arithmetic} / ${currentRate} = ${u} \n`
                  );
                  x.onCount += arithmetic - 0;
                } else {
                  x.out.push(`${curtime} ${u}  (实时汇率: ${currentRate}) \n`);
                  x.outCount -= arithmetic - 0;
                }
              },
              {
                out: [],
                on: [],
                outCount: 0,
                onCount: 0,
              }
            );
            outMsg = `已入款(${on.length}笔):
${on.join('')}
已下发(${out.length}笔):
${out.join('')}

总入款金额:${onCount}
目前汇率:${current.currentRate}
应下发: ${onCount} | ${(onCount / current.currentRate).toFixed(2)} (USDT)
已下发: ${outCount} | ${(outCount / current.currentRate).toFixed(2)} (USDT)
未下发: ${onCount - outCount} | ${(
              (onCount - outCount) /
              current.currentRate
            ).toFixed(2)} (USDT)`;
          }
          await bot.sendMessage(id, outMsg, options);
        }
      }
      // await bot.sendMessage(id, content);

      // if (new RegExp(/\/开始/).test(text)) {
      //   let sendMsg = '';
      //   const focusingCdkey = text?.replace('/relation', '')?.trim();
      //   const { data = {} } = await axios({
      //     url: 'https://www.tgkit.fun/api/root/setInfoByFocusingCdkey',
      //     method: 'post',
      //     data: { focusingCdkey, relationChatId: id },
      //   }).catch((err) => (sendMsg = err.message));
      //   const { msg } = data;
      //   if (!sendMsg) {
      //     sendMsg = `<b>${msg}</b>`;
      //   }
      //   console.log('data:', data);
      //   await bot.sendMessage(id, sendMsg, {
      //     parse_mode: 'HTML',
      //   });
      // } else {
      //   await bot.sendMessage(
      //     id,
      //     ' <a href="https://www.tgkit.fun/">请以/relation+空格+密钥的形式来对接实时播报机器人,</a> <b>作者 @Liuwa91</b>',
      //     {
      //       parse_mode: 'HTML',
      //     }
      //   );
      // }
    }
  } catch (error) {
    console.error(error);
  } finally {
    response.send();
  }
};
