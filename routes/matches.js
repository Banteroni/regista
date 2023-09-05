import { Router } from "express";
import { executeCron, getMatchInfos, getMatchweeks } from "../controllers/matches.js";
import adminMiddleware from "../helpers/middleware/admin.js";
import authorizedMiddleware from "../helpers/middleware/authorized.js";


const router = Router();
const authRoute = Router();
const adminRoute = Router();

adminRoute.use(adminMiddleware)
adminRoute.get("/", getMatchweeks)
adminRoute.get("/cron", executeCron)
router.use(adminRoute)


authRoute.use(authorizedMiddleware)
authRoute.get("/", getMatchweeks)
authRoute.get("/:match_id", getMatchInfos)
router.use(authRoute)






export default router

