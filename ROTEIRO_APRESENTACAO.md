# Roteiro de Apresentação: Planejamento de Construções Canoinhas

Duração sugerida: **10 a 15 minutos de demonstração** e depois as perguntas do professor.

---

## ✅ Checklist: 15 minutos antes

- [ ] Serviço do PostgreSQL ligado. No pgAdmin, o banco `planejamento_canoinhas_db` aparece.
- [ ] Senha correta em `backend/src/config/database.js`.
- [ ] (Opcional) Resetar os dados de teste: `cd backend` → `npm run seed`.
- [ ] API rodando: `npm run dev`. O terminal mostra `Servidor a correr em http://localhost:3000`.
- [ ] Live Server ligado. O site abre em `http://127.0.0.1:5500/`.
- [ ] Insomnia aberto com as requisições prontas (ver passo 4).
- [ ] VS Code aberto com estes arquivos em abas:
      `models/index.js`, `Noticia.js`, `NoticiaController.js`, `NoticiaRoutes.js`, `tratarErro.js`, `seed.js`, `admin.js`.
- [ ] Navegador com o **F12 aberto na aba Rede (Network)**.
- [ ] Console do navegador **sem erros vermelhos**.

---

## 🎬 Roteiro da demonstração

### 1. Apresentar o sistema (≈ 1 min)

> "Nosso sistema é o site de uma empresa de planejamento de construções de Canoinhas. Ele mostra os **serviços** da empresa, publica **notícias** e **eventos** e recebe **solicitações de orçamento**. É full stack: o frontend em HTML, CSS e JavaScript consome, com `fetch`, uma API REST em Node.js com Express. A API grava os dados no PostgreSQL usando o Sequelize como ORM."

Mostrar: a página inicial do site, rolando a tela.

---

### 2. Banco de dados e modelagem (≈ 2 min)

**Abrir:** `backend/src/models/index.js`

> "São 4 tabelas. A tabela central é `servicos`. As outras três têm uma chave estrangeira `servico_id` apontando para ela, ou seja, são relações de **um para muitos**."

```
servicos (1) ──< solicitacoes (N)   RESTRICT
servicos (1) ──< noticias     (N)   SET NULL
servicos (1) ──< eventos      (N)   SET NULL
```

> "No Sequelize, eu declaro o `hasMany` no lado 1 e o `belongsTo` no lado N. As regras de exclusão são diferentes: uma solicitação não faz sentido sem o serviço, então o banco **bloqueia** a exclusão (RESTRICT). Já a notícia continua válida e só perde o vínculo (SET NULL)."

**Abrir:** `Noticia.js` e apontar o campo `servico_id` com `references`.

**Abrir o pgAdmin** e mostrar as tabelas e a coluna `servico_id` (Constraints → Foreign Keys).

**Abrir:** `seed.js`

> "Este arquivo faz a carga inicial de dados de teste. Ele roda quando a API inicia, só se o banco estiver vazio. Os serviços são inseridos primeiro porque as outras tabelas dependem do ID deles."

---

### 3. Arquitetura do backend em camadas (≈ 2 min)

Mostrar o caminho de **uma** requisição pelas camadas:

```
GET /api/noticias
  → index.js            app.use('/api', routes)
  → routes/index.js     router.use('/noticias', noticiaRoutes)
  → NoticiaRoutes.js    router.get('/', NoticiaController.listar)
  → NoticiaController   Noticia.findAll({ include: servico })
  → Model Noticia       Sequelize gera o SELECT ... LEFT JOIN servicos
  → res.status(200).json(noticias)
```

> "A **rota** só define a URL e o método. O **controller** valida os dados e decide o status HTTP. O **model** representa a tabela, e o Sequelize transforma os métodos em SQL."

---

### 4. CRUD pelo Insomnia, com status HTTP (≈ 3 min)

Deixe estas requisições prontas na entidade **Eventos**:

| # | Requisição | Corpo | Esperado |
|---|---|---|---|
| 1 | `GET /api/eventos` | — | **200**, com o `servico` vindo junto |
| 2 | `POST /api/eventos` | `{"titulo":"Demo","descricao":"Teste","data_evento":"2026-12-15","local":"IFSC","servico_id":1}` | **201** |
| 3 | `GET /api/eventos/<id>` | — | **200** |
| 4 | `PUT /api/eventos/<id>` | `{"titulo":"Demo editado"}` | **200** |
| 5 | `DELETE /api/eventos/<id>` | — | **200** |
| 6 | `GET /api/eventos/<id>` (de novo) | — | **404** |

E os erros:

