// dbScheduler.js
import { api } from './apiAcademico.js';
import { generateSchedules, hasTimeConflict } from '/generador/core/scheduleCore.js';
import { showSchedules } from './dbScheduleViewer.js';

// ======================================================
// DOM
// ======================================================
const selectAnio = document.getElementById('select-anio');
const selectCicloAcademico = document.getElementById('select-anio-ciclo');
const carrerasContainer = document.getElementById('carreras-container');
const ciclosContainer = document.getElementById('ciclos-container');
const btnGenerate = document.getElementById('btn-generate-db');

// ======================================================
// MODELO
// ======================================================
const database = {
    asignaturas: [],   // { id, nombre }
    grupos: []         // { id, nombre, docente, asignatura_id, horarios[] }
};

let selected = {};

// ======================================================
// UTILIDADES
// ======================================================
function normalizeDay(dia) {
    return dia
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

// ======================================================
// 1. AÑOS ACADÉMICOS
// ======================================================
(async () => {
    const anios = await api.getAnios();
    selectAnio.innerHTML =
        `<option value="">Seleccione año</option>` +
        anios.map(a => `<option value="${a.anio}">${a.anio}</option>`).join('');
})();

// ======================================================
// 2. CICLOS ACADÉMICOS
// ======================================================
selectAnio.onchange = async () => {
    selectCicloAcademico.innerHTML = '';
    selectCicloAcademico.disabled = true;
    carrerasContainer.innerHTML = '';
    ciclosContainer.innerHTML = '';
    btnGenerate.classList.add('hidden');

    database.asignaturas = [];
    database.grupos = [];
    selected = {};

    if (!selectAnio.value) return;

    const ciclos = await api.getCiclosAcademicos(selectAnio.value);

    selectCicloAcademico.innerHTML =
        `<option value="">Seleccione ciclo</option>` +
        ciclos.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');

    selectCicloAcademico.disabled = false;
};

// ======================================================
// 3. CARRERAS
// ======================================================
selectCicloAcademico.onchange = async () => {
    carrerasContainer.innerHTML = '';
    ciclosContainer.innerHTML = '';
    btnGenerate.classList.add('hidden');

    database.asignaturas = [];
    database.grupos = [];
    selected = {};

    if (!selectCicloAcademico.value) return;

    const carreras = await api.getCarreras(selectCicloAcademico.value);

    carreras.forEach(c => {
        const card = document.createElement('div');
        card.className = 'card';
        card.textContent = c.nombre;
        card.onclick = () => cargarCiclosCurriculares(c.id);
        carrerasContainer.appendChild(card);
    });
};

// ======================================================
// 4. CICLOS → ASIGNATURAS → GRUPOS
// ======================================================
async function cargarCiclosCurriculares(detalleCicloCarreraId) {
    ciclosContainer.innerHTML = '';

    const ciclos = await api.getCiclosCurriculares(detalleCicloCarreraId);

    ciclos.forEach(ciclo => {
        const acc = document.createElement('div');
        acc.className = 'accordion';

        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.textContent = `Ciclo ${ciclo.nombre}`;

        const body = document.createElement('div');
        body.className = 'hidden ml-4 space-y-2';

        header.onclick = async () => {
            body.classList.toggle('hidden');
            if (body.dataset.loaded) return;

            const asignaturas = await api.getAsignaturas(ciclo.id);

            asignaturas.forEach(a => {
                const asigId = a.id;

                if (!database.asignaturas.some(x => x.id === asigId)) {
                    database.asignaturas.push({ id: asigId, nombre: a.nombre });
                }

                const label = document.createElement('label');
                label.className = 'flex items-center gap-2 font-semibold';

                const cbAsig = document.createElement('input');
                cbAsig.type = 'checkbox';

                label.append(cbAsig, a.nombre);
                body.appendChild(label);

                const gruposDiv = document.createElement('div');
                gruposDiv.className = 'ml-6 hidden space-y-2';
                body.appendChild(gruposDiv);

                cbAsig.onchange = async () => {
                    selected[asigId] = { activo: cbAsig.checked, grupos: [] };
                    gruposDiv.innerHTML = '';
                    gruposDiv.classList.toggle('hidden', !cbAsig.checked);

                    database.grupos = database.grupos.filter(
                        g => g.asignatura_id !== asigId
                    );

                    if (!cbAsig.checked) return;

                    const raw = await api.getGruposHorarios(asigId);
                    const map = {};

                    raw.forEach(r => {
                        if (!map[r.grupo]) {
                            map[r.grupo] = {
                                id: `${asigId}-${r.grupo}`,
                                nombre: r.grupo,
                                docente: r.docente,
                                asignatura_id: asigId,
                                horarios: []
                            };
                        }

                        map[r.grupo].horarios.push({
                            dia: normalizeDay(r.dia),
                            hora_inicio: r.hora_inicio,
                            hora_fin: r.hora_fin
                        });
                    });

                    Object.values(map).forEach(grupo => {
                        database.grupos.push(grupo);

                        const item = document.createElement('label');
                        item.className = 'flex items-start gap-2';

                        const cb = document.createElement('input');
                        cb.type = 'checkbox';

                        cb.onchange = () => {
                            if (cb.checked) {
                                selected[asigId].grupos.push(grupo.id);
                            } else {
                                selected[asigId].grupos =
                                    selected[asigId].grupos.filter(x => x !== grupo.id);
                            }
                        };

                        const info = document.createElement('div');
                        info.innerHTML = `
                            <strong>Grupo ${grupo.nombre}</strong> | ${grupo.docente}
                            <ul class="ml-4 text-sm">
                                ${grupo.horarios.map(
                                    h => `<li>${h.dia} ${h.hora_inicio} - ${h.hora_fin}</li>`
                                ).join('')}
                            </ul>
                        `;

                        item.append(cb, info);
                        gruposDiv.appendChild(item);
                    });

                    btnGenerate.classList.remove('hidden');
                };
            });

            body.dataset.loaded = 'true';
        };

        acc.append(header, body);
        ciclosContainer.appendChild(acc);
    });
}

// ======================================================
// 5. GENERAR HORARIOS
// ======================================================
btnGenerate.onclick = () => {
    const groupsPerSubject = [];

    Object.entries(selected).forEach(([asigId, data]) => {
        if (!data.activo) return;

        const grupos = data.grupos.length
            ? database.grupos.filter(g => data.grupos.includes(g.id))
            : database.grupos.filter(g => g.asignatura_id == asigId);

        if (grupos.length) {
            groupsPerSubject.push(grupos);
        }
    });

    if (groupsPerSubject.length !== Object.values(selected).filter(x => x.activo).length) {
        alert('Alguna asignatura seleccionada no tiene grupos válidos');
        return;
    }

    const { validSchedules } =
        generateSchedules(groupsPerSubject, hasTimeConflict);

    if (!validSchedules.length) {
        alert('No hay horarios válidos');
        return;
    }

    showSchedules(adaptSchedules(validSchedules));
};

// ======================================================
// 6. ADAPTADOR PARA EL VISOR (EXPANSIÓN HORA POR HORA)
// ======================================================
function adaptSchedules(validSchedules) {
    return validSchedules.map(schedule =>
        schedule.flatMap(grupo =>
            grupo.horarios.flatMap(h => {
                const blocks = [];

                const hIni = parseInt(h.hora_inicio.split(':')[0], 10);
                const hFin = parseInt(h.hora_fin.split(':')[0], 10);

                for (let i = hIni; i < hFin; i++) {
                    blocks.push({
                        asignatura: database.asignaturas.find(
                            a => a.id === grupo.asignatura_id
                        )?.nombre || 'Asignatura',
                        grupo: grupo.nombre,
                        docente: grupo.docente,
                        day: h.dia,
                        start: String(i).padStart(2, '0') + ':00',
                        end: String(i + 1).padStart(2, '0') + ':00'
                    });
                }

                return blocks;
            })
        )
    );
}
