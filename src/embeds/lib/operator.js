const Discord = require('discord.js');
const color = require('../../../config.json').COLOR;

module.exports = function (profile) {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(`Open ${profile.name} profile`)
        .setURL(profile.url)
        .setAuthor({ name: profile.name, iconURL: profile.header, url: profile.url })
        .setDescription(`Operator ${profile.operator}`)
        .setThumbnail(profile.operator_img)
        .addFields(
            { name: 'Win/Loss', value: `**${profile.win_}**\nWins **${profile.wins}**\nLosses **${profile.losses}**`, inline: true },
            { name: 'K/D', value: `**${profile.kd}**\nKills **${profile.kills}**\nDeaths **${profile.deaths}**`, inline: true },
            { name: 'Time Played', value: `**${profile.time_played}**`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Head Shot', value: `**${profile.headshots_}**`, inline: true },
            { name: 'Melee Kills', value: `**${profile.melee_kills}**`, inline: true },
            { name: 'Operator Stat', value: `**${profile.operator_stat}**\nXP **${profile.xp}**`, inline: true },
        )
        .setTimestamp();

    return trackerEmbed;
}