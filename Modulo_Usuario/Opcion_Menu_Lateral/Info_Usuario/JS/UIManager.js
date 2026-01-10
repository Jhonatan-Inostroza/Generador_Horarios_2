import { safeTextNodo } from './utils.js';

export function initUIManager() {
    document.querySelectorAll('.edit-trigger').forEach(btn => {
        btn.onclick = (e) => {
            const group = e.target.closest('.edit-group');
            if (!group) return;
            group.classList.add('editing');
            
            const inputs = group.querySelectorAll('.neon-input, input, select');
            inputs.forEach(input => {
                input.removeAttribute('readonly');
                input.removeAttribute('disabled');
            });
            if (inputs[0]) inputs[0].focus();
        };
    });

    document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.onclick = (e) => {
            const group = e.target.closest('.edit-group');
            if (!group) return;
            group.classList.remove('editing');
            
            const statusLabel = group.querySelector('.status-label');
            if (statusLabel) {
                statusLabel.innerText = "Guardado";
                statusLabel.classList.remove('pending-anim');
                statusLabel.style.color = "";
            }

            group.querySelectorAll('.neon-input, input, select').forEach(input => {
                input.setAttribute('readonly', true);
                if (input.tagName === 'SELECT') input.setAttribute('disabled', true);
                restaurarValorOriginal(input);
            });
        };
    });

    document.querySelectorAll('.btn-confirm').forEach(btn => {
        btn.onclick = (e) => {
            const group = e.target.closest('.edit-group');
            if (!group || group.id === "section-avatar") return;

            const inputs = group.querySelectorAll('.neon-input, input, select');
            const statusLabel = group.querySelector('.status-label');
            let huboCambio = false;

            inputs.forEach(i => { if (verificarCambio(i)) huboCambio = true; });

            if (huboCambio) {
                if (statusLabel) {
                    statusLabel.innerText = "PENDIENTE";
                    statusLabel.classList.add('pending-anim');
                    statusLabel.style.color = "var(--warning-orange)";
                }
                window.dispatchEvent(new CustomEvent('perfil-cambio-detectado'));
            }

            group.classList.remove('editing');
            inputs.forEach(i => {
                i.setAttribute('readonly', true);
                if (i.tagName === 'SELECT') i.setAttribute('disabled', true);
            });
        };
    });
}

function verificarCambio(input) {
    const raw = sessionStorage.getItem('nodo_activo');
    const nodo = raw ? JSON.parse(raw) : {};
    
    const mapa = {
        'select-vista': nodo.ui_config?.vista_horario || "calendario",
        'select-hora': nodo.ui_config?.formato_hora || "12",
        'input-real-name': safeTextNodo(nodo.nombres),
        'input-real-surname': safeTextNodo(nodo.apellidos),
        'display-name-input': safeTextNodo(nodo.usuario),
        'select-disponibilidad': nodo.disponibilidad || "activo"
    };

    if (input.type === 'password') return input.value.length > 0;
    return input.value.trim() !== String(mapa[input.id] || "").trim();
}

function restaurarValorOriginal(input) {
    const raw = sessionStorage.getItem('nodo_activo');
    const nodo = raw ? JSON.parse(raw) : {};
    const mapa = {
        'select-vista': nodo.ui_config?.vista_horario || "calendario",
        'select-hora': nodo.ui_config?.formato_hora || "12",
        'input-real-name': safeTextNodo(nodo.nombres),
        'input-real-surname': safeTextNodo(nodo.apellidos),
        'display-name-input': safeTextNodo(nodo.usuario),
        'select-disponibilidad': nodo.disponibilidad || "activo"
    };
    if (input.type !== 'password') input.value = mapa[input.id] || "";
}
