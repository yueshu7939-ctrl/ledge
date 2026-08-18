const KEY = 'ledge_v3';
const BAK = 'ledge_v3_bak';
const LEGACY_KEYS = ['ledge_data'];

function monthCount(d) {
  return d && d.months && typeof d.months === 'object' ? Object.keys(d.months).length : 0;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  // Fail loudly instead of throwing on `undefined/get/...` — the client needs to
  // tell "storage is broken" apart from "you have no data yet".
  if (!url || !token) {
    return res.status(503).json({
      error: 'kv_not_configured',
      message: 'KV_REST_API_URL / KV_REST_API_TOKEN are missing on this deployment.'
    });
  }

  async function kvGet(key) {
    const r = await fetch(`${url}/get/${key}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`KV GET ${key} -> ${r.status}`);
    const json = await r.json();
    if (json.result == null) return null;
    let parsed = json.result;
    while (typeof parsed === 'string') parsed = JSON.parse(parsed);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    if (!parsed.months) parsed.months = {};
    return parsed;
  }

  async function kvSet(pairs) {
    const r = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(pairs.map(([k, v]) => ['SET', k, v]))
    });
    if (!r.ok) throw new Error(`KV pipeline -> ${r.status}`);
  }

  try {
    if (req.method === 'GET') {
      let data = await kvGet(KEY);
      let source = 'primary';

      // The storage key was renamed ledge_data -> ledge_v3; older records may
      // still be sitting under the legacy key.
      if (!data) {
        for (const k of LEGACY_KEYS) {
          const legacy = await kvGet(k);
          if (legacy) { data = legacy; source = k; break; }
        }
      }
      if (!data) { data = await kvGet(BAK); if (data) source = BAK; }
      if (!data) { data = { salary: 0, months: {} }; source = 'empty'; }

      res.setHeader('X-Ledge-Source', source);
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const incoming = req.body;
      if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
        return res.status(400).json({ error: 'bad_payload' });
      }

      const existing = await kvGet(KEY);

      // Never let a blank client state wipe real records. A failed load used to
      // leave the app holding {salary:0,months:{}} and the next save committed it.
      if (monthCount(incoming) === 0 && monthCount(existing) > 0 && req.query.force !== '1') {
        return res.status(409).json({
          error: 'refusing_empty_overwrite',
          message: `Refused to overwrite ${monthCount(existing)} stored months with an empty state.`,
          storedMonths: monthCount(existing)
        });
      }

      const pairs = [[KEY, JSON.stringify(incoming)]];
      if (existing) pairs.unshift([BAK, JSON.stringify(existing)]);
      await kvSet(pairs);

      return res.status(200).json({ ok: true, months: monthCount(incoming) });
    }

    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: 'kv_error', message: String(e && e.message || e) });
  }
}
