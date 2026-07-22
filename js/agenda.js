// Importar los módulos necesarios del SDK de Firebase v10
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. CONFIGURACIÓN DE FIREBASE (Reemplaza con tus llaves del Paso 1)
const firebaseConfig = {
  apiKey: "AIzaSyCb5R5vD7C3ESO72fu1-oskr8QRzwObM4k",
  authDomain: "ceaap-d10a7.firebaseapp.com",
  projectId: "ceaap-d10a7",
  storageBucket: "ceaap-d10a7.firebasestorage.app",
  messagingSenderId: "553050703480",
  appId: "1:553050703480:web:d66c6f6d23596f6b884f8d"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variables globales del flujo del wizard
window.bookingData = {
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

window.currentStep = 1;
const CORREOS_CENTRO = ["contacto@consultorio.com", "citas@consultorio.com"];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const fechaInput = document.getElementById('fechaCita');
    if (fechaInput) {
        const today = new Date().toISOString().split('T')[0];
        fechaInput.setAttribute('min', today);
    }
});

// Exponer funciones al scope global (window) para usarlas en eventos onclick del HTML
window.changeStep = changeStep;
window.selectModalidad = selectModalidad;
window.toggleFiltroSeleccion = toggleFiltroSeleccion;
window.selectEspecialista = selectEspecialista;
window.selectEspecialidad = selectEspecialidad;
window.generarHorariosDisponibles = generarHorariosDisponibles;

// --- CONTROL DEL WIZARD ---
async function changeStep(delta) {
    if (delta === 1 && !(await validarPasoActual())) return;

    window.currentStep += delta;

    if (window.currentStep > 5) {
        confirmarReservaFinal();
        return;
    }

    actualizarVistasWizard();
}

function actualizarVistasWizard() {
    document.querySelectorAll('.step-content').forEach((step, idx) => {
        step.classList.toggle('active', idx + 1 === window.currentStep);
    });

    for (let i = 1; i <= 5; i++) {
        const circle = document.getElementById(`circle-${i}`);
        if (circle) {
            circle.classList.remove('active', 'completed');
            if (i === window.currentStep) circle.classList.add('active');
            else if (i < window.currentStep) circle.classList.add('completed');
        }
    }

    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');

    if (btnPrev) btnPrev.style.display = window.currentStep === 1 ? 'none' : 'inline-block';
    if (btnNext) btnNext.innerText = window.currentStep === 5 ? 'Confirmar Cita' : 'Siguiente';

    // Control del botón Siguiente según el paso actual
    if (window.currentStep === 1) {
        validarFormularioPaso1(); // Evalúa y habilita/deshabilita el botón
    } else {
        btnNext.disabled = false; // Se habilita para los demás pasos
    }

    if (window.currentStep === 5) renderizarResumen();
}

// --- VALIDACIONES POR PASO ---
async function validarPasoActual() {
    if (window.currentStep === 1) {
        const nombre = document.getElementById('nombre').value.trim();
        const cedula = document.getElementById('cedula').value.trim();
        const celular = document.getElementById('celular').value.trim();
        const correo = document.getElementById('correo').value.trim();

        if (!nombre || !cedula || !celular || !correo) {
            alert('Por favor, completa todos los campos obligatorios.');
            return false;
        }

        window.bookingData.nombre = nombre;
        window.bookingData.cedula = cedula;
        window.bookingData.celular = celular;
        window.bookingData.correo = correo;
        return true;
    }

    if (window.currentStep === 2) {
        if (!window.bookingData.modalidad) {
            alert('Por favor selecciona si tu cita será Presencial o por Telemedicina.');
            return false;
        }
        return true;
    }

    if (window.currentStep === 3) {
        if (!window.bookingData.especialista || !window.bookingData.especialidad) {
            alert('Por favor selecciona una especialidad o un especialista.');
            return false;
        }
        return true;
    }

    if (window.currentStep === 4) {
        if (!window.bookingData.fecha || !window.bookingData.hora) {
            alert('Por favor selecciona una fecha y un horario disponible.');
            return false;
        }
        return true;
    }

    return true;
}

