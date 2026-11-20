const express = require('express');
const router = express.Router();
const EventController = require('../controllers/EventController');
const { authMiddleware } = require('../middlewares/auth');

// GET é público (o site exibe os dados). POST, PUT e DELETE exigem login (authMiddleware).

router.get('/', EventController.listar);
router.get('/:id', EventController.buscarPorId);
router.post('/', authMiddleware, EventController.criar);
router.put('/:id', authMiddleware, EventController.atualizar);
router.delete('/:id', authMiddleware, EventController.excluir);

module.exports = router;