import fs from "fs";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { signToken } from "../helpers/functions/tokens.js";
import { User } from "../db/models.js";
import { createHash } from "crypto";
import { hashPassword } from "../helpers/functions/common.js";
config();

export const login = async (req, res) => {
  try {
    //check if body has email and password
    if (!req.body) {
      return res.status(400).send();
    }
    const { body } = req;
    if (!body || !body.username || !body.password) {
      return res.status(400).send();
    }
    //check if email and password match
    let { username, password } = body;
    password = hashPassword(password);
    const user = await User.findOne({ where: { username, password } });
    if (!user) {
      return res.status(401).send();
    }
    //create token
    const token = signToken({ username: user.username, role: user.role });
    res.send({ token });
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};

export const putUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send();
    }
    const { body } = req;
    if (!body || !body.username || !body.password || !body.role) {
      return res.status(400).send();
    }
    let { username, password, role } = body;
    password = hashPassword(password);
    const user = await User.findOne({ where: { username } });
    if (user?.id) {
      return res.status(400).send({ message: "User already exists" });
    } else {
      const { id } = await User.create({
        username,
        password,
        role,
      });
      return res.status(200).send({ id });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findOne({ where: { id: user_id } });
    if (!user) {
      return res.status(404).send();
    }
    await User.destroy({ where: { id: user_id } });
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};
