import sequelize from "../conn.js";
import { DataTypes } from "sequelize";

const Event = sequelize.define("Event", {

    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    timing: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
})

export default Event