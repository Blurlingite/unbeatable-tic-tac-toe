require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development", // Enable logging in development
    pool: {
      max: 5, // Maximum number of connections in pool
      min: 0, // Minimum number of connections in pool
      acquire: 30000, // The maximum time, in milliseconds, that a connection can be idle before being released
      idle: 10000, // The maximum time, in milliseconds, that pool will try to get connection before throwing error
    },
  }
);

module.exports = sequelize;
