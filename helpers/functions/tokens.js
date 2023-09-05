import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { publicKey, privateKey } from "../../index.js";
config();

export const signToken = (data) => {
  const payload = {
    ...data,
    nbf: Date.now() / 1000,
    exp: (Date.now() + 1000 * 60 * 60 * 24 * 7) / 1000,
    iat: Date.now() / 1000,
  };
  const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
  return token;
};

export const verifyToken = (token) => {
  try {
    const decodedToken = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    return decodedToken;
  }
  catch (error) {
    return false
  }
};
