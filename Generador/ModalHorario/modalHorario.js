// ModalHorario/modalHorario.js

let schedules = [];
let currentIndex = 0;

const modal = document.getElementById('schedule-modal');
const grid = document.getElementById('schedule-grid');
const title = document.getElementById('schedule-title');
const legendBox = document.getElementById('legend-box');

const btnClose = document.getElementById('close-modal');
const btnPrev = document.getElementById('prev-schedule');
const btnNext = document.getElementById('next-schedule');

btnClose.onclick = () => closeModal();
btnPrev.onclick = () => changeSchedule(-1);
btnNext.onclick = () => changeSchedule(1);

// =========================
// API PÚBLICA
// =========================
export function openModal(data) {
    if (!Array.isArray(data) || data.length === 0) return;

    schedules = data;
    currentIndex = 0;

    modal.style.display = 'flex';
    render();
}

export function closeModal() {
    modal.style.display = 'none';
    grid.innerHTML = '';
    legendBox.innerHTML = '';
}

// =========================
// INTERNOS
// =========================
function changeSchedule(dir) {
    currentIndex += dir;

    if (currentIndex < 0) currentIndex = schedules.length - 1;
    if (currentIndex >= schedules.length) currentIndex = 0;

    render();
}

function render() {
    const schedule = schedules[currentIndex];

    title.textContent = `Horario ${currentIndex + 1} de ${schedules.length}`;

    grid.innerHTML = '';
    legendBox.innerHTML = '';

    paintSchedule(schedule);
}

function paintSchedule(schedule) {
    schedule.forEach(item => {
        const cell = document.createElement('div');
        cell.className = 'course-box';
        cell.style.background = item.color || '#93c5fd';
        cell.innerHTML = `
            <strong>${item.asignatura}</strong>
            ${item.docente}<br>
            ${item.horaInicio} - ${item.horaFin}
        `;
        grid.appendChild(cell);
    });
}
