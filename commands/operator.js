const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('r6_operators')
        .setDescription('r6 operator stats')
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('game platform')
                .setRequired(true)
                .addChoice('pc', 'PC')
                .addChoice('psn', 'PSN')
                .addChoice('xbox', 'XBOX'))
        .addStringOption(option => option.setName('name')
            .setDescription('player name')
            .setRequired(true))
        .addStringOption(option => option.setName('operator')
            .setDescription('operator name')
            .setRequired(true))
    ,
    async execute(interaction) {
    }
};