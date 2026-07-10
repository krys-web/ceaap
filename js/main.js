document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav');

    menuToggle.addEventListener('click', () => {
        // Alterna la clase active en el nav para mostrarlo/ocultarlo
        navMenu.classList.toggle('active');
        
        // Alterna la clase active en el botón para transformarlo en X o volver a hamburguesa
        menuToggle.classList.toggle('active');
    });

    // Opcional: Cerrar el menú si el usuario hace clic en un enlace del menú
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
});

// ===================================================
// Sistema de intercambio de tarjetas (Manual + Automático)
// ===================================================
const tabButtons = document.querySelectorAll('.hero-tabs .tab-btn');
const heroCards = document.querySelectorAll('.hero-cards-wrapper .hero-card');

let autoChangeInterval;
const changeDelay = 5000; // Tiempo en milisegundos (5 segundos)

// Función centralizada para cambiar a una pestaña específica
function switchTab(targetTab) {
    // Quitar estado activo de todos los botones y tarjetas
    tabButtons.forEach(btn => btn.classList.remove('active'));
    heroCards.forEach(card => card.classList.remove('active'));

    // Activar el botón correspondiente y su tarjeta
    const activeBtn = document.querySelector(`.hero-tabs .tab-btn[data-tab="${targetTab}"]`);
    const activeCard = document.getElementById(`tab-${targetTab}`);

    if (activeBtn && activeCard) {
        activeBtn.classList.add('active');
        activeCard.classList.add('active');
    }
}

// Intercambio automático
function startAutoChange() {
    autoChangeInterval = setInterval(() => {
        // Encontrar cuál es la pestaña activa actual
        const currentActiveBtn = document.querySelector('.hero-tabs .tab-btn.active');
        if (!currentActiveBtn) return;

        const currentTab = currentActiveBtn.getAttribute('data-tab');
        
        // Alternar de manera cíclica entre las dos tarjetas disponibles
        const nextTab = (currentTab === 'respiratorio') ? 'nutricion' : 'respiratorio';
        
        switchTab(nextTab);
    }, changeDelay);
}

// Detener el auto-intercambio cuando el usuario interactúe voluntariamente
function stopAutoChange() {
    clearInterval(autoChangeInterval);
}

// Asignar eventos de clic a los botones de pestañas
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Detiene el temporizador automático permanentemente para priorizar la voluntad del usuario
        stopAutoChange(); 
        
        // Ejecuta el cambio manual
        switchTab(targetTab);
    });
});

// Iniciar la automatización al cargar la página
startAutoChange();

// ===================================================
// Animación de la sección Hero al entrar en el Visor
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.querySelector('.hero');
    // Elementos dentro del hero que queremos animar progresivamente
    const animatedElements = document.querySelectorAll('.hero-content h1, .hero-content p, .hero-stats, .hero-cards-wrapper');

    const observerOptions = {
        root: null, // Usa el viewport del navegador
        threshold: 0.15 // Se activa cuando el 15% de la sección es visible
    };

    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // El usuario está viendo la sección: activamos las animaciones
                animatedElements.forEach(el => el.classList.add('animate-visible'));
            } else {
                // El usuario pasó la sección: reiniciamos el estado para que vuelva a animarse al regresar
                animatedElements.forEach(el => el.classList.remove('animate-visible'));
            }
        });
    }, observerOptions);

    if (heroSection) {
        // Asignamos una clase inicial de preparación a los elementos
        animatedElements.forEach(el => el.classList.add('animate-prepare'));
        // Empezamos a observar la sección hero
        heroObserver.observe(heroSection);
    }
});

// ===================================================
// Animación de la sección Servicios al entrar en el Visor
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
    const serviciosSection = document.querySelector('.servicios');
    // Seleccionamos las tres tarjetas de servicios
    const serviceCards = document.querySelectorAll('.servicios .service-card');

    const observerOptions = {
        root: null,
        threshold: 0.15 // Se activa cuando el 15% de la sección es visible
    };

    const serviciosObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // El usuario está viendo la sección: animamos las tarjetas en cascada
                serviceCards.forEach(card => card.classList.add('animate-visible'));
            } else {
                // El usuario pasó la sección: reiniciamos para que vuelva a animarse al regresar
                serviceCards.forEach(card => card.classList.remove('animate-visible'));
            }
        });
    }, observerOptions);

    if (serviciosSection) {
        // Preparamos las tarjetas con el estado oculto inicial
        serviceCards.forEach(card => card.classList.add('animate-prepare'));
        // Empezamos a observar la sección de servicios
        serviciosObserver.observe(serviciosSection);
    }
});