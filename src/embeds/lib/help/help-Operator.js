const Discord = require('discord.js');
const config = require('../../../../config.json');

const prefix = config.PREFIX;

module.exports = function () {
    const trackerEmbed = new Discord.EmbedBuilder()
        .setColor(config.COLOR)
        .addFields(
            {
                name: config.name, value:
                `ace, thermite, ash ,sledge, fuze, amaru, glaz, 
                zofia, thatcher, capitao, buck, blackbeard, ying, 
                nomad, finka, kali, hibana, montagne, lion, blitz, 
                twitch, nakk, flores, iana, maverick, gridlock, iq, 
                zero, dokkaebi, jackal,lesion, caveira, wamai, doc, 
                ela, bandit, mira, frost, smoke, thunderbird, alibi, 
                valkyrie, kaid, aruni, melusi, rook, mute, jager, 
                castle, tachanka, pulse, kapkan, clash, echo, vigil, 
                maestro, goyo, oryx, mozzie, warden, osa`, inline: true
            },
            { name: 'example:', value: `${prefix}r6 pc waifu\\_-. operator ash`, inline: false },
        )

    return trackerEmbed;
}