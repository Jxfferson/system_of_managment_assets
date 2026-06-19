import * as XLSX from 'xlsx';

// Estilos para celdas
const getCellStyle = (bold = false, bgColor = null, fontSize = 11) => ({
  font: { bold, size: fontSize, color: { rgb: "000000" } },
  fill: bgColor ? { fgColor: { rgb: bgColor } } : null,
  alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
  border: {
    top: { style: 'thin', color: { rgb: "CCCCCC" } },
    bottom: { style: 'thin', color: { rgb: "CCCCCC" } },
    left: { style: 'thin', color: { rgb: "CCCCCC" } },
    right: { style: 'thin', color: { rgb: "CCCCCC" } }
  }
});

const getHeaderStyle = (bgColor) => ({
  font: { bold: true, size: 14, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: bgColor } },
  alignment: { horizontal: 'left', vertical: 'center' },
  border: {
    top: { style: 'medium', color: { rgb: "000000" } },
    bottom: { style: 'medium', color: { rgb: "000000" } },
    left: { style: 'medium', color: { rgb: "000000" } },
    right: { style: 'medium', color: { rgb: "000000" } }
  }
});

const getSubHeaderStyle = (bgColor) => ({
  font: { bold: true, size: 12, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: bgColor } },
  alignment: { horizontal: 'left', vertical: 'center' },
  border: {
    top: { style: 'thin', color: { rgb: "000000" } },
    bottom: { style: 'thin', color: { rgb: "000000" } },
    left: { style: 'thin', color: { rgb: "000000" } },
    right: { style: 'thin', color: { rgb: "000000" } }
  }
});

