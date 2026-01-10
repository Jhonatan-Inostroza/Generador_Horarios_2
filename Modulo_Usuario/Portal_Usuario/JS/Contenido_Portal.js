// C:\Users\Jhonatan Inostroza\Desktop\Proyectos\Generar_Horarios\Modulo_Usuario\Portal_Usuario\JS\Contenido_Portal.js

function cargarPagina(url) {
    const contenedor = document.getElementById('content-area');
    if (!contenedor) return;

    contenedor.style.opacity = '0';

    setTimeout(() => {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar la página');
                return response.text();
            })
            .then(html => {
                // Limpieza de estilos inyectados previamente en el área de contenido
                const linksPrevios = contenedor.querySelectorAll('link[rel="stylesheet"]');
                linksPrevios.forEach(link => link.remove());

                contenedor.innerHTML = html;
                
                // Activar lógica de Perfil si la URL coincide
                if (url.includes('Perfil.html')) {
                    if (typeof inicializarEventosPerfil === 'function') {
                        inicializarEventosPerfil();
                    }
                }

                contenedor.style.opacity = '1';
                
                // Colapsar sidebar en móviles tras navegar
                if (window.innerWidth <= 1024) {
                    const sidebar = document.getElementById('sidebar'); 
                    if (sidebar) sidebar.classList.add('collapsed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                contenedor.innerHTML = "<div style='color: white; padding: 20px;'>Error de conexión.</div>";
                contenedor.style.opacity = '1';
            });
    }, 200);
}