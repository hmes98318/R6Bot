const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('r6_stats')
		.setDescription('r6 stats Rank, Casual, General')
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
		.addStringOption(option =>
			option.setName('mode')
				.setDescription('game mode Rank, Casual, General')
				.setRequired(true)
				.addChoice('rank', 'RANK')
				.addChoice('casual', 'CASUAL')
				.addChoice('general', 'GENERAL'))
	,
	async execute(interaction) {
	}
};