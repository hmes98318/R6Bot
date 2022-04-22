const Discord = require('discord.js');
const color = require('../../../config.json').COLOR;

module.exports = function (header, name, url, timePlayed, win_, wins, losses, kd, kills, deaths, killsMatch, rank, mmr, rank_img) {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(`Open ${name} profile`)
        .setURL(url)
        .setAuthor({ name: name, iconURL: header, url: url })
        .setDescription('Rank')
        .setThumbnail(rank_img)
        .addFields(
            { name: 'Ranked', value: `**${rank}**`, inline: true },
            { name: 'MMR', value: `**${mmr}**`, inline: true },
            { name: 'Time Played', value: `**${timePlayed}**`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Win/Loss', value: `**${win_}%**\nWins **${wins}**\nLosses **${losses}**`, inline: true },
            { name: 'K/D', value: `**${kd}**\nKills **${kills}**\nDeaths **${deaths}**`, inline: true },
            { name: 'Kills/Match', value: `**${killsMatch}**`, inline: true },
        )
        .setTimestamp();

    return trackerEmbed;
}