import sequelize from "../conn.js";
import { DataTypes } from "sequelize";

const Match = sequelize.define("Match", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    matchDay: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    homeTeamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreighKey: true,
    },
    awayTeamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreighKey: true,
    },
    homeTeamScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    awayTeamScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    cached: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,

    }
    

})

export default Match