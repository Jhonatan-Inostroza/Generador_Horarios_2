// dbScheduleViewer.js
import { printSchedules } from './dbSchedulePrinter.js';

// ======================================================
// ESTADO (AISLADO POR LLAMADA)
// ======================================================
let schedules = [];
let index = 0;
let selectedIndexes = new Set();

// ======================================================
// DOM (SE RESUELVE DINÁMICAMENTE)
// ======================================================
function getModalElements() {
    return {
        modal: document.getElementById('schedule-modal'),
        closeBtn: document.getElementById('close-modal'),
        prevBtn: document.getElementById('prev-schedule'),
        nextBtn: document.getElementById('next-schedule'),
        title: document.getElementById('schedule-title'),
        grid: document.getElementById('schedule-grid'),
        legend: document.getElementById('legend-box'),
        printBtn: document.getElementById('btn-print-schedules')  // ✅ aquí
    };
}


// ======================================================
// COLORES (DETERMINISTAS)
// ======================================================
const colors = [
    '#60a5fa',
    '#34d399',
    '#fbbf24',
    '#f87171',
    '#a78bfa',
    '#22d3ee',
    '#fb7185',
    '#4ade80'
];

let colorMap = {};

function getColor(key) {
    if (!colorMap[key]) {
        colorMap[key] =
            colors[Object.keys(colorMap).length % colors.length];
    }
    return colorMap[key];
}

// ======================================================
// API PÚBLICA
// ======================================================
export function showSchedules(validSchedules) {

    if (!Array.isArray(validSchedules) || validSchedules.length === 0) {
        alert('No hay horarios válidos');
        return;
    }

    // 🔒 RESET TOTAL DE ESTADO
    schedules = validSchedules;
    index = 0;
    selectedIndexes = new Set();
    colorMap = {};

    const {
        modal,
        closeBtn,
        prevBtn,
        nextBtn,
        printBtn
    } = getModalElements();

    if (!modal) {
        console.error('Modal no encontrado en el DOM');
        return;
    }

    // 🔥 EVENTOS (SE ASIGNAN UNA SOLA VEZ)
    closeBtn.onclick = () => {
        modal.classList.add('hidden');
    };

    prevBtn.onclick = () => {
        if (index > 0) {
            index--;
            render();
        }
    };

    nextBtn.onclick = () => {
        if (index < schedules.length - 1) {
            index++;
            render();
        }
    };

    if (printBtn) {
        printBtn.onclick = () => {
            const selected =
                selectedIndexes.size
                    ? [...selectedIndexes].map(i => schedules[i])
                    : [schedules[index]];

            printSchedules(selected);
        };
    }

    // 🔓 MOSTRAR MODAL (SIN EFECTOS COLATERALES)
    modal.classList.remove('hidden');
    render();
}

// ======================================================
// RENDER PRINCIPAL
// ======================================================
function render() {

    const {
        title,
        grid,
        legend
    } = getModalElements();

    const schedule = schedules[index];

    // ------------------------------
    // TÍTULO
    // ------------------------------
    title.textContent = `Horario ${index + 1} de ${schedules.length}`;

    // ------------------------------
    // RESET VISUAL
    // ------------------------------
    legend.innerHTML = '<strong>Leyenda</strong>';
    grid.innerHTML = '';

    // ------------------------------
    // DÍAS Y HORAS
    // ------------------------------
    const days = [
        'LUNES',
        'MARTES',
        'MIERCOLES',
        'JUEVES',
        'VIERNES',
        'SABADO'
    ];

    const hours = [];
    for (let h = 7; h < 24; h++) {
        hours.push(`${String(h).padStart(2, '0')}:00`);
    }

    // ------------------------------
    // GRID BASE (SCROLLABLE)
    // ------------------------------
    grid.innerHTML = `
        <div class="schedule-table">
            <div class="header">Hora</div>
            ${days.map(d => `<div class="header">${d}</div>`).join('')}

            ${hours.map(h => `
                <div class="hour">
                    ${h} - ${String(parseInt(h) + 1).padStart(2, '0')}:00
                </div>
                ${days.map(d => `
                    <div class="cell"
                        data-day="${d}"
                        data-hour="${h}">
                    </div>
                `).join('')}
            `).join('')}
        </div>
    `;

    // ------------------------------
    // CHECKBOX SELECCIÓN
    // ------------------------------
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.style.marginLeft = '10px';
    chk.checked = selectedIndexes.has(index);

    chk.onchange = () => {
        chk.checked
            ? selectedIndexes.add(index)
            : selectedIndexes.delete(index);
    };

    title.appendChild(chk);
    title.appendChild(document.createTextNode(' Seleccionar'));

    // ------------------------------
    // PINTAR BLOQUES
    // ------------------------------
    schedule.forEach(item => {

        const key = `${item.asignatura}-${item.grupo}`;
        const color = getColor(key);

        // Persistencia para impresión
        item.color = color;

        const cell = grid.querySelector(
            `.cell[data-day="${item.day}"][data-hour="${item.start}"]`
        );

        if (cell) {
            cell.innerHTML = `
                <div class="course-box" style="background:${color}">
                    <strong>${item.asignatura}</strong> - (
                    Grupo ${item.grupo})
                    
                    <small>${item.docente}</small>
                </div>
            `;
        }

        if (!legend.querySelector(`[data-key="${key}"]`)) {
            legend.innerHTML += `
                <div class="legend-item" data-key="${key}">
                    <div class="legend-color" style="background:${color}"></div>
                    <div>
                        <strong>${item.asignatura}</strong><br>
                        Grupo ${item.grupo}<br>
                        <small>${item.docente}</small>
                    </div>
                </div>
            `;
        }
    });
}
