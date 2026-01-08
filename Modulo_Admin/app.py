from flask import Blueprint, render_template, request, redirect, url_for, session
from db_supabase import get_connection

admin_horarios_bp = Blueprint(
    "admin_horarios",
    __name__,
    url_prefix="/admin/horarios",
    template_folder="templates"
)

@admin_horarios_bp.route("/")
def grupo_list():
    if session.get("rol") != "ADMINISTRADOR":
        return redirect(url_for("login"))

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT gh.id, gh.grupo, a.nombre, d.nombre, gh.dia, gh.hora_inicio, gh.hora_fin
        FROM grupo_horario gh
        JOIN detalle_asignatura_ciclo dac ON gh.detalle_asignatura_ciclo_id = dac.id
        JOIN asignatura a ON dac.asignatura_id = a.id
        JOIN docentes d ON gh.docente_id = d.id
        ORDER BY gh.dia, gh.hora_inicio
    """)
    data = cur.fetchall()
    conn.close()

    return render_template("grupo_horario/list.html", data=data)

@admin_horarios_bp.route("/new", methods=["GET", "POST"])
def grupo_new():
    if session.get("rol") != "ADMINISTRADOR":
        return redirect(url_for("login"))

    conn = get_connection()
    cur = conn.cursor()

    if request.method == "POST":
        cur.execute("""
            INSERT INTO grupo_horario 
            (grupo, detalle_asignatura_ciclo_id, docente_id, dia, hora_inicio, hora_fin)
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (
            request.form["grupo"],
            request.form["detalle_asignatura_ciclo_id"],
            request.form["docente_id"],
            request.form["dia"],
            request.form["hora_inicio"],
            request.form["hora_fin"]
        ))
        conn.commit()
        conn.close()
        return redirect(url_for("admin_horarios.grupo_list"))

    cur.execute("SELECT id, nombre FROM docentes")
    docentes = cur.fetchall()

    cur.execute("""
        SELECT dac.id, a.nombre
        FROM detalle_asignatura_ciclo dac
        JOIN asignatura a ON dac.asignatura_id = a.id
    """)
    asignaturas = cur.fetchall()

    conn.close()
    return render_template(
        "grupo_horario/form.html",
        docentes=docentes,
        asignaturas=asignaturas
    )

admin_horarios_bp.route("/delete/<int:id>")
def grupo_delete(id):
    if session.get("rol") != "ADMINISTRADOR":
        return redirect(url_for("login"))

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM grupo_horario WHERE id=%s", (id,))
    conn.commit()
    conn.close()
    return redirect(url_for("admin_horarios.grupo_list"))