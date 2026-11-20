const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evento = sequelize.define('Evento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data_evento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  local: {
    type: DataTypes.STRING,
    allowNull: true
  },
  horario: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Chave estrangeira (FK): liga o evento a um serviço da tabela "servicos".
  servico_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'servicos',
      key: 'id'
    }
  }
}, {
  tableName: 'eventos',
  timestamps: true
});

module.exports = Evento;