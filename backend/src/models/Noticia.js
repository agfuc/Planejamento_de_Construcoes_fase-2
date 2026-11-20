const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Noticia = sequelize.define('Noticia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resumo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  conteudo: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  imagem: {
    type: DataTypes.STRING,
    allowNull: true
  },
  data_publicacao: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  // Chave estrangeira (FK): liga a notícia a um serviço da tabela "servicos".
  // allowNull: true → a notícia pode existir sem estar ligada a um serviço.
  servico_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'servicos',
      key: 'id'
    }
  }
}, {
  tableName: 'noticias',
  timestamps: true
});

module.exports = Noticia;