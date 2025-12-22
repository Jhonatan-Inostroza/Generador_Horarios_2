async function cargarCarreras(detalleCicloAcademicoId) {
    const res = await fetch(`/api/carreras?detalle_ciclo_academico_id=${detalleCicloAcademicoId}`);
    const carreras = await res.json();

    const grid = document.getElementById("gridCarreras");
    grid.innerHTML = "";

    carreras.forEach(c => {
        const card = document.createElement("div");
        card.className = "tarjeta-carrera";
        card.textContent = c.nombre;

        card.onclick = () => {
            cargarCiclosCarrera(c.id);
        };

        grid.appendChild(card);
    });
}
