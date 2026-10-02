import { scenarios, type Scenario } from '../data/scenarios';

export function ScenarioLibrary({ onEnter, onBack }: { onEnter: () => void; onBack: () => void }) {
  return <section className="scenario-library" aria-label="所有第一次">
    <p className="handwritten-note">Every journey begins with one step.</p>
    <header className="topbar"><span>FIRST STEP</span><span className="topbar-right">全部 / ALL</span></header>
    <div className="library-inner phase-transition-card">
      <p className="eyebrow italic">all your firsts</p>
      <h1>所有第一次</h1>
      <p className="library-lead">下面这些事，你都可以先在这里走一遍。</p>
      <ul className="scenario-list">
        {scenarios.map((scenario: Scenario, index) => {
          const ready = scenario.status === 'ready';
          const inner = <>
            <span className="scenario-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="scenario-body"><strong>{scenario.title}</strong><small>{scenario.place} · 约 {scenario.minutes} 分钟</small></span>
            <span className={`scenario-state ${ready ? 'is-ready' : 'is-soon'}`}>{ready ? '进入体验' : '即将开放'}</span>
          </>;
          return <li key={scenario.id} className={`scenario-row ${ready ? 'is-ready' : 'is-locked'}`}>
            {ready ? <button onClick={onEnter}>{inner}</button> : <div className="scenario-static">{inner}</div>}
          </li>;
        })}
      </ul>
      <button className="library-back" onClick={onBack}>返回封面</button>
    </div>
  </section>;
}
