import { Router } from "express";
import authorizedMiddleware from "../helpers/middleware/authorized.js";
import adminMiddleware from "../helpers/middleware/admin.js";
import { getPlayer, getPlayers } from "../controllers/players.js";

const router = Router();
const adminRoute = Router();
const authRoute = Router();

authRoute.use(authorizedMiddleware);
authRoute.get("/", getPlayers);
authRoute.get("/:id", getPlayer);
router.use(authRoute);

/* adminRoute.use(adminMiddleware);
router.use(adminRoute); */

export default router;
