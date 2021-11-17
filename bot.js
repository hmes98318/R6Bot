const Discord = require('discord.js');
const request = require("request");
const cheerio = require("cheerio");

const config = require('./config.json');
const r6 = require('./r6/r6.js');
const embed = require('./r6/embed.js');




const bot = new Discord.Client();
bot.login(config.token);


bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}`);
});


const link = "https://r6.tracker.network/profile/pc/";
const prefix = config.prefix;




bot.on("message", async message => {

    let args = message.content.toUpperCase().split(' ');

    if (args[0] === `${prefix}R6`) {

        let profile = [];
        let operators = [];
        let header;

        message.channel.startTyping();
        let r6name = message.content.split(' ')[1];

        let url_profile = `https://r6.tracker.network/profile/pc/${r6name}`;
        let url_operators = `https://r6.tracker.network/profile/pc/${r6name}/operators`;

        if (args[1] === "HELP") { // +R6 help
            console.log("HELP");
            message.channel.send(embed.R6_help());
            return message.channel.stopTyping();
        }

        else if (args[2] === "OPERATOR") { // +R6 name operator ash/lesion...
            console.log("OPERATORS");
            if (r6.OperatorCheck(args[3])) {
                operators = await trackerOperators(operators, url_operators);
                message.channel.send(r6.Operators(operators, args[3]));
                return message.channel.stopTyping();
            }
            else {
                message.channel.send(embed.R6_help_operators());
                return message.channel.stopTyping();
            }

        }

        else if (args[1] && (!args[2] || args[2] === "RANK" || args[2] === "CASUAL")) { // +R6 name || +R6 rank/casual
            console.log("PROFILE");

            profile = await trackerProfile(profile, url_profile);
            header = await trackerHeader(header, url_profile);
            r6.R6_record(header, r6name, url_profile, profile, operators);

            if (profile.length) { //檢查搜尋到的玩家是否正確(存在)
                if (args[2] === "RANK") {
                    message.channel.send(r6.Rank(profile));
                    return message.channel.stopTyping();
                }
                else if (args[2] === "CASUAL") {
                    message.channel.send(r6.Casual(profile));
                    return message.channel.stopTyping();
                }
                else { // GENERAL
                    message.channel.send(r6.General(profile));
                    return message.channel.stopTyping();
                }
            }
            else {
                console.log("PROFILE_NOT_FOUND");
                message.channel.send(embed.R6_Not_Found());
                return message.channel.stopTyping();
            }
        }

        else if(args[1] && args[2]){
            console.log("FORMAT_ERROR");
            message.channel.send(embed.R6_help());
            return message.channel.stopTyping();
        }

        else {
            console.log("NOT_FOUND");
            message.channel.send(embed.R6_Not_Found());
            return message.channel.stopTyping();
        }
    }
})




function trackerProfile(profile, url_profile) {
    return new Promise(function (resolve, reject) {
        request(url_profile, function (error, response, body) {
            if (!error) {
                let $ = cheerio.load(body);

                $('#profile .trn-defstat__value').each(function (i, elem) {
                    profile.push($(this).text().split('\n'))
                })
                for (i = 0; i < profile.length; ++i) {
                    profile[i] = r6.FilterArray(String(profile[i]).split(','))
                }
                resolve(profile);
            }
            else {
                reject(error);
                console.log("擷取錯誤：" + error);
            }
        });
    });
}


function trackerHeader(header, url_profile) {
    return new Promise(function (resolve, reject) {
        request(url_profile, function (error, response, body) {
            if (!error) {
                let $ = cheerio.load(body);

                let imgurl = $('img').map(function () {
                    return $(this).attr('src')
                });//console.log(imgurl.toArray());
                header = imgurl.toArray()[0];
                resolve(header)
            }
            else {
                reject(error);
                console.log("擷取錯誤：" + error);
            }
        })
    })
}


function trackerOperators(operators, url_operators) {
    return new Promise(function (resolve, reject) {
        request(url_operators, function (error, response, body) {
            if (!error) {
                let $ = cheerio.load(body);

                $('#profile .trn-table__row').each(function (i, elem) {
                    operators.push($(this).text().split('\n'))
                })
                resolve(operators);
            }
            else {
                reject(error);
                console.log("擷取錯誤：" + error);
            }
        });
    });
}

