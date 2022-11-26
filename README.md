# DevTools Bot

Serverless Telegram bot for development tools.

<p align="center">
  <img src="assets/imgs/devtoolsbot.png">
</p>

# Features

- /bcrypt `text` - Text to bcrypt hash
- /binary `text` - Text to binary
- /hex `text` - HEX to ASCII
- /md5 `text` - Text to MD5 hash
- /short `url` - Short url
- /slug `text` - Slug text
- /uuid - Generate UUID
- /help - Help

# Prerequisites

- [Node.js](https://nodejs.org/en/)

# Running

### 1. Telegram

```
# Create an Telegram bot
Find @BotFather on Telegram, type /newbot and follow the instructions.

# Credentials
Save your token from @BotFather.
```

### 2. Vercel Deploy

```
# Account
Create an Vercel account on https://vercel.com/.

# Install Vercel CLI
npm install -g vercel

# Vercel CLI login
vercel login

# Deploy
vercel

# Set Vercel environment variables
TELEGRAM_USERNAME
TELEGRAM_TOKEN
```

### 3. Setting up the Telegram webhook

```
curl --location --request POST https://api.telegram.org/bot5506886729:AAExoxG73bzoOwtkxSww0SYYb5E0J02Lips/setWebhook --header 'Content-type: application/json' --data '{"url": "http://tg-robot.vercel.app/api/webhook"}'
```

# Built With

- [Node.js](https://nodejs.org/en/)

# Authors

- [xxgicoxx](https://github.com/xxgicoxx/)

# Acknowledgments

- [FlatIcon](https://www.flaticon.com/)
