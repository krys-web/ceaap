document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. MENÚ HAMBURGUESA Y SUBMENÚS MÓVILES
    // ==========================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // Control unificado para submenús Nivel 1 y Nivel 2
    const submenuParents = document.querySelectorAll('.has-submenu > a, .has-submenu-level2 > a');

    submenuParents.forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                const targetSubmenu = link.nextElementSibling;

                if (targetSubmenu && (targetSubmenu.classList.contains('submenu') || targetSubmenu.classList.contains('submenu-level2'))) {
                    e.preventDefault(); // Previene la navegación/recarga
                    e.stopPropagation(); // Detiene la propagación para que no se cierre el menú padre

                    // Alternar la clase active solo del submenú seleccionado
                    targetSubmenu.classList.toggle('active');
                }
            }
        });
    });

    // Cerrar el menú principal solo al hacer clic en enlaces finales (hojas)
    const finalLinks = document.querySelectorAll('nav ul li a:not(.has-submenu > a):not(.has-submenu-level2 > a)');
    
    finalLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 992 && navMenu) {
                navMenu.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
            }
        });
    });


    // ==========================================
    // 2. SISTEMA DE TARJETAS (TABS)
    // ==========================================
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
            startAutoChange();
        });
    });

    if (tabButtons.length > 0) startAutoChange();


    // ==========================================
    // 3. ANIMACIONES CON INTERSECTION OBSERVER
    // ==========================================
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

    // Hero Observer
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


    // ==========================================
    // 4. PREGUNTAS FRECUENTES (FAQ)
    // ==========================================
    initFaqLogic();


    // ==========================================
    // 5. ANIMACIÓN LOGO
    // ==========================================
    const logoImg = document.querySelector('.logo img');
    if (logoImg) {
        setTimeout(() => {
            logoImg.classList.add('logo-animate');
            setTimeout(() => logoImg.classList.remove('logo-animate'), 1000);
        }, 300);
    }


    // ==========================================
    // 6. SECCIÓN NOSOTROS (SCROLLING TEXT)
    // ==========================================
    const textElement = document.querySelector('.scrolling-text');
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


    // ==========================================
    // 7. CARGA DINÁMICA DE DETALLES
    // ==========================================
    if (window.location.pathname.includes('detalle.html')) {
        cargarDetalle();
    }

    async function cargarDetalle() {
        const urlParams = new URLSearchParams(window.location.search);
        const tipo = urlParams.get('tipo');
        if (!tipo) return;

        try {
            const response = await fetch('datos-enfermedades.json');
            const data = await response.json();
            const enf = data[tipo];

            if (enf) {
                document.title = `${enf.titulo} | Consultorio Médico`;
                document.getElementById('titulo-enfermedad').innerText = enf.titulo;
                document.getElementById('img-enfermedad').src = enf.imagen;
                document.getElementById('trat-enfermedad').innerText = enf.tratamiento;

                const btnContainer = document.getElementById('boton-container');
                if(btnContainer) {
                    btnContainer.innerHTML = `<a href="${enf.link_boton}" class="enfermedad-link">${enf.texto_boton}</a>`;
                }

                const faqContainer = document.getElementById('faq-container');
                if(faqContainer) {
                    faqContainer.innerHTML = enf.faqs.map(item => `
                        <div class="faq-item">
                            <button class="faq-question">${item.pregunta}<span>+</span></button>
                            <div class="faq-answer"><p>${item.respuesta}</p></div>
                        </div>
                    `).join('');
                    initFaqLogic();
                }
            }
        } catch (error) {
            console.error("Error cargando el JSON:", error);
        }
    }

    function initFaqLogic() {
        document.querySelectorAll('.faq-question').forEach(button => {
            button.addEventListener('click', () => {
                const answer = button.nextElementSibling;
                const isOpen = button.classList.contains('active');
                
                document.querySelectorAll('.faq-answer').forEach(item => item.style.maxHeight = '0px');
                document.querySelectorAll('.faq-question').forEach(btn => btn.classList.remove('active'));
                
                if (!isOpen && answer) {
                    answer.style.maxHeight = answer.scrollHeight + "px";
                    button.classList.add('active');
                }
            });
        });
    }

    // Asegurar visibilidad de tarjetas
    const cards = document.querySelectorAll('.enfermedad-card');
    cards.forEach(card => card.style.opacity = "1");
});