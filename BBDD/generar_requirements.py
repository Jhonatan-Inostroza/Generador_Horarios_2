import os

def crear_requirements_final():
    # Esta lista incluye TODO lo que tu proyecto necesita para funcionar
    # Flask para el servidor, Pandas/Numpy para los cálculos de EA/ER,
    # y libsql-client para que tu base de datos sea PERMANENTE.
    dependencias = [
        "Flask==3.1.2",
"libsql-client",
"pandas==2.3.3",
"numpy==2.3.5",
"openpyxl==3.1.5",
"reportlab==4.4.7",
"python-dateutil==2.9.0.post0",
"Werkzeug==3.1.4",
"Jinja2==3.1.6",
"MarkupSafe==3.0.",
"itsdangerous==2.2.0",
"click==8.3.1",
"blinker==1.9.0",
"pytz==2025.2",
"six==1.17.0",
"tzdata==2025.3",
"colorama==0.4.6",
"et_xmlfile==2.0.0"
    ]
    
    # Buscamos la carpeta raíz: C:\Users\Jhonatan Inostroza\Desktop\Proyectos\Generar_Horarios
    # Subimos un nivel desde la carpeta BBDD
    ruta_raiz = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    archivo_path = os.path.join(ruta_raiz, "requirement.txt")
    
    try:
        # Escribimos el archivo en la raíz del proyecto
        with open(archivo_path, "w", encoding="utf-8") as f:
            for dep in dependencias:
                f.write(dep + "\n")
        print("-" * 50)
        print(f"✅ ¡ÉXITO! Archivo generado en: {archivo_path}")
        print(f"🚀 Se incluyeron {len(dependencias)} librerías críticas.")
        print("-" * 50)
    except Exception as e:
        print(f"❌ Error al escribir el archivo: {e}")

if __name__ == "__main__":
    crear_requirements_final()