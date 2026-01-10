// SchedulePresenter.js

export function prepararDatosParaCalendario(schedules) {
    return schedules.map(combinacion => {
        const bloquesVisuales = [];

        combinacion.forEach(curso => {
            // 1. Intentamos obtener las llaves tanto del objeto principal como de un posible sub-objeto 'datos'
            const datosOrigen = curso.datos || curso; 
            const keys = Object.keys(datosOrigen);
            
            // 2. Buscamos las llaves ignorando espacios y mayúsculas
            const keyGrupo = keys.find(k => k.replace(/\s/g, '').toUpperCase().includes('GRUPO'));
            const keyAsig = keys.find(k => k.toUpperCase().includes('ASIG') || k.toUpperCase().includes('SUBJ'));
            const keyDocente = keys.find(k => k.toUpperCase().includes('DOCENTE') || k.toUpperCase().includes('TEACHER'));

            // 3. Asignamos con prioridad: Si no encuentra la llave dinámica, busca nombres fijos comunes
            const grupoReal = (keyGrupo ? datosOrigen[keyGrupo] : null) || curso.grupo || curso.seccion || "S/G";
            const asignaturaReal = (keyAsig ? datosOrigen[keyAsig] : null) || curso.asignatura || "Sin Nombre";
            const docenteReal = (keyDocente ? datosOrigen[keyDocente] : null) || curso.docente || "No asignado";

            curso.horarios.forEach(h => {
                const startH = parseInt(h.hora_inicio.split(':')[0]);
                const endH = parseInt(h.hora_fin.split(':')[0]);

                for (let i = startH; i < endH; i++) {
                    const horaActual = `${String(i).padStart(2, '0')}:00`;
                    
                    bloquesVisuales.push({
                        asignatura: asignaturaReal,
                        docente: docenteReal,
                        grupo: grupoReal, 
                        day: h.dia.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''), 
                        start: horaActual 
                    });
                }
            });
        });

        return bloquesVisuales; 
    });
}