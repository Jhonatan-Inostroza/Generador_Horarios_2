import os
from flask import Blueprint, send_file

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TABS_DIR = os.path.join(BASE_DIR, "Tabs")
BBDD_DIR = os.path.join(BASE_DIR, "UsandoBBDD")

generador_bp = Blueprint("generador_bp", __name__)

# ==========================
# HTML PRINCIPAL
# ==========================
@generador_bp.route("/generador")
def generador_html():
    path = os.path.join(TABS_DIR, "Generador.html")
    if os.path.exists(path):
        return send_file(path)
    return f"No se encontró: {path}", 404
# ==========================
# CORE
# ==========================
CORE_DIR = os.path.join(BASE_DIR, "core")

@generador_bp.route("/generador/core/<path:filename>")
def generador_core_static(filename):
    path = os.path.join(CORE_DIR, filename)
    if os.path.exists(path):
        return send_file(path)
    return f"No se encontró: {path}", 404

# ==========================
# ARCHIVOS DE Tabs
# ==========================
@generador_bp.route("/generador/<path:filename>")
def generador_tabs_static(filename):
    path = os.path.join(TABS_DIR, filename)
    if os.path.exists(path):
        return send_file(path)
    return f"No se encontró: {path}", 404


# ==========================
# ARCHIVOS UsandoBBDD
# ==========================
@generador_bp.route("/generador/UsandoBBDD/<path:filename>")
def generador_bbdd_static(filename):
    path = os.path.join(BBDD_DIR, filename)
    if os.path.exists(path):
        return send_file(path)
    return f"No se encontró: {path}", 404
