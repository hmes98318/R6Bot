const Discord = require('discord.js');
const color = require('../../../config.json').COLOR;

module.exports = function (profile) {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(`Open ${profile.name} profile`)
        .setURL(profile.url)
        .setAuthor({ name: profile.name, iconURL: profile.header, url: profile.url })
        .setDescription('Rank')
        .setThumbnail(profile.rank_img)
        .addFields(
            { name: 'Ranked', value: `**${profile.rank}**`, inline: true },
            { name: 'MMR', value: `**${profile.mmr}**`, inline: true },
            { name: 'Time Played', value: `**${profile.time_played}**`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Win/Loss', value: `**${profile.win_}**\nWins **${profile.wins}**\nLosses **${profile.losses}**`, inline: true },
            { name: 'K/D', value: `**${profile.kd}**\nKills **${profile.kills}**\nDeaths **${profile.deaths}**`, inline: true },
            { name: 'Kills/Match', value: `**${profile.kills_match}**`, inline: true },
        )
        .setTimestamp();

    return trackerEmbed;
}