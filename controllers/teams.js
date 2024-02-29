import { Team } from "../db/models.js";
import { buildQuery } from "../helpers/functions/common.js";
import { Op } from "sequelize";

export const getTeams = async (req, res) => {
  let obj = buildQuery(req);
  req.query?.leagueId ? (obj.where.leagueId = req.query.leagueId) : null;

  req.query?.name
    ? (obj.where.name = { [Op.like]: `%${req.query.name}%` })
    : null;

  let teams = await Team.findAll(obj);

  teams = teams.map((v) => {
    return {
      id: v.id,
      name: v.name,
    };
  });

  return res.send(teams);
};

export const getTeam = async (req, res) => {
  const { id } = req.params;
  const team = await Team.findOne({ where: { id } });
  return res.send(team);
};
