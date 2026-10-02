import { useEffect, useState } from 'react';
import { phaseCopy, tips, departureSchedule } from '../data/airportScenario';
import { PixelPerson } from './PixelPerson';
import type { Action, AppState, PhaseId } from '../types';
import type { Reflection } from '../reflection';

const nextPhase: Partial<Record<PhaseId, PhaseId>> = {
  intro: 'packing',
  packing: 'packingList',
  packingList: 'arrival',
  arrival: 'lookAround',
  lookAround: 'observe',
  observe: 'demoBoard',
  demoBoard: 'findFlight',
  findFlight: 'goCounter',
  goCounter: 'baggage',
  baggage: 'followPath',
  followPath: 'securityDemo',
  securityDemo: 'securityTip',
  securityTip: 'security',
  security: 'reduceGuidance',
  reduceGuidance: 'waitGate',
  waitGate: 'findGate',
  findGate: 'board',
  board: 'arrive',
  arrive: 'reflection',
  reflection: 'takeaways',
  takeaways: 'complete',
};

/* Only keep a relaxed timeout fallback so users who step away are not stuck,
   while active users can immediately click their way through without waiting. */
const relaxedTimeoutPhases: Partial<Record<PhaseId, number>> = {
  arrival: 14000,
  observe: 14000,
  demoBoard: 12000,
  followPath: 12000,
  securityDemo: 12000,
  reduceGuidance: 12000,
  waitGate: 14000,
};

