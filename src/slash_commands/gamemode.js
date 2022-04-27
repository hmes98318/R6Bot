const { SlashCommandBuilder } = require('@discordjs/builders');

const R6 = require('r6s-stats-api');
const embed = require('../embeds/embeds.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('r6_stats')
		.setDescription('r6 stats Rank, Casual, General')
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
			option.setName('mode')
				.setDescription('game mode Rank, Casual, General')
				.setRequired(true)
				.addChoice('general', 'GENERAL')
				.addChoice('casual', 'CASUAL')
				.addChoice('rank', 'RANK')
				.addChoice('unrank', 'UNRANK')
				.addChoice('deathmatch', 'DEATHMATCH')
)
	,
	async execute(interaction) {
		await interaction.deferReply();

		let platform = interaction.options.getString("platform");
		let name = interaction.options.getString("name").replace(/\s/g, '%20');
		let mode = interaction.options.getString("mode");




		if (profile.length) {
			if (mode === "RANK") {
				return await interaction.editReply({ embeds: [R6.rank(profile)] });
			}
			else if (mode === "CASUAL") {
				return await interaction.editReply({ embeds: [R6.casual(profile)] });
			}
			else if (mode === "GENERAL") {
				return await interaction.editReply({ embeds: [R6.general(profile)] });
			}
		}
		else {
			return await interaction.editReply({ embeds: [embed.Help_Not_Found()] });
		}
	}
};
