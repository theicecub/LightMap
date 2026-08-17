// 2GIS Suggest proxy: the browser never receives the provider key.
module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ result: { items: [] } });
  const key = process.env.TWO_GIS_API_KEY;
  if (!key) return res.status(200).json({ result: { items: [] } });
  try {
    const upstream = new URL('https://catalog.api.2gis.com/3.0/suggests');
    ['q', 'locale', 'suggest_type', 'type', 'fields', 'location', 'sort_point', 'polygon', 'page_size'].forEach((name) => {
      if (typeof req.query[name] === 'string') upstream.searchParams.set(name, req.query[name]);
    });
    upstream.searchParams.set('key', key);
    const response = await fetch(upstream);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return res.status(200).json(await response.json());
  } catch (error) {
    console.warn('[2GIS Suggest] Proxy failed:', error.message);
    return res.status(200).json({ result: { items: [] } });
  }
};
