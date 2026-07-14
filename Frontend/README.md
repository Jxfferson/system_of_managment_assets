# 🖥️ Sistema de Gestión de Activos - Frontend

Interfaz web desarrollada en React para la administración y análisis del inventario de activos de la empresa. Permite gestionar equipos, consultar estadísticas de rendimiento, visualizar el detalle de estaciones de trabajo y escanear códigos de activos.

## 🚀 Características

###  Gestión de Activos
- Registro y edición de activos individuales y por lotes (AssetForm, AssetLotForm)
- Tabla de activos con filtros avanzados (AssetFilters, AssetTable)
- Gestión de items por categoría (ItemManager)
- Administración completa desde el panel de administrador (AssetManager)

### 🖥️ Identificación de Monitores
- Separación y etiquetado de monitores (Monitor 1, Monitor 2) dentro de cada estación
- Asociación visual de cada monitor a su estación de trabajo correspondiente

###  Análisis y Estadísticas
- Panel de análisis con gráficos de rendimiento (AnalyticsCharts, BarChart)
- Comparación entre categorías de activos (CategoryComparison)
- Resumen analítico con métricas clave (AnalyticsSummary)
- Lista de recomendaciones basada en datos (RecommendationsList)
- Vista consolidada de todas las categorías (AllCategoriesView)
- Gráfico de entradas y salidas por rango de fechas (EntryExitChart)
- Gráfico de tipos de retorno (ReturnTypeChart)
- Tarjetas de estadísticas resumidas (StatsCards)
- Página de estadísticas por item (ItemStatisticsPage)

###  Detalle de Estación
- Modal con información completa de la estación (StationDetailModal)
- Historial de cambios de la estación (StationHistoryModal)
- Tarjetas visuales de activos asignados (AssetCard)
- Formulario para agregar items a la estación (AddItemForm)

###  Escaneo de Activos
- Módulo de escaneo de códigos de activos
- Tests end-to-end con Cypress (cypress/e2e/scanner.cy.js)

### 📤 Exportación
- Menú de exportación de datos (ExportMenu)
- Exportación de análisis a formatos externos (exportAnalytics.js)

### 🎨 Interfaz de Usuario
- Diseño con efectos visuales (AnimatedBackground, LightRays, GlassCard)
- Pantalla de carga animada (SplashScreen, LoadingAnimation)
- Componentes UI reutilizables (Modal, DatePicker, TimePicker, Select, Input, Textarea)
- Sistema de notificaciones (toast)
- Rutas protegidas por autenticación (ProtectedRoute)
- Navegación con scroll to top

## 🛠️ Tecnologías

- **React 18** - Librería de UI
- **Vite** - Build tool y servidor de desarrollo
- **Tailwind CSS** - Estilos
- **Cypress** - Tests end-to-end
- **ESLint** - Linting de código

## 📁 Estructura
Frontend/
├── src/
│ ├── components/
│ │ ├── admin/ # Panel de administración
│ │ ├── analytics/ # Gráficos y análisis
│ │ ├── item-detail/ # Detalle de items
│ │ ├── station/ # Gestión de estaciones
│ │ ├── statistics/ # Estadísticas
│ │ └── ui/ # Componentes reutilizables
│ ├── services/ # Llamadas al backend
│ ├── hooks/ # Custom hooks
│ └── utils/ # Funciones auxiliares
├── cypress/ # Tests E2E
└── public/

## ⚙️ Instalación

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
