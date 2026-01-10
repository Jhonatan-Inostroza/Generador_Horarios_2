import json
from Gestion_de_Acceso.Conexion.Conexion import obtener_conexion

def ejecutar_actualizacion_perfil(id_usuario, datos_cambio):
    conexion = None
    try:
        conexion = obtener_conexion()
        
        # 1. Asegurar integridad
        conexion.execute("INSERT OR IGNORE INTO Datos_Personales (usuario_id) VALUES (?)", (id_usuario,))

        # 2. Actualizar Tabla 'usuarios'
        mapeo_usuarios = {'nuevo_usuario': 'usuario', 'password': 'password', 'disponibilidad': 'disponibilidad'}
        for clave_js, columna_db in mapeo_usuarios.items():
            if clave_js in datos_cambio and datos_cambio[clave_js]:
                conexion.execute(f"UPDATE usuarios SET {columna_db} = ? WHERE id = ?", (datos_cambio[clave_js], id_usuario))

        # 3. Actualizar Tabla 'Datos_Personales' (Incluye la FOTO)
        # Ajustamos el mapeo para que coincida con las llaves que vienen de Perfil.js
        mapeo_personales = {
            'foto': 'foto', 
            'meta': 'meta', 
            'nombre': 'nombres',    # JS 'nombre' -> DB 'nombres'
            'apellido': 'apellidos' # JS 'apellido' -> DB 'apellidos'
        }
        for clave_js, columna_db in mapeo_personales.items():
            if clave_js in datos_cambio:
                valor = datos_cambio[clave_js]
                # Si es una cadena vacía en nombre/apellido, podrías querer ignorarlo o guardarlo
                conexion.execute(f"UPDATE Datos_Personales SET {columna_db} = ? WHERE usuario_id = ?", (valor, id_usuario))
                
        # 4. UI Config (PROTECCIÓN EXTREMA)
        if 'ui_config' in datos_cambio and isinstance(datos_cambio['ui_config'], dict):
            try:
                res_config = conexion.execute("SELECT ui_config FROM Datos_Personales WHERE usuario_id = ?", (id_usuario,))
                row_c = res_config.fetchone()
                
                # Verificamos si realmente hay un string JSON válido
                config_actual = {}
                if row_c and row_c[0]:
                    val_db = str(row_c[0]).strip()
                    if val_db and val_db.startswith('{'): # Solo intentamos si parece un JSON
                        try:
                            config_actual = json.loads(val_db)
                        except:
                            config_actual = {}

                config_actual.update(datos_cambio['ui_config'])
                conexion.execute("UPDATE Datos_Personales SET ui_config = ? WHERE usuario_id = ?", (json.dumps(config_actual), id_usuario))
            except Exception as e_ui:
                print(f"⚠️ Aviso: No se pudo actualizar ui_config, pero continuamos: {e_ui}")

        if not hasattr(conexion, "url"): conexion.commit()

        # 5. Retorno Normalizado para Turso
        res_vista = conexion.execute("SELECT * FROM Vista_Perfil_Usuario WHERE usuario_id = ?", (id_usuario,))
        row = res_vista.fetchone()
        
        if not row:
            return {"status": "error", "message": "Nodo no encontrado"}

        # Mapeo manual para evitar fallos de columnas en el puente
        # Ajusta los índices según el orden de tu VISTA
        if hasattr(res_vista, "columns"):
            fila = dict(zip(res_vista.columns, row))
        else:
            fila = dict(row)

        # Limpieza final del nodo para el Front
        fila['id'] = fila.get('usuario_id')
        
        # Re-parsear ui_config para que el front reciba un objeto, no un string
        if fila.get('ui_config'):
            try:
                if isinstance(fila['ui_config'], str):
                    fila['ui_config'] = json.loads(fila['ui_config'])
            except:
                fila['ui_config'] = {}

        return {"status": "success", "nodo": fila}

    except Exception as e:
        print(f"❌ [CRUD ERROR]: {str(e)}")
        return {"status": "error", "message": str(e)}
    finally:
        if conexion: conexion.close()