/*
 * ============================================================================
 * CONTROLLER: AuthController (Login)
 * ============================================================================
 * Fluxo do POST /api/login:
 *   1. Recebe { email, senha } no corpo da requisição
 *   2. Busca o usuário pelo e-mail
 *   3. Compara a senha digitada com o HASH salvo (bcrypt.compare)
 *   4. Se estiver certa, gera um token JWT válido por 1 dia e devolve ao front
 * ============================================================================
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { SECRET } = require('../middlewares/auth');
const responderErro = require('../utils/tratarErro');

// POST /api/login
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Informe e-mail e senha' });
    }

    // 1) Procura o usuário pelo e-mail
    const usuario = await Usuario.findOne({ where: { email } });

    // 2) Compara a senha com o hash. A mensagem é a MESMA para e-mail ou senha
    //    errados, para não revelar quais e-mails estão cadastrados.
    const senhaValida = usuario && await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    }

    // 3) Gera o token JWT. O "payload" guarda só o id; expira em 1 dia.
    const token = jwt.sign({ id: usuario.id }, SECRET, { expiresIn: '1d' });

    // 4) Devolve o token e os dados do usuário (SEM a senha)
    return res.status(200).json({
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
      token
    });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao realizar login');
  }
};
