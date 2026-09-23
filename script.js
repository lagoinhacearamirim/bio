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

// Lógica de Modais com Correção de Gatilho
function openModal(modalId) {
    document.getElementById('modal-overlay').classList.add('active');
    document.querySelectorAll('.modal-content').forEach(m => m.classList.remove('active'));
    
    const targetModal = document.getElementById(modalId);
    targetModal.classList.add('active');

    // Usando data-loaded em vez de innerHTML para evitar bloqueio por espaços vazios ou comentários
    if (modalId === 'modal-comece' && !targetModal.dataset.loaded) {
        console.log("Iniciando carregamento: Comece Aqui");
        loadComeceAqui();
        targetModal.dataset.loaded = "true";
    }
    if (modalId === 'modal-cursos' && !targetModal.dataset.loaded) {
        console.log("Iniciando carregamento: Cursos");
        loadCursos();
        targetModal.dataset.loaded = "true";
    }
    if (modalId === 'modal-ministerios' && !targetModal.dataset.loaded) {
        console.log("Iniciando carregamento: Ministérios");
        loadMinisterios();
        targetModal.dataset.loaded = "true";
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

// Trava de Segurança para biblioteca Marked
function checkMarked() {
    if (typeof marked === 'undefined') {
        console.error("ERRO CRÍTICO: A biblioteca 'marked' não está carregada no HTML.");
        return false;
    }
    return true;
}

// Carregamento de Arquivos de Texto
async function loadComeceAqui() {
    const container = document.getElementById('content-comece');
    try {
        const response = await fetch('comeceAqui.txt');
        if (response.ok) {
            const text = await response.text();
            if (checkMarked()) {
                container.innerHTML = marked.parse(text);
                console.log("Sucesso: comeceAqui.txt processado e renderizado.");
            } else {
                container.innerHTML = '<p class="text-white" style="text-align:center;">Erro técnico: Biblioteca de formatação (marked) ausente.</p>';
            }
        } else {
            container.innerHTML = `<p class="text-white" style="text-align:center;">Arquivo não encontrado. (Erro ${response.status})</p>`;
        }
    } catch (e) {
        console.error("Falha fatal no fetch do comeceAqui.txt. Testando sem servidor local?", e);
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

            if (!checkMarked()) return;

            const rawCursos = text.split(/(?=#Nome:)/);
            let htmlContent = '';

            rawCursos.forEach(curso => {
                if(curso.trim() && curso.includes('#Nome:')) {
                    const nomeMatch = curso.match(/#Nome:\s*\[?([^\]\r\n]+)\]?/);
                    const iconeMatch = curso.match(/Icone:\s*\[?([^\]\r\n]+)\]?/);
                    const linkMatch = curso.match(/Link:\s*\[?([^\]\r\n]+)\]?/);
                    const descMatch = curso.match(/Desc:\s*\[?([\s\S]+)/);                                          if (nomeMatch && descMatch) {                         const nome = nomeMatch[1].trim();                         const icone = iconeMatch ? iconeMatch[1].trim() : '';                         const link = linkMatch ? linkMatch[1].trim() : '#';                                                  let rawDesc = descMatch[1].trim();                         rawDesc = rawDesc.replace(/\]\s*;\s*$/, '').replace(/\]$/, '').trim();

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
            console.log("Sucesso: cursos.txt processado e renderizado.");
        } else {
            container.innerHTML = `<p class="text-white" style="text-align:center;">Cursos indisponíveis. (Erro ${response.status})</p>`;
        }
    } catch (e) {
        console.error("Falha fatal no fetch do cursos.txt:", e);
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
            
            if (!checkMarked()) return;

            const rawMins = text.split(/(?=Titulo:)/);
            let htmlContent = '';

            rawMins.forEach(min => {
                if(min.trim() && min.includes('Titulo:')) {
                    const tituloMatch = min.match(/Titulo:\s*\[?([^\]\r\n]+)\]?/);
                    const textoMatch = min.match(/Texto:\s*\[?([\s\S]+)/);                                          if (tituloMatch && textoMatch) {                         const titulo = tituloMatch[1].trim();                                                  let rawTexto = textoMatch[1].trim();                         rawTexto = rawTexto.replace(/\]\s*;\s*$/, '').replace(/\]$/, '').trim();

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
            console.log("Sucesso: ministerios.txt processado e renderizado.");
        } else {
             container.innerHTML = `<p class="text-white" style="text-align:center;">Nenhum ministério encontrado. (Erro ${response.status})</p>`;
        }
    } catch (e) {
         console.error("Falha fatal no fetch do ministerios.txt:", e);
    }
}

// Lógica do Acordeão de Ministérios
function toggleAccordion(element) {
    const allAccs = document.querySelectorAll('.ministerio-acc');
    allAccs.forEach(acc => {
        if(acc !== element) acc.classList.remove('open');
    });
    element.classList.toggle('open');
}
