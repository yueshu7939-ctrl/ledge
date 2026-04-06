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
        content: `You are parsing a voice expense entry. The user speaks naturally without verbs — just item and amount. Examples: "日本超市 20" means spent $20 at a Japanese supermarket. "打车 33" means $33 taxi. "麦当劳 外食 20" means $20 at McDonald's, food category.

Today is ${today}.
Input: "${transcript}"
Categories available: ${catList}

Rules:
- desc: the merchant or item name (clean, no amount)
- amount: the number spoken, always positive
- parent: best matching category key from the list
- sub: subcategory key if applicable, otherwise null
- date: "${today}"

Return ONLY valid JSON, no markdown, no explanation:
{"desc":"merchant name","amount":number,"parent":"category_key","sub":"subcategory_key_or_null","date":"${today}"}`
      }]
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    return res.status(500).json({ error: 'Anthropic API error', status: response.status, detail: errBody });
  }

  const data = await response.json();
  const text = data.content?.[0]?.text?.trim();
  if (!text) return res.status(500).json({ error: 'No response from AI' });

  // Strip markdown code fences if present
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: 'Parse failed', raw: text });
  }
}
