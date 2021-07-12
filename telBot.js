const { default: axios } = require('axios');
const { json } = require('express');
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const querystring = require('querystring');
const router = express.Router();
const Order = require('./models/Order');
// replace the value below with the Telegram token you receive from @BotFather
const token = '1623319416:AAFPB5DMCp6wKarJj05c9rnjjQTjWP_fxmk';
const chatId = '-591780130';
const actions = ['BUY', 'STRONG-BUY', 'SELL', 'STRONG-SELL'];
const accountKey = '15788206';
const symbolToTrade = ['HOV','BB'];
let submitResp;
let accessToken = '';
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
    
    bot.sendMessage(
      chatId,
      `${symbol} - ${actionType} = ${data.price}$`
    );

    if (symbolToTrade.includes(symbol) && data.alertType.toLowerCase() == 'lux'){
      ReallyGetToken();
      let position = await GetPositionBySymbol(symbol);
      if ((actionType == actions[0] || actionType == actions[1])){
        if (position != null){
          return;
        }

        var res = SubmitOrder(symbol, 'BUY', 10);
        bot.sendMessage(
          chatId,
          `$Open new position: ${symbol} - ${actionType} - Quantity = 10`
        );
      }
      else{
        if (position == null){
          return;
        }
        
        var res = SubmitOrder(symbol, 'SELL', position.quantity);
        bot.sendMessage(
          chatId,
          `$Closing position: ${symbol} - ${actionType} - Quantity = ${position.Quantity}`
        );
      }
    }   


    // submitResp = await SubmitOrder();
   

    // let orderData = new Order({
    //   symbol: symbol,
    //   action: actionType,
    //   price: data.price,
    // });

    // orderData.save();
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

    // const userResp = await GetUserAccounts();
    return res.status(200).json('any alert message');
  } catch (err) {
    console.error(err);
    //bot.sendMessage(chatId, `ERROR: ${err.message}`);
    res.status(500).send('Server error');
  }
});

async function ReallyGetToken(){
  const tokenResp = await GetAccessToken();
  accessToken = tokenResp.data.access_token;
} 

function GetActionNumber(actionArray) {
  for (let i = 0; i < actionArray.length; i++) {
    const element = actionArray[i];
    if (element == 1) {
      return i;
    }
  }

  return -1;
}

async function GetUserAccounts() {
  console.log(' ...', accessToken);
    const url = 'https://api.tradestation.com/v2/users/rauscher/accounts';

  let headers = {
    'content-type': 'application/json',
    "Authorization": `bearer ${accessToken}`,
  };

  return axios({
    url,
    method: 'get',
    data: {},
    headers,
  });
}

async function GetPositions() {
  console.log('fetching positions')
  const url = 'https://api.tradestation.com/v2/accounts/15788206/positions';

  let headers = {
    'content-type': 'application/json',
    "Authorization": `bearer ${accessToken}`,
  };

  return axios({
    url,
    method: 'get',
    data: {},
    headers,
  });
}

async function GetPositionBySymbol(symbol){
  var positions = await GetPositions();
  console.log("fetching positions: " + positions);
  var position = positions.find(d => d.symbol === symbol);
  return position;
}

async function SubmitOrder(symbol, orderAction, quantity) {
  console.log('submitting order...');
  const data = {
    AccountKey: '15788206',
    AssetType: 'EQ',
    Duration: 'DAY',
    OrderType: 'Market',
    Quantity: quantity,
    Symbol: symbol,
    TradeAction: orderAction,
    OSOs: [
      {
        Type: 'NORMAL',
      },
    ],
  };

  const url = 'https://api.tradestation.com/v2/orders/confirm';

  let headers = {
    'content-type': 'application/json',
    "Authorization": `bearer ${accessToken}`,
  };

  return axios({
    url,
    method: 'post',
    data,
    headers,
  });
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
    'content-type': 'application/x-www-form-urlencoded',
  };

  return axios({
    url: 'https://api.tradestation.com/v2/Security/Authorize',
    method: 'post',
    data: querystring.stringify(data),
    headers,
  });
}

module.exports = router;
