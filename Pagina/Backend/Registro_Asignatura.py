from flask import Blueprint, request, jsonify
from Pagina.Administrador.Python_a_SQL.Select_Anio_Ciclo import get_db

asignatura_bp = Blueprint("asignatura", __name__)

@asignatura_bp.route("/api/asignaturas", methods=["POST"])
def crear_asignatura():
    data = request.json

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO asignatura (ciclo_id, nombre)
            VALUES (?, ?)
        """, (data["ciclo_id"], data["nombre"]))
        conn.commit()

    return jsonify({"ok": True})
