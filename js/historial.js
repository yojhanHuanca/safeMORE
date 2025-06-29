class HistoryManager {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.filters = {
            startDate: '',
            endDate: '',
            type: 'all'
        };
        
        // Elementos del DOM
        this.elements = {
            loading: document.getElementById('loadingState'),
            accessList: document.getElementById('accessList'),
            filterBtn: document.getElementById('filterBtn'),
            filtersDropdown: document.getElementById('filtersDropdown'),
            startDate: document.getElementById('startDate'),
            endDate: document.getElementById('endDate'),
            accessType: document.getElementById('accessType'),
            applyFilters: document.getElementById('applyFilters'),
            resetFilters: document.getElementById('resetFilters'),
            prevPage: document.getElementById('prevPageMobile'),
            nextPage: document.getElementById('nextPageMobile'),
            pageInfo: document.getElementById('pageInfoMobile'),
            exportModal: document.getElementById('exportModal'),
            exportPDF: document.getElementById('exportPDF'),
            exportExcel: document.getElementById('exportExcel'),
            closeExport: document.getElementById('closeExportModal')
        };
        
        this.init();
    }

    init() {
        // Cargar datos iniciales
        this.loadData();
        
        // Event Listeners
        this.elements.filterBtn.addEventListener('click', () => this.toggleFilters());
        this.elements.applyFilters.addEventListener('click', () => this.applyFilters());
        this.elements.resetFilters.addEventListener('click', () => this.resetFilters());
        this.elements.prevPage.addEventListener('click', () => this.changePage(-1));
        this.elements.nextPage.addEventListener('click', () => this.changePage(1));
        this.elements.exportPDF.addEventListener('click', () => this.exportData('pdf'));
        this.elements.exportExcel.addEventListener('click', () => this.exportData('excel'));
        this.elements.closeExport.addEventListener('click', () => this.closeModal());
        
        // Configurar fechas por defecto (últimos 7 días)
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        
        this.elements.startDate.valueAsDate = weekAgo;
        this.elements.endDate.valueAsDate = today;
        this.elements.startDate.max = today.toISOString().split('T')[0];
        this.elements.endDate.max = today.toISOString().split('T')[0];
        
        const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
        if (usuario && usuario.rol === 'administrativo') {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
            // Aquí puedes habilitar más controles para admin
        }
    }

    async loadData() {
        this.showLoading(true);
        
        try {
            // Simular llamada a API (en producción sería fetch a tu backend)
            const response = await this.mockApiCall();
            this.renderData(response.data);
            this.updatePagination(response.total);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            this.renderError();
        } finally {
            this.showLoading(false);
        }
    }

    async mockApiCall() {
        // Simular retardo de red
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Datos de ejemplo (en producción vendrían de tu API)
        const mockData = [];
        const statuses = ['success', 'error'];
        const types = ['entry', 'exit'];
        const locations = ['Edificio A', 'Edificio B', 'Edificio C'];
        
        for (let i = 0; i < 15; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            
            mockData.push({
                id: i + 1,
                date: date.toISOString(),
                type: types[Math.floor(Math.random() * types.length)],
                location: locations[Math.floor(Math.random() * locations.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)]
            });
        }
        
        // Aplicar filtros simulados
        let filteredData = mockData.filter(item => {
            const itemDate = new Date(item.date).toISOString().split('T')[0];
            const matchesDate = (
                (!this.filters.startDate || itemDate >= this.filters.startDate) &&
                (!this.filters.endDate || itemDate <= this.filters.endDate)
            );
            const matchesType = this.filters.type === 'all' || item.type === this.filters.type;
            return matchesDate && matchesType;
        });
        
        // Paginación simulada
        const startIdx = (this.currentPage - 1) * 10;
        const paginatedData = filteredData.slice(startIdx, startIdx + 10);
        
        return {
            data: paginatedData,
            total: filteredData.length
        };
    }

    renderData(data) {
        if (data.length === 0) {
            this.elements.accessList.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">info</span>
                    <p>No se encontraron registros</p>
                </div>
            `;
            return;
        }
        
        this.elements.accessList.innerHTML = data.map(item => {
            const date = new Date(item.date);
            const formattedDate = date.toLocaleDateString('es-MX', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            });
            const time = date.toLocaleTimeString('es-MX', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            return `
                <div class="access-item ${item.status}">
                    <div class="access-icon">
                        <span class="material-icons">${item.type === 'entry' ? 'login' : 'logout'}</span>
                    </div>
                    <div class="access-info">
                        <h3>${item.type === 'entry' ? 'Entrada' : 'Salida'}</h3>
                        <p>${formattedDate} · ${time}</p>
                    </div>
                    <span class="access-status">${item.status === 'success' ? '✓' : '✗'}</span>
                </div>
            `;
        }).join('');
    }

    renderError() {
        this.elements.accessList.innerHTML = `
            <div class="error-state">
                <span class="material-icons">error</span>
                <p>Error al cargar el historial</p>
                <button id="retryBtn" class="btn-primary">Reintentar</button>
            </div>
        `;
        
        document.getElementById('retryBtn').addEventListener('click', () => this.loadData());
    }

    updatePagination(totalItems) {
        this.totalPages = Math.ceil(totalItems / 10);
        this.elements.pageInfo.textContent = `Pág. ${this.currentPage}/${this.totalPages}`;
        this.elements.prevPage.disabled = this.currentPage <= 1;
        this.elements.nextPage.disabled = this.currentPage >= this.totalPages;
    }

    showLoading(show) {
        this.elements.loading.style.display = show ? 'flex' : 'none';
        this.elements.accessList.style.display = show ? 'none' : 'flex';
    }

    toggleFilters() {
        this.elements.filtersDropdown.classList.toggle('hidden');
    }

    applyFilters() {
        this.filters = {
            startDate: this.elements.startDate.value,
            endDate: this.elements.endDate.value,
            type: this.elements.accessType.value
        };
        
        this.currentPage = 1;
        this.loadData();
        this.elements.filtersDropdown.classList.add('hidden');
    }

    resetFilters() {
        this.elements.startDate.value = '';
        this.elements.endDate.value = '';
        this.elements.accessType.value = 'all';
    }

    changePage(delta) {
        this.currentPage += delta;
        this.loadData();
        
        // Scroll suave al inicio
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    exportData(format) {
        console.log(`Exportando a ${format.toUpperCase()}...`); // En producción usarías librerías como pdfmake o sheetjs
        this.closeModal();
        alert(`Exportación a ${format.toUpperCase()} simulada. En producción se generaría el archivo.`);
    }

    openModal() {
        this.elements.exportModal.classList.remove('hidden');
    }

    closeModal() {
        this.elements.exportModal.classList.add('hidden');
    }
}

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryManager();
    
    // Ejemplo: Botón de exportar en el header (simulado)
    document.querySelector('.history-header').addEventListener('click', (e) => {
        if (e.target.closest('.icon-btn') && e.target.textContent === 'download') {
            historyManager.openModal();
        }
    });
    
    const accessList = document.getElementById('accessList');
    const loadingState = document.getElementById('loadingState');
    
    // Simulación de historial realista y profesional
    const estados = [
        { status: "success", label: "✓", text: "Correcto" },
        { status: "error", label: "✗", text: "Denegado" },
        { status: "entry", label: "!", text: "Tardanza" }
    ];

    function randomHora(tipo) {
        if (tipo === "entry") {
            // Entradas entre 07:30 y 09:00
            const h = 7 + Math.floor(Math.random() * 2);
            const m = Math.floor(Math.random() * 60);
            return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        } else {
            // Salidas entre 12:30 y 14:00
            const h = 12 + Math.floor(Math.random() * 2);
            const m = Math.floor(Math.random() * 60);
            return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        }
    }

    function randomEstado(tipo) {
        if (tipo === "entry" && Math.random() < 0.1) return estados[2]; // 10% tardanza
        if (Math.random() < 0.05) return estados[1]; // 5% denegado
        return estados[0]; // Correcto
    }

    function randomFechaDiasAtras(dias) {
        const d = new Date();
        d.setDate(d.getDate() - dias);
        return d;
    }

    function formatoFechaHora(fecha, hora) {
        const [h, m] = hora.split(":");
        fecha.setHours(h, m);
        return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' · ' +
            fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Genera historial de los últimos 10 días
    let historial = [];
    for (let i = 0; i < 10; i++) {
        // Entrada
        const fecha = randomFechaDiasAtras(i);
        const tipo = "entry";
        const hora = randomHora(tipo);
        const estado = randomEstado(tipo);
        historial.push({
            tipo: "Entrada",
            fechaHora: formatoFechaHora(new Date(fecha), hora),
            status: estado.status,
            statusLabel: estado.label,
            statusText: estado.text
        });
        // Salida
        const tipo2 = "exit";
        const hora2 = randomHora(tipo2);
        const estado2 = randomEstado(tipo2);
        historial.push({
            tipo: "Salida",
            fechaHora: formatoFechaHora(new Date(fecha), hora2),
            status: estado2.status,
            statusLabel: estado2.label,
            statusText: estado2.text
        });
    }
    
    // Ordena por fecha descendente
    historial.sort((a, b) => new Date(b.fechaHora.split('·')[0]) - new Date(a.fechaHora.split('·')[0]));
    
    // Renderiza historial
    function renderHistorial(data) {
        accessList.innerHTML = "";
        if (data.length === 0) {
            accessList.innerHTML = "<div class='access-item'><div class='access-info'><h3>No hay registros</h3></div></div>";
            return;
        }
        data.forEach(item => {
            accessList.innerHTML += `
                <div class="access-item ${item.status} ${item.tipo === "Entrada" ? "entry" : "exit"}">
                    <div class="access-icon">
                        <span class="material-icons">${item.tipo === "Entrada" ? "login" : "logout"}</span>
                    </div>
                    <div class="access-info">
                        <h3>${item.tipo}</h3>
                        <p>${item.fechaHora}</p>
                    </div>
                    <span class="access-status" title="${item.statusText}">${item.statusLabel}</span>
                </div>
            `;
        });
    }
    
    // Simula carga
    setTimeout(() => {
        loadingState.style.display = "none";
        renderHistorial(historial);
    }, 900);
});