
// C:\Users\Jhonatan Inostroza\Desktop\Proyectos\Generar_Horarios\Gestion_de_Acceso\JS\SessionManager.js

document.addEventListener('DOMContentLoaded', () => {
    const nodo = JSON.parse(sessionStorage.getItem('nodo_activo'));
    
    // 1. CONTROL DE ACCESO
    // Si no hay sesión y no estamos en la página de login ni registro, redirigir
    const esPaginaAcceso = window.location.pathname.includes('login') || 
                           window.location.pathname.includes('registro');

    if (!nodo && !esPaginaAcceso) {
        window.location.href = "/login"; 
        return;
    }

    // 2. ACTUALIZACIÓN DE INTERFAZ GLOBAL
    if (nodo) {
        // Rellenar el nombre en el sidebar (donde aparece en negrita)
        const globalUserDisplay = document.querySelector('.user-info-sidebar b');
        if (globalUserDisplay) {
            globalUserDisplay.innerText = nodo.usuario;
        }

        // Rellenar el ID en el perfil (si el elemento existe en el DOM actual)
        const idDisplay = document.getElementById('status-id-display');
        if (idDisplay) {
            idDisplay.innerText = `#${nodo.id}-CV`;
        }
        
        // Rellenar el Rol si existe el campo
        const roleDisplay = document.querySelector('.user-role');
        if (roleDisplay) {
            roleDisplay.innerText = nodo.rol;
        }
    }
});