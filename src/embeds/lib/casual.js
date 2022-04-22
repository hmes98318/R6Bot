const Discord = require('discord.js');

module.exports = function (header, name, url, timePlayed, win_, wins, losses, kd, kills, deaths, killsMatch, rank, mmr, rank_img) {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor('#ff00ee')
        .setTitle(`Open ${name} Profile`)
        .setURL(url)
        .setAuthor({ name: name, iconURL: header, url: url })
        .setDescription('Casual')
        .setThumbnail(rank_img)
        .addFields(
            { name: 'Win/Loss', value: `**${win_}%**\nWin **${wins}**\nLoss **${losses}**`, inline: true },
            { name: 'K/D', value: `**${kd}**\nKills **${kills}**\nDeath **${deaths}**`, inline: true },
            { name: 'Ranked', value: `**${rank}**`, inline: true },

            { name: '\u200B', value: '\u200B' },
            { name: 'Time Played', value: `**${timePlayed}**`, inline: true },
            { name: 'Kill/Match', value: `**${killsMatch}**`, inline: true },
            { name: 'MMR', value: `**${mmr}**`, inline: true },
        )
        .setTimestamp();

    return trackerEmbed;
}