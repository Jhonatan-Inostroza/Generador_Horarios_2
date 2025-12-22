// subir_horarios.js
/*
document.addEventListener("DOMContentLoaded", () => {
    cargarAniosAcademicos();

    const modal = document.getElementById("modalAnio");

    document.getElementById("btnNuevoAnio").onclick = () => {
        modal.style.display = "flex";
    };

    document.getElementById("btnCancelar").onclick = () => {
        modal.style.display = "none";
    };

    document.getElementById("btnAgregarCiclo").onclick = () => {
        const contenedor = document.getElementById("contenedorCiclos");
        const input = document.createElement("input");
        input.className = "ciclo-input";
        input.placeholder = "Ej: II";
        contenedor.appendChild(input);
    };

    document.getElementById("btnGuardarAnio").onclick = guardarAnio;
});

function cargarAniosAcademicos() {
    fetch("/api/anios")
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById("anioAcademicoSelect");
            select.innerHTML = '<option value="">Seleccione un año académico</option>';

            data.forEach(anio => {
                const option = document.createElement("option");
                option.value = anio.id;
                option.textContent = anio.anio;
                select.appendChild(option);
            });
        })
        .catch(err => console.error(err));
}

function guardarAnio() {
    const anio = document.getElementById("inputAnio").value;
    const ciclos = [...document.querySelectorAll(".ciclo-input")]
        .map(i => i.value.trim())
        .filter(v => v !== "");

    if (!anio || ciclos.length === 0) {
        alert("Debe ingresar año y al menos un ciclo");
        return;
    }

    fetch("/api/anios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anio, ciclos })
    })
    .then(res => res.json())
    .then(() => {
        document.getElementById("modalAnio").style.display = "none";
        cargarAniosAcademicos();
    })
    .catch(err => console.error(err));
}
 */


window.addEventListener("DOMContentLoaded", () => {
    fetch("/Administrador/Tabs/anio/anio.html")
        .then(r => r.text())
        .then(html => {
            document.getElementById("contenedor-anio").innerHTML = html;
            cargarAnios();
        });
});
