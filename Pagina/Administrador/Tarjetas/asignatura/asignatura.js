// asignatura.js
async function cargarAsignaturas(detalleCicloCarreraCicloId) {
    const res = await fetch(
        `/api/asignaturas?detalle_ciclo_carrera_ciclo_id=${detalleCicloCarreraCicloId}`
    );

    const asignaturas = await res.json();

    if (!Array.isArray(asignaturas)) {
        console.error("Respuesta inesperada:", asignaturas);
        return;
    }

    const grid = document.getElementById("gridAsignaturas");
    grid.innerHTML = "";

    asignaturas.forEach(a => {
        const card = document.createElement("div");
        card.className = "tarjeta-asignatura";
        card.textContent = a.nombre;

        card.onclick = () => {
            cargarGruposHorarios(a.id);
        };

        grid.appendChild(card);
    });
}
