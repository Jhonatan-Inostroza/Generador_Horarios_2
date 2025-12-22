// main.js
import './excelScheduler.js';

const tabDb = document.getElementById('tab-db');
const tabExcel = document.getElementById('tab-excel');
const contentDb = document.getElementById('tab-content-db');
const contentExcel = document.getElementById('tab-content-excel');

tabDb.onclick = async () => {
    // Tabs visuales
    tabDb.classList.add('active');
    tabExcel.classList.remove('active');

    contentDb.classList.remove('hidden');
    contentExcel.classList.add('hidden');

    // Cargar HTML de DB solo una vez
    if (!contentDb.dataset.loaded) {
        const res = await fetch('/generador/UsandoBBDD/db.html');
        contentDb.innerHTML = await res.text();
        contentDb.dataset.loaded = 'true';

        // 🔥 IMPORTAR MÓDULO SOLO CUANDO EL HTML YA EXISTE
        await import('/generador/UsandoBBDD/dbScheduler.js');
    }
};

tabExcel.onclick = () => {
    tabExcel.classList.add('active');
    tabDb.classList.remove('active');

    contentExcel.classList.remove('hidden');
    contentDb.classList.add('hidden');
};
