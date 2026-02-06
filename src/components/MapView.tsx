'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Agency, AgencyWithDistance, GeocodingResult, RouteInfo } from '@/lib/types';
import { CDMX_CENTER, DEFAULT_ZOOM, ROUTE_COLORS } from '@/lib/constants';

interface MapViewProps {
  agencies: Agency[];
  userLocation: GeocodingResult | null;
  selectedAgency: AgencyWithDistance | null;
  activeRoute: RouteInfo | null;
}

export default function MapView({
  agencies,
  userLocation,
  selectedAgency,
  activeRoute,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const agencyMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: CDMX_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // Add agencies as a GeoJSON source
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: agencies
          .filter((a) => a.latitude && a.longitude)
          .map((a) => ({
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [a.longitude, a.latitude],
            },
            properties: {
              id: a._id,
              sede: a.sede,
              tipo: a.tipo_de_servicio,
            },
          })),
      };

      map.addSource('agencies', {
        type: 'geojson',
        data: geojson,
      });

      map.addLayer({
        id: 'agencies-circles',
        type: 'circle',
        source: 'agencies',
        paint: {
          'circle-radius': 6,
          'circle-color': '#7C1034',
          'circle-opacity': 0.7,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });

      // Popup on click
      map.on('click', 'agencies-circles', (e) => {
        if (!e.features?.[0]) return;
        const props = e.features[0].properties;
        const coords = (e.features[0].geometry as GeoJSON.Point).coordinates as [number, number];

        new mapboxgl.Popup({ offset: 10, closeButton: false })
          .setLngLat(coords)
          .setHTML(`<div class="p-2"><p class="font-semibold text-sm">${props?.sede}</p><p class="text-xs text-gray-500">${props?.tipo}</p></div>`)
          .addTo(map);
      });

      map.on('mouseenter', 'agencies-circles', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'agencies-circles', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [agencies]);

  // Update user marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const el = document.createElement('div');
      el.className = 'user-marker';
      el.innerHTML = `<div style="width:20px;height:20px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5);"></div>`;

      userMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(map);
    }
  }, [userLocation]);

  // Update agency marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (agencyMarkerRef.current) {
      agencyMarkerRef.current.remove();
      agencyMarkerRef.current = null;
    }

    if (selectedAgency) {
      const el = document.createElement('div');
      el.innerHTML = `<div style="width:32px;height:32px;background:#7C1034;border:3px solid white;border-radius:50%;box-shadow:0 2px 10px rgba(124,16,52,0.4);display:flex;align-items:center;justify-content:center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
      </div>`;

      agencyMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([selectedAgency.longitude, selectedAgency.latitude])
        .addTo(map);
    }

    // Fit bounds to include both user and agency
    if (userLocation && selectedAgency) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([userLocation.longitude, userLocation.latitude]);
      bounds.extend([selectedAgency.longitude, selectedAgency.latitude]);
      map.fitBounds(bounds, { padding: 80, maxZoom: 15 });
    }
  }, [selectedAgency, userLocation]);

  // Update route line
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const sourceId = 'route';
    const layerId = 'route-line';

    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);

    if (activeRoute) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: activeRoute.geometry,
        },
      });

      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': ROUTE_COLORS[activeRoute.profile] || '#3B82F6',
          'line-width': 5,
          'line-opacity': 0.8,
        },
      });
    }
  }, [activeRoute]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
}
