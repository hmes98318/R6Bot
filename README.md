# R6Bot
**Rainbow Six Siege stats Discord Bot**  

**This Bot depends on the [`r6s-stats-api`](https://github.com/hmes98318/r6s-stats-api) module to fetch statistics**  

### Reference version  
[**node.js  `v16.15.0`**](https://nodejs.org/en/)  
[**discord.js  `v14.3.0`**](https://discord.js.org/#/)  


### Dependencies Modules  
* [**r6s-stats-api`v1.1.1`**](https://www.npmjs.com/package/r6s-stats-api)  
* [**discord.js `v14.3.0`**](https://www.npmjs.com/package/discord.js)  
* [**@discordjs/rest `v1.1.0`**](https://www.npmjs.com/package/@discordjs/rest)  
* [**dotenv `v16.0.2`**](https://www.npmjs.com/package/dotenv)  



# Installation

### Clone the repository
```
git clone -b v2.1.0 https://github.com/hmes98318/R6Bot.git
```
or [**click here**](https://github.com/hmes98318/R6Bot/releases) to download

### Install the depedences  
auto install all dependencies on [`package.json`](./package.json)  
```
npm install
```

### Configure Files  
[`.env`](./.env) 
```env
TOKEN = "your_token"
```
[`config.json`](./config.json)  
```json
{
    "name": "R6Bot",
    "PREFIX": "+",
    "COLOR":"#ff00ee",
    "ENABLE_DEFAULT_PLATFORM": true,
    "DEFAULT_PLATFORM": "pc",
    "SLASH_COMMANDS":true,
    "GUILD_ID":"your_GUILD_ID",
    "LOAD_SLASH_GLOBAL": false
}
```
Setting the `"DEFAULT_PLATFORM"` allows you to omit that platform in the command part  
If `LOAD_SLASH_GLOBAL` is `false` only valid in that Guild, otherwise that will valid in all Guild.

## Running the script 

```
node index.js
```

## Commands

get profile
```
+r6 [PC/XBOX/PSN] <PLAYER_NAME>
```

get Casual, Rank, Unrank, Deathmatch statistics  
```
+r6 [PC/XBOX/PSN] <PLAYER_NAME> [RANK/CASUAL/UNRANK/DEATHMATCH]
```

get Operators statistics  
```
+r6 [PC/XBOX/PSN] <PLAYER_NAME> operator <OPERATOR_NAME>
```

get help
```
+r6 help
```





