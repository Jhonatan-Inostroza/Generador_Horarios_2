# Administrador/Python_a_SQL/Excel_Contenido_Ciclo.py
from flask import Blueprint, request, jsonify
import pandas as pd
from Pagina.Python_a_SQL.Usuarios import get_db  # <-- tu get_db existente

subir_excel_bp = Blueprint("subir_excel", __name__)

@subir_excel_bp.route("/api/subir_excel_asignaturas", methods=["POST"])
def subir_excel_asignaturas():
    ciclo_academico_id = request.form.get("ciclo_academico_id")
    ciclo_id = request.form.get("ciclo_id")
    file = request.files.get("excel")

    if not file or not ciclo_academico_id or not ciclo_id:
        return "Archivo o IDs no proporcionados", 400

    try:
        # Leer Excel
        df = pd.read_excel(file)

        # Normalizar nombres de columnas (mayúsculas y sin espacios)
        df.columns = [c.strip().upper() for c in df.columns]

        # Columnas obligatorias
        expected_cols = ["ASIGNATURA","GRUPO HORARIO","DOCENTE","DÍA","HORA INICIO","HORA FIN"]
        for col in expected_cols:
            if col not in df.columns:
                return f"Falta columna obligatoria: {col}", 400

        if df["ASIGNATURA"].isnull().all():
            return "No hay asignaturas en el Excel", 400

        with get_db() as conn:
            cur = conn.cursor()

            for _, row in df.iterrows():
                nombre_asig = str(row["ASIGNATURA"]).strip()
                if not nombre_asig:
                    continue  # Saltar filas sin nombre de asignatura

                # Verificar si la asignatura ya existe
                cur.execute("""
                    SELECT id FROM asignatura
                    WHERE ciclo_academico_id=? AND ciclo_id=? AND nombre=?
                """, (ciclo_academico_id, ciclo_id, nombre_asig))
                res = cur.fetchone()

                if res:
                    asignatura_id = res[0]
                else:
                    # Insertar nueva asignatura
                    cur.execute("""
                        INSERT INTO asignatura (ciclo_academico_id, ciclo_id, nombre)
                        VALUES (?, ?, ?)
                    """, (ciclo_academico_id, ciclo_id, nombre_asig))
                    asignatura_id = cur.lastrowid

                # Insertar horario si hay datos
                grupo = str(row.get("GRUPO HORARIO") or "").strip()
                docente = str(row.get("DOCENTE") or "").strip()
                dia = str(row.get("DÍA") or "").strip()

                # Manejo correcto de horas
                hora_inicio = row.get("HORA INICIO")
                if pd.notnull(hora_inicio):
                    try:
                        hora_inicio = pd.to_datetime(hora_inicio).strftime("%H:%M")
                    except Exception:
                        hora_inicio = ""
                else:
                    hora_inicio = ""

                hora_fin = row.get("HORA FIN")
                if pd.notnull(hora_fin):
                    try:
                        hora_fin = pd.to_datetime(hora_fin).strftime("%H:%M")
                    except Exception:
                        hora_fin = ""
                else:
                    hora_fin = ""

                # Insertar horario solo si hay algún dato relevante
                if grupo or docente or dia or hora_inicio or hora_fin:
                    cur.execute("""
                        INSERT INTO horario (asignatura_id, grupo_horario, docente, dia, hora_inicio, hora_fin)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (asignatura_id, grupo, docente, dia, hora_inicio, hora_fin))

            # Confirmar cambios
            conn.commit()

        return jsonify({"ok": True, "mensaje": "Excel procesado correctamente"})

    except Exception as e:
        print("Error al procesar Excel:", e)
        return str(e), 500
