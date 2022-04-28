const { SlashCommandBuilder } = require('@discordjs/builders');

const embed = require('../embeds/embeds.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('r6 help')
    ,
    async execute(interaction) {
        interaction.reply({ embeds: [embed.Help()] });
    }
};
