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