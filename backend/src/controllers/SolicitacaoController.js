const { Solicitacao, Servico } = require('../models');
const responderErro = require('../utils/tratarErro');

// GET /api/solicitacoes - Lista todas as solicitações com o serviço vinculado
exports.listar = async (req, res) => {
  try {
    const solicitacoes = await Solicitacao.findAll({
      include: [{
        model: Servico,
        as: 'servico',
        attributes: ['id', 'titulo', 'icone']
      }],
      order: [['id', 'DESC']]
    });
    return res.status(200).json(solicitacoes);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao listar solicitações');
  }
};

// GET /api/solicitacoes/:id - Busca uma solicitação específica pelo ID
exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitacao = await Solicitacao.findByPk(id, {
      include: [{
        model: Servico,
        as: 'servico',
        attributes: ['id', 'titulo', 'descricao', 'icone']
      }]
    });

    if (!solicitacao) {
      return res.status(404).json({ erro: 'Solicitação não encontrada' });
    }

    return res.status(200).json(solicitacao);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao buscar solicitação');
  }
};

// POST /api/solicitacoes - Cria uma nova solicitação ligada a um serviço
exports.criar = async (req, res) => {
  try {
    const { nome_solicitante, email, telefone, mensagem, status, servico_id } = req.body;

    if (!nome_solicitante || !email || !mensagem || !servico_id) {
      return res.status(400).json({
        erro: 'Os campos nome_solicitante, email, mensagem e servico_id são obrigatórios'
      });
    }

    const servicoExistente = await Servico.findByPk(servico_id);
    if (!servicoExistente) {
      return res.status(400).json({ erro: 'O servico_id informado não existe' });
    }

    const novaSolicitacao = await Solicitacao.create({
      nome_solicitante,
      email,
      telefone: telefone || null,
      mensagem,
      status: status || 'Pendente',
      servico_id
    });

    return res.status(201).json(novaSolicitacao);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao criar solicitação');
  }
};

// PUT /api/solicitacoes/:id - Atualiza dados ou status de uma solicitação
exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_solicitante, email, telefone, mensagem, status, servico_id } = req.body;

    const solicitacao = await Solicitacao.findByPk(id);
    if (!solicitacao) {
      return res.status(404).json({ erro: 'Solicitação não encontrada' });
    }

    if (servico_id !== undefined) {
      const servicoExistente = await Servico.findByPk(servico_id);
      if (!servicoExistente) {
        return res.status(400).json({ erro: 'O servico_id informado não existe' });
      }
    }

    await solicitacao.update({
      nome_solicitante: nome_solicitante !== undefined ? nome_solicitante : solicitacao.nome_solicitante,
      email: email !== undefined ? email : solicitacao.email,
      telefone: telefone !== undefined ? telefone : solicitacao.telefone,
      mensagem: mensagem !== undefined ? mensagem : solicitacao.mensagem,
      status: status !== undefined ? status : solicitacao.status,
      servico_id: servico_id !== undefined ? servico_id : solicitacao.servico_id
    });

    return res.status(200).json(solicitacao);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao atualizar solicitação');
  }
};

// DELETE /api/solicitacoes/:id - Exclui uma solicitação
exports.excluir = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitacao = await Solicitacao.findByPk(id);

    if (!solicitacao) {
      return res.status(404).json({ erro: 'Solicitação não encontrada' });
    }

    await solicitacao.destroy();
    return res.status(200).json({ mensagem: 'Solicitação excluída com sucesso' });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao excluir solicitação');
  }
};
