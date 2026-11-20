const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// Rota PÚBLICA: é aqui que o usuário consegue o token
router.post('/', AuthController.login);

module.exports = router;
