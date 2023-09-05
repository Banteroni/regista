import { Router } from "express";
import { enableLeague, disableLeague, getLeagues, getLeague } from "../controllers/leagues.js";
import adminMiddleware from "../helpers/middleware/admin.js";
import authorizedMiddleware from "../helpers/middleware/authorized.js";

const router = Router();
const adminRoute = Router();
const authRoute = Router();

authRoute.use(authorizedMiddleware);
authRoute.get("/", getLeagues);
authRoute.get("/:league_id", getLeague);

router.use(authRoute);

adminRoute.use(adminMiddleware);
adminRoute.put("/:league_id", enableLeague);
adminRoute.delete("/:league_id", disableLeague);
router.use(adminRoute);

export default router;