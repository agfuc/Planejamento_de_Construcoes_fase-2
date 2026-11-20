/*
 * ============================================================================
 * PAINEL ADMINISTRATIVO — CRUD COMPLETO COM fetch()
 * ============================================================================
 *   GET    /api/<entidade>       → listar()    → monta a TABELA
 *   GET    /api/<entidade>/:id   → editar()    → preenche o FORMULÁRIO
 *   POST   /api/<entidade>       → salvar()    → cadastra (quando não está editando)
 *   PUT    /api/<entidade>/:id   → salvar()    → atualiza (quando está editando)
 *   DELETE /api/<entidade>/:id   → excluir()   → remove o registro
 *
 * As 4 entidades usam as MESMAS funções. O que muda entre elas está no
 * objeto ENTIDADES: nome da rota, campos do formulário e colunas da tabela.
 * ============================================================================
 */

const API_BASE = 'http://localhost:3000/api';

const STATUS_SOLICITACAO = ['Pendente', 'Em andamento', 'Concluído', 'Cancelado'];

/* ----------------------------------------------------------------------------
 * CONFIGURAÇÃO DAS ENTIDADES
 *   campos  → inputs do formulário (nome = nome da coluna no banco)
 *   colunas → colunas da tabela (valor = função que recebe o registro)
 * tipo "servico" = <select> preenchido dinamicamente com GET /api/servicos
 * -------------------------------------------------------------------------- */
const ENTIDADES = {
    servicos: {
        singular: 'serviço',
        tituloNovo: 'Novo serviço',
        plural: 'Serviços',
        campos: [
            { nome: 'titulo', rotulo: 'Título', tipo: 'text', obrigatorio: true },
            { nome: 'descricao', rotulo: 'Descrição', tipo: 'textarea', obrigatorio: true },
            { nome: 'icone', rotulo: 'Ícone (Phosphor, ex.: cube, hard-hat)', tipo: 'text' }
        ],
        colunas: [
            { rotulo: 'ID', valor: (r) => r.id },
            { rotulo: 'Ícone', valor: (r) => `<i class="ph ph-${escapeHtml(nomeIcone(r.icone))}" style="font-size:1.5rem"></i>`, html: true },
            { rotulo: 'Título', valor: (r) => r.titulo },
            { rotulo: 'Descrição', valor: (r) => r.descricao, classe: 'texto-longo' }
        ]
    },

    solicitacoes: {
        singular: 'solicitação',
        tituloNovo: 'Nova solicitação',
        plural: 'Solicitações',
        campos: [
            { nome: 'nome_solicitante', rotulo: 'Nome do solicitante', tipo: 'text', obrigatorio: true },
            { nome: 'email', rotulo: 'E-mail', tipo: 'email', obrigatorio: true },
            { nome: 'telefone', rotulo: 'Telefone', tipo: 'tel' },
            { nome: 'servico_id', rotulo: 'Serviço', tipo: 'servico', obrigatorio: true },
            { nome: 'status', rotulo: 'Status', tipo: 'select', opcoes: STATUS_SOLICITACAO, obrigatorio: true },
            { nome: 'mensagem', rotulo: 'Mensagem', tipo: 'textarea', obrigatorio: true }
        ],
        colunas: [
            { rotulo: 'ID', valor: (r) => r.id },
            { rotulo: 'Solicitante', valor: (r) => `${escapeHtml(r.nome_solicitante)}<br><small>${escapeHtml(r.email)}</small>`, html: true },
            // r.servico vem do include (JOIN) feito no SolicitacaoController
            { rotulo: 'Serviço', valor: (r) => (r.servico ? r.servico.titulo : '—') },
            { rotulo: 'Status', valor: (r) => badgeStatus(r.status), html: true },
            { rotulo: 'Data', valor: (r) => formatarData(r.createdAt) }
        ]
    },

    noticias: {
        singular: 'notícia',
        tituloNovo: 'Nova notícia',
        plural: 'Notícias',
        campos: [
            { nome: 'titulo', rotulo: 'Título', tipo: 'text', obrigatorio: true },
            { nome: 'resumo', rotulo: 'Resumo', tipo: 'text' },
            { nome: 'conteudo', rotulo: 'Conteúdo', tipo: 'textarea', obrigatorio: true },
            { nome: 'imagem', rotulo: 'Imagem (ex.: img/img_03.jpg)', tipo: 'text' },
            { nome: 'data_publicacao', rotulo: 'Data de publicação', tipo: 'date', obrigatorio: true },
            { nome: 'servico_id', rotulo: 'Serviço relacionado', tipo: 'servico' }
        ],
        colunas: [
            { rotulo: 'ID', valor: (r) => r.id },
            { rotulo: 'Título', valor: (r) => r.titulo },
            { rotulo: 'Publicação', valor: (r) => formatarData(r.data_publicacao) },
            { rotulo: 'Serviço', valor: (r) => (r.servico ? r.servico.titulo : '—') }
        ]
    },

    eventos: {
        singular: 'evento',
        tituloNovo: 'Novo evento',
        plural: 'Eventos',
        campos: [
            { nome: 'titulo', rotulo: 'Título', tipo: 'text', obrigatorio: true },
            { nome: 'descricao', rotulo: 'Descrição', tipo: 'textarea', obrigatorio: true },
            { nome: 'data_evento', rotulo: 'Data do evento', tipo: 'date', obrigatorio: true },
            { nome: 'horario', rotulo: 'Horário (ex.: 19h30)', tipo: 'text' },
            { nome: 'local', rotulo: 'Local', tipo: 'text' },
            { nome: 'servico_id', rotulo: 'Serviço relacionado', tipo: 'servico' }
        ],
        colunas: [
            { rotulo: 'ID', valor: (r) => r.id },
            { rotulo: 'Título', valor: (r) => r.titulo },
            { rotulo: 'Data', valor: (r) => `${formatarData(r.data_evento)}${r.horario ? ' · ' + r.horario : ''}` },
            { rotulo: 'Local', valor: (r) => r.local || '—' },
            { rotulo: 'Serviço', valor: (r) => (r.servico ? r.servico.titulo : '—') }
        ]
    }
};

