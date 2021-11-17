# r6.tracker Discord Bot
This is Rainbow Six Siege stats by Discord Bot  
use website : https://r6.tracker.network  

### Reference version  
**node.js  `v16.8.0`**  
**discord.js  `v12.5.1`**  
  
  
  
# Installation

### Clone the repository
```
git clone https://github.com/hmes98318/r6.tracker-bot.git
```

### Install the package
```
npm install discord.js@12.5.1 request cheerio  
```

### Modify `config.json`
```json
{
    "token": "yourToken",
    "prefix": "+",
    "name": "r6.tracker-bot"
}
```

# Running the script 

```
node bot.js
```

# Command

get profile
```
+r6 [PLAYER_NAME]
```

get Rank or Casual statistics
```
+r6 [PLAYER_NAME] [RANK/CASUAL]
```

get operator statistics
```
+r6 [PLAYER_NAME] operator [OPERATOR_NAME]
```

get help
```
+r6 help
```







