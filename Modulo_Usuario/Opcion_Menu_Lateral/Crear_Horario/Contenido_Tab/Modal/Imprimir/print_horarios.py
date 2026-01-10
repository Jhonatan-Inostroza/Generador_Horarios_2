import colorsys
import re
import os
import urllib.request
from flask import Blueprint, request, send_file
from io import BytesIO
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

print_horarios_bp = Blueprint('print_horarios', __name__)

# --- CONFIGURACIÓN DE FUENTE DE PLUMA (Para el Footer) ---
FONT_PATH = "GreatVibes-Regular.ttf"
FONT_URL = "https://github.com/google/fonts/raw/main/ofl/greatvibes/GreatVibes-Regular.ttf"

def cargar_fuente_pluma():
    if not os.path.exists(FONT_PATH):
        try:
            urllib.request.urlretrieve(FONT_URL, FONT_PATH)
        except:
            return "Times-Italic"
    
    try:
        pdfmetrics.registerFont(TTFont('PlumaReal', FONT_PATH))
        return 'PlumaReal'
    except:
        return "Times-Italic"

# --- ESTILOS DE IMPRESIÓN ---
COLOR_PRIMARY_DARK = colors.black
COLOR_GRID = colors.black
COLOR_HEADER_DAYS = colors.HexColor("#F2F2F2")

def hsl_to_reportlab_rgb(hsl_str):
    try:
        vals = re.findall(r'\d+', hsl_str)
        h, s, l = int(vals[0])/360.0, int(vals[1])/100.0, int(vals[2])/100.0
        r, g, b = colorsys.hls_to_rgb(h, l, s)
        return (r, g, b)
    except:
        return (0.47, 0.54, 0.64)

def draw_wrapped_course(pdf, asignatura, grupo, x, y, max_width):
    font_asig = "Helvetica-Bold"
    size_asig = 11
    font_grupo = "Helvetica"
    size_grupo = 9
    
    words = asignatura.split()
    lines = []
    current_line = ""
    limit = max_width - 12
    
    for word in words:
        test_line = current_line + " " + word if current_line else word
        if pdf.stringWidth(test_line, font_asig, size_asig) < limit:
            current_line = test_line
        else:
            lines.append(current_line)
            current_line = word
    lines.append(current_line)

    line_height = size_asig + 2
    total_text_h = (len(lines) * line_height) + size_grupo + 2
    current_y = y + (total_text_h / 2) - size_asig

    pdf.setFillColor(colors.white)
    pdf.setFont(font_asig, size_asig)
    for line in lines:
        pdf.drawCentredString(x, current_y, line)
        current_y -= line_height

    pdf.setFont(font_grupo, size_grupo)
    pdf.setFillColorRGB(0.98, 0.98, 0.98)
    pdf.drawCentredString(x, current_y - 2, f"GRUPO {grupo}")

