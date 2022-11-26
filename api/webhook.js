process.env.NTBA_FIX_319 = 1;
// ysood@mailto.plus
require('dotenv').config();
const _ = require('lodash');
const TelegramBot = require('node-telegram-bot-api');
const { telegramConfig } = require('../server/configs');
const axios = require('axios');
const { createUid } = require('./utils');
module.exports = async (request, response) => {
  try {
    const { body } = request;

    if (body.message) {
      const {
        chat: { type, id, title },
        text,
        from: { username: userName, first_name, is_bot, id: chatId },
      } = body.message;

      const bot = new TelegramBot(telegramConfig.token);

      if (type === 'supergroup' && text === '开始' && !is_bot) {
        const { code, userChannel } = await createUid({
          chatId,
          userName,
          userChannel: id,
          userTitle: first_name,
          channelTitle: title,
          rate: 7.25,
        });
        let outMsg = '';
        if (code === 200) {
          outMsg = `<strong> ${first_name}</strong> <strong>您好,欢迎使用 算账机器人,你已成功注册!可以点击下方按钮查看机器人使用说明使用</strong> `;
        } else {
          outMsg = ` <pre>${first_name}</pre><strong>:您已经在</strong><pre>${userChannel}</pre> <strong>群内注册过,请直接开始使用吧!</strong>`;
        }
        await bot.sendMessage(id, outMsg, {
          parse_mode: 'HTML',
        });
      }

      if (type !== 'supergroup' && text === '开始') {
        await bot.sendMessage(
          id,
          `<strong>请将 @well_account_bot 机器人拉入群组设置管理员后再进行使用</strong>`,
          {
            parse_mode: 'HTML',
          }
        );
      }

      if (text || id) {
        let content = JSON.stringify(body);
        await bot.sendMessage(id, content);
      }

      let options = {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: 'Some button text 1', callback_data: '1' }],
            [{ text: 'Some button text 2', callback_data: '2' }],
            [{ text: 'Some button text 3', callback_data: '3' }],
          ],
        }),
      };
      bot.sendMessage(id, 'answer.', option);

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