export function GuidanceOverlay({
  state,
  dispatch,
  onReflect,
  reflection,
  reflectionLoading,
  sound,
  onCounter,
  onReset,
}: {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  onReflect: () => void;
  reflection?: Reflection | null;
  reflectionLoading?: boolean;
  sound: { enabled: boolean; toggle: () => void };
  onCounter: () => void;
  onReset?: () => void;
}) {
  const isCabin = ['arrive', 'reflection', 'takeaways', 'complete'].includes(state.phase);
  const copy = phaseCopy[state.phase];
  const [tipOpen, setTipOpen] = useState(false);
  const [activeTipId, setActiveTipId] = useState<string | null>(null);

  // Local interactive states for counter, security and boarding
  const [counterStep, setCounterStep] = useState<'id' | 'luggage' | 'ticket'>('id');
  const [hasCheckedLuggage, setHasCheckedLuggage] = useState(false);
  const [boardingStep, setBoardingStep] = useState<'scan' | 'bridge' | 'seat'>('scan');

  const tip = tips.find((item) => item.id === activeTipId) ?? tips.find((item) => item.phase === state.phase);

  // Reset or initialize sub-states when phase changes
  useEffect(() => {
    if (state.phase === 'securityTip') {
      setActiveTipId('security-prep');
      setTipOpen(true);
    } else if (state.phase === 'baggage') {
      setActiveTipId('baggage-fee');
      dispatch({ type: 'OPEN_TIP', tipId: 'baggage-fee' });
      setCounterStep('id');
    } else if (state.phase === 'findFlight') {
      setActiveTipId('flight-board');
    } else {
      setTipOpen(false);
    }
  }, [dispatch, state.phase]);

  // Relaxed fallback timer (users don't have to wait; they can click anytime)
  useEffect(() => {
    const delay = relaxedTimeoutPhases[state.phase];
    if (!delay) return;
    const timer = window.setTimeout(() => {
      const target = nextPhase[state.phase];
      if (target) dispatch({ type: 'ADVANCE', phase: target });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [dispatch, state.phase]);

  // Gentle stall hints
  useEffect(() => {
    if (!['findFlight', 'security', 'findGate'].includes(state.phase)) return;
    const timer = window.setTimeout(() => dispatch({ type: 'HINT' }), 8000);
    return () => window.clearTimeout(timer);
  }, [dispatch, state.phase]);

  const advance = () => {
    const target = nextPhase[state.phase];
    if (target) dispatch({ type: 'ADVANCE', phase: target });
    else onReflect();
  };

  const openTip = (tipId: string) => {
    setActiveTipId(tipId);
    setTipOpen(true);
    dispatch({ type: 'OPEN_TIP', tipId });
  };

  const clickSecurity = (item: string) => {
    dispatch({ type: 'EVENT', name: 'security_item_placed', payload: { item } });
  };

  const securityPlaced = state.securityItemsPlaced;
  const isSecurityReady =
    securityPlaced.includes('phone') &&
    securityPlaced.includes('powerbank') &&
    securityPlaced.includes('bag');
  const isSecurityPhase = ['security', 'securityDemo', 'securityTip'].includes(state.phase);

  return (
    <>
      <header className="topbar">
        <span>FIRST STEP</span>
        <span className="topbar-right">{isCabin ? '01 / 第一次坐飞机 · 万米高空巡航' : '01 / 第一次坐飞机 · 航站楼'}</span>
        <button
          type="button"
          className="sound-toggle"
          onClick={sound.toggle}
          aria-pressed={sound.enabled}
        >
          {sound.enabled ? '环境声 开' : '环境声 关'}
        </button>
      </header>

      <main className="overlay-content">
        {!isCabin ? (
          <section className="guidance-panel">
            <p className="eyebrow italic">{copy.en}</p>
            <h1>
              {copy.zh.split('\n').map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h1>
            {state.hintLevel > 0 && copy.hint && <p className="hint">{copy.hint}</p>}

          {/* Phase 1: Intro */}
          {state.phase === 'intro' && (
            <button type="button" className="primary-button" onClick={advance}>
              开始准备我的行囊 <span>→</span>
            </button>
          )}

          {/* Phase 2: Arrival at Terminal */}
          {state.phase === 'arrival' && (
            <>
              <p className="scene-hint">
                阳光洒在大厅地板上，透过窗户能看到停机坪的蓝天与客机。
                <span>大厅再大，我们每次也只做一件事。</span>
              </p>
              <div className="active-action-row">
                <button type="button" className="primary-button small" onClick={advance}>
                  看清楚了，向前走 <span>→</span>
                </button>
                <button
                  type="button"
                  className="text-action"
                  onClick={() => dispatch({ type: 'ADVANCE', phase: 'lookAround' })}
                >
                  先转动视角环顾四周 <span>⊙</span>
                </button>
              </div>
            </>
          )}

          {/* Phase 2.1: Look Around */}
          {state.phase === 'lookAround' && (
            <>
              <p className="scene-hint">
                按住鼠标拖动，可以自己环视大厅与落地窗外的晴空。
                <span>看够了就继续下一步。</span>
              </p>
              <button type="button" className="text-action" onClick={advance}>
                看清楚了，开始找航班 <span>→</span>
              </button>
            </>
          )}

          {/* Phase 2.2: Observe the hall and flight board */}
          {state.phase === 'observe' && (
            <>
              <p className="scene-hint">
                不用盲目到处乱转，第一步永远是抬头看正前方的高悬大屏。
              </p>
              <button type="button" className="primary-button small" onClick={advance}>
                已看清大厅格局，走近大屏找航班 <span>→</span>
              </button>
            </>
          )}

          {/* Phase 2.3: Demo Board */}
          {state.phase === 'demoBoard' && (
            <>
              <p className="scene-hint">
                屏幕上有数十个滚动的航班。
                <span>锁定前往上海的 FS001 这一行。</span>
              </p>
              <button type="button" className="text-action" onClick={advance}>
                看到 FS001 了，锁定航班 <span>→</span>
              </button>
            </>
          )}

          {/* Phase 3: Find Flight */}
          {state.phase === 'findFlight' && (
            <div className="flight-find-hud">
              <div className="flight-sms-card">
                <span className="sms-badge">📱 手机行程提醒短信</span>
                <p>
                  【首航提醒】您乘坐的 <strong>FS001</strong>（北京首都 T3 - 上海虹桥）09:40 起飞。
                  正在办理值机，推荐柜台：<strong>A 岛 (A01)</strong>。
                </p>
              </div>
              <p className="scene-hint">
                点击上方大屏幕第三行高亮的 <strong>FS001</strong>
              </p>
              <button
                type="button"
                className="text-action"
                onClick={() => {
                  dispatch({ type: 'EVENT', name: 'first_action' });
                  dispatch({ type: 'EVENT', name: 'flight_found' });
                  dispatch({ type: 'ADVANCE', phase: 'goCounter' });
                }}
              >
                已确认 FS001 在 A 岛值机 <span>→</span>
              </button>
            </div>
          )}

          {/* Phase 4: Go to counter */}
          {state.phase === 'goCounter' && (
            <>
              <p className="scene-hint">
                FS001 在左侧 <strong>A 岛 A01</strong> 柜台办理。
                <span>走向左前方的柜台。</span>
              </p>
              <button type="button" className="text-action" onClick={onCounter}>
                走向 A01 柜台 <span>→</span>
              </button>
            </>
          )}

          {/* Phase 5: Baggage and Boarding Pass Counter */}
          {state.phase === 'baggage' && (
            <div className="counter-interaction-box">
              {counterStep === 'id' && (
                <div className="counter-dialog">
                  <div className="staff-speech">
                    <span className="staff-avatar">👩‍💼 地勤人员</span>
                    <p>“您好！请出示您的有效乘机身份证件原件，前往上海虹桥对吗？”</p>
                  </div>
                  <button
                    type="button"
                    className="primary-button small"
                    onClick={() => {
                      dispatch({ type: 'EVENT', name: 'id_checked' });
                      setCounterStep('luggage');
                    }}
                  >
                    递出实体身份证 <span>▤</span>
                  </button>
                </div>
              )}

              {counterStep === 'luggage' && (
                <div className="counter-dialog">
                  <div className="staff-speech">
                    <span className="staff-avatar">👩‍💼 地勤人员</span>
                    <p>
                      “身份核验通过。请问有行李箱需要办理托运吗？
                      箱子里<strong>切勿存放充电宝、锂电池、打火机</strong>。”
                    </p>
                  </div>
                  <div className="luggage-choices">
                    <button
                      type="button"
                      className="choice-button"
                      onClick={() => {
                        setHasCheckedLuggage(false);
                        setCounterStep('ticket');
                        dispatch({ type: 'EVENT', name: 'boarding_pass_issued' });
                      }}
                    >
                      仅随身背包，无托运行李 <span>✓</span>
                    </button>
                    <button
                      type="button"
                      className="choice-button is-highlight"
                      onClick={() => {
                        setHasCheckedLuggage(true);
                        setCounterStep('ticket');
                        dispatch({ type: 'EVENT', name: 'boarding_pass_issued' });
                      }}
                    >
                      托运 1 件行李箱（已确认箱内无充电宝） <span>🧳</span>
                    </button>
                  </div>
                </div>
              )}

              {counterStep === 'ticket' && (
                <div className="counter-ticket-ready">
                  <p className="scene-hint">
                    登机牌打印完成！{hasCheckedLuggage ? '行李条已贴在箱子上并送入传送带。' : ''}
                    <span>点击下方查看你的专属登机牌。</span>
                  </p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={advance}
                  >
                    拿好登机牌与身份证，前往安检 <span>→</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Phase 6: Heading to security */}
          {state.phase === 'followPath' && (
            <>
              <p className="scene-hint">
                跟着地面金色的灯带向前走，前往国内安全检查通道。
              </p>
              <button type="button" className="primary-button small" onClick={advance}>
                走向安检通道 <span>→</span>
              </button>
            </>
          )}

          {/* Phase 6.1: Security Demo */}
          {state.phase === 'securityDemo' && (
            <>
              <p className="scene-hint">
                安检需要把随身电子产品单独拿出。
                <span>把物品放在外层，一会儿过检才从容。</span>
              </p>
              <button type="button" className="text-action" onClick={advance}>
                看懂了，准备过安检 <span>→</span>
              </button>
            </>
          )}

          {/* Phase 7: Security Tip */}
          {state.phase === 'securityTip' && (
            <button
              type="button"
              className="tip-link"
              onClick={() => {
                dispatch({ type: 'OPEN_TIP', tipId: 'security-prep' });
                dispatch({ type: 'ADVANCE', phase: 'security' });
              }}
            >
              了解安检小诀窍，开始安检 <span>ⓘ</span>
            </button>
          )}

          {/* Phase 8: Security Tray Interaction */}
          {state.phase === 'security' && (
            <div className="security-station-hud">
              <p className="scene-hint">
                取一个灰色塑料托盘，把随身物品分类平放：
              </p>
              <div className="security-tray-grid">
                <button
                  type="button"
                  className={`tray-item ${securityPlaced.includes('phone') ? 'is-placed' : ''}`}
                  onClick={() => clickSecurity('phone')}
                >
                  <span className="tray-icon">📱</span>
                  <strong>手机与金属钥匙</strong>
                  <small>{securityPlaced.includes('phone') ? '✓ 已平放托盘' : '+ 点击放入'}</small>
                </button>

                <button
                  type="button"
                  className={`tray-item ${securityPlaced.includes('powerbank') ? 'is-placed' : ''}`}
                  onClick={() => clickSecurity('powerbank')}
                >
                  <span className="tray-icon">🔋</span>
                  <strong>随身充电宝</strong>
                  <small>{securityPlaced.includes('powerbank') ? '✓ 单独拿出来平放' : '+ 点击放入'}</small>
                </button>

                <button
                  type="button"
                  className={`tray-item ${securityPlaced.includes('bag') ? 'is-placed' : ''}`}
                  onClick={() => clickSecurity('bag')}
                >
                  <span className="tray-icon">🎒</span>
                  <strong>双肩包 / 随身包</strong>
                  <small>{securityPlaced.includes('bag') ? '✓ 已平放传送带' : '+ 点击放入'}</small>
                </button>
              </div>

              {isSecurityReady && (
                <div className="security-done-box">
                  <p className="scene-hint">
                    物品已送入 X 光机检查，人身平稳穿过金属探测门。
                    <span>（安检人员严肃是工作规范，配合抬手即可，完全不用紧张）</span>
                  </p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => dispatch({ type: 'ADVANCE', phase: 'reduceGuidance' })}
                  >
                    在传送带另一侧取回随身物品，完成安检 <span>→</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Phase 9: Reduce Guidance */}
          {state.phase === 'reduceGuidance' && (
            <button type="button" className="text-action" onClick={advance}>
              最繁琐的关卡已过，走向候机区 <span>→</span>
            </button>
          )}

          {/* Phase 10: Wait Gate Concourse */}
          {state.phase === 'waitGate' && (
            <>
              <p className="scene-hint">
                顺着头顶蓝色指示牌，前方就是 18 号登机口。
                <span>窗外能看到停靠在机坪的飞机。</span>
              </p>
              <button type="button" className="primary-button small" onClick={advance}>
                看到 Gate 18 标志了，走过去 <span>→</span>
              </button>
            </>
          )}

          {/* Phase 11: Find Gate 18 */}
          {state.phase === 'findGate' && (
            <>
              <p className="scene-hint">
                这一次没有地面引导。
                <span>试着在前方找到散发暖光的 <strong>18 号登机口</strong>。</span>
              </p>
              <button
                type="button"
                className="text-action"
                onClick={() => {
                  dispatch({ type: 'EVENT', name: 'gate_found' });
                  dispatch({ type: 'ADVANCE', phase: 'board' });
                }}
              >
                已看到 Gate 18 标志，走向登机口 <span>→</span>
              </button>
            </>
          )}

          {/* Phase 12: Boarding */}
          {state.phase === 'board' && (
            <div className="boarding-hud">
              {boardingStep === 'scan' && (
                <>
                  <p className="scene-hint">
                    广播播报：“前往上海的旅客请注意，FS001 航班现在开始登机…”
                    <span>请拿出登机牌，在闸机扫描二维码。</span>
                  </p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => setBoardingStep('bridge')}
                  >
                    刷登机牌二维码过闸机 <span>🎟️</span>
                  </button>
                </>
              )}

              {boardingStep === 'bridge' && (
                <>
                  <p className="scene-hint">
                    走过透明登机廊桥，透过玻璃能看到停机坪与巨大的飞机机身。
                    <span>空乘人员微笑迎客：“您好，16A 靠窗请往左侧走。”</span>
                  </p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      dispatch({ type: 'EVENT', name: 'boarded' });
                      dispatch({ type: 'ADVANCE', phase: 'arrive' });
                    }}
                  >
                    步入机舱，寻找 16A 座位 <span>✈️</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* End of terminal guidance */}
        </section>
        ) : (
          <section className="cabin-overlay-hud">
            {/* Phase 13: Arrive / Cabin seated */}
            {state.phase === 'arrive' && (
              <div className="cabin-overlay-card">
                <div className="cabin-badge">✈️ 客舱就座 · 16A 靠窗 · 巡航高度 10,000 米</div>
                <p className="eyebrow italic">{copy.en}</p>
                <h2 className="cabin-card-title">你已经平稳坐上了飞机</h2>
                <p className="cabin-card-desc">
                  放好随身背包，系紧安全带。透过 16A 舷窗，万米高空的金色晚霞与柔软云海在机翼下缓缓流动。<br />
                  听着机舱内平稳安宁的低鸣，机场里所有的未知与紧张，都已化作身后看得到的风景。
                </p>
                <div className="active-action-row">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={onReflect}
                  >
                    回望这次旅程的沉淀与寄语 <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* Phase 14: Reflection in Cabin */}
            {state.phase === 'reflection' && (
              <div className="cabin-overlay-card is-reflection">
                <div className="cabin-badge">✈️ 16A 舷窗沉思 · 旅程沉淀</div>
                <div className="reflection-card-top">
                  <span className="eyebrow italic">A NOTE FROM YOUR JOURNEY</span>
                  <span className="source-chip">{reflection?.source === 'ai' ? 'AI 寄语' : 'FIRST STEP 寄语'}</span>
                </div>
                {reflectionLoading ? (
                  <div className="cabin-loading-box">
                    <span className="loading-dot" />
                    <span>正在为你静静整理这次飞行的独家沉淀与鼓励…</span>
                  </div>
                ) : (
                  <>
                    <h2 className="cabin-card-title">{reflection?.observation ?? '面对未知的大厅，你一步步稳稳做好了眼前的事。'}</h2>
                    <p className="reflection-meaning">{reflection?.meaning ?? '坐飞机其实真的没有那么复杂，生活里的许多未知也是一样：收拾好行囊，带齐证件，每次只做好眼前这一步。'}</p>
                    <p className="closing-line">{reflection?.closingLine ?? '你看，坐飞机原来这么简单。在现实中，你也完全可以迈出这一步。'}</p>
                    <div className="active-action-row">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => dispatch({ type: 'ADVANCE', phase: 'takeaways' })}
                      >
                        带走 4 条终身受用的飞行锦囊 <span>→</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Phase 15: Takeaways */}
            {state.phase === 'takeaways' && (
              <div className="cabin-overlay-card is-takeaways">
                <div className="cabin-badge">✈️ 客舱就座 · 16A 靠窗 · 飞行常识</div>
                <p className="eyebrow italic">FOUR TIMELESS RULES</p>
                <h2 className="cabin-card-title">四个最受用的飞行常识，无论去哪个机场都管用</h2>
                <div className="takeaways-grid">
                  <div className="takeaway-card-item">
                    <span className="takeaway-num">01</span>
                    <div className="takeaway-text">
                      <strong>先看大屏，不盲目问路</strong>
                      <p>进入航站楼先找航班信息大屏，确定去哪个值机岛，大屏信息最准确。</p>
                    </div>
                  </div>
                  <div className="takeaway-card-item">
                    <span className="takeaway-num">02</span>
                    <div className="takeaway-text">
                      <strong>充电宝随身带，大瓶液体托运</strong>
                      <p>充电宝严禁放进箱子托运；单瓶液体容器超过 100ml 必须办理托运。</p>
                    </div>
                  </div>
                  <div className="takeaway-card-item">
                    <span className="takeaway-num">03</span>
                    <div className="takeaway-text">
                      <strong>身份证放随身包最外层</strong>
                      <p>身份证和手机放在最容易掏出的口袋，从值机、安检到登机全程要用多次。</p>
                    </div>
                  </div>
                  <div className="takeaway-card-item">
                    <span className="takeaway-num">04</span>
                    <div className="takeaway-text">
                      <strong>随时求助穿制服的工作人员</strong>
                      <p>遇到任何拿不准的，直接找穿制服的地勤、安检或志愿者，他们随时提供帮助。</p>
                    </div>
                  </div>
                </div>
                <div className="active-action-row">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => dispatch({ type: 'ADVANCE', phase: 'complete' })}
                  >
                    迈向现实生活 <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* Phase 16: Complete Finale */}
            {state.phase === 'complete' && (
              <div className="cabin-overlay-card is-complete">
                <div className="cabin-badge">✈️ 万米高空 · 16A 舷窗外景 · 旅途圆满</div>
                <p className="eyebrow italic">A SMALL BEGINNING</p>
                <h2 className="cabin-card-title">生活里的许多第一次，也是一样</h2>
                <p className="cabin-complete-lead">
                  你看，坐飞机其实就这四步：查大屏、办值机、过安检、找登机口。
                  无论面对多大多陌生的机场，每次也只需要做好眼前这一件事。
                  <br /><br />
                  舷窗外是万米高空的金色晚霞与晴空，前路坦荡。下一次走向现实中的机场，你已经做好了全部准备。
                </p>
                <div className="complete-btn-row">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={onReset ?? (() => dispatch({ type: 'RESET' }))}
                  >
                    再次体验这次探索 <span>↗</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Realistic Boarding Pass Floating Modal during Baggage phase */}
        {state.phase === 'baggage' && counterStep === 'ticket' && (
          <aside className="boarding-pass-modal" aria-label="登机凭证">
            <div className="boarding-pass-card">
              <div className="bp-header">
                <div>
                  <span className="bp-airline">FIRST STEP AIRLINES</span>
                  <span className="bp-title">BOARDING PASS · 登机牌</span>
                </div>
                <span className="bp-class">经济舱 CLASS Y</span>
              </div>

              <div className="bp-body">
                <div className="bp-row">
                  <div className="bp-field">
                    <small>旅客姓名 NAME</small>
                    <strong>PASSENGER / FIRST STEP</strong>
                  </div>
                  <div className="bp-field">
                    <small>航班 FLIGHT</small>
                    <strong className="is-warm">{departureSchedule.flightNo}</strong>
                  </div>
                  <div className="bp-field">
                    <small>登机口 GATE</small>
                    <strong className="is-warm">GATE 18</strong>
                  </div>
                </div>

                <div className="bp-row">
                  <div className="bp-field">
                    <small>出发地 FROM</small>
                    <strong>北京首都 PEK T3</strong>
                  </div>
                  <div className="bp-field">
                    <small>目的地 TO</small>
                    <strong>上海虹桥 SHA T2</strong>
                  </div>
                  <div className="bp-field">
                    <small>登机时间 BOARDING</small>
                    <strong className="is-warm">09:10</strong>
                  </div>
                </div>

                <div className="bp-row bp-footer-row">
                  <div className="bp-field">
                    <small>座位号 SEAT</small>
                    <strong className="seat-highlight">16A (靠窗)</strong>
                  </div>
                  <div className="bp-field">
                    <small>登机序号 SEQ</small>
                    <strong>042</strong>
                  </div>
                  <div className="bp-field">
                    <small>行李托运 BAGGAGE</small>
                    <strong>{hasCheckedLuggage ? '1 件 (托运中)' : '随身携带 (0 件托运)'}</strong>
                  </div>
                </div>
              </div>

              <div className="bp-barcode-stub">
                <div className="barcode-graphic" />
                <p>三要素：认准登机口 <strong>GATE 18</strong> · 登机时间 <strong>09:10</strong> · 座位 <strong>16A</strong></p>
              </div>
            </div>
          </aside>
        )}
      </main>

      {!isSecurityPhase && (
        <PixelPerson className="companion-badge" gender={state.avatarId} label="这是你" />
      )}

      {tipOpen && tip && (
        <aside className="tip-card">
          <button
            type="button"
            className="close-tip"
            onClick={() => setTipOpen(false)}
            aria-label="关闭提示"
          >
            ×
          </button>
          <p className="eyebrow italic">{tip.en}</p>
          <h2>{tip.title}</h2>
          <p>{tip.body}</p>
          <button
            type="button"
            className="primary-button small"
            onClick={() => setTipOpen(false)}
          >
            知道了，继续 <span>✓</span>
          </button>
        </aside>
      )}
    </>
  );
}
