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

// ===================================================
// Animación de la sección Enfermedades al entrar en el Visor
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
    const enfermedadesSection = document.querySelector('.enfermedades');
    const enfermedadCards = document.querySelectorAll('.enfermedades .enfermedad-card');

    const observerOptions = {
        root: null,
        threshold: 0.1 // Se activa cuando el 10% de la sección es visible
    };

    const enfermedadesObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Activa la animación al entrar
                enfermedadCards.forEach(card => card.classList.add('animate-visible'));
            } else {
                // Elimina la clase para permitir que se reinicie al volver a entrar
                enfermedadCards.forEach(card => card.classList.remove('animate-visible'));
            }
        });
    }, observerOptions);

    if (enfermedadesSection) {
        // Preparamos las tarjetas con el estado inicial oculto
        enfermedadCards.forEach(card => card.classList.add('animate-prepare'));
        enfermedadesObserver.observe(enfermedadesSection);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const examCards = document.querySelectorAll('.exam-card-unique');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Cuando entra en pantalla: quitamos 'prepare', ponemos 'visible'
                entry.target.classList.remove('animate-prepare');
                entry.target.classList.add('animate-visible');
            } else {
                // Cuando sale de pantalla: reiniciamos al estado inicial
                entry.target.classList.remove('animate-visible');
                entry.target.classList.add('animate-prepare');
            }
        });
    }, { 
        threshold: 0.1, // Se activa cuando al menos el 10% es visible
        rootMargin: "0px 0px -50px 0px" // Ajuste fino para evitar disparos prematuros
    });

    examCards.forEach(card => {
        // Estado inicial
        card.classList.add('animate-prepare');
        observer.observe(card);
    });
});


function toggleDetail(element) {
    // Busca el párrafo dentro de la tarjeta clicada
    const detail = element.querySelector('.info-detail');
    
    // Alterna la visibilidad
    if (detail.style.display === "none") {
        detail.style.display = "block";
    } else {
        detail.style.display = "none";
    }
}

/* animación para preguntas FAQS */

document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        const isOpen = answer.style.maxHeight !== '0px' && answer.style.maxHeight !== '';
        
        // Cerrar todas las demás respuestas
        document.querySelectorAll('.faq-answer').forEach(item => item.style.maxHeight = '0px');
        
        // Abrir la seleccionada
        if (!isOpen) {
            answer.style.maxHeight = answer.scrollHeight + "px";
        }
    });
});