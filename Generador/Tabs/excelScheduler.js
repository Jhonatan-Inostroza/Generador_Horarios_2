// excelScheduler.js
import {
  generateSchedules,
  hasTimeConflict,
} from "/generador/core/scheduleCore.js";

import { showSchedules } from "/generador/UsandoBBDD/dbScheduleViewer.js";

// ==========================
// ESTADO
// ==========================
const database = {
  asignaturas: [],
  grupos: [],
};

let selected = {};

// ==========================
// INIT (CLAVE)
// ==========================
export function initExcelScheduler() {
  const fileInput = document.getElementById("excel-file-input");
  const fileNameBox = document.getElementById("excel-file-name");
  const fileNameText = document.getElementById("excel-file-text");

  fileInput.onchange = () => {
    if (fileInput.files.length) {
      fileNameText.textContent = fileInput.files[0].name;
      fileNameBox.classList.remove("hidden");
    } else {
      fileNameBox.classList.add("hidden");
    }
  };
  const btnUpload = document.getElementById("btn-upload-excel");
  const asignaturasList = document.getElementById("asignaturas-list-excel");
  const stepAsignaturas = document.getElementById(
    "step-select-asignaturas-excel"
  );
  const btnGenerate = document.getElementById("btn-generate-excel");

  if (!fileInput || !btnUpload || !btnGenerate) {
    console.warn("Excel DOM aún no está listo");
    return;
  }

  btnUpload.onclick = () => {
    if (!fileInput.files.length) {
      Swal.fire({
        icon: "warning",
        title: "Archivo requerido",
        text: "Seleccione un archivo Excel para continuar",
      });
      return;
    }

    resetState();
    // Swal.fire({
    //   title: "Procesando Excel...",
    //   text: "Por favor espere",
    //   allowOutsideClick: false,
    //   didOpen: () => Swal.showLoading(),
    // });
    processExcel(fileInput.files[0]);
  };

  btnGenerate.onclick = () => {
    const groupsPerSubject = buildGroupsPerSubject();

    if (!groupsPerSubject.length) {
      Swal.fire({
        icon: "info",
        title: "Selección requerida",
        text: "Debe seleccionar al menos una asignatura",
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
        title: "Sin resultados",
        text: "No se encontraron horarios compatibles",
      });
      return;
    }

    const adapted = validSchedules.map(adaptScheduleForViewer);
    showSchedules(adapted);
  };

  // ==========================
  function resetState() {
    database.asignaturas = [];
    database.grupos = [];
    selected = {};
    asignaturasList.innerHTML = "";
    stepAsignaturas.classList.add("hidden");
    btnGenerate.classList.add("hidden");
  }

  function processExcel(file) {
    function parseTime(v) {
      if (typeof v === "string") return v;
      if (typeof v === "number") {
        const t = Math.round(v * 24 * 60);
        const h = Math.floor(t / 60);
        const m = t % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      }
      return "00:00";
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });

      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      rows.forEach((r) => {
        let asignatura = database.asignaturas.find(
          (a) => a.nombre === r.ASIGNATURA
        );

        if (!asignatura) {
          asignatura = {
            id: database.asignaturas.length + 1,
            nombre: r.ASIGNATURA,
          };
          database.asignaturas.push(asignatura);
          selected[asignatura.id] = { activo: false, grupos: [] };
        }

        let grupo = database.grupos.find(
          (g) =>
            g.nombre === r["GRUPO HORARIO"] && g.asignatura_id === asignatura.id
        );

        if (!grupo) {
          grupo = {
            id: database.grupos.length + 1,
            nombre: r["GRUPO HORARIO"],
            docente: r.DOCENTE,
            asignatura_id: asignatura.id,
            horarios: [],
          };
          database.grupos.push(grupo);
        }

        grupo.horarios.push({
          dia: normalizeDay(r.DÍA),
          hora_inicio: parseTime(r["HORA INICIO"]),
          hora_fin: parseTime(r["HORA FIN"]),
        });
      });

      renderAsignaturas();
      stepAsignaturas.classList.remove("hidden");
    };

    reader.readAsArrayBuffer(file);
  }

  function renderAsignaturas() {
    asignaturasList.innerHTML = "";

    database.asignaturas.forEach((a) => {
      // ================= ASIGNATURA CARD =================
      const card = document.createElement("div");
      card.className =
        "bg-white rounded-2xl border shadow-sm p-5 space-y-4 transition";

      // HEADER
      const header = document.createElement("div");
      header.className = "flex items-center justify-between";

      const title = document.createElement("div");
      title.className = "flex items-center gap-3";

      const icon = document.createElement("i");
      icon.className = "fa-solid fa-book text-indigo-600";

      const name = document.createElement("span");
      name.className = "font-bold text-gray-800 text-lg";
      name.textContent = a.nombre;

      title.append(icon, name);

      // CHECK ASIGNATURA
      const aCb = document.createElement("input");
      aCb.type = "checkbox";
      aCb.className = "w-5 h-5 accent-indigo-600 cursor-pointer";

      aCb.onchange = () => {
        selected[a.id].activo = aCb.checked;
        gruposGrid.classList.toggle("hidden", !aCb.checked);
        card.classList.toggle("ring-2", aCb.checked);
        card.classList.toggle("ring-indigo-500", aCb.checked);
        updateGenerateButton();
      };

      header.append(title, aCb);
      card.appendChild(header);

      // ================= GRUPOS GRID =================
      const gruposGrid = document.createElement("div");
      gruposGrid.className =
        "hidden grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3";

      database.grupos
        .filter((g) => g.asignatura_id === a.id)
        .forEach((g) => {
          const gCard = document.createElement("div");
          gCard.className =
            "group cursor-pointer border rounded-xl p-4 transition hover:shadow-md";

          const gCb = document.createElement("input");
          gCb.type = "checkbox";
          gCb.className = "hidden";

          gCb.onchange = () => {
            if (gCb.checked) {
              selected[a.id].grupos.push(g.id);
              gCard.classList.add(
                "bg-indigo-50",
                "border-indigo-500",
                "ring-1",
                "ring-indigo-400"
              );
            } else {
              selected[a.id].grupos = selected[a.id].grupos.filter(
                (id) => id !== g.id
              );
              gCard.classList.remove(
                "bg-indigo-50",
                "border-indigo-500",
                "ring-1",
                "ring-indigo-400"
              );
            }
          };

          gCard.onclick = () => {
            gCb.checked = !gCb.checked;
            gCb.dispatchEvent(new Event("change"));
          };

          const horariosHTML = g.horarios
            .map(
              (h) => `
      <div class="flex items-center gap-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg">
        <i class="fa-solid fa-calendar-days"></i>
        <span class="font-semibold">${h.dia}</span>
        <span>${h.hora_inicio} - ${h.hora_fin}</span>
      </div>
    `
            )
            .join("");

          gCard.innerHTML = `
  <div class="space-y-3">
    <div class="flex items-start gap-3">
      <i class="fa-solid fa-users text-indigo-500 mt-1"></i>
      <div>
        <div class="font-semibold text-gray-800">
          Grupo ${g.nombre}
        </div>
        <div class="text-sm text-gray-600">
          ${g.docente}
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 pl-7">
      ${horariosHTML}
    </div>
  </div>
`;

          gCard.appendChild(gCb);
          gruposGrid.appendChild(gCard);
        });

      card.appendChild(gruposGrid);
      asignaturasList.appendChild(card);
    });
  }

  function updateGenerateButton() {
    btnGenerate.classList.toggle(
      "hidden",
      !Object.values(selected).some((v) => v.activo)
    );
  }

  function buildGroupsPerSubject() {
    return Object.entries(selected)
      .filter(([_, v]) => v.activo)
      .map(([id, v]) =>
        v.grupos.length
          ? database.grupos.filter((g) => v.grupos.includes(g.id))
          : database.grupos.filter((g) => g.asignatura_id === +id)
      );
  }

  function adaptScheduleForViewer(schedule) {
    const blocks = [];

    schedule.forEach((grupo) => {
      const asignatura = database.asignaturas.find(
        (a) => a.id === grupo.asignatura_id
      );

      grupo.horarios.forEach((h) => {
        let [startH, startM] = h.hora_inicio.split(":").map(Number);
        let [endH, endM] = h.hora_fin.split(":").map(Number);

        let startTotal = startH + (startM > 0 ? 1 : 0); // si empieza en media hora, cuenta desde la siguiente hora
        const endTotal = endH + (endM > 0 ? 1 : 0);

        for (let hour = startH; hour < endH; hour++) {
          const startStr = `${String(hour).padStart(2, "0")}:00`;
          const endStr = `${String(hour + 1).padStart(2, "0")}:00`;

          blocks.push({
            asignatura: asignatura.nombre,
            grupo: grupo.nombre,
            docente: grupo.docente,
            day: h.dia,
            start: startStr,
            end: endStr,
          });
        }
      });
    });

    return blocks;
  }

  function normalizeDay(d) {
    return d
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
}
