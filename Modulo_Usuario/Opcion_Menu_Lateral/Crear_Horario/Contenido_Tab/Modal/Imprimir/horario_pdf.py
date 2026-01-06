# Modulo_Usuario\Opcion_Menu_Lateral\Crear_Horario\Contenido_Tab\Tab_Excel\Operaciones\Nuevo\horario_pdf.py
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas

def generar_pdf_horarios(schedules, ruta):

    c = canvas.Canvas(ruta, pagesize=landscape(A4))
    width, height = landscape(A4)

    c.setFont("Helvetica", 8)

    y = height - 40

    for i, horario in enumerate(schedules, start=1):
        c.drawString(40, y, f"Horario {i}")
        y -= 15

        for curso in horario:
            c.drawString(
                60,
                y,
                f"{curso['subject']} - {curso['teacher']}"
            )
            y -= 12

        c.showPage()
        y = height - 40

    c.save()
