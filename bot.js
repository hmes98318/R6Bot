const Discord = require('discord.js');
let request = require("request");
let cheerio = require("cheerio");
let auth = require('./auth.json');
let TRN = require('./r6/r6');
let embed = require('./r6/embed');


const bot = new Discord.Client();
bot.login(auth.token);


bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}`);
});


const link = "https://r6.tracker.network/profile/pc/";

bot.on('message', message => {


    var args = message.content.toUpperCase().split(' ');
    var r6_name = message.content.split(' ')


    if (args[0] == '-R6') {
        if(args[1] == 'help' || args[1] == 'HELP'){
            console.log('HELP')
            return message.channel.send(embed.R6_help())
        }
            
        R6_request(r6_name[1], args[2], message.channel.id)

        let server_id = message.guild.id
        let channdl_id = message.channel.id
        let server_name = message.guild.name
        let channdl_name = message.channel.name
        console.log(`server : ${server_name} (${server_id})  channel : ${channdl_name} (${channdl_id})`)
    }
});




function trackerProfile(profile, url_profile) {
    return new Promise(function (resolve, reject) {
        request(url_profile, function (error, response, body) {
            if (!error) {
                let $ = cheerio.load(body);

                $('#profile .trn-defstat__value').each(function (i, elem) {
                    profile.push($(this).text().split('\n'))
                })
                for (i = 0; i < profile.length; ++i) {
                    profile[i] = TRN.filterArray(String(profile[i]).split(','))
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


async function R6_request(r6name, type, id) {

    let profile = [];
    let operators = [];
    let header;

    let url_profile = `https://r6.tracker.network/profile/pc/${r6name}`;
    let url_operators = `https://r6.tracker.network/profile/pc/${r6name}/operators`;


    try {
        profile = await trackerProfile(profile, url_profile)
        header = await trackerHeader(header, url_profile)
        operators = await trackerOperators(operators, url_operators)
        console.log(profile)
        //console.log(operators)
        TRN.R6_record(header, r6name, url_profile, profile, operators);
        bot.channels.cache.get(id).send(TRN.R6_type(type, r6name, profile, operators))
    }
    catch (message) {
        console.log(message)
    }
}