@print_horarios_bp.route('/imprimir-horarios', methods=['POST'])
def imprimir_horarios():
    data = request.get_json()
    horarios = data.get('horarios', [])
    buffer = BytesIO()
    
    fuente_firma = cargar_fuente_pluma()
    pdf = canvas.Canvas(buffer, pagesize=landscape(A4))
    w_page, h_page = landscape(A4)
    days = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']

    for idx, horario in enumerate(horarios):
        horario.sort(key=lambda x: (days.index(x['day'].upper()), int(x['start'].split(':')[0])))
        bloques_combinados = []
        if horario:
            actual = horario[0].copy()
            actual['duracion'] = 1
            for i in range(1, len(horario)):
                sig = horario[i]
                h_actual_fin = int(actual['start'].split(':')[0]) + actual['duracion']
                if (sig['asignatura'] == actual['asignatura'] and 
                    sig['day'].upper() == actual['day'].upper() and 
                    int(sig['start'].split(':')[0]) == h_actual_fin):
                    actual['duracion'] += 1
                else:
                    bloques_combinados.append(actual)
                    actual = sig.copy()
                    actual['duracion'] = 1
            bloques_combinados.append(actual)

        start_hours = [int(b['start'].split(':')[0]) for b in horario]
        min_h, max_h = (min(start_hours), max(start_hours) + 1) if start_hours else (7, 21)
        current_hours = [h for h in range(min_h, max_h)]
        
        margin_x, margin_y, top_offset = 40, 45, 60
        draw_width = w_page - (margin_x * 2)
        draw_height = h_page - (margin_y * 2) - top_offset
        cell_w = draw_width / (len(days) + 1)
        cell_h = draw_height / (len(current_hours) + 1)
        y_cursor = h_page - 45 - top_offset

        # --- 1. HEADER ---
        pdf.setFillColor(COLOR_PRIMARY_DARK)
        pdf.rect(0, h_page - 55, w_page, 55, fill=1, stroke=0)
        pdf.setFillColor(colors.white)
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(margin_x, h_page - 35, "HORARIO ACADÉMICO")
        pdf.setFont("Helvetica", 9)
        pdf.drawRightString(w_page - margin_x, h_page - 35, f"CIVICNET • OPCIÓN {idx + 1}")

        # --- 2. CABECERA DE DÍAS ---
        pdf.setFillColor(COLOR_HEADER_DAYS)
        pdf.rect(margin_x, y_cursor - cell_h, draw_width, cell_h, fill=1, stroke=1)
        pdf.setFillColor(colors.black)
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawCentredString(margin_x + cell_w/2, y_cursor - (cell_h * 0.65), "HORARIO")
        for i, day in enumerate(days):
            pdf.drawCentredString(margin_x + (i + 1) * cell_w + cell_w/2, y_cursor - (cell_h * 0.65), day)

        # --- 3. FILAS DE HORAS ---
        pdf.setFont("Helvetica-Bold", 11)
        for i, h in enumerate(current_hours):
            row_y = y_cursor - (i + 2) * cell_h
            pdf.setFillColor(colors.black)
            pdf.drawCentredString(margin_x + cell_w/2, row_y + (cell_h * 0.45), f"{h:02d}:00 - {h+1:02d}:00")

        # --- 4. GRILLA NEGRA ---
        pdf.setStrokeColor(colors.black)
        pdf.setLineWidth(0.5)
        for i in range(len(current_hours) + 2):
            pdf.line(margin_x, y_cursor - i * cell_h, margin_x + draw_width, y_cursor - i * cell_h)
        for i in range(len(days) + 2):
            pdf.line(margin_x + i * cell_w, y_cursor, margin_x + i * cell_w, y_cursor - draw_height)
        
        pdf.setLineWidth(1.2)
        pdf.rect(margin_x, y_cursor - draw_height, draw_width, draw_height, fill=0, stroke=1)

        # --- 5. BLOQUES DE CURSOS ---
        for bloque in bloques_combinados:
            try:
                d_idx = days.index(bloque['day'].upper())
                row_idx = int(bloque['start'].split(':')[0]) - min_h
                x_b = margin_x + (d_idx + 1) * cell_w
                y_b_top = y_cursor - (row_idx + 1) * cell_h
                h_total = cell_h * bloque['duracion']
                
                r, g, b = hsl_to_reportlab_rgb(bloque.get('color', ''))
                pdf.setFillColorRGB(r, g, b)
                pdf.roundRect(x_b + 2.5, y_b_top - h_total + 2.5, cell_w - 5, h_total - 5, 5, fill=1, stroke=0)
                
                draw_wrapped_course(pdf, bloque['asignatura'].upper(), bloque['grupo'],
                                    x_b + cell_w/2, y_b_top - (h_total/2), cell_w)
            except: continue

        # --- 6. FOOTER CON FIRMA (GreatVibes) ---
        footer_y = 20
        pdf.setStrokeColor(colors.black)
        pdf.setLineWidth(0.8)
        pdf.line(margin_x, footer_y + 20, w_page - margin_x, footer_y + 20)

        pdf.setFillColor(colors.black)
        pdf.setFont(fuente_firma, 18)
        pdf.drawString(margin_x, footer_y + 2, "Civicnet")
        pdf.setFont(fuente_firma, 14)
        pdf.drawRightString(w_page - margin_x, footer_y + 4, "Created by Jhonatan Inostroza")
        pdf.setFont(fuente_firma, 11)
        pdf.drawRightString(w_page - margin_x, footer_y - 8, "Collaborator: Fabian Campoverde")

        # --- 7. MARCA DE AGUA (AL FINAL PARA ESTAR POR ENCIMA) ---
        pdf.saveState()
        pdf.setFont("Times-BoldItalic", 45)
        pdf.setFillColor(colors.black)
        pdf.setFillAlpha(0.08) # Un pelín más visible para que destaque sobre los colores
        pdf.translate(w_page/2, h_page/2)
        pdf.rotate(30)
        pdf.drawCentredString(0, 35, "CIVICNET - Core")
        pdf.setFont("Times-Italic", 20)
        pdf.drawCentredString(0, 0, "Propiedad de Jhonatan Inostroza & Fabian Campoverde")
        pdf.restoreState()

        pdf.showPage()

    pdf.save()
    buffer.seek(0)
    return send_file(buffer, as_attachment=False, download_name="horario_civicnet_final.pdf", mimetype="application/pdf")