import { Agency, AgencyWithDistance } from './types';
import { haversineDistance } from './haversine';

export function findNearestAgency(
  agencies: Agency[],
  userLat: number,
  userLng: number
): AgencyWithDistance {
  let nearest: AgencyWithDistance | null = null;
  for (const agency of agencies) {
    if (!agency.latitude || !agency.longitude) continue;
    const dist = haversineDistance(userLat, userLng, agency.latitude, agency.longitude);
    if (!nearest || dist < nearest.distanceKm) {
      nearest = { ...agency, distanceKm: dist };
    }
  }
  return nearest!;
}

export function findNearestAgencies(
  agencies: Agency[],
  userLat: number,
  userLng: number,
  count: number = 3
): AgencyWithDistance[] {
  const withDistance = agencies
    .filter((a) => a.latitude && a.longitude)
    .map((a) => ({
      ...a,
      distanceKm: haversineDistance(userLat, userLng, a.latitude, a.longitude),
    }));
  withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
  return withDistance.slice(0, count);
}
