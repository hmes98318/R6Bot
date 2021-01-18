const Discord = require('discord.js');
var request = require("request");
var cheerio = require("cheerio");
var auth = require('./auth.json');


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
            let tracker = []
            let newTracker = []

            if (args[1] == 'RANK') { //season ranked [42]-[53] 
                var url = link + r6_name[2];

                request(url, function (error, response, body) {
                    if (!error) {
                        //console.log(body)
                        var $ = cheerio.load(body);

                        $('#profile .trn-defstat__value').each(function (i, elem) {
                            tracker.push($(this).text().split('\n'))
                        })
                        for (i = 0; i < tracker.length; ++i) {
                            newTracker[i] = filterArray(String(tracker[i]).split(','))
                        }

                        let imgurl = $('img').map(function () {
                            return $(this).attr('src')
                        });//console.log(imgurl.toArray());
                        var header = imgurl.toArray()[0]
                        var rank_img = imgurl.toArray()[4]
                        rank_img = `https://tabstats.com/images/r6/ranks/?rank=${RankImage(newTracker[51])}&champ=0`


                        //header, user, url, win_percent, win, loss, kd, kill, death, killMatch, rank, mmr, rank_img
                        message.channel.send(R6_Ranked_Embed(header, r6_name[2], url, newTracker[46], newTracker[47], newTracker[48], newTracker[42], newTracker[44], newTracker[45], newTracker[43], newTracker[51], String(newTracker[52]), rank_img))
                    } else {
                        console.log("error：" + error);
                    }
                });
            }

            else if (args[1] == 'CASUAL') { //casual [32]-[41] 
                var url = link + r6_name[2];

                request(url, function (error, response, body) {
                    if (!error) {
                        //console.log(body)
                        var $ = cheerio.load(body);

                        $('#profile .trn-defstat__value').each(function (i, elem) {
                            tracker.push($(this).text().split('\n'))
                        })
                        for (i = 0; i < tracker.length; ++i) {
                            newTracker[i] = filterArray(String(tracker[i]).split(','))
                        }

                        let imgurl = $('img').map(function () {
                            return $(this).attr('src')
                        });//console.log(imgurl.toArray());
                        var header = imgurl.toArray()[0]
                        var rank_img = imgurl.toArray()[4]
                        rank_img = `https://tabstats.com/images/r6/ranks/?rank=${RankImage(newTracker[62])}&champ=0`


                        //header, user, url, timePlayed, win_percent, win, loss, kd, kill, death, killMatch, rank, mmr, rank_img
                        message.channel.send(R6_Casual_Embed(header, r6_name[2], url, newTracker[32], newTracker[38], newTracker[33], newTracker[34], newTracker[39], newTracker[37], newTracker[36], newTracker[40], newTracker[62], String(newTracker[64]), rank_img))
                    } else {
                        console.log("error：" + error);
                    }
                });
            }

            else if (args[1] == 'HELP') {
                message.channel.send(R6_help())
                break;
            }

            else { //general [0]-[11]  
                var url = link + r6_name[1];

                request(url, function (error, response, body) {
                    if (!error) {
                        //console.log(body)
                        var $ = cheerio.load(body);

                        $('#profile .trn-defstat__value').each(function (i, elem) {
                            tracker.push($(this).text().split('\n'))
                        })

                        for (i = 0; i < tracker.length; ++i) {
                            newTracker[i] = filterArray(String(tracker[i]).split(','))
                        }

                        let imgurl = $('img').map(function () {
                            return $(this).attr('src')
                        });//console.log(imgurl.toArray());
                        var header = imgurl.toArray()[0]


                        //header, user, url, timePlayed, win_percent, win, loss, kd, death, handShot, handShots, meleeKills, blindKills 
                        message.channel.send(R6_General_Embed(header, r6_name[1], url, newTracker[7], newTracker[6], newTracker[4], newTracker[5], newTracker[1], newTracker[2], newTracker[0], newTracker[3], newTracker[10], newTracker[11]))
                    } else {
                        console.log("error：" + error);
                    }
                });
            }
            break;

    }

});




function filterArray(clearArray) {
    let index = -1,
        arrayLength = clearArray ? clearArray.length : 0,
        resIndex = -1,
        result = [];

    while (++index < arrayLength) {
        let value = clearArray[index];
        if (value != null && value !== '' && value !== undefined && value !== false && value !== 0 && value != ',') {
            result[++resIndex] = value;
        }
    }
    return result
}




