import { prepararDatosParaCalendario } from './Operaciones/SchedulePresenter.js';
import { generateSchedules } from '/menu_opcion/Crear_Horario/Contenido_Tab/Modal/Core/ScheduleCore.js';
import { inicializarImpresionHorarios } from '../Modal/Imprimir/printHorarios.js';

let mapaExcel = {};
let gruposSeleccionadosManualmente = {};

export function inicializarTabExcel() {
    const root = document.getElementById('panel-excel-content');
    if (!root || root.dataset.init === 'true') return;
    root.dataset.init = 'true';

    inicializarImpresionHorarios();

    const dropZone = root.querySelector('#drop-zone');
    const input = root.querySelector('#input-excel');
    const btnUpload = root.querySelector('#btn-upload-excel');
    const fileBadge = root.querySelector('#file-badge');
    const fileNameText = root.querySelector('#file-name-text');
    const listContainer = root.querySelector('#asignaturas-list-excel');
    const stepContainer = root.querySelector('#step-select-asignaturas-excel');
    const btnGenerate = root.querySelector('#btn-generate-excel');
    const btnDownload = root.querySelector('#btn-download-template');

    // --- Lógica de Descarga de Plantilla ---
    if (btnDownload) {
        btnDownload.onclick = () => {
            const ruta = 'menu_opcion/Crear_Horario/Contenido_Tab/Tab_Excel/Excel_Ejemplo.xlsx';
            const link = document.createElement('a');
            link.href = ruta;
            link.download = 'Excel_Ejemplo.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }

    // --- Eventos de Carga (Drag & Drop) ---
    dropZone.addEventListener('click', () => input.click());

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
    });

    dropZone.addEventListener('drop', e => {
        const dt = e.dataTransfer;
        if (dt.files.length) {
            input.files = dt.files;
            input.dispatchEvent(new Event('change'));
        }
    });

    input.onchange = () => {
        if (!input.files.length) return;
        const file = input.files[0];
        fileNameText.textContent = file.name;
        fileBadge.classList.remove('hidden');
        btnUpload.disabled = false;
    };

    btnUpload.onclick = () => leerExcel(input.files[0]);

    // --- Lógica de Generación ---
    btnGenerate.onclick = () => {
        const groupsPerSubject = obtenerSeleccion();
        if (!groupsPerSubject.length) return alert('Selecciona al menos una asignatura.');

        const schedules = generateSchedules(groupsPerSubject);
        if (!schedules.length) return alert('No hay combinaciones posibles con los grupos seleccionados.');

        const datosPlanos = prepararDatosParaCalendario(schedules);
        const modalComponent = document.querySelector('schedule-modal');
        
        if (modalComponent) {
            modalComponent.showSchedules(datosPlanos);
        }
    };

    function leerExcel(file) {
        const reader = new FileReader();
        reader.onload = e => {
            const data = new Uint8Array(e.target.result);
            const wb = XLSX.read(data, { type: 'array' });
            const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            construirMapa(rows);
            renderizar();
        };
        reader.readAsArrayBuffer(file);
    }

    function construirMapa(rows) {
        mapaExcel = {};
        gruposSeleccionadosManualmente = {}; 
        rows.forEach(r => {
            if (!r.ASIGNATURA) return;
            const grupoReal = r['GRUPO HORARIO'] || r['GRUPO'] || 'A';
            mapaExcel[r.ASIGNATURA] ??= {};
            mapaExcel[r.ASIGNATURA][grupoReal] ??= {
                subject: r.ASIGNATURA,
                teacher: r.DOCENTE || 'Sin docente',
                grupo: grupoReal,
                horarios: []
            };
            mapaExcel[r.ASIGNATURA][grupoReal].horarios.push({
                dia: r.DÍA,
                hora_inicio: parseExcelTime(r['HORA INICIO'] || r['INICIO']),
                hora_fin: parseExcelTime(r['HORA FIN'] || r['FIN'])
            });
        });
    }

    function renderizar() {
        listContainer.innerHTML = '';
        stepContainer.classList.remove('hidden');

        Object.keys(mapaExcel).forEach(asig => {
            const wrapper = document.createElement('div');
            wrapper.className = 'asignatura-wrapper';
            wrapper.dataset.asignatura = asig;
            
            wrapper.innerHTML = `
                <div class="asignatura-row premium-clickable">
                    <div class="asig-info">
                        <div class="asig-icon"><i class="fa-solid fa-book-bookmark"></i></div>
                        <span class="asig-name">${asig}</span>
                    </div>
                    <div class="asig-controls">
                        <span class="group-count-badge">${Object.keys(mapaExcel[asig]).length} Grupos</span>
                        <div class="custom-checkbox">
                            <input type="checkbox" class="course-check">
                        </div>
                        <i class="fa-solid fa-chevron-down toggle-arrow"></i>
                    </div>
                </div>
                <div class="grupos-grid hidden"></div>
            `;

            const checkbox = wrapper.querySelector('.course-check');
            const grid = wrapper.querySelector('.grupos-grid');
            const row = wrapper.querySelector('.asignatura-row');
            const arrow = wrapper.querySelector('.toggle-arrow');

            row.onclick = (e) => {
                if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
                const isChecked = checkbox.checked;
                
                wrapper.classList.toggle('is-selected', isChecked);
                grid.classList.toggle('hidden', !isChecked);
                arrow.style.transform = isChecked ? 'rotate(180deg)' : 'rotate(0deg)';
                
                if (isChecked) {
                    renderizarGrupos(grid, mapaExcel[asig], asig);
                }
                actualizarEstadoBotonGenerar();
            };
            listContainer.appendChild(wrapper);
        });
    }

    function renderizarGrupos(container, grupos, nombreAsignatura) {
        container.innerHTML = '';
        Object.values(grupos).forEach(d => {
            const card = document.createElement('div');
            card.className = 'premium-group-card';
            
            if (gruposSeleccionadosManualmente[nombreAsignatura]?.has(d.grupo)) {
                card.classList.add('group-selected');
            }

            card.innerHTML = `
                <div class="group-header">
                    <span class="group-tag">Grupo ${d.grupo}</span>
                    <i class="fa-solid fa-circle-user"></i>
                </div>
                <p class="teacher-name">${d.teacher}</p>
                <div class="schedule-tags">
                    ${d.horarios.map(h => `
                        <span class="tag"><i class="fa-regular fa-clock"></i> ${h.dia.substring(0,3)} ${h.hora_inicio}</span>
                    `).join('')}
                </div>
            `;

            card.onclick = (e) => {
                e.stopPropagation();
                if (!gruposSeleccionadosManualmente[nombreAsignatura]) {
                    gruposSeleccionadosManualmente[nombreAsignatura] = new Set();
                }
                const set = gruposSeleccionadosManualmente[nombreAsignatura];
                if (set.has(d.grupo)) {
                    set.delete(d.grupo);
                    card.classList.remove('group-selected');
                } else {
                    set.add(d.grupo);
                    card.classList.add('group-selected');
                }
                const wrapper = container.closest('.asignatura-wrapper');
                const checkbox = wrapper.querySelector('.course-check');
                if (!checkbox.checked) {
                    checkbox.checked = true;
                    wrapper.classList.add('is-selected');
                    actualizarEstadoBotonGenerar();
                }
            };
            container.appendChild(card);
        });
    }

    function actualizarEstadoBotonGenerar() {
        const haySeleccionados = root.querySelectorAll('.course-check:checked').length > 0;
        btnGenerate.classList.toggle('hidden', !haySeleccionados);
        if (haySeleccionados) btnGenerate.classList.add('fade-in-up');
    }

    function obtenerSeleccion() {
        const seleccionFinal = [];
        root.querySelectorAll('.asignatura-wrapper.is-selected').forEach(wrapper => {
            const asig = wrapper.dataset.asignatura;
            const todosLosGrupos = Object.values(mapaExcel[asig]);
            const manuales = gruposSeleccionadosManualmente[asig];
            if (manuales && manuales.size > 0) {
                seleccionFinal.push(todosLosGrupos.filter(g => manuales.has(g.grupo)));
            } else {
                seleccionFinal.push(todosLosGrupos);
            }
        });
        return seleccionFinal;
    }

    function parseExcelTime(v) {
        if (!v) return '00:00';
        if (typeof v === 'string') return v;
        if (typeof v === 'number') {
            const mins = Math.round(v * 1440);
            return `${String(Math.floor(mins / 60)).padStart(2,'0')}:${String(mins % 60).padStart(2,'0')}`;
        }
        return '00:00';
    }
}