import API_URL from './api.config';

const BASE = `${API_URL}/api/almacen`;

const mapFromAPI = (item) => ({
  id:            String(item.ID),
  name:          item.Item,
  serial:        item.Serial        || '',
  fecha_ingreso: item.Fecha_Ingreso || '',
  fecha_salida:  item.Fecha_Salida  || '',
  destino:       item.Destino       || '',
  tipo_retorno:        item.Tipo_Retorno        || '',
  observaciones_retorno: item.Observaciones_Retorno || '',
});

const mapToAPI = (asset) => ({
  Item:          asset.name,
  Serial:        asset.serial        || null,
  Fecha_Ingreso: asset.fecha_ingreso,
  Fecha_Salida:  asset.fecha_salida  || null,
  Destino:       asset.destino       || null,
  Tipo_Retorno:        asset.tipo_retorno        || null,
  Observaciones_Retorno: asset.observaciones_retorno || null,
});

export const getAssets = async (search = '') => {
  const url = search ? `${BASE}?search=${encodeURIComponent(search)}` : BASE;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener activos');
  const data = await res.json();
  return data.map(mapFromAPI);
};

export const createAsset = async (asset) => {
  const res = await fetch(BASE, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(mapToAPI(asset)),
  });
  if (!res.ok) throw new Error('Error al crear activo');
  return await res.json();
};

export const createAssetLot = async (assets) => {
  const results = await Promise.all(assets.map(createAsset));
  return results;
};

export const createAssetLotBulk = async (assets) => {
  const res = await fetch(`${BASE}/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      items: assets.map(mapToAPI)  
    }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Error al crear lote masivo');
  }
  return await res.json();
};

export const updateAsset = async (asset) => {
  const res = await fetch(`${BASE}/${asset.id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(mapToAPI(asset)),
  });
  if (!res.ok) throw new Error('Error al actualizar activo');
  return await res.json();
};

export const deleteAsset = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar activo');
  return await res.json();
};