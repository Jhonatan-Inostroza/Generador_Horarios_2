/**
 * AvatarUI.js - Control visual del área del Avatar
 */
export const AvatarUI = {
    setLoadingState(isLoading) {
        const statusText = document.querySelector('.user-info-text .user-role');
        const avatarDisplay = document.getElementById('profile-img-display');
        
        if (avatarDisplay) {
            avatarDisplay.style.opacity = isLoading ? "0.5" : "1";
        }

        if (statusText) {
            if (isLoading) {
                statusText.innerText = "Procesando imagen...";
                statusText.classList.add('loading-text');
            } else {
                statusText.innerText = "Estudiante Core";
                statusText.classList.remove('loading-text');
            }
        }
    },

    setConfirmBtn(active) {
        const btnAvatar = document.getElementById('confirm-avatar-change');
        if (!btnAvatar) return;
        
        if (active) {
            btnAvatar.innerHTML = '<i class="fa-solid fa-check"></i>';
            btnAvatar.style.background = "var(--success-green)";
            btnAvatar.classList.add('active-save'); 
            window.dispatchEvent(new CustomEvent('perfil-cambio-detectado'));
        } else {
            btnAvatar.innerHTML = '<i class="fa-solid fa-camera"></i>';
            btnAvatar.style.background = "";
            btnAvatar.classList.remove('active-save');
        }
    },

    reset() {
        this.setLoadingState(false);
        this.setConfirmBtn(false);
        const fileInput = document.getElementById('upload-photo');
        if (fileInput) {
            fileInput.dataset.pendiente = "false";
            fileInput.value = ""; 
        }
    }
};

window.resetAvatarVisuals = () => AvatarUI.reset();