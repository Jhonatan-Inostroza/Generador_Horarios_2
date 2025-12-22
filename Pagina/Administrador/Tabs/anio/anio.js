//anio.js
async function cargarAnios() {
    const res = await fetch("/api/anios");
    const anios = await res.json();

    const contenedor = document.getElementById("listaAnios");
    contenedor.innerHTML = "";

    anios.forEach(a => {
        const tab = document.createElement("div");
        tab.className = "tab-anio";
        tab.textContent = a.anio;

        tab.onclick = () => {
            document.querySelectorAll(".tab-anio").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            cargarCiclosAcademicos(a.anio);
        };

        contenedor.appendChild(tab);
    });
}

document.addEventListener("DOMContentLoaded", cargarAnios);
