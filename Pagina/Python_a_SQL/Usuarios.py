# Usuarios.py
import sqlite3
import hashlib
from Pagina.Logica.Conexion import DB_PATH


def get_db():
    return sqlite3.connect(DB_PATH)


def inicializar_tabla():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                rol TEXT NOT NULL DEFAULT 'USUARIO'
            )
        """)



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



def crear_usuario(usuario, password, rol="USUARIO"):
    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO usuarios (usuario, password, rol) VALUES (?, ?, ?)",
                (usuario, hash_password(password), rol)
            )
        return True
    except sqlite3.IntegrityError:
        return False
