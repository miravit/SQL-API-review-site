const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize("workshopDb", "", "", {
  dialect: "sqlite",
  storage: path.join(__dirname, "workshopDb.sqlite"),
});

module.exports = { sequelize };
