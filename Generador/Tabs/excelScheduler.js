import { generateSchedules, hasTimeConflict } from './scheduleGenerator.js';
import { printSchedules } from '/generador/UsandoBBDD/dbSchedulePrinter.js';

// ======================================================
// DOM
// ======================================================
const fileInput = document.getElementById('excel-file-input');
const btnUpload = document.getElementById('btn-upload-excel');
const asignaturasList = document.getElementById('asignaturas-list-excel');
const stepAsignaturas = document.getElementById('step-select-asignaturas-excel');
const btnGenerate = document.getElementById('btn-generate-excel');

const modal = document.getElementById('schedule-modal');
const closeModal = document.getElementById('close-modal');
const prevBtn = document.getElementById('prev-schedule');
const nextBtn = document.getElementById('next-schedule');
const printBtn = document.getElementById('btn-print-excel');

const scheduleTitle = document.getElementById('schedule-title');
const scheduleGrid = document.getElementById('schedule-grid');
const legendBox = document.getElementById('legend-box');

// ======================================================
// DATA
// ======================================================
const database = { asignaturas: [], grupos: [] };
let selected = {};
let schedules = [];
let index = 0;

// Horarios seleccionados para imprimir (OPCIÓN A)
const selectedSchedules = new Set();

// ======================================================
// COLORES
// ======================================================
const colors = [
    '#60a5fa', '#34d399', '#fbbf24', '#f87171',
    '#a78bfa', '#22d3ee', '#fb7185', '#4ade80'
];

const asignaturaColors = {};
const getColor = id =>
    asignaturaColors[id] ??=
        colors[Object.keys(asignaturaColors).length % colors.length];

// ======================================================
// EVENTOS
// ======================================================
btnUpload.onclick = () => {
    if (!fileInput.files.length) {
        alert('Seleccione un archivo Excel');
        return;
    }
    processExcel(fileInput.files[0]);
};

btnGenerate.onclick = () => {
    selectedSchedules.clear();

    const r = generateSchedules(selected, database, hasTimeConflict);
    if (!r.validSchedules.length) {
        alert('No hay horarios válidos');
        return;
    }

    schedules = r.validSchedules.map(s => ({
        id: crypto.randomUUID(),
        data: s
    }));

    index = 0;
    render();
    modal.style.display = 'flex';
};

closeModal.onclick = () => modal.style.display = 'none';
prevBtn.onclick = () => index > 0 && (--index, render());
nextBtn.onclick = () => index < schedules.length - 1 && (++index, render());

// ======================================================
// IMPRESIÓN — OPCIÓN A (SIN FALLBACK)
// ======================================================
printBtn.onclick = () => {

    if (!selectedSchedules.size) {
        alert('Debe seleccionar al menos un horario para imprimir');
        return;
    }

    const toPrint = schedules
        .filter(s => selectedSchedules.has(s.id))
        .map(s => buildPrintableSchedule(s.data));

    printSchedules(toPrint);
};

// ======================================================
// CONVERSIÓN A FORMATO IMPRIMIBLE
// ======================================================
function buildPrintableSchedule(schedule) {
    const printable = [];

    schedule.forEach(g => {
        const asignatura = database.asignaturas.find(
            a => a.id === g.asignatura_id
        );

        const color = getColor(g.asignatura_id);

        g.horarios.forEach(h => {
            printable.push({
                day: h.dia.toUpperCase(),
                start: h.hora_inicio,
                end: h.hora_fin,
                asignatura: asignatura.nombre,
                grupo: g.nombre,
                docente: g.docente,
                color
            });
        });
    });

    return printable;
}

// ======================================================
// EXCEL
// ======================================================
function processExcel(file) {

    function parseExcelTime(value) {
        if (typeof value === 'string') {
            const m = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
            if (m) {
                let h = parseInt(m[1]);
                const min = m[2];
                const ap = m[3]?.toUpperCase();
                if (ap === 'PM' && h < 12) h += 12;
                if (ap === 'AM' && h === 12) h = 0;
                return `${h.toString().padStart(2,'0')}:${min}`;
            }
            return value;
        }

        if (typeof value === 'number') {
            const total = Math.round(value * 24 * 60);
            const h = Math.floor(total / 60);
            const m = total % 60;
            return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
        }

        return '00:00';
    }

    const reader = new FileReader();
    reader.onload = e => {
        const rows = XLSX.utils.sheet_to_json(
            XLSX.read(new Uint8Array(e.target.result), { type: 'array' })
                .Sheets.Sheet1
        );

        database.asignaturas = [];
        database.grupos = [];
        selected = {};
        asignaturasList.innerHTML = '';

        rows.forEach(r => {
            let a = database.asignaturas.find(x => x.nombre === r.ASIGNATURA);
            if (!a) {
                a = { id: database.asignaturas.length + 1, nombre: r.ASIGNATURA };
                database.asignaturas.push(a);
            }

            let g = database.grupos.find(
                x => x.nombre === r['GRUPO HORARIO'] && x.asignatura_id === a.id
            );

            if (!g) {
                g = {
                    id: database.grupos.length + 1,
                    nombre: r['GRUPO HORARIO'],
                    docente: r.DOCENTE,
                    asignatura_id: a.id,
                    horarios: []
                };
                database.grupos.push(g);
            }

            g.horarios.push({
                dia: r.DÍA,
                hora_inicio: parseExcelTime(r['HORA INICIO']),
                hora_fin: parseExcelTime(r['HORA FIN'])
            });
        });

        renderAsignaturas();
        stepAsignaturas.classList.remove('hidden');
    };

    reader.readAsArrayBuffer(file);
}

