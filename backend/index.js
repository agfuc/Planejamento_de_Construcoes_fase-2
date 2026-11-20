const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const { popularBanco, criarAdminPadrao } = require('./src/database/seed');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ mensagem: 'API Planejamento Canoinhas ativa' });
});

app.use('/api', routes);

// Rota inexistente → 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Middleware de erro (tem 4 parâmetros): captura, por exemplo, um corpo JSON mal formatado
// enviado na requisição, e responde em JSON em vez da página HTML padrão do Express.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// sync({ alter: true }) → cria as tabelas que não existem e ADICIONA colunas novas
// nas tabelas existentes (ex.: servico_id em noticias/eventos), sem apagar os dados.
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Base de dados ligada e sincronizada.');

    // Carga inicial de dados de teste (só insere se o banco estiver vazio)
    await popularBanco();

    // Usuário administrador do painel (só cria se ainda não existir)
    await criarAdminPadrao();

    app.listen(PORT, () => {
      console.log(`Servidor a correr em http://localhost:${PORT}`);
    });
  })
  .catch((erro) => {
    console.error('Erro ao ligar à base de dados:', erro);
  });