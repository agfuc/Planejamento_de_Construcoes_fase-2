const { Servico, Solicitacao } = require('../models');
const responderErro = require('../utils/tratarErro');

// GET /api/servicos - Lista todos os serviços
exports.listar = async (req, res) => {
  try {
    const servicos = await Servico.findAll({
      order: [['id', 'ASC']]
    });
    return res.status(200).json(servicos);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao listar serviços');
  }
};

// GET /api/servicos/:id - Busca um serviço pelo ID
exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const servico = await Servico.findByPk(id);

    if (!servico) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }

    return res.status(200).json(servico);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao buscar serviço');
  }
};

// POST /api/servicos - Cria um novo serviço
exports.criar = async (req, res) => {
  try {
    const { titulo, descricao, icone } = req.body;

    if (!titulo || !descricao) {
      return res.status(400).json({ erro: 'Os campos titulo e descricao são obrigatórios' });
    }

    const novoServico = await Servico.create({
      titulo,
      descricao,
      icone: icone || null
    });

    return res.status(201).json(novoServico);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao criar serviço');
  }
};

// PUT /api/servicos/:id - Atualiza um serviço existente
exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, icone } = req.body;

    const servico = await Servico.findByPk(id);

    if (!servico) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }

    await servico.update({
      titulo: titulo !== undefined ? titulo : servico.titulo,
      descricao: descricao !== undefined ? descricao : servico.descricao,
      icone: icone !== undefined ? icone : servico.icone
    });

    return res.status(200).json(servico);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao atualizar serviço');
  }
};

// DELETE /api/servicos/:id - Remove um serviço
exports.excluir = async (req, res) => {
  try {
    const { id } = req.params;
    const servico = await Servico.findByPk(id);

    if (!servico) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }

    // Regra de integridade: não excluir serviço que ainda possui solicitações (FK RESTRICT)
    const totalSolicitacoes = await Solicitacao.count({ where: { servico_id: id } });
    if (totalSolicitacoes > 0) {
      return res.status(400).json({
        erro: `Não é possível excluir: existem ${totalSolicitacoes} solicitação(ões) vinculada(s) a este serviço`
      });
    }

    await servico.destroy();
    return res.status(200).json({ mensagem: 'Serviço excluído com sucesso' });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao excluir serviço');
  }
};