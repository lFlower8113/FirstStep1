import type { SessionSummary } from './types';

type ReflectionSource = 'local' | 'ai';
export type Reflection = { title: string; observation: string; meaning: string; closingLine: string; source: ReflectionSource };

const localReflection = (summary: SessionSummary): Reflection => {
  const seconds = Math.max(0, Math.round(summary.timeToFirstActionMs / 1000));
  const hesitant = summary.timeToFirstActionMs > 7000;
  const first = hesitant ? `你在出发前停了一会儿，${seconds} 秒后才动了第一步。` : `${seconds} 秒，你就动了第一步。`;
  const second = summary.neededExtraGuidance
    ? '有人给了你一点提示，你就继续往前了。'
    : '你没有等所有不确定都消失，就先走出去了。';
  return {
    title: '你已经走过一遍了',
    observation: `${first}${second}`,
    meaning: '你不需要一次知道所有事情，才有资格走向下一步。',
    closingLine: '这就是你的第一步。',
    source: 'local',
  };
};

/* One call per session, short output, local text rendered first.
   Any failure keeps the experience running on the local note. */
export async function getReflection(summary: SessionSummary): Promise<Reflection> {
  const local = localReflection(summary);
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 9000);
    const response = await fetch('/api/reflection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(summary),
      signal: controller.signal,
    });
    window.clearTimeout(timeout);
    if (!response.ok) return local;
    const data = (await response.json()) as Partial<Reflection>;
    if (typeof data.observation !== 'string' || typeof data.meaning !== 'string') return local;
    return {
      title: data.title || local.title,
      observation: data.observation,
      meaning: data.meaning,
      closingLine: data.closingLine || local.closingLine,
      source: 'ai',
    };
  } catch {
    return local;
  }
}
