const express = require('express');
const router = express.Router();
const ServicoController = require('../controllers/ServicoController');

router.get('/', ServicoController.listar);
router.get('/:id', ServicoController.buscarPorId);
router.post('/', ServicoController.criar);
router.put('/:id', ServicoController.atualizar);
router.delete('/:id', ServicoController.excluir);

module.exports = router;