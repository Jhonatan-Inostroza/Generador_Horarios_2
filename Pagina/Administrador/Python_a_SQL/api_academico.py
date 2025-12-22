from flask import Blueprint, jsonify, request
import sqlite3
import os

api_bp = Blueprint("api", __name__)

# ======================================
# RUTA A LA BASE DE DATOS
# ======================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DB_PATH = os.path.abspath(
    os.path.join(BASE_DIR, "..", "..", "..", "Usuario", "usuarios.db")
)

# ======================================
# CONEXIÓN
# ======================================
def conectar():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ======================================
# AÑOS ACADÉMICOS
# ======================================
@api_bp.route("/anios", methods=["GET"])
def obtener_anios():
    conn = conectar()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, anio
        FROM vista_anios_academicos
        ORDER BY anio
    """)

    data = cur.fetchall()
    conn.close()

    return jsonify([
        {"id": row["id"], "anio": row["anio"]}
        for row in data
    ])


# ======================================
# CICLOS ACADÉMICOS POR AÑO
# ======================================
@api_bp.route("/ciclos_academicos", methods=["GET"])
def obtener_ciclos_academicos():
    anio = request.args.get("anio")

    if not anio:
        return jsonify({"error": "anio es requerido"}), 400

    conn = conectar()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            detalle_ciclo_academico_id AS id,
            ciclo
        FROM vista_ciclos_academicos
        WHERE anio = ?
        ORDER BY ciclo
    """, (anio,))

    data = cur.fetchall()
    conn.close()

    return jsonify([
        {"id": row["id"], "nombre": row["ciclo"]}
        for row in data
    ])


# ======================================
# CARRERAS POR CICLO ACADÉMICO
# ======================================
@api_bp.route("/carreras", methods=["GET"])
def obtener_carreras():
    detalle_ciclo_academico_id = request.args.get("detalle_ciclo_academico_id")

    if not detalle_ciclo_academico_id:
        return jsonify({"error": "detalle_ciclo_academico_id es requerido"}), 400

    conn = conectar()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            detalle_ciclo_carrera_id AS id,
            carrera
        FROM vista_carreras_por_ciclo
        WHERE detalle_ciclo_academico_id = ?
        ORDER BY carrera
    """, (detalle_ciclo_academico_id,))

    data = cur.fetchall()
    conn.close()

    return jsonify([
        {"id": row["id"], "nombre": row["carrera"]}
        for row in data
    ])


# ======================================
# CICLOS CURRICULARES (PLAN DE ESTUDIOS)
# ======================================
@api_bp.route("/ciclos", methods=["GET"])
def obtener_ciclos_curriculares():
    detalle_ciclo_carrera_id = request.args.get("detalle_ciclo_carrera_id")

    if not detalle_ciclo_carrera_id:
        return jsonify({"error": "detalle_ciclo_carrera_id es requerido"}), 400

    conn = conectar()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            detalle_ciclo_carrera_ciclo_id AS id,
            nombre
        FROM vista_ciclos_curriculares
        WHERE detalle_ciclo_carrera_id = ?
        ORDER BY orden
    """, (detalle_ciclo_carrera_id,))

    data = cur.fetchall()
    conn.close()

    return jsonify([
        {"id": row["id"], "nombre": row["nombre"]}
        for row in data
    ])



# ======================================
# ASIGNATURAS POR CICLO CURRICULAR
# ======================================
@api_bp.route("/asignaturas", methods=["GET"])
def obtener_asignaturas():
    detalle_ciclo_carrera_ciclo_id = request.args.get(
        "detalle_ciclo_carrera_ciclo_id"
    )

    if not detalle_ciclo_carrera_ciclo_id:
        return jsonify(
            {"error": "detalle_ciclo_carrera_ciclo_id es requerido"}
        ), 400

    conn = conectar()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            detalle_asignatura_ciclo_id AS id,
            nombre
        FROM vista_asignaturas
        WHERE detalle_ciclo_carrera_ciclo_id = ?
        ORDER BY nombre
    """, (detalle_ciclo_carrera_ciclo_id,))

    data = cur.fetchall()
    conn.close()

    return jsonify([
        {"id": row["id"], "nombre": row["nombre"]}
        for row in data
    ])


# ======================================
# GRUPOS HORARIOS POR ASIGNATURA
# ======================================
@api_bp.route("/grupos_horarios", methods=["GET"])
def obtener_grupos_horarios():
    detalle_asignatura_ciclo_id = request.args.get(
        "detalle_asignatura_ciclo_id"
    )

    if not detalle_asignatura_ciclo_id:
        return jsonify(
            {"error": "detalle_asignatura_ciclo_id es requerido"}
        ), 400

    conn = conectar()
    cur = conn.cursor()

    cur.execute("""
        SELECT *
        FROM vista_grupos_horarios
        WHERE detalle_asignatura_ciclo_id = ?
        ORDER BY grupo
    """, (detalle_asignatura_ciclo_id,))

    data = cur.fetchall()
    conn.close()

    return jsonify([dict(row) for row in data])
