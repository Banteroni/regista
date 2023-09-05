import { config } from "dotenv";

import { verifyToken } from "../functions/tokens.js";
import { User } from "../../db/models.js";

config();

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).send();
    }
    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return res.status(401).send();
    }
    const foundUsername = await User.findOne({
      where: { username: decodedToken.username, role: "admin" },
    });
    if (!foundUsername) {
      return res.status(401).send();
    }
    next();
  } catch (error) {
    if (error.message === "jwt malformed") {
      return res.status(401).send();
    } else {
      console.log(error);
      return res.status(500).send();
    }
  }
};

export default adminMiddleware;
