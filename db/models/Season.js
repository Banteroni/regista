import sequelize from "../conn.js"
import { DataTypes } from "sequelize"


const Season = sequelize.define("Season", {
    from: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    to: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
})

export default Season