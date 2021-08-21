const Discord = require('discord.js');
var request = require("request");
var cheerio = require("cheerio");
var auth = require('./auth.json');
var TRN = require('./r6/r6');


const bot = new Discord.Client();
bot.login(auth.token);


bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}`);
});


const link = "https://r6.tracker.network/profile/pc/";

bot.on('message', message => {


    var args = message.content.toUpperCase().split(' ');
    var r6_name = message.content.split(' ')


    switch (args[0]) {

        case '+R6':
            R6_request(r6_name[1], args[2], message.channel.id)
            break;

    }

});





function R6_request(r6name, type, id) {


    let tracker = [];
    let operators = [];
    let header;

    let url_profile = `https://r6.tracker.network/profile/pc/${r6name}`;
    let url_operators = `https://r6.tracker.network/profile/pc/${r6name}/operators`;


    request(url_profile, function (error, response, body) {
        if (!error) {
            //console.log(body)
            var $ = cheerio.load(body);

            $('#profile .trn-defstat__value').each(function (i, elem) {
                tracker.push($(this).text().split('\n'))
            })
            for (i = 0; i < tracker.length; ++i) {
                tracker[i] = TRN.filterArray(String(tracker[i]).split(','))
            } //console.log(tracker);

            let imgurl = $('img').map(function () {
                return $(this).attr('src')
            });//console.log(imgurl.toArray());
            header = imgurl.toArray()[0];
            //var rank_img = imgurl.toArray()[4];
            //TRN.R6_record(header, r6name, url, tracker, ope);
        }
        else {
            console.log("擷取錯誤：" + error);
        }
        //return tracker
    });


    request(url_operators, function (error, response, body) {
        if (!error) {
            //console.log(body)
            var $ = cheerio.load(body);

            $('#profile .trn-table__row').each(function (i, elem) {
                operators.push($(this).text().split('\n'))
            })
            //console.log(operators)
            /*
            for (i = 0; i < operators.length; ++i) {
                operators[i] = TRN.filterArray(String(operators[i]).split(','))
            }
            */
            //TRN.R6_record(header, r6name, url, tracker);
        }
        else {
            console.log("擷取錯誤：" + error);
        }
        //return operators
    });


    setTimeout(() => {
/*
        for (i = 0; i < operators.length; ++i) {
            console.log(operators[i][0])
        }*/
        //console.log(operators[1][0])
        TRN.R6_record(header, r6name, url_profile, tracker, operators);
        bot.channels.cache.get(id).send(TRN.R6_type(type, r6name, tracker, operators))
    }, 2000);
}
