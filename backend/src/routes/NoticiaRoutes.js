const express = require('express');
const router = express.Router();
const NoticiaController = require('../controllers/NoticiaController');

router.get('/', NoticiaController.listar);
router.get('/:id', NoticiaController.buscarPorId);
router.post('/', NoticiaController.criar);
router.put('/:id', NoticiaController.atualizar);
router.delete('/:id', NoticiaController.excluir);

module.exports = router;