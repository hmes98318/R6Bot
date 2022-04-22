const Discord = require('discord.js');

module.exports = function (header, name, url, timePlayed, win_, wins, losses, kd, kills, deaths, headshot_, headshots, meleeKills, blindKills) {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor('#ff00ee')
        .setTitle(`Open ${name} Profile`)
        .setURL(url)
        .setAuthor({ name: name, iconURL: header, url: url })
        .setDescription('General')
        .setThumbnail(header)
        .addFields(
            { name: 'Win/Loss', value: `**${win_}**\nWin **${wins}**\nLoss **${losses}**`, inline: true },
            { name: 'K/D', value: `**${kd}**\n\Kills **${kills}**\n\Death **${deaths}**`, inline: true },
            { name: 'Time Played', value: `**${timePlayed}**`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Head Shot', value: `**${headshot_}**\nHead Shots **${headshots}**`, inline: true },
            { name: 'Melee Kills', value: `**${meleeKills}**`, inline: true },
            { name: 'Blind Kills', value: `**${blindKills}**`, inline: true },
        )
        .setTimestamp();

    return trackerEmbed;
}