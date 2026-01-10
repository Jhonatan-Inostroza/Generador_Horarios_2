/**
 * Perfil.js - Orquestador Central (Cerebro Atómico)
 */
import { initSecurityManager } from './SecurityManager.js';
import { initStatusManager } from './StatusManager.js';
import { initUIManager } from './UIManager.js';
import { initAvatarManager, renderAvatar } from './AvatarManager.js';

export function cargarDatosPerfil() {
    const raw = sessionStorage.getItem('nodo_activo');
    if (!raw || raw === "undefined") return;
    
    const nodo = JSON.parse(raw);
    const elements = {
        nombre: document.getElementById('input-real-name'),
        apellido: document.getElementById('input-real-surname'),
        usuario: document.getElementById('display-name-input'),
        meta: document.getElementById('input-user-bio'),
        fullName: document.getElementById('display-full-name'),
        dispo: document.getElementById('select-disponibilidad'),
        idDisplay: document.getElementById('status-id-display')
    };

    if (elements.nombre) elements.nombre.value = nodo.nombres || "";
    if (elements.apellido) elements.apellido.value = nodo.apellidos || "";
    if (elements.usuario) elements.usuario.value = nodo.usuario || "";
    if (elements.meta) elements.meta.value = nodo.meta || "";
    
    if (elements.fullName) {
        const full = `${nodo.nombres || ''} ${nodo.apellidos || ''}`.trim();
        elements.fullName.textContent = full || nodo.usuario || "Usuario";
    }

    if (elements.dispo) elements.dispo.value = nodo.disponibilidad || "activo";

    if (elements.idDisplay) {
        const numId = nodo.usuario_id || nodo.id || 0;
        elements.idDisplay.textContent = `#${String(numId).padStart(4, '0')}-CV`;
    }
}

window.inicializarEventosPerfil = function() {
    let nodo = null;
    try {
        nodo = JSON.parse(sessionStorage.getItem('nodo_activo'));
    } catch (e) { return; }

    const mainBtn = document.getElementById('main-save-btn');

    const verificarVisibilidadBotonGeneral = () => {
        if (!mainBtn) return;
        const hayEdicionesLocales = document.querySelector('.status-label.pending-anim') !== null;
        const fotoPendiente = document.getElementById('upload-photo')?.dataset.pendiente === "true";

        (hayEdicionesLocales || fotoPendiente) 
            ? mainBtn.classList.add('visible') 
            : mainBtn.classList.remove('visible');
    };

    // Inicializar todos los managers pasando el nodo fresco
    initAvatarManager(nodo); 
    initSecurityManager(nodo);
    initStatusManager();
    initUIManager();
    cargarDatosPerfil();

    window.addEventListener('perfil-cambio-detectado', verificarVisibilidadBotonGeneral);

    if (mainBtn) {
        mainBtn.onclick = async () => {
            const btnOriginalHtml = mainBtn.innerHTML;
            mainBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sincronizando...';
            mainBtn.disabled = true;

            // FILTRO ATÓMICO: Solo ID + Cambios
            const data = { id: nodo.id || nodo.usuario_id }; 

            const inputs = {
                nombre: document.getElementById('input-real-name')?.value.trim(),
                apellido: document.getElementById('input-real-surname')?.value.trim(),
                usuario: document.getElementById('display-name-input')?.value.trim(),
                meta: document.getElementById('input-user-bio')?.value.trim(),
                dispo: document.getElementById('select-disponibilidad')?.value,
                pass: document.getElementById('pass-nueva')?.value
            };

            if (inputs.nombre !== (nodo.nombres || "")) data.nombre = inputs.nombre;
            if (inputs.apellido !== (nodo.apellidos || "")) data.apellido = inputs.apellido;
            if (inputs.usuario !== (nodo.usuario || "")) data.nuevo_usuario = inputs.usuario;
            if (inputs.meta !== (nodo.meta || "")) data.meta = inputs.meta;
            if (inputs.dispo !== (nodo.disponibilidad || "activo")) data.disponibilidad = inputs.dispo;
            if (inputs.pass && inputs.pass.length >= 8) data.password = inputs.pass;

            // FOTO: Captura del Base64 optimizado directamente desde el dataset
            const photoInput = document.getElementById('upload-photo');
            if (photoInput?.dataset.pendiente === "true") {
                // Usamos la versión comprimida que guardamos en AvatarManager
                if (photoInput.dataset.base64) {
                    data.foto = photoInput.dataset.base64;
                } else {
                    // Backup por si acaso: leer del elemento visual
                    const imgPreview = document.querySelector('#profile-img-display img');
                    if (imgPreview) data.foto = imgPreview.src;
                }
            }
            // Validar si hay algo que enviar (más allá del ID)
            if (Object.keys(data).length <= 1) {
                mainBtn.classList.remove('visible');
                mainBtn.disabled = false;
                mainBtn.innerHTML = btnOriginalHtml;
                return;
            }

            try {
                const response = await fetch('/actualizar_perfil', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const res = await response.json();

                if (res.status === 'success') {
                    sessionStorage.setItem('nodo_activo', JSON.stringify(res.nodo));
                    nodo = res.nodo; 

                    cargarDatosPerfil();
                    renderAvatar(nodo); 
                    
                    // Reset visual de estados
                    document.querySelectorAll('.status-label').forEach(label => {
                        label.innerText = "GUARDADO";
                        label.classList.remove('pending-anim');
                        label.style.color = "";
                    });

                    if(photoInput) photoInput.dataset.pendiente = "false";

                    mainBtn.innerHTML = '<i class="fa-solid fa-check"></i> Sincronizado';
                    mainBtn.style.background = "var(--success-green)";
                    
                    setTimeout(() => {
                        mainBtn.classList.remove('visible');
                        mainBtn.innerHTML = btnOriginalHtml;
                        mainBtn.style.background = "";
                        mainBtn.disabled = false;
                    }, 2000);

                    // Sincronizar otros componentes (Barras laterales, etc)
                    window.dispatchEvent(new CustomEvent('meta-global-update'));
                }
            } catch (err) {
                mainBtn.innerHTML = '<i class="fa-solid fa-x"></i> Error';
                mainBtn.style.background = "var(--error-red)";
                setTimeout(() => {
                    mainBtn.disabled = false;
                    mainBtn.innerHTML = btnOriginalHtml;
                }, 3000);
            }
        };
    }
};