#!/usr/bin/env python3
"""
Generador de Documentación Técnica - Sincronización Tickets ↔ Inventario
Sistema: OTD Support
Autor: Jefferson Stic Correa Lopez
Fecha: Mayo 2026

Instrucciones:
1. pip install python-docx
2. python generate_sync_docs.py
3. Archivo generado: Sincronizacion_Tickets_Inventario_v1.0.docx
"""

from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
import datetime

def add_heading(doc, text, level=1):
    heading = doc.add_heading(text, level=level)
    heading.runs[0].font.color.rgb = RGBColor(0, 51, 102)
    return heading

def add_table(doc, headers, rows):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = 'Light Grid Accent 1'
    hdr_cells = table.rows[0].cells
    for i, header in enumerate(headers):
        hdr_cells[i].text = header
        hdr_cells[i].paragraphs[0].runs[0].font.bold = True
    for row in rows:
        row_cells = table.add_row().cells
        for i, cell_text in enumerate(row):
            row_cells[i].text = str(cell_text)
    return table

def generate_sync_docs():
    doc = Document()
    
    # PORTADA
    title = doc.add_heading('DOCUMENTACION TECNICA: SINCRONIZACION DE TICKETS E INVENTARIO', level=0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle = doc.add_paragraph('Flujo completo: Desde la creación del ticket hasta la actualización en base de datos\nSistema OTD Support')
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle.runs[0].font.size = Pt(14)
    doc.add_paragraph()
    
    meta = doc.add_table(rows=4, cols=2)
    meta.style = 'Light Grid'
    for i, (k, v) in enumerate([('Version', '1.0'), ('Fecha', datetime.datetime.now().strftime('%B %Y')), 
                                 ('Autor', 'Jefferson Stic Correa Lopez'), ('Alcance', 'Sincronización Ticket → Inventario')]):
        meta.cell(i, 0).text = k
        meta.cell(i, 1).text = v
        meta.cell(i, 0).paragraphs[0].runs[0].font.bold = True
    doc.add_page_break()
    
    # CONTENIDO
    add_heading(doc, 'CONTENIDO', level=1)
    sections = [
        '1. Fase 1: Creación y Especificación del Ticket (Frontend)',
        '2. Fase 2: Aprobación y Construcción del Payload',
        '3. Fase 3: Comunicación vía Webhook (/api/ticket-approved)',
        '4. Fase 4: Lógica de Búsqueda y Filtrado en Inventario',
        '5. Fase 5: Manejo de Monitores (Left/Right) y Activos Duplicados',
        '6. Fase 6: Actualización en BD y Respuesta del Sistema',
        '7. Mapeo de Campos y Trazabilidad'
    ]
    for s in sections:
        doc.add_paragraph(s, style='List Bullet')
    doc.add_page_break()
    
    # 1. FASE 1
    add_heading(doc, '1. FASE 1: CREACION Y ESPECIFICACION DEL TICKET (FRONTEND)', level=1)
    doc.add_paragraph(
        'El flujo de sincronización inicia cuando un usuario o agente de TI crea un ticket de soporte. '
        'Si la categoría seleccionada es "Hardware", el formulario despliega campos específicos para '
        'garantizar que el inventario pueda identificar el activo exacto a retornar o reemplazar.'
    )
    
    add_heading(doc, 'Campos críticos para la sincronización:', level=2)
    fields_headers = ['Campo en Ticket', 'Propósito', 'Impacto en Inventario']
    fields_rows = [
        ['hardware_component', 'Define el tipo de activo (ej: cable-vga, teclado, mouse)', 'Mapea a la columna Item mediante tabla de equivalencias'],
        ['asset_status', 'Estado físico o razón de retorno (Damage, Missing, Return)', 'Define la columna Tipo_Retorno en la BD'],
        ['monitor_location', 'Selector: Left / Right / Both / N/A', 'Filtra activos por columna Monitor_Location'],
        ['id_station', 'Ubicación física del problema', 'Criterio principal de búsqueda: columna Destino']
    ]
    add_table(doc, fields_headers, fields_rows)
    
    doc.add_paragraph('\n[ESPACIO PARA CAPTURA 1: Formulario de creación de ticket con campos de hardware y selector de monitor]')
    doc.add_paragraph('Nota: El sistema valida que los campos obligatorios estén completos antes de permitir la creación o edición del ticket.')
    doc.add_page_break()
    
    # 2. FASE 2
    add_heading(doc, '2. FASE 2: APROBACION Y CONSTRUCCION DEL PAYLOAD', level=1)
    doc.add_paragraph(
        'Una vez el ticket es revisado, un administrador con rol de autorización accede al modal de detalles. '
        'Al seleccionar "Authorize change" y confirmar la decisión (approved), el frontend construye un payload '
        'interno que traduce los datos del ticket a un formato que el módulo de inventario puede procesar.'
    )
    
    add_heading(doc, 'Proceso de transformación:', level=2)
    doc.add_paragraph('1. Se lee category_detail del ticket para extraer hardware_component y asset_status.')
    doc.add_paragraph('2. Se verifica si existe monitor_location explícito. Si no existe, se infiere del título/descripción.')
    doc.add_paragraph('3. Se construye el objeto JSON con las claves esperadas por el webhook.')
    doc.add_paragraph('4. Se adjunta el header X-API-Token para autenticación.')
    
    doc.add_paragraph('\n[ESPACIO PARA CAPTURA 2: Modal de autorización y decisión del administrador]')
    doc.add_page_break()
    
    # 3. FASE 3
    add_heading(doc, '3. FASE 3: COMUNICACION VIA WEBHOOK (/api/ticket-approved)', level=1)
    doc.add_paragraph('La comunicación se realiza mediante una petición HTTP POST síncrona al endpoint del módulo de inventario.')
    
    add_heading(doc, 'Estructura del Payload:', level=2)
    payload_text = '''{
  "ticketId": "97",
  "deskLocation": "COS-TMO-D-008",
  "assetItem": "Cable Display Port a VGA 1,8",
  "assetCondition": "Damage",
  "description": "USER SPECIFICATION... DAMAGE SPECIFICATION... Component: Right Screen",
  "monitorLocation": "Right"
}'''
    p = doc.add_paragraph(payload_text)
    p.runs[0].font.name = 'Consolas'
    p.runs[0].font.size = Pt(9)
    
    add_heading(doc, 'Validaciones iniciales en backend:', level=2)
    val_rows = [
        ['X-API-Token', 'Verifica coincidencia con variable de entorno INVENTORY_API_KEY'],
        ['assetCondition', 'Debe ser Return, Damage o Missing'],
        ['deskLocation', 'No puede estar vacío'],
        ['assetItem', 'Debe coincidir con al menos un registro en la tabla almacen']
    ]
    add_table(doc, ['Validación', 'Regla'], val_rows)
    
    doc.add_paragraph('\n[ESPACIO PARA CAPTURA 3: Logs de la petición POST saliente y encabezados HTTP]')
    doc.add_page_break()
    
    # 4. FASE 4
    add_heading(doc, '4. FASE 4: LOGICA DE BUSQUEDA Y FILTRADO EN INVENTARIO', level=1)
    doc.add_paragraph(
        'El backend ejecuta una estrategia de búsqueda en cascada para localizar el activo exacto. '
        'Esto es crítico cuando hay múltiples unidades del mismo tipo en una estación.'
    )
    
    add_heading(doc, 'Algoritmo de búsqueda:', level=2)
    search_steps = [
        ('Paso 1', 'Consulta: Item LIKE + Destino + Fecha_Salida IS NULL + Monitor_Location LIKE parcial'),
        ('Paso 2 (Fallback)', 'Si no hay resultado: se elimina el filtro de monitor. Se busca solo por Item + Destino + Disponible.'),
        ('Paso 3 (Fallback)', 'Si no hay resultado: se busca por componente base usando reverse map (ej: "cable-vga" → "Cable Display Port...").'),
        ('Paso 4 (Último recurso)', 'Se busca incluso si Fecha_Salida IS NOT NULL. Se retorna 404 si no hay coincidencias.')
    ]
    for step, desc in search_steps:
        doc.add_paragraph(f'{step}: {desc}', style='List Number')
        
    doc.add_paragraph('\n[ESPACIO PARA CAPTURA 4: Consulta SQL generada o logs de filtrado en consola]')
    doc.add_page_break()
    
    # 5. FASE 5
    add_heading(doc, '5. FASE 5: MANEJO DE MONITORES (LEFT/RIGHT) Y ACTIVOS DUPLICADOS', level=1)
    doc.add_paragraph(
        'Uno de los escenarios más frecuentes es la existencia de activos duplicados en la misma estación '
        '(ej: dos cables VGA idénticos, uno para monitor izquierdo y otro para derecho). El sistema resuelve '
        'este conflicto mediante la combinación de tres factores:'
    )
    
    add_heading(doc, 'Factores de diferenciación:', level=2)
    diff_headers = ['Factor', 'Implementación', 'Ejemplo']
    diff_rows = [
        ['Monitor_Location', 'Filtrado con LIKE parcial. "Right" coincide con "Right Mon", "Right Monitor", etc.', 'monitorLocation="Right" → encuentra Monitor_Location="Right Mon"'],
        ['Serial Number', 'Clave única física. Aunque Item y Destino sean iguales, el Serial diferencia la unidad.', 'DPVG00029 vs DPVG00030'],
        ['Orden de registro', 'Si hay múltiples coincidencias exactas, query.first() toma el más antiguo disponible.', 'Prioriza el activo ingresado primero al inventario']
    ]
    add_table(doc, diff_headers, diff_rows)
    
    doc.add_paragraph('Trazabilidad: Al actualizar el activo, el sistema guarda en Observaciones_Retorno el ticket ID y el componente específico. Esto permite auditar qué unidad exacta fue retornada, incluso si hay duplicados visuales.')
    doc.add_paragraph('\n[ESPACIO PARA CAPTURA 5: Vista de tabla de activos mostrando seriales únicos y columna Monitor_Location]')
    doc.add_page_break()
    
    # 6. FASE 6
    add_heading(doc, '6. FASE 6: ACTUALIZACION EN BD Y RESPUESTA DEL SISTEMA', level=1)
    doc.add_paragraph('Una vez localizado el activo, se ejecuta la transacción de actualización:')
    
    add_heading(doc, 'Cambios en la tabla almacen:', level=2)
    update_headers = ['Columna BD', 'Nuevo Valor', 'Justificación']
    update_rows = [
        ['Fecha_Salida', 'NULL', 'El activo regresa a inventario general'],
        ['Destino', 'NULL', 'Se desvincula de la estación original'],
        ['Tipo_Retorno', 'assetCondition (Damage/Missing/Return)', 'Clasifica el motivo de devolución'],
        ['Observaciones_Retorno', 'description del ticket + Ticket #ID', 'Auditoría y contexto técnico'],
        ['Sede_Actual', 'NULL', 'Queda disponible para reasignación']
    ]
    add_table(doc, update_headers, update_rows)
    
    add_heading(doc, 'Lógica de reemplazo automático:', level=2)
    doc.add_paragraph('Si assetCondition es Damage o Missing, el sistema busca inmediatamente un activo de reemplazo:')
    doc.add_paragraph('• Criterio: Item exacto + Destino IS NULL + Fecha_Salida IS NULL + Tipo_Retorno IS NULL')
    doc.add_paragraph('• Si encuentra: Asigna el reemplazo a la estación original y actualiza su Fecha_Salida.')
    doc.add_paragraph('• Si no encuentra: Retorna éxito con advertencia "No hay activo de reemplazo disponible".')
    
    doc.add_paragraph('\n[ESPACIO PARA CAPTURA 6: Respuesta HTTP 200 OK y registro en change_history]')
    doc.add_page_break()
    
    # 7. MAPEO
    add_heading(doc, '7. MAPEO DE CAMPOS Y TRAZABILIDAD', level=1)
    doc.add_paragraph('Resumen de transformación de datos entre sistemas:')
    
    map_headers = ['Campo en Ticket', 'Campo en Inventario', 'Tipo de Mapeo']
    map_rows = [
        ['id_station', 'Destino', 'Directo (string)'],
        ['hardware_component', 'Item', 'Tabla de equivalencias (_HARDWARE_COMPONENT_MAP)'],
        ['asset_status', 'Tipo_Retorno', 'Directo (capitalizado)'],
        ['monitor_location', 'Monitor_Location', 'Directo (se usa LIKE parcial en búsqueda)'],
        ['description + ticketId', 'Observaciones_Retorno', 'Concatenación para auditoría'],
        ['N/A', 'Fecha_Salida', 'Forzado a NULL al retornar'],
        ['N/A', 'Serial', 'No se modifica (identificador único físico)']
    ]
    add_table(doc, map_headers, map_rows)
    
    add_heading(doc, 'Consideraciones finales:', level=2)
    doc.add_paragraph('• La sincronización es síncrona: el frontend espera la respuesta del webhook antes de confirmar la aprobación.')
    doc.add_paragraph('• Si el webhook falla (timeout, error 500, 404), se registra el error en change_history y se notifica al admin.')
    doc.add_paragraph('• Los activos duplicados no generan conflictos gracias al filtrado por Monitor_Location y Serial.')
    doc.add_paragraph('• Todo el flujo queda registrado en change_history para auditoría completa.')
    
    # FOOTER
    doc.add_paragraph()
    footer = doc.add_paragraph()
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer_run = footer.add_run(
        f'\nVersion: 1.0\nFecha: {datetime.datetime.now().strftime("%B %Y")}\n'
        f'Sistema: OTD Support - Sincronización Tickets ↔ Inventario\n'
        f'Elaborado por: Jefferson Stic Correa Lopez - OTD TEAM DEVELOPMENT\n'
        f'Nota: Reemplazar los marcadores [ESPACIO PARA CAPTURA X] con las imágenes correspondientes.'
    )
    footer_run.font.size = Pt(9)
    footer_run.font.color.rgb = RGBColor(102, 102, 102)
    
    # GUARDAR
    output = 'Sincronizacion_Tickets_Inventario_v1.0.docx'
    doc.save(output)
    print(f'Documento generado: {output}')
    return output

if __name__ == '__main__':
    try:
        generate_sync_docs()
        print('\nListo! Abra el archivo .docx e inserte sus capturas en los espacios marcados.')
    except ImportError:
        print('Error: Instale python-docx con: pip install python-docx')
    except Exception as e:
        print(f'Error: {e}')
        raise