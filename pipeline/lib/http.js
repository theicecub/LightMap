// fetch с retry/backoff: уважает Retry-After и 429/5xx — база для всех бесплатных API.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchWithRetry(url, options = {}, { retries = 5, label = 'http' } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, options);
      if (resp.ok) return resp;

      const retryAfter = Number(resp.headers.get('retry-after')) || 0;
      if (resp.status === 429 || resp.status >= 500) {
        const wait = retryAfter > 0 ? retryAfter * 1000 : Math.min(60000, 2000 * 2 ** attempt);
        lastErr = new Error(`[${label}] HTTP ${resp.status} после ${retries + 1} попыток`);
        console.warn(`[${label}] HTTP ${resp.status}, ждём ${wait}мс (попытка ${attempt + 1}/${retries})`);
        await sleep(wait);
        continue;
      }
      throw new Error(`[${label}] HTTP ${resp.status}: ${(await resp.text()).slice(0, 300)}`);
    } catch (err) {
      lastErr = err;
      if (typeof err?.message === 'string' && err.message.startsWith('[')) throw err; // уже оформлено
      if (attempt === retries) break;
      const wait = Math.min(30000, 1000 * 2 ** attempt);
      console.warn(`[${label}] сетевая ошибка: ${err?.message ?? err}, ждём ${wait}мс`);
      await sleep(wait);
    }
  }
  throw lastErr ?? new Error(`[${label}] исчерпаны попытки`);
}

export async function getJson(url, options, retryOpts) {
  const resp = await fetchWithRetry(url, options, retryOpts);
  return resp.json();
}

export { sleep };