| # | Requisição | Esperado |
|---|---|---|
| 7 | `POST /api/eventos` sem título | **400**, campos obrigatórios |
| 8 | `POST /api/eventos` com `"servico_id": 999` | **400**, serviço não existe |
| 9 | `DELETE /api/servicos/1` (serviço com solicitações) | **400**, exclusão bloqueada |
| 10 | `POST /api/solicitacoes` com `"email":"maria@"` | **400**, e-mail inválido |

> "O 400 indica que o cliente mandou um dado errado. O 404, que o recurso não existe. O 500 fica só para falhas do servidor. Para separar isso, todos os controllers usam a função `tratarErro`."

**Abrir:** `tratarErro.js` e mostrar como o `erro.name` decide o status.

---

### 5. Site público: frontend dinâmico (≈ 2 min)

Com o **F12 → Rede** aberto, recarregar a página.

> "Ao carregar, o `script.js` faz 3 requisições `fetch`: serviços, notícias e eventos. Cada resposta vira HTML montado dinamicamente."

Mostrar as **seções dinâmicas**:
1. **Cards de serviços:** título, descrição e ícone vêm do banco.
2. **Select do formulário:** as opções são os serviços do banco, e o `value` é o ID (a FK).
3. **Blog:** a lista de notícias.
4. **Agenda:** os eventos, com dia e mês calculados a partir da data.

**Enviar o formulário de contato** e mostrar o **POST 201** na aba Rede.

> "Para provar que é dinâmico, vou cadastrar um serviço no painel e ele aparece aqui."

---

### 6. Painel administrativo (≈ 3 min)

Abrir pelo link **Painel Administrativo** no rodapé.

1. **Aba Serviços → cadastrar** um serviço novo (ícone `wrench`). Aparece `✅ 201`.
2. **Voltar ao site e recarregar.** O card novo aparece. **Esse é o momento-chave da demonstração.**
3. **Aba Solicitações → ✏️ editar** a solicitação enviada no passo 5 e mudar o status para "Em andamento". Aparece `✅ 200`, e na aba Rede um **PUT**.
4. **Aba Notícias → editar** uma notícia e trocar o "Serviço relacionado". A coluna Serviço muda na tabela.
5. **Aba Serviços → 🗑️ excluir** o serviço criado no item 1. Aparece `✅ 200`, e na aba Rede um **DELETE**.
6. **Tentar excluir** um serviço que tem solicitações. Aparece `❌ 400 — Não é possível excluir...`

**Abrir:** `admin.js` e mostrar a função `requisicao()` e o objeto `ENTIDADES`.

> "As 4 abas usam as mesmas funções. O que muda é a configuração: rota, campos e colunas. O mesmo botão faz POST ou PUT, conforme a variável `idEditando`."

---

### 7. Encerramento (≈ 30 s)

> "Resumindo: são 4 tabelas relacionadas com chave estrangeira, CRUD completo das 4 entidades na API em camadas, status HTTP coerentes, carga inicial de dados e um frontend que consome tudo com `fetch`, tanto no site quanto no painel administrativo."

---

## 🆘 Plano B

| Problema na hora | O que fazer |
|---|---|
| A API não sobe (erro no banco) | Conferir o serviço do PostgreSQL e a senha em `database.js` (ver `INSTALACAO.md`) |
| O site aparece com dados fixos | A API está desligada. Rodar `npm run dev` |
| A porta 3000 está ocupada | Fechar o outro terminal que está rodando a API |
| Dados bagunçados durante os testes | `Ctrl+C` → `npm run seed` → `npm run dev` |
| O Live Server mostra uma lista de pastas | Acessar `http://127.0.0.1:5500/frontend/index.html` |

---

## ❓ Perguntas prováveis e respostas

### Banco de dados / ORM

**O que é um ORM e por que usar o Sequelize?**
É uma ferramenta que mapeia tabelas para objetos JavaScript. Em vez de escrever SQL na mão, usamos `findAll`, `create`, `update` e `destroy`, e o Sequelize gera o SQL. Isso dá menos código repetido, mais proteção contra SQL injection e facilita trocar de banco.

**Onde estão as chaves primárias e estrangeiras?**
A PK é o `id` de cada model (`primaryKey: true, autoIncrement: true`). A FK é o `servico_id` em Solicitacao, Noticia e Evento, com `references: { model: 'servicos', key: 'id' }`.

**Qual a diferença entre `hasMany` e `belongsTo`?**
O `hasMany` fica no lado "1" (Serviço tem muitas Notícias) e o `belongsTo` no lado "N" (Notícia pertence a um Serviço). Com os dois declarados, dá para usar `include` nos dois sentidos.

