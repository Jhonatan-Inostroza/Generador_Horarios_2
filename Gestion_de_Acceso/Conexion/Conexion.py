# import os
# import shutil
# import sqlite3

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DB_ORIGINAL = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "BBDD", "usuarios.db"))

# if os.environ.get('VERCEL'):
#     DB_PATH = "/tmp/usuarios.db"
#     if not os.path.exists(DB_PATH):
#         shutil.copy2(DB_ORIGINAL, DB_PATH)
# else:
#     DB_PATH = DB_ORIGINAL

# def obtener_conexion():
#     """Función para ser llamada desde cualquier parte del proyecto"""
#     conn = sqlite3.connect(DB_PATH)
#     # Esto permite acceder a las columnas por nombre como si fuera un diccionario
#     conn.row_factory = sqlite3.Row 
#     return conn
# C:\Users\Jhonatan Inostroza\Desktop\Proyectos\Generar_Horarios\Gestion_de_Acceso\Conexion\Conexion.py


# # ========================================
# # SI USO EL COPDIGO DE MANETA LOCAL USAR ESTO
# # EL CODIGO ACABA EN LA LINEA 117 Y EMPIEZA EN LA 28
# # =========================================
# import os
# import sqlite3
# import requests
# from dotenv import load_dotenv

# load_dotenv()

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DB_LOCAL = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "BBDD", "usuarios.db"))
# DB_FALLBACK = "/tmp/usuarios.db" if os.environ.get("VERCEL") else DB_LOCAL

# class TursoBridgeResponse:
#     def __init__(self, rows, columns):
#         self.rows = rows      # Lista de tuplas
#         self.columns = columns # Nombres de columnas

#     def fetchone(self):
#         return self.rows[0] if self.rows else None

#     def fetchall(self):
#         return self.rows

# class TursoBridge:
#     def __init__(self, url):
#         self.url = url

#     def execute(self, sql, params=None):
#         try:
#             resp = requests.post(self.url, json={"sql": sql, "params": params or []}, timeout=5)
#             data = resp.json()
#             if data.get("success"):
#                 rows_dict = data.get("rows", [])
#                 cols = list(rows_dict[0].keys()) if rows_dict else []
#                 # Convertimos lista de diccionarios a lista de tuplas para imitar SQLite
#                 tuple_rows = [tuple(r.values()) for r in rows_dict]
#                 return TursoBridgeResponse(tuple_rows, cols)
#             else:
#                 raise Exception(f"Error en DB Turso: {data.get('error')}")
#         except Exception as e:
#             print(f"❌ [ERROR-BRIDGE]: {e}")
#             raise e

#     def close(self):
#         pass

#     def commit(self):
#         pass

# def imprimir_tabla_usuarios(conn):
#     """Diagnóstico inmediato"""
#     try:
#         print("\n📊 --- CONTENIDO ACTUAL DE TABLA: USUARIOS ---")
#         res = conn.execute("SELECT id, usuario, rol, disponibilidad FROM usuarios")
        
#         if hasattr(res, "columns"):
#             columnas = res.columns
#             filas = res.rows
#         else:
#             columnas = ["id", "usuario", "rol", "disponibilidad"]
#             filas = res.fetchall()

#         print(" | ".join(columnas))
#         print("-" * 50)
#         for fila in filas:
#             print(" | ".join(str(val) for val in fila))
#         print("----------------------------------------------\n")
#     except Exception as e:
#         print(f"⚠️ No se pudo imprimir la tabla: {e}")

# def obtener_conexion():
#     bridge_url = os.environ.get("NODE_BRIDGE_URL", "http://localhost:3000/query")
    
#     try:
#         check = requests.post(bridge_url, json={"sql": "SELECT 1"}, timeout=2)
#         if check.status_code == 200 and check.json().get("success"):
#             print("✅ [CONECTADO] Turso vía Puente Node.js activo.")
#             conn = TursoBridge(bridge_url)
#             imprimir_tabla_usuarios(conn)
#             return conn
#     except Exception:
#         pass

