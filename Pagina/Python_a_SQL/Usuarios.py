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
                password TEXT NOT NULL
            )
        """)


def hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verificar_usuario(usuario, password):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT 1 FROM usuarios WHERE usuario=? AND password=?",
            (usuario, hash_password(password))
        )
        return cur.fetchone() is not None


def crear_usuario(usuario, password):
    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO usuarios (usuario, password) VALUES (?, ?)",
                (usuario, hash_password(password))
            )
        return True
    except sqlite3.IntegrityError:
        return False
