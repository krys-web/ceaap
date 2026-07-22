// Variable global para almacenar el estado del turno
let bookingData = {
    nombre: '',
    cedula: '',
    celular: '',
    correo: '',
    modalidad: '',
    especialista: '',
    especialidad: '',
    fecha: '',
    hora: ''
};

let currentStep = 1;

// Configuración de correos del centro médico
const CORREOS_CENTRO = ["contacto@consultorio.com", "citas@consultorio.com"];

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar EmailJS con tu Public Key si aplica
    if (typeof emailjs !== 'undefined') {
        emailjs.init("YOUR_PUBLIC_KEY"); // Reemplazar con tu clave de EmailJS si vas a usar envío directo por JS
    }

    // Configurar fecha mínima (hoy) en el selector de calendario
    const fechaInput = document.getElementById('fechaCita');
    if (fechaInput) {
        const today = new Date().toISOString().split('T')[0];
        fechaInput.setAttribute('min', today);
    }
});

// Control del Wizard
function changeStep(delta) {
    if (delta === 1 && !validarPasoActual()) return;

    currentStep += delta;

    if (currentStep > 5) {
        confirmarReservaFinal();
        return;
    }

    actualizarVistasWizard();
}

function actualizarVistasWizard() {
    // Alternar visibilidad de los pasos
    document.querySelectorAll('.step-content').forEach((step, idx) => {
        step.classList.toggle('active', idx + 1 === currentStep);
    });

    // Actualizar indicador de círculos
    for (let i = 1; i <= 5; i++) {
        const circle = document.getElementById(`circle-${i}`);
        circle.classList.remove('active', 'completed');
        if (i === currentStep) {
            circle.classList.add('active');
        } else if (i < currentStep) {
            circle.classList.add('completed');
        }
    }

    // Botones de navegación
    document.getElementById('btnPrev').style.display = currentStep === 1 ? 'none' : 'inline-block';
    document.getElementById('btnNext').innerText = currentStep === 5 ? 'Confirmar Cita' : 'Siguiente';

    if (currentStep === 5) {
        renderizarResumen();
    }
}

// Validaciones por paso
function validarPasoActual() {
    if (currentStep === 1) {
        const nombre = document.getElementById('nombre').value.trim();
        const cedula = document.getElementById('cedula').value.trim();
        const celular = document.getElementById('celular').value.trim();
        const correo = document.getElementById('correo').value.trim();

        if (!nombre || !cedula || !celular || !correo) {
            alert('Por favor, llena todos los campos del formulario.');
            return false;
        }

        bookingData.nombre = nombre;
        bookingData.cedula = cedula;
        bookingData.celular = celular;
        bookingData.correo = correo;
        return true;
    }

    if (currentStep === 2) {
        if (!bookingData.modalidad) {
            alert('Por favor selecciona si tu cita será Presencial o por Telemedicina.');
            return false;
        }
        return true;
    }

    if (currentStep === 3) {
        if (!bookingData.especialista || !bookingData.especialidad) {
            alert('Por favor selecciona una especialidad o un especialista.');
            return false;
        }
        return true;
    }

    if (currentStep === 4) {
        if (!bookingData.fecha || !bookingData.hora) {
            alert('Por favor selecciona una fecha y un horario disponible.');
            return false;
        }
        return true;
    }

    return true;
}

