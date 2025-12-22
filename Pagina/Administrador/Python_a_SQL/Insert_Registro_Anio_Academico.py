from flask import Blueprint, request, jsonify
from Pagina.Administrador.Python_a_SQL.Select_Anio_Ciclo import get_db

anio_bp = Blueprint("anio", __name__)

@anio_bp.route("/api/anios", methods=["GET"])
def obtener_anios():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, anio FROM anio_academico ORDER BY anio DESC")
        data = cur.fetchall()

    return jsonify([
        {"id": r[0], "anio": r[1]} for r in data
    ])

@anio_bp.route("/api/anios", methods=["POST"])
def crear_anio():
    data = request.json
    anio = data.get("anio")
    ciclos = data.get("ciclos", [])

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("INSERT INTO anio_academico (anio) VALUES (?)", (anio,))
        anio_id = cur.lastrowid

        for c in ciclos:
            cur.execute(
                "INSERT INTO ciclo_academico (anio_id, nombre) VALUES (?, ?)",
                (anio_id, c)
            )

        conn.commit()

    return jsonify({"ok": True})
