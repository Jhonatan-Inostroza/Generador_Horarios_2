// Tabs/main.js
document.addEventListener('DOMContentLoaded', async () => {

    // =========================
    // CARGAR MODAL GLOBAL (UNA SOLA VEZ)
    // =========================
    await import('/generador/ModalHorario/modalHorario.js');

    const tabDb = document.getElementById('tab-db');
    const tabExcel = document.getElementById('tab-excel');

    const contentDb = document.getElementById('tab-content-db');
    const contentExcel = document.getElementById('tab-content-excel');

    // =========================
    // TAB DB
    // =========================
    tabDb.onclick = async () => {

        tabDb.classList.add('active');
        tabExcel.classList.remove('active');

        contentDb.classList.remove('hidden');
        contentExcel.classList.add('hidden');

        if (!contentDb.dataset.loaded) {
            const res = await fetch('/generador/UsandoBBDD/db.html');
            contentDb.innerHTML = await res.text();
            contentDb.dataset.loaded = 'true';

            await import('/generador/UsandoBBDD/dbScheduler.js');
        }
    };

    // =========================
    // TAB EXCEL
    // =========================
    tabExcel.onclick = async () => {

        tabExcel.classList.add('active');
        tabDb.classList.remove('active');

        contentExcel.classList.remove('hidden');
        contentDb.classList.add('hidden');

        if (!contentExcel.dataset.loaded) {
            const mod = await import('/generador/Tabs/excelScheduler.js');
            mod.initExcelScheduler();
            contentExcel.dataset.loaded = 'true';
        }
    };
});
