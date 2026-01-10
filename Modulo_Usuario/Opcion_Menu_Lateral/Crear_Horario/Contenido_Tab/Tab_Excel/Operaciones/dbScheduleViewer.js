// // dbScheduleViewer.js y dbScheduleViewer.css no valen; solo se uso para ver como podia quedar el horario en el Modjal.js
// let schedules = [];
// let index = 0;

// // Función para generar colores consistentes
// function getCourseColor(name) {
//     let hash = 0;
//     for (let i = 0; i < name.length; i++) {
//         hash = name.charCodeAt(i) + ((hash << 5) - hash);
//     }
//     return `hsl(${Math.abs(hash) % 360}, 65%, 45%)`;
// }

// export function showSchedules(validSchedules, root = document) {
//     if (!validSchedules || !validSchedules.length) return;
//     schedules = validSchedules;
//     index = 0;
//     render(root);
// }

// function render(root) {
//     const title = root.getElementById('schedule-title');
//     const grid = root.getElementById('schedule-grid');
//     const legend = root.getElementById('schedule-legend');
//     const schedule = schedules[index];

//     if (!schedule) return;

//     title.innerHTML = `Horario ${index + 1} de ${schedules.length}`;
//     const days = ['LUS', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

//     // 1. Cálculo dinámico de rango horario
//     let maxHour = 14; 
//     schedule.forEach(item => {
//         const hStart = parseInt(item.start.split(':')[0]); 
//         if (hStart > maxHour) maxHour = hStart;
//     });
    
//     const endLimit = Math.min(maxHour + 2, 24); 
//     const hours = [];
//     for (let h = 7; h < endLimit; h++) {
//         const start = `${String(h).padStart(2, '0')}:00`;
//         const end = `${String(h + 1).padStart(2, '0')}:00`;
//         // MODIFICACIÓN: Label tiene el rango, Value mantiene la hora original para que tu código no se rompa
//         hours.push({ label: `${start} - ${end}`, value: start });
//     }

//     // 2. Render de la tabla
//     grid.innerHTML = `
//         <div class="schedule-table" style="grid-template-rows: auto repeat(${hours.length}, minmax(65px, auto));">
//             <div class="header-day">Hora</div>
//             ${days.map(d => `<div class="header-day">${d}</div>`).join('')}
//             ${hours.map(h => `
//                 <div class="hour">${h.label}</div>
//                 ${days.map(d => `<div class="cell" data-day="${d}" data-hour="${h.value}"></div>`).join('')}
//             `).join('')}
//         </div>
//     `;

//     // 3. Render de la Leyenda Dinámica
//     const uniqueCourses = new Map();
//     schedule.forEach(item => {
//         if (!uniqueCourses.has(item.asignatura)) {
//             uniqueCourses.set(item.asignatura, {
//                 name: item.asignatura,
//                 group: item.grupo,
//                 teacher: item.docente,
//                 color: getCourseColor(item.asignatura)
//             });
//         }
//     });

//     legend.innerHTML = Array.from(uniqueCourses.values()).map(c => `
//         <div class="legend-item">
//             <div class="legend-marker" style="background: ${c.color}"></div>
//             <div class="legend-content">
//                 <h4>${c.name}</h4>
//                 <p>Grupo ${c.group}</p>
//                 <p class="teacher-name">${c.teacher}</p>
//             </div>
//         </div>
//     `).join('');

//     // 4. Pintado de bloques en el grid
//     schedule.forEach(item => {
//         // Limpiamos la hora de entrada para asegurar que coincida con el data-hour
//         const startNorm = item.start.split(':')[0].trim().padStart(2, '0') + ":00";
//         const dayNorm = item.day.trim().toUpperCase();
        
//         const cell = grid.querySelector(`.cell[data-day="${dayNorm}"][data-hour="${startNorm}"]`);
        
//         if (cell) {
//             const color = getCourseColor(item.asignatura);
//             cell.innerHTML = `
//                 <div class="course-box" style="background:${color};">
//                     <strong>${item.asignatura}</strong>
//                     <small>G. ${item.grupo}</small>
//                 </div>
//             `;
//         }
//     });

//     // 5. Navegación
//     root.getElementById('prev-schedule').onclick = () => { if(index > 0) { index--; render(root); } };
//     root.getElementById('next-schedule').onclick = () => { if(index < schedules.length - 1) { index++; render(root); } };
// }