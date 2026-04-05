export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const KEY = 'ledge_data';

  if (req.method === 'GET') {
    const r = await fetch(`${url}/get/${KEY}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await r.json();
    let data = { salary: 0, months: {} };
    if (json.result) {
      try {
        data = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
      } catch(e) {}
    }
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const value = JSON.stringify(req.body);
    await fetch(`${url}/set/${KEY}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([KEY, value])
    });
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
