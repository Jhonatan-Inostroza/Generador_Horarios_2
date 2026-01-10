/**
 * SecurityManager.js - Gestión de Acceso y Credenciales
 */
export function initSecurityManager(nodoInicial) {
    let nodoRef = nodoInicial;

    const btnUser = document.getElementById('confirm-user-change');
    const btnPass = document.getElementById('confirm-pass-change');

    const inputUsername = document.getElementById('display-name-input');
    const p1 = document.getElementById('pass-nueva');
    const p2 = document.getElementById('pass-confirmar');
    const errorMsg = document.getElementById('pass-error');

    const updateLabel = (btn, text, isPending = false) => {
        const group = btn.closest('.edit-group');
        const label = group?.querySelector('.status-label');
        if (!label) return;
        label.innerText = text;
        if (isPending) {
            label.classList.add('pending-anim');
            label.style.color = "var(--warning-orange)";
        } else {
            label.classList.remove('pending-anim');
            label.style.color = "";
        }
    };

    const setBtnState = (btn, active) => {
        if (!btn) return;
        btn.style.pointerEvents = active ? "auto" : "none";
        btn.style.opacity = active ? "1" : "0.3";
    };

    // --- VISIBILIDAD DE PASSWORD ---
    document.querySelectorAll('.toggle-pass').forEach(icon => {
        icon.onclick = function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            const isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            this.classList.toggle('fa-eye', !isPass);
            this.classList.toggle('fa-eye-slash', isPass);
        };
    });

    // --- VALIDACIÓN USUARIO ---
    inputUsername?.addEventListener('input', () => {
        const valorActual = inputUsername.value.trim();
        const valorOriginal = (nodoRef.usuario || "").trim();
        setBtnState(btnUser, (valorActual !== valorOriginal && valorActual !== ""));
    });

    // --- VALIDACIÓN PASSWORD ---
    const validarPass = () => {
        if(!p1 || !p2) return;
        const v1 = p1.value;
        const v2 = p2.value;
        const coinciden = (v1 === v2 && v1 !== "");
        const largoOk = v1.length >= 8;

        if (v2.length > 0) {
            errorMsg.style.display = "flex";
            if (!coinciden) {
                errorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> No coinciden';
                setBtnState(btnPass, false);
            } else if (!largoOk) {
                errorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Mínimo 8 caracteres';
                setBtnState(btnPass, false);
            } else {
                errorMsg.style.display = "none";
                setBtnState(btnPass, true);
            }
        } else {
            errorMsg.style.display = "none";
            setBtnState(btnPass, false);
        }
    };
    p1?.addEventListener('input', validarPass);
    p2?.addEventListener('input', validarPass);

    // --- CONFIRMACIÓN LOCAL (CHECK) ---
    [btnUser, btnPass].forEach(btn => {
        if (!btn) return;
        btn.onclick = () => {
            const group = btn.closest('.edit-group');
            // Cerramos modo edición
            group?.classList.remove('editing');
            // Bloqueamos inputs del grupo
            group?.querySelectorAll('input').forEach(i => i.setAttribute('readonly', true));
            
            updateLabel(btn, "PENDIENTE", true);
            window.dispatchEvent(new CustomEvent('perfil-cambio-detectado'));
        };
    });

    window.resetSecurityVisuals = (nuevoNodo) => {
        nodoRef = nuevoNodo;
        [btnUser, btnPass].forEach(btn => {
            if (!btn) return;
            updateLabel(btn, "GUARDADO", false);
            setBtnState(btn, false);
        });
        if(p1) p1.value = "";
        if(p2) p2.value = "";
    };
}