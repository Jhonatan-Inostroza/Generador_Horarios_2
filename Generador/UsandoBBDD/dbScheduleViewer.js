// dbScheduleViewer.js
import { printSchedules } from './dbSchedulePrinter.js';

let schedules = [];
let index = 0;
const selectedIndexes = new Set();

// ======================================================
// DOM
// ======================================================
const modal = document.getElementById('schedule-modal');
const closeBtn = document.getElementById('close-modal');
const prevBtn = document.getElementById('prev-schedule');
const nextBtn = document.getElementById('next-schedule');
const title = document.getElementById('schedule-title');
const grid = document.getElementById('schedule-grid');
const legend = document.getElementById('legend-box');
const printBtn = document.getElementById('btn-print-schedules'); // puede ser null

// ======================================================
// COLORES
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
    if (!validSchedules || !validSchedules.length) {
        alert('No hay horarios válidos');
        return;
    }

    schedules = validSchedules;
    index = 0;
    selectedIndexes.clear();
    modal.style.display = 'flex';
    render();
}

// ======================================================
// EVENTOS
// ======================================================
closeBtn.onclick = () => modal.style.display = 'none';

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

// ✔ SOLO si el botón existe
if (printBtn) {
    printBtn.onclick = () => {

        const selectedSchedules =
            selectedIndexes.size
                ? [...selectedIndexes].map(i => schedules[i])
                : [ schedules[index] ]; // fallback

        printSchedules(selectedSchedules);
    };
}


// ======================================================
// RENDER PRINCIPAL
// ======================================================
function render() {
    const schedule = schedules[index];
    title.textContent = `Horario ${index + 1} de ${schedules.length}`;

    // Reset
    colorMap = {};
    legend.innerHTML = '<strong>Leyenda</strong>';

    // ===== DÍAS =====
    const days = [
        'LUNES',
        'MARTES',
        'MIERCOLES',
        'JUEVES',
        'VIERNES',
        'SABADO'
    ];

    // ===== HORAS: 07:00 → 24:00 =====
    const hours = [];
    for (let h = 7; h < 24; h++) {
        hours.push(`${String(h).padStart(2, '0')}:00`);
    }

    // ==================================================
    // GRID BASE
    // ==================================================
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

    // ==================================================
    // CHECKBOX SELECCIÓN
    // ==================================================
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

    // ==================================================
    // PINTAR BLOQUES
    // ==================================================
    schedule.forEach(item => {
        const color = getColor(item.asignatura);
        item.color = color; // 👈 CLAVE PARA IMPRESIÓN
        
        const cell = document.querySelector(
            `.cell[data-day="${item.day}"][data-hour="${item.start}"]`
        );

        if (cell) {
            cell.innerHTML = `
                <div class="course-box" style="background:${color}">
                    <strong>${item.asignatura}</strong><br>
                    Grupo ${item.grupo}<br>
                    ${item.start} - ${item.end}<br>
                    ${item.docente}
                </div>
            `;
        }

        if (!legend.querySelector(`[data-key="${item.asignatura}-${item.grupo}"]`)) {
            legend.innerHTML += `
                <div class="legend-item" data-key="${item.asignatura}-${item.grupo}">
                    <div class="legend-color" style="background:${color}"></div>
                    <div>
                        <strong>${item.asignatura}</strong><br>
                        Grupo ${item.grupo}<br>
                        ${item.docente}
                    </div>
                </div>
            `;
        }
    });
}
