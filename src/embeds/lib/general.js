const Discord = require('discord.js');
const color = require('../../../config.json').COLOR;

module.exports = function (profile) {
    const trackerEmbed = new Discord.EmbedBuilder()
        .setColor(color)
        .setTitle(`Open ${profile.name} profile`)
        .setURL(profile.url)
        .setAuthor({ name: profile.name, iconURL: profile.header, url: profile.url })
        .setDescription('General')
        .setThumbnail(profile.header)
        .addFields(
            { name: 'Level', value: `**${profile.level}**`, inline: true },
            { name: 'Time Played', value: `**${profile.time_played}**`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Win/Loss', value: `**${profile.win_}**\nWins **${profile.wins}**\nLosses **${profile.losses}**`, inline: true },
            { name: 'K/D', value: `**${profile.kd}**\n\Kills **${profile.kills}**\n\Deaths **${profile.deaths}**`, inline: true },
            { name: 'Head Shot', value: `**${profile.headshot_}**\nHead Shots **${profile.headshots}**`, inline: true },
            { name: '\u200B', value: '\u200B' },
        )
        .setTimestamp();

    return trackerEmbed;
}