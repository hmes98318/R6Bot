# R6Bot
Rainbow Six Siege stats Discord Bot   

### Reference version  
**node.js  `v16.13.2`**  
**discord.js  `v13.6.0`**  
  
  
  
# Installation

### Clone the repository
```
git clone https://github.com/hmes98318/r6-discord-bot.git
```

### Install the depedences
```
npm install discord.js @discordjs/rest axios cheerio  
```

### Modify `config.json`
```json
{
    "TOKEN": "yourToken",
    "CLIENT_ID": "yourClientID",
    "GUILD_ID": "yourGuildID",
    "Text_Commands": true,
    "Slash_Commands": true,
    "load_Slash_Global": false,
    "tracker_timeout": 5000,
    "PREFIX": "+",
    "name": "R6Bot"
}
```

## Running the script 

```
node index.js
```

## Command
If you don't want txt commands or slash commands you can revise `./config.json`  
if `load_Slash_Global` is `false` only valid in that Guild,  
otherwise that will valid in all Guild.


get profile
```
+r6 [PC/XBOX/PSN] [PLAYER_NAME]
```

get Rank or Casual statistics
```
+r6 [PC/XBOX/PSN] [PLAYER_NAME] [RANK/CASUAL]
```

get operator statistics
```
+r6 [PC/XBOX/PSN] [PLAYER_NAME] operator [OPERATOR_NAME]
```

get help
```
+r6 help
```





