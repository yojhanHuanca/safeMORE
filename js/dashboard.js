class Dashboard {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.menuBtn = document.getElementById('menuBtn');
        this.closeSidebarBtn = document.getElementById('closeSidebar');
        this.notificationsBtn = document.getElementById('notificationsBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.logoutModal = document.getElementById('logoutModal');
        this.confirmLogout = document.getElementById('confirmLogout');
        this.cancelLogout = document.getElementById('cancelLogout');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.loadRecentAccess();
    }

    setupEventListeners() {
        // Toggle sidebar
        this.menuBtn.addEventListener('click', this.openSidebar.bind(this));
        this.closeSidebarBtn.addEventListener('click', this.closeSidebar.bind(this));
        this.sidebarOverlay.addEventListener('click', this.closeSidebar.bind(this));

        // Logout
        this.logoutBtn.addEventListener('click', this.showLogoutModal.bind(this));

        // Notifications
        this.notificationsBtn.addEventListener('click', this.showNotifications.bind(this));

        // Swipe to close sidebar
        this.setupSwipeGestures();
    }

    openSidebar() {
        this.sidebar.classList.add('open');
        this.sidebarOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeSidebar() {
        this.sidebar.classList.remove('open');
        this.sidebarOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    setupSwipeGestures() {
        let touchStartX = 0;
        
        this.sidebar.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
        }, { passive: true });

        this.sidebar.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            if (touchStartX - touchEndX > 50) {
                this.closeSidebar();
            }
        }, { passive: true });
    }

    loadUserData() {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (usuario) {
            const userName = document.getElementById('userName');
            if (userName) userName.textContent = usuario.nombre;

            const sidebarUserName = document.getElementById('sidebarUserName');
            if (sidebarUserName) sidebarUserName.textContent = usuario.nombre;

            const sidebarUserCode = document.getElementById('sidebarUserCode');
            if (sidebarUserCode) sidebarUserCode.textContent = usuario.codigo || 'Sin código';
        }
    }

    loadRecentAccess() {
        // Simular carga de accesos recientes
        setTimeout(() => {
            // En producción sería una llamada API
            console.log('Accesos recientes cargados');
        }, 500);
    }

    showNotifications() {
        // Simular notificaciones
        alert('Mostrando notificaciones...');
    }

    showLogoutModal() {
        this.logoutModal.classList.remove('hidden');
    }

    handleLogout() {
        // Simular logout
        if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});

// Mostrar modal al hacer clic en "Cerrar Sesión"
if (logoutBtn && logoutModal) {
    logoutBtn.addEventListener('click', () => {
        logoutModal.classList.remove('hidden');
    });
}

// Confirmar cierre de sesión
if (confirmLogout) {
    confirmLogout.addEventListener('click', () => {
        localStorage.removeItem('usuarioActivo');
        window.location.href = 'index.html'; // Cambia a 'login.html' si tu login está en otro archivo
    });
}

// Cancelar cierre de sesión
if (cancelLogout) {
    cancelLogout.addEventListener('click', () => {
        logoutModal.classList.add('hidden');
    });
}