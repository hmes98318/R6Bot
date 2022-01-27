const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents, Collection } = require('discord.js');

const config = require('./config.json');
const R6 = require('./r6/r6.js');
const embed = require('./r6/embed.js');
const tracker = require('./r6/tracker.js');


const TOKEN = config.TOKEN;
const GUILD_ID = config.GUILD_ID;
const CLIENT_ID = config.CLIENT_ID;


const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.login(TOKEN);




// Loading commands from the commands folder
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


// Creating a collection for commands in client
client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}




// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    const rest = new REST({ version: '9' })
        .setToken(TOKEN);
    (async () => {
        try {
            await rest.put(
                //Routes.applicationCommands(CLIENT_ID), //globally
                Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), // only one server(GUILD_ID)
                { body: commands },
            );
            console.log('Successfully registered application commands for development guild');
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

