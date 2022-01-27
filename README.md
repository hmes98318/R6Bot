# R6s Discord Bot
Rainbow Six Siege stats Discord Bot   

### Reference version  
**node.js  `v16.13.2`**  
**discord.js  `v13.6.0`**  
  
  
  
# Installation

### Clone the repository
```
git clone https://github.com/hmes98318/r6-discord-bot.git
```

### Install the package
```
npm install discord.js axios cheerio  
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







