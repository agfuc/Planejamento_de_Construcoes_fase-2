/*
 * ============================================================================
 * TRATAMENTO CENTRALIZADO DE ERROS
 * ============================================================================
 * Usado no "catch" de todos os controllers.
 *
 * Decide o status HTTP de acordo com o TIPO de erro:
 *   400 Bad Request → o CLIENTE enviou um dado inválido
 *                     (e-mail mal formatado, data inválida, ID "abc", FK inexistente...)
 *   500 Internal    → falha inesperada do SERVIDOR (banco fora do ar, bug no código...)
 * ============================================================================
 */

// Códigos de erro do PostgreSQL causados por dados inválidos enviados pelo cliente
const CODIGOS_PG_DADO_INVALIDO = [
  '22P02', // invalid_text_representation → ex.: ID "abc" onde se espera número
  '22007', // invalid_datetime_format    → ex.: data "31/02/2026"
  '22008', // datetime_field_overflow    → ex.: data "2026-13-45"
  '22001'  // string_data_right_truncation → texto maior que o tamanho da coluna
];

function responderErro(res, erro, mensagem) {
  // 1) Erros de validação do Sequelize (validate, allowNull: false, unique)
  if (erro.name === 'SequelizeValidationError' || erro.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      erro: mensagem,
      detalhes: erro.errors.map((e) => e.message) // lista com a mensagem de cada campo
    });
  }

  // 2) Violação de chave estrangeira (ex.: servico_id que não existe)
  if (erro.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ erro: mensagem, detalhes: 'Referência inválida a outro registro (chave estrangeira)' });
  }

  // 3) Dado em formato inválido rejeitado pelo PostgreSQL
  if (erro.name === 'SequelizeDatabaseError' && erro.parent && CODIGOS_PG_DADO_INVALIDO.includes(erro.parent.code)) {
    return res.status(400).json({ erro: mensagem, detalhes: 'Formato de dado inválido: ' + erro.parent.message });
  }

  // 4) Qualquer outro caso é erro do servidor
  console.error(mensagem, erro);
  return res.status(500).json({ erro: mensagem, detalhes: erro.message });
}

module.exports = responderErro;
