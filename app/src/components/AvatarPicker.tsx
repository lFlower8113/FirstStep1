import { useEffect, useState } from 'react';
import { PixelPerson } from './PixelPerson';
import type { SpriteGender } from '../data/pixelSprites';

const options: { id: SpriteGender; name: string; tag: string }[] = [
  { id: 'male', name: '男生', tag: '短发' },
  { id: 'female', name: '女生', tag: '长发' },
];

export function AvatarPicker({ selected, onSelect, onConfirm }: { selected: SpriteGender; onSelect: (id: SpriteGender) => void; onConfirm: () => void }) {
  const [index, setIndex] = useState(Math.max(0, options.findIndex((item) => item.id === selected)));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setIndex((value) => (value + 1) % options.length);
      if (event.key === 'ArrowLeft') setIndex((value) => (value - 1 + options.length) % options.length);
      if (event.key === 'Enter') { onSelect(options[index].id); onConfirm(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, onConfirm, onSelect]);

  const choose = (next: number) => {
    setIndex(next);
    onSelect(options[next].id);
  };

  return <section className="avatar-picker" aria-label="选择形象">
    <div className="avatar-picker-inner phase-transition-card">
      <p className="eyebrow italic">choose your pixel self</p>
      <h1>选一个你</h1>
      <p className="muted">它会替你走进这个陌生的地方。</p>
      <div className="avatar-row">
        {options.map((option, optionIndex) => <button key={option.id} className={`avatar-option ${optionIndex === index ? 'is-selected' : ''}`} onClick={() => choose(optionIndex)} aria-label={`${option.name} ${option.tag}`}>
          <span className="pixel-frame"><PixelPerson gender={option.id} scale={4} /></span>
          <span className="avatar-label">{option.name}</span>
          <small>{option.tag}</small>
        </button>)}
      </div>
      <button className="primary-button" onClick={() => { onSelect(options[index].id); onConfirm(); }}>带我去看看 <span>→</span></button>
    </div>
  </section>;
}
