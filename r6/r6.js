const embed = require('./embed.js');
const record = require('./r6_record');
const base = require('./base.json');


module.exports = {
    /* [] 71-75
    *  71=> this season havent play rank or casual
    *  75=> normal rank & casual 
    */

    Rank: function (tracker) {
        if (tracker.length == 71) {
            if (Number(tracker[59]) || Number(tracker[60])) {
                console.log('71-havent-rank')
                return embed.R6_Ranked_Embed(record.header, record.user, record.url, record.HIDERANK_RANK_win_percent, record.HIDERANK_RANK_win, record.HIDERANK_RANK_loss, record.HIDERANK_RANK_kd, record.HIDERANK_RANK_kill, record.HIDERANK_RANK_death, record.HIDERANK_RANK_killMatch, record.HIDERANK_RANK_rank, record.HIDERANK_RANK_mmr, record.HIDERANK_RANK_rank_img)
            }
            else {
                console.log('71-havent-casual')//header, user, url, timePlayed, win_percent, win, loss, kd, kill, death, killMatch, rank, mmr, rank_img
                return embed.R6_Ranked_Embed(record.header, record.user, record.url, record.HIDECASUAL_RANK_win_percent, record.HIDECASUAL_RANK_win, record.HIDECASUAL_RANK_loss, record.HIDECASUAL_RANK_kd, record.HIDECASUAL_RANK_kill, record.HIDECASUAL_RANK_death, record.HIDECASUAL_RANK_killMatch, record.HIDECASUAL_RANK_rank, record.HIDECASUAL_RANK_mmr, record.HIDECASUAL_RANK_rank_img)
            }
        }
        else {
            console.log('75')
            //header, user, url, win_percent, win, loss, kd, kill, death, killMatch, rank, mmr, rank_img
            return embed.R6_Ranked_Embed(record.header, record.user, record.url, record.RANK_win_percent, record.RANK_win, record.RANK_loss, record.RANK_kd, record.RANK_kill, record.RANK_death, record.RANK_killMatch, record.RANK_rank, record.RANK_mmr, record.RANK_rank_img)
        }
    },

    Casual: function (tracker) {
        if (tracker.length == 71) {
            if (Number(tracker[59]) || Number(tracker[60])) {
                console.log('71-havent-rank')//header, user, url, timePlayed, win_percent, win, loss, kd, kill, death, killMatch, rank,mmr, rank_img
                return embed.R6_Casual_Embed(record.header, record.user, record.url, record.HIDERANK_CASUAL_timePlayed, record.HIDERANK_CASUAL_win_percent, record.HIDERANK_CASUAL_win, record.HIDERANK_CASUAL_loss, record.HIDERANK_CASUAL_kd, record.HIDERANK_CASUAL_kill, record.HIDERANK_CASUAL_death, record.HIDERANK_CASUAL_killMatch, record.HIDERANK_CASUAL_rank, record.HIDERANK_CASUAL_mmr, record.HIDERANK_CASUAL_rank_img)
            }
            else {
                console.log('71-havent-casual')//header, user, url, timePlayed, win_percent, win, loss, kd, kill, death, killMatch, rank,mmr, rank_img
                return embed.R6_Casual_Embed(record.header, record.user, record.url, record.HIDECASUAL_CASUAL_timePlayed, record.HIDECASUAL_CASUAL_win_percent, record.HIDECASUAL_CASUAL_win, record.HIDECASUAL_CASUAL_loss, record.HIDECASUAL_CASUAL_kd, record.HIDECASUAL_CASUAL_kill, record.HIDECASUAL_CASUAL_death, record.HIDECASUAL_CASUAL_killMatch, record.HIDECASUAL_CASUAL_rank, record.HIDECASUAL_CASUAL_mmr, record.HIDECASUAL_CASUAL_rank_img)
            }
        }
        else {
            console.log('75')
            //header, user, url, timePlayed, win_percent, win, loss, kd, kill, death, killMatch, rank, mmr, rank_img
            return embed.R6_Casual_Embed(record.header, record.user, record.url, record.CASUAL_timePlayed, record.CASUAL_win_percent, record.CASUAL_win, record.CASUAL_loss, record.CASUAL_kd, record.CASUAL_kill, record.CASUAL_death, record.CASUAL_killMatch, record.CASUAL_rank, record.CASUAL_mmr, record.CASUAL_rank_img)
        }
    },

    General: function () {
        //                                   header,        user,        url,                timePlayed,                win_percent,                win,                loss,                kd,                kill,                death,                handShot,                handShots,                meleeKills,                blindKills 
        return embed.R6_General_Embed(record.header, record.user, record.url, record.GENERAL_timePlayed, record.GENERAL_win_percent, record.GENERAL_win, record.GENERAL_loss, record.GENERAL_kd, record.GENERAL_kill, record.GENERAL_death, record.GENERAL_handShot, record.GENERAL_handShots, record.GENERAL_meleeKills, record.GENERAL_blindKills)

    },

    Operators: function (operators, type) {
        for (var i = 1; i < operators.length; ++i) {
            console.log('--' + operators[i])
            if (operators[i][3] == 'NØKK') {
                operators[i][3] = 'NAKK';
            }
            if (operators[i][3] == 'JÄGER') {
                operators[i][3] = 'JAGER';
            }
            if (operators[i][3] == 'CAPITÃO') {
                operators[i][3] = 'CAPITAO';
            }
            if (type == operators[i][3]) {
                console.log('++' + operators[i])
                for (j = 0; j < 20; ++j) {
                    console.log(`[${j}] = ${operators[i][j]}`)
                }
                //console.log('++++++' + operators[i])
                var header = `https://trackercdn.com/cdn/r6.tracker.network/operators/badges/${type.toLowerCase()}.png`
                //header,        user,        url,        Operator ,    Time Played,           Kills,          Deaths,             K/D,             Wins,           Losses,            Win %,       Headshot %,            DBNOs,               XP,      Melee Kills,   Operator Stat,
                return embed.R6_Operators_Embed(header, record.user, record.url, operators[i][3], operators[i][6], operators[i][7], operators[i][8], operators[i][9], operators[i][10], operators[i][11], operators[i][12], operators[i][13], operators[i][14], operators[i][15], operators[i][16], operators[i][18])
            }
        }

        //console.log('-------- operators --------' + operators[1][0])
        return embed.R6_Not_Found()//operators[1][0]
    },


    R6_record: function (header, r6name, url, tracker) {

        record.header = header;
        record.user = r6name;
        record.url = url;
        //RANK 
        record.RANK_win_percent = tracker[55];
        record.RANK_win = tracker[56];
        record.RANK_loss = tracker[57];
        record.RANK_kd = tracker[51];
        record.RANK_kill = tracker[53];
        record.RANK_death = tracker[54];
        record.RANK_killMatch = tracker[52];
        record.RANK_rank = tracker[59];
        record.RANK_mmr = String(tracker[61]);
        record.RANK_rank_img = `https://cdn.tabstats.com/tabstats/r6/ranks/?rank=${RankImage(tracker[59])}&champ=0`;
        //casual 
        record.CASUAL_timePlayed = tracker[41];
        record.CASUAL_win_percent = tracker[67];
        record.CASUAL_win = tracker[68];
        record.CASUAL_loss = tracker[69];
        record.CASUAL_kd = tracker[63];
        record.CASUAL_kill = tracker[65];
        record.CASUAL_death = tracker[66];
        record.CASUAL_killMatch = tracker[64];
        record.CASUAL_rank = tracker[71];
        record.CASUAL_mmr = String(tracker[73]);
        record.CASUAL_rank_img = `https://cdn.tabstats.com/tabstats/r6/ranks/?rank=${RankImage(tracker[71])}&champ=0`;
        //general 
        record.GENERAL_timePlayed = tracker[16];
        record.GENERAL_win_percent = tracker[15];
        record.GENERAL_win = tracker[13];
        record.GENERAL_loss = tracker[14];
        record.GENERAL_kd = tracker[10];
        record.GENERAL_kill = tracker[3]
        record.GENERAL_death = tracker[11];
        record.GENERAL_handShot = tracker[9];
        record.GENERAL_handShots = tracker[12];
        record.GENERAL_meleeKills = tracker[19];
        record.GENERAL_blindKills = tracker[20];

        // havent play rank, have play casual
        record.HIDERANK_CASUAL_timePlayed = tracker[41];
        record.HIDERANK_CASUAL_win_percent = tracker[63];
        record.HIDERANK_CASUAL_win = tracker[64];
        record.HIDERANK_CASUAL_loss = tracker[65];
        record.HIDERANK_CASUAL_kd = tracker[59];
        record.HIDERANK_CASUAL_kill = tracker[61];
        record.HIDERANK_CASUAL_death = tracker[62];
        record.HIDERANK_CASUAL_killMatch = tracker[60];
        record.HIDERANK_CASUAL_rank = tracker[67];
        record.HIDERANK_CASUAL_mmr = String(tracker[69]);
        record.HIDERANK_CASUAL_rank_img = `https://cdn.tabstats.com/tabstats/r6/ranks/?rank=${RankImage(tracker[67])}&champ=0`;
        //-----
        record.HIDERANK_RANK_win_percent = tracker[51];
        record.HIDERANK_RANK_win = tracker[52];
        record.HIDERANK_RANK_loss = tracker[53];
        record.HIDERANK_RANK_kd = tracker[53];
        record.HIDERANK_RANK_kill = tracker[53];
        record.HIDERANK_RANK_death = tracker[53];
        record.HIDERANK_RANK_killMatch = tracker[53];
        record.HIDERANK_RANK_rank = tracker[55];
        record.HIDERANK_RANK_mmr = String(tracker[57]);
        record.HIDERANK_RANK_rank_img = `https://cdn.tabstats.com/tabstats/r6/ranks/?rank=${RankImage(tracker[55])}&champ=0`;

        // have play rank, havent play rank
        record.HIDECASUAL_CASUAL_timePlayed = tracker[41];
        record.HIDECASUAL_CASUAL_win_percent = tracker[63];
        record.HIDECASUAL_CASUAL_win = tracker[64];
        record.HIDECASUAL_CASUAL_loss = tracker[65];
        record.HIDECASUAL_CASUAL_kd = tracker[65];
        record.HIDECASUAL_CASUAL_kill = tracker[65];
        record.HIDECASUAL_CASUAL_death = tracker[65];
        record.HIDECASUAL_CASUAL_killMatch = tracker[65];
        record.HIDECASUAL_CASUAL_rank = tracker[67];
        record.HIDECASUAL_CASUAL_mmr = String(tracker[69]);
        record.HIDECASUAL_CASUAL_rank_img = `https://cdn.tabstats.com/tabstats/r6/ranks/?rank=${RankImage(tracker[67])}&champ=0`;
        //-----
        record.HIDECASUAL_RANK_win_percent = tracker[55];
        record.HIDECASUAL_RANK_win = tracker[56];
        record.HIDECASUAL_RANK_loss = tracker[57];
        record.HIDECASUAL_RANK_kd = tracker[51];
        record.HIDECASUAL_RANK_kill = tracker[53];
        record.HIDECASUAL_RANK_death = tracker[54];
        record.HIDECASUAL_RANK_killMatch = tracker[52];
        record.HIDECASUAL_RANK_rank = tracker[59];
        record.HIDECASUAL_RANK_mmr = String(tracker[61]);
        record.HIDECASUAL_RANK_rank_img = `https://cdn.tabstats.com/tabstats/r6/ranks/?rank=${RankImage(tracker[59])}&champ=0`;
    },


    FilterArray: function (clearArray) {
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
        return result;
    },

    OperatorCheck: function (type) {
        for (var i = 0; i < base.operators.length; ++i) {
            //console.log(type, '=', base.operators[i])
            if (type == base.operators[i]) {
                return true;
            }
        } return false;
    }
}




