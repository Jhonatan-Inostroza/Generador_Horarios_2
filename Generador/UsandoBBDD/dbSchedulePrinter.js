// dbSchedulePrinter.js

// ======================================================
// NORMALIZACIÓN DE DÍAS (con y sin tilde)
// ======================================================
function normalizeDay(day) {
    return day
        .toUpperCase()
        .normalize('NFD')                 // separa letras y tildes
        .replace(/[\u0300-\u036f]/g, ''); // elimina tildes
}

// ======================================================
// IMPRESIÓN DE HORARIOS
// ======================================================
export function printSchedules(selectedSchedules) {
    if (!selectedSchedules || !selectedSchedules.length) {
        alert('No hay horarios seleccionados para imprimir');
        return;
    }

    const win = window.open('', '_blank');

    win.document.write(`
        <html>
        <head>
            <title>Horarios</title>
            <style>
                @page {
                    size: A4 landscape;
                    margin: 10mm;
                }

                body {
                    margin: 0;
                    font-family: Arial, sans-serif;
                }

                .page {
                    width: 100%;
                    height: 100%;
                    page-break-after: always;
                    display: flex;
                    flex-direction: column;
                }

                h2 {
                    text-align: center;
                    margin: 6px 0 10px 0;
                }

                .schedule-table {
                    display: grid;
                    grid-template-columns: 80px repeat(6, 1fr);
                    flex: 1;
                    border-collapse: collapse;
                    font-size: 12px;
                }

                .header {
                    background: #e5e7eb;
                    font-weight: bold;
                    border: 1px solid #9ca3af;
                    text-align: center;
                    padding: 4px;
                }

                .hour {
                    background: #f3f4f6;
                    border: 1px solid #9ca3af;
                    text-align: center;
                    padding: 4px;
                    font-weight: bold;
                }

                .cell {
                    border: 1px solid #d1d5db;
                    position: relative;
                }

                .course-box {
                    position: absolute;
                    inset: 2px;
                    border-radius: 6px;
                    padding: 4px;
                    font-size: 11px;
                    color: #111827;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    text-align: center;
                    box-sizing: border-box;
                }
            </style>
        </head>
        <body>
    `);

    selectedSchedules.forEach((schedule, idx) => {

        // DÍAS INTERNOS (SIN TILDE)
        const days = ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];

        // ETIQUETAS VISUALES (CON TILDE)
        const dayLabels = {
            LUNES: 'LUNES',
            MARTES: 'MARTES',
            MIERCOLES: 'MIÉRCOLES',
            JUEVES: 'JUEVES',
            VIERNES: 'VIERNES',
            SABADO: 'SÁBADO'
        };

        const hours = [];
        for (let h = 7; h < 24; h++) {
            hours.push(`${String(h).padStart(2,'0')}:00`);
        }

        win.document.write(`
            <div class="page">
                <h2>Horario ${idx + 1}</h2>

                <div class="schedule-table">
                    <div class="header">Hora</div>
                    ${days.map(d => `<div class="header">${dayLabels[d]}</div>`).join('')}

                    ${hours.map(h => `
                        <div class="hour">
                            ${h} - ${String(parseInt(h) + 1).padStart(2,'0')}:00
                        </div>

                        ${days.map(d => {
                            const item = schedule.find(
                                x =>
                                    normalizeDay(x.day) === d &&
                                    x.start === h
                            );

                            if (!item) {
                                return `<div class="cell"></div>`;
                            }

                            return `
                                <div class="cell">
                                    <div class="course-box"
                                        style="background:${item.color}">
                                        <strong>${item.asignatura}</strong>
                                        Grupo ${item.grupo}<br>
                                        ${item.docente}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    `).join('')}
                </div>
            </div>
        `);
    });

    win.document.write(`</body></html>`);
    win.document.close();

    win.onload = () => {
        win.focus();
        win.print();
    };
}
