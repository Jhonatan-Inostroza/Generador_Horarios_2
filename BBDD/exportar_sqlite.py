import sqlite3
import os

# Es recomendable usar rutas relativas o asegurarse de que el directorio existe
db_path = "Usuario/usuarios.db"
output_file = "usuarios_completo.sql"

def exportar_db():
    try:
        # Verificamos si la base de datos existe para evitar errores
        if not os.path.exists(db_path):
            print(f"Error: No se encontró el archivo {db_path}")
            return

        conn = sqlite3.connect(db_path)
        
        # Abrimos el archivo con codificación utf-8
        with open(output_file, "w", encoding="utf-8") as f:
            # iterdump genera el esquema (tablas, índices, vistas) y los datos
            for line in conn.iterdump():
                f.write(f"{line}\n")
        
        conn.close()
        print(f"Éxito: Base de datos (tablas y vistas) exportada a {output_file}")

    except sqlite3.Error as e:
        print(f"Error de SQLite: {e}")
    except Exception as e:
        print(f"Ocurrió un error inesperado: {e}")

if __name__ == "__main__":
    exportar_db()