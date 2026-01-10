/**
 * AvatarManager.js - Gestión de Imagen con Auto-Compresión
 */
import { AvatarUI } from './AvatarUI.js';
import { safeTextNodo } from './utils.js'; // Asegura que todo sea string

export function initAvatarManager(nodoInicial) {
    const fileInput = document.getElementById('upload-photo');
    const cameraBtn = document.getElementById('confirm-avatar-change'); 
    let nodoActivo = nodoInicial;

    if (!fileInput) return;

    renderAvatar(nodoActivo);

    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        
        reader.onloadstart = () => AvatarUI.setLoadingState(true);

        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;

            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 400;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                
                renderAvatar({ ...nodoActivo, foto: optimizedBase64 });
                
                fileInput.dataset.base64 = optimizedBase64;
                fileInput.dataset.pendiente = "true";
                
                AvatarUI.setLoadingState(false);
                AvatarUI.setConfirmBtn(true);

                const sectionLabel = cameraBtn?.closest('.edit-group')?.querySelector('.status-label');
                if (sectionLabel) {
                    sectionLabel.innerText = "PENDIENTE";
                    sectionLabel.classList.add('pending-anim');
                    sectionLabel.style.color = "var(--warning-orange)";
                }
            };
        };

        reader.readAsDataURL(file);
    };

    if (cameraBtn) {
        cameraBtn.onclick = () => {
            if (fileInput.dataset.pendiente === "true") {
                AvatarUI.setConfirmBtn(false); 
            }
        };
    }
}

export function renderAvatar(nodo) {
    const avatarDiv = document.getElementById('profile-img-display');
    if (!avatarDiv) return;

    avatarDiv.innerHTML = ""; 

    if (nodo.foto && nodo.foto.length > 50) {
        const img = document.createElement('img');
        img.src = nodo.foto;
        img.alt = "Avatar";
        avatarDiv.appendChild(img);
        return;
    }

    const textElement = document.createElement('b'); 
    let letras = "??";

    const nom = safeTextNodo(nodo.nombres);
    const ape = safeTextNodo(nodo.apellidos);
    const usuario = safeTextNodo(nodo.usuario);

    if (nom !== "") {
        letras = nom.charAt(0) + (ape !== "" ? ape.charAt(0) : "");
    } else if (usuario !== "") {
        letras = usuario.substring(0, 2);
    }

    textElement.innerText = letras.toUpperCase();
    avatarDiv.appendChild(textElement);
}