export const exportAnalyticsToExcel = (data, filename = 'analytics-report') => {
  const wb = XLSX.utils.book_new();

  // ============================================
  // HOJA 1: DOCUMENTACIÓN - Explicación de métricas
  // ============================================
  const readmeData = [
    // Título principal
    ['INVENTORY ANALYTICS - DOCUMENTACIÓN DE MÉTRICAS'],
    [''],
    ['Fecha de generación:', new Date().toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })],
    [''],
    [''],
    // Sección 1: Total Outputs
    ['1. TOTAL OUTPUTS (Total de Salidas)'],
    [''],
    ['Definición:', 'Número total de veces que un activo ha sido asignado a una estación de trabajo desde el inventario.'],
    [''],
    ['Fórmula:', 'SELECT COUNT(*) FROM ALMACEN WHERE Item = [nombre_item] AND Fecha_Salida IS NOT NULL'],
    [''],
    ['Ejemplo práctico:', 'Si un teclado se ha asignado 37 veces a diferentes estaciones, Total Outputs = 37'],
    [''],
    [''],
    // Sección 2: Failure Rate
    ['2. FAILURE RATE (Tasa de Fallo)'],
    [''],
    ['Definición:', 'Porcentaje de activos que fueron retornados por daño o pérdida respecto al total de asignaciones.'],
    [''],
    ['Fórmula:', 'Failure Rate = (Número de Fallos / Total Outputs) x 100'],
    [''],
    ['Dónde:', 'Número de Fallos = COUNT(Tipo_Retorno IN ["Damage", "Missing"])'],
    ['', 'Total Outputs = Total de asignaciones del item'],
    [''],
    ['Interpretación:', '0% = Excelente (ningún fallo registrado)'],
    ['', '1-10% = Bueno (tasa de fallo aceptable)'],
    ['', '11-20% = Regular (considerar cambiar de proveedor)'],
    ['', 'Mayor 20% = Malo (reemplazar inmediatamente)'],
    [''],
    ['Ejemplo práctico:', 'Si un cable tuvo 18 fallos de 98 salidas totales:'],
    ['', 'Failure Rate = (18 / 98) x 100 = 18.37%'],
    [''],
    [''],
    // Sección 3: Lifespan
    ['3. LIFESPAN (Vida Útil Promedio)'],
    [''],
    ['Definición:', 'Tiempo promedio que un activo permanece en uso antes de ser retornado por daño o pérdida.'],
    [''],
    ['Fórmula:', 'Lifespan = AVG(DATEDIFF(Fecha_Salida, Fecha_Ingreso)) / 30'],
    [''],
    ['Dónde:', 'DATEDIFF calcula la diferencia en días entre fechas'],
    ['', 'Se divide entre 30 para convertir a meses'],
    ['', 'Solo se calcula para items con Tipo_Retorno = Damage o Missing'],
    [''],
    ['Nota importante:', 'Los retornos voluntarios (Tipo_Retorno = NULL o "Return") no se incluyen en el cálculo'],
    ['', 'porque el activo sigue siendo usable y su ciclo de vida no ha terminado.'],
    [''],
    ['Ejemplo práctico:', 'Si un cable Display Port duró en promedio 204 días antes de dañarse:'],
    ['', 'Lifespan = 204 / 30 = 6.81 meses'],
    [''],
    [''],
    // Sección 4: Cost Per Use
    ['4. COST PER USE (Costo por Uso)'],
    [''],
    ['Definición:', 'Costo efectivo de cada uso del activo considerando el precio de compra y la cantidad de usos exitosos.'],
    [''],
    ['Fórmula:', 'Cost Per Use = Precio del Item / Retornos Voluntarios'],
    [''],
    ['Dónde:', 'Precio del Item = Valor de compra del activo en COP'],
    ['', 'Retornos Exitosos = COUNT(Tipo_Retorno IS NULL AND Destino IS NULL)'],
    [''],
    ['Interpretación:', 'Mientras más bajo el valor, mejor ROI (retorno de inversión)'],
    ['', 'Valores altos indican que el item se daña/perde frecuentemente'],
    [''],
    ['Ejemplo práctico:', 'Teclado ESENSES cuesta $49,700 COP y se ha retornado exitosamente 37 veces:'],
    ['', 'Cost Per Use = $49,700 / 37 = $1,343 COP por uso'],
    [''],
    [''],
    // Sección 5: Rating
    ['5. RATING (Calificación de Desempeño)'],
    [''],
    ['Definición:', 'Evaluación general del desempeño del activo basada en tasa de fallo y vida útil.'],
    [''],
    ['Criterios de clasificación:', ''],
    ['', ''],
    ['EXCELLENT (Excelente):', 'Failure Rate = 0% Y Lifespan >= 80% del lifespan esperado'],
    ['GOOD (Bueno):', 'Failure Rate = 0% Pero Lifespan < 80% del esperado'],
    ['FAIR (Regular):', 'Failure Rate entre 10-20% O Lifespan muy por debajo de lo esperado'],
    ['POOR (Malo):', 'Failure Rate > 20% (situación crítica, acción inmediata)'],
    ['NEW (Nuevo):', 'Sin datos suficientes (sin retornos registrados), item recién ingresado al inventario'],
    [''],
    [''],
    // Sección 6: Tipos de Retorno
    ['TIPOS DE RETORNO'],
    [''],
    ['Return (Retorno Voluntario):', 'El activo es devuelto porque ya no se usa en esa estación o el encargado de esa estación no estara mas ahi. El item está en buen estado y puede reutilizarse. NO cuenta como fallo. NO afecta el lifespan.'],
    [''],
    ['Damage (Dañado):', 'El activo fue dañado y no puede reutilizarse. SÍ cuenta como fallo. SÍ se incluye en el cálculo de lifespan.'],
    [''],
    ['Missing (Perdido):', 'El activo se perdió o extravió. SÍ cuenta como fallo. SÍ se incluye en el cálculo de lifespan.'],
    [''],
    [''],

    ['RECOMENDACIONES DE USO'],
    [''],
    ['1.', 'Priorizar reemplazo de items con rating POOR'],
    ['2.', 'Investigar items con Failure Rate mayor a 15%'],
    ['3.', 'Considerar cambiar de proveedor si múltiples items tienen tasas de fallo altas'],
    ['4.', 'Items con Cost Per Use muy alto pueden no ser rentables'],
    ['5.', 'Monitorear items NEW hasta tener datos suficientes'],
    [''],
  ];

  const wsReadme = XLSX.utils.aoa_to_sheet(readmeData);
  
  // Ajustar ancho de columnas
  wsReadme['!cols'] = [{ wch: 30 }, { wch: 100 }];
  
  // Aplicar estilos a celdas específicas
  // Título principal (A1)
  if (wsReadme['A1']) {
    wsReadme['A1'].s = getHeaderStyle('1e3a8a');
    wsReadme['A1'].s.alignment.horizontal = 'center';
  }
  
  // Headers de secciones (filas 6, 14, 26, 38, 49, 62, 68)
  const sectionHeaders = [6, 14, 26, 38, 49, 62, 68];
  sectionHeaders.forEach(row => {
    const cell = `A${row}`;
    if (wsReadme[cell]) {
      wsReadme[cell].s = getSubHeaderStyle('0284c7');
    }
  });
  
  // Labels de campos (columna A en filas con contenido)
  const labelRows = [8, 10, 12, 16, 18, 20, 22, 24, 28, 30, 32, 34, 36, 40, 42, 44, 46, 51, 53, 55, 57, 59, 64, 66, 70, 72, 74, 76, 78];
  labelRows.forEach(row => {
    const cell = `A${row}`;
    if (wsReadme[cell]) {
      wsReadme[cell].s = getCellStyle(true, 'f1f5f9');
    }
  });
  
  XLSX.utils.book_append_sheet(wb, wsReadme, 'Documentacion');

  // ============================================
  // HOJA 2: Summary (Resumen General)
  // ============================================
  if (data.summary) {
    const summaryData = [
      ['RESUMEN GENERAL DEL INVENTARIO'],
      [''],
      ['Métrica', 'Valor'],
      ['Total de Items Diferentes', data.summary.total_items || 0],
      ['Items con Datos de Uso', data.summary.items_with_data || 0],
      ['Tasa de Fallo General', `${data.summary.overall_failure_rate}%`],
      ['Vida Útil Promedio', `${data.summary.avg_lifespan_months} meses`],
      ['Categoría Más Usada', data.summary.most_used_category || 'N/A'],
      ['Total de Movimientos', data.summary.total_movements || 0]
    ];
    
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 35 }, { wch: 25 }];
    
    // Colorear headers
    if (wsSummary['A1']) wsSummary['A1'].s = getHeaderStyle('059669');
    if (wsSummary['A3']) wsSummary['A3'].s = getCellStyle(true, '0284c7');
    if (wsSummary['B3']) wsSummary['B3'].s = getCellStyle(true, '0284c7');
    
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');
  }

  // ============================================
  // HOJA 3: All Items (Todos los Items)
  // ============================================
  if (data.allItems && data.allItems.length > 0) {
    const itemsData = [
      ['DETALLE POR ITEM'],
      [''],
      ['Categoría', 'Nombre del Item', 'Total Salidas', 'Tasa de Fallo (%)', 'Vida Útil (meses)', 'Costo por Uso (COP)', 'Calificación']
    ];
    
    data.allItems.forEach(item => {
      itemsData.push([
        item.category_type || 'N/A',
        item.item_name,
        item.total_outputs || 0,
        item.failure_rate || 0,
        item.avg_lifespan_months > 0 ? item.avg_lifespan_months.toFixed(2) : 'N/A',
        item.cost_per_use ? `$${item.cost_per_use.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'N/A',
        item.performance_rating || 'N/A'
      ]);
    });
    
    const wsItems = XLSX.utils.aoa_to_sheet(itemsData);
    
    // Ajustar anchos de columna
    wsItems['!cols'] = [
      { wch: 12 },
      { wch: 35 },
      { wch: 14 },
      { wch: 16 },
      { wch: 18 },
      { wch: 20 },
      { wch: 14 }
    ];
    
    // Colorear headers
    if (wsItems['A1']) wsItems['A1'].s = getHeaderStyle('059669');
    ['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3'].forEach(cell => {
      if (wsItems[cell]) wsItems[cell].s = getCellStyle(true, '0284c7');
    });
    
    // Colorear ratings
    data.allItems.forEach((item, index) => {
      const row = index + 4;
      const ratingCell = `G${row}`;
      if (wsItems[ratingCell]) {
        let color = '10b981';
        if (item.performance_rating === 'Good') color = '06b6d4';
        else if (item.performance_rating === 'Fair') color = 'f59e0b';
        else if (item.performance_rating === 'Poor') color = 'ef4444';
        else if (item.performance_rating === 'New') color = '6b7280';
        
        wsItems[ratingCell].s = {
          ...getCellStyle(false, color),
          font: { bold: true, color: { rgb: "FFFFFF" } }
        };
      }
    });
    
    XLSX.utils.book_append_sheet(wb, wsItems, 'Items_Detalle');
  }

  // ============================================
  // HOJA 4: Recommendations (Recomendaciones)
  // ============================================
  if (data.recommendations && data.recommendations.length > 0) {
    const recsData = [
      ['RECOMENDACIONES DE MEJORA'],
      [''],
      ['Prioridad', 'Item', 'Problema Detectado', 'Rendimiento Actual', 'Rendimiento Esperado', 'Recomendación']
    ];
    
    data.recommendations.forEach(rec => {
      const priorityLabel = rec.priority === 'High' ? 'ALTA' : 
                           rec.priority === 'Medium' ? 'MEDIA' : 'BAJA';
      
      recsData.push([
        priorityLabel,
        rec.item_name,
        rec.issue,
        rec.current_performance,
        rec.expected_performance,
        rec.recommendation
      ]);
    });
    
    const wsRecs = XLSX.utils.aoa_to_sheet(recsData);
    wsRecs['!cols'] = [
      { wch: 10 }, { wch: 35 }, { wch: 35 }, { wch: 40 }, { wch: 40 }, { wch: 60 }
    ];
    
    // Colorear headers
    if (wsRecs['A1']) wsRecs['A1'].s = getHeaderStyle('dc2626');
    ['A3', 'B3', 'C3', 'D3', 'E3', 'F3'].forEach(cell => {
      if (wsRecs[cell]) wsRecs[cell].s = getCellStyle(true, '0284c7');
    });
    
    XLSX.utils.book_append_sheet(wb, wsRecs, 'Recomendaciones');
  }

  // ============================================
  // HOJA 5: Categories (Categorías)
  // ============================================
  if (data.categories) {
    const catData = [
      ['ANÁLISIS POR CATEGORÍA'],
      [''],
      ['Categoría', 'Total Items', 'Tasa de Fallo Promedio (%)', 'Vida Útil Promedio (meses)', 'Mejor Item', 'Peor Item']
    ];
    
    const categoryLabels = {
      cable: 'Cables',
      peripheral: 'Periféricos',
      accessory: 'Accesorios'
    };
    
    Object.entries(data.categories).forEach(([category, catInfo]) => {
      catData.push([
        categoryLabels[category] || category,
        catInfo.items?.length || 0,
        catInfo.avg_failure_rate || 0,
        catInfo.avg_lifespan || 0,
        catInfo.best_performer || 'N/A',
        catInfo.worst_performer || 'N/A'
      ]);
    });
    
    const wsCats = XLSX.utils.aoa_to_sheet(catData);
    wsCats['!cols'] = [
      { wch: 15 }, { wch: 12 }, { wch: 28 }, { wch: 30 }, { wch: 35 }, { wch: 35 }
    ];
    
    // Colorear headers
    if (wsCats['A1']) wsCats['A1'].s = getHeaderStyle('7c3aed');
    ['A3', 'B3', 'C3', 'D3', 'E3', 'F3'].forEach(cell => {
      if (wsCats[cell]) wsCats[cell].s = getCellStyle(true, '0284c7');
    });
    
    XLSX.utils.book_append_sheet(wb, wsCats, 'Categorias');
  }

  // Descargar archivo
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `analytics-inventario-${timestamp}.xlsx`);
};