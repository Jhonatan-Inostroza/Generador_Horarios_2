function initTabBBDD() {
    console.log("🔥 Inicializando Tab BBDD");

    cargarAnios();

    const selectAnio = document.getElementById("select-anio");
    const selectCiclo = document.getElementById("select-anio-ciclo");

    if (!selectAnio || !selectCiclo) {
        console.error("❌ Elementos no encontrados");
        return;
    }

    selectAnio.addEventListener("change", (e) => {
        cargarCiclosAcademicos(e.target.value);
    });

    selectCiclo.addEventListener("change", (e) => {
        cargarCarreras(e.target.value);
    });
}

/* ============================
   PASO 1 – AÑOS
============================ */
function cargarAnios() {
    console.log("🔥 Inicializando Tab BBDD 1");
    fetch("http://127.0.0.1:5000/api/anios")
        .then(res => {
        console.log("Status:", res.status);
        console.log("OK:", res.ok);
        return res.json();
    })
        .then(data => {
            console.log("Años:", data);
            const select = document.getElementById("select-anio");
            select.innerHTML = `<option selected disabled>Seleccione año</option>`;

            data.forEach(anio => {
                select.innerHTML += `
                    <option value="${anio.anio}">
                        ${anio.anio}
                    </option>`;
            });
        })
        .catch(err => {
        console.error("❌ Error en fetch:", err);
    });
}

/* ============================
   PASO 1 – CICLOS ACADÉMICOS
============================ */
function cargarCiclosAcademicos(anio) {
    fetch(`http://127.0.0.1:5000/api/ciclos_academicos?anio=${anio}`)
        .then(res => res.json())
        .then(data => {
            console.log("Años:", data);
            const select = document.getElementById("select-anio-ciclo");
            select.disabled = false;
            select.innerHTML = `<option selected disabled>Seleccione ciclo</option>`;

            data.forEach(ciclo => {
                select.innerHTML += `
                    <option value="${ciclo.id}">
                        ${ciclo.nombre}
                    </option>`;
            });
        });
}

/* ============================
   PASO 2 – CARRERAS
============================ */
function cargarCarreras(detalleCicloAcademicoId) {
    fetch(`http://127.0.0.1:5000/api/carreras?detalle_ciclo_academico_id=${detalleCicloAcademicoId}`)
        .then(res => res.json())
        .then(data => {
            console.log("Años:", data);
            const container = document.getElementById("carreras-container");
            container.innerHTML = "";

            data.forEach(carrera => {
                const card = document.createElement("div");
                card.className = "career-card";
                card.innerHTML = `
                    <h3>${carrera.nombre}</h3>
                `;
                card.onclick = () => cargarCiclosCurriculares(carrera.id);
                container.appendChild(card);
            });
        });
}

/* ============================
   PASO 3 – CICLOS + ASIGNATURAS
============================ */
function cargarCiclosCurriculares(detalleCicloCarreraId) {
    fetch(`http://127.0.0.1:5000/api/ciclos?detalle_ciclo_carrera_id=${detalleCicloCarreraId}`)
        .then(res => res.json())
        .then(data => {
            console.log("Años:", data);
            const container = document.getElementById("ciclos-container");
            container.innerHTML = "";

            data.forEach(ciclo => {
                const div = document.createElement("div");
                div.className = "ciclo-box";
                div.innerHTML = `
                    <h4>${ciclo.nombre}</h4>
                    <div id="asignaturas-${ciclo.id}" class="space-y-2"></div>
                `;
                container.appendChild(div);

                cargarAsignaturas(ciclo.id);
            });
        });
}

/* ============================
   ASIGNATURAS
============================ */
function cargarAsignaturas(detalleCicloCarreraCicloId) {
    fetch(`http://127.0.0.1:5000/api/asignaturas?detalle_ciclo_carrera_ciclo_id=${detalleCicloCarreraCicloId}`)
        .then(res => res.json())
        .then(data => {
            console.log("Años:", data);
            const container = document.getElementById(
                `asignaturas-${detalleCicloCarreraCicloId}`
            );

            data.forEach(asig => {
                const item = document.createElement("div");
                item.className = "asignatura-item";
                item.innerText = asig.nombre;
                item.onclick = () => cargarGruposHorarios(asig.id);
                container.appendChild(item);
            });
        });
}

/* ============================
   GRUPOS HORARIOS
============================ */
function cargarGruposHorarios(detalleAsignaturaCicloId) {
    fetch(`http://127.0.0.1:5000/api/grupos_horarios?detalle_asignatura_ciclo_id=${detalleAsignaturaCicloId}`)
        .then(res => res.json())
        .then(data => {
            console.log("Años:", data);
            console.log("Grupos horarios:", data);
            // Aquí puedes mostrar horarios en un modal o tabla
        });
}
