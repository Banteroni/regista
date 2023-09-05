import { getTeam, getTeams } from "../controllers/teams.js";
import authorizedMiddleware from "../helpers/middleware/authorized.js";
import { Router } from "express";

const authRoute = Router();
authRoute.get("/", getTeams);
authRoute.get("/:id", getTeam);
authRoute.use(authorizedMiddleware)

export default authRoute;