import {
  hashPassword,
  initializeLeagues,
  validateEnviroments,
} from "./helpers/functions/common.js";

import matchRoutes from "./routes/matches.js";
import leagueRoutes from "./routes/leagues.js";
import teamRoutes from "./routes/teams.js";
import usersRoutes from "./routes/users.js";
import playersRoutes from "./routes/players.js";
import express from "express";
import bodyParser from "body-parser";
import { config } from "dotenv";
import fs from "fs";
import cors from "cors";
import { generateKeyPairSync } from "crypto";
import { User } from "./db/models.js";

config();

//check if the key pairs exists, if not, create them and export them to be used in the auth routes
if (!fs.existsSync("./keys")) {
  fs.mkdirSync("./keys");
}
if (
  !fs.existsSync("./keys/private.pem") ||
  !fs.existsSync("./keys/public.pem")
) {
  console.log("No key pair provided, generating a new one...");
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
  fs.writeFileSync("./keys/private.pem", privateKey);
  fs.writeFileSync("./keys/public.pem", publicKey);
}
const privateKey = fs.readFileSync("./keys/private.pem", "utf8");
const publicKey = fs.readFileSync("./keys/public.pem", "utf8");
export { privateKey, publicKey };

//create public folder if it doeesn't exists
if (!fs.existsSync("./public")) {
  fs.mkdirSync("./public");
}
if (!fs.existsSync("./public/teams")) {
  fs.mkdirSync("./public/teams");
}

const main = async () => {
  validateEnviroments();
  await initializeLeagues();
  const app = express();
  app.use(cors());
  app.use(express.static("public"));
  app.use(bodyParser.json());

  app.use("/matches", matchRoutes);
  app.use("/users", usersRoutes);
  app.use("/leagues", leagueRoutes);
  app.use("/teams", teamRoutes);
  app.use("/players", playersRoutes);

  const PORT = process.env.PORT || 3000;


  //create the root user if root doesn't exists, and always update its password
  const root = await User.findOne({ where: { username: "root" } });
  if (root) {
    root.password = hashPassword(process.env.ROOT_PASSWORD);
    await root.save();
    console.log("Root user updated");
  } else {
    await User.create({
      username: "root",
      password: hashPassword(process.env.ROOT_PASSWORD),
      role: "admin",
    });
    console.log("Root user created");
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

main();
