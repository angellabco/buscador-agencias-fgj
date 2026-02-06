import { useState, useCallback } from 'react';
import { RouteInfo } from '@/lib/types';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const PROFILES = ['mapbox/driving', 'mapbox/walking', 'mapbox/cycling'] as const;

export function useDirections() {
  const [routes, setRoutes] = useState<Map<string, RouteInfo>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllRoutes = useCallback(
    async (originLng: number, originLat: number, destLng: number, destLat: number) => {
      setIsLoading(true);
      setRoutes(new Map());
      const coordinates = `${originLng},${originLat};${destLng},${destLat}`;

      const results = await Promise.allSettled(
        PROFILES.map(async (profile) => {
          const url = `https://api.mapbox.com/directions/v5/${profile}/${coordinates}?geometries=geojson&overview=full&steps=false&access_token=${MAPBOX_TOKEN}`;
          const res = await fetch(url);
          const data = await res.json();
          const route = data.routes?.[0];
          if (!route) throw new Error(`No hay ruta para ${profile}`);

          const shortProfile = profile.replace('mapbox/', '') as RouteInfo['profile'];
          return {
            profile: shortProfile,
            durationMinutes: route.duration / 60,
            distanceKm: route.distance / 1000,
            geometry: route.geometry,
          } satisfies RouteInfo;
        })
      );

      const newRoutes = new Map<string, RouteInfo>();
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          newRoutes.set(result.value.profile, result.value);
        }
      });

      setRoutes(newRoutes);
      setIsLoading(false);
    },
    []
  );

  return { routes, isLoading, fetchAllRoutes };
}