/* ----------------------------------------------------------------------------
 * ESTADO DA TELA
 * -------------------------------------------------------------------------- */
let entidadeAtual = 'servicos'; // aba selecionada
let idEditando = null;          // null = cadastrando (POST) | número = editando (PUT)
let listaServicos = [];         // usada para montar os <select> de serviço

/* Elementos da página */
const formEl = document.getElementById('form-cadastro');
const camposEl = document.getElementById('form-campos');
const formTituloEl = document.getElementById('form-titulo');
const btnSalvar = document.getElementById('btn-salvar');
const btnCancelar = document.getElementById('btn-cancelar');
const tabelaHead = document.getElementById('tabela-head');
const tabelaBody = document.getElementById('tabela-body');
const tabelaTitulo = document.getElementById('tabela-titulo');
const contadorEl = document.getElementById('contador');
const mensagemEl = document.getElementById('mensagem');

/* ----------------------------------------------------------------------------
 * FUNÇÃO CENTRAL DE COMUNICAÇÃO COM A API
 * Todas as requisições passam por aqui. Se o status não for 2xx (res.ok falso),
 * lança um erro com o código HTTP e a mensagem enviada pelo backend.
 * -------------------------------------------------------------------------- */
async function requisicao(metodo, caminho, corpo) {
    const opcoes = { method: metodo, headers: {} };

    if (corpo !== undefined) {
        opcoes.headers['Content-Type'] = 'application/json';
        opcoes.body = JSON.stringify(corpo);
    }

    const res = await fetch(`${API_BASE}${caminho}`, opcoes);
    const dados = await res.json().catch(() => ({}));

    if (!res.ok) {
        // "detalhes" pode ser uma lista (erros de validação) ou um texto
        const detalhes = Array.isArray(dados.detalhes) ? `: ${dados.detalhes.join('; ')}` : '';
        throw new Error(`${res.status} — ${dados.erro || 'Erro na requisição'}${detalhes}`);
    }

    return { status: res.status, dados };
}

