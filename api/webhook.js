process.env.NTBA_FIX_319 = 1;
// ysood@mailto.plus
require('dotenv').config();
const _ = require('lodash');
const TelegramBot = require('node-telegram-bot-api');
const { telegramConfig } = require('../server/configs');
const axios = require('axios');

module.exports = async (request, response) => {
  try {
    const { body } = request;

    if (body.message) {
      const {
        chat: { id },
        text,
      } = body.message;
      const bot = new TelegramBot(telegramConfig.token);

      // if (text === '开始') {
      // }

      let content = JSON.stringify(body);

      await bot.sendMessage(id, content);

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
