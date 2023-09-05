import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { verifyToken } from "../functions/tokens.js";
import { publicKey } from "../../index.js";
import { User } from "../../db/models.js";

config();

const authorizedMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization || req.headers.authorization.length < 7) {
      return res.status(401).send();
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).send();
    }

    const decodedToken = verifyToken(token);
    if (decodedToken === false) {
      return res.status(401).send();
    }
    
    const foundUsername = await User.findOne({
      where: { username: decodedToken.username },
    });
    if (!foundUsername) {
      return res.status(401).send();
    }
    //if admin, add admin property to req
    if (decodedToken.role === "admin") {
      req.admin = true;
    } else {
      req.admin = false;
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

export default authorizedMiddleware;
