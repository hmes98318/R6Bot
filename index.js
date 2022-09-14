const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');

const R6 = require('r6s-stats-api');
const embeds = require('./src/embeds/embeds.js');

require('dotenv').config();
const config = require('./config.json');




const client = new Client({
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildBans,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
  });

const TOKEN = process.env.TOKEN;
client.login(TOKEN);




client.on('ready', () => {
    console.log(`-- Logged in as ${client.user.tag} --`);
    console.log(`text command is ready`);
    client.user.setActivity(`${config.PREFIX}r6 help`);


    if (config.SLASH_COMMANDS) {
        const CLIENT_ID = client.user.id;
        const GUILD_ID = config.GUILD_ID;

        // Loading commands from the commands folder
        const commands = [];
        const commandFiles = fs.readdirSync('./src/slash_commands').filter(file => file.endsWith('.js'));


        // Creating a collection for commands in client
        client.commands = new Collection();

        for (const file of commandFiles) {
            const command = require(`./src/slash_commands/${file}`);
            commands.push(command.data.toJSON());
            client.commands.set(command.data.name, command);
        }


        const rest = new REST({ version: '9' })
            .setToken(TOKEN);
        (async () => {
            try {
                if (config.LOAD_SLASH_GLOBAL) {
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
        console.log(`slash command is ready`);
    }
});




client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction, client);
    } catch (error) {
        if (error) console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command', ephemeral: true });
    }
});


client.on("messageCreate", async message => {

    if (message.author.bot) return; // if the message sender is bot

    if (message.content.indexOf(config.PREFIX) !== 0) return; // if the config.PREFIX not in message.content[0]


    let args = message.content.slice(config.PREFIX.length).trim().split(/ +/g);
    let first_element = args.shift();

    if (first_element.toUpperCase() === "R6") {
        message.channel.sendTyping();

        if (!args[0])
            return message.channel.send({ embeds: [embeds.Help()] });

        let option = args[0].toUpperCase();

        if (option === "HELP") { // +R6 help
            console.log("HELP");
            return message.channel.send({ embeds: [embeds.Help()] });
        }

        if (option !== "PC" && option !== "XBOX" && option !== "PSN" && option !== "PS4" && option !== "PS5") {
            if (config.ENABLE_DEFAULT_PLATFORM) { // enble default platform
                args.splice(0, 0, config.DEFAULT_PLATFORM);
            }
            else {
                console.log("PLATFORM_ERROR"); // if enter platform not pc/xbox/osn
                return message.channel.send({ embeds: [embeds.Help_platform()] });
            }
        }


        let input_platform = args[0];
        let input_name = args[1];
        let input_gamemode = args[2];
        let input_operator = args[3];

        //console.log("args:", args);
        //console.log("input_platform:", input_platform);
        //console.log("input_name:", input_name);
        //console.log("input_gamemode:", input_gamemode);
        //console.log("input_operator:", input_operator);


        if (!input_gamemode) {
            console.log("GENERAL");
            let profile = await R6.general(input_platform, input_name);
            //console.log(profile);

            if (profile.header)
                return message.channel.send({ embeds: [embeds.General(profile)] });
            else
                return message.channel.send({ embeds: [embeds.Help_Not_Found()] });
        }


        if (input_gamemode.toUpperCase() === "CASUAL") {
            console.log("CASUAL");
            let profile = await R6.casual(input_platform, input_name);
            //console.log(profile);

            if (profile.header)
                return message.channel.send({ embeds: [embeds.Casual(profile)] });
            else
                return message.channel.send({ embeds: [embeds.Help_Not_Found()] });
        }

        else if (input_gamemode.toUpperCase() === "RANK") {
            console.log("RANK");
            let profile = await R6.rank(input_platform, input_name);
            //console.log(profile);

            if (profile.header)
                return message.channel.send({ embeds: [embeds.Rank(profile)] });
            else
                return message.channel.send({ embeds: [embeds.Help_Not_Found()] });
        }
/*
        else if (input_gamemode.toUpperCase() === "UNRANK") {
            console.log("UNRANK");
            let profile = await R6.unrank(input_platform, input_name);
            //console.log(profile);

            if (profile.header)
                return message.channel.send({ embeds: [embeds.Unrank(profile)] });
            else
                return message.channel.send({ embeds: [embeds.Help_Not_Found()] });
        }
*/
        else if (input_gamemode.toUpperCase() === "DEATHMATCH") {
            console.log("DEATHMATCH");
            let profile = await R6.deathmatch(input_platform, input_name);
            //console.log(profile);

            if (profile.header)
                return message.channel.send({ embeds: [embeds.Deathmatch(profile)] });
            else
                return message.channel.send({ embeds: [embeds.Help_Not_Found()] });
        }

        else if (input_gamemode.toUpperCase() === "OPERATOR") {
            console.log("OPERATOR");

            if (!input_operator)
                return message.channel.send({ embeds: [embeds.Help_operator()] });

            let profile = await R6.operator(input_platform, input_name, input_operator);
            //console.log(profile);

            if (profile.header)
                return message.channel.send({ embeds: [embeds.Operator(profile)] });
            else if (profile === "OPERATOR_ERROR")
                return message.channel.send({ embeds: [embeds.Help_operator(profile)] });
            else
                return message.channel.send({ embeds: [embeds.Help_Not_Found()] });
        }

        else
            return message.channel.send({ embeds: [embeds.Help()] });
    }
})
