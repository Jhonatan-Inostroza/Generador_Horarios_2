import os
import shutil



# Ruta base donde está Conexion.py (PagGestion_de_Accesoina/Conexion)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Ruta a la base de datos original en el proyecto
DB_ORIGINAL = os.path.abspath(
    os.path.join(BASE_DIR, "..","..","BBDD","usuarios.db")
)


# Determinamos la ruta final según el entorno
if os.environ.get('VERCEL'):
    # En Vercel, usamos la carpeta /tmp que es escribible
    DB_PATH = "/tmp/usuarios.db"
    
    # Si la base de datos no ha sido copiada a /tmp aún, la copiamos
    if not os.path.exists(DB_PATH):
        shutil.copy2(DB_ORIGINAL, DB_PATH)
else:
    # En tu computadora, seguimos usando la carpeta Usuario/
    DB_PATH = DB_ORIGINAL

