import { NextRequest, NextResponse } from 'next/server';

const VALID_PROFILES = ['mapbox/driving', 'mapbox/walking', 'mapbox/cycling'];

export async function GET(request: NextRequest) {
  const profile = request.nextUrl.searchParams.get('profile');
  const coordinates = request.nextUrl.searchParams.get('coordinates');
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!profile || !coordinates || !VALID_PROFILES.includes(profile)) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: 'Token de Mapbox no configurado' }, { status: 500 });
  }

  try {
    const url = `https://api.mapbox.com/directions/v5/${profile}/${coordinates}?geometries=geojson&overview=full&steps=false&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Error al calcular la ruta' },
      { status: 500 }
    );
  }
}
