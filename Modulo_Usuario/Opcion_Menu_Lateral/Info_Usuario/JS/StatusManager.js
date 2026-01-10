/**
 * StatusManager.js - Gestión de Disponibilidad de Red
 */
import { safeTextNodo } from './utils.js';

export function initStatusManager() {
    const btnStatus = document.getElementById('confirm-status');
    const selectDisp = document.getElementById('select-disponibilidad');
    
    const getStatusLabel = () => btnStatus?.closest('.edit-group')?.querySelector('.status-label');

    if (!btnStatus || !selectDisp) return;

    selectDisp.addEventListener('change', () => {
        const raw = sessionStorage.getItem('nodo_activo');
        const nodo = raw ? JSON.parse(raw) : {};
        const estadoOriginal = safeTextNodo(nodo.disponibilidad, "activo");

        const haCambiado = selectDisp.value !== estadoOriginal;
        const label = getStatusLabel();

        if (haCambiado) {
            btnStatus.style.pointerEvents = "auto";
            btnStatus.style.opacity = "1";
            btnStatus.style.background = "var(--success-green)";
            btnStatus.style.color = "white";
        } else {
            btnStatus.style.pointerEvents = "none";
            btnStatus.style.opacity = "0.4";
            btnStatus.style.background = "";
            btnStatus.style.color = "";
        }
    });

    btnStatus.onclick = (e) => {
        const group = btnStatus.closest('.edit-group');
        const label = getStatusLabel();
        
        if (group && group.classList.contains('editing')) {
            e.preventDefault();
            group.classList.remove('editing');
            selectDisp.setAttribute('disabled', true);
            
            if (label) {
                label.innerText = "PENDIENTE";
                label.classList.add('pending-anim'); 
                label.style.color = "var(--warning-orange)";
            }
            
            window.dispatchEvent(new CustomEvent('perfil-cambio-detectado'));
        }
    };

    window.resetStatusVisuals = () => {
        const raw = sessionStorage.getItem('nodo_activo');
        const nodo = raw ? JSON.parse(raw) : {};
        const label = getStatusLabel();
        
        selectDisp.value = safeTextNodo(nodo.disponibilidad, "activo");
        selectDisp.setAttribute('disabled', true);

        btnStatus.innerHTML = '<i class="fa-solid fa-check"></i>';
        btnStatus.style.opacity = "0.4";
        btnStatus.style.pointerEvents = "none";
        btnStatus.style.background = "";

        if (label) {
            label.innerText = "GUARDADO";
            label.classList.remove('pending-anim');
            label.style.color = "";
        }
    };

    btnStatus.style.opacity = "0.4";
    btnStatus.style.pointerEvents = "none";
}
