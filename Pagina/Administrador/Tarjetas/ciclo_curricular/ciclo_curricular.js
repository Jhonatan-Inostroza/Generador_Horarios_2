// ciclo_curricular.js
async function cargarCiclosCarrera(detalleCicloCarreraId) {
    const res = await fetch(
        `/api/ciclos?detalle_ciclo_carrera_id=${detalleCicloCarreraId}`
    );

    const ciclos = await res.json();

    if (!Array.isArray(ciclos)) {
        console.error("Respuesta inesperada:", ciclos);
        return;
    }

    const grid = document.getElementById("gridCiclos");
    grid.innerHTML = "";

    ciclos.forEach(c => {
        const card = document.createElement("div");
        card.className = "tarjeta-ciclo";
        card.textContent = c.nombre;

        // c.id === detalle_ciclo_carrera_ciclo_id
        card.onclick = () => {
            cargarAsignaturas(c.id);
        };

        grid.appendChild(card);
    });
}
