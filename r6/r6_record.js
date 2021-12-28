

function Record(header, user, url,
  RANK_win_percent, RANK_win, RANK_loss, RANK_kd, RANK_kill, RANK_death, RANK_killMatch, RANK_rank, RANK_mmr, RANK_rank_img,
  CASUAL_timePlayed, CASUAL_win_percent, CASUAL_win, CASUAL_loss, CASUAL_kd, CASUAL_kill, CASUAL_death, CASUAL_killMatch, CASUAL_rank, CASUAL_mmr, CASUAL_rank_img,
  GENERAL_timePlayed, GENERAL_win_percent, GENERAL_win, GENERAL_loss, GENERAL_kd, GENERAL_kill, GENERAL_death, GENERAL_handShot, GENERAL_handShots, GENERAL_meleeKills, GENERAL_blindKills,
  HIDERANK_CASUAL_timePlayed, HIDERANK_CASUAL_win_percent, HIDERANK_CASUAL_win, HIDERANK_CASUAL_loss, HIDERANK_CASUAL_kd, HIDERANK_CASUAL_kill, HIDERANK_CASUAL_death, HIDERANK_CASUAL_killMatch, HIDERANK_CASUAL_rank, HIDERANK_CASUAL_mmr, HIDERANK_CASUAL_rank_img,
  HIDERANK_RANK_win_percent, HIDERANK_RANK_win, HIDERANK_RANK_loss, HIDERANK_RANK_kd, HIDERANK_RANK_kill, HIDERANK_RANK_death, HIDERANK_RANK_killMatch, HIDERANK_RANK_rank, HIDERANK_RANK_mmr, HIDERANK_RANK_rank_img,
  HIDECASUAL_CASUAL_timePlayed, HIDECASUAL_CASUAL_win_percent, HIDECASUAL_CASUAL_win, HIDECASUAL_CASUAL_loss, HIDECASUAL_CASUAL_kd, HIDECASUAL_CASUAL_kill, HIDECASUAL_CASUAL_death, HIDECASUAL_CASUAL_killMatch, HIDECASUAL_CASUAL_rank, HIDECASUAL_CASUAL_mmr, HIDECASUAL_CASUAL_rank_img,
  HIDECASUAL_RANK_win_percent, HIDECASUAL_RANK_win, HIDECASUAL_RANK_loss, HIDECASUAL_RANK_kd, HIDECASUAL_RANK_kill, HIDECASUAL_RANK_death, HIDECASUAL_RANK_killMatch, HIDECASUAL_RANK_rank, HIDECASUAL_RANK_mmr, HIDECASUAL_RANK_rank_img) {


  this.header = header;
  this.user = user;
  this.url = url;

  //rank
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

  //casual
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

  //general
  this.GENERAL_timePlayed = GENERAL_timePlayed;
  this.GENERAL_win_percent = GENERAL_win_percent;
  this.GENERAL_win = GENERAL_win;
  this.GENERAL_loss = GENERAL_loss;
  this.GENERAL_kd = GENERAL_kd;
  this.GENERAL_kill = GENERAL_kill;
  this.GENERAL_death = GENERAL_death;
  this.GENERAL_handShot = GENERAL_handShot;
  this.GENERAL_handShots = GENERAL_handShots;
  this.GENERAL_meleeKills = GENERAL_meleeKills;
  this.GENERAL_blindKills = GENERAL_blindKills;

  // havent play rank, have play casual
  this.HIDERANK_CASUAL_timePlayed = HIDERANK_CASUAL_timePlayed;
  this.HIDERANK_CASUAL_win_percent = HIDERANK_CASUAL_win_percent;
  this.HIDERANK_CASUAL_win = HIDERANK_CASUAL_win;
  this.HIDERANK_CASUAL_loss = HIDERANK_CASUAL_loss;
  this.HIDERANK_CASUAL_kd = HIDERANK_CASUAL_kd;
  this.HIDERANK_CASUAL_kill = HIDERANK_CASUAL_kill;
  this.HIDERANK_CASUAL_death = HIDERANK_CASUAL_death;
  this.HIDERANK_CASUAL_killMatch = HIDERANK_CASUAL_killMatch;
  this.HIDERANK_CASUAL_rank = HIDERANK_CASUAL_rank;
  this.HIDERANK_CASUAL_mmr = HIDERANK_CASUAL_mmr;
  this.HIDERANK_CASUAL_rank_img = HIDERANK_CASUAL_rank_img;
  //-----
  this.HIDERANK_RANK_win_percent = HIDERANK_RANK_win_percent;
  this.HIDERANK_RANK_win = HIDERANK_RANK_win;
  this.HIDERANK_RANK_loss = HIDERANK_RANK_loss;
  this.HIDERANK_RANK_kd = HIDERANK_RANK_kd;
  this.HIDERANK_RANK_kill = HIDERANK_RANK_kill;
  this.HIDERANK_RANK_death = HIDERANK_RANK_death;
  this.HIDERANK_RANK_killMatch = HIDERANK_RANK_killMatch;
  this.HIDERANK_RANK_rank = HIDERANK_RANK_rank;
  this.HIDERANK_RANK_mmr = HIDERANK_RANK_mmr;
  this.HIDERANK_RANK_rank_img = HIDERANK_RANK_rank_img;

  // have play rank, havent play rank
  this.HIDECASUAL_CASUAL_timePlayed = HIDECASUAL_CASUAL_timePlayed;
  this.HIDECASUAL_CASUAL_win_percent = HIDECASUAL_CASUAL_win_percent;
  this.HIDECASUAL_CASUAL_win = HIDECASUAL_CASUAL_win;
  this.HIDECASUAL_CASUAL_loss = HIDECASUAL_CASUAL_loss;
  this.HIDECASUAL_CASUAL_kd = HIDECASUAL_CASUAL_kd;
  this.HIDECASUAL_CASUAL_kill = HIDECASUAL_CASUAL_kill;
  this.HIDECASUAL_CASUAL_death = HIDECASUAL_CASUAL_death;
  this.HIDECASUAL_CASUAL_killMatch = HIDECASUAL_CASUAL_killMatch;
  this.HIDECASUAL_CASUAL_rank = HIDECASUAL_CASUAL_rank;
  this.HIDECASUAL_CASUAL_mmr = HIDECASUAL_CASUAL_mmr;
  this.HIDECASUAL_CASUAL_rank_img = HIDECASUAL_CASUAL_rank_img;
  //-----
  this.HIDECASUAL_RANK_win_percent = HIDECASUAL_RANK_win_percent;
  this.HIDECASUAL_RANK_win = HIDECASUAL_RANK_win;
  this.HIDECASUAL_RANK_loss = HIDECASUAL_RANK_loss;
  this.HIDECASUAL_RANK_kd = HIDECASUAL_RANK_kd;
  this.HIDECASUAL_RANK_kill = HIDECASUAL_RANK_kill;
  this.HIDECASUAL_RANK_death = HIDECASUAL_RANK_death;
  this.HIDECASUAL_RANK_killMatch = HIDECASUAL_RANK_killMatch;
  this.HIDECASUAL_RANK_rank = HIDECASUAL_RANK_rank;
  this.HIDECASUAL_RANK_mmr = HIDECASUAL_RANK_mmr;
  this.HIDECASUAL_RANK_rank_img = HIDECASUAL_RANK_rank_img;
}
let record = new Record();
