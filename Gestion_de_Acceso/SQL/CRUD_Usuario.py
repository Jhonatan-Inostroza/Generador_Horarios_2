# C:\Users\Jhonatan Inostroza\Desktop\Proyectos\Generar_Horarios\Gestion_de_Acceso\SQL\CRUD_Usuario.py
import hashlib
import sqlite3
print("=== CRUD_Usuario.py CARGADO ===", __file__)

# Manejo de importación de conexión robusto
try:
    from Gestion_de_Acceso.Conexion.Conexion import obtener_conexion
except ImportError:
    try:
        from Conexion.Conexion import obtener_conexion
    except ImportError:
        try:
            from Conexion import obtener_conexion
        except ImportError:
            # Fallback para pruebas directas en el archivo
            def obtener_conexion():
                return sqlite3.connect("database.db")

def hash_password(password):
    """Cifra la contraseña usando SHA-256"""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def verificar_usuario(usuario, password, rol_intento):
    """Verifica credenciales y rol del usuario para el Login"""
    conn = obtener_conexion()
    try:
        # Aseguramos que el rol de intento sea exacto
        rol_limpio = rol_intento.upper()
        hash_buscado = hash_password(password)
        
        query = "SELECT * FROM Vista_Perfil_Usuario WHERE usuario=? AND password=? AND rol=?"
        resultado = conn.execute(query, (usuario, hash_buscado, rol_limpio))
        
        fila = None
        if hasattr(resultado, "columns"):  # CASO TURSO / LIBSQL
            rows = resultado.fetchall()
            if rows:
                fila = dict(zip(resultado.columns, rows[0]))
        else:  # CASO SQLITE ESTÁNDAR
            r = resultado.fetchone()
            if r:
                fila = dict(r)

        if fila:
            for k, v in fila.items():
                if isinstance(v, dict):
                    print("❌ [DEBUG] VALOR DICT DETECTADO:", k, v)

            # Normalización del ID para el resto del sistema
            if "usuario_id" in fila:
                fila["id"] = fila["usuario_id"]
            # Por seguridad, nunca devolvemos el hash
            fila.pop("password", None)
            return fila

        return None
    except Exception as e:
        print(f"❌ [CRUD-ERROR] Error en verificar_usuario: {e}")
        return None
    finally:
        conn.close()

def crear_usuario(usuario, password, rol):
    """Registra un nuevo usuario y crea su entrada en Datos_Personales"""
    conn = obtener_conexion()
    try:
        # Forzamos que el rol sea USUARIO o ADMINISTRADOR antes de insertar
        rol_final = rol.upper()
        hash_cruzado = hash_password(password)
        
        # 1. Insertar en tabla usuarios
        conn.execute(
            "INSERT INTO usuarios (usuario, password, rol, disponibilidad) VALUES (?, ?, ?, ?)",
            (usuario, hash_cruzado, rol_final, "activo")
        )

        # 2. Obtener ID generado de forma compatible entre SQLite y Turso
        res_id = conn.execute("SELECT last_insert_rowid()")
        if hasattr(res_id, "columns"):  # TURSO
            nuevo_id = res_id.fetchall()[0][0]
        else:  # SQLITE
            nuevo_id = res_id.fetchone()[0]

        # 3. Crear registro vinculado en Datos_Personales para evitar errores de relación
        conn.execute("INSERT INTO Datos_Personales (usuario_id) VALUES (?)", (nuevo_id,))

        # Commit manual si no es Turso (Turso suele manejar autocommit vía URL)
        if not hasattr(conn, "url"): 
            conn.commit()
            
        return True
    except Exception as e:
        print(f"❌ [CRUD-ERROR] No se pudo crear el usuario: {e}")
        return False
    finally:
        conn.close()
def _unwrap(v):
    if isinstance(v, dict):
        # libSQL / Turso null wrapper
        if v.get("type") == "null":
            return None
        # otros wrappers posibles
        if "value" in v:
            return v["value"]
        return None
    return v


def obtener_perfil_por_usuario(usuario):
    """
    Busca datos de perfil para el 'Modo Facebook'.
    Usa nombres de columnas exactos de la Vista_Perfil_Usuario: nombres, apellidos, foto.
    """
    
    conn = obtener_conexion()
    try:
        query = "SELECT usuario, nombres, apellidos, foto, rol FROM Vista_Perfil_Usuario WHERE usuario = ?"
        resultado = conn.execute(query, (usuario,))
        print("🔍 [DEBUG] resultado type:", type(resultado))
        print("🔍 [DEBUG] resultado.columns:", getattr(resultado, "columns", None))
        fila = None
        if hasattr(resultado, "columns"): # CASO TURSO
            rows = resultado.fetchall()
            print("🔍 [DEBUG] rows:", rows)
            print("🔍 [DEBUG] type(rows[0]) if exists:", type(rows[0]) if rows else None)
            if rows:
                fila = dict(zip(resultado.columns, rows[0]))
                fila = {k: _unwrap(v) for k, v in fila.items()}
        else: # CASO SQLITE
            r = resultado.fetchone()
            if r:
                fila = dict(r)
                fila = {k: _unwrap(v) for k, v in fila.items()}
        
        return fila
    except Exception as e:
        print(f"❌ [CRUD-ERROR] Error buscando perfil en tiempo real: {e}")
        return None
    finally:
        conn.close()