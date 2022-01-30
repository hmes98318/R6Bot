const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents, Collection } = require('discord.js');


const client = new Client({ intents: [Intents.FLAGS.GUILDS] });




module.exports = async function (TOKEN, CLIENT_ID, GUILD_ID) {

    client.login(TOKEN);


    // Loading commands from the commands folder
    const commands = [];
    const commandFiles = fs.readdirSync('./r6/slash_commands').filter(file => file.endsWith('.js'));


    // Creating a collection for commands in client
    client.commands = new Collection();

    for (const file of commandFiles) {
        const command = require(`./slash_commands/${file}`);
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
    }


    // When the client is ready, run this code (only once)
    client.once('ready', () => {
        //console.log(`Logged in as ${client.user.tag}`);
        console.log(`slash command is ready`);

        const rest = new REST({ version: '9' })
            .setToken(TOKEN);
        (async () => {
            try {
                if (!GUILD_ID) {
                    await rest.put(
                        Routes.applicationCommands(CLIENT_ID),
                        { body: commands },
                    );
                    console.log('Successfully registered application commands globally');
                }
                else {
                    await rest.put(
                        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
                        { body: commands },
                    );
                    console.log('Successfully registered application commands for development guild');
                }
            } catch (error) {
                if (error) console.error(error);
            }
        })();
    });


    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            if (error) console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command', ephemeral: true });
        }
    });
}