/* ----------------------------------------------------------------------------
 * GET /api/servicos → guarda a lista para os <select> de serviço
 * -------------------------------------------------------------------------- */
async function carregarServicos() {
    try {
        const { dados } = await requisicao('GET', '/servicos');
        listaServicos = dados;
    } catch (erro) {
        listaServicos = [];
        mostrarMensagem(`Não foi possível carregar os serviços: ${erro.message}`, 'erro');
    }
}

/* ----------------------------------------------------------------------------
 * FORMULÁRIO — gerado dinamicamente a partir de ENTIDADES[x].campos
 * -------------------------------------------------------------------------- */
function montarFormulario() {
    const config = ENTIDADES[entidadeAtual];

    camposEl.innerHTML = config.campos.map((campo) => {
        const id = `campo-${campo.nome}`;
        const req = campo.obrigatorio ? 'required' : '';
        const asterisco = campo.obrigatorio ? ' <span class="obrigatorio">*</span>' : '';
        let input;

        if (campo.tipo === 'textarea') {
            input = `<textarea id="${id}" name="${campo.nome}" rows="4" ${req}></textarea>`;
        } else if (campo.tipo === 'servico') {
            // <select> dinâmico: as opções vêm do banco (GET /api/servicos)
            const vazio = campo.obrigatorio ? 'Selecione um serviço...' : 'Nenhum';
            input = `<select id="${id}" name="${campo.nome}" ${req}>
                        <option value="">${vazio}</option>
                        ${listaServicos.map((s) => `<option value="${s.id}">${escapeHtml(s.titulo)}</option>`).join('')}
                     </select>`;
        } else if (campo.tipo === 'select') {
            input = `<select id="${id}" name="${campo.nome}" ${req}>
                        ${campo.opcoes.map((op) => `<option value="${escapeHtml(op)}">${escapeHtml(op)}</option>`).join('')}
                     </select>`;
        } else {
            input = `<input type="${campo.tipo}" id="${id}" name="${campo.nome}" ${req}>`;
        }

        return `<div class="input-group"><label for="${id}">${campo.rotulo}${asterisco}</label>${input}</div>`;
    }).join('');

    // Data padrão = hoje (facilita o cadastro de notícias)
    const campoData = document.getElementById('campo-data_publicacao');
    if (campoData) campoData.value = hojeISO();

    sairModoEdicao();
}

/* Lê os valores do formulário e monta o objeto JSON que vai no corpo (body) */
function lerFormulario() {
    const config = ENTIDADES[entidadeAtual];
    const corpo = {};

    config.campos.forEach((campo) => {
        const valor = document.getElementById(`campo-${campo.nome}`).value.trim();

        if (campo.tipo === 'servico') {
            corpo[campo.nome] = valor ? Number(valor) : null; // FK: número ou null
        } else {
            corpo[campo.nome] = valor === '' && !campo.obrigatorio ? null : valor;
        }
    });

    return corpo;
}

/* Coloca os dados de um registro dentro dos inputs (usado na edição) */
function preencherFormulario(registro) {
    ENTIDADES[entidadeAtual].campos.forEach((campo) => {
        const el = document.getElementById(`campo-${campo.nome}`);
        const valor = registro[campo.nome];
        el.value = valor === null || valor === undefined ? '' : valor;
    });
}

function entrarModoEdicao(id) {
    idEditando = id;
    formTituloEl.textContent = `Editando ${ENTIDADES[entidadeAtual].singular} #${id}`;
    btnSalvar.innerHTML = '<i class="ph ph-floppy-disk"></i> Salvar alterações';
    btnCancelar.hidden = false;
}

function sairModoEdicao() {
    idEditando = null;
    formTituloEl.textContent = ENTIDADES[entidadeAtual].tituloNovo;
    btnSalvar.innerHTML = '<i class="ph ph-plus"></i> Cadastrar';
    btnCancelar.hidden = true;
}

/* ----------------------------------------------------------------------------
 * READ — GET /api/<entidade> → monta a tabela
 * -------------------------------------------------------------------------- */
