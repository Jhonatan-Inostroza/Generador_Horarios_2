// apiAcademico.js
const BASE_URL = '/api';

export const api = {
    // AÑOS ACADÉMICOS
    getAnios: () =>
        fetch(`${BASE_URL}/anios`).then(r => r.json()),

    // CICLOS ACADÉMICOS POR AÑO
    getCiclosAcademicos: anio =>
        fetch(`${BASE_URL}/ciclos_academicos?anio=${anio}`)
            .then(r => r.json()),

    // CARRERAS POR CICLO ACADÉMICO
    getCarreras: detalleCicloAcademicoId =>
        fetch(
            `${BASE_URL}/carreras?detalle_ciclo_academico_id=${detalleCicloAcademicoId}`
        ).then(r => r.json()),

    // CICLOS CURRICULARES
    getCiclosCurriculares: detalleCicloCarreraId =>
        fetch(
            `${BASE_URL}/ciclos?detalle_ciclo_carrera_id=${detalleCicloCarreraId}`
        ).then(r => r.json()),

    // ASIGNATURAS
    getAsignaturas: detalleCicloCarreraCicloId =>
        fetch(
            `${BASE_URL}/asignaturas?detalle_ciclo_carrera_ciclo_id=${detalleCicloCarreraCicloId}`
        ).then(r => r.json()),

    // GRUPOS HORARIOS
    // GRUPOS HORARIOS
    getGruposHorarios: detalleAsignaturaCicloId =>
        fetch(
            `${BASE_URL}/grupos_horarios?detalle_asignatura_ciclo_id=${detalleAsignaturaCicloId}`
        ).then(r => r.json())

};
