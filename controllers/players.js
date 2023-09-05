import { Event, Player } from "../db/models.js";
import { buildQuery, retrieveStats } from "../helpers/functions/common.js";

export const getPlayers = async (req, res) => {
  try {
    const response = await Player.findAll({ ...buildQuery(req) });
    return res.send(response);
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
    console.log(stats)

    response = { ...response, stats };
    return res.send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};
