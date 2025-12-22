// scheduleCore.js

/**
 * Verifica si dos bloques horarios se superponen
 * (mismo día y horas que chocan)
 */
export function hasTimeConflict(a, b) {
    if (a.dia !== b.dia) return false;

    return !(
        a.hora_fin <= b.hora_inicio ||
        b.hora_fin <= a.hora_inicio
    );
}

/**
 * Genera todas las combinaciones válidas de horarios.
 * REGLA CLAVE:
 *  - Debe elegirse EXACTAMENTE 1 grupo por cada asignatura
 *  - Si una combinación no tiene todos los cursos → SE DESCARTA
 */
export function generateSchedules(groupsPerSubject, conflictFn) {
    const validSchedules = [];

    /**
     * @param {number} subjectIndex  índice de la asignatura actual
     * @param {Array} current       grupos elegidos hasta ahora
     */
    function backtrack(subjectIndex, current) {

        // === CASO BASE ===
        // Se llegó al final de las asignaturas
        if (subjectIndex === groupsPerSubject.length) {

            // VALIDACIÓN CRÍTICA
            // Debe haber 1 grupo por cada asignatura
            if (current.length === groupsPerSubject.length) {
                validSchedules.push([...current]);
            }

            return;
        }

        const gruposDeEstaAsignatura = groupsPerSubject[subjectIndex];

        // Seguridad: si una asignatura no tiene grupos → abortar rama
        if (!Array.isArray(gruposDeEstaAsignatura) || !gruposDeEstaAsignatura.length) {
            return;
        }

        for (const grupo of gruposDeEstaAsignatura) {

            // Verificar conflicto contra TODOS los grupos ya elegidos
            const conflict = current.some(existingGroup =>
                existingGroup.horarios.some(h1 =>
                    grupo.horarios.some(h2 =>
                        conflictFn(h1, h2)
                    )
                )
            );

            if (conflict) continue;

            current.push(grupo);
            backtrack(subjectIndex + 1, current);
            current.pop();
        }
    }

    backtrack(0, []);

    return {
        validSchedules
    };
}
