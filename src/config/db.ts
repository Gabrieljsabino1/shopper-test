import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  database: process.env.DB_NAME || "shopper-test",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
});

export { sequelize };
