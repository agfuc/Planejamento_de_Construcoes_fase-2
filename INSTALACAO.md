# Guia de Instalação: Planejamento de Construções Canoinhas

Passo a passo para rodar o projeto em **outro computador** (Windows).

---

## 1. Programas necessários

Instale estes programas, se ainda não estiverem no computador:

| Programa | Para que serve | Download |
|---|---|---|
| **Node.js** (versão 18 ou superior; recomendado a LTS) | Rodar a API | https://nodejs.org |
| **PostgreSQL** (versão 14 ou superior) | Banco de dados | https://www.postgresql.org/download/windows/ |
| **pgAdmin 4** | Visualizar o banco (já vem junto no instalador do PostgreSQL) | (incluso) |
| **VS Code** + extensão **Live Server** | Editar o código e abrir o site | https://code.visualstudio.com |
| **Insomnia** (opcional) | Testar a API (POST, PUT, DELETE) | https://insomnia.rest |

Para conferir se o Node foi instalado, abra o terminal e digite:

```bash
node -v
npm -v
```

Os dois comandos devem mostrar um número de versão.

> ⚠️ **Durante a instalação do PostgreSQL**, anote a **senha** definida para o usuário `postgres` e mantenha a **porta 5432**. Você vai precisar das duas no passo 3.

---

## 2. Copiar o projeto

Copie a pasta `planejamento_canoinhas-main` para o computador (pendrive, zip ou GitHub).

> 💡 **Não precisa copiar a pasta `backend/node_modules`**, porque ela é recriada no passo 4. Sem ela, a cópia fica bem menor.

---

## 3. Criar e configurar o banco de dados

### 3.1 Criar o banco

**Opção A: pelo pgAdmin**
1. Abra o pgAdmin e conecte no servidor (com a senha do `postgres`).
2. Clique com o botão direito em **Databases → Create → Database...**
3. Em **Database**, digite: `planejamento_canoinhas_db`
4. Clique em **Save**.

**Opção B: pelo terminal (psql)**
```bash
psql -U postgres -c "CREATE DATABASE planejamento_canoinhas_db;"
```

> Você **não precisa criar as tabelas**. O Sequelize cria tudo sozinho quando a API inicia.

### 3.2 Conferir usuário e senha no projeto

Abra o arquivo `backend/src/config/database.js`:

```js
const sequelize = new Sequelize('planejamento_canoinhas_db', 'postgres', '123456', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false
});
```

Se a senha do PostgreSQL nesse computador **não for `123456`**, troque pela senha correta e salve o arquivo.

| Parâmetro | Valor |
|---|---|
| Nome do banco | `planejamento_canoinhas_db` |
| Usuário | `postgres` |
| Senha | a senha do PostgreSQL desse computador |
| Porta | `5432` |

---

## 4. Instalar as dependências da API

Abra um terminal **na pasta `backend`** e rode:

```bash
cd backend
npm install
```

Esse comando lê o `package.json` e baixa as bibliotecas: `express`, `sequelize`, `pg`, `pg-hstore`, `cors` e `nodemon`.

---

## 5. Iniciar a API

Ainda na pasta `backend`:

```bash
npm run dev
```

(ou `npm start`, que roda sem reiniciar automaticamente)

Se tudo deu certo, o terminal mostra:

```
Base de dados ligada e sincronizada.
Seed concluído: 6 serviços, 3 notícias, 3 eventos e 3 solicitações cadastrados.
Servidor a correr em http://localhost:3000
```

Na **primeira vez**, a API cria as tabelas e cadastra os dados de teste sozinha. Nas próximas vezes aparece `Seed ignorado: o banco já possui dados.`

Para testar, abra **http://localhost:3000/api/servicos** no navegador. Deve aparecer um JSON com os 6 serviços.

### Resetar os dados (opcional)

Para voltar o banco ao estado inicial (por exemplo, antes da apresentação):

```bash
npm run seed
```

