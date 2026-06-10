export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { mainType, subType, hensachi, rank } = req.body || {};

  const prompt = `あなたは恋愛診断アプリのアドバイザーです。
以下の診断結果の人に向けて、面白くてシェアしたくなる恋愛アドバイスを日本語で書いてください。

メインタイプ：${mainType}
サブタイプ：${subType}
モテ偏差値：${hensachi}
モテランク：${rank}

条件：
- 3〜4文でコンパクトに
- ユーモアを交えつつ、でも妙に納得感がある内容
- 「当たってる！」より「友達に送りたくなる」トーンで
- 絵文字を1〜2個使ってOK
- 説教くさくならないこと

アドバイスのテキストのみ返してください。前置き不要。`;

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
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: 'Upstream error', detail: data });
    const text = data.content.map(b => b.text || '').join('').trim();
    res.status(200).json({ advice: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
