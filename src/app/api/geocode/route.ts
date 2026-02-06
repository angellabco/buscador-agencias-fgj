import { NextRequest, NextResponse } from 'next/server';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const CDMX_BBOX = '-99.365,19.05,-98.94,19.59';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Falta el parámetro de búsqueda' }, { status: 400 });
  }

  try {
    const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');
    url.searchParams.set('q', query);
    url.searchParams.set('access_token', MAPBOX_TOKEN!);
    url.searchParams.set('bbox', CDMX_BBOX);
    url.searchParams.set('country', 'MX');
    url.searchParams.set('language', 'es');
    url.searchParams.set('limit', '5');

    const res = await fetch(url.toString());
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Error al geocodificar la dirección' },
      { status: 500 }
    );
  }
}
