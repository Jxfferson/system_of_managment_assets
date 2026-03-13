import API_URL from './api.config';

const BASE = `${API_URL}/api/almacen`;

// FUNCIONES DE SEGURIDAD

// Obtener token CSRF del localStorage
const getCSRFToken = () => {
  return localStorage.getItem('csrf_token') || '';
};

// Obtener token de autenticación del localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token') || '';
};

// Función base para peticiones fetch con protección CSRF y timeout
const secureFetch = async (url, options = {}) => {
  const authToken = getAuthToken();
  const csrfToken = getCSRFToken();
  
  // Timeout de 30 segundos para prevenir peticiones colgadas
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // Token de autenticación para validar identidad del usuario
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        // Token CSRF para prevenir ataques de falsificación de peticiones
        'X-CSRF-Token': csrfToken,
        ...options.headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Manejar error 401 (sesión expirada o no autorizada)
    if (response.status === 401) {
      // Limpiar datos de sesión
      localStorage.removeItem('auth_token');
      localStorage.removeItem('csrf_token');
      localStorage.removeItem('isAuthenticated');
      // Redirigir a login
      window.location.href = '/admin/login';
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }
    
    // Manejar error 403 (prohibido - posible ataque CSRF)
    if (response.status === 403) {
      throw new Error('Petición no autorizada. Verifica tu sesión.');
    }
    
    // Manejar otros errores HTTP
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.message || `Error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    // Manejar timeout de petición
    if (error.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado. Verifica tu conexión.');
    }
    throw error;
  }
};

// FUNCIONES DE MAPEO DE DATOS

const mapFromAPI = (item) => ({
  id: String(item.ID),
  name: item.Item,
  serial: item.Serial || '',
  fecha_ingreso: item.Fecha_Ingreso || '',
  fecha_salida: item.Fecha_Salida || '',
  destino: item.Destino || '',
  tipo_retorno: item.Tipo_Retorno || '',
  observaciones_retorno: item.Observaciones_Retorno || '',
});

const mapToAPI = (asset) => ({
  Item: asset.name,
  Serial: asset.serial || null,
  Fecha_Ingreso: asset.fecha_ingreso,
  Fecha_Salida: asset.fecha_salida || null,
  Destino: asset.destino || null,
  Tipo_Retorno: asset.tipo_retorno || null,
  Observaciones_Retorno: asset.observaciones_retorno || null,
});

// FUNCIONES DE LA API CON SEGURIDAD

export const getAssets = async (search = '') => {
  const url = search ? `${BASE}?search=${encodeURIComponent(search)}` : BASE;
  const data = await secureFetch(url);
  return data.map(mapFromAPI);
};

export const createAsset = async (asset) => {
  const data = await secureFetch(BASE, {
    method: 'POST',
    body: JSON.stringify(mapToAPI(asset)),
  });
  return data;
};

export const createAssetLot = async (assets) => {
  const results = await Promise.all(assets.map(createAsset));
  return results;
};

export const createAssetLotBulk = async (assets) => {
  const data = await secureFetch(`${BASE}/bulk`, {
    method: 'POST',
    body: JSON.stringify({ 
      items: assets.map(mapToAPI)  
    }),
  });
  return data;
};

export const updateAsset = async (asset) => {
  const data = await secureFetch(`${BASE}/${asset.id}`, {
    method: 'PUT',
    body: JSON.stringify(mapToAPI(asset)),
  });
  return data;
};

export const deleteAsset = async (id) => {
  const data = await secureFetch(`${BASE}/${id}`, { 
    method: 'DELETE',
  });
  return data;
};