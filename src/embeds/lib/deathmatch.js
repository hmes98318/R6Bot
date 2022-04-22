const Discord = require('discord.js');
const color = require('../../../config.json').COLOR;

module.exports = function (header, name, url, win_, wins, losses, kd, kills, deaths, killsMatch, matches, abandons, rank, mmr, rank_img) {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(`Open ${name} profile`)
        .setURL(url)
        .setAuthor({ name: name, iconURL: header, url: url })
        .setDescription('DeathMatch')
        .setThumbnail(rank_img)
        .addFields(
            { name: 'Ranked', value: `**${rank}**`, inline: true },
            { name: 'MMR', value: `**${mmr}**`, inline: true },
            { name: 'Matches', value: `**${matches}**`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Win/Loss', value: `**${win_}%**\nWin **${wins}**\nLoss **${losses}**`, inline: true },
            { name: 'K/D', value: `**${kd}**\nKills **${kills}**\nDeath **${deaths}**`, inline: true },
            { name: 'Kills/Match', value: `**${killsMatch}**`, inline: true },
        )
        .setTimestamp();

    return trackerEmbed;
}