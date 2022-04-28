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
				.setDescription('game mode General, Casual, Rank, Unrank, Deathmatch')
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



		if (mode === "GENERAL") {
			let profile = await R6.general(platform, name);
			if (profile.header)
				return await interaction.editReply({ embeds: [embed.General(profile)] });
		}
		else if (mode === "CASUAL") {
			let profile = await R6.casual(platform, name);
			if (profile.header)
				return await interaction.editReply({ embeds: [embed.Casual(profile)] });
		}
		else if (mode === "RANK") {
			let profile = await R6.rank(platform, name);
			if (profile.header)
				return await interaction.editReply({ embeds: [embed.Rank(profile)] });
		}
		else if (mode === "UNRANK") {
			let profile = await R6.unrank(platform, name);
			if (profile.header)
				return await interaction.editReply({ embeds: [embed.Unrank(profile)] });
		}
		else if (mode === "DEATHMATCH") {
			let profile = await R6.deathmatch(platform, name);
			if (profile.header)
				return await interaction.editReply({ embeds: [embed.Deathmatch(profile)] });
		}

		return await interaction.editReply({ embeds: [embed.Help_Not_Found()] });
	}
};
