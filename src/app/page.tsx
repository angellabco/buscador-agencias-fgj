'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import SearchPanel from '@/components/SearchPanel';
import AgencyCard from '@/components/AgencyCard';
import RouteOptions from '@/components/RouteOptions';
import { useAgencies } from '@/hooks/useAgencies';
import { useDirections } from '@/hooks/useDirections';
import { findNearestAgency } from '@/lib/agencies';
import { GeocodingResult, AgencyWithDistance } from '@/lib/types';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function Home() {
  const { agencies, isLoading: agenciesLoading, error: agenciesError } = useAgencies();
  const { routes, isLoading: routesLoading, fetchAllRoutes } = useDirections();

  const [userLocation, setUserLocation] = useState<GeocodingResult | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<AgencyWithDistance | null>(null);
  const [activeProfile, setActiveProfile] = useState('driving');
  const [searchLoading, setSearchLoading] = useState(false);

  const handleLocationSelect = useCallback(
    async (result: GeocodingResult) => {
      if (agencies.length === 0) return;

      setSearchLoading(true);
      setUserLocation(result);

      const nearest = findNearestAgency(agencies, result.latitude, result.longitude);
      setSelectedAgency(nearest);
      setActiveProfile('driving');

      await fetchAllRoutes(
        result.longitude,
        result.latitude,
        nearest.longitude,
        nearest.latitude
      );

      setSearchLoading(false);
    },
    [agencies, fetchAllRoutes]
  );

  const activeRoute = routes.get(activeProfile) || null;

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar */}
      <aside className="w-full md:w-[420px] lg:w-[460px] flex-shrink-0 overflow-y-auto bg-gray-50 border-r border-gray-200 z-10">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-[#7C1034] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Buscador de Agencias</h1>
                <p className="text-xs text-gray-500">Fiscalía General de Justicia · CDMX</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <SearchPanel
            onLocationSelect={handleLocationSelect}
            isLoading={searchLoading || agenciesLoading}
          />

          {/* Error state */}
          {agenciesError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-700">{agenciesError}</p>
            </div>
          )}

          {/* Loading agencies */}
          {agenciesLoading && (
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
              <div className="animate-spin h-5 w-5 border-2 border-[#7C1034] border-t-transparent rounded-full" />
              <p className="text-sm text-gray-600">Cargando agencias...</p>
            </div>
          )}

          {/* Empty state */}
          {!agenciesLoading && !selectedAgency && !agenciesError && (
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ingresa tu dirección para encontrar la agencia del Ministerio Público más cercana
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {agencies.length > 0 ? `${agencies.length} agencias disponibles en CDMX` : ''}
              </p>
            </div>
          )}

          {/* Agency card */}
          {selectedAgency && (
            <div className="space-y-4">
              <AgencyCard agency={selectedAgency} />

              {/* Route options */}
              {userLocation && (
                <RouteOptions
                  routes={routes}
                  activeProfile={activeProfile}
                  onProfileChange={setActiveProfile}
                  userLocation={userLocation}
                  agencyLocation={{
                    latitude: selectedAgency.latitude,
                    longitude: selectedAgency.longitude,
                  }}
                  isLoading={routesLoading}
                />
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              Datos abiertos de la{' '}
              <a
                href="https://datos.cdmx.gob.mx/dataset/servicios_y_sedes_fgj"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7C1034] hover:underline"
              >
                FGJ CDMX
              </a>
            </p>
          </div>
        </div>
      </aside>

      {/* Map */}
      <main className="flex-1 relative min-h-[50vh] md:min-h-0">
        <MapView
          agencies={agencies}
          userLocation={userLocation}
          selectedAgency={selectedAgency}
          activeRoute={activeRoute}
        />
      </main>
    </div>
  );
}