function RankImage(Img) {

    if (String(Img) == 'COPPER V') return '1';
    else if (String(Img) == 'COPPER IV') return '2';
    else if (String(Img) == 'COPPER III') return '3';
    else if (String(Img) == 'COPPER II') return '4';
    else if (String(Img) == 'COPPER I') return '5';

    else if (String(Img) == 'BRONZE V') return '6';
    else if (String(Img) == 'BRONZE IV') return '7';
    else if (String(Img) == 'BRONZE III') return '8';
    else if (String(Img) == 'BRONZE II') return '9';
    else if (String(Img) == 'BRONZE I') return '10';

    else if (String(Img) == 'SILVER V') return '11';
    else if (String(Img) == 'SILVER IV') return '12';
    else if (String(Img) == 'SILVER III') return '13';
    else if (String(Img) == 'SILVER II') return '14';
    else if (String(Img) == 'SILVER I') return '15';

    else if (String(Img) == 'GOLD IV') return '16';
    else if (String(Img) == 'GOLD III') return '17';
    else if (String(Img) == 'GOLD II') return '18';
    else if (String(Img) == 'GOLD I') return '19';

    else if (String(Img) == 'PLATINUM III') return '20';
    else if (String(Img) == 'PLATINUM II') return '21';
    else if (String(Img) == 'PLATINUM I') return '22';

    else if (String(Img) == 'DIAMOND III') return '23';
    else if (String(Img) == 'DIAMOND II') return '24';
    else if (String(Img) == 'DIAMOND I') return '25';

    else if (String(Img) == 'CHAMPION') return '26';
    else return '27';
}



