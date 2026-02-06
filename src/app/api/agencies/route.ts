import { NextResponse } from 'next/server';

const CKAN_URL =
  'https://datos.cdmx.gob.mx/api/3/action/datastore_search?resource_id=e040c46f-8f49-4190-89d1-c08679ca2218&limit=200';

export async function GET() {
  try {
    const response = await fetch(CKAN_URL, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error al obtener las agencias' },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data.result.records, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Error de conexión con el servidor de datos' },
      { status: 500 }
    );
  }
}
