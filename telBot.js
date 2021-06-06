const { default: axios } = require('axios');
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const router = express.Router();
const Order = require('./models/Order');
// replace the value below with the Telegram token you receive from @BotFather
const token = '1623319416:AAFPB5DMCp6wKarJj05c9rnjjQTjWP_fxmk';
const chatId = '-591780130';
const actions = ['BUY', 'STRONG-BUY', 'SELL', 'STRONG-SELL'];

secret = process.env.SECRET;
client_id = process.env.API_KEY;
refreshToken = process.env.REFRESH_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

router.post('/', async (req, res) => {
  try {
    var data = req.body;
    var symbol = data.symbol;
    var actionArray = JSON.parse('[' + data.action + ']');
    console.log(`symbol: ${symbol}, action:${actionArray}`);
    var actionType = actions[GetActionNumber(actionArray)];
    const tokenResp = await GetAccessToken();
    const token = tokenResp.access_token;

    bot.sendMessage(
      chatId,
      `${symbol} - ${actionType} = ${data.price}$ \n ${token}`
    );

    let orderData = new Order({
      symbol: symbol,
      action: actionType,
      price: data.price,
    });

    orderData.save();
    return res.status(200).json(data.message);
  } catch (err) {
    console.error(err.message);
    bot.sendMessage(chatId, `ERROR: ${err.message}`);
    res.status(500).send('Server error');
  }
});

router.post('/anyalert', async (req, res) => {
  try {
    console.log(`anyAlert: ${JSON.stringify(req.body)}`);
    bot.sendMessage(chatId, req.body.message);

    return res.status(200).json('any alert message');
  } catch (err) {
    console.error(err.message);
    bot.sendMessage(chatId, `ERROR: ${err.message}`);
    res.status(500).send('Server error');
  }
});

function GetActionNumber(actionArray) {
  for (let i = 0; i < actionArray.length; i++) {
    const element = actionArray[i];
    if (element == 1) {
      return i;
    }
  }

  return -1;
}

async function GetAccessToken() {
  const data = {
    grant_type: 'refresh_token',
    client_id: client_id,
    refresh_token: refreshToken,
    response_type: 'token',
    client_secret: secret,
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  return axios.post(
    'https://api.tradestation.com/v2/Security/Authorize',
    data,
    {
      headers,
    }
  );
}

module.exports = router;
