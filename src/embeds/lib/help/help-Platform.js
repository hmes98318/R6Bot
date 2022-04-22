const Discord = require('discord.js');
const config = require('../../../../config.json');

const prefix = config.PREFIX;

module.exports = function () {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor(config.COLOR)
        .addFields(
            { name: 'R6 Tracker', value: `${prefix}r6 [pc/xbox/psn] [name] [casual/rank]`, inline: true },
            { name: 'example:', value: `${prefix}r6 pc waifu\\_-.\n${prefix}r6 psn Killermcn rank\n${prefix}r6 xbox SSkyte casual\n${prefix}r6 pc waifu\\_-. operator ash`, inline: false },
        )

    return trackerEmbed;
}