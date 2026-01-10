// ScheduleCore.js

export function hasTimeConflict(a, b) {
  if (a.dia !== b.dia) return false;

  return !(
    a.hora_fin <= b.hora_inicio ||
    b.hora_fin <= a.hora_inicio
  );
}

export function generateSchedules(groupsPerSubject) {
  const results = [];

  function backtrack(index, current) {
    if (index === groupsPerSubject.length) {
      results.push([...current]);
      return;
    }

    for (const group of groupsPerSubject[index]) {

      const conflict = current.some(g =>
        g.horarios.some(h1 =>
          group.horarios.some(h2 =>
            hasTimeConflict(h1, h2)
          )
        )
      );

      if (conflict) continue;

      current.push(group);
      backtrack(index + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return results;
}

/* ===============================
   EVENTO DE IMPRESIÓN (GLOBAL)
================================ */

export function emitirEventoImpresion(schedules) {
    document.dispatchEvent(
        new CustomEvent("print-schedules", {
            detail: { schedules }
        })
    );
}