function R6_Ranked_Embed(header, user, url, win_percent, win, loss, kd, kill, death, killMatch, rank, mmr, rank_img) {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor('#ff00ee')
        .setTitle(`Open ${user} R6 Tracker Profile`)
        .setURL(url)
        .setAuthor(user, header, url)
        .setDescription('Ranked')
        .setThumbnail(rank_img)
        .addFields(
            { name: 'Ranked', value: `**${rank}**`, inline: true },
            { name: 'MMR', value: `**${mmr}**`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Win/Loss', value: `**${win_percent}**\nWin **${win}**\nLoss **${loss}**`, inline: true },
            { name: 'K/D', value: `**${kd}**\nKill **${kill}**\nDeath **${death}**`, inline: true },
            { name: 'Kill/Match', value: `**${killMatch}**`, inline: true },
        )
        .setTimestamp()
        .setFooter('', url);

    return trackerEmbed
}

function R6_Casual_Embed(header, user, url, timePlayed, win_percent, win, loss, kd, kill, death, killMatch, rank, mmr, rank_img) {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor('#ff00ee')
        .setTitle(`Open ${user} R6 Tracker Profile`)
        .setURL(url)
        .setAuthor(user, header, url)
        .setDescription('Casual')
        .setThumbnail(rank_img)
        .addFields(
            { name: 'Ranked', value: `**${rank}**`, inline: true },
            { name: 'MMR', value: `**${mmr}**`, inline: true },
            { name: 'Time Played', value: `**${timePlayed}**`, inline: true },

            { name: '\u200B', value: '\u200B' },
            { name: 'Win/Loss', value: `**${win_percent}**\nWin **${win}**\nLoss **${loss}**`, inline: true },
            { name: 'K/D', value: `**${kd}**\nKill **${kill}**\nDeath **${death}**`, inline: true },
            { name: 'Kill/Match', value: `**${killMatch}**`, inline: true },
        )
        .setTimestamp()
        .setFooter('', url);

    return trackerEmbed
}

function R6_General_Embed(header, user, url, timePlayed, win_percent, win, loss, kd, death, handShot, handShots, meleeKills, blindKills) {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor('#ff00ee')
        .setTitle(`Open ${user} R6 Tracker Profile`)
        .setURL(url)
        .setAuthor(user, header, url)
        .setDescription('General Profile')
        .setThumbnail(header)
        .addFields(
            { name: 'Win/Loss', value: `**${win_percent}**\nWin **${win}**\nLoss **${loss}**`, inline: true },
            { name: 'K/D', value: `**${kd}**\n\Death **${death}**`, inline: true },
            { name: 'Time Played', value: `**${timePlayed}**`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Hand Shot', value: `**${handShot}**\nHand Shots **${handShots}**`, inline: true },
            { name: 'Melee Kills', value: `**${meleeKills}**`, inline: true },
            { name: 'Blind Kills', value: `**${blindKills}**`, inline: true },
        )
        .setTimestamp()
        .setFooter('', url);

    return trackerEmbed
}

function R6_help() {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor('#ff00ee')
        .addFields(
            { name: 'R6 Tracker', value: `+r6 [your name] >> 總覽\n+r6 casual [your name] >> 一般場\n+r6 rank [your name] >> 排位`, inline: true },
            { name: 'example:', value: `+r6 blahaj_waifu\n+r6 casual blahaj_waifu\n+r6 rank blahaj_waifu`, inline: false },
        )

    return trackerEmbed
}


function RankImage(Img) {
    switch (String(Img)) {
        case 'COPPER V':
            return '1'

        case 'COPPER IV':
            return '2'

        case 'COPPER III':
            return '3'

        case 'COPPER II':
            return '4'

        case 'COPPER I':
            return '5'

        case 'BRONZE III':
            return '6'

        case 'BRONZE II':
            return '7'

        case 'BRONZE I':
            return '8'

        case 'SILVER IV':
            return '9'

        case 'SILVER III':
            return '10'

        case 'SILVER II':
            return '11'

        case 'SILVER I':
            return '12'

        case 'GOLD IV':
            return '13'

        case 'GOLD III':
            return '14'

        case 'GOLD II':
            return '15'

        case 'GOLD I':
            return '16'

        case 'PLATINUM III':
            return '17'

        case 'PLATINUM II':
            return '18'

        case 'PLATINUM I':
            return '19'

        case 'DIAMON':
            return '20'

        case 'CHAMPIONS':
            return '21'

        case 'UNRANKED':
            return '22'

    }
}