from flask import Blueprint, jsonify
from Pagina.Administrador.Python_a_SQL.Select_Anio_Ciclo import get_db

ciclo_bp = Blueprint("ciclo", __name__)

@ciclo_bp.route("/api/ciclos", methods=["GET"])
def obtener_ciclos():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, nombre FROM ciclo")
        data = cur.fetchall()

    return jsonify([
        {"id": r[0], "nombre": r[1]} for r in data
    ])
