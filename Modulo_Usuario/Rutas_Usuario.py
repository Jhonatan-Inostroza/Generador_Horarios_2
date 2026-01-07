import os
from flask import Blueprint, send_file, session, redirect, url_for # <-- Faltaba importar estos 3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Modulo_Usuario/

PORTAL_DIR  = os.path.join(BASE_DIR, "Portal_Usuario")   # Modulo_Usuario/Portal_Usuario/



usuario_bp = Blueprint("usuario", __name__)

# ===========================
# FUNCION AUXILIAR PARA ENVIAR ARCHIVOS
# Esto verifica si existe el archiv en la ruta
# ===========================
def enviar_archivo_si_existe(ruta):
    """Envía un archivo si existe, de lo contrario devuelve un mensaje de error"""
    if os.path.exists(ruta):
        return send_file(ruta)
    return f"Archivo no encontrado: {ruta}", 404

# ==========================
# HTML PRINCIPAL
# ==========================
@usuario_bp.route("/portal_usuario")
def portal_usuario_html():
    # SI NO HAY SESIÓN, NO ENTRA
    if 'usuario' not in session:
        return redirect(url_for('login'))
    # Construimos la ruta completa al archivo
    ruta_final = os.path.join(PORTAL_DIR, "Portal_Usuario.html")
    # Usamos la función auxiliar para retornar el archivo de forma segura
    return enviar_archivo_si_existe(ruta_final)



# ==========================
# SERVIR ARCHIVOS DEL MENÚ (HTML/CSS)
# ==========================
@usuario_bp.route("/menu/<path:nombre_archivo>")
def menu_lateral(nombre_archivo):
    ruta_final = os.path.join(BASE_DIR, "Menu_Lateral", nombre_archivo)
    return enviar_archivo_si_existe(ruta_final)
# ==========================
# SERVIR ARCHIVOS DEL PORTAL (CSS/JS/IMG)
# ==========================
@usuario_bp.route("/usuario/<path:nombre_archivo>")
def porportal_usuario(nombre_archivo):
    ruta_final = os.path.join(BASE_DIR, "Portal_Usuario", nombre_archivo)
    return enviar_archivo_si_existe(ruta_final)
# ==========================
# SERVIR ARCHIVOS DEL OPCIONES DEL MENU LATERAL (CSS/JS/HTML)
# ==========================
@usuario_bp.route("/menu_opcion/<path:nombre_archivo>")
def opcione_menu(nombre_archivo):
    ruta_final = os.path.join(BASE_DIR, "Opcion_Menu_Lateral", nombre_archivo)
    return enviar_archivo_si_existe(ruta_final)



