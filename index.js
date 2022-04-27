const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents, Collection } = require('discord.js');

const R6 = require('r6s-stats-api');
const embeds = require('./src/embeds/embeds.js');

require('dotenv').config();
const config = require('./config.json');




const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

client.login(process.env.TOKEN);




client.on('ready', () => {
    //console.log(`Logged in as ${client.user.tag}`);
    console.log(`txt command is ready`);
});


client.on("messageCreate", async message => {

    if (message.author.bot) // if the message sender is bot
        return;

    if (message.content.indexOf(config.PREFIX) !== 0) // if the config.PREFIX not in message.content[0]
        return;


    let args = message.content.slice(config.PREFIX.length).trim().split(/ +/g);
    let first_element = args.shift();

    if (first_element.toUpperCase() === "R6") {
        message.channel.sendTyping();

        if(!args[0])
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

        console.log("args:", args);
        console.log("input_platform:", input_platform);
        console.log("input_name:", input_name);
        console.log("input_gamemode:", input_gamemode);
        console.log("input_operator:", input_operator);


        if (!input_gamemode) {
            console.log("GENERAL");
            let profile = await R6.general(input_platform, input_name);
            console.log(profile);

            if (profile === "NOT_FOUND")
                return message.channel.send({ embeds: [embeds.Help_Not_Found()] });
            else//                                                            header,         user,         url,          timePlayed,  win_percent,          win,           loss,         kd,          kill,         deaths,          headshot,         headShots,          meleekills,          blindkills
                return message.channel.send({ embeds: [embeds.General(profile.header, profile.name, profile.url, profile.time_played, profile.win_, profile.wins, profile.losses, profile.kd, profile.kills, profile.deaths, profile.headshot_, profile.headshots, profile.melee_kills, profile.blind_kills)] });
        }


        if (input_gamemode.toUpperCase() === "CASUAL") {
            console.log("CASUAL");
            let profile = await R6.casual(input_platform, input_name);
            console.log(profile);

            if (profile === "NOT_FOUND")
                return message.channel.send({ embeds: [embeds.Help_Not_Found()] });
            else//                                                           header,         user,         url,          timePlayed,  win_percent,          win,           loss,         kd,          kill,          deaths,           killMatch,         rank,         mmr,         rank_img
                return message.channel.send({ embeds: [embeds.Casual(profile.header, profile.name, profile.url, profile.time_played, profile.win_, profile.wins, profile.losses, profile.kd, profile.kills, profile.deaths, profile.kills_match, profile.rank, profile.mmr, profile.rank_img)] });
        }

        else if (input_gamemode.toUpperCase() === "RANK") {
            console.log("RANK");
            let profile = await R6.rank(input_platform, input_name);
            console.log(profile);

            if (profile === "NOT_FOUND")
                return message.channel.send({ embeds: [embeds.Help_Not_Found()] });
            else//                                                         header,         name,         url,          timePlayed,         win_,         wins,         losses,         kd,         kills,         deaths,          killsMatch,         rank,         mmr,         rank_img
                return message.channel.send({ embeds: [embeds.Rank(profile.header, profile.name, profile.url, profile.time_played, profile.win_, profile.wins, profile.losses, profile.kd, profile.kills, profile.deaths, profile.kills_match, profile.rank, profile.mmr, profile.rank_img)] });
        }

        else if (input_gamemode.toUpperCase() === "UNRANK") {
            console.log("UNRANK");
            let profile = await R6.unrank(input_platform, input_name);
            console.log(profile);

            if (profile === "NOT_FOUND")
                return message.channel.send({ embeds: [embeds.Help_Not_Found()] });
            else
                return message.channel.send({ embeds: [embeds.Unrank(profile.header, profile.name, profile.url, profile.time_played, profile.win_, profile.wins, profile.losses, profile.kd, profile.kills, profile.deaths, profile.kills_match, profile.matches)] });
        }

        else if (input_gamemode.toUpperCase() === "DEATHMATCH") {
            console.log("DEATHMATCH");
            let profile = await R6.deathmatch(input_platform, input_name);
            console.log(profile);

            if (profile === "NOT_FOUND")
                return message.channel.send({ embeds: [embeds.Help_Not_Found()] });
            else
                return message.channel.send({ embeds: [embeds.Deathmatch(profile.header, profile.name, profile.url, profile.win_, profile.wins, profile.losses, profile.kd, profile.kills, profile.deaths, profile.kills_match, profile.matches, profile.abandons, profile.rank, profile.mmr, profile.rank_img)] });
        }

        else if (input_gamemode.toUpperCase() === "OPERATOR") {
            console.log("OPERATOR");

            if (!input_operator)
                return message.channel.send({ embeds: [embeds.Help_operator()] });

            let profile = await R6.operator(input_platform, input_name, input_operator);
            console.log(profile);

            if (profile === "NOT_FOUND")
                return message.channel.send({ embeds: [embeds.Help_Not_Found()] });
            else//                                                                            header,         user,         url,         operator,          timePlayed,          kill,          deaths,         kd,          win,           loss, win_percent,            headshot,         DBNOs,         XP,          meleekills,         operatorStat
                return message.channel.send({ embeds: [embeds.Operator(profile.operator_img, profile.name, profile.url, profile.operator, profile.time_played, profile.kills, profile.deaths, profile.kd, profile.wins, profile.losses, profile.win_, profile.headshots_, profile.dbnos, profile.xp, profile.melee_kills, profile.operator_stat)] });
        }

        else
            return message.channel.send({ embeds: [embeds.Help()] });
    }
})


