// --- SELECCIONES DE PASOS 2 Y 3 ---
function selectModalidad(modalidad, element) {
    window.bookingData.modalidad = modalidad;
    document.querySelectorAll('#step-2 .option-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
}

function toggleFiltroSeleccion() {
    const tipo = document.getElementById('filtroTipo').value;
    document.getElementById('wrapperEspecialistas').style.display = tipo === 'especialista' ? 'grid' : 'none';
    document.getElementById('wrapperEspecialidades').style.display = tipo === 'especialidad' ? 'grid' : 'none';
}

function selectEspecialista(nombre, especialidad, element) {
    window.bookingData.especialista = nombre;
    window.bookingData.especialidad = especialidad;
    document.querySelectorAll('#step-3 .option-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
}

function selectEspecialidad(especialidad, nombreEspecialista, element) {
    window.bookingData.especialidad = especialidad;
    window.bookingData.especialista = nombreEspecialista;
    document.querySelectorAll('#step-3 .option-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
}

// --- PASO 4: CONSULTA DE DISPONIBILIDAD EN FIREBASE ---
// --- CONFIGURAR ATRIBUTO MIN EN EL INPUT FECHA ---
document.addEventListener('DOMContentLoaded', () => {
    const fechaInput = document.getElementById('fechaCita');
    if (fechaInput) {
        // Formato AAAA-MM-DD local
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = String(hoy.getMonth() + 1).padStart(2, '0');
        const day = String(hoy.getDate()).padStart(2, '0');
        
        const fechaMinima = `${year}-${month}-${day}`;
        fechaInput.setAttribute('min', fechaMinima);
        fechaInput.value = fechaMinima; // Opcional: preseleccionar el día de hoy
    }
});

// --- GENERAR HORARIOS CON FILTRO DE FECHA/HORA PASADA Y FIREBASE ---
async function generarHorariosDisponibles() {
    const fechaInput = document.getElementById('fechaCita').value;
    const container = document.getElementById('slotsContainer');
    
    if (!fechaInput) return;

    container.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Consultando disponibilidad...</p>';

    window.bookingData.fecha = fechaInput;
    window.bookingData.hora = ''; 

    try {
        // 1. Consultar en Firestore las citas ocupadas para esa fecha y especialista
        const q = query(
            collection(db, "citas"),
            where("fecha", "==", fechaInput),
            where("especialista", "==", window.bookingData.especialista),
            where("estado", "==", "confirmada")
        );

        const querySnapshot = await getDocs(q);
        const horasOcupadas = [];
        querySnapshot.forEach((doc) => {
            horasOcupadas.push(doc.data().hora);
        });

        container.innerHTML = '';

        // 2. Obtener la hora actual para validar si la fecha seleccionada es HOY
        const ahora = new Date();
        const year = ahora.getFullYear();
        const month = String(ahora.getMonth() + 1).padStart(2, '0');
        const day = String(ahora.getDate()).padStart(2, '0');
        const fechaHoyStr = `${year}-${month}-${day}`;

        const esHoy = (fechaInput === fechaHoyStr);
        const horaActualMinutos = (ahora.getHours() * 60) + ahora.getMinutes();

        const startHour = 9;
        const endHour = 17;

        // 3. Renderizar slots
        for (let h = startHour; h < endHour; h++) {
            for (let m = 0; m < 60; m += 20) {
                const hourStr = h.toString().padStart(2, '0');
                const minStr = m.toString().padStart(2, '0');
                const timeSlot = `${hourStr}:${minStr}`;

                // Convertir la hora del slot a minutos desde medianoche
                const slotEnMinutos = (h * 60) + m;

                const slotEl = document.createElement('button');
                slotEl.type = 'button';
                
                // Evaluamos si está ocupado por BD o si ya transcurrió en el día de hoy
                const estaOcupadoBD = horasOcupadas.includes(timeSlot);
                const esHoraPasada = esHoy && (slotEnMinutos <= horaActualMinutos);

                if (estaOcupadoBD || esHoraPasada) {
                    slotEl.className = 'time-slot slot-ocupado';
                    
                    // Texto descriptivo según el motivo
                    if (esHoraPasada) {
                        slotEl.innerText = `${timeSlot} (Pasado)`;
                    } else {
                        slotEl.innerText = `${timeSlot} (Reservado)`;
                    }

                    slotEl.disabled = true;
                } else {
                    slotEl.className = 'time-slot';
                    slotEl.innerText = timeSlot;
                    slotEl.onclick = () => {
                        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                        slotEl.classList.add('selected');
                        window.bookingData.hora = timeSlot;
                    };
                }

                container.appendChild(slotEl);
            }
        }

        if (container.children.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No hay horarios disponibles para la fecha seleccionada.</p>';
        }

    } catch (error) {
        console.error("Error al consultar disponibilidad:", error);
        container.innerHTML = '<p style="grid-column: 1/-1; color:red; text-align:center;">Error al cargar disponibilidad.</p>';
    }
}

// --- PASO 5: RESUMEN Y GUARDADO ---
function renderizarResumen() {
    document.getElementById('sumNombre').innerText = window.bookingData.nombre;
    document.getElementById('sumCedula').innerText = window.bookingData.cedula;
    document.getElementById('sumContacto').innerText = `${window.bookingData.celular} | ${window.bookingData.correo}`;
    document.getElementById('sumModalidad').innerText = window.bookingData.modalidad;
    document.getElementById('sumEspecialista').innerText = window.bookingData.especialista;
    document.getElementById('sumEspecialidad').innerText = window.bookingData.especialidad;
    document.getElementById('sumFechaHora').innerText = `${window.bookingData.fecha} a las ${window.bookingData.hora}`;
}

async function confirmarReservaFinal() {
    try {
        // 1. Guardar cita en Firebase Firestore
        await addDoc(collection(db, "citas"), {
            pacienteNombre: window.bookingData.nombre,
            pacienteCedula: window.bookingData.cedula,
            pacienteCelular: window.bookingData.celular,
            pacienteCorreo: window.bookingData.correo,
            modalidad: window.bookingData.modalidad,
            especialista: window.bookingData.especialista,
            especialidad: window.bookingData.especialidad,
            fecha: window.bookingData.fecha,
            hora: window.bookingData.hora,
            estado: 'confirmada',
            creadoEn: serverTimestamp()
        });

        // 2. Construir notificación de WhatsApp
        const mensajeWA = `*NUEVA CITA MÉDICA RESERVADA*%0A%0A` +
            `*Paciente:* ${window.bookingData.nombre}%0A` +
            `*Cédula:* ${window.bookingData.cedula}%0A` +
            `*Modalidad:* ${window.bookingData.modalidad}%0A` +
            `*Especialista:* ${window.bookingData.especialista}%0A` +
            `*Especialidad:* ${window.bookingData.especialidad}%0A` +
            `*Fecha:* ${window.bookingData.fecha}%0A` +
            `*Hora:* ${window.bookingData.hora}%0A%0A` +
            `_Cita registrada correctamente en el sistema._`;

        const urlWA = `https://wa.me/593${window.bookingData.celular.replace(/^0/, '')}?text=${mensajeWA}`;

        alert('¡Cita agendada con éxito!');
        
        // Redirigir a WhatsApp o recargar
        window.open(urlWA, '_blank');
        window.location.reload();

    } catch (error) {
        console.error("Error al guardar la cita:", error);
        alert('Hubo un error al guardar la cita. Por favor intenta de nuevo.');
    }
}

// VALIDACION DE FORMULARIO

// --- FUNCIONES DE VALIDACIÓN ESPECÍFICAS ---

function esNombreValido(nombre) {
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/;
    const palabras = nombre.trim().split(/\s+/);
    return regexNombre.test(nombre.trim()) && palabras.length >= 2;
}

function esCedulaValida(cedula) {
    if (!/^\d{10}$/.test(cedula)) return false;

    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;

    const tercerDigito = parseInt(cedula.substring(2, 3), 10);
    if (tercerDigito >= 6) return false;

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const digitoVerificador = parseInt(cedula.substring(9, 10), 10);
    let suma = 0;

    for (let i = 0; i < 9; i++) {
        let valor = parseInt(cedula.substring(i, i + 1), 10) * coeficientes[i];
        if (valor >= 10) valor -= 9;
        suma += valor;
    }

    const totalEspecial = (Math.ceil(suma / 10) * 10);
    let resultado = totalEspecial - suma;
    if (resultado === 10) resultado = 0;

    return resultado === digitoVerificador;
}

function esCelularValido(celular) {
    return /^09\d{8}$/.test(celular);
}

function esCorreoValido(correo) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(correo.trim());
}

// --- FUNCIÓN HELPER PARA APLICAR/QUITAR CLASES DE ERROR EN INPUTS ---
function marcarEstadoInput(elementId, esValido) {
    const el = document.getElementById(elementId);
    if (!el) return;

    // Solo marcamos en rojo/verde si el usuario ya escribió algo en el campo
    if (el.value.trim() === '') {
        el.classList.remove('input-error', 'input-success');
        return;
    }

    if (esValido) {
        el.classList.remove('input-error');
        el.classList.add('input-success');
    } else {
        el.classList.remove('input-success');
        el.classList.add('input-error');
    }
}

// --- EVALUACIÓN GLOBAL DEL PASO 1 ---
function validarFormularioPaso1() {
    const nombre = document.getElementById('nombre').value;
    const cedula = document.getElementById('cedula').value;
    const celular = document.getElementById('celular').value;
    const correo = document.getElementById('correo').value;
    const btnNext = document.getElementById('btnNext');
    const msgBox = document.getElementById('mensajeValidacionStep1');

    // Evaluar cada condición
    const vNombre = esNombreValido(nombre);
    const vCedula = esCedulaValida(cedula);
    const vCelular = esCelularValido(celular);
    const vCorreo = esCorreoValido(correo);

    // Pintar o limpiar los inputs dinámicamente
    marcarEstadoInput('nombre', vNombre);
    marcarEstadoInput('cedula', vCedula);
    marcarEstadoInput('celular', vCelular);
    marcarEstadoInput('correo', vCorreo);

    // Si todo está correcto
    if (vNombre && vCedula && vCelular && vCorreo) {
        if (btnNext) btnNext.disabled = false;
        if (msgBox) msgBox.style.display = 'none';
        
        window.bookingData.nombre = nombre.trim();
        window.bookingData.cedula = cedula.trim();
        window.bookingData.celular = celular.trim();
        window.bookingData.correo = correo.trim();
        return true;
    }

    // Si falta algo o algún dato está mal, inhabilitar el botón
    if (btnNext) btnNext.disabled = true;

    // Mostrar feedback en texto si hay errores
    if (msgBox && window.currentStep === 1) {
        if (nombre && !vNombre) {
            msgBox.innerText = 'Por favor ingresa tus nombres y apellidos completos.';
            msgBox.style.display = 'block';
        } else if (cedula && !vCedula) {
            msgBox.innerText = 'La cédula ingresada no es válida para Ecuador.';
            msgBox.style.display = 'block';
        } else if (celular && !vCelular) {
            msgBox.innerText = 'El celular debe tener 10 dígitos y empezar con 09.';
            msgBox.style.display = 'block';
        } else if (correo && !vCorreo) {
            msgBox.innerText = 'El correo electrónico no es válido.';
            msgBox.style.display = 'block';
        } else {
            msgBox.style.display = 'none';
        }
    }

    return false;
}

// --- EVENTOS EN DOMCONTENTLOADED ---
document.addEventListener('DOMContentLoaded', () => {
    // Restringir a solo números los campos de Cédula y Celular
    const inputCedula = document.getElementById('cedula');
    const inputCelular = document.getElementById('celular');

    [inputCedula, inputCelular].forEach(input => {
        if (input) {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }
    });

    // Escuchar el evento 'input' en los 4 campos para validar al escribir
    const camposStep1 = ['nombre', 'cedula', 'celular', 'correo'];
    camposStep1.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', validarFormularioPaso1);
        }
    });
});