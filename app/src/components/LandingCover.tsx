import { useState } from 'react';

const cards = [
  { src: '/cover/city.jpg', className: 'cover-card city', alt: '城市夜景' },
  { src: '/cover/snow.jpg', className: 'cover-card snow', alt: '雪地灯光' },
  { src: '/cover/note.jpg', className: 'cover-card note', alt: '手写便签' },
  { src: '/cover/wing.jpg', className: 'cover-card wing', alt: '飞机窗外的云' },
];

export function LandingCover({ onEnter }: { onEnter: () => void }) {
  const [missing, setMissing] = useState<Record<string, boolean>>({});
  return <section className="landing-cover" aria-label="First Step 首页">
    <div className="cover-backdrop" />
    <div className="cover-grain" />
    <p className="handwritten-note cover-note">Every journey begins with one step.</p>
    <div className="cover-collage" aria-hidden="true">
      {cards.map((card) => <div key={card.src} className={`${card.className} ${missing[card.src] ? 'is-missing' : ''}`}>
        {!missing[card.src] && <img src={card.src} alt={card.alt} onError={() => setMissing((current) => ({ ...current, [card.src]: true }))} />}
      </div>)}
    </div>
    <button className="cover-hero" onClick={onEnter} aria-label="进入 First Step">
      <span className="cover-kicker">a small beginning is still a beginning</span>
      <strong>first step</strong>
      <span className="cover-cn">第一次出发</span>
      <span className="cover-subtitle">你不需要一次知道所有事情。<br />我们先走下一步。</span>
    </button>
    <div className="cover-signature">FIRST STEP <span>01 / BEGIN</span></div>
  </section>;
}
