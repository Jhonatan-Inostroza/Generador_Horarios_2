// dbScheduler.js
import { api } from "./apiAcademico.js";
import {
    generateSchedules,
    hasTimeConflict,
} from "/generador/core/scheduleCore.js";
import { showSchedules } from "./dbScheduleViewer.js";

// ======================================================
// DOM
// ======================================================
const selectAnio = document.getElementById("select-anio");
const selectCicloAcademico = document.getElementById("select-anio-ciclo");
const carrerasContainer = document.getElementById("carreras-container");
const ciclosContainer = document.getElementById("ciclos-container");
const btnGenerate = document.getElementById("btn-generate-db");

// ======================================================
// MODELO
// ======================================================
const database = {
    asignaturas: [], // { id, nombre }
    grupos: [], // { id, nombre, docente, asignatura_id, horarios[] }
};

let selected = {};

// ======================================================
// UTILIDADES
// ======================================================
function normalizeDay(dia) {
    return dia
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// ======================================================
// 1. AÑOS ACADÉMICOS
// ======================================================
(async () => {
    const anios = await api.getAnios();
    selectAnio.innerHTML =
        `<option value="">Seleccione año</option>` +
        anios.map((a) => `<option value="${a.anio}">${a.anio}</option>`).join("");
})();

// ======================================================
// 2. CICLOS ACADÉMICOS
// ======================================================
selectAnio.onchange = async () => {
    selectCicloAcademico.innerHTML = "";
    selectCicloAcademico.disabled = true;
    carrerasContainer.innerHTML = "";
    ciclosContainer.innerHTML = "";
    btnGenerate.classList.add("hidden");

    database.asignaturas = [];
    database.grupos = [];
    selected = {};

    if (!selectAnio.value) return;

    const ciclos = await api.getCiclosAcademicos(selectAnio.value);

    selectCicloAcademico.innerHTML =
        `<option value="">Seleccione ciclo</option>` +
        ciclos.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join("");

    selectCicloAcademico.disabled = false;
};

// ======================================================
// 3. CARRERAS
// ======================================================
selectCicloAcademico.onchange = async () => {
    carrerasContainer.innerHTML = "";
    ciclosContainer.innerHTML = "";
    btnGenerate.classList.add("hidden");

    database.asignaturas = [];
    database.grupos = [];
    selected = {};

    if (!selectCicloAcademico.value) return;

    const carreras = await api.getCarreras(selectCicloAcademico.value);

    let carreraSeleccionada = null;

carreras.forEach((c) => {
  const card = document.createElement("div");
  card.className =
    "career-card flex items-center justify-center gap-3 px-5 py-4 rounded-xl border cursor-pointer transition";

  card.innerHTML = `
    <i class="fa-solid fa-graduation-cap text-indigo-600 text-lg"></i>
    <span class="font-semibold text-gray-700">${c.nombre}</span>
  `;

  card.onclick = () => {
    // Quitar selección anterior
    if (carreraSeleccionada) {
      carreraSeleccionada.classList.remove("selected");
    }

    // Marcar la actual
    card.classList.add("selected");
    carreraSeleccionada = card;

    cargarCiclosCurriculares(c.id);
  };

  carrerasContainer.appendChild(card);
});
};

// ======================================================
// 4. CICLOS → ASIGNATURAS → GRUPOS
// ======================================================
async function cargarCiclosCurriculares(detalleCicloCarreraId) {
  ciclosContainer.innerHTML = "";
  ciclosContainer.className = "space-y-6";

  const ciclos = await api.getCiclosCurriculares(detalleCicloCarreraId);

  ciclos.forEach((ciclo) => {
    const acc = document.createElement("div");
    acc.className = "bg-white rounded-xl shadow border";

    const header = document.createElement("button");
    header.className =
      "w-full flex items-center justify-between px-5 py-4 font-semibold text-lg text-indigo-700 hover:bg-indigo-50 transition";
    header.innerHTML = `
      <span class="flex items-center gap-2">
        <i class="fa-solid fa-layer-group text-indigo-600"></i>
        Ciclo ${ciclo.nombre}
      </span>
      <i class="fa-solid fa-chevron-down transition"></i>
    `;

    const body = document.createElement("div");
    body.className = "hidden px-6 pb-6 space-y-4";

    header.onclick = async () => {
      body.classList.toggle("hidden");
      header.querySelector("i.fa-chevron-down")?.classList.toggle("rotate-180");

      if (body.dataset.loaded) return;

      const asignaturas = await api.getAsignaturas(ciclo.id);

      asignaturas.forEach((a) => {
        const asigId = a.id;

        if (!database.asignaturas.some((x) => x.id === asigId)) {
          database.asignaturas.push({ id: asigId, nombre: a.nombre });
        }

        /* ================= ASIGNATURA CARD ================= */
        const asigCard = document.createElement("div");
        asigCard.className =
          "border rounded-xl p-4 hover:shadow-md transition space-y-3";

        const asigHeader = document.createElement("div");
        asigHeader.className = "flex justify-between items-center";

        asigHeader.innerHTML = `
          <span class="font-semibold text-gray-800">${a.nombre}</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 transition"></div>
            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
          </label>
        `;

        const cbAsig = asigHeader.querySelector("input");

        const gruposDiv = document.createElement("div");
        gruposDiv.className =
  "hidden grid grid-cols-1 md:grid-cols-2 gap-4 mt-4";

        asigCard.append(asigHeader, gruposDiv);
        body.appendChild(asigCard);

        /* ================= ASIGNATURA CHECK ================= */
        cbAsig.onchange = async () => {
          selected[asigId] = { activo: cbAsig.checked, grupos: [] };
          gruposDiv.innerHTML = "";
          gruposDiv.classList.toggle("hidden", !cbAsig.checked);

          database.grupos = database.grupos.filter(
            (g) => g.asignatura_id !== asigId
          );

          if (!cbAsig.checked) return;

          const raw = await api.getGruposHorarios(asigId);
          const map = {};

          raw.forEach((r) => {
            if (!map[r.grupo]) {
              map[r.grupo] = {
                id: `${asigId}-${r.grupo}`,
                nombre: r.grupo,
                docente: r.docente,
                asignatura_id: asigId,
                horarios: [],
              };
            }

            map[r.grupo].horarios.push({
              dia: normalizeDay(r.dia),
              hora_inicio: r.hora_inicio,
              hora_fin: r.hora_fin,
            });
          });

          /* ================= GRUPOS ================= */
          Object.values(map).forEach((grupo) => {
  database.grupos.push(grupo);

  const groupCard = document.createElement("label");
  groupCard.className = `
    relative border rounded-xl p-4 cursor-pointer
    transition-all duration-200
    hover:border-indigo-400 hover:shadow-md
    bg-white
  `;

  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.className = "peer hidden";

  cb.onchange = () => {
    if (cb.checked) {
      selected[asigId].grupos.push(grupo.id);
    } else {
      selected[asigId].grupos =
        selected[asigId].grupos.filter((x) => x !== grupo.id);
    }
  };

  groupCard.innerHTML = `
    <!-- CHECK ICON -->
    <div class="
      absolute top-3 right-3 text-indigo-600 text-xl
      opacity-0 scale-75
      peer-checked:opacity-100 peer-checked:scale-100
      transition
    ">
      <i class="fa-solid fa-circle-check"></i>
    </div>

    <h4 class="font-semibold text-indigo-700 mb-1">
      Grupo ${grupo.nombre}
    </h4>

    <p class="text-sm text-gray-600 mb-2">
      <i class="fa-solid fa-user-tie mr-1"></i>
      ${grupo.docente}
    </p>

    <ul class="flex flex-wrap justify-center gap-2 mt-3">
  ${grupo.horarios
    .map(
      (h) =>
        `<li class="
          flex items-center gap-2
          px-3 py-1.5
          rounded-full
          bg-indigo-50 text-indigo-700
          text-xs font-semibold
          border border-indigo-200
          shadow-sm
        ">
          <i class="fa-regular fa-clock text-indigo-500"></i>
          <span class="uppercase">${h.dia}</span>
          <span>${h.hora_inicio} – ${h.hora_fin}</span>
        </li>`
    )
    .join("")}
</ul>

  `;

  /* Estados seleccionados */
  groupCard.classList.add(
    "peer-checked:ring-2",
    "peer-checked:ring-indigo-500",
    "peer-checked:bg-indigo-50"
  );

  groupCard.prepend(cb);
  gruposDiv.appendChild(groupCard);
});


          btnGenerate.classList.remove("hidden");
        };
      });

      body.dataset.loaded = "true";
    };

    acc.append(header, body);
    ciclosContainer.appendChild(acc);
  });
}


// ======================================================
// 5. GENERAR HORARIOS
// ======================================================
btnGenerate.onclick = () => {
    const groupsPerSubject = [];

    Object.entries(selected).forEach(([asigId, data]) => {
        if (!data.activo) return;

        const grupos = data.grupos.length
            ? database.grupos.filter((g) => data.grupos.includes(g.id))
            : database.grupos.filter((g) => g.asignatura_id == asigId);

        if (grupos.length) {
            groupsPerSubject.push(grupos);
        }
    });

    if (
        groupsPerSubject.length !==
        Object.values(selected).filter((x) => x.activo).length
    ) {
        //alert("Alguna asignatura seleccionada no tiene grupos válidos");
        Swal.fire({
        icon: "error",
        title: "Sin grupos válidos",
        text: "Alguna asignatura seleccionada no tiene grupos válidos",
      });
        return;
    }

    const { validSchedules } = generateSchedules(
        groupsPerSubject,
        hasTimeConflict
    );

    if (!validSchedules.length) {
        Swal.fire({
        icon: "error",
        title: "Sin horarios validos",
        text: "No se encontraron horarios validos",
      });
        return;
    }

    showSchedules(adaptSchedules(validSchedules));
};

// ======================================================
// 6. ADAPTADOR PARA EL VISOR (EXPANSIÓN HORA POR HORA)
// ======================================================
function adaptSchedules(validSchedules) {
    return validSchedules.map((schedule) =>
        schedule.flatMap((grupo) =>
            grupo.horarios.flatMap((h) => {
                const blocks = [];

                const hIni = parseInt(h.hora_inicio.split(":")[0], 10);
                const hFin = parseInt(h.hora_fin.split(":")[0], 10);

                for (let i = hIni; i < hFin; i++) {
                    blocks.push({
                        asignatura:
                            database.asignaturas.find((a) => a.id === grupo.asignatura_id)
                                ?.nombre || "Asignatura",
                        grupo: grupo.nombre,
                        docente: grupo.docente,
                        day: h.dia,
                        start: String(i).padStart(2, "0") + ":00",
                        end: String(i + 1).padStart(2, "0") + ":00",
                    });
                }

                return blocks;
            })
        )
    );
}
