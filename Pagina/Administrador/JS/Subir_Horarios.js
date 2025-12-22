async function cargarHTML(idContenedor, rutaHTML) {
    const res = await fetch(rutaHTML);
    const html = await res.text();
    document.getElementById(idContenedor).innerHTML = html;
}

async function inicializarVista() {
    await cargarHTML(
        "contenedor-anio",
        "/Administrador/Tabs/anio/anio.html"
    );

    await cargarHTML(
        "contenedor-ciclo-academico",
        "/Administrador/Tabs/ciclo_academico/ciclo_academico.html"
    );

    await cargarHTML(
        "contenedor-carrera",
        "/Administrador/Tarjetas/carrera/carrera.html"
    );

    await cargarHTML(
        "contenedor-ciclo",
        "/Administrador/Tarjetas/ciclo_curricular/ciclo_curricular.html"
    );

    await cargarHTML(
        "contenedor-asignatura",
        "/Administrador/Tarjetas/asignatura/asignatura.html"
    );

    await cargarHTML(
        "contenedor-grupo-horario",
        "/Administrador/Listas/grupo_horario/grupo_horario.html"
    );
}

document.addEventListener("DOMContentLoaded", inicializarVista);
