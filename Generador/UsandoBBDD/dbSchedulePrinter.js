// ======================================================
// NORMALIZACIÓN DE DÍAS Y TIEMPO
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

// ======================================================
// COLORES DETERMINISTAS
// ======================================================
const colors = [
    '#60a5fa', '#34d399', '#fbbf24', '#f87171',
    '#a78bfa', '#22d3ee', '#fb7185', '#4ade80'
];

let colorMap = {};

function getColor(key) {
    if (!colorMap[key]) {
        colorMap[key] = colors[Object.keys(colorMap).length % colors.length];
    }
    return colorMap[key];
}

// ======================================================
// CONFIGURACIÓN DE COLUMNAS (Mapeo de Días)
// ======================================================
// Columna 1 es para la Hora. Lunes empieza en la 2.
const dayColumnMap = { 
    'LUNES': 2, 'MARTES': 3, 'MIERCOLES': 4, 
    'JUEVES': 5, 'VIERNES': 6, 'SABADO': 7 
};

// ======================================================
// IMPRESIÓN DE HORARIOS
// ======================================================
// ... (funciones normalizeDay y timeToMinutes se mantienen igual)

export function printSchedules(selectedSchedules) {
    if (!selectedSchedules || !selectedSchedules.length) {
        alert('No hay horarios seleccionados');
        return;
    }

    const win = window.open('', '_blank');
    win.document.write(`
        <html>
        <head>
            <title>Horario Final</title>
            <link rel="stylesheet" href="/generador/UsandoBBDD/dbSchedulePrinter.css">
        </head>
        <body>
    `);

    selectedSchedules.forEach((schedule, idx) => {
        colorMap = {};
        const days = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
        const dayLabels = { LUNES:'LUNES', MARTES:'MARTES', MIERCOLES:'MIÉRCOLES', JUEVES:'JUEVES', VIERNES:'VIERNES', SABADO:'SÁBADO' };

        win.document.write(`
            <div class="page">
                <h2 class="title-print">HORARIO ${idx + 1}</h2>
                <div class="schedule-table">
                    <div class="header" style="grid-column: 1; grid-row: 1;">HORA</div>
                    ${days.map(d => `<div class="header" style="grid-column: ${dayColumnMap[d]}; grid-row: 1;">${dayLabels[d]}</div>`).join('')}
        `);

        // Rango de horas: de 07:00 a 23:00 (para que termine 24:00)
        const hours = [];
        for (let h = 7; h < 24; h++) hours.push(`${String(h).padStart(2, '0')}:00`);

        hours.forEach((h, hIdx) => {
            const hourMin = timeToMinutes(h);
            const rowIdx = hIdx + 2; // +2 porque la fila 1 es el header

            // 1. Escribimos la etiqueta de la hora (columna 1)
            win.document.write(`<div class="hour" style="grid-column: 1; grid-row: ${rowIdx}">${h}</div>`);
            
            days.forEach(d => {
                const colIdx = dayColumnMap[d];

                // BUSCAMOS SI UNA MATERIA EMPIEZA EXACTAMENTE A ESTA HORA
                const blockStarting = schedule.find(b =>
                    normalizeDay(b.day) === d &&
                    timeToMinutes(b.start) === hourMin
                );

                // BUSCAMOS SI ESTA HORA ES PARTE DE UNA MATERIA QUE YA EMPEZÓ
                const isMidBlock = schedule.some(b => {
                    const start = timeToMinutes(b.start);
                    const end = timeToMinutes(b.end);
                    return normalizeDay(b.day) === d && hourMin > start && hourMin < end;
                });

                if (blockStarting) {
                    // Calculamos cuánto espacio debe ocupar
                    const span = (timeToMinutes(blockStarting.end) - timeToMinutes(blockStarting.start)) / 60;
                    const color = getColor(`${blockStarting.asignatura}-${blockStarting.grupo}`);

                    // ESTA ES LA CLAVE: Se escribe una sola vez con 'span'
                    win.document.write(`
                        <div class="cell filled" style="grid-column: ${colIdx}; grid-row: ${rowIdx} / span ${span}">
                            <div class="course-box" style="background:${color}">
                                <strong>${blockStarting.asignatura}</strong>
                                <span>Grupo ${blockStarting.grupo}</span>
                            </div>
                        </div>
                    `);
                } else if (!isMidBlock) {
                    // SI NO ESTÁ EMPEZANDO NI ESTÁ EN MEDIO, PINTAMOS CELDA VACÍA
                    win.document.write(`<div class="cell" style="grid-column: ${colIdx}; grid-row: ${rowIdx}"></div>`);
                }
                // Si isMidBlock es verdadero, NO escribimos nada. 
                // El 'span' que pusimos arriba llenará automáticamente este espacio.
            });
        });

        win.document.write(`</div>`); // table

        // LEYENDA COMPACTA
        const legendKeys = [...new Set(schedule.map(b => `${b.asignatura}-${b.grupo}`))];
        win.document.write(`<div class="legend-box">`);
        legendKeys.forEach(key => {
            const b = schedule.find(x => `${x.asignatura}-${x.grupo}` === key);
            win.document.write(`
                <div class="legend-item">
                    <div class="legend-color" style="background:${getColor(key)}"></div>
                    <span><strong>${b.asignatura}</strong> | G. ${b.grupo} <small>(${b.docente})</small></span>
                </div>
            `);
        });
        win.document.write(`</div></div>`);
    });

    win.document.write(`</body></html>`);
    win.document.close();
    win.onload = () => setTimeout(() => { win.focus(); win.print(); }, 500);
}