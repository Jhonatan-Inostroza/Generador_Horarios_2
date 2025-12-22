# Anio_Ciclo.py
import sqlite3
from Pagina.Python_a_SQL.Usuarios import get_db

def inicializar_tablas_academicas():
    """
    Crea las tablas de años y ciclos académicos si no existen
    """
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS anio_academico (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            anio INTEGER UNIQUE NOT NULL
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS ciclo_academico (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            anio_id INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            FOREIGN KEY(anio_id) REFERENCES anio_academico(id)
        )
    """)
    conn.commit()
    conn.close()
