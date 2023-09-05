import sequelize from "../conn.js";
import { DataTypes } from "sequelize";

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING, // can be admin or user
    allowNull: false,
  }
});

export default User;
