import { Event, Match, Player, Team } from "../db/models.js";
import instance from "../helpers/scraper/instance.js";
import sequelize from "sequelize";
import {
  setCached,
  setEvents,
  setPlayer,
  setStarting,
} from "../helpers/functions/cache.js";
import { appendEvent, updateScore } from "../helpers/functions/common.js";
import Starting from "../db/models/Starting.js";

const switchStatus = (status) => {
  switch (status) {
    case "LIVE":
      return 1;

    case "FULL":
      return 2;

    default:
      return 0;
  }
};
const appendPlayer = async (arr, player, playersToProcess, teamId) => {
  const record = await Player.findOne({
    where: { id: parseInt(player.playerId), TeamId: teamId },
  });
  if (!record) {
    playersToProcess.push(parseInt(player.playerId));
  }
  arr.push({
    playerId: parseInt(player.playerId),
    position: player.playerRole,
    number: player.jerseyNumber,
    name: player.playerName,
    captain: player.isCaptain,
  });
  return;
};

export const getMatchweeks = async (req, res) => {
  try {
    const { query } = req;
    //league_id is required, however match_day is optional
    if (!query.league_id) {
      return res.status(400).send();
    }
    //if match_day is not specified, return all matchdays' dates
    if (!query.match_day) {
      const { league_id } = query;
      const data = await Match.findAll({
        where: {
          LeagueId: league_id,
        },
        attributes: [
          "matchDay",
          [sequelize.fn("min", sequelize.col("date")), "startsAt"],
          [sequelize.fn("max", sequelize.col("date")), "endsAt"],
        ],
        group: ["matchDay"],
      });
      return res.send(data);
    } else {
      const { league_id, match_day } = query;
      const fixturesInDb = await Match.findAll({
        where: {
          LeagueId: league_id,
          matchDay: match_day,
        },
      });

      //if there are fixtures in the database, use them instead of the api
      if (fixturesInDb.filter((v) => v.status === 0).length === 0) {
        const Teams = await Team.findAll({
          where: {
            LeagueId: league_id,
          },
        });
        const response = [];
        for (const fixture of fixturesInDb) {
          const homeTeam = Teams.find((team) => team.id === fixture.homeTeamId);
          const awayTeam = Teams.find((team) => team.id === fixture.awayTeamId);
          response.push({
            id: fixture.id,
            date: fixture.date,
            homeTeam: {
              id: homeTeam.id,
              name: homeTeam.name,
              url: homeTeam.src,
              score: fixture.homeTeamScore,
            },
            awayTeam: {
              id: awayTeam.id,
              name: awayTeam.name,
              url: awayTeam.src,
              score: fixture.awayTeamScore,
            },
            status: fixture.status,
          });
        }
        return res.send(response);
      }
      const { data } = await instance.get(
        `/sports/calendar?day=${match_day}&sportId=1&competitionId=${league_id}`
      );

      const object = data.data;
      const { games } = object;
      const response = [];
      for (const game of games) {
        const matches = game.matches;
        for (const match of matches) {
          let { matchId, utcDate, awayTeam, homeTeam, status } = match;
          response.push({
            id: parseInt(matchId),
            date: utcDate,
            homeTeam: {
              id: parseInt(homeTeam.teamId),
              name: homeTeam.teamName,
              url: "/teams" + homeTeam.teamId + ".png",
              score: homeTeam.score,
            },
            awayTeam: {
              id: parseInt(awayTeam.teamId),
              name: awayTeam.teamName,
              url: "/teams" + awayTeam.teamId + ".png",
              score: awayTeam.score,
            },
            status: switchStatus(status),
          });
        }
      }
      res.send(response);

      //After sending the response, update the database
      const fixtures = await Match.findAll({
        where: {
          LeagueId: league_id,
          matchDay: match_day,
        },
      });
      for (const record of response) {
        //skip this record if it's not finished
        if (record.status !== 2) {
          continue;
        }
        //only update if the match is finished
        else {
          const fixture = fixtures.find((fixture) => fixture.id === record.id);
          if (fixture.status === false) {
            const { homeTeam, awayTeam } = record;
            await Match.update(
              {
                homeTeamScore: homeTeam.score,
                awayTeamScore: awayTeam.score,
                status: true,
              },
              {
                where: {
                  id: record.id,
                },
              }
            );
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};

export const getMatchInfos = async (req, res) => {
  try {
    if (!req.params.match_id) {
      return res.status(400).send();
    }
    const { match_id } = req.params;
    const response = await Match.findOne({
      where: {
        id: match_id,
      },
    });
    if (!response) {
      return res.status(404).send();
    }
    const { LeagueId, cached } = response;

    if (cached === true) {
      const events = await Event.findAll({
        where: {
          MatchId: match_id,
        },
      });
      const homeTeam = await Team.findByPk(response.homeTeamId);
      const awayTeam = await Team.findByPk(response.awayTeamId);
      //find all players in the match (in Starting table and associate the Player table)
      const Startings = await Starting.findAll({
        where: {
          MatchId: match_id,
        },
        include: Player,
      });

      const matchData = {
        id: response.id,
        date: response.date,
        awayTeam: {
          id: response.awayTeamId,
          name: awayTeam.name,
          score: response.awayTeamScore,
          starting: Startings.filter(
            (v) => v.position === true && v.Player.TeamId === awayTeam.id
          ).map((v) => {
            return {
              playerId: v.Player.id,
              position: v.Player.position,
              number: v.Player.number,
              name:
                v.Player.displayName !== null
                  ? v.Player.displayName
                  : v.Player.name + " " + v.Player.surname,
              captain: v.captain,
            };
          }),
          bench: Startings.filter(
            (v) => v.position === false && v.Player.TeamId === awayTeam.id
          ).map((v) => {
            return {
              playerId: v.Player.id,
              position: v.Player.position,
              number: v.Player.number,
              name:
                v.Player.displayName !== null
                  ? v.Player.displayName
                  : v.Player.name + " " + v.Player.surname,
              captain: v.captain,
            };
          }),
        },
        homeTeam: {
          id: response.homeTeamId,
          name: homeTeam.name,
          score: response.homeTeamScore,
          starting: Startings.filter(
            (v) => v.position === true && v.Player.TeamId === homeTeam.id
          ).map((v) => {
            return {
              playerId: v.Player.id,
              position: v.Player.position,
              number: v.Player.number,
              name:
                v.Player.displayName !== null
                  ? v.Player.displayName
                  : v.Player.name + " " + v.Player.surname,
              captain: v.captain,
            };
          }),
          bench: Startings.filter(
            (v) => v.position === false && v.Player.TeamId === homeTeam.id
          ).map((v) => {
            return {
              playerId: v.Player.id,
              position: v.Player.position,
              number: v.Player.number,
              name:
                v.Player.displayName !== null
                  ? v.Player.displayName
                  : v.Player.name + " " + v.Player.surname,
              captain: v.captain,
            };
          }),
        },
        status: response.status,
        timing: response.timing,
        events: events.map(({ timing, type, PlayerId }) => {
          return {
            timing,
            type,
            playerId: PlayerId,
          };
        }),
      };

      res.send(matchData);
      return;
    }

    const { data } = await instance.get(
      `/events/live?sportId=1&matchId=${match_id}&competitionId=${LeagueId}`
    );
    const votations = await instance.get(
      `/events/votations?sportId=1&competitionId=${LeagueId}&matchId=${match_id}`
    );

    const { currentMatch } = data.data;
    const votationsData = votations.data.data;

    let matchData = {
      id: parseInt(currentMatch.matchId),
      date: currentMatch.utcDate,
      awayTeam: {
        id: parseInt(currentMatch.awayTeam.teamId),
        name: currentMatch.awayTeam.teamName,
        score: currentMatch.awayTeam.score,
        starting: [],
        bench: [],
      },
      homeTeam: {
        id: parseInt(currentMatch.homeTeam.teamId),
        name: currentMatch.homeTeam.teamName,
        score: currentMatch.homeTeam.score,
        starting: [],
        bench: [],
      },
      status: switchStatus(currentMatch.status),
      timing: currentMatch.timing.val,
      events: [],
    };

    const playersToProcess = [];
    // Append match formations to matchData
    for (const v of votationsData.homeTeam.mainPlayers) {
      await appendPlayer(
        matchData.homeTeam.starting,
        v,
        playersToProcess,
        Player,
        matchData.homeTeam.id
      );
    }
    for (const v of votationsData.homeTeam.benchPlayers) {
      await appendPlayer(
        matchData.homeTeam.bench,
        v,
        playersToProcess,
        Player,
        matchData.homeTeam.id
      );
    }
    for (const v of votationsData.awayTeam.mainPlayers) {
      await appendPlayer(
        matchData.awayTeam.starting,
        v,
        playersToProcess,
        Player,
        matchData.awayTeam.id
      );
    }
    for (const v of votationsData.awayTeam.benchPlayers) {
      await appendPlayer(
        matchData.awayTeam.bench,
        v,
        playersToProcess,
        Player,
        matchData.awayTeam.id
      );
    }

    // Append events to matchData
    for (const v of votationsData.awayTeam.mainPlayers) {
      appendEvent(matchData.events, v);
    }
    for (const v of votationsData.awayTeam.benchPlayers) {
      appendEvent(matchData.events, v);
    }
    for (const v of votationsData.homeTeam.benchPlayers) {
      appendEvent(matchData.events, v);
    }
    for (const v of votationsData.homeTeam.mainPlayers) {
      appendEvent(matchData.events, v);
    }

    //order events by timing
    matchData.events.sort((a, b) => {
      return a.timing - b.timing;
    });

    res.send(matchData);

    if (matchData.status === 2 && cached === false) {
      console.log("Caching match " + matchData.id);
      //make the dots in the console log to show the progress
      const dots = setInterval(() => {
        process.stdout.write(".");
      }, 400);

      for (const player of playersToProcess) await setPlayer(player);

      await setEvents(matchData.events, matchData.id);
      for (const v of votationsData.awayTeam.mainPlayers) {
        await setStarting(
          matchData.id,
          true,
          v.playerId,
          matchData.awayTeam.id,
          v.isCaptain
        );
      }
      for (const v of votationsData.awayTeam.benchPlayers) {
        await setStarting(
          matchData.id,
          false,
          v.playerId,
          matchData.awayTeam.id,
          v.isCaptain
        );
      }
      for (const v of votationsData.homeTeam.benchPlayers) {
        await setStarting(
          matchData.id,
          true,
          v.playerId,
          matchData.homeTeam.id,
          v.isCaptain
        );
      }
      for (const v of votationsData.homeTeam.mainPlayers) {
        await setStarting(
          matchData.id,
          false,
          v.playerId,
          matchData.homeTeam.id,
          v.isCaptain
        );
      }
      await updateScore(
        matchData.id,
        matchData.homeTeam.score,
        matchData.awayTeam.score
      );
      await setCached(matchData.id);
      clearInterval(dots);
      console.log("Done!");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};

export const executeCron = async (req, res) => {
  const date = new Date();
  date.setHours(date.getHours() + 3);
  try {
    const fixtures = await Match.findAll({
      where: {
        cached: false,
        date: {
          [sequelize.Op.lt]: date,
        },
      },
    });

    for (const fixture of fixtures) {
      const { id, LeagueId } = fixture;
      const { data } = await instance.get(
        `/events/live?sportId=1&matchId=${id}&competitionId=${LeagueId}`
      );
      const votations = await instance.get(
        `/events/votations?sportId=1&competitionId=${LeagueId}&matchId=${id}`
      );
      const { currentMatch } = data.data;
      const votationsData = votations.data.data;

      let matchData = {
        id: parseInt(currentMatch.matchId),
        date: currentMatch.utcDate,
        awayTeam: {
          id: parseInt(currentMatch.awayTeam.teamId),
          name: currentMatch.awayTeam.teamName,
          score: currentMatch.awayTeam.score,
          starting: [],
          bench: [],
        },
        homeTeam: {
          id: parseInt(currentMatch.homeTeam.teamId),
          name: currentMatch.homeTeam.teamName,
          score: currentMatch.homeTeam.score,
          starting: [],
          bench: [],
        },
        status: switchStatus(currentMatch.status),
        timing: currentMatch.timing.val,
        events: [],
      };

      const playersToProcess = [];
      // Append match formations to matchData
      for (const v of votationsData.homeTeam.mainPlayers) {
        await appendPlayer(
          matchData.homeTeam.starting,
          v,
          playersToProcess,
          Player,
          matchData.homeTeam.id
        );
      }
      for (const v of votationsData.homeTeam.benchPlayers) {
        await appendPlayer(
          matchData.homeTeam.bench,
          v,
          playersToProcess,
          Player,
          matchData.homeTeam.id
        );
      }
      for (const v of votationsData.awayTeam.mainPlayers) {
        await appendPlayer(
          matchData.awayTeam.starting,
          v,
          playersToProcess,
          Player,
          matchData.awayTeam.id
        );
      }
      for (const v of votationsData.awayTeam.benchPlayers) {
        await appendPlayer(
          matchData.awayTeam.bench,
          v,
          playersToProcess,
          Player,
          matchData.awayTeam.id
        );
      }

      // Append events to matchData
      for (const v of votationsData.awayTeam.mainPlayers) {
        appendEvent(matchData.events, v);
      }
      for (const v of votationsData.awayTeam.benchPlayers) {
        appendEvent(matchData.events, v);
      }
      for (const v of votationsData.homeTeam.benchPlayers) {
        appendEvent(matchData.events, v);
      }
      for (const v of votationsData.homeTeam.mainPlayers) {
        appendEvent(matchData.events, v);
      }

      //order events by timing
      matchData.events.sort((a, b) => {
        return a.timing - b.timing;
      });

      console.log("Caching match " + matchData.id);
      //make the dots in the console log to show the progress
      const dots = setInterval(() => {
        process.stdout.write(".");
      }, 400);

      for (const player of playersToProcess) await setPlayer(player);

      await setEvents(matchData.events, matchData.id);
      for (const v of votationsData.awayTeam.mainPlayers) {
        await setStarting(
          matchData.id,
          true,
          v.playerId,
          matchData.awayTeam.id,
          v.isCaptain
        );
      }
      for (const v of votationsData.awayTeam.benchPlayers) {
        await setStarting(
          matchData.id,
          false,
          v.playerId,
          matchData.awayTeam.id,
          v.isCaptain
        );
      }
      for (const v of votationsData.homeTeam.benchPlayers) {
        await setStarting(
          matchData.id,
          true,
          v.playerId,
          matchData.homeTeam.id,
          v.isCaptain
        );
      }
      for (const v of votationsData.homeTeam.mainPlayers) {
        await setStarting(
          matchData.id,
          false,
          v.playerId,
          matchData.homeTeam.id,
          v.isCaptain
        );
      }
      await updateScore(
        matchData.id,
        matchData.homeTeam.score,
        matchData.awayTeam.score
      );
      await setCached(matchData.id);
      clearInterval(dots);
      console.log(`Match ${matchData.id} cached!`);
    }
    res.send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
};
