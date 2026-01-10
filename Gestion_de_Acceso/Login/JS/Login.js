// C:\Users\Jhonatan Inostroza\Desktop\Proyectos\Generar_Horarios\Gestion_de_Acceso\Login\JS\Login.js
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const rolURL = params.get('rol'); 
    const errorMsg = params.get('error');

    // Elementos UI
    const titleElement = document.getElementById('login-title');
    const subtitleElement = document.getElementById('login-subtitle');
    const rolInputHidden = document.getElementById('rol_hidden');
    const userInputContainer = document.getElementById('user-input-container');
    const usuarioField = document.getElementById('usuario_field');
    const passwordField = document.getElementById('password_field');
    const linkRegistro = document.getElementById('link-registro');
    
    // Elementos de Perfil (Avatar/Facebook Mode)
    const rememberedProfile = document.getElementById('remembered-profile');
    const welcomeName = document.getElementById('user-welcome-name');
    const userAvatarGlow = document.querySelector('.user-avatar-glow');
    const changeAccountBtn = document.getElementById('change-account');

    // Elementos de Control de Formulario (Móvil)
    const trigger = document.getElementById('mobileTrigger');
    const formSide = document.getElementById('formSide');
    const closeBtn = document.getElementById('closeForm');

    // --- FUNCIÓN: Lógica de Iniciales ---
    function obtenerIniciales(data, backupUser) {
        const n = (data.nombres || "").trim();
        const a = (data.apellidos || "").trim();
        if (n && a) return (n[0] + a[0]).toUpperCase(); 
        if (n) return n.substring(0, 2).toUpperCase(); 
        if (a) return a.substring(0, 2).toUpperCase(); 
        return (backupUser || "??").substring(0, 2).toUpperCase();
    }

    // --- FUNCIÓN: Activar Modo Avatar ---
    function activarModoAvatar(data, username) {
        userInputContainer.classList.add('hidden-profile');
        titleElement.style.display = 'none';
        rememberedProfile.style.display = 'block';
        welcomeName.innerText = `¿Es tu cuenta, ${data.nombres || username}?`;
        
        if (data.foto) {
            userAvatarGlow.innerHTML = `<img src="${data.foto}" alt="Profile" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        } else {
            const iniciales = obtenerIniciales(data, username);
            userAvatarGlow.innerHTML = `<span id="user-initial">${iniciales}</span>`;
        }
        
        subtitleElement.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Identidad reconocida. Ingrese clave.`;
        subtitleElement.style.color = "var(--neon)";
        usuarioField.value = username;
        passwordField.focus(); 
        
        localStorage.setItem('last_user', username);
        localStorage.setItem('user_profile', JSON.stringify(data));
    }

    // 1. CARGA INICIAL
    const savedUser = localStorage.getItem('last_user');
    const profileData = JSON.parse(localStorage.getItem('user_profile') || '{}');
    if (savedUser && profileData.existe !== false) {
        activarModoAvatar(profileData, savedUser);
    }

    // 2. VERIFICACIÓN REALTIME
    usuarioField.addEventListener('blur', async () => {
        const usuario = usuarioField.value.trim();
        if (usuario.length >= 3 && rememberedProfile.style.display !== 'block') {
            try {
                const response = await fetch(`/verificar_usuario_realtime?usuario=${usuario}`);
                const data = await response.json();
                // // 🔍 PON ESTO AQUÍ
                // console.log("DATA COMPLETA:", data);
                // console.log("DEBUG nombres:", data.nombres, typeof data.nombres);
                // console.log("DEBUG apellidos:", data.apellidos, typeof data.apellidos);
                // console.log("DEBUG usuario:", data.usuario, typeof data.usuario);
                if (data.existe) activarModoAvatar(data, usuario);
            } catch (e) { console.error("Error al conectar con la base de datos."); }
        }
    });

    // 3. CONTROL DE ROLES
    if (rolURL) {
        rolInputHidden.value = rolURL;
        titleElement.innerText = (rolURL.toLowerCase() === 'admin') ? "Panel Administrativo" : "Acceso Estudiante";
        if(linkRegistro) linkRegistro.href = `/registro?rol=${rolURL}`;
    }

    // 4. BOTÓN CAMBIAR CUENTA
    changeAccountBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('last_user');
        localStorage.removeItem('user_profile');
        location.reload();
    });

    // 5. MANEJO DE ERRORES
    if (errorMsg) {
        const toast = document.getElementById("toast");
        const toastMsg = document.getElementById("toast-message");
        if(toast && toastMsg) {
            toast.style.display = 'flex';
            toastMsg.textContent = errorMsg;
            setTimeout(() => { toast.style.display = 'none'; }, 5000);
        }
    }

    // 6. LÓGICA DE CIERRE Y UI (MÓVIL) - OPTIMIZADA
    if (trigger) {
        trigger.onclick = () => {
            if (window.innerWidth <= 850) {
                formSide.classList.add('active');
            }
        };
    }

    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            formSide.classList.remove('active');
        };
    }

    // Cerrar al hacer clic en el fondo (overlay)
    window.onclick = (e) => {
        if (e.target === formSide) {
            formSide.classList.remove('active');
        }
    };

    // 7. ANIMACIÓN AL ENVIAR
    const loginForm = document.getElementById('mainLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', () => {
            const btnLogin = document.getElementById('btnLogin');
            const btnText = document.getElementById('btnText');
            const btnIcon = document.getElementById('btnIcon');
            
            if(btnText) btnText.innerText = "VERIFICANDO...";
            if(btnIcon) btnIcon.className = "fa-solid fa-circle-notch fa-spin";
            if(btnLogin) btnLogin.style.pointerEvents = "none";
        });
    }
});