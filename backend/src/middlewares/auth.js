/*
 * ============================================================================
 * MIDDLEWARE DE AUTENTICAÇÃO (auth.js)
 * ============================================================================
 * Um middleware fica NO MEIO do caminho entre a rota e o controller:
 *
 *   requisição → [ authMiddleware ] → controller → resposta
 *
 * Ele funciona como um "segurança na porta":
 *   → Token JWT válido no cabeçalho Authorization? Chama next() e deixa passar.
 *   → Sem token ou token inválido/expirado? Responde 401 e o controller nem roda.
 * ============================================================================
 */

const jwt = require('jsonwebtoken');

/*
 * Chave secreta usada para ASSINAR (no login) e VERIFICAR (aqui) os tokens.
 * Em produção deve ficar em variável de ambiente (.env), nunca no código.
 * Para fins didáticos, usamos um valor padrão caso JWT_SECRET não exista.
 */
const SECRET = process.env.JWT_SECRET || 'planejamento_canoinhas_secret';

const authMiddleware = (req, res, next) => {
  // Formato esperado do cabeçalho: "Authorization: Bearer eyJhbGciOi..."
  const tokenHeader = req.headers['authorization'];

  if (!tokenHeader) {
    return res.status(401).json({ erro: 'Acesso negado: nenhum token fornecido' });
  }

  // Separa "Bearer" do token: ['Bearer', 'eyJ...']
  const [tipo, token] = tokenHeader.split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Formato de token inválido. Use: Bearer <token>' });
  }

  // jwt.verify confere a assinatura e a validade (expiração) do token
  jwt.verify(token, SECRET, (erro, decodificado) => {
    if (erro) {
      return res.status(401).json({ erro: 'Token inválido ou expirado. Faça login novamente' });
    }

    // Guarda o ID do usuário logado na requisição (o controller pode usar se quiser)
    req.usuarioId = decodificado.id;

    // Tudo certo: passa para o próximo passo (o controller)
    next();
  });
};

module.exports = { authMiddleware, SECRET };