**O que o `include` faz?**
Gera um `LEFT JOIN`. A notícia volta com o objeto `servico` dentro do JSON.

**Qual a diferença entre `sync()`, `sync({ alter: true })` e `sync({ force: true })`?**
O `sync()` só cria as tabelas que não existem. O `alter` ajusta as tabelas existentes, adicionando colunas, e mantém os dados. O `force` apaga e recria tudo. O `npm run seed` usa `force`.

**Por que RESTRICT em solicitações e SET NULL em notícias?**
Uma solicitação sem serviço perde o sentido, então a exclusão do serviço é bloqueada. Uma notícia continua válida sem o vínculo, então ela só fica com `servico_id` nulo.

**O que é o `bulkCreate`?**
Insere vários registros em um único comando. O `returning: true` devolve os IDs gerados, que o seed usa como FK.

### Backend / API

**O que é uma API REST?**
É uma API em que cada URL representa um recurso (`/servicos`) e o método HTTP define a ação: GET lê, POST cria, PUT atualiza e DELETE remove. As respostas vêm em JSON.

**Por que dividir em rotas, controllers e models?**
Para separar responsabilidades. A rota define o caminho, o controller cuida das regras e do status HTTP, e o model cuida dos dados. Fica mais fácil de manter e de testar.

**O que o `express.json()` faz?**
É o middleware que converte o corpo da requisição (texto JSON) em objeto, disponível em `req.body`.

**O que é o `cors()` e por que é necessário?**
O site roda em `127.0.0.1:5500` e a API em `localhost:3000`. Como as origens são diferentes, o navegador bloqueia o `fetch` sem o cabeçalho de CORS. O `cors()` libera esse acesso.

**Qual a diferença entre `req.params` e `req.body`?**
O `req.params` traz os valores da URL (o `:id` em `/servicos/5`). O `req.body` traz os dados enviados no corpo (POST/PUT).

**Quando a API retorna 201 e quando retorna 200?**
Retorna 201 (Created) quando um recurso novo é criado, no POST. Retorna 200 (OK) nas leituras, atualizações e exclusões bem-sucedidas.

**Como a API decide entre 400 e 500?**
Pela função `tratarErro`. Erros de validação do Sequelize, de FK ou de formato de dado viram 400. O resto vira 500.

**Por que o middleware de erro tem 4 parâmetros?**
O Express identifica um middleware de erro pela assinatura `(err, req, res, next)`.

**Por que validar no backend se o HTML já tem `required`?**
Porque qualquer pessoa pode chamar a API direto (Insomnia, Postman) e passar por cima do navegador. A validação no front é para a experiência do usuário. A validação no back é a que garante a segurança.

**Como o PUT funciona se eu mandar só um campo?**
O controller usa `campo !== undefined ? campo : registro.campo`. Só os campos enviados mudam, e os outros mantêm o valor atual.

### Frontend

**Como funciona o `fetch` com `async/await`?**
O `fetch` devolve uma Promise. O `await` espera a resposta, `res.json()` converte o corpo e `res.ok` indica se o status está entre 200 e 299.

**Como os dados viram HTML?**
Com `array.map()`, que gera uma string de HTML para cada registro. O `.join('')` junta tudo, e o resultado é atribuído ao `innerHTML` do container.

**Para que serve o `escapeHtml`?**
Evita XSS. Se alguém cadastrar um título com `<script>`, ele aparece como texto e não é executado.

**Como os botões criados dinamicamente funcionam?**
Por delegação de eventos. Um único listener no `<tbody>` usa `e.target.closest('[data-acao]')` para descobrir qual botão foi clicado e lê o ID em `data-id`.

**Como o mesmo formulário faz POST e PUT?**
Pela variável `idEditando`. Quando é `null`, faz POST. Quando tem um ID, faz PUT em `/entidade/:id`.

**Por que `event.preventDefault()` no formulário?**
Para impedir o comportamento padrão do formulário, que recarregaria a página. O envio é feito pelo `fetch`.

---

## 👥 Divisão sugerida (se for em equipe)

| Integrante | Parte | Arquivos para dominar |
|---|---|---|
| 1 | Banco e modelagem (passo 2) | `models/*`, `seed.js`, `database.js` |
| 2 | API e status HTTP (passos 3 e 4) | `routes/*`, `controllers/*`, `tratarErro.js`, `index.js` |
| 3 | Site público (passo 5) | `index.html`, `script.js` |
| 4 | Painel admin (passo 6) | `admin/index.html`, `admin.js` |

> As perguntas são **individuais**. Cada integrante deve conseguir explicar pelo menos o fluxo completo de **uma** requisição, da tela até o banco.
