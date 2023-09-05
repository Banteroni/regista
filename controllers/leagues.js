import { Match, Team, League } from "../db/models.js";
import fs from "fs";
import instance from "../helpers/scraper/instance.js";

export const enableLeague = async (req, res) => {
  const loadTeams = async (league_id) => {
    const { data } = await instance.get(
      `/standings/teams?sportId=1&competitionId=${league_id}`
    );
    const object = data.data.contents[0].competitionTeams;
    const teams = [];

    for (const team of object) {
      //download team logo and set it in public/teams formatted as id.png
      if (!fs.existsSync(`./public/teams/${team.teamId}.png`)) {
        const response = await instance.get(
          `https://images2.gazzettaobjects.it/assets-mc/calcio/squadre/high/${team.teamId}.png`,
          { responseType: "arraybuffer" }
        );
        fs.writeFileSync(`./public/teams/${team.teamId}.png`, response.data);
      }
      const id = parseInt(team.teamId);
      const obj = {
        id: id,
        name: team.generalRanking.teamName,
        LeagueId: league_id,
        src: `/teams/${id}.png`,
      };
      teams.push(obj);
    }

    await Team.bulkCreate(teams, { updateOnDuplicate: ["name", "src"] });

    return;
  };

  try {
    const { league_id } = req.params;
    //check if the id is valid
    const record = await League.findOne({ where: { id: league_id } });
    if (!record) {
      return res.status(404).send();
    }
    await loadTeams(league_id);

    const { data } = await instance.get(
      `/sports/calendar?day=1&sportId=1&competitionId=${league_id}`
    );
    const object = data.data;
    const { games } = object;
    const matchesToAppend = [];

    await games.forEach(async (game) => {
      game.matches.forEach(async (match) => {
        matchesToAppend.push({ ...match, matchDay: 1 });
      });
    });

    for (let i = 2; i <= object.numberDays; i++) {
      const { data } = await instance.get(
        `/sports/calendar?day=${i}&sportId=1&competitionId=${league_id}`
      );
      const object = data.data;
      const { games } = object;
      await games.forEach(async (game) => {
        game.matches.forEach(async (match) => {
          matchesToAppend.push({ ...match, matchDay: i });
        });
      });
    }

    const parsed = matchesToAppend.map((match) => ({
      id: match.matchId,
      date: match.utcDate,
      matchDay: match.matchDay,
      homeTeamId: parseInt(match.homeTeam.teamId),
      awayTeamId: parseInt(match.awayTeam.teamId),
      LeagueId: league_id,
    }));

    for (const match of parsed) {
      try {
        await Match.findOrCreate({ where: { ...match } });
      } catch (error) {
        console.log(error);
      }
    }
    //set enabled of league to true
    await League.update({ enabled: true }, { where: { id: league_id } });
    console.log(`league ${league_id} enabled`);
    res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};

export const disableLeague = async (req, res) => {
  try {
    const { league_id } = req.params;
    await Match.destroy({ where: { LeagueId: league_id } });
    await Team.destroy({ where: { LeagueId: league_id } });
    await League.update({ enabled: false }, { where: { id: league_id } });
    res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};

export const getLeagues = async (req, res) => {
  try {
    if (req.admin) {
      const response = await League.findAll();
      return res.send(response);
    } else {
      const response = await League.findAll({ where: { enabled: true } });
      res.send(response);
      return;
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};

export const getLeague = async (req, res) => {
  try {
    const { league_id } = req.params;
    const response = await League.findOne({
      where: { id: league_id, enabled: true },
    });
    if (!response) {
      return res.status(404).send();
    }

    return res.send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};
