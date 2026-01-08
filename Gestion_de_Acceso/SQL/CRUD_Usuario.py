# CRUD_Usuario.py
import sqlite3
import hashlib
from Gestion_de_Acceso.Conexion.Conexion import DB_PATH
from db_supabase import get_connection


def get_db():
    return sqlite3.connect(DB_PATH)



def hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

# def verificar_usuario(usuario, password, rol_intento):
#     with get_db() as conn:
#         cur = conn.cursor()
#         cur.execute(
#             "SELECT rol FROM usuarios WHERE usuario=? AND password=?",
#             (usuario, hash_password(password))
#         )
#         fila = cur.fetchone()
#         if fila is None:
#             return False  # Usuario o contraseña incorrectos
#         rol_real = fila[0]
#         return rol_real.upper() == rol_intento.upper()  # Compara ignorando mayúsculas
def verificar_usuario(usuario, password, rol):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT id
        FROM usuarios
        WHERE nombre=%s AND contrasena=%s AND rol=%s
        """,
        (usuario, password, rol)
    )

    existe = cur.fetchone() is not None

    cur.close()
    conn.close()
    return existe

# def crear_usuario(usuario, password, rol):
#     try:
#         with get_db() as conn:
#             conn.execute(
#                 "INSERT INTO usuarios (usuario, password, rol) VALUES (?, ?, ?)",
#                 (usuario, hash_password(password), rol)
#             )
#         return True
#     except sqlite3.IntegrityError:
#         return False
def crear_usuario(usuario, password, rol):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            INSERT INTO usuarios (nombre, contrasena, rol)
            VALUES (%s, %s, %s)
            """,
            (usuario, password, rol)
        )
        conn.commit()
        return True

    except Exception as e:
        conn.rollback()
        print("ERROR crear_usuario:", e)
        return False

    finally:
        cur.close()
        conn.close()