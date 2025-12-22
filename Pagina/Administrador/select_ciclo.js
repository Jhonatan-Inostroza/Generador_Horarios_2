// select_ciclo.js

function cargarCiclos(anioId) {
    fetch(`/api/ciclos?anio_id=${anioId}`)
        .then(res => res.json())
        .then(ciclos => {
            const contenedor = document.getElementById("ciclosSection");
            contenedor.innerHTML = "";

            ciclos.forEach(ciclo => {
                const divCiclo = document.createElement("div");
                divCiclo.className = "ciclo-tarjeta";
                divCiclo.dataset.cicloId = ciclo.id;
                divCiclo.dataset.cicloAcademicoId = ciclo.anio_ciclo_id; // obligatorio
                divCiclo.innerHTML = `
                    <button class="toggle-ciclo">${ciclo.nombre}</button>
                    <div class="asignaturas-container" style="display:none;"></div>
                    <button class="btn-subir-excel">Subir Excel</button>
                `;
                contenedor.appendChild(divCiclo);

                // Mostrar/ocultar asignaturas
                divCiclo.querySelector(".toggle-ciclo").onclick = () => {
                    const asignContainer = divCiclo.querySelector(".asignaturas-container");
                    asignContainer.style.display = asignContainer.style.display === "none" ? "block" : "none";
                    if (asignContainer.innerHTML === "") {
                        const cicloId = divCiclo.dataset.cicloId;
                        const cicloAcademicoId = divCiclo.dataset.cicloAcademicoId;
                        cargarAsignaturas(cicloId, cicloAcademicoId, asignContainer);
                    }
                };

                // Subir Excel
                divCiclo.querySelector(".btn-subir-excel").onclick = () => {
                    const cicloId = divCiclo.dataset.cicloId;
                    const cicloAcademicoId = divCiclo.dataset.cicloAcademicoId;
                    subirExcel(cicloId, cicloAcademicoId);
                };
            });
        })
        .catch(err => console.error(err));
}

// Cargar ciclos al cambiar año
document.getElementById("anioAcademicoSelect").addEventListener("change", (e) => {
    const anioId = e.target.value;
    if (anioId) cargarCiclos(anioId);
});

// -----------------------------
// SUBIR ARCHIVO EXCEL
// -----------------------------
function subirExcel(cicloId, cicloAcademicoId) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";

    input.onchange = () => {
        if (!input.files[0]) return;

        const formData = new FormData();
        formData.append("excel", input.files[0]);
        formData.append("ciclo_id", cicloId);
        formData.append("ciclo_academico_id", cicloAcademicoId);

        fetch("/api/subir_excel_asignaturas", {
            method: "POST",
            body: formData
        })
        .then(res => {
            if (!res.ok) throw new Error("Error al subir Excel");
            return res.json();
        })
        .then(data => {
            if (data.ok) {
                alert("Excel subido correctamente");
            } else {
                alert("Hubo un problema: " + (data.mensaje || "Error desconocido"));
            }
        })
        .catch(err => {
            console.error(err);
            alert("Error al subir Excel");
        });
    };

    input.click();
}
