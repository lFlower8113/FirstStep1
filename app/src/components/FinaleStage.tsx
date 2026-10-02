import { PixelAirplane } from './PixelAirplane';
import { PixelPerson } from './PixelPerson';
import type { Action, AppState } from '../types';
import type { Reflection } from '../reflection';

type FinaleStageProps = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  reflection: Reflection | null;
  reflectionLoading: boolean;
  onReflect: () => void;
  onReset: () => void;
};

export function FinaleStage({
  state,
  dispatch,
  reflection,
  reflectionLoading,
  onReflect,
  onReset,
}: FinaleStageProps) {
  return (
    <div className="finale-stage-container">
      <header className="topbar">
        <span>FIRST STEP</span>
        <span className="topbar-right">01 / 第一次坐飞机 · 终章启航</span>
      </header>

      <p className="handwritten-note">Every journey begins with one step.</p>

      <main className="finale-main-content">
        {/* Centerpiece: Pixel Person and Pixel Airplane floating in starry sky */}
        <div className="finale-centerpiece">
          <div className="finale-sprites-cluster">
            <div className="finale-airplane-wrapper">
              <PixelAirplane scale={3.4} />
            </div>
            <div className="finale-person-wrapper">
              <PixelPerson gender={state.avatarId} scale={3.2} label="你" />
            </div>
          </div>
          <div className="flight-status-pill">
            <span className="pill-flight">✈️ FS001 航班</span>
            <span className="pill-dot">·</span>
            <span className="pill-status">正在平稳巡航中</span>
            <span className="pill-dot">·</span>
            <span className="pill-seat">16A 靠窗</span>
          </div>
        </div>

        {/* Narrative & Reflection Card beneath the centerpiece */}
        <div className="finale-card-wrapper">
          {/* Phase 1: Arrive / Onboard */}
          {state.phase === 'arrive' && (
            <div key="arrive" className="finale-narrative-card phase-transition-card">
              <span className="finale-card-eyebrow">WELCOME ABOARD · 顺利启航</span>
              <h1 className="finale-card-title">你已经顺利坐上了飞机</h1>
              <p className="finale-card-text">
                放好随身背包，系紧安全带。听着发动机平稳安宁的声音，看着漫天星光。<br />
                从在家里收拾行囊、查航班大屏、办值机托运、过安检到走过廊桥登机，你亲手一步步完成了所有流程。
              </p>
              <div className="finale-card-actions">
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

          {/* Phase 2: Reflection */}
          {state.phase === 'reflection' && (
            <div key="reflection" className="finale-narrative-card is-reflection phase-transition-card">
              <div className="reflection-card-header">
                <span className="finale-card-eyebrow">A NOTE FROM YOUR JOURNEY · 旅程沉淀</span>
                <span className="source-chip">{reflection?.source === 'ai' ? 'AI 寄语' : 'FIRST STEP 寄语'}</span>
              </div>

              {reflectionLoading ? (
                <div className="finale-loading-box">
                  <span className="loading-dot" />
                  <span>正在静静为你整理这次飞行的独家沉淀与鼓励…</span>
                </div>
              ) : (
                <>
                  <h2 className="finale-reflection-observation">
                    {reflection?.observation ?? '面对未知的大厅，你一步步稳稳做好了眼前的事。'}
                  </h2>
                  <p className="finale-reflection-meaning">
                    {reflection?.meaning ?? '坐飞机其实真的没有那么复杂，生活里的许多未知也是一样：收拾好行囊，带齐证件，每次只做好眼前这一步。'}
                  </p>
                  <p className="finale-reflection-closing">
                    {reflection?.closingLine ?? '你看，坐飞机原来这么简单。在现实中，你也完全可以迈出这一步。'}
                  </p>
                  <div className="finale-card-actions">
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

          {/* Phase 3: Takeaways */}
          {state.phase === 'takeaways' && (
            <div key="takeaways" className="finale-narrative-card is-takeaways phase-transition-card">
              <span className="finale-card-eyebrow">FOUR TIMELESS RULES · 飞行常识</span>
              <h2 className="finale-card-title">四个最受用的飞行常识，去哪个机场都管用</h2>

              <div className="finale-takeaways-list">
                <div className="finale-takeaway-item">
                  <span className="takeaway-badge">01</span>
                  <div className="takeaway-content">
                    <strong>先看航班大屏，不盲目问路</strong>
                    <p>进入航站楼先抬头找航班信息大屏，核对去哪个值机岛，大屏信息最准确。</p>
                  </div>
                </div>

                <div className="finale-takeaway-item">
                  <span className="takeaway-badge">02</span>
                  <div className="takeaway-content">
                    <strong>充电宝随身带，大瓶液体托运</strong>
                    <p>充电宝严禁放进箱子托运；单瓶液体容器容积超过 100ml 必须办理托运。</p>
                  </div>
                </div>

                <div className="finale-takeaway-item">
                  <span className="takeaway-badge">03</span>
                  <div className="takeaway-content">
                    <strong>身份证放随身包最外层</strong>
                    <p>身份证和手机放在最容易掏出的口袋，从值机、安检到登机全程要多次出示。</p>
                  </div>
                </div>

                <div className="finale-takeaway-item">
                  <span className="takeaway-badge">04</span>
                  <div className="takeaway-content">
                    <strong>随时求助穿制服的工作人员</strong>
                    <p>遇到任何拿不准的，直接找穿制服的地勤、安检或志愿者，他们随时提供帮助。</p>
                  </div>
                </div>
              </div>

              <div className="finale-card-actions">
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

          {/* Phase 4: Complete Finale */}
          {state.phase === 'complete' && (
            <div key="complete" className="finale-narrative-card is-complete phase-transition-card">
              <span className="finale-card-eyebrow">A SMALL BEGINNING · 迈向现实</span>
              <h2 className="finale-card-title">生活里的许多第一次，也是一样</h2>
              <p className="finale-complete-lead">
                你看，坐飞机其实就这四步：查大屏、办值机、过安检、找登机口。<br />
                无论面对多大多陌生的机场，每次也只需要做好眼前这一件事。<br />
                在头顶这片浩瀚的星空下，前路坦荡。下一次走向现实中的机场，你已经做好了全部准备。
              </p>
              <div className="finale-card-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={onReset}
                >
                  再次探索这次旅程 <span>↗</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