// ======================================================
// RENDER ASIGNATURAS
// ======================================================
function renderAsignaturas() {
    asignaturasList.innerHTML = '';

    database.asignaturas.forEach(a => {
        const li = document.createElement('li');
        li.className = 'mb-6';

        const cbA = document.createElement('input');
        cbA.type = 'checkbox';
        cbA.onchange = () => {
            selected[a.id] = selected[a.id] || { grupos: [], activo: false };
            selected[a.id].activo = cbA.checked;
            btnGenerate.classList.toggle(
                'hidden',
                !Object.values(selected).some(v => v.activo)
            );
        };

        li.append(cbA, ' ' + a.nombre, document.createElement('br'), document.createElement('br'));

        database.grupos
            .filter(g => g.asignatura_id === a.id)
            .forEach(g => {
                const card = document.createElement('div');
                card.className = 'bg-white border rounded p-4 mb-3';

                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.onchange = () => {
                    selected[a.id] = selected[a.id] || { grupos: [], activo: false };
                    cb.checked
                        ? selected[a.id].grupos.push(g.id)
                        : selected[a.id].grupos =
                            selected[a.id].grupos.filter(x => x !== g.id);
                };

                card.append(cb, ` Grupo ${g.nombre} - ${g.docente}`);
                li.appendChild(card);
            });

        asignaturasList.appendChild(li);
    });
}

// ======================================================
// RENDER POPUP
// ======================================================
function normalizeDay(day) {
    return day
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}
function timeToMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}

function render() {
    const scheduleObj = schedules[index];
    const schedule = scheduleObj.data;

    scheduleTitle.innerHTML = `
        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="chk-schedule">
            Horario ${index + 1} de ${schedules.length}
        </label>
    `;

    const chk = document.getElementById('chk-schedule');
    const scheduleId = scheduleObj.id;

    chk.checked = selectedSchedules.has(scheduleId);
    chk.onchange = () =>
        chk.checked
            ? selectedSchedules.add(scheduleId)
            : selectedSchedules.delete(scheduleId);

    const days = ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];

    const hours = [];
    for (let h = 7; h < 24; h++) {
        hours.push({
            start: `${h.toString().padStart(2,'0')}:00`,
            end: `${(h+1).toString().padStart(2,'0')}:00`
        });
    }

    scheduleGrid.innerHTML = `
        <div class="schedule-table">
            <div class="header">Hora</div>
            ${days.map(d => `<div class="header">${d}</div>`).join('')}
            ${hours.map(h =>
                `<div class="hour">${h.start} - ${h.end}</div>` +
                days.map(d =>
                    `<div class="cell" data-day="${d}" data-hour="${h.start}"></div>`
                ).join('')
            ).join('')}
        </div>
    `;

    legendBox.innerHTML = '<strong>Leyenda</strong>';

    schedule.forEach(g => {
        const color = getColor(g.asignatura_id);
        const asignatura = database.asignaturas.find(a => a.id === g.asignatura_id);

        g.horarios.forEach(h => {

            const startMin = timeToMinutes(h.hora_inicio);
            const endMin   = timeToMinutes(h.hora_fin);

            for (let m = startMin; m < endMin; m += 60) {

                const hour = String(Math.floor(m / 60)).padStart(2, '0') + ':00';

                const cell = document.querySelector(
                    `.cell[data-day="${normalizeDay(h.dia)}"][data-hour="${hour}"]`
                );

                if (!cell) continue;

                cell.innerHTML = `
                    <div class="course-box" style="background:${color}">
                        <strong>${asignatura.nombre}</strong><br>
                        Grupo ${g.nombre}<br>
                        ${h.hora_inicio} - ${h.hora_fin}
                    </div>
                `;
            }
        });


        legendBox.innerHTML += `
            <div class="legend-item">
                <div class="legend-color" style="background:${color}"></div>
                <div>
                    <strong>${asignatura.nombre}</strong><br>
                    Grupo ${g.nombre} | ${g.docente}
                </div>
            </div>
        `;
    });
}
