# Usuarios.py
import os
import hashlib
import sqlite3
from flask import Flask, request, redirect, url_for, send_file
from Pagina.Administrador.Python_a_SQL.Select_Anio_Ciclo import get_db

# ============================
# IMPORTAR BLUEPRINTS
# ============================
from Pagina.Administrador.Python_a_SQL.Insert_Registro_Anio_Academico import anio_bp
from Pagina.Administrador.Python_a_SQL.Insert_Registro_Ciclo import ciclo_bp
from Registro_Asignatura import asignatura_bp
from Registro_Asignatura_Detalle import detalle_bp

# ============================
# RUTAS ABSOLUTAS
# ============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))              # Pagina/Backend
ADMIN_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))          # Pagina/Administrador
ROOT_DIR = os.path.abspath(os.path.join(ADMIN_DIR, ".."))          # GENERAR_HORARIOS

HTML_LOGIN = os.path.join(ADMIN_DIR, "Login.html")
HTML_REGISTRO = os.path.join(ADMIN_DIR, "Registrar_Usuario.html")
HTML_SUBIR = os.path.join(ADMIN_DIR, "Subir_Horarios.html")

CSS_DIR = os.path.join(ADMIN_DIR, "CSS")
JS_DIR = os.path.join(ADMIN_DIR, "Backend")  # aquí están tus JS

# ============================
# INICIALIZAR APP
# ============================
app = Flask(__name__)

# ============================
# UTILIDADES
# ============================
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# ============================
# CREAR TABLA USUARIOS SI NO EXISTE
# ============================
with get_db() as conn:
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)
    conn.commit()

# ============================
# SERVIR CSS
# ============================
@app.route("/css/<path:filename>")
def css(filename):
    return send_file(os.path.join(CSS_DIR, filename))

# ============================
# SERVIR JS
# ============================
@app.route("/js/<path:filename>")
def js(filename):
    return send_file(os.path.join(JS_DIR, filename))

# ============================
# LOGIN
# ============================
@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        usuario = request.form["usuario"]
        password = request.form["password"]

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id FROM usuarios WHERE usuario=? AND password=?",
                (usuario, hash_password(password))
            )
            user = cursor.fetchone()

        if user:
            return redirect(url_for("subir_horarios"))
        else:
            return "Usuario o contraseña incorrectos"

    return send_file(HTML_LOGIN)

# ============================
# REGISTRO
# ============================
@app.route("/registro", methods=["GET", "POST"])
def registro():
    if request.method == "POST":
        usuario = request.form["usuario"]
        password = request.form["password"]
        confirmar = request.form["confirmar"]

        if password != confirmar:
            return "Las contraseñas no coinciden"

        try:
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO usuarios (usuario, password) VALUES (?, ?)",
                    (usuario, hash_password(password))
                )
                conn.commit()
        except sqlite3.IntegrityError:
            return "El usuario ya existe"

        return redirect(url_for("login"))

    return send_file(HTML_REGISTRO)

# ============================
# SUBIR HORARIOS
# ============================
@app.route("/subir_horarios")
def subir_horarios():
    return send_file(HTML_SUBIR)

# ============================
# REGISTRO DE BLUEPRINTS
# ============================
app.register_blueprint(anio_bp)
app.register_blueprint(ciclo_bp)
app.register_blueprint(asignatura_bp)
app.register_blueprint(detalle_bp)

# ============================
# MAIN
# ============================
if __name__ == "__main__":
    # Ejecutar desde la raíz del proyecto:
    # python -m Pagina.Backend.Usuarios
    app.run(debug=True)
