export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { transcript, today, catList } = req.body;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Parse this expense into JSON. Today is ${today}.
Transcript: "${transcript}"
Categories: ${catList}
Return ONLY valid JSON, no markdown, no explanation:
{"desc":"merchant name","amount":number,"parent":"category_key","sub":"subcategory_key_or_null","date":"${today}"}`
      }]
    })
  });

  const data = await response.json();
  const text = data.content?.[0]?.text?.trim();
  if (!text) return res.status(500).json({ error: 'No response from AI' });

  try {
    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: 'Parse failed', raw: text });
  }
}
