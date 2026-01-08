from flask import Blueprint, send_file, session, redirect, url_for
import os

admin_bp = Blueprint(
    "admin",
    __name__,
    url_prefix="/admin"
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HTML_ADMIN = os.path.join(BASE_DIR, "Admin.html")

@admin_bp.route("/")
def portal_admin():
    # Protección por rol
    if session.get("rol") != "ADMINISTRADOR":
        return redirect(url_for("login"))

    return send_file(HTML_ADMIN)