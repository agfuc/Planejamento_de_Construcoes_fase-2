/*
 * ============================================================================
 * LOGIN DO PAINEL — POST /api/login com fetch()
 * ============================================================================
 * 1. Envia { email, senha } para a API
 * 2. Se der certo, a API devolve { usuario, token }
 * 3. Guardamos o token no localStorage do navegador
 * 4. Redirecionamos para o dashboard, que envia esse token em cada requisição
 * ============================================================================
 */

const API_BASE = 'http://localhost:3000/api';

// Se já existe um token salvo, não precisa logar de novo
if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
}

// Mantém o tema (claro/escuro) escolhido no site
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

const form = document.getElementById('form-login');
const btnEntrar = document.getElementById('btn-entrar');
const mensagemEl = document.getElementById('mensagem');

form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    btnEntrar.disabled = true;
    mensagemEl.hidden = true;

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await res.json().catch(() => ({}));

        if (!res.ok) {
            // 400 (campos vazios) ou 401 (e-mail/senha incorretos)
            throw new Error(dados.erro || 'Não foi possível entrar');
        }

        // Guarda o token e o nome do usuário para usar no dashboard
        localStorage.setItem('token', dados.token);
        localStorage.setItem('usuario', JSON.stringify(dados.usuario));

        window.location.href = 'dashboard.html';
    } catch (erro) {
        // "Failed to fetch" = a API está desligada
        mensagemEl.textContent = erro.message === 'Failed to fetch'
            ? 'Não foi possível conectar à API. Verifique se o backend está rodando (npm run dev).'
            : erro.message;
        mensagemEl.hidden = false;
    } finally {
        btnEntrar.disabled = false;
    }
});
