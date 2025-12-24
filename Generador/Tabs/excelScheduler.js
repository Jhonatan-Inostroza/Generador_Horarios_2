// excelScheduler.js
import {
    generateSchedules,
    hasTimeConflict
} from '/generador/core/scheduleCore.js';

import { showSchedules } from '/generador/UsandoBBDD/dbScheduleViewer.js';


// ==========================
// ESTADO
// ==========================
const database = {
    asignaturas: [],
    grupos: []
};

let selected = {};

// ==========================
// INIT (CLAVE)
// ==========================
export function initExcelScheduler() {

    const fileInput = document.getElementById('excel-file-input');
    const btnUpload = document.getElementById('btn-upload-excel');
    const asignaturasList = document.getElementById('asignaturas-list-excel');
    const stepAsignaturas = document.getElementById('step-select-asignaturas-excel');
    const btnGenerate = document.getElementById('btn-generate-excel');

    if (!fileInput || !btnUpload || !btnGenerate) {
        console.warn('Excel DOM aún no está listo');
        return;
    }

    btnUpload.onclick = () => {
        if (!fileInput.files.length) {
            alert('Seleccione un archivo Excel');
            return;
        }

        resetState();
        processExcel(fileInput.files[0]);
    };

    btnGenerate.onclick = () => {
        const groupsPerSubject = buildGroupsPerSubject();

        if (!groupsPerSubject.length) {
            alert('Debe seleccionar al menos una asignatura');
            return;
        }

        const { validSchedules } =
            generateSchedules(groupsPerSubject, hasTimeConflict);

        if (!validSchedules.length) {
            alert('No hay horarios posibles');
            return;
        }

        const adapted = validSchedules.map(adaptScheduleForViewer);
        showSchedules(adapted);


    };

    // ==========================
    function resetState() {
        database.asignaturas = [];
        database.grupos = [];
        selected = {};
        asignaturasList.innerHTML = '';
        stepAsignaturas.classList.add('hidden');
        btnGenerate.classList.add('hidden');
    }

    function processExcel(file) {

        function parseTime(v) {
            if (typeof v === 'string') return v;
            if (typeof v === 'number') {
                const t = Math.round(v * 24 * 60);
                const h = Math.floor(t / 60);
                const m = t % 60;
                return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            }
            return '00:00';
        }

        const reader = new FileReader();
        reader.onload = e => {

            const wb = XLSX.read(
                new Uint8Array(e.target.result),
                { type: 'array' }
            );

            const sheet = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);

            rows.forEach(r => {

                let asignatura = database.asignaturas.find(
                    a => a.nombre === r.ASIGNATURA
                );

                if (!asignatura) {
                    asignatura = {
                        id: database.asignaturas.length + 1,
                        nombre: r.ASIGNATURA
                    };
                    database.asignaturas.push(asignatura);
                    selected[asignatura.id] = { activo: false, grupos: [] };
                }

                let grupo = database.grupos.find(
                    g => g.nombre === r['GRUPO HORARIO'] &&
                         g.asignatura_id === asignatura.id
                );

                if (!grupo) {
                    grupo = {
                        id: database.grupos.length + 1,
                        nombre: r['GRUPO HORARIO'],
                        docente: r.DOCENTE,
                        asignatura_id: asignatura.id,
                        horarios: []
                    };
                    database.grupos.push(grupo);
                }

                grupo.horarios.push({
                    dia: normalizeDay(r.DÍA),
                    hora_inicio: parseTime(r['HORA INICIO']),
                    hora_fin: parseTime(r['HORA FIN'])
                });
            });

            renderAsignaturas();
            stepAsignaturas.classList.remove('hidden');
        };

        reader.readAsArrayBuffer(file);
    }

    function renderAsignaturas() {
        asignaturasList.innerHTML = '';

        database.asignaturas.forEach(a => {

            const li = document.createElement('li');
            li.className = 'mb-6';

            const aCb = document.createElement('input');
            aCb.type = 'checkbox';
            aCb.className = 'mr-2';

            aCb.onchange = () => {
                selected[a.id].activo = aCb.checked;
                updateGenerateButton();
            };

            li.append(aCb, a.nombre);

            database.grupos
                .filter(g => g.asignatura_id === a.id)
                .forEach(g => {

                    const gCb = document.createElement('input');
                    gCb.type = 'checkbox';
                    gCb.className = 'ml-6 mr-2';

                    gCb.onchange = () => {
                        if (gCb.checked) selected[a.id].grupos.push(g.id);
                        else selected[a.id].grupos =
                            selected[a.id].grupos.filter(id => id !== g.id);
                    };

                    li.append(
                        document.createElement('br'),
                        gCb,
                        `Grupo ${g.nombre} - ${g.docente}`
                    );
                });

            asignaturasList.appendChild(li);
        });
    }

    function updateGenerateButton() {
        btnGenerate.classList.toggle(
            'hidden',
            !Object.values(selected).some(v => v.activo)
        );
    }

    function buildGroupsPerSubject() {
        return Object.entries(selected)
            .filter(([_, v]) => v.activo)
            .map(([id, v]) =>
                v.grupos.length
                    ? database.grupos.filter(g => v.grupos.includes(g.id))
                    : database.grupos.filter(g => g.asignatura_id === +id)
            );
    }

    function adaptScheduleForViewer(schedule) {
        const blocks = [];

        schedule.forEach(grupo => {
            const asignatura = database.asignaturas.find(
                a => a.id === grupo.asignatura_id
            );

            grupo.horarios.forEach(h => {
                let [startH, startM] = h.hora_inicio.split(':').map(Number);
                let [endH, endM] = h.hora_fin.split(':').map(Number);

                let startTotal = startH + (startM > 0 ? 1 : 0); // si empieza en media hora, cuenta desde la siguiente hora
                const endTotal = endH + (endM > 0 ? 1 : 0);

                for (let hour = startH; hour < endH; hour++) {
                    const startStr = `${String(hour).padStart(2, '0')}:00`;
                    const endStr = `${String(hour + 1).padStart(2, '0')}:00`;

                    blocks.push({
                        asignatura: asignatura.nombre,
                        grupo: grupo.nombre,
                        docente: grupo.docente,
                        day: h.dia,
                        start: startStr,
                        end: endStr
                    });
                }
            });
        });

        return blocks;
    }




    function normalizeDay(d) {
        return d.toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }
}
