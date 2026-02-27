import API_URL from './api.config';

const BASE = `${API_URL}/api/almacen`;

// Mapea los campos del backend → frontend
const mapFromAPI = (item) => ({
  id:            String(item.ID),
  name:          item.Item,
  serial:        item.Serial        || '',
  fecha_ingreso: item.Fecha_Ingreso || '',
  fecha_salida:  item.Fecha_Salida  || '',
  destino:       item.Destino       || '',
});

// Mapea los campos del frontend → backend
const mapToAPI = (asset) => ({
  Item:          asset.name,
  Serial:        asset.serial        || null,
  Fecha_Ingreso: asset.fecha_ingreso,
  Fecha_Salida:  asset.fecha_salida  || null,
  Destino:       asset.destino       || null,
});

// GET /api/almacen  (con búsqueda opcional)
export const getAssets = async (search = '') => {
  const url = search ? `${BASE}?search=${encodeURIComponent(search)}` : BASE;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener activos');
  const data = await res.json();
  return data.map(mapFromAPI);
};

// POST /api/almacen
export const createAsset = async (asset) => {
  const res = await fetch(BASE, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(mapToAPI(asset)),
  });
  if (!res.ok) throw new Error('Error al crear activo');
  return await res.json();
};

// POST múltiple (lote)
export const createAssetLot = async (assets) => {
  const results = await Promise.all(assets.map(createAsset));
  return results;
};

// PUT /api/almacen/:id
export const updateAsset = async (asset) => {
  const res = await fetch(`${BASE}/${asset.id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(mapToAPI(asset)),
  });
  if (!res.ok) throw new Error('Error al actualizar activo');
  return await res.json();
};

// DELETE /api/almacen/:id
export const deleteAsset = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar activo');
  return await res.json();
};
