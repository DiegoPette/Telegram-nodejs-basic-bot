// BASIC NODEJS TELEGRAM BOT

// TO GET IT UP AND RUNNING JUST ADD YOUR TELEGRAM BOT API KEY IN THE .ENV FILE, RUN "NPM I" AND "NPM RUN DEV"

// node-telegram-bot-api does all the magic here 
// check it out here https://github.com/yagop/node-telegram-bot-api
const TelegramBot = require('node-telegram-bot-api');
// dotenv it's pretty sweet to keep everything nice and organized 
require('dotenv').config(); 
const token = process.env.TELEGRAM_API;
var bot;

// set up the bot for production or local usage
if (process.env.NODE_ENV === 'production') {
   bot = new TelegramBot(token);
   bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
   bot = new TelegramBot(token, { polling: true });
}

// available commands, you could do this directly from your bot settings in Telegram 
const cmds = [
    {cmd: "/start", description: "start command, does nothing, just checks connection"},
    {cmd: "/echo [string]", description: "echo command, a normal echo"},
    {cmd: "/help", description: "list available commands"},
]

// custom help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, generateHelpMessage(),{parse_mode : "HTML"});
});

// just basic stuff
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Bot started");
});

// a cmd to actually interact a bit with the basic bot
bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1]; 
    bot.sendMessage(chatId, resp);
});

// getting fancy here (NOT), checks if request cmd is in the list of availables cmds
bot.on('message', (msg, match) => {
    const chatId = msg.chat.id;
    if(process.env.TESTING){
        console.log("message", msg);
    }
    console.log("match",  match);
    if(msg.text[0] == '/'){
        var isCmd = false;
        for(var i in cmds){
            if(cmds[i].cmd.includes(msg.text.substr(0,msg.entities[0].length))){
                isCmd = true;
            }
        }
        if(!isCmd){
            bot.sendMessage(chatId, 'The command is not available, please see /help .');
        }
    }
});

// when running locally if you run "npm run dev" the script in package.json runs and it has TESTING=true so you would catch errors
if(process.env.TESTING){
    bot.on("polling_error", (err) => console.log(err));
}

// function that does what is named for
function generateHelpMessage(){
    var msg = "";
    msg += "<b>Available commands</b>\n\n";
    for(var i in cmds){
        msg += cmds[i].cmd+"\n";
        msg += "<i>"+cmds[i].description+"</i>\n";
    }
    return msg;
}

// code down here is to deploy app to heroku 
// I built this partially following this article https://blog.soshace.com/building-a-telegram-bot-with-node-js/
// you can find an explanation there
const express = require('express')
const bodyParser = require('body-parser');
 
const app = express();
 
app.use(bodyParser.json());
 
app.listen(process.env.PORT);
 
app.post('/' + bot.token, (req, res) => {
    console.log("post recived", req.body);
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// serve an html template for infos where your app is deployed
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/app.html');
});