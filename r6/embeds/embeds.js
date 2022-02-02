const Discord = require('discord.js');



module.exports = {

    R6_Ranked_Embed: function (header, user, url, win_percent, win, loss, kd, kill, death, killMatch, rank, mmr, rank_img) {
        const trackerEmbed = new Discord.MessageEmbed()
            .setColor('#ff00ee')
            .setTitle(`Open ${user} R6 Tracker Profile`)
            .setURL(url)
            .setAuthor({ name: user, iconURL: header, url: url })
            .setDescription('Ranked')
            .setThumbnail(rank_img)
            .addFields(
                { name: 'Ranked', value: `**${rank}**`, inline: true },
                { name: 'MMR', value: `**${mmr}**`, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Win/Loss', value: `**${win_percent}%**\nWin **${win}**\nLoss **${loss}**`, inline: true },
                { name: 'K/D', value: `**${kd}**\nKills **${kill}**\nDeath **${death}**`, inline: true },
                { name: 'Kill/Match', value: `**${killMatch}**`, inline: true },
            )
            .setTimestamp();

        return trackerEmbed
    },

    R6_Casual_Embed: function (header, user, url, timePlayed, win_percent, win, loss, kd, kill, death, killMatch, rank, mmr, rank_img) {
        const trackerEmbed = new Discord.MessageEmbed()
            .setColor('#ff00ee')
            .setTitle(`Open ${user} R6 Tracker Profile`)
            .setURL(url)
            .setAuthor({ name: user, iconURL: header, url: url })
            .setDescription('Casual')
            .setThumbnail(rank_img)
            .addFields(
                { name: 'Ranked', value: `**${rank}**`, inline: true },
                { name: 'MMR', value: `**${mmr}**`, inline: true },
                { name: 'Time Played', value: `**${timePlayed}**`, inline: true },

                { name: '\u200B', value: '\u200B' },
                { name: 'Win/Loss', value: `**${win_percent}%**\nWin **${win}**\nLoss **${loss}**`, inline: true },
                { name: 'K/D', value: `**${kd}**\nKills **${kill}**\nDeath **${death}**`, inline: true },
                { name: 'Kill/Match', value: `**${killMatch}**`, inline: true },
            )
            .setTimestamp();

        return trackerEmbed
    },
    R6_General_Embed: function (header, user, url, timePlayed, win_percent, win, loss, kd, kill,death, headshot, headShots, meleeKills, blindKills) {
        const trackerEmbed = new Discord.MessageEmbed()
            .setColor('#ff00ee')
            .setTitle(`Open ${user} R6 Tracker Profile`)
            .setURL(url)
            .setAuthor({ name: user, iconURL: header, url: url })
            .setDescription('General Profile')
            .setThumbnail(header)
            .addFields(
                { name: 'Win/Loss', value: `**${win_percent}**\nWin **${win}**\nLoss **${loss}**`, inline: true },
                { name: 'K/D', value: `**${kd}**\n\Kills **${kill}**\n\Death **${death}**`, inline: true },
                { name: 'Time Played', value: `**${timePlayed}**`, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Head Shot', value: `**${headshot}**\nHead Shots **${headShots}**`, inline: true },
                { name: 'Melee Kills', value: `**${meleeKills}**`, inline: true },
                { name: 'Blind Kills', value: `**${blindKills}**`, inline: true },
            )
            .setTimestamp();

        return trackerEmbed
    },
    //header,user,url,Operator ,Time Played,Kills,Deaths,K/D,Wins,Losses,Win %,Headshot %,DBNOs,XP,Melee Kills,Operator Stat,
    R6_Operators_Embed: function (header, user, url, operator, timePlayed, kill, death, kd, win, loss, win_percent, headshot, DBNOs, XP, meleeKills, operatorStat) {
        const trackerEmbed = new Discord.MessageEmbed()
            .setColor('#ff00ee')
            .setTitle(`Open ${user} R6 Tracker Profile`)
            .setURL(url)
            .setAuthor({ name: user, iconURL: header, url: url })
            .setDescription(operator)
            .setThumbnail(header)
            .addFields(
                { name: 'Win%', value: `**${win_percent}**\nWin**${win}**\nLoss **${loss}**`, inline: true },
                { name: 'K/D', value: `**${kd}**\nKills **${kill}**\nDeath **${death}**`, inline: true },
                { name: 'Time Played', value: `**${timePlayed}**`, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Head Shot', value: `**${headshot}**`, inline: true },
                { name: 'Melee Kills', value: `**${meleeKills}**`, inline: true },
                { name: 'Operator Stat', value: `**${operatorStat}**\nXP **${XP}**`, inline: true },
            )
            .setTimestamp();

        return trackerEmbed
    },

    R6_help: function () {
        const trackerEmbed = new Discord.MessageEmbed()
            .setColor('#ff00ee')
            .addFields(
                { name: 'R6 Tracker', value: `**General :** +r6 [pc/xbox/psn] [name]\n**Rank :** +r6 [pc/xbox/psn] [name] rank\n**Casual :** +r6 [pc/xbox/psn] [name] casual\n**Operators :** +r6 [pc/xbox/psn] [name] operator [name]`, inline: true },
                { name: 'example:', value: `+r6 pc waifu\\_-.\n+r6 pc waifu\\_-. rank\n+r6 pc waifu\\_-. casual\n+r6 pc waifu\\_-. operator ash`, inline: false },
            )

        return trackerEmbed
    },

    R6_help_operators: function () {
        const trackerEmbed = new Discord.MessageEmbed()
            .setColor('#ff00ee')
            .addFields(
                {
                    name: 'R6 Tracker', value: 
                    `ace, thermite, ash ,sledge, fuze, amaru, glaz, 
                    zofia, thatcher, capitao, buck, blackbeard, ying, 
                    nomad, finka, kali, hibana, montagne, lion, blitz, 
                    twitch, nakk, flores, iana, maverick, gridlock, iq, 
                    zero, dokkaebi, jackal,lesion, caveira, wamai, doc, 
                    ela, bandit, mira, frost, smoke, thunderbird, alibi, 
                    valkyrie, kaid, aruni, melusi, rook, mute, jager, 
                    castle, tachanka, pulse, kapkan, clash, echo, vigil, 
                    maestro, goyo, oryx, mozzie, warden, osa`, inline: true
                },
                { name: 'example:', value: `+r6 pc waifu\\_-. operator ash`, inline: false },
            )

        return trackerEmbed
    },

    R6_help_platform: function () {
        const trackerEmbed = new Discord.MessageEmbed()
            .setColor('#ff00ee')
            .addFields(
                { name: 'R6 Tracker', value: `+r6 [pc/xbox/psn] [name] [casual/rank]`, inline: true },
                { name: 'example:', value: `+r6 pc waifu\\_-.\n+r6 psn Killermcn rank\n+r6 xbox SSkyte casual\n+r6 pc waifu\\_-. operator ash`, inline: false },
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
