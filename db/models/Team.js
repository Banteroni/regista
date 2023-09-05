import sequelize from "../conn.js";
import { DataTypes } from "sequelize";

const Team = sequelize.define("Team", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
/*     abbreviation: {
        type: DataTypes.STRING,
        allowNull: true,
    }, */
    src: {
        type: DataTypes.STRING,
        allowNull: false,
    },


})

export default Team