const main = require('./r6/index.js');
const config = require('./config.json');


const TOKEN = config.TOKEN;
const CLIENT_ID = config.CLIENT_ID;
const GUILD_ID = config.GUILD_ID;
const PREFIX = config.PREFIX;


main(TOKEN, CLIENT_ID, GUILD_ID,PREFIX);
// If you don't want txt commands or slash commands you can revise './config.json'
// if load_Slash_Global is false only valid in that Guild,
// otherwise that will valid in all Guild.

/* config.json
{
    "TOKEN": "",
    "CLIENT_ID": "",
    "GUILD_ID": "",
    "Txt_Commands": true,
    "Slash_Commands": true,
    "load_Slash_Global": false,
    "PREFIX": "+",
    "name": "r6-discord-bot"
}
*/