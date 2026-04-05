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
    const data = json.result ? JSON.parse(json.result) : { salary: 0, months: {} };
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const body = JSON.stringify(req.body);
    await fetch(`${url}/set/${KEY}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
