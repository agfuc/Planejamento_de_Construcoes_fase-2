const express = require('express');
const router = express.Router();

const servicoRoutes = require('./ServicoRoutes');
const solicitacaoRoutes = require('./SolicitacaoRoutes');
const noticiaRoutes = require('./NoticiaRoutes');
const eventoRoutes = require('./EventRoutes');

router.use('/servicos', servicoRoutes);
router.use('/solicitacoes', solicitacaoRoutes);
router.use('/noticias', noticiaRoutes);
router.use('/eventos', eventoRoutes);

module.exports = router;