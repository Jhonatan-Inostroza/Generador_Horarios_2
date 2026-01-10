/**
 * InfoManager.js - Gestión de Nombres y Apellidos (Validación Local)
 */
export function initInfoManager(nodoInicial) {
    let nodoRef = nodoInicial;

    const group = document.getElementById('section-identity'); // El contenedor principal
    const btnConfirm = document.getElementById('confirm-real-name');
    const inputNombre = document.getElementById('input-real-name');
    const inputApellido = document.getElementById('input-real-surname');
    const statusLabel = btnConfirm?.closest('.edit-group')?.querySelector('.status-label');

    if (!inputNombre || !inputApellido || !btnConfirm) return;

    const validarCambios = () => {
        const nActual = inputNombre.value.trim();
        const aActual = inputApellido.value.trim();
        const nOriginal = (nodoRef.nombres || "").trim();
        const aOriginal = (nodoRef.apellidos || "").trim();

        const haCambiado = (nActual !== nOriginal || aActual !== aOriginal);
        const estanLlenos = nActual !== "" && aActual !== "";

        // Habilitar/Deshabilitar el check verde según si hay cambios reales
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

    // Al presionar el CHECK VERDE: Confirmamos el cambio solo en la interfaz
    btnConfirm.onclick = () => {
        // 1. Cambiamos el texto de estado a Naranja (Pendiente)
        if (statusLabel) {
            statusLabel.innerText = "PENDIENTE";
            statusLabel.classList.add('pending-anim');
            statusLabel.style.color = "var(--warning-orange)";
        }

        // 2. Cerramos el modo edición (remover clase editing)
        const parentGroup = btnConfirm.closest('.edit-group');
        if (parentGroup) parentGroup.classList.remove('editing');

        // 3. Volvemos a poner los inputs en ReadOnly
        inputNombre.setAttribute('readonly', true);
        inputApellido.setAttribute('readonly', true);

        // 4. Avisamos al Perfil.js que debe mostrar el BOTÓN GLOBAL
        window.dispatchEvent(new CustomEvent('perfil-cambio-detectado'));
    };

    // Esta función la llamará Perfil.js cuando el FETCH sea exitoso
    window.resetInfoVisuals = (nuevoNodo) => {
        nodoRef = nuevoNodo;
        inputNombre.value = nuevoNodo.nombres || "";
        inputApellido.value = nuevoNodo.apellidos || "";
        
        if (statusLabel) {
            statusLabel.innerText = "GUARDADO";
            statusLabel.classList.remove('pending-anim');
            statusLabel.style.color = "";
        }
        btnConfirm.style.opacity = "0.3";
        btnConfirm.style.pointerEvents = "none";
    };
}