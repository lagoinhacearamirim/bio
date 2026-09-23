// Lógica de Paginação do Slider
const cardsWrapper = document.getElementById('cards-wrapper');
const dots = document.querySelectorAll('.dot');

cardsWrapper.addEventListener('scroll', () => {
    const scrollLeft = cardsWrapper.scrollLeft;
    const cardWidth = cardsWrapper.clientWidth;
    const activeIndex = Math.round(scrollLeft / cardWidth);
    
    dots.forEach((dot, index) => {
        if (index === activeIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
});

// Lógica de Modais
function openModal(modalId) {
    document.getElementById('modal-overlay').classList.add('active');
    document.querySelectorAll('.modal-content').forEach(m => m.classList.remove('active'));
    document.getElementById(modalId).classList.add('active');

    // Gatilhos de carregamento sob demanda
    if (modalId === 'modal-comece' && !document.getElementById('content-comece').innerHTML.trim()) {
        loadComeceAqui();
    }
    if (modalId === 'modal-cursos' && document.getElementById('cursos-container').innerHTML.trim() === '') {
        loadCursos();
    }
    if (modalId === 'modal-ministerios' && document.getElementById('ministerios-container').innerHTML.trim() === '') {
        loadMinisterios();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.getElementById('modal-overlay').classList.remove('active');
}

function closeAllModals(event) {
    if (event.target === document.getElementById('modal-overlay')) {
        document.getElementById('modal-overlay').classList.remove('active');
        document.querySelectorAll('.modal-content').forEach(m => m.classList.remove('active'));
    }
}

// Carregamento de Arquivos de Texto (GitHub Pages Fetch)
async function loadComeceAqui() {
    try {
        const response = await fetch('comeceAqui.txt');
        if (response.ok) {
            const text = await response.text();
            // marked.js transforma o markdown em html com as classes corretas do css
            document.getElementById('content-comece').innerHTML = marked.parse(text);
        } else {
            document.getElementById('content-comece').innerHTML = '<p class="text-white">Conteúdo não encontrado.</p>';
        }
    } catch (e) {
        console.error("Erro ao carregar comeceAqui.txt", e);
    }
}

async function loadCursos() {
    const container = document.getElementById('cursos-container');
    try {
        const response = await fetch('cursos.txt');
        if (response.ok) {
            const text = await response.text();
            
            if (text.includes('Nenhum curso disponível no momento...')) {
                container.innerHTML = '<p class="text-bold-white" style="text-align:center;">Nenhum curso disponível no momento...</p>';
                return;
            }

            // Separa cada bloco que inicia com #Nome: (evita o problema com ';' no markdown)
            const rawCursos = text.split(/(?=#Nome:)/);
            let htmlContent = '';

            rawCursos.forEach(curso => {
                if(curso.trim() && curso.includes('#Nome:')) {
                    // Extrai os campos removendo colchetes [ ] adicionais se existirem
                    const nomeMatch = curso.match(/#Nome:\s*\[?([^\]\r\n]+)\]?/);
                    const iconeMatch = curso.match(/Icone:\s*\[?([^\]\r\n]+)\]?/);
                    const linkMatch = curso.match(/Link:\s*\[?([^\]\r\n]+)\]?/);
                    const descMatch = curso.match(/Desc:\s*\[?([\s\S]+)/);                                          if (nomeMatch && descMatch) {                         const nome = nomeMatch[1].trim();                         const icone = iconeMatch ? iconeMatch[1].trim() : '';                         const link = linkMatch ? linkMatch[1].trim() : '#';                                                  // Limpa o fecho da descrição se houver "];" ou "]" no final do bloco                         let rawDesc = descMatch[1].trim();                         rawDesc = rawDesc.replace(/\]\s*;\s*$/, '').replace(/\]$/, '').trim();

                        const desc = marked.parse(rawDesc);
                        const safeDesc = encodeURIComponent(desc);

                        htmlContent += `
                            <div class="curso-card" 
                                 ontouchstart="showCursoTooltip('${safeDesc}')" 
                                 ontouchend="hideCursoTooltip()"
                                 onmousedown="showCursoTooltip('${safeDesc}')"
                                 onmouseup="hideCursoTooltip()"
                                 onmouseleave="hideCursoTooltip()">
                                ${icone ? `<img src="${icone}" alt="${nome}">` : '<i class="fa-solid fa-certificate" style="font-size:40px; color:#412838; margin-bottom:10px;"></i>'}
                                <h4>${nome}</h4>
                                <a href="${link}" target="_blank" class="curso-btn">INSCREVA-SE</a>
                            </div>
                        `;
                    }
                }
            });

            if (text.includes('Não há outros cursos disponíveis...')) {
                htmlContent += '<p style="color: rgba(255,255,255,0.8); text-align:center; font-size: 0.85rem; margin-top: 20px;">Não há outros cursos disponíveis...</p>';
            }

            container.innerHTML = htmlContent;

        } else {
            container.innerHTML = '<p class="text-white">Nenhum curso disponível no momento...</p>';
        }
    } catch (e) {
        console.error("Erro ao carregar cursos.txt", e);
    }
}

// Funções do Tooltip de Cursos
const tooltip = document.getElementById('curso-tooltip');
function showCursoTooltip(encodedMarkdown) {
    tooltip.innerHTML = decodeURIComponent(encodedMarkdown);
    tooltip.style.display = 'block';
}

function hideCursoTooltip() {
    tooltip.style.display = 'none';
}

async function loadMinisterios() {
    const container = document.getElementById('ministerios-container');
    try {
        const response = await fetch('ministerios.txt');
        if (response.ok) {
            const text = await response.text();
            
            // Separa cada bloco que inicia com Titulo: (evita quebrar no ';' do texto)
            const rawMins = text.split(/(?=Titulo:)/);
            let htmlContent = '';

            rawMins.forEach(min => {
                if(min.trim() && min.includes('Titulo:')) {
                    // Extrai os campos e ignora colchetes caso você ainda os use
                    const tituloMatch = min.match(/Titulo:\s*\[?([^\]\r\n]+)\]?/);
                    const textoMatch = min.match(/Texto:\s*\[?([\s\S]+)/);                                          if (tituloMatch && textoMatch) {                         const titulo = tituloMatch[1].trim();                                                  // Limpa "];" ou "]" do final do texto, caso existam                         let rawTexto = textoMatch[1].trim();                         rawTexto = rawTexto.replace(/\]\s*;\s*$/, '').replace(/\]$/, '').trim();

                        const texto = marked.parse(rawTexto);

                        htmlContent += `
                            <div class="ministerio-acc" onclick="toggleAccordion(this)">
                                <div class="acc-header">
                                    <h4>${titulo}</h4>
                                    <i class="fa-solid fa-chevron-right"></i>
                                </div>
                                <div class="acc-body">
                                    ${texto}
                                </div>
                            </div>
                        `;
                    }
                }
            });

            container.innerHTML = htmlContent;
        } else {
             container.innerHTML = '<p class="text-white">Nenhum ministério encontrado.</p>';
        }
    } catch (e) {
         console.error("Erro ao carregar ministerios.txt", e);
    }
}

// Lógica do Acordeão de Ministérios
function toggleAccordion(element) {
    // Fecha os outros se quiser que apenas um fique aberto por vez
    const allAccs = document.querySelectorAll('.ministerio-acc');
    allAccs.forEach(acc => {
        if(acc !== element) acc.classList.remove('open');
    });

    element.classList.toggle('open');
}
