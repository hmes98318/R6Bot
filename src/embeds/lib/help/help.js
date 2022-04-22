const Discord = require('discord.js');

module.exports = function () {
    const trackerEmbed = new Discord.MessageEmbed()
        .setColor('#ff00ee')
        .addFields(
            { name: 'R6 Tracker', value: `**General :** +r6 [pc/xbox/psn] [name]\n**Rank :** +r6 [pc/xbox/psn] [name] rank\n**Casual :** +r6 [pc/xbox/psn] [name] casual\n**Operators :** +r6 [pc/xbox/psn] [name] operator [name]`, inline: true },
            { name: 'example:', value: `+r6 pc waifu\\_-.\n+r6 pc waifu\\_-. rank\n+r6 pc waifu\\_-. casual\n+r6 pc waifu\\_-. operator ash`, inline: false },
        )

    return trackerEmbed;
}