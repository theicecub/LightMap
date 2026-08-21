export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.TWO_GIS_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: '2GIS API is not configured' });
  }

  const query = typeof request.query.q === 'string' ? request.query.q.trim() : '';
  if (query.length < 2) {
    return response.status(400).json({ error: 'Query must contain at least 2 characters' });
  }

  const params = new URLSearchParams({
    q: query,
    key: apiKey,
    locale: typeof request.query.locale === 'string' ? request.query.locale : 'ru_KZ',
    suggest_type: typeof request.query.suggest_type === 'string' ? request.query.suggest_type : 'route_endpoint',
    fields: 'items.point,items.address,items.full_address_name',
    location: '71.430,51.128',
    sort_point: '71.430,51.128',
    polygon: 'POLYGON((71.10 50.95,71.80 50.95,71.80 51.30,71.10 51.30,71.10 50.95))',
    page_size: typeof request.query.page_size === 'string' ? request.query.page_size : '6',
  });

  if (request.query.type === 'building') {
    params.set('type', 'building');
  }

  try {
    const upstream = await fetch(`https://catalog.api.2gis.com/3.0/suggests?${params}`);
    const body = await upstream.text();
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    response.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return response.status(upstream.status).send(body);
  } catch (error) {
    console.error('[2GIS proxy] Request failed:', error);
    return response.status(502).json({ error: '2GIS request failed' });
  }
}