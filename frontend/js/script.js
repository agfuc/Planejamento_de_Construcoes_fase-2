document.addEventListener('DOMContentLoaded', () => {

    /* Manipulação do Menu */
    const navMenu = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const menuBtn = document.getElementById('menu-btn');
    const menuIcon = menuBtn.querySelector('i');

    menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');

        /*Lógica para alterar o ícone */
        if (navMenu.classList.contains('active')) {
            menuIcon.classList.replace('ph-list', 'ph-x');
        } else {
            menuIcon.classList.replace('ph-x', 'ph-list');
        }
    });

    /*Fecha o menu ao clicar em um link */
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuIcon.classList.replace('ph-x', 'ph-list');
        });
    });

    /* Header com sombra ao rolar a página */
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* FUNÇÕES PARA O SLIDER */
    const slides = document.querySelectorAll('.carousel-slide');
    const dotsWrap = document.getElementById('carousel-dots');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');

    /* Variáveis */
    let currentSlide = 0;
    let autoPlayTimer;

    /* Cria os pontos de navegação dinamicamente */
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            showTargetSlide(i);
            resetAutoPlay();
        });
        dotsWrap.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    //Função para mostrar o slide atual (currentSlide)
    function showTargetSlide(index) {
        //Inicialmente remove todos os slides e dots ativos
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');

        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function runAutoPlay() {
        autoPlayTimer = setInterval(() => {
            showTargetSlide(currentSlide + 1);
        }, 6000);
    }

    //Ações dos botões
    btnNext.addEventListener('click', () => {
        showTargetSlide(currentSlide + 1);
        resetAutoPlay();
    });

    btnPrev.addEventListener('click', () => {
        showTargetSlide(currentSlide - 1);
        resetAutoPlay();
    });

    function resetAutoPlay() {
        clearInterval(autoPlayTimer);
        runAutoPlay();
    }

    //Dá a partida na transição dos slides
    runAutoPlay();

    //INICIO DOS CONTADORES
    ///////////////////////

    //Seleciona os itens estatísticos (números)
    const counters = document.querySelectorAll('.stat-num');

    //Função responsável por subir progressivamente a numeração
    function runCounterAnimation(el) {
        //pegar o valor data-target
        const targetNumber = parseInt(el.getAttribute('data-target'));
        //Definir o tempo de animação
        const durationLimit = 2000; // 2000 milisegundos = 2 segundos

        //Inicializar uma variável contador
        let counterValue = 0;

        //Logica: Divide o número alvo pela quantidade de frames (2000/20 = 100 frames)
        const incrementAmount = targetNumber / (durationLimit / 20);

        //Cria um looping temporal a cada 20 milisegundos
        const updateVisualsTimer = setInterval(() => {
            //Adiciona o incremento no valor atual
            counterValue += incrementAmount;

            //Verifica se já atingiu ou ultrapassou o alvo
            if (counterValue >= targetNumber) {
                //Garante que o valor final é o alvo
                el.innerText = targetNumber;
                //interrompe o setInterval
                clearInterval(updateVisualsTimer);
            } else {
                //Se ainda não chegou no alvo, altera o valor atual
                el.innerText = Math.ceil(counterValue);
            }
        }, 20);
    } //fecha a função runCounterAnimation

    //API MODERNA! O Observer que "observa" os elementos
    const scrollObserver =
        new IntersectionObserver((entries, observerInstance) => {
            //Se observo algo?
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runCounterAnimation(entry.target);
                    observerInstance.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.6 //Pelo menos 60% do elemento tem que estar visível
        });

    //Habilita o observer para cada entrada
    counters.forEach(counterItem => {
        scrollObserver.observe(counterItem);
    });

    //Dark-mode e Light Mode
    /*Selecionar o botão que faz a troca*/
    const themeBtn = document.getElementById('theme-toggle');
    /*Selecionar o ícone para troca*/
    const themeIcon = themeBtn.querySelector('i');

    //Recuperar tema salvo anteriormente
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.classList.replace('ph-moon', 'ph-sun');
    }

    //Adiciona o evento no botão
    themeBtn.addEventListener('click', () => {
        //Liga a classe quando está desligada e desliga quando está ligada
        document.body.classList.toggle('dark-mode');
        //Verifica se está no darkmode (true) ou não (false)
        const isDark = document.body.classList.contains('dark-mode');

        if (isDark) {
            themeIcon.classList.replace('ph-moon', 'ph-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.replace('ph-sun', 'ph-moon');
            localStorage.setItem('theme', 'light');
        }
    });

    /* Formulário de Contato */
    const API_BASE = 'http://localhost:3000/api';

    const MESES_PT = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

    function escapeHtml(valor = '') {
        return String(valor)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Aceita o ícone salvo como "blueprint", "ph-blueprint" ou "ph ph-blueprint"
    // e devolve só o nome ("blueprint"). Sem ícone, usa "blueprint" como padrão.
    function nomeIcone(icone) {
        return String(icone || 'blueprint').replace(/^ph\s+/, '').replace(/^ph-/, '') || 'blueprint';
    }

    async function carregarServicosAPI() {
        const gridCards = document.querySelector('#servicos .grid-cards');
        const selectServico = document.getElementById('servico-select');
        if (!gridCards) return;

        try {
            const res = await fetch(`${API_BASE}/servicos`);
            if (!res.ok) throw new Error('Erro ao carregar serviços');
            const dados = await res.json();
            const servicos = Array.isArray(dados) ? dados : (dados.dados || []);

            if (selectServico) {
                selectServico.innerHTML = servicos.length
                    ? '<option value="">Selecione um serviço...</option>' +
                    servicos.map((s) => `<option value="${s.id}">${escapeHtml(s.titulo || s.nome || `Serviço #${s.id}`)}</option>`).join('')
                    : '<option value="">Nenhum serviço disponível</option>';
            }

            if (!servicos.length) return;

            gridCards.innerHTML = servicos.map((s) => `
                <article class="card">
                    <div class="card-icon-wrapper">
                        <i class="ph ph-${escapeHtml(nomeIcone(s.icone))}"></i>
                    </div>
                    <h3>${escapeHtml(s.titulo || s.nome || 'Serviço')}</h3>
                    <p>${escapeHtml(s.descricao || '')}</p>
                    <a href="#contato" class="btn btn-outline">Saiba Mais</a>
                </article>
            `).join('');
        } catch (err) {
            console.warn('Falha ao buscar /api/servicos:', err.message);
            if (selectServico) {
                selectServico.innerHTML = '<option value="">Selecione um serviço...</option>';
            }
        }
    }

    async function carregarNoticiasAPI() {
        const container = document.getElementById('noticias');
        if (!container) return;

        try {
            const res = await fetch(`${API_BASE}/noticias`);
            if (!res.ok) throw new Error('Erro ao carregar notícias');
            const dados = await res.json();
            const noticias = Array.isArray(dados) ? dados : (dados.dados || []);
            if (!noticias.length) return;

            const tituloHtml = '<h3 class="box-title">Recentes no Blog</h3>';
            const itensHtml = noticias.map((n) => {
                const imgSrc = n.imagem || n.imagem_url || 'img/img_03.jpg';
                const dataTexto = n.data_publicacao || n.createdAt || '';
                return `
                    <article class="news-item">
                        <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(n.titulo || 'Notícia')}" class="news-img">
                        <div class="news-text">
                            <h4>${escapeHtml(n.titulo || 'Notícia')}</h4>
                            <span class="news-date">${escapeHtml(dataTexto)}</span>
                            <p>${escapeHtml(n.resumo || n.conteudo || n.descricao || '')}</p>
                        </div>
                    </article>
                `;
            }).join('');

            container.innerHTML = tituloHtml + itensHtml;
        } catch (err) {
            console.warn('Falha ao buscar /api/noticias:', err.message);
        }
    }

    async function carregarEventosAPI() {
        const container = document.getElementById('eventos');
        if (!container) return;

        try {
            const res = await fetch(`${API_BASE}/eventos`);
            if (!res.ok) throw new Error('Erro ao carregar eventos');
            const dados = await res.json();
            const eventos = Array.isArray(dados) ? dados : (dados.dados || []);
            if (!eventos.length) return;

            const tituloHtml = '<h3 class="box-title">Próximos Eventos</h3>';
            const itensHtml = eventos.map((ev) => {
                const dataObj = ev.data_evento ? new Date(ev.data_evento) : null;
                const dia = dataObj && !Number.isNaN(dataObj.getTime())
                    ? String(dataObj.getUTCDate()).padStart(2, '0')
                    : '--';
                const mes = dataObj && !Number.isNaN(dataObj.getTime())
                    ? MESES_PT[dataObj.getUTCMonth()]
                    : 'MES';
                const local = ev.local || 'A definir';
                const horario = ev.horario || '';

                return `
                    <div class="event-item">
                        <div class="event-calendar">
                            <span class="day">${dia}</span>
                            <span class="month">${mes}</span>
                        </div>
                        <div class="event-text">
                            <h4>${escapeHtml(ev.titulo || ev.nome || 'Evento')}</h4>
                            <span class="event-meta">
                                <i class="ph ph-map-pin"></i> ${escapeHtml(local)}
                                ${horario ? `&nbsp;|&nbsp;<i class="ph ph-clock"></i> ${escapeHtml(horario)}` : ''}
                            </span>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = tituloHtml + itensHtml;
        } catch (err) {
            console.warn('Falha ao buscar /api/eventos:', err.message);
        }
    }

    /* Formulário de Contato */
    /* Formulário de Contato */
    window.handleFormSubmit = async function (event) {
        event.preventDefault();

        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const successEl = document.getElementById('form-success');
        const selectServico = document.getElementById('servico-select');

        const payload = {
            // Sem serviço selecionado vai null, e a API responde 400 (servico_id é obrigatório)
            servico_id: selectServico && selectServico.value ? Number(selectServico.value) : null,
            nome_solicitante: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            mensagem: document.getElementById('msg').value.trim(),
        };

        if (submitBtn) submitBtn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/solicitacoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const detalhes = Array.isArray(data.detalhes) ? `: ${data.detalhes.join('; ')}` : '';
                throw new Error((data.erro || 'Não foi possível enviar a solicitação.') + detalhes);
            }

            form.reset();
            if (successEl) {
                successEl.textContent = '✅ Mensagem enviada! Entraremos em contato em breve.';
                successEl.style.display = 'block';
                setTimeout(() => {
                    successEl.style.display = 'none';
                }, 5000);
            }
        } catch (err) {
            if (successEl) {
                successEl.textContent = `❌ ${err.message}`;
                successEl.style.display = 'block';
            }
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    };
    carregarServicosAPI();
    carregarNoticiasAPI();
    carregarEventosAPI();
});  // Fecha o document.addEventListener('DOMContentLoaded', () => {
