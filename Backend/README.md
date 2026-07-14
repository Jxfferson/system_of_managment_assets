# ⚙️ Backend - Sistema de Gestión de Activos (FastAPI)

API REST robusta y de alto rendimiento desarrollada en **FastAPI** para la gestión integral del inventario de activos de la empresa. Se conecta a una base de datos **MariaDB** mediante **SQLAlchemy** y proporciona los datos necesarios para el dashboard de analítica, la gestión de estaciones y la sincronización con el sistema de tickets.

## 🚀 Características Principales

- **Gestión de Inventario (Almacén):** CRUD completo de items y activos, con soporte para búsqueda avanzada y registro por lotes.
- **Historial de Estaciones:** Trazabilidad de los movimientos y cambios de ubicación de los activos (`station_change_history`).
- **Analítica y Rendimiento:** Endpoints dedicados a alimentar los gráficos del frontend (entradas/salidas, rendimiento por categoría, tipos de retorno).
- **Sincronización con Tickets:** Webhook seguro para recibir actualizaciones de estado desde el sistema de tickets de soporte externo.
- **Validación de Escaneo:** Endpoint para procesar y validar la lectura de códigos de activos desde el módulo de escáner del frontend.
- **Generación de Documentación:** Scripts automatizados en Python para generar manuales de usuario y documentos de seguridad en formato `.docx`.

---

## 📁 Estructura de Carpetas

  Backend/
  ├── app/
  │   ├── config/
  │   │   ├── __init__.py
  │   │   └── database.py         ← Conexión a MariaDB con SQLAlchemy
  │   ├── models/
  │   │   ├── __init__.py
  │   │   ├── almacen.py          ← Modelo principal de la tabla ALMACEN
  │   │   ├── item.py             ← Modelo para gestión detallada de items
  │   │   └── station_change_history.py ← Historial de movimientos de estaciones
  │   ├── schemas/
  │   │   ├── __init__.py
  │   │   ├── almacen.py          ← Validación de datos de entrada/salida (Pydantic)
  │   │   └── analytics.py        ← Esquemas para respuestas de analítica
  │   ├── routers/
  │   │   ├── __init__.py
  │   │   ├── almacen.py          ← Endpoints CRUD principales
  │   │   ├── analytics.py        ← Endpoints para gráficos y estadísticas
  │   │   ├── scanner.py          ← Endpoint para validación de escaneos
  │   │   └── ticket_webhook.py   ← Endpoint para recibir actualizaciones de tickets
  │   ├── middlewares/
  │   │   └── __init__.py         ← Middlewares de seguridad y CORS
  │   ├── __init__.py
  │   └── main.py                 ← Punto de entrada de la aplicación FastAPI
  ├── .env                        ← Variables de entorno (NO subir a git)
  ├── .env.example                ← Plantilla de variables de entorno
  ├── .gitignore
  ├── requirements.txt            ← Dependencias de Python
  ├── sync_docx.py                ← Script para generar manual de sincronización
  └── python_security_doc.py      ← Script para generar documento de seguridad

## ⚙️ Configuración
** 1. Crea un entorno virtual e instala las dependencias: **

   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   pip install -r requirements.txt

** 2. Crea el archivo .env basado en el ejemplo y configura tus credenciales: **
   PORT=8000
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=tu_contraseña
  DB_NAME=InventarioColombiaIT
** 3.Asegúrate de que la base de datos InventarioColombiaIT esté creada en MariaDB antes de iniciar. **

▶️ Iniciar el Servidor

Ejecuta el servidor de desarrollo con recarga automática:

  ** uvicorn app.main:app --reload --port 8000 **

## 📚 Documentación Automática de la API
  FastAPI genera documentación interactiva automáticamente basada en los schemas y routers:
  Swagger UI: http://localhost:8000/docs
  ReDoc: http://localhost:8000/redoc
  
# 🔌 Endpoints Disponibles

## 📦 Almacén e Inventario (/api/almacen)

**Método,Ruta,Descripción**
GET,/api/almacen,Obtener todos los items (soporta paginación)
GET,/api/almacen?search=cable,"Buscar items por nombre, serial o destino"
GET,/api/almacen/{id},Obtener detalle de un item por su ID
POST,/api/almacen,Crear un nuevo item o lote de items
PUT,/api/almacen/{id},Actualizar información de un item
DELETE,/api/almacen/{id},Eliminar o dar de baja un item

## 📊 Analítica y Estadísticas (/api/analytics)

**Método,Ruta,Descripción**
GET,/api/analytics/summary,"Resumen general de activos (totales, por estado)"
GET,/api/analytics/entry-exit,Datos históricos de entradas y salidas por rango de fechas
GET,/api/analytics/return-types,Distribución de tipos de retorno de activos
GET,/api/analytics/performance,Métricas de rendimiento por categoría de item

## 🔄 Estaciones e Historial (/api/stations)

**Método,Ruta,Descripción**
GET,/api/stations/{id}/history,"Obtener el historial de cambios de ubicación de una estación"

## 📱 Escáner y Webhooks

**Método,Ruta,Descripción**
POST,/api/scanner/validate,Validar un código escaneado y devolver la info del activo
POST,/api/webhooks/ticket,Recibir actualizaciones de estado desde el sistema de tickets

## 📝 Ejemplo de Solicitud (POST)
Crear un nuevo item en el almacén:

POST /api/almacen
Content-Type: application/json

{
  "Item": "Cable Display Port a VGA 1.8m",
  "Serial": "DPVG001",
  "Fecha_Ingreso": "2025-12-16",
  "Fecha_Salida": null,
  "Destino": null,
  "Categoria": "Periféricos",
  "Estado": "Disponible"
}


🛡️ Seguridad y Buenas Prácticas
Las contraseñas y credenciales de base de datos nunca deben subirse al repositorio (manejadas vía .env).
Se utiliza Pydantic para validar estrictamente todos los datos de entrada, previniendo inyecciones y datos malformados.
El middleware de CORS está configurado para aceptar solicitudes únicamente desde el dominio del frontend autorizado.
