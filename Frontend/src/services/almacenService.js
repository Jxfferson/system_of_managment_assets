import API_URL from './api.config';

const BASE = `${API_URL}/api/almacen`;
const getCSRFToken = () => {
  return localStorage.getItem('csrf_token') || '';
};

const getAuthToken = () => {
  return localStorage.getItem('auth_token') || '';
};

const secureFetch = async (url, options = {}) => {
  const authToken = getAuthToken();
  const csrfToken = getCSRFToken();
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        'X-CSRF-Token': csrfToken,
        ...options.headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('csrf_token');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/admin/login';
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }
    
    if (response.status === 403) {
      throw new Error('Petición no autorizada. Verifica tu sesión.');
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.message || `Error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado. Verifica tu conexión.');
    }
    throw error;
  }
};

const mapFromAPI = (item) => ({
  id: String(item.ID),
  name: item.Item,
  serial: item.Serial || '',
  fecha_ingreso: item.Fecha_Ingreso || '',
  fecha_salida: item.Fecha_Salida || '',
  destino: item.Destino || '',
  tipo_retorno: item.Tipo_Retorno || '',
  observaciones_retorno: item.Observaciones_Retorno || '',
  Sede_Actual: item.Sede_Actual || '',
  Monitor_Location: item.Monitor_Location || '',
});

const mapToAPI = (asset) => ({
  Item: asset.name,
  Serial: asset.serial || null,
  Fecha_Ingreso: asset.fecha_ingreso,
  Fecha_Salida: asset.fecha_salida || null,
  Destino: asset.destino || null,
  Tipo_Retorno: asset.tipo_retorno || null,
  Observaciones_Retorno: asset.observaciones_retorno || null,
  Sede_Actual: asset.Sede_Actual || null, 
  Monitor_Location: asset.Monitor_Location || null, 
});


export const getAssets = async (search = '') => {
  const url = search ? `${BASE}?search=${encodeURIComponent(search)}` : BASE;
  const data = await secureFetch(url);
  return data.map(mapFromAPI);
};

export const getAssetsByStation = async (stationName) => {
  const url = `${BASE}?destino=${encodeURIComponent(stationName)}`;
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