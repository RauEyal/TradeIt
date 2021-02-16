const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const router = express.Router();
// replace the value below with the Telegram token you receive from @BotFather
const token = '1623319416:AAFPB5DMCp6wKarJj05c9rnjjQTjWP_fxmk';
const chatId = '-591780130';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

router.post('/', async (req, res) => {
  try {
    console.log(req.body.message);
    bot.sendMessage(
      chatId,
      `DEBUG: printing message: ${JSON.stringify(req.body)}`
    );
    bot.sendMessage(chatId, req.body.message);

    return res.status(200).json(req.body.message);
  } catch (err) {
    console.error(err.message);
    bot.sendMessage(chatId, `ERROR: ${err.message}`);
    res.status(500).send('Server error');
  }
});

// bot.onText(/\/echo (.+)/, (msg, match) => {
//     // 'msg' is the received Message from Telegram
//     // 'match' is the result of executing the regexp above on the text content
//     // of the message

//     const chatId = msg.chat.id;
//     const resp = match[1]; // the captured "whatever"

//     // send back the matched "whatever" to the chat
//     bot.sendMessage(chatId, resp);
//   });

// Listen for any kind of message. There are different kinds of
// messages.
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message');
// });
module.exports = router;
