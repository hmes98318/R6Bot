const Discord = require('discord.js');
var embed = require('./embed.js');
var record = require('./r6_record');
var base = require('./base.json')


module.exports = {
    R6_type: function (type, r6name, tracker, operators) {

        console.log('type--' + type)
        let operators_check = checking(type);
        console.log('////' + operators_check)
        /*
        for (i = 0; i <= tracker.length; ++i) {
            console.log(i + ' = [' + tracker[i] + ']')
        }*/
        
        
        // [] 66-62-54
        /*  66=>normal
         *  62=>有打過RANK賽季更新重置有隱分格式會不同
         *  54=>從沒打過RANK的人casual error
         */
        
        
        if (tracker[42] !== undefined && tracker[44] !== undefined) { //檢查搜尋到的玩家是否正確(存在)
            console.log('done')

            if (type === 'RANK' && r6name !== undefined) {
                console.log('RANK')//season RANK [42]-[53]

                if (tracker.length == 54) {
                    console.log('54')
                    //has been played rank last season,this season hide rank
                    return embed.R6_Ranked_Embed(record.header, record.user, record.url, record.HIDE_RANK_win_percent, record.HIDE_RANK_win, record.HIDE_RANK_loss, record.HIDE_RANK_kd, record.HIDE_RANK_kill, record.HIDE_RANK_death, record.HIDE_RANK_killMatch, record.HIDE_RANK_rank, record.HIDE_RANK_mmr, record.HIDE_RANK_rank_img)
                }
                else if (tracker.length == 62) {
                    console.log('62')
                    return embed.R6_Ranked_Embed(record.header, record.user, record.url, record.HIDE_RANK_win_percent, record.HIDE_RANK_win, record.HIDE_RANK_loss, record.HIDE_RANK_kd, record.HIDE_RANK_kill, record.HIDE_RANK_death, record.HIDE_RANK_killMatch, record.HIDE_RANK_rank, record.HIDE_RANK_mmr, record.HIDE_RANK_rank_img)
                }
                else {
                    console.log('66')
                    //header, user, url, win_percent, win, loss, kd, kill, death, killMatch, rank, mmr, rank_img
                    return embed.R6_Ranked_Embed(record.header, record.user, record.url, record.RANK_win_percent, record.RANK_win, record.RANK_loss, record.RANK_kd, record.RANK_kill, record.RANK_death, record.RANK_killMatch, record.RANK_rank, record.RANK_mmr, record.RANK_rank_img)
                }
            }
            else if (type === 'CASUAL' && r6name !== undefined) {
                console.log('CASUAL')//casual [32]-[41]

                if (tracker.length == 54) {
                    //casual havent played RANK
                    return embed.R6_Casual_Embed(record.header, record.user, record.url, record.CASUAL_timePlayed, record.CASUAL_win_percent, record.CASUAL_win, record.CASUAL_loss, record.CASUAL_kd, record.CASUAL_kill, record.CASUAL_death, record.CASUAL_killMatch, record.CASUAL_NO_RANK_rank, record.CASUAL_NO_RANK_mmr, record.CASUAL_NO_RANK_rank_img)
                }
                else if (tracker.length == 62) {
                    return embed.R6_Casual_Embed(record.header, record.user, record.url, record.HIDE_CASUAL_timePlayed, record.HIDE_CASUAL_win_percent, record.HIDE_CASUAL_win, record.HIDE_CASUAL_loss, record.HIDE_CASUAL_kd, record.HIDE_CASUAL_kill, record.HIDE_CASUAL_death, record.HIDE_CASUAL_killMatch, record.HIDE_CASUAL_rank, record.HIDE_CASUAL_mmr, record.HIDE_CASUAL_rank_img)
                }
                else {
                    //header, user, url, timePlayed, win_percent, win, loss, kd, kill, death, killMatch, rank, mmr, rank_img
                    return embed.R6_Casual_Embed(record.header, record.user, record.url, record.CASUAL_timePlayed, record.CASUAL_win_percent, record.CASUAL_win, record.CASUAL_loss, record.CASUAL_kd, record.CASUAL_kill, record.CASUAL_death, record.CASUAL_killMatch, record.CASUAL_rank, record.CASUAL_mmr, record.CASUAL_rank_img)
                }
            }
            else if (type === undefined) {
                console.log('GENERAL')//general [0]-[11]

                //header, user, url, timePlayed, win_percent, win, loss, kd, death, handShot, handShots, meleeKills, blindKills 
                return embed.R6_General_Embed(record.header, record.user, record.url, record.GENERAL_timePlayed, record.GENERAL_win_percent, record.GENERAL_win, record.GENERAL_loss, record.GENERAL_kd, record.GENERAL_death, record.GENERAL_handShot, record.GENERAL_handShots, record.GENERAL_meleeKills, record.GENERAL_blindKills)
            }

            else if (r6name === 'HELP' || r6name === 'help') {//不是則檢測是否為 +r6 help
                console.log('HELP')
                return embed.R6_help()
            }
            else if (operators_check === true) {
                console.log('OPERATORS')

                for (var i = 1; i < operators.length; ++i) {
                    console.log('--' + operators[i])
                    if (type == operators[i][3]) {

                        for (j = 0; j < 20; ++j) {
                            console.log(`[${j}] = ${operators[i][j]}`)
                        }
                        var header = `https://trackercdn.com/cdn/r6.tracker.network/operators/badges/${type.toLowerCase()}.png`
                        //header, user, url, operator, timePlayed, Kills, kd, Wins, Losses, Win_percent, Headshot, DBNOs, XP, meleeKills, operatorStat
                        return embed.R6_Operators_Embed(header, record.user, record.url, operators[i][3], operators[i][5], operators[i][6], operators[i][7], operators[i][8], operators[i][9], operators[i][10], operators[i][11], operators[i][12], operators[i][13], operators[i][14], operators[i][16])
                    }
                }
                
                console.log('-------- operators --------' + operators[1][0])
                return embed.R6_Not_Found()//operators[1][0]
            }
            else {
                console.log('Not Found')
                return embed.R6_Not_Found()
            }
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

    R6_record: function (header, r6name, url, tracker) {

        record.header = header;
        record.user = r6name;
        record.url = url;
        //season RANK [42]-[53]
        record.RANK_win_percent = tracker[46];
        record.RANK_win = tracker[47];
        record.RANK_loss = tracker[48];
        record.RANK_kd = tracker[42];
        record.RANK_kill = tracker[44];
        record.RANK_death = tracker[45];
        record.RANK_killMatch = tracker[43];
        record.RANK_rank = tracker[51];
        record.RANK_mmr = String(tracker[52]);
        record.RANK_rank_img = `https://cdn.tabstats.com/tabstats/r6/ranks/?rank=${RankImage(tracker[51])}&champ=0`;
        //casual [32]-[41]
        record.CASUAL_timePlayed = tracker[32];
        record.CASUAL_win_percent = tracker[38];
        record.CASUAL_win = tracker[33];
        record.CASUAL_loss = tracker[34];
        record.CASUAL_kd = tracker[39];
        record.CASUAL_kill = tracker[37];
        record.CASUAL_death = tracker[36];
        record.CASUAL_killMatch = tracker[40];
        record.CASUAL_rank = tracker[62];
        record.CASUAL_mmr = String(tracker[64]);
        record.CASUAL_rank_img = `https://cdn.tabstats.com/tabstats/r6/ranks/?rank=${RankImage(tracker[62])}&champ=0`;
        //casual no RANK 
        record.CASUAL_NO_RANK_rank = tracker[50];
        record.CASUAL_NO_RANK_mmr = String(tracker[52]);
        record.CASUAL_NO_RANK_rank_img = `https://cdn.tabstats.com/tabstats/r6/ranks/?rank=${RankImage(tracker[50])}&champ=0`;
        //general [0]-[11]
        record.GENERAL_timePlayed = tracker[7];
        record.GENERAL_win_percent = tracker[6];
        record.GENERAL_win = tracker[4];
        record.GENERAL_loss = tracker[5];
        record.GENERAL_kd = tracker[1];
        record.GENERAL_death = tracker[2];
        record.GENERAL_handShot = tracker[0];
        record.GENERAL_handShots = tracker[3];
        record.GENERAL_meleeKills = tracker[10];
        record.GENERAL_blindKills = tracker[11];
        //played rank, new season hide rank
        record.HIDE_CASUAL_timePlayed = tracker[32];
        record.HIDE_CASUAL_win_percent = tracker[54];
        record.HIDE_CASUAL_win = tracker[55];
        record.HIDE_CASUAL_loss = tracker[56];
        record.HIDE_CASUAL_kd = tracker[50];
        record.HIDE_CASUAL_kill = tracker[52];
        record.HIDE_CASUAL_death = tracker[53];
        record.HIDE_CASUAL_killMatch = tracker[51];
        record.HIDE_CASUAL_rank = tracker[58];
        record.HIDE_CASUAL_mmr = String(tracker[60]);
        record.HIDE_CASUAL_rank_img = `https://cdn.tabstats.com/tabstats/r6/ranks/?rank=${RankImage(tracker[58])}&champ=0`;
        //-----
        record.HIDE_RANK_win_percent = tracker[42];
        record.HIDE_RANK_win = tracker[43];
        record.HIDE_RANK_loss = tracker[44];
        record.HIDE_RANK_kd = tracker[45];
        record.HIDE_RANK_kill = tracker[45];
        record.HIDE_RANK_death = tracker[45];
        record.HIDE_RANK_killMatch = tracker[45];
        record.HIDE_RANK_rank = tracker[45];
        record.HIDE_RANK_mmr = String(tracker[48]);
        record.HIDE_RANK_rank_img = `https://cdn.tabstats.com/tabstats/r6/ranks/?rank=${RankImage(tracker[45])}&champ=0`;
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
    else if (String(Img) == 'CHAMPION') return '21';
    else return '22';
}


function checking(type) {
    for (var i = 0; i < base.operators.length; ++i) {
        if (type == base.operators[i]) {
            return true
        }
    } return false
}
