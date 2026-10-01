type Summary = {
  scenario: string;
  timeToFirstActionMs: number;
  flightAttempts: number;
  tipsOpened: string[];
  neededExtraGuidance: boolean;
  securityItemsPlaced: string[];
  gateFoundWithoutDirectHighlight: boolean;
  completed: boolean;
};

type Reply = { title: string; observation: string; meaning: string; closingLine: string };

const SYSTEM = [
  '你是 First Step 的行为观察者。First Step 是一个引导式互动模拟体验，帮助从未经历过某件事、并因此紧张的人，先在安全的模拟里走一遍。',
  '用户刚刚完成了一次「第一次坐飞机」的模拟体验。你会收到这次体验的行为摘要。',
  '严格规则：',
  '1. 只描述摘要里能观察到的事实，不要编造用户没做过的事。',
  '2. 不做心理诊断，不评价用户性格，不使用「你很勇敢」这类空洞赞美。',
  '3. 不提供任何现实生活建议，不生成任何真实的航空规则、票价或时间。',
  '4. 语气克制、具体、有温度。像一个安静的朋友在复述他刚看到的事。',
  '5. 只输出 JSON，字段为 title、observation、meaning、closingLine，每个字段都是字符串。',
  '6. observation 和 meaning 合计不超过 70 个汉字。',
].join('\n');

function buildUserPrompt(s: Summary) {
  const seconds = Math.max(0, Math.round(s.timeToFirstActionMs / 1000));
  const lines = [
    `场景：第一次坐飞机（模拟）`,
    `用户进入机场后，第一次主动操作发生在 ${seconds} 秒后。`,
    `查找航班：点击了 ${s.flightAttempts} 次航班信息屏。`,
    `安检：放入了 ${s.securityItemsPlaced.length} 件物品（${s.securityItemsPlaced.join('、') || '无'}）。`,
    `提示：用户打开了 ${s.tipsOpened.length} 条避坑提醒。`,
    s.neededExtraGuidance ? '引导：用户在某一步停顿过，系统给了额外提示。' : '引导：用户没有要额外提示。',
    s.gateFoundWithoutDirectHighlight ? '最后：在没有光标指引的情况下，用户自己找到了 18 号登机口。' : '最后：用户还没走到登机口。',
    s.completed ? '用户走完了整个流程。' : '用户没有走完整个流程。',
  ];
  return lines.join('\n');
}

function parseReply(text: string): Reply | null {
  if (!text) return null;
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<Reply>;
    if (typeof parsed.observation !== 'string' || typeof parsed.meaning !== 'string') return null;
    return {
      title: typeof parsed.title === 'string' ? parsed.title : '你已经走过一遍了',
      observation: parsed.observation.slice(0, 120),
      meaning: parsed.meaning.slice(0, 120),
      closingLine: typeof parsed.closingLine === 'string' ? parsed.closingLine : '这就是你的第一步。',
    };
  } catch {
    return null;
  }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash-high';
  if (!key) return new Response(JSON.stringify({ error: 'missing_key' }), { status: 500 });

  let summary: Summary;
  try {
    summary = (await request.json()) as Summary;
  } catch {
    return new Response(JSON.stringify({ error: 'bad_request' }), { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${SYSTEM}\n\n${buildUserPrompt(summary)}` }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 400, responseMimeType: 'application/json' },
      }),
    });
    clearTimeout(timeout);
    if (!response.ok) return new Response(JSON.stringify({ error: 'upstream', status: response.status }), { status: 502 });
    const data = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const reply = parseReply(text);
    if (!reply) return new Response(JSON.stringify({ error: 'bad_shape' }), { status: 502 });
    return new Response(JSON.stringify(reply), { headers: { 'content-type': 'application/json' } });
  } catch {
    clearTimeout(timeout);
    return new Response(JSON.stringify({ error: 'unreachable' }), { status: 502 });
  }
}
