from flask import Blueprint, request, jsonify
from Pagina.Administrador.Python_a_SQL.Select_Anio_Ciclo import get_db

detalle_bp = Blueprint("detalle", __name__)

@detalle_bp.route("/api/horarios", methods=["POST"])
def registrar_horario():
    d = request.json

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO horario (
                asignatura_id, grupo, docente, dia, hora_inicio, hora_fin
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            d["asignatura_id"],
            d["grupo"],
            d["docente"],
            d["dia"],
            d["hora_inicio"],
            d["hora_fin"]
        ))
        conn.commit()

    return jsonify({"ok": True})