> ⚠️ Esse comando **apaga todos os dados** e cadastra os dados de teste de novo. Pare a API (Ctrl+C) antes de rodar e depois inicie com `npm run dev`.

> ⚠️ **Deixe este terminal aberto** durante todo o uso. Se fechar, a API para.

---

## 6. Abrir o site (frontend)

1. No VS Code, abra a pasta **`planejamento_canoinhas-main`** (a raiz do projeto) em **File → Open Folder**.
2. Clique em **Go Live** na barra azul inferior do VS Code, ou clique com o botão direito em `frontend/index.html` e escolha **Open with Live Server**.
3. O site abre em **`http://127.0.0.1:5500/`**.

> O arquivo `.vscode/settings.json` do projeto já configura o Live Server para usar a pasta `frontend` como raiz (`"liveServer.settings.root": "/frontend"`).
> Se o navegador mostrar só uma **lista de pastas** ou der **404**, pare o Live Server (clique em **Port: 5500** na barra inferior) e clique em **Go Live** de novo, para ele ler a configuração.

> Também dá para abrir o `index.html` com dois cliques, mas o Live Server é mais confiável.

**Painel administrativo:** clique em **Painel Administrativo** no rodapé do site, ou acesse `http://127.0.0.1:5500/admin/index.html`. Por ele dá para cadastrar, editar e excluir serviços, solicitações, notícias e eventos sem usar o Insomnia.

Para conferir se o site está consumindo a API, aperte **F12 → aba Network (Rede)** e recarregue a página. Devem aparecer as requisições para `servicos`, `noticias` e `eventos`, todas com status **200**.

---

## 7. Testar a API no Insomnia (opcional)

| Método | URL |
|---|---|
| GET | `http://localhost:3000/api/servicos` |
| POST | `http://localhost:3000/api/servicos` |
| PUT | `http://localhost:3000/api/servicos/1` |
| DELETE | `http://localhost:3000/api/servicos/1` |

Nos métodos POST e PUT, use **Body → JSON**. Os exemplos de corpo estão no [README](README.md#exemplos-de-corpo-json).

---

## Resumo rápido (para o dia da apresentação)

```bash
# 1x só: criar o banco planejamento_canoinhas_db no pgAdmin
# 1x só: conferir a senha em backend/src/config/database.js

cd backend
npm install      # 1x só
npm run seed     # opcional: reseta o banco com os dados de teste
npm run dev      # sempre que for usar
```

Depois, abra `frontend/index.html` com o **Live Server**.

---

## Problemas comuns

| Mensagem / Sintoma | Causa | Solução |
|---|---|---|
| `password authentication failed for user "postgres"` | Senha errada em `database.js` | Coloque a senha correta do PostgreSQL |
| `database "planejamento_canoinhas_db" does not exist` | O banco não foi criado | Faça o passo 3.1 |
| `connect ECONNREFUSED 127.0.0.1:5432` | O PostgreSQL não está rodando | Abra **Serviços do Windows** e inicie o serviço `postgresql-x64-XX` |
| `'nodemon' não é reconhecido` | Dependências não instaladas | Rode `npm install` na pasta `backend` |
| `Cannot find module 'express'` | Dependências não instaladas | Rode `npm install` na pasta `backend` |
| `EADDRINUSE: address already in use :::3000` | A API já está rodando em outro terminal | Feche o outro terminal ou finalize o processo `node` |
| O site mostra conteúdo fixo e o console mostra `Failed to fetch` | A API está desligada | Rode `npm run dev` na pasta `backend` |
| O Live Server abre uma **lista de pastas** ou dá **404** | O Live Server está servindo a raiz do projeto, e não a pasta `frontend` | Abra a pasta raiz do projeto no VS Code e reinicie o Live Server (clique em **Port: 5500** e depois em **Go Live**). Se não resolver, acesse `http://127.0.0.1:5500/frontend/index.html` |
| `npm` bloqueado no PowerShell ("execução de scripts foi desabilitada") | Política de segurança do Windows | Use o terminal **Git Bash** ou **CMD**, ou rode `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
