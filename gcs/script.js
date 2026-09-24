// ATENÇÃO: Substitua pelo link gerado no seu Google Apps Script (Implantação de Aplicativo da Web)
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzN0f7HdfsB2AiJ9i4cnoJR2jmPNZoBsKdfazs3pbeQvyx0Jzwl0mYsgV-dcLuAZzsWHg/exec"; 

let allGCs = [];

// Ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    loadGCs();
});

// Funções de Loader
function showLoader() {
    document.getElementById('loader-overlay').style.display = 'flex';
}
function hideLoader() {
    document.getElementById('loader-overlay').style.display = 'none';
}

// === LÓGICA DE LISTAGEM E PESQUISA ===
async function loadGCs() {
    showLoader();
    try {
        const response = await fetch(`${WEB_APP_URL}?action=getGCs`);
        const data = await response.json();
        allGCs = data;
        renderGCList(allGCs);
    } catch (error) {
        console.error("Erro ao carregar GCs:", error);
    } finally {
        hideLoader();
    }
}

function renderGCList(lista) {
    const container = document.getElementById('gc-list-container');
    container.innerHTML = '';

    if(lista.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: #363636;">Nenhum GC encontrado.</p>';
        return;
    }

    lista.forEach(gc => {
        const div = document.createElement('div');
        div.className = 'gc-item';
        div.onclick = () => openViewModal(gc);
        
        div.innerHTML = `
            <div class="gc-info">
                <h3>${gc.nomeGC}</h3>
                <p>Bairro ${gc.bairro}</p>
            </div>
            <i class="fa-solid fa-chevron-right gc-arrow"></i>
        `;
        container.appendChild(div);
    });
}

function filterGCs() {
    const termo = document.getElementById('search-input').value.toLowerCase();
    const filtrados = allGCs.filter(gc => 
        gc.nomeGC.toLowerCase().includes(termo) || 
        gc.bairro.toLowerCase().includes(termo)
    );
    renderGCList(filtrados);
}

// === MODAIS ===
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function closeAllModals(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
    }
}

// Modal Visualizar GC
function openViewModal(gc) {
    document.getElementById('view-gc-name').innerText = gc.nomeGC;
    document.getElementById('view-gc-bairro').innerText = gc.bairro;
    document.getElementById('view-gc-diahora').innerText = gc.diaHora;
    
    let lideres = gc.lider1;
    if(gc.lider2) lideres += ` e ${gc.lider2}`;
    document.getElementById('view-gc-lider').innerText = lideres;

    // Converte o telefone para texto e remove caracteres especiais para o link do zap (Evita o erro de Type)
    const telefoneString = String(gc.telefone || "");
    const numeroLimpo = telefoneString.replace(/\D/g, '');
    
    document.getElementById('btn-contatar-lider').href = `https://wa.me/55${numeroLimpo}`;

    openModal('modal-view-gc');
}
