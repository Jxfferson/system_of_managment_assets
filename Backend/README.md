# Backend - Sistema de Gestión de Activos (FastAPI)

## Estructura de carpetas

```
Backend/
├── app/
│   ├── config/
│   │   ├── __init__.py
│   │   └── database.py         ← Conexión a MariaDB con SQLAlchemy
│   ├── models/
│   │   ├── __init__.py
│   │   └── almacen.py          ← Modelo de la tabla ALMACEN
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── almacen.py          ← Validación de datos con Pydantic
│   ├── routers/
│   │   ├── __init__.py
│   │   └── almacen.py          ← Endpoints CRUD
│   ├── middlewares/
│   │   └── __init__.py
│   ├── __init__.py
│   └── main.py                 ← Punto de entrada FastAPI
├── .env                       
├── .env.example
├── .gitignore
└── requirements.txt
```

## Configuración

Edita el archivo `.env`:

```env
PORT=8000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=InventarioColombiaIT
```

## Iniciar el servidor

```bash
uvicorn app.main:app --reload --port 8000
```

## Documentación automática

FastAPI genera docs automáticamente:
- Swagger UI: http://localhost:8000/docs
- ReDoc:       http://localhost:8000/redoc

## Endpoints disponibles

| Método | Ruta                           | Descripción             |
|--------|--------------------------------|-------------------------|
| GET    | /api/almacen                   | Obtener todos los items |
| GET    | /api/almacen?search=cable      | Buscar items            |
| GET    | /api/almacen/{id}              | Obtener item por ID     |
| POST   | /api/almacen                   | Crear nuevo item        |
| PUT    | /api/almacen/{id}              | Actualizar item         |
| DELETE | /api/almacen/{id}              | Eliminar item           |

## Ejemplo POST

```json
{
  "Item": "Cable Display Port a VGA 1.8",
  "Serial": "DPVG001",
  "Fecha_Ingreso": "2025-12-16",
  "Fecha_Salida": null,
  "Destino": null
}
```
