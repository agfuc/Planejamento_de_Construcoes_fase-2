const express = require('express');
const router = express.Router();
const SolicitacaoController = require('../controllers/SolicitacaoController');

router.get('/', SolicitacaoController.listar);
router.get('/:id', SolicitacaoController.buscarPorId);
router.post('/', SolicitacaoController.criar);
router.put('/:id', SolicitacaoController.atualizar);
router.delete('/:id', SolicitacaoController.excluir);

module.exports = router;