import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/* Serves /api/reflection during `npm run dev` so the same code path
   works locally and on Vercel. The key is read from the environment
   and never sent to the browser. */
function localApi(env: Record<string, string>): Plugin {
  return {
    name: 'first-step-local-api',
    configureServer(server) {
      server.middlewares.use('/api/reflection', async (request, response) => {
        if (request.method !== 'POST') { response.statusCode = 405; response.end(); return; }
        const key = env.GEMINI_API_KEY;
        const model = env.GEMINI_MODEL || 'gemini-3.8-flash-high';
        if (!key) { response.statusCode = 500; response.setHeader('content-type', 'application/json'); response.end(JSON.stringify({ error: 'missing_key' })); return; }
        const chunks: Buffer[] = [];
        for await (const chunk of request) chunks.push(chunk as Buffer);
        let summary: Record<string, unknown>;
        try { summary = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { response.statusCode = 400; response.end(); return; }

        const seconds = Math.max(0, Math.round(Number(summary.timeToFirstActionMs || 0) / 1000));
        const tips = Array.isArray(summary.tipsOpened) ? summary.tipsOpened.length : 0;
        const items = Array.isArray(summary.securityItemsPlaced) ? summary.securityItemsPlaced.length : 0;

        const system = [
          '你是 First Step 的行为观察者。First Step 帮助从未经历过某件事、并因此紧张的人，先在安全的模拟里走一遍。',
          '用户刚完成一次「第一次坐飞机」的模拟。你会收到行为摘要。',
          '严格规则：只描述摘要中能观察到的事实；不做心理诊断；不评价性格；不使用空洞赞美；不提供现实生活建议；不生成任何真实航空规则、票价或时间。',
          '语气克制、具体、有温度。',
          '只输出 JSON：title、observation、meaning、closingLine，均为字符串。observation 与 meaning 合计不超过 70 个汉字。',
        ].join('\n');

        const userPrompt = [
          '场景：第一次坐飞机（模拟）',
          `第一次主动操作发生在 ${seconds} 秒后。`,
          `点击航班屏 ${Number(summary.flightAttempts || 0)} 次。`,
          `安检放入 ${items} 件物品。`,
          `打开 ${tips} 条避坑提醒。`,
          summary.neededExtraGuidance ? '用户停顿过，系统给了额外提示。' : '用户没有要额外提示。',
          summary.gateFoundWithoutDirectHighlight ? '最后，用户在没有光标指引的情况下自己找到了 18 号登机口。' : '用户还没走到登机口。',
          summary.completed ? '用户走完了整个流程。' : '用户没有走完整个流程。',
        ].join('\n');

        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);
          const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: `${system}\n\n${userPrompt}` }] }],
              generationConfig: { temperature: 0.85, maxOutputTokens: 400, responseMimeType: 'application/json' },
            }),
          });
          clearTimeout(timer);
          if (!upstream.ok) { response.statusCode = 502; response.end(); return; }
          const data = (await upstream.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
          const start = cleaned.indexOf('{');
          const end = cleaned.lastIndexOf('}');
          if (start === -1 || end === -1) { response.statusCode = 502; response.end(); return; }
          response.setHeader('content-type', 'application/json');
          response.end(cleaned.slice(start, end + 1));
        } catch {
          response.statusCode = 502; response.end();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return { plugins: [react(), localApi(env)], server: { port: 5173, host: true } };
});
