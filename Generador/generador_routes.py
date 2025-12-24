import os
from flask import Blueprint, send_file

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TABS_DIR  = os.path.join(BASE_DIR, "Tabs")
BBDD_DIR  = os.path.join(BASE_DIR, "UsandoBBDD")
CORE_DIR  = os.path.join(BASE_DIR, "core")
MODAL_DIR = os.path.join(BASE_DIR, "ModalHorario")

generador_bp = Blueprint("generador_bp", __name__)

# ==========================
# HTML PRINCIPAL
# ==========================
@generador_bp.route("/generador")
def generador_html():
    return send_file(os.path.join(TABS_DIR, "Generador.html"))

# ==========================
# ModalHorario
# ==========================
@generador_bp.route("/generador/ModalHorario/<path:filename>")
def generador_modal_static(filename):
    return send_file(os.path.join(MODAL_DIR, filename))

# ==========================
# CORE
# ==========================
@generador_bp.route("/generador/core/<path:filename>")
def generador_core_static(filename):
    return send_file(os.path.join(CORE_DIR, filename))

# ==========================
# UsandoBBDD
# ==========================
@generador_bp.route("/generador/UsandoBBDD/<path:filename>")
def generador_bbdd_static(filename):
    return send_file(os.path.join(BBDD_DIR, filename))

# ==========================
# Tabs (AL FINAL, SIEMPRE)
# ==========================
@generador_bp.route("/generador/Tabs/<path:filename>")
def generador_tabs_static(filename):
    return send_file(os.path.join(TABS_DIR, filename))
