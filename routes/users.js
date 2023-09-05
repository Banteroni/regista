import { Router } from "express";
import authorizedMiddleware from "../helpers/middleware/authorized.js";
import adminMiddleware from "../helpers/middleware/admin.js";
import { deleteUser, login, putUser } from "../controllers/users.js";
const router = Router();
const adminRoute = Router();
const authRoute = Router();
const publicRoute = Router();

router.use(publicRoute);
publicRoute.post("/login", login);

authRoute.use(authorizedMiddleware);
router.use(authRoute);

adminRoute.use(adminMiddleware);
adminRoute.put("/", putUser);
adminRoute.delete("/:user_id", deleteUser);
router.use(adminRoute);

export default router;
