# LightMap

LightMap shows potentially hazardous facade glare in Astana and scores route exposure using the current sun position and weather.

## AI candidate detection

After the initial map render, the browser requests `/api/classify-buildings`. The Vercel function obtains OSM candidates through Overpass, reuses cached facade classifications from Neon, and sends only unseen OSM ids to Gemini in batches. If any external service is unavailable, it returns an empty list and the map continues with `buildings.json`.

Set these Vercel environment variables:

- `GEMINI_API_KEY`
- `DATABASE_URL` or `POSTGRES_URL` from Neon
- `TWO_GIS_API_KEY`
- `MAPTILER_KEY`

The browser does not receive these values. MapTiler styles, tiles, sprites, and glyphs are served through `/api/maptiler`; 2GIS suggestions are served through `/api/suggest`.

Copy `.env.example` for local Vercel development, but never commit real values.

Install dependencies and run tests with:

```sh
npm install
npm test
```
