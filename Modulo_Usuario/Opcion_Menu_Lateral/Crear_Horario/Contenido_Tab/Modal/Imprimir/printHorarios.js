// Modulo_Usuario\Opcion_Menu_Lateral\Crear_Horario\Contenido_Tab\Tab_Excel\Operaciones\Nuevo\printHorarios.js
let estilosGlobales = '';

/**
 * Se llama UNA sola vez desde Tab_Excel.js
 */
export function inicializarImpresionHorarios() {
  document.addEventListener('imprimir-horarios', async (e) => {
    try {
      const payload = {
        horarios: e.detail.horarios,
        estilos: estilosGlobales
      };

      const response = await fetch(
        '/imprimir-horarios',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
      alert('Error al generar el PDF');
    }
  });
}

/**
 * Usado por el Web Component
 */
export function imprimirHorariosSeleccionados(horarios, estilos) {
  estilosGlobales = estilos;

  document.dispatchEvent(
    new CustomEvent('imprimir-horarios', {
      detail: { horarios }
    })
  );
}
