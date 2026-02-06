export interface Agency {
  _id: number;
  id: number;
  tipo_de_servicio: string;
  sede: string;
  objeto_de_la_atencion: string;
  full_address: string;
  calle: string;
  numero_exterior: string;
  numero_interior: string;
  colonia: string;
  codigo_postal: number;
  alcaldia: string;
  referencias_de_ubicacion: string;
  horario_de_atencion_horas: string;
  dias_de_atencion: string;
  correo_electronico: string;
  telefono_1: string;
  extension_1: string;
  telefono_2: string;
  extension_2: string;
  latitude: number;
  longitude: number;
  numero_consecutivo: number;
  coordenadas: string;
}

export interface AgencyWithDistance extends Agency {
  distanceKm: number;
}

export interface RouteInfo {
  profile: 'driving' | 'walking' | 'cycling';
  durationMinutes: number;
  distanceKm: number;
  geometry: GeoJSON.LineString;
}

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  placeName: string;
}

export interface CKANResponse {
  success: boolean;
  result: {
    records: Agency[];
    total: number;
  };
}
