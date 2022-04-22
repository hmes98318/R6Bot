const Discord = require('discord.js');

module.exports = function () {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor('#ff00ee')
        .addFields(
            { name: 'R6 Tracker', value: `+r6 [pc/xbox/psn] [name] [casual/rank]`, inline: true },
            { name: 'example:', value: `+r6 pc waifu\\_-.\n+r6 psn Killermcn rank\n+r6 xbox SSkyte casual\n+r6 pc waifu\\_-. operator ash`, inline: false },
        )

    return trackerEmbed;
}