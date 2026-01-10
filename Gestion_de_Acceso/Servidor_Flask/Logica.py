# Gestion_de_Acceso/Servidor_Flask/Logica.py

import os
import sys
import json

# ======================================================
# PATH BASE DEL PROYECTO (UNA SOLA VEZ, LIMPIO)
# ======================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
PROYECTO_ROOT = BASE_DIR

if PROYECTO_ROOT not in sys.path:
    sys.path.insert(0, PROYECTO_ROOT)

# ======================================================
# DOTENV → SOLO EN LOCAL (NO ROMPER VERCEL)
# ======================================================

if "VERCEL" not in os.environ:
    from dotenv import load_dotenv
    load_dotenv()

# ======================================================
# FLASK
# ======================================================

from flask import (
    Flask,
    request,
    redirect,
    url_for,
    send_file,
    session,
    jsonify
)

# ======================================================
# RUTAS DEL PROYECTO (NO CAMBIADAS)
# ======================================================

GESTION_ACCESO_DIR = os.path.join(PROYECTO_ROOT, "Gestion_de_Acceso")
MODULO_USUARIO_DIR = os.path.join(PROYECTO_ROOT, "Modulo_Usuario")

HTML_LOGIN = os.path.join(GESTION_ACCESO_DIR, "Login", "Login.html")
HTML_REGISTRO = os.path.join(GESTION_ACCESO_DIR, "Registrar_Usuario", "Registrar_Usuario.html")
HTML_PRINCIPAL = os.path.join(GESTION_ACCESO_DIR, "Portal_Ingreso", "Principal.html")

# ======================================================
# IMPORTS DE TU LÓGICA (SIN TOCAR)
# ======================================================

from Gestion_de_Acceso.SQL.CRUD_Usuario import (
    crear_usuario,
    verificar_usuario,
    obtener_perfil_por_usuario
)

from Modulo_Usuario.Rutas_Usuario import usuario_bp
from Modulo_Usuario.Opcion_Menu_Lateral.Crear_Horario.Contenido_Tab.Modal.Imprimir.print_horarios import (
    print_horarios_bp
)

# ======================================================
# APP
# ======================================================

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "mi_llave_secreta_para_academicos")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB

app.register_blueprint(usuario_bp)
app.register_blueprint(print_horarios_bp)

# ======================================================
# HELPERS
# ======================================================

def enviar_archivo_si_existe(ruta):
    ruta = os.path.normpath(ruta)
    if os.path.exists(ruta):
        return send_file(ruta)
    return "Archivo no encontrado en el servidor", 404

# ======================================================
# SERVIR ARCHIVOS ESTÁTICOS (IGUAL QUE ANTES)
# ======================================================

@app.route("/acceso/<path:nombre_archivo>")
def servir_archivos_acceso(nombre_archivo):
    return enviar_archivo_si_existe(
        os.path.join(GESTION_ACCESO_DIR, nombre_archivo)
    )

@app.route("/menu/<path:nombre_archivo>")
def menu_lateral(nombre_archivo):
    return enviar_archivo_si_existe(
        os.path.join(MODULO_USUARIO_DIR, "Menu_Lateral", nombre_archivo)
    )

@app.route("/usuario/<path:nombre_archivo>")
def portal_usuario_files(nombre_archivo):
    return enviar_archivo_si_existe(
        os.path.join(MODULO_USUARIO_DIR, "Portal_Usuario", nombre_archivo)
    )

@app.route("/menu_opcion/<path:nombre_archivo>")
def opcione_menu(nombre_archivo):
    return enviar_archivo_si_existe(
        os.path.join(MODULO_USUARIO_DIR, "Opcion_Menu_Lateral", nombre_archivo)
    )

# ======================================================
# NAVEGACIÓN
# ======================================================

@app.route("/")
def principal_route():
    return enviar_archivo_si_existe(HTML_PRINCIPAL)

# ======================================================
# LOGIN
# ======================================================

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        rol_raw = request.form.get("rol", "usuario").lower()
        usuario_input = request.form.get("usuario")
        password = request.form.get("password")

        rol_verf = "ADMINISTRADOR" if rol_raw in ("admin", "administrador") else "USUARIO"

        try:
            datos = verificar_usuario(usuario_input, password, rol_verf)
            if datos:
                session["usuario"] = datos["usuario"]
                session["id"] = datos["id"]
                session["rol"] = datos["rol"]

                return f"""
                <script>
                    sessionStorage.setItem(
                        'nodo_activo',
                        JSON.stringify({json.dumps(datos)})
                    );
                    window.location.href = "{url_for('usuario.portal_usuario_html')}";
                </script>
                """

            return redirect(url_for("login", error="Datos incorrectos", rol=rol_raw))

        except Exception as e:
            return f"Error de base de datos: {e}", 500

    return enviar_archivo_si_existe(HTML_LOGIN)

# ======================================================
# LOGIN REALTIME
# ======================================================

@app.route("/verificar_usuario_realtime")
def verificar_usuario_realtime():
    usuario_id = request.args.get("usuario")
    if not usuario_id:
        return jsonify({"existe": False})

    perfil = obtener_perfil_por_usuario(usuario_id)
    if not perfil:
        return jsonify({"existe": False})

    return jsonify({
        "existe": True,
        "nombres": perfil.get("nombres") or "",
        "apellidos": perfil.get("apellidos") or "",
        "foto": perfil.get("foto")
    })

# ======================================================
# REGISTRO
# ======================================================

@app.route("/registro", methods=["GET", "POST"])
def registro_route():
    if request.method == "POST":
        usuario = request.form.get("usuario")
        password = request.form.get("password")
        confirmar = request.form.get("confirmar")
        rol_raw = request.form.get("rol", "USUARIO").upper()

        rol_final = "ADMINISTRADOR" if "ADMIN" in rol_raw else "USUARIO"

        if password != confirmar:
            return redirect(url_for("registro_route", error="match", rol=rol_final))

        if crear_usuario(usuario, password, rol_final):
            return redirect(url_for("registro_route", success="true"))

        return redirect(url_for("registro_route", error="exists", rol=rol_final))

    return enviar_archivo_si_existe(HTML_REGISTRO)

# ======================================================
# LOGOUT
# ======================================================

@app.route("/logout")
def logout():
    session.clear()
    return """
    <script>
        sessionStorage.clear();
        localStorage.removeItem('last_user');
        localStorage.removeItem('user_profile');
        window.location.href = "/login";
    </script>
    """

# ======================================================
# HEADERS
# ======================================================

@app.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "-1"
    return response

# ======================================================
# LOCAL ONLY
# ======================================================

if __name__ == "__main__":
    app.run(debug=True)
