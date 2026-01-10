import os
from flask import Blueprint, send_file, session, redirect, url_for, request, jsonify
from Modulo_Usuario.Opcion_Menu_Lateral.Info_Usuario.SQL.CRUD_UpPerfil import ejecutar_actualizacion_perfil
from Gestion_de_Acceso.SQL.CRUD_Usuario import hash_password

# Configuración de rutas de archivos
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PORTAL_DIR = os.path.join(BASE_DIR, "Portal_Usuario")

usuario_bp = Blueprint("usuario", __name__)

# --- FUNCIONES DE UTILIDAD ---
def enviar_archivo_si_existe(ruta):
    if os.path.exists(ruta):
        return send_file(ruta)
    return f"Archivo no encontrado: {ruta}", 404

# --- RUTAS DE NAVEGACIÓN (HTML) ---
@usuario_bp.route("/portal_usuario")
def portal_usuario_html():
    if 'usuario' not in session:
        return redirect(url_for('login'))
    ruta_final = os.path.join(PORTAL_DIR, "Portal_Usuario.html")
    return enviar_archivo_si_existe(ruta_final)

# --- RUTAS DE API (JSON) ---
@usuario_bp.route("/actualizar_perfil", methods=["POST"])
def actualizar_perfil():
    """
    Recibe cambios atómicos desde Perfil.js y los aplica en la DB.
    Maneja fotos (Base64), Nombres, Passwords y UI Config.
    """
    try:
        # 1. Verificar sesión activa (Seguridad nivel 1)
        if 'usuario' not in session:
            return jsonify({"status": "error", "message": "Sesión expirada"}), 401

        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No se recibieron datos"}), 400

        # 2. Obtener el ID del usuario (Priorizamos sesión sobre el JSON)
        usuario_id = session.get('usuario_id') or data.get('id')
        
        if not usuario_id:
            return jsonify({"status": "error", "message": "Identidad de usuario no verificada"}), 400

        # 3. Procesamiento especial de Credenciales
        # Si el JSON trae password, lo hasheamos antes de enviarlo al CRUD
        if 'password' in data and data['password']:
            data['password'] = hash_password(data['password'])

        # 4. EJECUTAR ACTUALIZACIÓN EN DB
        # Pasamos el diccionario; el CRUD filtrará qué columnas actualizar
        resultado = ejecutar_actualizacion_perfil(usuario_id, data)

        # 5. Sincronizar Sesión si hubo éxito
        if resultado.get("status") == "success":
            # Si el nombre de usuario de login cambió, actualizar la sesión de Flask
            if 'nuevo_usuario' in data:
                session["usuario"] = data['nuevo_usuario']
            
            return jsonify(resultado) 
        else:
            # Si el CRUD devuelve error (ej: fallo en Turso)
            return jsonify(resultado), 500

    except Exception as e:
        print(f"--- ERROR CRÍTICO EN RUTAS_USUARIO: {str(e)} ---")
        return jsonify({"status": "error", "message": f"Error interno: {str(e)}"}), 500

# --- SERVICIO DE ARCHIVOS ESTÁTICOS ---
@usuario_bp.route("/CSS/<path:filename>")
def servir_css(filename):
    return enviar_archivo_si_existe(os.path.join(PORTAL_DIR, "CSS", filename))

@usuario_bp.route("/JS/<path:filename>")
def servir_js(filename):
    return enviar_archivo_si_existe(os.path.join(PORTAL_DIR, "JS", filename))

@usuario_bp.route("/IMG/<path:filename>")
def servir_img(filename):
    return enviar_archivo_si_existe(os.path.join(PORTAL_DIR, "IMG", filename))