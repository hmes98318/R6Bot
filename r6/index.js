const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents, Collection } = require('discord.js');

const R6 = require('./r6.js');
const embed = require('./embed.js');
const tracker = require('./tracker.js');
const config = require('../config.json');


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });




module.exports = function (TOKEN, CLIENT_ID, GUILD_ID, PREFIX) {
    client.login(TOKEN);


    client.on('ready', () => {
        //console.log(`Logged in as ${client.user.tag}`);
        console.log(`txt command is ready`);
    });

    if (config.Slash_Commands) {

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


        client.once('ready', () => {
            //console.log(`Logged in as ${client.user.tag}`);
            console.log(`slash command is ready`);

            const rest = new REST({ version: '9' })
                .setToken(TOKEN);
            (async () => {
                try {
                    if (config.load_Slash_Global) {
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

    if (config.Txt_Commands) {

        client.on("messageCreate", async message => {

            let args = message.content.toUpperCase().split(' ');

            if (args[0] === `${PREFIX}R6`) {

                let profile = [];
                let operators = [];
                let header;

                let gameplatform = message.content.split(' ')[1]
                let r6name = message.content.split(' ')[2];
                let url_profile = `https://r6.tracker.network/profile/${gameplatform}/${r6name}`;
                let url_operators = `https://r6.tracker.network/profile/${gameplatform}/${r6name}/operators`;

                message.channel.sendTyping();

                if (args[1] === "HELP") { // +R6 help
                    console.log("HELP");
                    return message.channel.send({ embeds: [embed.R6_help()] });
                }

                else if (args[1] !== "PC" && args[1] !== "XBOX" && args[1] !== "PSN" && args[1] !== "PS4" && args[1] !== "PS5") {
                    console.log("PLATFORM_ERROR"); // if enter platform not pc/xbox/osn
                    return message.channel.send({ embeds: [embed.R6_help_platform()] });
                }

                else if (args[3] === "OPERATOR") { // +R6 [platform] [name] operator ash/lesion...
                    console.log("OPERATORS");
                    if (R6.OperatorCheck(args[4])) {
                        operators = await tracker.Operators(operators, url_operators);
                        R6.R6_record(header, r6name, url_profile, profile);
                        return message.channel.send({ embeds: [R6.Operators(operators, args[4])] });
                    }
                    else {
                        return message.channel.send({ embeds: [embed.R6_help_operators()] });
                    }
                }

                else if (args[2] && (!args[3] || args[3] === "RANK" || args[3] === "CASUAL")) { // +R6 [platform] [name]  || +R6 [platform] [name] rank/casual

                    profile = await tracker.Profile(profile, url_profile);
                    header = await tracker.Header(header, url_profile);
                    R6.R6_record(header, r6name, url_profile, profile);

                    if (profile.length) { //Check if the searched player is correct (exists)
                        if (args[3] === "RANK") {
                            console.log("PROFILE_RANK");
                            return message.channel.send({ embeds: [R6.Rank(profile)] });
                        }
                        else if (args[3] === "CASUAL") {
                            console.log("PROFILE_CASUAL");
                            return message.channel.send({ embeds: [R6.Casual(profile)] });
                        }
                        else { // GENERAL
                            console.log("PROFILE_GENERAL");
                            return message.channel.send({ embeds: [R6.General(profile)] });
                        }
                    }
                    else {
                        console.log("PROFILE_NOT_FOUND");
                        return message.channel.send({ embeds: [embed.R6_Not_Found()] });
                    }
                }
                else if (args[2] && args[3]) {
                    console.log("FORMAT_ERROR");
                    return message.channel.send({ embeds: [embed.R6_help()] });
                }
                else {
                    console.log("NOT_FOUND");
                    return message.channel.send({ embeds: [embed.R6_Not_Found()] });
                }
            }
        })
    }


}
