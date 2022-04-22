const Discord = require('discord.js');

module.exports = function (header, name, url, operator, timePlayed, kills, deaths, kd, wins, losses, win_, headshot_, DBNOs, XP, meleeKills, operatorStat) {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor('#ff00ee')
        .setTitle(`Open ${name} Profile`)
        .setURL(url)
        .setAuthor({ name: name, iconURL: header, url: url })
        .setDescription(`Operator: ${operator}`)
        .setThumbnail(header)
        .addFields(
            { name: 'Win/Loss', value: `**${win_}**\nWin**${wins}**\nLoss **${losses}**`, inline: true },
            { name: 'K/D', value: `**${kd}**\nKills **${kills}**\nDeath **${deaths}**`, inline: true },
            { name: 'Time Played', value: `**${timePlayed}**`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Head Shot', value: `**${headshot_}**`, inline: true },
            { name: 'Melee Kills', value: `**${meleeKills}**`, inline: true },
            { name: 'Operator Stat', value: `**${operatorStat}**\nXP **${XP}**`, inline: true },
        )
        .setTimestamp();

    return trackerEmbed;
}