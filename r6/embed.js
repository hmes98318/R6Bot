const Discord = require('discord.js');



module.exports = {

    R6_Ranked_Embed: function (header, user, url, win_percent, win, loss, kd, kill, death, killMatch, rank, mmr, rank_img) {
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
    },

    R6_Casual_Embed: function (header, user, url, timePlayed, win_percent, win, loss, kd, kill, death, killMatch, rank, mmr, rank_img) {
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
    },

    R6_General_Embed: function (header, user, url, timePlayed, win_percent, win, loss, kd, death, headshot, headShots, meleeKills, blindKills) {
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
                { name: 'Head Shot', value: `**${headshot}**\nHead Shots **${headShots}**`, inline: true },
                { name: 'Melee Kills', value: `**${meleeKills}**`, inline: true },
                { name: 'Blind Kills', value: `**${blindKills}**`, inline: true },
            )
            .setTimestamp()
            .setFooter('', url);

        return trackerEmbed
    },

    R6_Operators_Embed: function (header, user, url, operator, timePlayed, kill, kd, win, loss, win_percent, headshot, DBNOs, XP, meleeKills, operatorStat) {
        const trackerEmbed = new Discord.MessageEmbed()
            .setColor('#ff00ee')
            .setTitle(`Open ${user} R6 Tracker Profile`)
            .setURL(url)
            .setAuthor(user, header, url)
            .setDescription(operator)
            .setThumbnail(header)
            .addFields(
                { name: 'Win%', value: `**${win_percent}**\nWin**${win}**\nLoss **${loss}**`, inline: true },
                { name: 'K/D', value: `**${kd}**\nKills **${kill}**`, inline: true },
                { name: 'Time Played', value: `**${timePlayed}**`, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Head Shot', value: `**${headshot}**`, inline: true },
                { name: 'Melee Kills', value: `**${meleeKills}**`, inline: true },
                { name: 'Operator Stat', value: `**${operatorStat}**\nXP **${XP}**`, inline: true },
            )
            .setTimestamp()
            .setFooter('', url);

        return trackerEmbed
    },

    R6_help: function () {
        const trackerEmbed = new Discord.MessageEmbed()
            .setColor('#ff00ee')
            .addFields(
                { name: 'R6 Tracker', value: `+r6 [your name] >> 總覽\n+r6 [your name] rank >> 排位\n+r6 [your name] casual >> 一般場`, inline: true },
                { name: 'example:', value: `+r6 blahaj_waifu\n+r6 blahaj_waifu rank\n+r6 blahaj_waifu casual`, inline: false },
            )

        return trackerEmbed
    },

    R6_Not_Found: function () {
        const trackerEmbed = new Discord.MessageEmbed()
            .setColor('#ff00ee')
            .addFields(
                { name: '404 Not Found. We are unable to find your profile.', value: 'Please check your spelling and make sure you are searching by the correct platform.', inline: true },
            )

        return trackerEmbed
    },
}
