const { Noticia, Servico } = require('../models');
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

// GET /api/noticias - Lista todas as notícias (com o serviço vinculado)
exports.listar = async (req, res) => {
  try {
    const noticias = await Noticia.findAll({
      include: incluirServico,
      order: [['data_publicacao', 'DESC'], ['id', 'DESC']]
    });
    return res.status(200).json(noticias);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao listar notícias');
  }
};

// GET /api/noticias/:id - Busca uma notícia pelo ID
exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const noticia = await Noticia.findByPk(id, { include: incluirServico });

    if (!noticia) {
      return res.status(404).json({ erro: 'Notícia não encontrada' });
    }

    return res.status(200).json(noticia);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao buscar notícia');
  }
};

// POST /api/noticias - Cria uma nova notícia
exports.criar = async (req, res) => {
  try {
    const { titulo, resumo, conteudo, imagem, data_publicacao, servico_id } = req.body;

    if (!titulo || !conteudo) {
      return res.status(400).json({ erro: 'Os campos titulo e conteudo são obrigatórios' });
    }

    if (!(await servicoValido(servico_id))) {
      return res.status(400).json({ erro: 'O servico_id informado não existe' });
    }

    const novaNoticia = await Noticia.create({
      titulo,
      resumo: resumo || null,
      conteudo,
      imagem: imagem || null,
      data_publicacao: data_publicacao || undefined,
      servico_id: servico_id || null
    });

    return res.status(201).json(novaNoticia);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao criar notícia');
  }
};

// PUT /api/noticias/:id - Atualiza uma notícia existente
exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, resumo, conteudo, imagem, data_publicacao, servico_id } = req.body;

    const noticia = await Noticia.findByPk(id);
    if (!noticia) {
      return res.status(404).json({ erro: 'Notícia não encontrada' });
    }

    if (!(await servicoValido(servico_id))) {
      return res.status(400).json({ erro: 'O servico_id informado não existe' });
    }

    await noticia.update({
      titulo: titulo !== undefined ? titulo : noticia.titulo,
      resumo: resumo !== undefined ? resumo : noticia.resumo,
      conteudo: conteudo !== undefined ? conteudo : noticia.conteudo,
      imagem: imagem !== undefined ? imagem : noticia.imagem,
      data_publicacao: data_publicacao !== undefined ? data_publicacao : noticia.data_publicacao,
      servico_id: servico_id !== undefined ? (servico_id || null) : noticia.servico_id
    });

    return res.status(200).json(noticia);
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao atualizar notícia');
  }
};

// DELETE /api/noticias/:id - Exclui uma notícia
exports.excluir = async (req, res) => {
  try {
    const { id } = req.params;
    const noticia = await Noticia.findByPk(id);

    if (!noticia) {
      return res.status(404).json({ erro: 'Notícia não encontrada' });
    }

    await noticia.destroy();
    return res.status(200).json({ mensagem: 'Notícia excluída com sucesso' });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao excluir notícia');
  }
};
