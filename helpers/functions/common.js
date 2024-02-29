import sequelize from "../../db/conn.js";
import { Event, League, Match } from "../../db/models.js";
import { createHash } from "crypto";
import Starting from "../../db/models/Starting.js";

//append the events to an array
export const appendEvent = (arr, event) => {
  if (event.actions) {
    event.actions.forEach((el) => {
      arr.push({
        timing: parseInt(el.timing),
        type: el.type == "shot" ? "goal" : el.type,
        playerId: parseInt(event.playerId),
      });
    });
  }
  return;
};

//initialize the leagues in the database
export const initializeLeagues = async () => {
  await sequelize.sync();
  const leagues = [
    {
      id: 8,
      name: "Premier League",
      matchDays: 38,
    },
    {
      id: 21,
      name: "Serie A",
      matchDays: 38,
    },
    {
      id: 23,
      name: "La Liga",
      matchDays: 38,
    },
    {
      id: 22,
      name: "Bundesliga",
      matchDays: 34,
    },
    {
      id: 24,
      name: "Ligue 1",
      matchDays: 38,
    },
  ];

  for (const leagueData of leagues) {
    try {
      await League.findOrCreate({ where: { ...leagueData } });
    } catch (error) {
      console.error("Error inserting league:", error);
    }
  }
};

//return the appropriate role for the player
export const roleSwitch = (role) => {
  if (role.toLowerCase().includes("striker")) return "Attacker";
  if (role.toLowerCase().includes("midfielder")) return "Midfielder";
  if (role.toLowerCase().includes("defender")) return "Defender";
  if (role.toLowerCase().includes("goalkeeper")) return "Goalkeeper";
  if (role.toLowerCase().includes("back")) return "Defender";
  else return "Unknown";
};

export const hashPassword = (password) => {
  return createHash("sha256").update(password).digest("hex");
};

export const validateEnviroments = () => {
  if (process.env.DB == "sqlite") {
    const requirements = ["ROOT_PASSWORD"];
    const missing = [];
    for (const requirement of requirements) {
      if (!process.env[requirement]) {
        missing.push(requirement);
      }
    }
    if (missing.length > 0) {
      console.log(`Missing enviroment variables: ${missing.join(", ")}`);
      console.log("Exiting...");
      process.exit(0);
    }
    return;
  }
  const requirements = [
    "DB_USER",
    "DB_NAME",
    "DB_PASSWORD",
    "DB_HOST",
    "ROOT_PASSWORD",
  ];
  const missing = [];
  for (const requirement of requirements) {
    if (!process.env[requirement]) {
      missing.push(requirement);
    }
  }
  if (missing.length > 0) {
    console.log(`Missing enviroment variables: ${missing.join(", ")}`);
    console.log("Exiting...");
    process.exit(0);
  }
};

export const buildQuery = (req) => {
  const { query } = req;
  const { limit, offset } = query;
  let queryObj = { where: {} };

  if (limit) {
    queryObj.limit = parseInt(limit);
  }
  if (offset) {
    queryObj.offset = parseInt(offset);
  }

  return queryObj;
};

//retrieve stats from player
export const retrieveStats = async (player_id) => {
  const events = await Event.findAll({ where: { PlayerId: player_id } });
  const assists = events.filter((event) => event.type === "assist").length;
  const goals = events.filter((event) => event.type === "goal").length;
  let appearances = await Starting.count({ where: { PlayerId: player_id } });
  appearances += events.filter((event) => event.type === "subIn").length;
  const yellowCards = events.filter(
    (event) => event.type === "yellowCard"
  ).length;
  const redCards = events.filter((event) => event.type === "redCard").length;
  return { assists, goals, yellowCards, redCards, appearances };
};

export const updateScore = async (matchId, homeScore, awayScore) => {
  const match = await Match.findByPk(matchId);
  match.homeTeamScore = homeScore;
  match.awayTeamScore = awayScore;
  await match.save();
  return 0;
};
