async function cargarGruposHorarios(detalleAsignaturaCicloId) {
    const res = await fetch(
        `/api/grupos_horarios?detalle_asignatura_ciclo_id=${detalleAsignaturaCicloId}`
    );

    const grupos = await res.json();
    const tbody = document.getElementById("tablaGruposBody");
    tbody.innerHTML = "";

    if (grupos.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="5">No hay grupos horarios registrados</td>`;
        tbody.appendChild(fila);
        return;
    }

    grupos.forEach(g => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${g.grupo}</td>
            <td>${g.dia}</td>
            <td>${g.hora_inicio}</td>
            <td>${g.hora_fin}</td>
            <td>${g.docente}</td>
        `;

        tbody.appendChild(fila);
    });
}
