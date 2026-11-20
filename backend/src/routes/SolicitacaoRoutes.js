const express = require('express');
const router = express.Router();
const SolicitacaoController = require('../controllers/SolicitacaoController');
const { authMiddleware } = require('../middlewares/auth');

// POST é público (formulário de contato do site). Ler, editar e excluir exigem login,
// pois as solicitações contêm dados pessoais dos clientes.

router.get('/', authMiddleware, SolicitacaoController.listar);
router.get('/:id', authMiddleware, SolicitacaoController.buscarPorId);
router.post('/', SolicitacaoController.criar);
router.put('/:id', authMiddleware, SolicitacaoController.atualizar);
router.delete('/:id', authMiddleware, SolicitacaoController.excluir);

module.exports = router;