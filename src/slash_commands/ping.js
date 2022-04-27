const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong'),
	async execute(interaction, client) {
		interaction.reply({ content: `Ping : ${client.ws.ping}ms.` })
	}
};
