// select_asignatura.js

function cargarAsignaturas(cicloId, cicloAcademicoId, container) {
    fetch(`/api/asignaturas?ciclo_id=${cicloId}&ciclo_academico_id=${cicloAcademicoId}`)
        .then(res => {
            if (!res.ok) throw new Error("Error al cargar asignaturas");
            return res.json();
        })
        .then(asignaturas => {
            container.innerHTML = "";
            asignaturas.forEach(a => {
                const divAsig = document.createElement("div");
                divAsig.className = "asignatura-tarjeta";
                divAsig.dataset.asignaturaId = a.id;
                divAsig.innerHTML = `
                    <input type="text" class="nombre" value="${a.nombre}">
                    <input type="text" class="grupo" value="${a.grupo}">
                    <input type="text" class="horario" value="${a.horario}">
                    <input type="text" class="docente" value="${a.docente}">
                    <input type="text" class="dia" value="${a.dia}">
                    <input type="time" class="hora-inicio" value="${a.hora_inicio}">
                    <input type="time" class="hora-fin" value="${a.hora_fin}">
                    <button class="guardar-asignatura">Guardar</button>
                `;
                container.appendChild(divAsig);

                divAsig.querySelector(".guardar-asignatura").onclick = () => {
                    const payload = {
                        id: a.id,
                        nombre: divAsig.querySelector(".nombre").value,
                        grupo: divAsig.querySelector(".grupo").value,
                        horario: divAsig.querySelector(".horario").value,
                        docente: divAsig.querySelector(".docente").value,
                        dia: divAsig.querySelector(".dia").value,
                        hora_inicio: divAsig.querySelector(".hora-inicio").value,
                        hora_fin: divAsig.querySelector(".hora-fin").value
                    };
                    fetch("/api/asignaturas", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    }).then(() => {
                        alert("Asignatura guardada correctamente");
                    }).catch(err => console.error(err));
                };
            });
        })
        .catch(err => {
            console.error(err);
            container.innerHTML = "<p>Error al cargar asignaturas</p>";
        });
}
