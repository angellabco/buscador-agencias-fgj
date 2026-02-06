'use client';

import { RouteInfo, GeocodingResult } from '@/lib/types';
import { formatDuration, formatDistance, buildGoogleMapsTransitUrl } from '@/lib/format';
import { ROUTE_COLORS } from '@/lib/constants';

interface RouteOptionsProps {
  routes: Map<string, RouteInfo>;
  activeProfile: string;
  onProfileChange: (profile: string) => void;
  userLocation: GeocodingResult;
  agencyLocation: { latitude: number; longitude: number };
  isLoading: boolean;
}

const PROFILES = [
  { key: 'driving', label: 'Auto', icon: '🚗' },
  { key: 'walking', label: 'Caminando', icon: '🚶' },
  { key: 'cycling', label: 'Bicicleta', icon: '🚲' },
];

export default function RouteOptions({
  routes,
  activeProfile,
  onProfileChange,
  userLocation,
  agencyLocation,
  isLoading,
}: RouteOptionsProps) {
  const transitUrl = buildGoogleMapsTransitUrl(
    userLocation.latitude,
    userLocation.longitude,
    agencyLocation.latitude,
    agencyLocation.longitude
  );

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700 px-1">Cómo llegar</h4>
      <div className="grid grid-cols-2 gap-2">
        {PROFILES.map(({ key, label, icon }) => {
          const route = routes.get(key);
          const isActive = activeProfile === key;
          const color = ROUTE_COLORS[key];

          return (
            <button
              key={key}
              onClick={() => route && onProfileChange(key)}
              disabled={!route && !isLoading}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                isActive
                  ? 'border-current shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              } ${!route && !isLoading ? 'opacity-40' : ''}`}
              style={isActive ? { borderColor: color, backgroundColor: `${color}10` } : {}}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium text-gray-800">{label}</span>
              </div>
              {isLoading && !route ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full" />
                  <span className="text-xs text-gray-400">Calculando...</span>
                </div>
              ) : route ? (
                <div>
                  <p className="text-lg font-bold" style={{ color }}>{formatDuration(route.durationMinutes)}</p>
                  <p className="text-xs text-gray-500">{formatDistance(route.distanceKm)}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400">No disponible</p>
              )}
            </button>
          );
        })}

        {/* Transit - Google Maps link */}
        <a
          href={transitUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-xl border-2 border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-left"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🚇</span>
            <span className="text-sm font-medium text-gray-800">Transporte público</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-violet-600 font-medium">Ver en Google Maps</span>
            <svg className="h-3 w-3 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </a>
      </div>
    </div>
  );
}
