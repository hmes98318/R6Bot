

function Record(header, user, url,
  RANK_win_percent, RANK_win, RANK_loss, RANK_kd, RANK_kill, RANK_death, RANK_killMatch, RANK_rank, RANK_mmr, RANK_rank_img,
  CASUAL_timePlayed, CASUAL_win_percent, CASUAL_win, CASUAL_loss, CASUAL_kd, CASUAL_kill, CASUAL_death, CASUAL_killMatch, CASUAL_rank, CASUAL_mmr, CASUAL_rank_img,
  CASUAL_NO_RANK_rank, CASUAL_NO_RANK_mmr, CASUAL_NO_RANK_rank_img,
  GENERAL_timePlayed, GENERAL_win_percent, GENERAL_win, GENERAL_loss, GENERAL_kd, GENERAL_death, GENERAL_handShot, GENERAL_handShots, GENERAL_meleeKills, GENERAL_blindKills) {


  this.header = header;
  this.user = user;
  this.url = url;

  //season RANK [42]-[53]
  this.RANK_win_percent = RANK_win_percent;
  this.RANK_win = RANK_win;
  this.RANK_loss = RANK_loss;
  this.RANK_kd = RANK_kd;
  this.RANK_kill = RANK_kill;
  this.RANK_death = RANK_death;
  this.RANK_killMatch = RANK_killMatch;
  this.RANK_rank = RANK_rank;
  this.RANK_mmr = RANK_mmr;
  this.RANK_rank_img = RANK_rank_img;

  //casual [32]-[41]
  this.CASUAL_timePlayed = CASUAL_timePlayed;
  this.CASUAL_win_percent = CASUAL_win_percent;
  this.CASUAL_win = CASUAL_win;
  this.CASUAL_loss = CASUAL_loss;
  this.CASUAL_kd = CASUAL_kd;
  this.CASUAL_kill = CASUAL_kill;
  this.CASUAL_death = CASUAL_death;
  this.CASUAL_killMatch = CASUAL_killMatch;
  this.CASUAL_rank = CASUAL_rank;
  this.CASUAL_mmr = CASUAL_mmr;
  this.CASUAL_rank_img = CASUAL_rank_img;

  //casual no RANK 
  this.CASUAL_NO_RANK_rank = CASUAL_NO_RANK_rank;
  this.CASUAL_NO_RANK_mmr = CASUAL_NO_RANK_mmr;
  this.CASUAL_NO_RANK_rank_img = CASUAL_NO_RANK_rank_img;

  //general [0]-[11]
  this.GENERAL_timePlayed = GENERAL_timePlayed;
  this.GENERAL_win_percent = GENERAL_win_percent;
  this.GENERAL_win = GENERAL_win;
  this.GENERAL_loss = GENERAL_loss;
  this.GENERAL_kd = GENERAL_kd;
  this.GENERAL_death = GENERAL_death;
  this.GENERAL_handShot = GENERAL_handShot;
  this.GENERAL_handShots = GENERAL_handShots;
  this.GENERAL_meleeKills = GENERAL_meleeKills;
  this.GENERAL_blindKills = GENERAL_blindKills;
}
let record = new Record();
