var request = require("request");
var cheerio = require("cheerio");


var url = `https://r6.tracker.network/profile/pc/`;


let tracker = []
let newTracker = []
// trn-defstat__rank    goboal rank
// trn-defstat__name    name
// trn-defstat__value   All-Value
// trn-card--light      Not ranked yet
request(url, function (error, response, body) {
    if (!error) {
        //console.log(body)
        var $ = cheerio.load(body);

        $('#profile .trn-defstat__value').each(function (i, elem) {
            tracker.push($(this).text().split('\n'))
            //console.log(tracker)
        })

        for (i = 0; i < tracker.length; ++i) {
            newTracker[i] = filterArray(String(tracker[i]).split(','))
        }
        console.log('-------------------------');
        console.log(newTracker);



/*
        
        console.log('headshot%: ' + newTracker[0])
        console.log('KD: ' + newTracker[1])
        console.log('dead: ' + newTracker[2])
        console.log('headshots: ' + newTracker[3])
        console.log('wins: ' + newTracker[4])
        console.log('losses: ' + newTracker[5])
        console.log('win%: ' + newTracker[6])
        console.log('timePlayed:' + newTracker[7])
        console.log('matchesPlayed: ' + newTracker[8])
        console.log('totalXp: ' + newTracker[9])
        console.log('meleeKills: ' + newTracker[10])
        console.log('blindKills: ' + newTracker[11])


*/

    } else {
        console.log("error:" + error);
    }
});




function filterArray(clearArray) {
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
}




/*-----------------------------------------*/
//newTracker[]

//general
headshot = [0]
kd = [1]
dead = [2]
headshots = [3]
wins = [4]
losses = [5]
win = [6]
timePlayed = [7]
matchesPlayed = [8]
totalXp = [9]
meleeKills = [10]
blindKills = [11]

//ranked
timePlayed = [12]
wins = [13]
losses = [14]
matchesPlayed = [15]
dead = [16]
kills = [17]
win = [18]
kd = [19]
killsMatch = [20]
killsMin = [21]

//unranked ------havent trn-defstat__rank------
timePlayed = [22]
wins = [23]
losses = [24]
matchesPlayed = [25]
dead = [26]
kills = [27]
win = [28]
kd = [29]
killsMatch = [30]
killsMin = [31]

//casual
timePlayed = [32]
wins = [33]
losses = [34]
matchesPlayed = [35]
dead = [36]
kills = [37]
win = [38]
kd = [39]
killsMatch = [40]
killsMin = [41]

//Season Ranked & casual operation ------havent trn-defstat__rank------
kd = [42]
killsMatch = [43]
kills = [44]
dead = [45]
win = [46]
wins = [47]
losses = [48]
abandons = [49]
rank = [50] //[62]
maxRank = [51]
mmr = [52]
maxMmr = [53]
//season casual -----------------------------------
kd = [54]
killsMatch = [55]
kills = [56]
dead = [57]
win = [58]
wins = [59]
losses = [60]
abandons = [61]
rank = [62]         //RankImage(String(newTracker[62]))
maxRank = [63]
mmr = [64]
maxMmr = [65]





