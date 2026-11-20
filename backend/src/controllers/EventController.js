const { Evento: Event, Servico } = require('../models');
const responderErro = require('../utils/tratarErro');

// Configuração do JOIN: traz junto o serviço vinculado (relação belongsTo)
const incluirServico = [{
  model: Servico,
  as: 'servico',
  attributes: ['id', 'titulo', 'icone']
}];

// Verifica se o servico_id enviado existe. Retorna true se for válido ou vazio.
async function servicoValido(servico_id) {
  if (servico_id === undefined || servico_id === null || servico_id === '') return true;
  const servico = await Servico.findByPk(servico_id);
  return !!servico;
}

// GET /api/eventos - Lista todos os eventos (com o serviço vinculado)
exports.listar = async (req, res) => {
  try {
    const event = await Event.findAll({
      include: incluirServico,
      order: [['data_evento', 'ASC'], ['id', 'ASC']]
    });
    return res.status(200).json(event);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao listar eventos');
  }
};

// GET /api/eventos/:id - Busca um evento pelo ID
exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id, { include: incluirServico });

    if (!event) {
      return res.status(404).json({ erro: 'Evento não encontrado' });
    }

    return res.status(200).json(event);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao buscar evento');
  }
};

// POST /api/eventos - Cria um novo evento
exports.criar = async (req, res) => {
  try {
    const { titulo, descricao, data_evento, local, horario, servico_id } = req.body;

    if (!titulo || !descricao || !data_evento) {
      return res.status(400).json({
        erro: 'Os campos titulo, descricao e data_evento são obrigatórios'
      });
    }

    if (!(await servicoValido(servico_id))) {
      return res.status(400).json({ erro: 'O servico_id informado não existe' });
    }

    const novoEvent = await Event.create({
      titulo,
      descricao,
      data_evento,
      local: local || null,
      horario: horario || null,
      servico_id: servico_id || null
    });

    return res.status(201).json(novoEvent);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao criar evento');
  }
};

// PUT /api/eventos/:id - Atualiza um evento existente
exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, data_evento, local, horario, servico_id } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ erro: 'Evento não encontrado' });
    }

    if (!(await servicoValido(servico_id))) {
      return res.status(400).json({ erro: 'O servico_id informado não existe' });
    }

    await event.update({
      titulo: titulo !== undefined ? titulo : event.titulo,
      descricao: descricao !== undefined ? descricao : event.descricao,
      data_evento: data_evento !== undefined ? data_evento : event.data_evento,
      local: local !== undefined ? local : event.local,
      horario: horario !== undefined ? horario : event.horario,
      servico_id: servico_id !== undefined ? (servico_id || null) : event.servico_id
    });

    return res.status(200).json(event);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao atualizar evento');
  }
};

// DELETE /api/eventos/:id - Exclui um evento
exports.excluir = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ erro: 'Evento não encontrado' });
    }

    await event.destroy();
    return res.status(200).json({ mensagem: 'Evento excluído com sucesso' });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao excluir evento');
  }
};