async function listar() {
    const config = ENTIDADES[entidadeAtual];
    tabelaTitulo.textContent = `${config.plural} cadastrados`;

    // Cabeçalho da tabela
    tabelaHead.innerHTML = `<tr>${config.colunas.map((c) => `<th>${c.rotulo}</th>`).join('')}<th>Ações</th></tr>`;
    const totalColunas = config.colunas.length + 1;

    try {
        const { dados } = await requisicao('GET', `/${entidadeAtual}`);
        contadorEl.textContent = `${dados.length} registro${dados.length === 1 ? '' : 's'}`;

        if (!dados.length) {
            tabelaBody.innerHTML = `<tr><td class="vazio" colspan="${totalColunas}">Nenhum registro cadastrado.</td></tr>`;
            return;
        }

        // Uma linha <tr> por registro retornado pela API
        tabelaBody.innerHTML = dados.map((registro) => `
            <tr>
                ${config.colunas.map((c) => {
                    const conteudo = c.html ? c.valor(registro) : escapeHtml(c.valor(registro) ?? '');
                    return `<td class="${c.classe || ''}">${conteudo}</td>`;
                }).join('')}
                <td class="acoes">
                    <button class="btn-acao" data-acao="editar" data-id="${registro.id}" title="Editar">
                        <i class="ph ph-pencil-simple"></i>
                    </button>
                    <button class="btn-acao excluir" data-acao="excluir" data-id="${registro.id}" title="Excluir">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (erro) {
        contadorEl.textContent = '';
        tabelaBody.innerHTML = `<tr><td class="vazio" colspan="${totalColunas}">Não foi possível carregar os dados. A API está rodando?</td></tr>`;
        mostrarMensagem(erro.message, 'erro');
    }
}

/* ----------------------------------------------------------------------------
 * READ (por ID) — GET /api/<entidade>/:id → preenche o formulário para editar
 * -------------------------------------------------------------------------- */
async function editar(id) {
    try {
        const { dados } = await requisicao('GET', `/${entidadeAtual}/${id}`);
        preencherFormulario(dados);
        entrarModoEdicao(id);
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (erro) {
        mostrarMensagem(erro.message, 'erro');
    }
}

/* ----------------------------------------------------------------------------
 * CREATE / UPDATE — POST ou PUT, dependendo de idEditando
 * -------------------------------------------------------------------------- */
async function salvar(evento) {
    evento.preventDefault(); // impede o recarregamento da página

    // Validação no navegador (campos com "required")
    if (!formEl.checkValidity()) {
        formEl.reportValidity();
        return;
    }

    const corpo = lerFormulario();
    const singular = ENTIDADES[entidadeAtual].singular;
    btnSalvar.disabled = true;

    try {
        let resposta;
        if (idEditando) {
            resposta = await requisicao('PUT', `/${entidadeAtual}/${idEditando}`, corpo);
            mostrarMensagem(`${resposta.status} — ${capitalizar(singular)} #${idEditando} atualizado(a) com sucesso.`, 'sucesso');
        } else {
            resposta = await requisicao('POST', `/${entidadeAtual}`, corpo);
            mostrarMensagem(`${resposta.status} — ${capitalizar(singular)} #${resposta.dados.id} cadastrado(a) com sucesso.`, 'sucesso');
        }

        await aposAlteracao();
    } catch (erro) {
        mostrarMensagem(erro.message, 'erro');
    } finally {
        btnSalvar.disabled = false;
    }
}

/* ----------------------------------------------------------------------------
 * DELETE — DELETE /api/<entidade>/:id
 * -------------------------------------------------------------------------- */
async function excluir(id) {
    const singular = ENTIDADES[entidadeAtual].singular;
    if (!confirm(`Deseja realmente excluir o(a) ${singular} #${id}?`)) return;

    try {
        const { status, dados } = await requisicao('DELETE', `/${entidadeAtual}/${id}`);
        mostrarMensagem(`${status} — ${dados.mensagem || 'Registro excluído.'}`, 'sucesso');
        if (idEditando === id) sairModoEdicao();
        await aposAlteracao();
    } catch (erro) {
        // Ex.: 400 ao tentar excluir um serviço que tem solicitações (FK RESTRICT)
        mostrarMensagem(erro.message, 'erro');
    }
}

