const Discord = require('discord.js');
const color = require('../../../config.json').COLOR;

module.exports = function (header, name, url, timePlayed, win_, wins, losses, kd, kills, deaths, killsMatch, matches) {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(`Open ${name} profile`)
        .setURL(url)
        .setAuthor({ name: name, iconURL: header, url: url })
        .setDescription('Unrank')
        .setThumbnail("https://imgur.com/PvLQN8r.png")
        .addFields(
            { name: 'Win/Loss', value: `**${win_}%**\nWin **${wins}**\nLoss **${losses}**`, inline: true },
            { name: 'K/D', value: `**${kd}**\nKills **${kills}**\nDeaths **${deaths}**`, inline: true },
            { name: 'Time Played', value: `**${timePlayed}**`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Kills/Match', value: `**${killsMatch}**`, inline: true },
            { name: 'Matches', value: `**${matches}**`, inline: true },
        )
        .setTimestamp();

    return trackerEmbed;
}