//#profile .trn-defstat__value >> output  //2020/12/13
[
  [ '39.24%' ],           [ '1.14' ],        [ '5', '407' ],
  [ '2', '420' ],         [ '891' ],         [ '802' ],
  [ '52.6%' ],            [ '411h' ],        [ '1', '693' ],
  [ '16', '903', '522' ], [ '110', ' ' ],    [ '15' ],
  [ '17h 52s' ],          [ '26' ],          [ '28' ],
  [ '54' ],               [ '225', ' ' ],    [ '231' ],
  [ '48.1%' ],            [ '1.03' ],        [ '4.28' ],
  [ '0.23' ],             [ '26h 24m 57s' ], [ '53' ],
  [ '69' ],               [ '122' ],         [ '546' ],
  [ '532' ],              [ '43.4%' ],       [ '0.97' ],
  [ '4.36' ],             [ '0.34' ],        [ '368h 50m 37s' ],
  [ '812' ],              [ '705' ],         [ '1', '517' ],
  [ '4', '636' ],         [ '5', '404' ],    [ '53.5%' ],
  [ '1.17' ],             [ '3.56' ],        [ '0.24', ' ' ],
  [ '1.63' ],             [ '4.53' ],        [ '340' ],
  [ '209' ],              [ '48.00' ],       [ '36' ],
  [ '37' ],               [ '2' ],           [ 'GOLD III' ],
  [ '-' ],                [ '2', '710' ],    [ '0' ]
]
,
[
  [ '#3', '028', '394' ], [ '#1', '472', '122' ],
  [ '#758', '975' ],      [ '#624', '179' ],
  [ '#682', '226' ],      [ '#689', '981' ],
  [ '#2', '521', '651' ], [ '#775', '201' ],
  [ '#687', '838' ],      [ '#664', '861' ],
  [ '#655', '098' ],      [ '#428', '033' ],
  [ '#2', '604', '612' ], [ '#2', '512', '605' ],
  [ '#2', '605', '378' ], [ '#2', '572', '602' ],
  [ '#2', '620', '553' ], [ '#2', '396', '876' ],
  [ '#2', '393', '274' ], [ '#1', '239', '738' ],
  [ '#1', '382', '567' ], [ '#935', '051' ],
  [],                     [],
  [],                     [],
  [],                     [],
  [],                     [],
  [],                     [],
  [ '#384', '719' ],      [ '#403', '257' ],
  [],                     [],
  [],                     [],
  [],                     [],
  [],                     [],
  [ '#384', '719' ],      [ '#403', '257' ],
  [ '#417', '932' ],      [ '#410', '430' ],
  [ '#383', '003' ],      [ '#305', '734' ],
  [ '#2', '396', '869' ], [ '#1', '484', '110' ],
]

//----------r6 tab------------
//rank_img = `https://tabstats.com/images/r6/ranks/?rank=${RankImage(newTracker[51])}&champ=0`
Copper [5] = 1      // https://tabstats.com/images/r6/ranks/?rank=1&champ=0
Copper [4] = 2      // https://tabstats.com/images/r6/ranks/?rank=2&champ=0
Copper [3] = 3      // https://tabstats.com/images/r6/ranks/?rank=3&champ=0
Copper [2] = 4      // https://tabstats.com/images/r6/ranks/?rank=4&champ=0
Copper [1] = 5      // https://tabstats.com/images/r6/ranks/?rank=5&champ=0

Bronze [3] = 6      // https://tabstats.com/images/r6/ranks/?rank=6&champ=0
Bronze [2] = 7      // https://tabstats.com/images/r6/ranks/?rank=7&champ=0
Bronze [1] = 8      // https://tabstats.com/images/r6/ranks/?rank=8&champ=0

Silver [4] = 9      // https://tabstats.com/images/r6/ranks/?rank=9&champ=0
Silver [3] = 10     // https://tabstats.com/images/r6/ranks/?rank=10&champ=0
Silver [2] = 11     // https://tabstats.com/images/r6/ranks/?rank=11&champ=0
Silver [1] = 12     // https://tabstats.com/images/r6/ranks/?rank=12&champ=0

Gold [4] = 13       // https://tabstats.com/images/r6/ranks/?rank=13&champ=0
Gold [3] = 14       // https://tabstats.com/images/r6/ranks/?rank=14&champ=0
Gold [2] = 15       // https://tabstats.com/images/r6/ranks/?rank=15&champ=0
Gold [1] = 16       // https://tabstats.com/images/r6/ranks/?rank=16&champ=0

Platinum [3] = 17   // https://tabstats.com/images/r6/ranks/?rank=17&champ=0
Platinum [2] = 18   // https://tabstats.com/images/r6/ranks/?rank=18&champ=0
Platinum [1] = 19   // https://tabstats.com/images/r6/ranks/?rank=19&champ=0

Diamond [1] = 20    // https://tabstats.com/images/r6/ranks/?rank=20&champ=0
Champion [1] = 21   // https://tabstats.com/images/r6/ranks/?rank=21&champ=0
Unranked [1] = 22   // https://tabstats.com/images/r6/ranks/?rank=22&champ=0

