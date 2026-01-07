# CRUD_Usuario.py
import sqlite3
import hashlib
from Gestion_de_Acceso.Conexion.Conexion import DB_PATH


def get_db():
    return sqlite3.connect(DB_PATH)



def hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def verificar_usuario(usuario, password, rol_intento):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT rol FROM usuarios WHERE usuario=? AND password=?",
            (usuario, hash_password(password))
        )
        fila = cur.fetchone()
        if fila is None:
            return False  # Usuario o contraseña incorrectos
        rol_real = fila[0]
        return rol_real.upper() == rol_intento.upper()  # Compara ignorando mayúsculas


def crear_usuario(usuario, password, rol):
    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO usuarios (usuario, password, rol) VALUES (?, ?, ?)",
                (usuario, hash_password(password), rol)
            )
        return True
    except sqlite3.IntegrityError:
        return False
