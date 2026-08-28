const TWO_GIS_SUGGEST_URL = 'https://catalog.api.2gis.com/3.0/suggests';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.TWO_GIS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: '2GIS API key is not configured' });
    return;
  }

  const query = new URLSearchParams(req.query || {});
  query.set('key', apiKey);

  try {
    const response = await fetch(`${TWO_GIS_SUGGEST_URL}?${query}`);
    const body = await response.text();
    res.status(response.status).setHeader(
      'Content-Type',
      response.headers.get('content-type') || 'application/json'
    ).send(body);
  } catch (error) {
    console.error('[2GIS Suggest] Proxy request failed:', error);
    res.status(502).json({ error: '2GIS request failed' });
  }
};
