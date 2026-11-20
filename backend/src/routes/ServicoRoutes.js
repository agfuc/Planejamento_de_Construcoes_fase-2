const express = require('express');
const router = express.Router();
const ServicoController = require('../controllers/ServicoController');
const { authMiddleware } = require('../middlewares/auth');

// GET é público (o site exibe os dados). POST, PUT e DELETE exigem login (authMiddleware).

router.get('/', ServicoController.listar);
router.get('/:id', ServicoController.buscarPorId);
router.post('/', authMiddleware, ServicoController.criar);
router.put('/:id', authMiddleware, ServicoController.atualizar);
router.delete('/:id', authMiddleware, ServicoController.excluir);

module.exports = router;