import colorsys
import re  # <--- FALTA ESTE IMPORT
from flask import Blueprint, request, send_file
from io import BytesIO
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import mm

print_horarios_bp = Blueprint('print_horarios', __name__)

def hsl_to_reportlab_rgb(hsl_str):
    try:
        # Extrae números de "hsl(120, 50%, 45%)"
        vals = re.findall(r'\d+', hsl_str)
        h, s, l = int(vals[0])/360.0, int(vals[1])/100.0, int(vals[2])/100.0
        r, g, b = colorsys.hls_to_rgb(h, l, s)
        return (r, g, b)
    except:
        return (0.46, 0.44, 0.93) # Un violeta elegante por defecto

@print_horarios_bp.route('/imprimir-horarios', methods=['POST'])
def imprimir_horarios():
    data = request.get_json()
    horarios = data.get('horarios', [])
    buffer = BytesIO()
    
    pdf = canvas.Canvas(buffer, pagesize=landscape(A4))
    w_page, h_page = landscape(A4)
    days = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']

    for idx, horario in enumerate(horarios):
        start_hours = [int(b['start'].split(':')[0]) for b in horario]
        min_h, max_h = (min(start_hours), max(start_hours) + 1) if start_hours else (7, 22)
        
        current_hours_labels = [f"{h:02d}:00" for h in range(min_h, max_h + 1)]
        num_rows = len(current_hours_labels)

        # Configuración de márgenes
        margin_x, margin_y = 35, 30
        top_offset = 50 
        
        draw_width = w_page - (margin_x * 2)
        draw_height = h_page - (margin_y * 2) - top_offset
        
        cell_w = draw_width / (len(days) + 1)
        cell_h = draw_height / (num_rows + 1)

        # FONDO Y TÍTULO PREMIUM
        pdf.setFillColorRGB(0.12, 0.16, 0.23) # Color Navy oscuro
        pdf.rect(0, h_page - 45, w_page, 45, fill=1, stroke=0)
        
        pdf.setFillColor(colors.white)
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(margin_x, h_page - 28, f"HORARIO ACADÉMICO")
        
        pdf.setFont("Helvetica", 10)
        pdf.drawRightString(w_page - margin_x, h_page - 28, f"OPCIÓN SELECCIONADA N° {idx + 1}")

        y_cursor = h_page - margin_y - top_offset

        # CABECERAS (Días)
        pdf.setStrokeColorRGB(0.8, 0.8, 0.8)
        pdf.setLineWidth(0.5)
        pdf.setFillColorRGB(0.96, 0.97, 0.98) # Gris muy claro
        pdf.roundRect(margin_x, y_cursor - cell_h, draw_width, cell_h, 4, fill=1, stroke=1)
        
        pdf.setFillColorRGB(0.3, 0.3, 0.4)
        pdf.setFont("Helvetica-Bold", 9)
        pdf.drawCentredString(margin_x + cell_w/2, y_cursor - (cell_h * 0.6), "HORA")
        
        for i, day in enumerate(days):
            x = margin_x + (i + 1) * cell_w
            pdf.drawCentredString(x + cell_w/2, y_cursor - (cell_h * 0.6), day)

        # CUADRÍCULA DE HORAS
        pdf.setFillColor(colors.black)
        pdf.setFont("Helvetica", 8)
        for i, label in enumerate(current_hours_labels):
            row_y = y_cursor - (i + 2) * cell_h
            # Línea horizontal tenue
            pdf.setStrokeColorRGB(0.9, 0.9, 0.9)
            pdf.line(margin_x, row_y, margin_x + draw_width, row_y)
            pdf.drawCentredString(margin_x + cell_w/2, row_y + (cell_h * 0.4), label)

        # PINTADO DE CURSOS (Efecto Tarjeta)
        for bloque in horario:
            try:
                d_idx = days.index(bloque['day'].upper())
                h_val = int(bloque['start'].split(':')[0])
                row_idx = h_val - min_h
                
                x_b = margin_x + (d_idx + 1) * cell_w
                y_b = y_cursor - (row_idx + 2) * cell_h
                
                # Sombra/Borde del bloque
                r, g, b = hsl_to_reportlab_rgb(bloque.get('color', ''))
                pdf.setFillColorRGB(r, g, b)
                # Dibujamos un rectángulo redondeado con relleno
                pdf.roundRect(x_b + 2, y_b + 2, cell_w - 4, cell_h - 4, 5, fill=1, stroke=0)
                
                # Texto Blanco
                pdf.setFillColor(colors.white)
                f_size = 7.5
                pdf.setFont("Helvetica-Bold", f_size)
                # Truncar texto si es muy largo
                asig = bloque['asignatura']
                if len(asig) > 20: asig = asig[:18] + "..."
                
                pdf.drawCentredString(x_b + cell_w/2, y_b + (cell_h * 0.55), asig.upper())
                pdf.setFont("Helvetica", f_size - 1)
                pdf.drawCentredString(x_b + cell_w/2, y_b + (cell_h * 0.25), f"GRUPO: {bloque['grupo']}")
            except: continue

        pdf.showPage()

    pdf.save()
    buffer.seek(0)
    return send_file(buffer, as_attachment=False, download_name="horario_premium.pdf", mimetype="application/pdf")