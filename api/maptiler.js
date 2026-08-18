// MapTiler proxy keeps the provider key in Vercel environment variables.
const ALLOWED_PATHS = ['/maps/', '/tiles/', '/fonts/', '/sprites/'];

function proxied(path) {
  // MapLibre must see its glyph placeholders as literal braces so it can
  // replace {fontstack} and {range} before making the request.
  const encodedPath = encodeURIComponent(decodeURIComponent(path))
    .replace(/%7B/gi, '{')
    .replace(/%7D/gi, '}');
  return `/api/maptiler?path=${encodedPath}`;
}

function rewriteStyle(value) {
  if (typeof value === 'string' && value.startsWith('https://api.maptiler.com/')) return proxied(new URL(value).pathname + new URL(value).search.replace(/([?&])key=[^&]+&?/, '$1').replace(/[?&]$/, ''));
  if (Array.isArray(value)) return value.map(rewriteStyle);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewriteStyle(item)]));
  return value;
}

module.exports = async (req, res) => {
  const path = typeof req.query.path === 'string' ? req.query.path : '';
  const key = process.env.MAPTILER_KEY;
  if (!key || !ALLOWED_PATHS.some(prefix => path.startsWith(prefix))) return res.status(404).end();
  try {
    const upstream = new URL(`https://api.maptiler.com${path}`);
    upstream.searchParams.set('key', key);
    const response = await fetch(upstream);
    if (!response.ok) return res.status(response.status).end();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    if (contentType.includes('application/json') && path.endsWith('/style.json')) return res.status(200).json(rewriteStyle(await response.json()));
    return res.status(200).send(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.warn('[MapTiler] Proxy failed:', error.message);
    return res.status(502).end();
  }
};

module.exports.rewriteStyle = rewriteStyle;
