import { Event, Player } from "../db/models.js";
import { buildQuery, retrieveStats } from "../helpers/functions/common.js";
import { Op } from "sequelize";

export const getPlayers = async (req, res) => {
  try {
    let obj = buildQuery(req);
  
    req.query?.role && (obj.where.role = req.query.role);
    req.query?.teamId && (obj.where.TeamId = req.query.teamId);
    const response = await Player.findAll(obj);
    const filtered = [];
    for (const player of response) {
      delete player.dataValues.createdAt;
      delete player.dataValues.updatedAt;
      if (req.query?.name) {

        let completeName
        if (player.displayName == null) {
          completeName = `${player.dataValues.name} ${player.dataValues.surname}`;
        }
        else {
          completeName = player.displayName;
        }
        if (completeName.toLowerCase().includes(req.query.name.toLowerCase())) {
          filtered.push(player);
        }
      }
      else {
        filtered.push(player);
      }


    }
    return res.send(filtered);
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};

export const patchPlayer = async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  try {
    await Player.update(body, { where: { id } });
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};

export const getPlayer = async (req, res) => {
  const { id } = req.params;
  try {
    let response = await Player.findOne({ where: { id } });
    response = response?.dataValues;
    if (!response) {
      return res.status(404).send();
    }
    const stats = await retrieveStats(id);
    console.log(stats);

    response = { ...response, stats };
    return res.send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};
