export const CDMX_CENTER: [number, number] = [-99.1332, 19.4326];
export const CDMX_BBOX: [number, number, number, number] = [-99.365, 19.05, -98.94, 19.59];
export const DEFAULT_ZOOM = 11;
export const SEARCH_ZOOM = 14;

export const ROUTE_COLORS: Record<string, string> = {
  driving: '#3B82F6',
  walking: '#10B981',
  cycling: '#F59E0B',
};

export const TRANSPORT_LABELS: Record<string, { label: string; icon: string }> = {
  driving: { label: 'Auto', icon: '🚗' },
  walking: { label: 'Caminando', icon: '🚶' },
  cycling: { label: 'Bicicleta', icon: '🚲' },
  transit: { label: 'Transporte público', icon: '🚇' },
};

export const CKAN_API_URL =
  'https://datos.cdmx.gob.mx/api/3/action/datastore_search?resource_id=e040c46f-8f49-4190-89d1-c08679ca2218&limit=200';
