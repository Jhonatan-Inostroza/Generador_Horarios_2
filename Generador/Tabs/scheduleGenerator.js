// scheduleGenerator.js
export function hasTimeConflict(combination) {
    const map = {};

    for (const grupo of combination) {
        for (const h of grupo.horarios) {
            const day = h.dia.toUpperCase();
            map[day] ??= [];

            const start = toMinutes(h.hora_inicio);
            const end = toMinutes(h.hora_fin);

            for (const e of map[day]) {
                if (Math.max(start, e.start) < Math.min(end, e.end)) {
                    return true;
                }
            }
            map[day].push({ start, end });
        }
    }
    return false;
}

function toMinutes(h) {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm;
}

export function generateSchedules(selected, database, conflictFn) {

    // 1️⃣ SOLO asignaturas activas
    const asignaturas = Object.entries(selected)
        .filter(([_, v]) => v.activo)
        .map(([id]) => Number(id));

    if (!asignaturas.length) {
        return { validSchedules: [] };
    }

    // 2️⃣ Grupos por asignatura
    const gruposPorAsignatura = {};

    asignaturas.forEach(aId => {
        const sel = selected[aId];

        if (sel.grupos.length) {
            gruposPorAsignatura[aId] =
                database.grupos.filter(g => sel.grupos.includes(g.id));
        } else {
            gruposPorAsignatura[aId] =
                database.grupos.filter(g => g.asignatura_id === aId);
        }
    });

    // 3️⃣ Combinación cartesiana
    function combinar(i, actual) {
        if (i === asignaturas.length) return [actual];

        const aId = asignaturas[i];
        const grupos = gruposPorAsignatura[aId];

        return grupos.flatMap(g =>
            combinar(i + 1, [...actual, g])
        );
    }

    // 4️⃣ Filtrar conflictos
    return {
        validSchedules: combinar(0, [])
            .filter(c => !conflictFn(c))
    };
}

