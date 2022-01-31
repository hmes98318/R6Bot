# R6s Discord Bot
Rainbow Six Siege stats Discord Bot   

### Reference version  
**node.js  `v16.13.2`**  
**discord.js  `v13.6.0`**  
  
  
  
# Installation

### Download the package
```
https://github.com/hmes98318/r6-discord-bot/releases/tag/1.2.3
```

### Install the depedences
```
npm install discord.js @discordjs/rest axios cheerio  
```

### Modify `config.json`
```json
{
    "TOKEN": "yourToken",
    "GUILD_ID": "yourGuildID",
    "CLIENT_ID": "yourClientID",
    "PREFIX": "+",
    "NAME": "r6-discord-bot"
}
```

# Running the script 

```
node index.js
```

# Command

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