/* Depois de criar/editar/excluir: atualiza a tabela e, se mexeu em serviços,
   recarrega a lista usada nos <select> */
async function aposAlteracao() {
    if (entidadeAtual === 'servicos') await carregarServicos();
    montarFormulario();
    await listar();
}

/* ----------------------------------------------------------------------------
 * TROCA DE ABA
 * -------------------------------------------------------------------------- */
async function trocarEntidade(nome) {
    entidadeAtual = nome;
    document.querySelectorAll('.tab').forEach((t) => {
        t.classList.toggle('active', t.dataset.entidade === nome);
    });
    esconderMensagem();
    montarFormulario();
    await listar();
}

/* ----------------------------------------------------------------------------
 * FUNÇÕES AUXILIARES
 * -------------------------------------------------------------------------- */
function escapeHtml(valor = '') {
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function nomeIcone(icone) {
    return String(icone || 'blueprint').replace(/^ph\s+/, '').replace(/^ph-/, '') || 'blueprint';
}

function badgeStatus(status) {
    const classe = String(status || '')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos: "Concluído" → "concluido"
        .replace(/\s+/g, '-');
    return `<span class="badge ${classe}">${escapeHtml(status || '—')}</span>`;
}

/* "2026-11-20" ou "2026-11-20T18:12:44Z" → "20/11/2026" */
function formatarData(valor) {
    if (!valor) return '—';
    const [ano, mes, dia] = String(valor).slice(0, 10).split('-');
    return dia && mes && ano ? `${dia}/${mes}/${ano}` : valor;
}

function hojeISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

let timerMensagem;
function mostrarMensagem(texto, tipo) {
    mensagemEl.textContent = (tipo === 'sucesso' ? '✅ ' : '❌ ') + texto;
    mensagemEl.className = `admin-msg ${tipo}`;
    mensagemEl.hidden = false;
    clearTimeout(timerMensagem);
    timerMensagem = setTimeout(esconderMensagem, 6000);
}

function esconderMensagem() {
    mensagemEl.hidden = true;
}

/* ----------------------------------------------------------------------------
 * MODO ESCURO (mesma chave "theme" do site, então a escolha é compartilhada)
 * -------------------------------------------------------------------------- */
function iniciarTema() {
    const btn = document.getElementById('theme-toggle');
    const icone = btn.querySelector('i');

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        icone.classList.replace('ph-moon', 'ph-sun');
    }

    btn.addEventListener('click', () => {
        const escuro = document.body.classList.toggle('dark-mode');
        icone.classList.replace(escuro ? 'ph-moon' : 'ph-sun', escuro ? 'ph-sun' : 'ph-moon');
        localStorage.setItem('theme', escuro ? 'dark' : 'light');
    });
}

/* ----------------------------------------------------------------------------
 * EVENTOS DA PÁGINA
 * -------------------------------------------------------------------------- */
document.getElementById('admin-tabs').addEventListener('click', (e) => {
    const aba = e.target.closest('.tab');
    if (aba) trocarEntidade(aba.dataset.entidade);
});

formEl.addEventListener('submit', salvar);

btnCancelar.addEventListener('click', () => {
    formEl.reset();
    sairModoEdicao();
});

// Delegação de eventos: um único listener na tabela atende todos os botões,
// inclusive os que são criados depois (a cada listar())
tabelaBody.addEventListener('click', (e) => {
    const botao = e.target.closest('[data-acao]');
    if (!botao) return;

    const id = Number(botao.dataset.id);
    if (botao.dataset.acao === 'editar') editar(id);
    if (botao.dataset.acao === 'excluir') excluir(id);
});

/* ----------------------------------------------------------------------------
 * INICIALIZAÇÃO
 * -------------------------------------------------------------------------- */
(async function iniciar() {
    iniciarTema();
    await carregarServicos();
    await trocarEntidade('servicos');
})();
