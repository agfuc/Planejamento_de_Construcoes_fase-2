const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Solicitacao = sequelize.define('Solicitacao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome_solicitante: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    // Validação do Sequelize: rejeita e-mails mal formatados (ex.: "maria@")
    validate: {
      isEmail: { msg: 'Informe um e-mail válido' }
    }
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mensagem: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pendente',
    // Só aceita estes valores (os mesmos do <select> do painel admin)
    validate: {
      isIn: {
        args: [['Pendente', 'Em andamento', 'Concluído', 'Cancelado']],
        msg: 'Status inválido. Use: Pendente, Em andamento, Concluído ou Cancelado'
      }
    }
  },
  servico_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'servicos',
      key: 'id'
    }
  }
}, {
  tableName: 'solicitacoes',
  timestamps: true
});

module.exports = Solicitacao;