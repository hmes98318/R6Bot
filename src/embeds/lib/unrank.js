const Discord = require('discord.js');

module.exports = function (header, name, url, win_, wins, losses, kd, kills, deaths, killsMatch, timePlayed, matches) {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor('#ff00ee')
        .setTitle(`Open ${name} Profile`)
        .setURL(url)
        .setAuthor({ name: name, iconURL: header, url: url })
        .setDescription('Unrank')
        .setThumbnail("https://imgur.com/PvLQN8r.png")
        .addFields(
            { name: 'Win/Loss', value: `**${win_}%**\nWin **${wins}**\nLoss **${losses}**`, inline: true },
            { name: 'K/D', value: `**${kd}**\nKills **${kills}**\nDeaths **${deaths}**`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Time Played', value: `**${timePlayed}**`, inline: true },
            { name: 'Kill/Match', value: `**${killsMatch}**\nMatches **${matches}**`, inline: true },
        )
        .setTimestamp();

    return trackerEmbed;
}