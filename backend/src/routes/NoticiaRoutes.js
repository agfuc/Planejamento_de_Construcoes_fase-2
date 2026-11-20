const express = require('express');
const router = express.Router();
const NoticiaController = require('../controllers/NoticiaController');
const { authMiddleware } = require('../middlewares/auth');

// GET é público (o site exibe os dados). POST, PUT e DELETE exigem login (authMiddleware).

router.get('/', NoticiaController.listar);
router.get('/:id', NoticiaController.buscarPorId);
router.post('/', authMiddleware, NoticiaController.criar);
router.put('/:id', authMiddleware, NoticiaController.atualizar);
router.delete('/:id', authMiddleware, NoticiaController.excluir);

module.exports = router;