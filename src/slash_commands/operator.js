const { SlashCommandBuilder } = require('@discordjs/builders');

const R6 = require('r6s-stats-api');
const embed = require('../embeds/embeds.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('r6_operators')
        .setDescription('r6 operator stats')
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('game platform')
                .setRequired(true)
                .addChoice('pc', 'pc')
                .addChoice('psn', 'psn')
                .addChoice('xbox', 'xbox'))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('player name')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('operator')
                .setDescription('operator name')
                .setRequired(true))
    ,
    async execute(interaction) {
        await interaction.deferReply();

        let platform = interaction.options.getString("platform");
        let name = interaction.options.getString("name").replace(/\s/g, '%20');
        let operator = interaction.options.getString("operator");

        let profile = [];
        let operators = [];
        let header;
        let url_profile = `https://r6.tracker.network/profile/${platform}/${name}`;
        let url_operators = `https://r6.tracker.network/profile/${platform}/${name}/operators`;

        if (R6.OperatorCheck(operator.toUpperCase())) {
            operators = await tracker.Operators(operators, url_operators);
            R6.R6_record(header, name, url_profile, profile);

            return await interaction.editReply({ embeds: [R6.Operators(operators, operator.toUpperCase())] });
        }
        else {
            return await interaction.editReply({ embeds: [embed.R6_help_operators()] });
        }
    }
};
