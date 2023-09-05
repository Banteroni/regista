import sequelize from "../conn.js";
import { DataTypes } from "sequelize";

const Starting = sequelize.define("Starting", {
  position: {
    type: DataTypes.BOOLEAN,
    allowNull: false, // false if player starts on the bench, true if player starts on the pitch
  },
  captain: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

export default Starting;
