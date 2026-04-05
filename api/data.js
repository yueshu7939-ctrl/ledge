export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { kv } = await import('@vercel/kv');
  const KEY = 'ledge_data';

  if (req.method === 'GET') {
    const data = await kv.get(KEY);
    return res.status(200).json(data || { salary: 0, months: {} });
  }

  if (req.method === 'POST') {
    await kv.set(KEY, req.body);
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
