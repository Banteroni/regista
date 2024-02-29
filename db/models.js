import sequelize from "./conn.js";
import League from "./models/League.js";
import Match from "./models/Match.js";
import Player from "./models/Player.js";
import Team from "./models/Team.js";
import Event from "./models/Event.js";
import Starting from "./models/Starting.js";
import User from "./models/User.js";
import Season from "./models/Season.js";

League.hasMany(Team);
Team.belongsTo(League);

Team.hasMany(Match, { foreignKey: "homeTeamId" });
Team.hasMany(Match, { foreignKey: "awayTeamId" });
Match.belongsTo(League);
League.hasMany(Match);
Player.belongsTo(Team, { constraints: false });
Event.belongsTo(Match);
Match.hasMany(Event);
Event.belongsTo(Player);
Player.hasMany(Event);

Player.hasMany(Starting);
Starting.belongsTo(Player);
Match.hasMany(Starting);
Starting.belongsTo(Match);

Season.belongsTo(League);
League.hasMany(Season);

Match.belongsTo(Season);
Season.hasMany(Match);

export { League, Match, Team, Player, Event, User, Season };
