import type { SessionSummary } from './types';

type ReflectionSource = 'local' | 'ai';
export type Reflection = { title: string; observation: string; meaning: string; closingLine: string; source: ReflectionSource };

const localReflection = (summary: SessionSummary): Reflection => {
  const seconds = Math.max(0, Math.round(summary.timeToFirstActionMs / 1000));
  const hesitant = summary.timeToFirstActionMs > 7000;
  const first = hesitant ? `在陌生的大厅前你稍微停顿了一下，观察了 ${seconds} 秒后迈出了第一步。` : `面对未知的大厅，你只用了 ${seconds} 秒就找到了第一步的方向。`;
  const second = summary.neededExtraGuidance
    ? '哪怕中间有拿不准的细节，顺着指引，你也一步步稳稳走到了最后。'
    : '你没有等待所有未知消失，而是顺着大屏与路标从容完成了全程。';
  return {
    title: '你已经完整走过一遍了',
    observation: `${first}${second}`,
    meaning: '坐飞机其实真的没有那么复杂，生活里的许多未知也是一样：收拾好行囊，带齐证件，每次只做好眼前这一步。',
    closingLine: '你看，坐飞机原来这么简单。在现实中，你也完全可以迈出这一步。',
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
