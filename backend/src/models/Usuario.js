/*
 * MODEL: Usuario (administradores do painel)
 * A senha NUNCA é salva em texto puro: guardamos o hash gerado pelo bcrypt.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // E-mail usado no login: único e com formato válido
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Informe um e-mail válido' }
    }
  },
  // Hash da senha (ex.: "$2b$10$...") — nunca a senha original
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'usuarios',
  timestamps: true
});

module.exports = Usuario;
