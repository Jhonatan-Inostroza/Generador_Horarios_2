# Logica.py
# ---------------------------
# Servidor principal Flask
# ---------------------------

import os
#from flask import Flask, request, redirect, url_for, send_file

from Pagina.Python_a_SQL.Usuarios import (
    inicializar_tabla,
    verificar_usuario,
    crear_usuario
)
from flask import Flask, request, redirect, url_for, send_file, render_template_string


# ===========================
# IMPORTAR BLUEPRINTS
# ===========================
from Pagina.Administrador.Python_a_SQL.api_academico import api_bp

# ===========================
# DIRECTORIOS BASE (HTML / estáticos)
# ===========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))   # Pagina/Logica
PAGINA_DIR = os.path.dirname(BASE_DIR)                  # Pagina/
RAIZ_DIR = os.path.dirname(PAGINA_DIR)                 # PROYECTOS/Generar_Horarios

# ===========================
# RUTAS HTML
# ===========================
HTML_LOGIN = os.path.join(PAGINA_DIR, "Login.html")
HTML_REGISTRO = os.path.join(PAGINA_DIR, "Registrar_Usuario.html")
HTML_PRINCIPAL = os.path.join(PAGINA_DIR, "Principal.html")
HTML_SUBIR = os.path.join(PAGINA_DIR, "Administrador", "Subir_Horarios.html")

# Ruta correcta para Generador.html (carpeta Generador al mismo nivel que Pagina)
HTML_GENERADOR = os.path.join(RAIZ_DIR, "Generador","Tabs", "Generador.html")

# ===========================
# INICIALIZAR FLASK
# ===========================
app = Flask(__name__)
from Generador.generador_routes import generador_bp
app.register_blueprint(generador_bp)

# ===========================
# REGISTRAR BLUEPRINTS
# ===========================
app.register_blueprint(api_bp, url_prefix="/api")

# ===========================
# FUNCION AUXILIAR PARA ENVIAR ARCHIVOS
# ===========================
def enviar_archivo_si_existe(ruta):
    """Envía un archivo si existe, de lo contrario devuelve un mensaje de error"""
    if os.path.exists(ruta):
        return send_file(ruta)
    return f"Archivo no encontrado: {ruta}", 404

# ===========================
# SERVIR ARCHIVOS ESTÁTICOS
# ===========================
@app.route("/Administrador/<path:filename>")
def admin_files(filename):
    path = os.path.join(PAGINA_DIR, "Administrador", filename)
    return enviar_archivo_si_existe(path)

@app.route("/css/<path:filename>")
def css(filename):
    ruta = os.path.join(PAGINA_DIR, "CSS", filename)
    return enviar_archivo_si_existe(ruta)

@app.route("/img/<path:filename>")
def img(filename):
    ruta = os.path.join(PAGINA_DIR, "CSS", filename)  # tu logo y fondo están en CSS
    return enviar_archivo_si_existe(ruta)

@app.route("/js/<path:filename>")
def js(filename):
    ruta = os.path.join(PAGINA_DIR, "Backend", filename)
    return enviar_archivo_si_existe(ruta)

# ===========================
# RUTAS PRINCIPALES
# ===========================
@app.route("/")
def principal_route():
    return enviar_archivo_si_existe(HTML_PRINCIPAL)

# ===========================
# LOGIN
# ===========================

@app.route("/login", methods=["GET", "POST"])
def login_route():
    error = None  # Variable para el mensaje de error

    if request.method == "POST":
        usuario = request.form["usuario"]
        password = request.form["password"]
        rol = request.form.get("rol")
        rol_intento = "ADMINISTRADOR" if rol.lower() == "admin" else "USUARIO"

        if verificar_usuario(usuario, password, rol_intento):
            if rol_intento == "ADMINISTRADOR":
                return enviar_archivo_si_existe(HTML_SUBIR)
            else:
                return redirect("/generador")
        else:
            error = "Usuario, contraseña o rol incorrecto"

    # Cargar el HTML de login y reemplazar un marcador por el mensaje de error
    with open(HTML_LOGIN, "r", encoding="utf-8") as f:
        html = f.read()

    # Render simple usando un marcador {{ error }}
    html = html.replace("{{ error }}", f'<p class="login-error">{error}</p>' if error else "")

    return html


# ===========================
# REGISTRO
# ===========================
@app.route("/registro", methods=["GET", "POST"])
def registro_route():
    if request.method == "POST":
        usuario = request.form["usuario"]
        password = request.form["password"]
        confirmar = request.form["confirmar"]
        rol = request.form.get("rol")  # capturamos el rol

        # Validar contraseñas
        if password != confirmar:
            return "Las contraseñas no coinciden"

        # Ajustamos el rol al formato de la base
        rol_final = "ADMINISTRADOR" if rol == "admin" else "USUARIO"

        if crear_usuario(usuario, password, rol_final):
            # Redirigir al login con el rol correcto para iniciar sesión
            return redirect(f"/login?rol={rol}")

        return "El usuario ya existe"

    return enviar_archivo_si_existe(HTML_REGISTRO)


# ===========================
# MAIN
# ===========================
if __name__ == "__main__":
    inicializar_tabla()
    app.run(debug=True)
