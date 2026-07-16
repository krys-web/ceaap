document.addEventListener('DOMContentLoaded', () => {
    // 1. Menú Hamburguesa
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        const navLinks = document.querySelectorAll('nav ul li a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }

    // 2. Sistema de tarjetas (Tabs)
    const tabButtons = document.querySelectorAll('.hero-tabs .tab-btn');
    const heroCards = document.querySelectorAll('.hero-cards-wrapper .hero-card');
    let autoChangeInterval;

    function switchTab(targetTab) {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        heroCards.forEach(card => card.classList.remove('active'));

        const activeBtn = document.querySelector(`.hero-tabs .tab-btn[data-tab="${targetTab}"]`);
        const activeCard = document.getElementById(`tab-${targetTab}`);

        if (activeBtn && activeCard) {
            activeBtn.classList.add('active');
            activeCard.classList.add('active');
        }
    }

    function startAutoChange() {
        autoChangeInterval = setInterval(() => {
            const currentActiveBtn = document.querySelector('.hero-tabs .tab-btn.active');
            if (!currentActiveBtn) return;

            const currentTab = currentActiveBtn.getAttribute('data-tab');
            const nextTab = (currentTab === 'respiratorio') ? 'nutricion' : 'respiratorio';
            switchTab(nextTab);
        }, 5000);
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            clearInterval(autoChangeInterval);
            switchTab(button.getAttribute('data-tab'));
            startAutoChange(); // Reiniciar el ciclo
        });
    });

    if (tabButtons.length > 0) startAutoChange();

    // 3. Animaciones con IntersectionObserver (Refactorizado para seguridad)
    const observerOptions = { root: null, threshold: 0.15 };
    
    function createObserver(elements, className) {
        return new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(className);
                } else {
                    entry.target.classList.remove(className);
                }
            });
        }, observerOptions);
    }

    // Hero
    const heroElements = document.querySelectorAll('.hero-content h1, .hero-content p, .hero-stats, .hero-cards-wrapper');
    heroElements.forEach(el => el.classList.add('animate-prepare'));
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                heroElements.forEach(el => el.classList.add('animate-visible'));
            } else {
                heroElements.forEach(el => el.classList.remove('animate-visible'));
            }
        });
    }, observerOptions);
    const heroSection = document.querySelector('.hero');
    if (heroSection) heroObserver.observe(heroSection);

    // Servicios
    const serviceCards = document.querySelectorAll('.servicios .service-card');
    const servObserver = createObserver(serviceCards, 'animate-visible');
    serviceCards.forEach(card => {
        card.classList.add('animate-prepare');
        servObserver.observe(card);
    });

    // Enfermedades
    const enfermedadCards = document.querySelectorAll('.enfermedades .enfermedad-card');
    const enfObserver = createObserver(enfermedadCards, 'animate-visible');
    enfermedadCards.forEach(card => {
        card.classList.add('animate-prepare');
        enfObserver.observe(card);
    });

    // 4. FAQ
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        const isOpen = button.classList.contains('active');
        
        // Cierra todas las demás
        document.querySelectorAll('.faq-answer').forEach(item => item.style.maxHeight = '0px');
        document.querySelectorAll('.faq-question').forEach(btn => btn.classList.remove('active'));
        
        // Abre la seleccionada si no estaba abierta
        if (!isOpen) {
            answer.style.maxHeight = answer.scrollHeight + "px";
            button.classList.add('active');
        }
    });
});

    // 5. Logo Animación
    const logoImg = document.querySelector('.logo img');
    if (logoImg) {
        setTimeout(() => {
            logoImg.classList.add('logo-animate');
            setTimeout(() => logoImg.classList.remove('logo-animate'), 1000);
        }, 300);
    }

    // 6. Submenú Responsive
    const submenuLink = document.querySelector('.has-submenu > a');
    if (submenuLink) {
        submenuLink.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                document.querySelector('.submenu').classList.toggle('active');
            }
        });
    }

    // 7. Sección Nosotros (Corrección del error de null)
    const textElement = document.querySelector('.scrolling-text'); // Asegúrate que el ID sea correcto en HTML
    const toggleBtn = document.getElementById('toggle-animation');
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    let position = 0;

    if (textElement && toggleBtn && btnUp && btnDown) {
        const updatePosition = () => { textElement.style.transform = `translateY(${position}px)`; };

        toggleBtn.addEventListener('click', () => {
            textElement.classList.toggle('paused');
            const computedStyle = window.getComputedStyle(textElement);
            position = new WebKitCSSMatrix(computedStyle.transform).f;
            updatePosition();
        });

        btnUp.addEventListener('click', () => {
            textElement.classList.add('paused');
            position -= 30;
            updatePosition();
        });

        btnDown.addEventListener('click', () => {
            textElement.classList.add('paused');
            position += 30;
            updatePosition();
        });
    }
});

// FORZADO DE VISIBILIDAD PARA DEPURACIÓN
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.enfermedad-card');
    cards.forEach(card => {
        card.style.opacity = "1";
        /*card.style.display = "block"; // o "flex", según sea tu grid*/
    });
});

// Manejo de submenús en dispositivos móviles
document.querySelectorAll('.has-submenu > a, .has-submenu-level2 > a').forEach(link => {
    link.addEventListener('click', (e) => {
        // Solo aplicar este comportamiento en pantallas pequeñas
        if (window.innerWidth <= 992) {
            e.preventDefault(); // Evita que el enlace redirija
            e.stopPropagation(); // Evita que se cierre el menú padre
            
            // Alterna la clase 'active' en el submenú correspondiente
            const submenu = link.nextElementSibling;
            if (submenu && (submenu.classList.contains('submenu') || submenu.classList.contains('submenu-level2'))) {
                submenu.classList.toggle('active');
            }
        }
    });
});