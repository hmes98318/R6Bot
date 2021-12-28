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


const link = "https://r6.tracker.network/profile/";
const prefix = config.prefix;




bot.on("message", async message => {

    let args = message.content.toUpperCase().split(' ');

    if (args[0] === `${prefix}R6`) {
        
        let profile = [];
        let operators = [];
        let header;

        let gameplatform= message.content.split(' ')[1]
        let r6name = message.content.split(' ')[2];
        let url_profile = `https://r6.tracker.network/profile/${gameplatform}/${r6name}`;
        let url_operators = `https://r6.tracker.network/profile/${gameplatform}/${r6name}/operators`;

        message.channel.startTyping();

        if (args[1] === "HELP") { // +R6 help
            console.log("HELP");
            message.channel.send(embed.R6_help());
            return message.channel.stopTyping();
        }

        if(args[1] !== "PC" && args[1] !== "XBOX" && args[1] !== "PSN" && args[1] !== "PS4" && args[1] !== "PS5"){
            console.log("PLATFORM_ERROR"); // if enter platform not pc/xbox/osn
            message.channel.send(embed.R6_help_platform());
            return message.channel.stopTyping();
        }

        else if (args[3] === "OPERATOR") { // +R6 [platform] [name] operator ash/lesion...
            console.log("OPERATORS");
            if (r6.OperatorCheck(args[4])) {
                operators = await trackerOperators(operators, url_operators);
                r6.R6_record(header, r6name, url_profile, profile);
                message.channel.send(r6.Operators(operators, args[4]));
                return message.channel.stopTyping();
            }
            else {
                message.channel.send(embed.R6_help_operators());
                return message.channel.stopTyping();
            }

        }

        else if (args[2] && (!args[3] || args[3] === "RANK" || args[3] === "CASUAL")) { // +R6 [platform] [name]  || +R6 [platform] [name] rank/casual
            console.log("PROFILE");

            profile = await trackerProfile(profile, url_profile);
            header = await trackerHeader(header, url_profile);
            r6.R6_record(header, r6name, url_profile, profile);

            if (profile.length) { //Check if the searched player is correct (exists)
                if (args[3] === "RANK") {
                    message.channel.send(r6.Rank(profile));
                    return message.channel.stopTyping();
                }
                else if (args[3] === "CASUAL") {
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

        else if(args[2] && args[3]){
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
                console.log("Extraction error" + error);
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
                console.log("Extraction error" + error);
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
                console.log("Extraction error" + error);
            }
        });
    });
}