#     print(f"⚠️ [AVISO] Usando Fallback. SQLite Local: {DB_FALLBACK}")
#     conn = sqlite3.connect(DB_FALLBACK)
#     conn.row_factory = sqlite3.Row
#     imprimir_tabla_usuarios(conn)
#     return conn
# # =============================================================
# # =============================================================
# # =============================================================
# Gestion_de_Acceso/Conexion/Conexion.py

print("=== [Conexion.py REAL CARGADO] ===", __file__)

import os
import sqlite3
import requests

from Gestion_de_Acceso.Conexion.CursorAdapter import CursorAdapter

# ======================================================
# VARIABLES DE ENTORNO (Vercel / Local)
# ======================================================

TURSO_DATABASE_URL = os.environ.get("TURSO_DATABASE_URL")
TURSO_AUTH_TOKEN = os.environ.get("TURSO_AUTH_TOKEN")

USE_TURSO = bool(TURSO_DATABASE_URL and TURSO_AUTH_TOKEN)

print(f"[DEBUG] USE_TURSO = {USE_TURSO}")

# ======================================================
# SQLITE FALLBACK (LOCAL / EMERGENCIA)
# ======================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DB_LOCAL = os.path.join(BASE_DIR, "BBDD", "usuarios.db")

# En Vercel solo se puede escribir en /tmp
DB_FALLBACK = "/tmp/usuarios.db" if os.environ.get("VERCEL") else DB_LOCAL


class SQLiteConnectionAdapter:
    """Hace que sqlite3 se comporte como Turso"""

    def __init__(self, conn):
        self._conn = conn

    def execute(self, sql, params=None):
        cur = self._conn.execute(sql, params or [])
        rows = cur.fetchall()
        columns = [d[0] for d in cur.description] if cur.description else []
        return CursorAdapter(rows, columns)

    def commit(self):
        self._conn.commit()

    def close(self):
        self._conn.close()


# ======================================================
# TURSO HTTP PIPELINE
# ======================================================

class TursoBridge:
    def __init__(self, base_url, token):
        self.url = f"{base_url.replace('libsql://', 'https://')}/v2/pipeline"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

    def execute(self, sql, params=None):
        # Sustitución segura estilo sqlite
        if params:
            for p in params:
                sql = sql.replace("?", repr(p), 1)

        payload = {
            "requests": [{
                "type": "execute",
                "stmt": {"sql": sql}
            }]
        }

        resp = requests.post(
            self.url,
            headers=self.headers,
            json=payload,
            timeout=10
        )
        resp.raise_for_status()

        data = resp.json()

        for r in data.get("results", []):
            result = r.get("response", {}).get("result")
            if not result:
                continue

            def normalizar(v):
                while isinstance(v, dict) and "value" in v:
                    v = v["value"]
                return v

            rows = [
                tuple(normalizar(col) for col in row)
                for row in result.get("rows", [])
            ]

            columns = [c["name"] for c in result.get("cols", [])]
            return CursorAdapter(rows, columns)

        raise RuntimeError("Respuesta inválida de Turso")

    def commit(self):
        pass  # Turso es autocommit

    def close(self):
        pass


# ======================================================
# CONEXIÓN UNIFICADA (ÚNICO ENTRYPOINT)
# ======================================================

def obtener_conexion():
    if USE_TURSO:
        try:
            print("✅ [TURSO] Conectando")
            conn = TursoBridge(TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)
            conn.execute("SELECT 1;")  # test rápido
            return conn
        except Exception as e:
            print("❌ [TURSO] Falló → SQLite")
            print(e)

    print(f"⚠️ [SQLITE] Usando {DB_FALLBACK}")
    sqlite_conn = sqlite3.connect(DB_FALLBACK)
    return SQLiteConnectionAdapter(sqlite_conn)


# ======================================================
# TEST LOCAL
# ======================================================

if __name__ == "__main__":
    c = obtener_conexion()
    r = c.execute("SELECT name FROM sqlite_master;")
    print(r.fetchall())
