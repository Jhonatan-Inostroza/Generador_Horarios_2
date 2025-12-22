// mapperBD.js
export function createEmptyDatabase() {
    return {
        asignaturas: [],
        grupos: []
    };
}

export function addGrupo(database, asignatura, grupo) {

    let a = database.asignaturas.find(x => x.nombre === asignatura.nombre);
    if (!a) {
        a = {
            id: database.asignaturas.length + 1,
            nombre: asignatura.nombre
        };
        database.asignaturas.push(a);
    }

    database.grupos.push({
        id: database.grupos.length + 1,
        nombre: grupo.grupo,
        docente: grupo.docente,
        asignatura_id: a.id,
        horarios: [{
            dia: grupo.dia,
            hora_inicio: grupo.hora_inicio,
            hora_fin: grupo.hora_fin
        }]
    });
}
