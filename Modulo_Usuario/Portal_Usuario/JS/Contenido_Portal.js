// Modulo_Usuario/Portal_Usuario/Js/portal.js

function cargarPagina(url) {
    const contenedor = document.getElementById('content-area');
    
    if (!contenedor) return;

    // Efecto de transición suave
    contenedor.style.opacity = '0';

    setTimeout(() => {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar la página');
                return response.text();
            })
            .then(html => {
                contenedor.innerHTML = html;
                contenedor.style.opacity = '1';
                
                // Opcional: Cerrar el menú automáticamente en celulares al hacer clic
                if (window.innerWidth <= 1024) {
                    const sidebar = document.querySelector('.sidebar');
                    if (sidebar) sidebar.classList.add('collapsed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                contenedor.innerHTML = "<div class='error'>No se pudo cargar el contenido.</div>";
                contenedor.style.opacity = '1';
            });
    }, 200); // Pequeña pausa para que la transición se note
}