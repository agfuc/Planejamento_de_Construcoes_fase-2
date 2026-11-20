const sequelize = require('../config/database');
const Servico = require('./Servico');
const Solicitacao = require('./Solicitacao');
const Noticia = require('./Noticia');
const Evento = require('./Evento');
const Usuario = require('./Usuario'); // tabela independente (login do painel admin)

/*
 * RELACIONAMENTOS (todos 1:N — "um para muitos")
 *
 *   servicos (1) ──< solicitacoes (N)   servico_id obrigatório
 *   servicos (1) ──< noticias     (N)   servico_id opcional
 *   servicos (1) ──< eventos      (N)   servico_id opcional
 *
 * hasMany   → declarado no lado "1" (Serviço TEM MUITAS ...)
 * belongsTo → declarado no lado "N" (... PERTENCE A um Serviço)
 * O "as" é o apelido usado no include das consultas.
 */

// Serviço x Solicitação
// onDelete RESTRICT: o banco NÃO deixa excluir um serviço que tenha solicitações.
Servico.hasMany(Solicitacao, { foreignKey: 'servico_id', as: 'solicitacoes', onDelete: 'RESTRICT' });
Solicitacao.belongsTo(Servico, { foreignKey: 'servico_id', as: 'servico', onDelete: 'RESTRICT' });

// Serviço x Notícia
// onDelete SET NULL: se o serviço for excluído, a notícia continua, só perde o vínculo.
Servico.hasMany(Noticia, { foreignKey: 'servico_id', as: 'noticias', onDelete: 'SET NULL' });
Noticia.belongsTo(Servico, { foreignKey: 'servico_id', as: 'servico', onDelete: 'SET NULL' });

// Serviço x Evento
Servico.hasMany(Evento, { foreignKey: 'servico_id', as: 'eventos', onDelete: 'SET NULL' });
Evento.belongsTo(Servico, { foreignKey: 'servico_id', as: 'servico', onDelete: 'SET NULL' });

module.exports = {
  sequelize,
  Servico,
  Solicitacao,
  Noticia,
  Evento,
  Usuario
};
