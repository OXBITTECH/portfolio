export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in Vercel environment variables.' });

  const { coins, fearGreed, customTopic } = req.body;
  if (!coins?.length) return res.status(400).json({ error: 'No trending coins provided.' });

  const coinList = coins.map(c => `${c.name} (${c.symbol.toUpperCase()})`).join(', ');
  const sentimentLine = fearGreed
    ? `Market sentiment: ${fearGreed.classification} — Fear & Greed score ${fearGreed.value}/100`
    : '';
  const extraLine = customTopic ? `Extra context from user: ${customTopic}` : '';

  const prompt = `You are a crypto Twitter native. Generate exactly 3 tweet drafts about current trending crypto topics.

TRENDING RIGHT NOW: ${coinList}
${sentimentLine}
${extraLine}

Write 3 different posts:
1. DEGEN — Pure hopium. We're all gonna make it. Bought more. Number go up. Unhinged bullish energy.
2. DOOMER — Sarcastic "this is fine" energy. Ironic suffering. Dark humor. Watching portfolios bleed but pretending to be fine.
3. ALPHA — Fake insider energy. Sounds like you know something. Confident prediction. "My source says..." vibes.

RULES:
- Each post MAX 260 characters
- No hashtags (they are cringe in 2025)
- Sound like a real person, not a bot or a brand
- Use CT slang naturally when it fits: gm, ser, wagmi, ngmi, probably nothing, wen, fren, anon, based, cope, touch grass, have fun staying poor, not financial advice, etc.
- Reference the actual trending coins or market sentiment
- 0-2 emojis max per post

Respond with ONLY valid JSON — no markdown, no explanation, nothing else:
[{"tone":"DEGEN","text":"..."},{"tone":"DOOMER","text":"..."},{"tone":"ALPHA","text":"..."}]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'Claude API error' });
    }

    const data = await response.json();
    const raw = data.content[0].text.trim();

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return res.status(500).json({ error: 'AI returned unexpected format. Try again.' });

    const posts = JSON.parse(match[0]);
    return res.json({ posts });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