// Paso 2: Selección de modalidad
function selectModalidad(modalidad, element) {
    bookingData.modalidad = modalidad;
    document.querySelectorAll('#step-2 .option-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
}

// Paso 3: Filtro e Intercambio Especialista/Especialidad
function toggleFiltroSeleccion() {
    const tipo = document.getElementById('filtroTipo').value;
    document.getElementById('wrapperEspecialistas').style.display = tipo === 'especialista' ? 'grid' : 'none';
    document.getElementById('wrapperEspecialidades').style.display = tipo === 'especialidad' ? 'grid' : 'none';
}

function selectEspecialista(nombre, especialidad, element) {
    bookingData.especialista = nombre;
    bookingData.especialidad = especialidad;
    document.querySelectorAll('#step-3 .option-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
}

function selectEspecialidad(especialidad, nombreEspecialista, element) {
    bookingData.especialidad = especialidad;
    bookingData.especialista = nombreEspecialista;
    document.querySelectorAll('#step-3 .option-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
}

// Paso 4: Generar bloques de tiempo cada 20 minutos (09:00 - 17:00)
function generarHorariosDisponibles() {
    const fechaInput = document.getElementById('fechaCita').value;
    const container = document.getElementById('slotsContainer');
    container.innerHTML = '';

    if (!fechaInput) return;

    bookingData.fecha = fechaInput;
    bookingData.hora = ''; 

    // Horarios de 09:00 a 17:00 con intervalos de 20 minutos
    const startHour = 9;
    const endHour = 17;

    for (let h = startHour; h < endHour; h++) {
        for (let m = 0; m < 60; m += 20) {
            const hourStr = h.toString().padStart(2, '0');
            const minStr = m.toString().padStart(2, '0');
            const timeSlot = `${hourStr}:${minStr}`;

            const slotEl = document.createElement('div');
            slotEl.className = 'time-slot';
            slotEl.innerText = timeSlot;
            slotEl.onclick = () => {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                slotEl.classList.add('selected');
                bookingData.hora = timeSlot;
            };
            container.appendChild(slotEl);
        }
    }
}

// Paso 5: Mostrar Resumen
function renderizarResumen() {
    document.getElementById('sumNombre').innerText = bookingData.nombre;
    document.getElementById('sumCedula').innerText = bookingData.cedula;
    document.getElementById('sumContacto').innerText = `${bookingData.celular} | ${bookingData.correo}`;
    document.getElementById('sumModalidad').innerText = bookingData.modalidad;
    document.getElementById('sumEspecialista').innerText = bookingData.especialista;
    document.getElementById('sumEspecialidad').innerText = bookingData.especialidad;
    document.getElementById('sumFechaHora').innerText = `${bookingData.fecha} a las ${bookingData.hora}`;
}

// Confirmar y notificar (Email + WhatsApp)
function confirmarReservaFinal() {
    // 1. Envío de correos (EmailJS o backend propio)
    const templateParams = {
        to_user_email: bookingData.correo,
        to_admin_email_1: CORREOS_CENTRO[0],
        to_admin_email_2: CORREOS_CENTRO[1],
        patient_name: bookingData.nombre,
        patient_id: bookingData.cedula,
        patient_phone: bookingData.celular,
        modality: bookingData.modalidad,
        doctor: bookingData.especialista,
        specialty: bookingData.especialidad,
        date: bookingData.fecha,
        time: bookingData.hora
    };

    if (typeof emailjs !== 'undefined') {
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
            .then(() => console.log('Correo enviado con éxito'))
            .catch(err => console.error('Error al enviar correo:', err));
    }

    // 2. Notificación directa por WhatsApp al cliente
    const mensajeWA = `*Confirmación de Cita Médica*%0A%0A` +
        `*Paciente:* ${bookingData.nombre}%0A` +
        `*Cédula:* ${bookingData.cedula}%0A` +
        `*Modalidad:* ${bookingData.modalidad}%0A` +
        `*Especialista:* ${bookingData.especialista}%0A` +
        `*Especialidad:* ${bookingData.especialidad}%0A` +
        `*Fecha:* ${bookingData.fecha}%0A` +
        `*Hora:* ${bookingData.hora}%0A%0A` +
        `¡Gracias por confiar en nuestro Centro de Especialidades!`;

    const urlWA = `https://wa.me/593${bookingData.celular.replace(/^0/, '')}?text=${mensajeWA}`;

    alert('¡Reserva confirmada exitosamente! Se han enviado los detalles a tu correo electrónico y a los del Centro.');
    
    // Redirigir a WhatsApp
    window.open(urlWA, '_blank');
}