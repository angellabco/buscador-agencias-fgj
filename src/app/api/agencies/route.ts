import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CKAN_URL =
  'https://datos.cdmx.gob.mx/api/3/action/datastore_search?resource_id=e040c46f-8f49-4190-89d1-c08679ca2218&limit=200';

async function fetchFromCKAN() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(CKAN_URL, {
      signal: controller.signal,
      next: { revalidate: 86400 },
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const data = await response.json();
    if (data?.result?.records?.length > 0) {
      return data.result.records;
    }
    return null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function loadFallbackData() {
  try {
    // Try reading from public folder at build/runtime
    const filePath = path.join(process.cwd(), 'public', 'agencies-fallback.json');
    const fileContents = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContents);
  } catch {
    return null;
  }
}

export async function GET() {
  // Try CKAN API first
  const ckanData = await fetchFromCKAN();
  if (ckanData) {
    return NextResponse.json(ckanData, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        'X-Data-Source': 'ckan-api',
      },
    });
  }

  // Fallback to static JSON
  const fallbackData = await loadFallbackData();
  if (fallbackData) {
    return NextResponse.json(fallbackData, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        'X-Data-Source': 'fallback-json',
      },
    });
  }

  return NextResponse.json(
    { error: 'No se pudieron cargar las agencias' },
    { status: 500 }
  );
}
