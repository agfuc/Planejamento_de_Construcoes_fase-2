/*
 * ============================================================================
 * SEED — CARGA INICIAL DE DADOS DE TESTE
 * ============================================================================
 * Popula o banco com dados de exemplo para o site não abrir vazio.
 *
 * Ordem de inserção IMPORTA por causa das chaves estrangeiras:
 *   1º servicos     (tabela "pai", não depende de ninguém)
 *   2º noticias, eventos, solicitacoes (tabelas "filhas", usam servico_id)
 *
 * A função só insere se a tabela de serviços estiver VAZIA,
 * assim os dados não são duplicados a cada vez que o servidor reinicia.
 * ============================================================================
 */

const { Servico, Noticia, Evento, Solicitacao } = require('../models');

async function popularBanco() {
  const total = await Servico.count();
  if (total > 0) {
    console.log('Seed ignorado: o banco já possui dados.');
    return;
  }

  // 1) SERVIÇOS — bulkCreate insere vários registros de uma vez (INSERT múltiplo)
  //    "icone" é o nome do ícone do Phosphor Icons (usado como ph-<icone> no site)
  const servicos = await Servico.bulkCreate([
    { titulo: 'Planejamento de Obras', icone: 'blueprint',
      descricao: 'Desenvolvemos o plano completo da sua construção: escopo, cronograma, recursos e orçamento detalhado para garantir entregas no prazo.' },
    { titulo: 'Gestão de Cronogramas', icone: 'calendar-check',
      descricao: 'Acompanhamento em tempo real de todas as etapas da obra. Identificamos desvios e tomamos ações corretivas antes que impactem o projeto.' },
    { titulo: 'Compatibilização BIM', icone: 'cube',
      descricao: 'Integração entre projetos arquitetônicos, estruturais e de instalações em modelo 3D, eliminando conflitos e reduzindo custos imprevistos.' },
    { titulo: 'Orçamento Executivo', icone: 'currency-dollar',
      descricao: 'Elaboração de orçamentos precisos com memória de cálculo completa, composições unitárias e controle de custos durante toda a execução.' },
    { titulo: 'Fiscalização de Obras', icone: 'hard-hat',
      descricao: 'Acompanhamento técnico presencial e remoto para garantir que a obra seja executada dentro das normas, especificações e padrões de qualidade.' },
    { titulo: 'Relatórios Gerenciais', icone: 'chart-line-up',
      descricao: 'Dashboards e relatórios periódicos com indicadores de desempenho, progresso físico-financeiro e previsões para tomada de decisão assertiva.' }
  ], { returning: true }); // returning: true → devolve os registros com o ID gerado pelo banco

  // Atalhos para usar os IDs gerados como chave estrangeira
  const [planejamento, cronogramas, bim, orcamento, fiscalizacao] = servicos;

  // 2) NOTÍCIAS — ligadas a um serviço pelo servico_id
  await Noticia.bulkCreate([
    { titulo: 'Construções Inteligentes: o futuro das obras urbanas',
      resumo: 'Como tecnologia BIM e IoT estão revolucionando o gerenciamento de grandes empreendimentos nas cidades.',
      conteudo: 'A modelagem BIM aliada a sensores IoT permite acompanhar a obra em tempo real, antecipar problemas e reduzir desperdícios.',
      imagem: 'img/img_03.jpg', data_publicacao: '2026-11-10', servico_id: bim.id },
    { titulo: 'Gestão de custos: como evitar estouros de orçamento',
      resumo: 'Principais erros no planejamento financeiro de obras e as melhores práticas para manter o controle do investimento.',
      conteudo: 'Um orçamento executivo bem detalhado e revisado a cada etapa é a melhor defesa contra surpresas financeiras.',
      imagem: 'img/img_05.jpg', data_publicacao: '2026-10-28', servico_id: orcamento.id },
    { titulo: 'Fiscalização: a garantia de uma obra dentro das normas',
      resumo: 'Entenda por que o acompanhamento técnico é essencial para a segurança e a qualidade da construção.',
      conteudo: 'A fiscalização confere se a execução segue o projeto, as normas técnicas e as especificações de materiais.',
      imagem: 'img/img_02.jpg', data_publicacao: '2026-10-15', servico_id: fiscalizacao.id }
  ]);

  // 3) EVENTOS — ligados a um serviço pelo servico_id
  await Evento.bulkCreate([
    { titulo: 'Bate Papo: Construção do Futuro', descricao: 'Conversa aberta sobre tendências da construção civil.',
      data_evento: '2026-11-28', local: 'CREA-SC', horario: '19h30', servico_id: planejamento.id },
    { titulo: 'Workshop: BIM na Prática para Gestores', descricao: 'Oficina prática de modelagem e compatibilização BIM.',
      data_evento: '2026-12-03', local: 'Online', horario: '14h00', servico_id: bim.id },
    { titulo: 'Palestra: Cronogramas que Funcionam', descricao: 'Técnicas para manter a obra dentro do prazo.',
      data_evento: '2026-12-10', local: 'Canoinhas/SC', horario: '18h00', servico_id: cronogramas.id }
  ]);

  // 4) SOLICITAÇÕES — servico_id é OBRIGATÓRIO aqui
  await Solicitacao.bulkCreate([
    { nome_solicitante: 'Maria Souza', email: 'maria@exemplo.com', telefone: '(47) 99999-1111',
      mensagem: 'Gostaria de um orçamento para uma casa de 120m².', status: 'Pendente', servico_id: orcamento.id },
    { nome_solicitante: 'João Pereira', email: 'joao@exemplo.com', telefone: '(47) 99999-2222',
      mensagem: 'Preciso de planejamento para um galpão industrial de 500m².', status: 'Em andamento', servico_id: planejamento.id },
    { nome_solicitante: 'Ana Lima', email: 'ana@exemplo.com', telefone: null,
      mensagem: 'Quero compatibilizar os projetos do meu prédio comercial.', status: 'Concluído', servico_id: bim.id }
  ]);

  console.log('Seed concluído: 6 serviços, 3 notícias, 3 eventos e 3 solicitações cadastrados.');
}

module.exports = popularBanco;

/*
 * Execução manual: "npm run seed"
 * APAGA todas as tabelas, recria e popula de novo (útil para resetar antes da apresentação).
 * O bloco abaixo só roda quando o arquivo é executado direto (node seed.js),
 * e NÃO quando ele é importado pelo index.js.
 */
if (require.main === module) {
  const { sequelize } = require('../models');
  sequelize.sync({ force: true })
    .then(popularBanco)
    .then(() => sequelize.close())
    .catch((erro) => {
      console.error('Erro ao executar o seed:', erro);
      process.exit(1);
    });
}
