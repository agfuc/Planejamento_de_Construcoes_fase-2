const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('planejamento_canoinhas_db', 'postgres', '123456', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false
});

module.exports = sequelize;