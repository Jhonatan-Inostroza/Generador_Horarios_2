//ciclo_academico.js
async function cargarCiclosAcademicos(anio) {
    const res = await fetch(`/api/ciclos_academicos?anio=${anio}`);
    const ciclos = await res.json();

    const contenedor = document.getElementById("listaCiclosAcademicos");
    contenedor.innerHTML = "";

    ciclos.forEach(c => {
        const tab = document.createElement("div");
        tab.className = "tab-ciclo-academico";
        tab.textContent = `${anio}-${c.nombre}`;

        tab.onclick = () => {
            document.querySelectorAll(".tab-ciclo-academico")
                .forEach(t => t.classList.remove("active"));

            tab.classList.add("active");
            cargarCarreras(c.id);
        };

        contenedor.appendChild(tab);
    });
}
