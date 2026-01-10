// Crear_Horario.js
// =====================================================
// ESTE ARCHIVO ES UN ES MODULE
// =====================================================

/* =====================================================
   Loader XLSX
===================================================== */
async function cargarXLSX() {
  if (window.XLSX) return;

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  console.log('XLSX cargado correctamente');
}

/* =====================================================
   Selección de Tabs
===================================================== */
async function seleccionarTab(tipo) {

  const btnDb = document.getElementById('tab-db');
  const btnExcel = document.getElementById('tab-excel');
  const panelDb = document.getElementById('panel-db');
  const panelExcel = document.getElementById('panel-excel');

  if (!btnDb || !btnExcel || !panelDb || !panelExcel) {
    console.error('Elementos del tab no encontrados');
    return;
  }

  // =======================
  // TAB BBDD
  // =======================
  if (tipo === 'db') {
    btnDb.classList.add('active');
    btnExcel.classList.remove('active');

    panelDb.classList.remove('hidden');
    panelDb.style.display = 'block';

    panelExcel.classList.add('hidden');
    panelExcel.style.display = 'none';

    if (!panelDb.dataset.loaded) {
      try {
        const resp = await fetch(
          '/menu_opcion/Crear_Horario/Contenido_Tab/Tab_BBDD/Tab_BBDD.html'
        );
        panelDb.innerHTML = await resp.text();
        panelDb.dataset.loaded = 'true';
        console.log('Tab BBDD cargado');
      } catch (e) {
        console.error('Error cargando Tab BBDD', e);
      }
    }

    return;
  }

  // =======================
  // TAB EXCEL
  // =======================
  btnExcel.classList.add('active');
  btnDb.classList.remove('active');

  panelExcel.classList.remove('hidden');
  panelExcel.style.display = 'block';

  panelDb.classList.add('hidden');
  panelDb.style.display = 'none';

  if (!panelExcel.dataset.loaded) {
    try {
      const resp = await fetch(
        '/menu_opcion/Crear_Horario/Contenido_Tab/Tab_Excel/Tab_Excel.html'
      );
      panelExcel.innerHTML = await resp.text();
      panelExcel.dataset.loaded = 'true';

      // Asegurar XLSX
      await cargarXLSX();

      // IMPORT DINÁMICO CORRECTO
      const module = await import(
        '/menu_opcion/Crear_Horario/Contenido_Tab/Tab_Excel/Tab_Excel.js'
      );

      if (typeof module.inicializarTabExcel === 'function') {
        module.inicializarTabExcel();
      } else {
        console.error('inicializarTabExcel no exportado');
      }

      console.log('Tab Excel cargado');

    } catch (e) {
      console.error('Error cargando Tab Excel', e);
    }
  }
}

/* =====================================================
   EXPONER FUNCIÓN AL HTML (CLAVE)
===================================================== */
window.seleccionarTab = seleccionarTab;
