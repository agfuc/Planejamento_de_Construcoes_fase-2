const express = require('express');
const router = express.Router();
const EventController = require('../controllers/EventController');

router.get('/', EventController.listar);
router.get('/:id', EventController.buscarPorId);
router.post('/', EventController.criar);
router.put('/:id', EventController.atualizar);
router.delete('/:id', EventController.excluir);

module.exports = router;