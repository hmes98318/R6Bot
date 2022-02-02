const { SlashCommandBuilder } = require('@discordjs/builders');

const R6 = require('../r6.js');
const tracker = require('../tracker.js');
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
				.addChoice('rank', 'RANK')
				.addChoice('casual', 'CASUAL')
				.addChoice('general', 'GENERAL'))
	,
	async execute(interaction) {
		await interaction.deferReply();

		let platform = interaction.options.getString("platform");
		let name = interaction.options.getString("name").replace(/\s/g, '%20');
		let mode = interaction.options.getString("mode");

		let profile = [];
		let header;
		let url_profile = `https://r6.tracker.network/profile/${platform}/${name}`;

		profile = await tracker.Profile(profile, url_profile);
		header = await tracker.Header(header, url_profile);
		R6.R6_record(header, name, url_profile, profile);

		if (profile.length) {
			if (mode === "RANK") {
				return await interaction.editReply({ embeds: [R6.Rank(profile)] });
			}
			else if (mode === "CASUAL") {
				return await interaction.editReply({ embeds: [R6.Casual(profile)] });
			}
			else if (mode === "GENERAL") {
				return await interaction.editReply({ embeds: [R6.General(profile)] });
			}
		}
		else {
			return await interaction.editReply({ embeds: [embed.R6_Not_Found()] });
		}
	}
};
