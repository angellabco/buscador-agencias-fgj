'use client';

import { useState, useRef, useCallback } from 'react';
import { GeocodingResult } from '@/lib/types';

interface SearchPanelProps {
  onLocationSelect: (result: GeocodingResult) => void;
  isLoading: boolean;
}

interface Suggestion {
  id: string;
  placeName: string;
  latitude: number;
  longitude: number;
}

export default function SearchPanel({ onLocationSelect, isLoading }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`);
          const data = await res.json();

          if (data.features) {
            const results: Suggestion[] = data.features.map((f: any) => ({
              id: f.id,
              placeName: f.properties?.full_address || f.properties?.name || '',
              latitude: f.geometry?.coordinates?.[1] ?? 0,
              longitude: f.geometry?.coordinates?.[0] ?? 0,
            }));
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
          }
        } catch {
          setSuggestions([]);
        }
      }, 300);
    },
    []
  );

  const handleSelect = (suggestion: Suggestion) => {
    setQuery(suggestion.placeName);
    setShowSuggestions(false);
    setSuggestions([]);
    onLocationSelect({
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      placeName: suggestion.placeName,
    });
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setQuery('Mi ubicación actual');
        setGpsLoading(false);
        onLocationSelect({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          placeName: 'Mi ubicación actual',
        });
      },
      () => {
        setGpsLoading(false);
        alert('No se pudo obtener tu ubicación. Verifica los permisos de ubicación.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Ingresa tu dirección en CDMX..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C1034] focus:border-transparent transition-all"
            disabled={isLoading}
          />
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin h-5 w-5 border-2 border-[#7C1034] border-t-transparent rounded-full" />
            </div>
          )}
        </div>
        <button
          onClick={handleGPS}
          disabled={gpsLoading || isLoading}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2 text-gray-600 hover:text-[#7C1034]"
          title="Usar mi ubicación"
        >
          {gpsLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-[#7C1034] border-t-transparent rounded-full" />
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
          <span className="hidden sm:inline text-sm font-medium">Ubicación</span>
        </button>
      </div>

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3"
            >
              <svg className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="text-sm text-gray-700">{s.placeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
