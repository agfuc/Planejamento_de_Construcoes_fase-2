const express = require('express');
const router = express.Router();

const servicoRoutes = require('./ServicoRoutes');
const solicitacaoRoutes = require('./SolicitacaoRoutes');
const noticiaRoutes = require('./NoticiaRoutes');
const eventoRoutes = require('./EventRoutes');
const authRoutes = require('./AuthRoutes');

router.use('/servicos', servicoRoutes);
router.use('/solicitacoes', solicitacaoRoutes);
router.use('/noticias', noticiaRoutes);
router.use('/eventos', eventoRoutes);
router.use('/login', authRoutes);

module.exports = router;