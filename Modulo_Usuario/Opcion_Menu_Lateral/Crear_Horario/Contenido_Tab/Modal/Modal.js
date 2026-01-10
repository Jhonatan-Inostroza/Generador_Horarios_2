import { imprimirHorariosSeleccionados } from './Imprimir/printHorarios.js';

async function loadTemplate(shadow) {
  const [html, cssModal, cssGrid] = await Promise.all([
    fetch('/menu_opcion/Crear_Horario/Contenido_Tab/Modal/Modal.html').then(r => r.text()),
    fetch('/menu_opcion/Crear_Horario/Contenido_Tab/Modal/Modal.css').then(r => r.text()),
    fetch('/menu_opcion/Crear_Horario/Contenido_Tab/Tab_Excel/Operaciones/dbScheduleViewer.css').then(r => r.text())
  ]);

  const tpl = document.createElement('template');
  tpl.innerHTML = `<style>${cssModal}${cssGrid}</style>${html}`;
  shadow.appendChild(tpl.content.cloneNode(true));
}

class ScheduleModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.schedules = [];
    this.index = 0;
    this.selectedSchedules = new Set();
  }

  async connectedCallback() {
    await loadTemplate(this.shadowRoot);
    this._cache();
    this._bind();
  }

  _cache() {
    const $ = s => this.shadowRoot.querySelector(s);
    this.$modal = $('#schedule-modal');
    this.$grid = $('#schedule-grid');
    this.$legend = $('#schedule-legend');
    this.$title = $('#schedule-title');
    this.$prev = $('#prev-schedule');
    this.$next = $('#next-schedule');
    this.$close = $('#close-modal');
    this.$print = $('#btn-print-schedules');
    this.$printCount = $('#print-count');
    this.$checkbox = this.shadowRoot.querySelector('.select-chip input');
  }

  _bind() {
    // Cerrar
    this.$close.onclick = () => this.$modal.classList.add('hidden');

    // Navegación
    this.$prev.onclick = () => { if (this.index > 0) { this.index--; this._render(); } };
    this.$next.onclick = () => { if (this.index < this.schedules.length - 1) { this.index++; this._render(); } };

    // Selección
    if (this.$checkbox) {
        this.$checkbox.onchange = () => {
          this.$checkbox.checked ? this.selectedSchedules.add(this.index) : this.selectedSchedules.delete(this.index);
          this._updateCount();
        };
    }

    // Imprimir
    this.$print.onclick = () => {
        if (this.selectedSchedules.size === 0) {
            alert("Selecciona al menos un horario usando el check superior.");
            return;
        }
        const seleccion = Array.from(this.selectedSchedules).map(i => this.schedules[i]);
        imprimirHorariosSeleccionados(seleccion);
    };
  }

  _updateCount() { 
    if(this.$printCount) this.$printCount.textContent = `(${this.selectedSchedules.size})`; 
  }

  showSchedules(data) {
    this.schedules = data;
    this.index = 0;
    this.selectedSchedules.clear();
    this._updateCount();
    this._render();
    this.$modal.classList.remove('hidden');
  }

  _render() {
    const schedule = this.schedules[this.index];
    if (!schedule) return;

    this.$title.textContent = `Horario ${this.index + 1} de ${this.schedules.length}`;
    if(this.$checkbox) this.$checkbox.checked = this.selectedSchedules.has(this.index);

    const days = ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];
    
    // Generar horas con rango para el label y valor base para el data-hour
    const hours = Array.from({ length: 16 }, (_, i) => {
        const start = String(7 + i).padStart(2, '0') + ':00';
        const end = String(8 + i).padStart(2, '0') + ':00';
        return { label: `${start} - ${end}`, value: start };
    });

    // Grid con etiquetas de rango
    this.$grid.innerHTML = `
      <div class="schedule-table">
        <div class="header-day">Hora</div>
        ${days.map(d => `<div class="header-day">${d}</div>`).join('')}
        ${hours.map(h => `
          <div class="hour">${h.label}</div>
          ${days.map(d => `<div class="cell" data-day="${d}" data-hour="${h.value}"></div>`).join('')}
        `).join('')}
      </div>
    `;

    // Pintar bloques
    schedule.forEach(item => {
      if (!item.color) {
          item.color = this._color(item.asignatura);
      }

      // Normalización de la hora para búsqueda (ej: de "7:00" a "07:00")
      const hourPart = item.start.split(':')[0].trim();
      const startTimeNorm = hourPart.padStart(2, '0') + ':00';
      const dayNorm = item.day.toUpperCase().trim();

      const cell = this.shadowRoot.querySelector(`.cell[data-day="${dayNorm}"][data-hour="${startTimeNorm}"]`);
      
      if (cell) {
        cell.innerHTML = `
          <div class="course-box" style="background:${item.color}; border-left: 4px solid rgba(0,0,0,0.2)">
            <strong>${item.asignatura}</strong>
            <small>Grupo ${item.grupo}</small>
          </div>
        `;
      }
    });

    // Leyenda
    const unique = [...new Map(schedule.map(item => [item.asignatura, item])).values()];
    this.$legend.innerHTML = unique.map(c => `
      <div class="legend-item">
        <div class="legend-marker" style="background:${this._color(c.asignatura)}"></div>
        <div class="legend-content">
          <h4>${c.asignatura}</h4>
          <p>Grupo ${c.grupo} • ${c.docente}</p>
        </div>
      </div>
    `).join('');
  }

  _color(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${Math.abs(hash) % 360}, 65%, 45%)`;
  }
}

customElements.define('schedule-modal', ScheduleModal);