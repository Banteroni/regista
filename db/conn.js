import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

let sequelize;

switch (process.env.DB) {
  case "sqlite":
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: "db/db.sqlite",
      logging: process.env.NODE_ENV === "dev" ? console.log : false,
    });
    break;
  case "mysql":
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST ,
        port: process.env.DB_PORT || 3306,
        dialect: "mysql",
        logging: process.env.NODE_ENV === "dev" ? console.log : false,
      }
    );
    break;
  case "postgres":
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: "postgres",
        logging: process.env.NODE_ENV === "dev" ? console.log : false,
      }
    );
    break;
  case "mariadb":
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: "mariadb",
        logging: process.env.NODE_ENV === "dev" ? console.log : false,
      }
    );
  default:
    throw new Error("No database specified, stopping the app");
}
sequelize.authenticate().then(() => {
  console.log("Connection has been established successfully.");
});
export default sequelize;
