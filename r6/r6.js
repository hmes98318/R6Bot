const Discord = require('discord.js');
var request = require("request");
var cheerio = require("cheerio");
var embed = require('./embed.js');
var record = require('./r6_record');


module.exports = {
    R6_type: function (type, r6name, newTracker) {
        if (newTracker[42] !== undefined && newTracker[44] !== undefined) { //檢查搜尋到的玩家是否正確(存在)

            if (type === 'RANK' && r6name !== undefined) { //season RANK [42]-[53]
                console.log('RANK')
                //header, user, url, win_percent, win, loss, kd, kill, death, killMatch, rank, mmr, rank_img
                return embed.R6_Ranked_Embed(record.header, record.user, record.url, record.RANK_win_percent, record.RANK_win, record.RANK_loss, record.RANK_kd, record.RANK_kill, record.RANK_death, record.RANK_killMatch, record.RANK_rank, record.RANK_mmr, record.RANK_rank_img)
            }
            else if (type === 'CASUAL' && r6name !== undefined) { //casual [32]-[41]
                console.log('CASUAL')
                if (record.CASUAL_rank == undefined) {
                    //casual havent played RANK
                    return embed.R6_Casual_Embed(record.header, record.user, record.url, record.CASUAL_timePlayed, record.CASUAL_win_percent, record.CASUAL_win, record.CASUAL_loss, record.CASUAL_kd, record.CASUAL_kill, record.CASUAL_death, record.CASUAL_killMatch, record.CASUAL_NO_RANK_rank, record.CASUAL_NO_RANK_mmr, record.CASUAL_NO_RANK_rank_img)
                }
                else {
                    //header, user, url, timePlayed, win_percent, win, loss, kd, kill, death, killMatch, rank, mmr, rank_img
                    return embed.R6_Casual_Embed(record.header, record.user, record.url, record.CASUAL_timePlayed, record.CASUAL_win_percent, record.CASUAL_win, record.CASUAL_loss, record.CASUAL_kd, record.CASUAL_kill, record.CASUAL_death, record.CASUAL_killMatch, record.CASUAL_rank, record.CASUAL_mmr, record.CASUAL_rank_img)
                }
            }
            else if (type === undefined) { //general [0]-[11]
                console.log('GENERAL')
                //header, user, url, timePlayed, win_percent, win, loss, kd, death, handShot, handShots, meleeKills, blindKills 
                return embed.R6_General_Embed(record.header, record.user, record.url, record.GENERAL_timePlayed, record.GENERAL_win_percent, record.GENERAL_win, record.GENERAL_loss, record.GENERAL_kd, record.GENERAL_death, record.GENERAL_handShot, record.GENERAL_handShots, record.GENERAL_meleeKills, record.GENERAL_blindKills)
            }
        }
        else if (r6name === 'HELP' || r6name === 'help') {//不是則檢測是否為 +r6 help
            console.log('HELP')
            return embed.R6_help()
        }
        else{
            console.log('Not Found')
            return embed.R6_Not_Found()
        }
    },

    filterArray: function (clearArray) {
        let index = -1,
            arrayLength = clearArray ? clearArray.length : 0,
            resIndex = -1,
            result = [];

        while (++index < arrayLength) {
            let value = clearArray[index];
            if (value != null && value !== '' && value !== undefined && value !== false && value !== 0 && value != ',') {
                result[++resIndex] = value;
            }
        }
        return result
    },

    R6_record: function (header, r6name, url, newTracker) {

        record.header = header;
        record.user = r6name;
        record.url = url;
        //season RANK [42]-[53]
        record.RANK_win_percent = newTracker[46];
        record.RANK_win = newTracker[47];
        record.RANK_loss = newTracker[48];
        record.RANK_kd = newTracker[42];
        record.RANK_kill = newTracker[44];
        record.RANK_death = newTracker[45];
        record.RANK_killMatch = newTracker[43];
        record.RANK_rank = newTracker[51];
        record.RANK_mmr = String(newTracker[52]);
        record.RANK_rank_img = `https://cdn.tabstats.com/tabstats/r6/ranks/?rank=${RankImage(newTracker[51])}&champ=0`;
        //casual [32]-[41]
        record.CASUAL_timePlayed = newTracker[32];
        record.CASUAL_win_percent = newTracker[38];
        record.CASUAL_win = newTracker[33];
        record.CASUAL_loss = newTracker[34];
        record.CASUAL_kd = newTracker[39];
        record.CASUAL_kill = newTracker[37];
        record.CASUAL_death = newTracker[36];
        record.CASUAL_killMatch = newTracker[40];
        record.CASUAL_rank = newTracker[62];
        record.CASUAL_mmr = String(newTracker[64]);
        record.CASUAL_rank_img = `https://cdn.tabstats.com/tabstats/r6/ranks/?rank=${RankImage(newTracker[62])}&champ=0`;
        //casual no RANK 
        record.CASUAL_NO_RANK_rank = newTracker[50];
        record.CASUAL_NO_RANK_mmr = String(newTracker[52]);
        record.CASUAL_NO_RANK_rank_img = `https://cdn.tabstats.com/tabstats/r6/ranks/?rank=${RankImage(newTracker[50])}&champ=0`;
        //general [0]-[11]
        record.GENERAL_timePlayed = newTracker[7];
        record.GENERAL_win_percent = newTracker[6];
        record.GENERAL_win = newTracker[4];
        record.GENERAL_loss = newTracker[5];
        record.GENERAL_kd = newTracker[1];
        record.GENERAL_death = newTracker[2];
        record.GENERAL_handShot = newTracker[0];
        record.GENERAL_handShots = newTracker[3];
        record.GENERAL_meleeKills = newTracker[10];
        record.GENERAL_blindKills = newTracker[11];
    },
}



function RankImage(Img) {

    if (String(Img) == 'COPPER V') return '1';
    else if (String(Img) == 'COPPER IV') return '2';
    else if (String(Img) == 'COPPER III') return '3';
    else if (String(Img) == 'COPPER II') return '4';
    else if (String(Img) == 'COPPER I') return '5';
    else if (String(Img) == 'BRONZE III') return '6';
    else if (String(Img) == 'BRONZE II') return '7';
    else if (String(Img) == 'BRONZE I') return '8';
    else if (String(Img) == 'SILVER IV') return '9';
    else if (String(Img) == 'SILVER III') return '10';
    else if (String(Img) == 'SILVER II') return '11';
    else if (String(Img) == 'SILVER I') return '12';
    else if (String(Img) == 'GOLD IV') return '13';
    else if (String(Img) == 'GOLD III') return '14';
    else if (String(Img) == 'GOLD II') return '15';
    else if (String(Img) == 'GOLD I') return '16';
    else if (String(Img) == 'PLATINUM III') return '17';
    else if (String(Img) == 'PLATINUM II') return '18';
    else if (String(Img) == 'PLATINUM I') return '19';
    else if (String(Img) == 'DIAMOND') return '20';
    else if (String(Img) == 'CHAMPIONS') return '21';
    else return '22';
}
