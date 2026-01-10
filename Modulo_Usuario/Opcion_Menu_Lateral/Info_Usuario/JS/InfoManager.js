/**
 * InfoManager.js - Gestión de Nombres y Apellidos (Validación Local)
 */
import { safeTextNodo } from './utils.js';

export function initInfoManager(nodoInicial) {
    let nodoRef = nodoInicial;

    const group = document.getElementById('section-identity'); 
    const btnConfirm = document.getElementById('confirm-real-name');
    const inputNombre = document.getElementById('input-real-name');
    const inputApellido = document.getElementById('input-real-surname');
    const statusLabel = btnConfirm?.closest('.edit-group')?.querySelector('.status-label');

    if (!inputNombre || !inputApellido || !btnConfirm) return;

    const validarCambios = () => {
        const nActual = inputNombre.value.trim();
        const aActual = inputApellido.value.trim();
        const nOriginal = safeTextNodo(nodoRef.nombres);
        const aOriginal = safeTextNodo(nodoRef.apellidos);

        const haCambiado = (nActual !== nOriginal || aActual !== aOriginal);
        const estanLlenos = nActual !== "" && aActual !== "";

        if (haCambiado && estanLlenos) {
            btnConfirm.style.opacity = "1";
            btnConfirm.style.pointerEvents = "auto";
        } else {
            btnConfirm.style.opacity = "0.3";
            btnConfirm.style.pointerEvents = "none";
        }
    };

    inputNombre.addEventListener('input', validarCambios);
    inputApellido.addEventListener('input', validarCambios);

    btnConfirm.onclick = () => {
        if (statusLabel) {
            statusLabel.innerText = "PENDIENTE";
            statusLabel.classList.add('pending-anim');
            statusLabel.style.color = "var(--warning-orange)";
        }

        const parentGroup = btnConfirm.closest('.edit-group');
        if (parentGroup) parentGroup.classList.remove('editing');

        inputNombre.setAttribute('readonly', true);
        inputApellido.setAttribute('readonly', true);

        window.dispatchEvent(new CustomEvent('perfil-cambio-detectado'));
    };

    window.resetInfoVisuals = (nuevoNodo) => {
        nodoRef = nuevoNodo;
        inputNombre.value = safeTextNodo(nuevoNodo.nombres);
        inputApellido.value = safeTextNodo(nuevoNodo.apellidos);
        
        if (statusLabel) {
            statusLabel.innerText = "GUARDADO";
            statusLabel.classList.remove('pending-anim');
            statusLabel.style.color = "";
        }
        btnConfirm.style.opacity = "0.3";
        btnConfirm.style.pointerEvents = "none";
    };
}
