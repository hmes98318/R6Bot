const Discord = require('discord.js');
const config = require('../../../../config.json');

const prefix = config.PREFIX;

module.exports = function () {
    const trackerEmbed = new Discord.EmbedBuilder()
        .setColor(config.COLOR)
        .addFields(
            { name: config.name, value: `**General :** ${prefix}r6 [pc/xbox/psn] [name]\n**Casual :** ${prefix}r6 [pc/xbox/psn] [name] casual\n**Rank :** ${prefix}r6 [pc/xbox/psn] [name] rank\n**Deathmatch :** ${prefix}r6 [pc/xbox/psn] [name] deathmatch\n**Operators :** ${prefix}r6 [pc/xbox/psn] [name] operator [name]`, inline: true },
            { name: 'example:', value: `${prefix}r6 pc waifu\\_-.\n${prefix}r6 pc waifu\\_-. casual\n${prefix}r6 pc waifu\\_-. rank\n${prefix}r6 pc waifu\\_-. deathmatch\n${prefix}r6 pc waifu\\_-. operator ash`, inline: false },
        )

    return trackerEmbed;
}