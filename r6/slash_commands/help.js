const { SlashCommandBuilder } = require('@discordjs/builders');

const embed = require('../embed.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('r6 help')
    ,
    async execute(interaction) {
        interaction.reply({ embeds: [embed.R6_help()] });
    }
};
