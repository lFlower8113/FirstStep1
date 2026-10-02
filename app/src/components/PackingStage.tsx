import { useEffect, useState } from 'react';
import { departureSchedule, packItems, phaseCopy } from '../data/airportScenario';
import type { Action, AppState } from '../types';

/* The departure stage happens at home, so it keeps the calm starfield rather
   than loading the terminal. Packing is where first-flight nerves
   actually start, which is exactly the moment this experience targets. */
export function PackingStage({ state, dispatch }: { state: AppState; dispatch: React.Dispatch<Action> }) {
  const copy = phaseCopy[state.phase];
  const [activeTipItem, setActiveTipItem] = useState<string | null>(null);

  useEffect(() => {
    setActiveTipItem(null);
  }, [state.phase]);

  const hasId = state.packedItems.includes('id');
  const hasPhone = state.packedItems.includes('phone');
  const hasPowerbank = state.packedItems.includes('powerbank');
  const currentItem = packItems.find((item) => item.id === activeTipItem);

  const toggleItem = (itemId: string) => {
    dispatch({ type: 'EVENT', name: 'item_packed', payload: { item: itemId } });
    setActiveTipItem(itemId);
  };

  if (state.phase === 'packing') {
    return (
      <section className="packing-stage" aria-label="出发前准备">
        <header className="topbar">
          <span>FIRST STEP</span>
          <span className="topbar-right">01 / 出发前准备 · 在家里</span>
        </header>

        <div className="packing-inner">
          <p className="eyebrow italic">{copy.en}</p>
          <h1>{copy.zh}</h1>
          <p className="muted">
            第一次出门坐飞机，最怕的就是漏带东西或带错违禁品。
            点击下方物品亲手装进行囊，看看老旅客才知道的真实贴心规矩。
          </p>

          <div className="pack-grid">
            {packItems.map((item) => {
              const packed = state.packedItems.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`pack-item ${packed ? 'is-packed' : ''} is-${item.category}`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="pack-item-header">
                    <span className="pack-icon">{item.icon}</span>
                    {item.category === 'must' && <span className="pack-flag is-must">必带</span>}
                    {item.category === 'caution' && <span className="pack-flag is-caution">民航规则</span>}
                    {item.category === 'normal' && <span className="pack-flag is-normal">贴心建议</span>}
                  </div>
                  <span className="pack-name">{item.name}</span>
                  <span className="pack-subtitle">{item.subtitle}</span>
                  <span className="pack-status">{packed ? '✓ 已放入随身包' : '+ 点击装入行囊'}</span>
                </button>
              );
            })}
          </div>

          <div className="packing-bottom-bar">
            <div className="packing-quick-status">
              <span className={`status-pill ${hasId ? 'is-ok' : 'is-warn'}`}>
                {hasId ? '✓ 实体身份证已装好' : '⚠️ 尚未携带实体身份证'}
              </span>
              <span className={`status-pill ${hasPhone ? 'is-ok' : ''}`}>
                {hasPhone ? '✓ 手机行程已备好' : '○ 手机'}
              </span>
              <span className={`status-pill ${hasPowerbank ? 'is-ok' : ''}`}>
                {hasPowerbank ? '✓ 随身充电宝已核验' : '○ 充电宝随身'}
              </span>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => dispatch({ type: 'ADVANCE', phase: 'packingList' })}
              disabled={!hasId}
            >
              {!hasId ? '请先带上最重要的身份证' : '行囊理好了，核对出发时间'} <span>→</span>
            </button>
          </div>
        </div>

        {currentItem && (
          <aside className="tip-card is-center">
            <button
              type="button"
              className="close-tip"
              onClick={() => setActiveTipItem(null)}
              aria-label="关闭提示"
            >
              ×
            </button>
            <p className="eyebrow italic">TRAVELER TIP · 真实贴士</p>
            <h2>{currentItem.name}</h2>
            <p className="tip-rule">{currentItem.subtitle}</p>
            <p className="tip-detail">{currentItem.tip}</p>
            <div className="tip-actions">
              <button
                type="button"
                className="primary-button small"
                onClick={() => setActiveTipItem(null)}
              >
                收好这件物品 <span>✓</span>
              </button>
            </div>
          </aside>
        )}
      </section>
    );
  }

  // Phase: packingList (Readiness & Time check)
  const mustItems = packItems.filter((i) => i.category === 'must');
  const missingMust = mustItems.filter((i) => !state.packedItems.includes(i.id));

  return (
    <section className="packing-stage" aria-label="出发时间与准备确认">
      <header className="topbar">
        <span>FIRST STEP</span>
        <span className="topbar-right">01 / 出发前准备 · 时间规划</span>
      </header>

      <div className="packing-inner">
        <p className="eyebrow italic">{copy.en}</p>
        <h1>{copy.zh}</h1>
        <p className="muted">
          坐飞机从不匆忙的秘密，就是算准这几个关键时间点。
          把时间放在心里，你就不需要一路小跑和心慌。
        </p>

        {/* Departure Timeline Card */}
        <div className="timeline-card">
          <div className="timeline-header">
            <div>
              <span className="flight-badge">{departureSchedule.flightNo}</span>
              <strong>{departureSchedule.route}</strong>
            </div>
            <div className="takeoff-time">
              起飞时间 <span>{departureSchedule.departureTime}</span>
            </div>
          </div>

          <div className="timeline-steps">
            <div className="timeline-node is-highlight">
              <span className="node-time">{departureSchedule.recommendArrive}</span>
              <span className="node-label">建议到达航站楼</span>
              <small>提前 2 小时到，办值机、过安检最从容，遇到排队也完全不慌</small>
            </div>
            <div className="timeline-node">
              <span className="node-time">{departureSchedule.checkInClose}</span>
              <span className="node-label">柜台停止办理值机</span>
              <small>起飞前 40 分钟截止，晚于此时将无法打印登机牌或托运行李</small>
            </div>
            <div className="timeline-node">
              <span className="node-time">{departureSchedule.gateClose}</span>
              <span className="node-label">登机口关闭</span>
              <small>起飞前 20 分钟关闭舱门，务必提前在登机口座椅等待</small>
            </div>
          </div>
        </div>

        {/* Readiness overview */}
        <div className="packing-summary">
          <p>
            <span>{state.packedItems.length}</span>件物品已放入随身包
          </p>
          <p>
            <span>{hasId ? '✓' : '✗'}</span>实体身份证在随身外层
          </p>
          <p>
            <span>{hasPowerbank ? '✓' : '未选'}</span>充电宝绝不托运
          </p>
        </div>

        {missingMust.length > 0 && (
          <aside className="tip-card is-center">
            <p className="eyebrow italic">IMPORTANT REMINDER · 关键提醒</p>
            <h2>你可能忘了最重要的：{missingMust[0].name}</h2>
            <p>{missingMust[0].tip}</p>
            <button
              type="button"
              className="primary-button small"
              onClick={() =>
                dispatch({
                  type: 'EVENT',
                  name: 'item_packed',
                  payload: { item: missingMust[0].id },
                })
              }
            >
              现在补上它 <span>+</span>
            </button>
          </aside>
        )}

        <div className="timeline-actions">
          <button
            type="button"
            className="text-action"
            onClick={() => dispatch({ type: 'ADVANCE', phase: 'packing' })}
          >
            ← 返回检查行囊
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => dispatch({ type: 'ADVANCE', phase: 'arrival' })}
          >
            带上行囊与证件，出发去机场 <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
