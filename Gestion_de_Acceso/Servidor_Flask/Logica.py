# # Logica.py
# # ---------------------------
# # Servidor principal Flask
# # ---------------------------

import os
import sys

# # ===========================
# # DIRECTORIOS BASE (HTML / estáticos)
# # ===========================
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))   # Gestion_de_Acceso/Servidor_Flask
# PAGINA_DIR = os.path.dirname(BASE_DIR)                  # Gestion_de_Acceso/







# ===========================
# DIRECTORIOS BASE (Ajuste para Vercel)
# ===========================
# Ruta absoluta del archivo actual
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 
# En Vercel, necesitamos asegurar que la raíz del repo esté en el path
# Subimos dos niveles para llegar a la raíz (Gestion_de_Acceso -> Raíz)
PROYECTO_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))

if PROYECTO_ROOT not in sys.path:
    sys.path.append(PROYECTO_ROOT)

# Directorio donde están los HTML (Gestion_de_Acceso)
PAGINA_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))



RAIZ_DIR = os.path.dirname(PAGINA_DIR)                  # Proyecto raíz


# Agregar la raíz al buscador de Python
if RAIZ_DIR not in sys.path:
    sys.path.append(RAIZ_DIR)


# ===========================
# IMPORTS DE LÓGICA
# ===========================
from Gestion_de_Acceso.SQL.CRUD_Usuario import (
    crear_usuario,
    verificar_usuario
)

from flask import (
    Flask,
    request,
    redirect,
    url_for,
    send_file,
    session
)

# ===========================
# IMPORTS DE BLUEPRINTS
# ===========================
from Modulo_Usuario.Rutas_Usuario import usuario_bp

from Modulo_Usuario.Opcion_Menu_Lateral.Crear_Horario.Contenido_Tab.Modal.Imprimir.print_horarios import (
    print_horarios_bp
)

# ===========================
# INICIALIZAR FLASK
# ===========================
app = Flask(__name__)

# Registrar blueprints
app.register_blueprint(usuario_bp)
app.register_blueprint(print_horarios_bp)

# Clave secreta (sessions)
app.secret_key = 'mi_llave_secreta_para_academicos'


# ===========================
# RUTAS HTML PRINCIPALES
# ===========================
HTML_LOGIN = os.path.join(PAGINA_DIR, "Login", "Login.html")
HTML_REGISTRO = os.path.join(PAGINA_DIR, "Registrar_Usuario", "Registrar_Usuario.html")
HTML_PRINCIPAL = os.path.join(PAGINA_DIR, "Portal_Ingreso", "Principal.html")


# ===========================
# FUNCIÓN AUXILIAR
# ===========================
def enviar_archivo_si_existe(ruta):
    """Envía un archivo si existe, de lo contrario devuelve 404"""
    if os.path.exists(ruta):
        return send_file(ruta)
    return f"Archivo no encontrado: {ruta}", 404


# ===========================
# RUTA PRINCIPAL
# ===========================
@app.route("/")
def principal_route():
    return enviar_archivo_si_existe(HTML_PRINCIPAL)


# ===========================
# SERVIR ARCHIVOS ESTÁTICOS
# ===========================
@app.route("/acceso/<path:ruta_archivo>")
def servir_archivos_acceso(ruta_archivo):
    ruta = os.path.join(PAGINA_DIR, ruta_archivo)
    return enviar_archivo_si_existe(ruta)


# ===========================
# LOGIN
# ===========================
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        rol = request.form.get("rol")
        usuario_input = request.form.get("usuario")
        password = request.form.get("password")

        rol_verificar = "ADMINISTRADOR" if rol and rol.lower() == "admin" else "USUARIO"

        if verificar_usuario(usuario_input, password, rol_verificar):
            session["usuario"] = usuario_input
            session["rol"] = rol_verificar

            if rol_verificar == "USUARIO":
                return redirect(url_for("usuario.portal_usuario_html"))
        else:
            return enviar_archivo_si_existe(HTML_LOGIN)

    return enviar_archivo_si_existe(HTML_LOGIN)


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
# LOGOUT
# ===========================
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ===========================
# MAIN
# ===========================
if __name__ == "__main__":
    app.run(debug=True)
