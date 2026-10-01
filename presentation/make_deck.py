import base64

with open('poster/qrcode.png', 'rb') as f:
    qr_b64 = base64.b64encode(f.read()).decode('utf-8')

html_content = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>第一次 · FIRST STEP | 项目演示</title>
<style>
  :root {{
    --bg: #05080e;
    --card-bg: rgba(13, 20, 32, 0.72);
    --card-border: rgba(214, 222, 238, 0.12);
    --card-hover-border: rgba(255, 186, 120, 0.45);
    --text-primary: #eaf0fb;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --warm-accent: #f5bd87;
    --warm-glow: rgba(255, 186, 120, 0.22);
    --cool-accent: #d6deee;
    --cool-glow: rgba(214, 222, 238, 0.15);
    --font-sans: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  }}

  * {{ box-sizing: border-box; margin: 0; padding: 0; }}

  body {{
    background-color: var(--bg);
    color: var(--text-primary);
    font-family: var(--font-sans);
    height: 100vh;
    overflow: hidden;
    user-select: none;
    -webkit-font-smoothing: antialiased;
  }}

  /* ── Background Grid & Interactive Spotlight ── */
  .bg-canvas {{
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }}

  .grid-pattern {{
    position: fixed;
    inset: 0;
    background-image: 
      linear-gradient(to right, rgba(148, 163, 184, 0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(148, 163, 184, 0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(circle at center, black 40%, transparent 95%);
    pointer-events: none;
    z-index: 1;
  }}

  .spotlight {{
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    background: radial-gradient(
      800px circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh),
      rgba(255, 186, 120, 0.075),
      rgba(15, 23, 42, 0.01) 40%,
      transparent 80%
    );
    transition: opacity 0.4s ease;
  }}

  /* ── Top Navigation Bar ── */
  .top-nav {{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 72px;
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 100;
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }}

  .logo-block {{
    display: flex;
    align-items: center;
    gap: 14px;
    text-decoration: none;
    color: inherit;
  }}

  .logo-dot {{
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--warm-accent);
    box-shadow: 0 0 16px var(--warm-accent);
    animation: breathe 3s ease-in-out infinite;
  }}

  @keyframes breathe {{
    0%, 100% {{ transform: scale(1); opacity: 0.8; }}
    50% {{ transform: scale(1.35); opacity: 1; }}
  }}

  .logo-text {{
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--cool-accent);
  }}

  .logo-tag {{
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(255, 186, 120, 0.1);
    color: var(--warm-accent);
    border: 1px solid rgba(255, 186, 120, 0.25);
    letter-spacing: 0.08em;
    font-family: var(--font-mono);
  }}

  .nav-controls {{
    display: flex;
    align-items: center;
    gap: 18px;
  }}

  .slide-counter {{
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--text-muted);
    letter-spacing: 0.1em;
  }}

  .slide-counter span {{
    color: var(--warm-accent);
    font-weight: 600;
  }}

  .btn-icon {{
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: var(--cool-accent);
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.25s var(--ease-out-expo);
  }}

  .btn-icon:hover {{
    background: rgba(255, 255, 255, 0.12);
    border-color: var(--warm-accent);
    color: #fff;
    transform: scale(1.08);
  }}

  /* ── Bottom Progress Bar ── */
  .bottom-progress {{
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.06);
    z-index: 100;
  }}

  .progress-fill {{
    height: 100%;
    width: 11%;
    background: linear-gradient(90deg, #ffba78, #ffd7a8);
    box-shadow: 0 0 12px var(--warm-accent);
    transition: width 0.6s var(--ease-out-expo);
  }}

  .bottom-dock {{
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 7px 18px;
    background: rgba(10, 16, 26, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    backdrop-filter: blur(16px);
    z-index: 100;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }}

  .dot {{
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: all 0.3s ease;
  }}

  .dot.active {{
    background: var(--warm-accent);
    box-shadow: 0 0 8px var(--warm-accent);
    transform: scale(1.35);
  }}

  .dock-hint {{
    font-size: 11px;
    color: var(--text-muted);
    font-family: var(--font-mono);
    margin-left: 8px;
    letter-spacing: 0.05em;
  }}

  /* ── Slide Viewport & Stage ── */
  .deck-container {{
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }}

  .slide {{
    position: absolute;
    inset: 72px 0 60px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 6vw;
    opacity: 0;
    pointer-events: none;
    transform: scale(0.96) translateY(28px);
    filter: blur(6px);
    transition: 
      opacity 0.7s var(--ease-out-expo),
      transform 0.7s var(--ease-out-expo),
      filter 0.7s var(--ease-out-expo);
  }}

  .slide.active {{
    opacity: 1;
    pointer-events: auto;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }}

  .slide.prev {{
    transform: scale(1.03) translateY(-24px);
    filter: blur(8px);
    opacity: 0;
  }}

  /* ── Typography & Components ── */
  .tagline {{
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--warm-accent);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }}

  .tagline::before {{
    content: "●";
    font-size: 8px;
  }}

  .slide-title {{
    font-size: clamp(32px, 4.4vw, 56px);
    font-weight: 200;
    letter-spacing: -0.015em;
    line-height: 1.18;
    color: #fff;
    margin-bottom: 20px;
    text-align: center;
  }}

  .slide-title strong {{
    font-weight: 500;
    color: var(--cool-accent);
  }}

  .slide-title .glow {{
    background: linear-gradient(135deg, #fff 30%, var(--warm-accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 400;
  }}

  .slide-subtitle {{
    font-size: clamp(15px, 1.4vw, 19px);
    font-weight: 300;
    line-height: 1.68;
    color: var(--text-secondary);
    max-width: 820px;
    text-align: center;
    margin-bottom: 44px;
  }}

  /* ── 3D Magnetic Tilt Cards ── */
  .grid-cards {{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    width: 100%;
    max-width: 1240px;
    perspective: 1200px;
  }}

  .tilt-card {{
    position: relative;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 18px;
    padding: 34px 30px;
    backdrop-filter: blur(20px);
    transition: 
      border-color 0.35s ease,
      box-shadow 0.35s ease,
      transform 0.15s ease-out;
    transform-style: preserve-3d;
    overflow: hidden;
  }}

  .tilt-card::before {{
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      400px circle at var(--card-x, 50%) var(--card-y, 50%),
      rgba(255, 186, 120, 0.12),
      transparent 60%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }}

  .tilt-card:hover {{
    border-color: var(--card-hover-border);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 24px rgba(255, 186, 120, 0.12);
  }}

  .tilt-card:hover::before {{
    opacity: 1;
  }}

  /* HUD Reticle Corners */
  .hud-corners::after {{
    content: "";
    position: absolute;
    top: 8px; right: 8px; bottom: 8px; left: 8px;
    border: 1px dashed rgba(255, 255, 255, 0.07);
    border-radius: 12px;
    pointer-events: none;
  }}

  .card-icon {{
    font-size: 32px;
    margin-bottom: 20px;
    display: inline-block;
  }}

  .card-number {{
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--warm-accent);
    margin-bottom: 12px;
    letter-spacing: 0.12em;
    display: block;
  }}

  .card-title {{
    font-size: 20px;
    font-weight: 500;
    color: #fff;
    margin-bottom: 12px;
    letter-spacing: -0.01em;
  }}

  .card-desc {{
    font-size: 14.5px;
    line-height: 1.7;
    color: var(--text-secondary);
  }}

  /* ── Interactive Pipeline on Slide 3 ── */
  .pipeline-flow {{
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 1100px;
    margin: 10px auto 40px;
  }}

  .pipeline-step {{
    background: rgba(15, 23, 38, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    padding: 18px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 140px;
    transition: all 0.3s var(--ease-out-expo);
    cursor: default;
  }}

  .pipeline-step:hover {{
    border-color: var(--warm-accent);
    background: rgba(255, 186, 120, 0.08);
    transform: translateY(-5px);
    box-shadow: 0 10px 24px rgba(255, 186, 120, 0.15);
  }}

  .pipeline-step .p-num {{
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--warm-accent);
  }}

  .pipeline-step .p-title {{
    font-size: 15px;
    font-weight: 500;
    color: #fff;
  }}

  .pipeline-arrow {{
    color: var(--text-muted);
    font-size: 18px;
    font-weight: 300;
  }}

  /* ── Interactive Demo Preview on Slide 5 ── */
  .demo-box {{
    display: grid;
    grid-template-columns: 1fr 1.35fr;
    gap: 36px;
    max-width: 1160px;
    width: 100%;
    align-items: center;
  }}

  .step-selector {{
    display: flex;
    flex-direction: column;
    gap: 14px;
  }}

  .step-btn {{
    background: rgba(13, 20, 32, 0.65);
    border: 1px solid var(--card-border);
    border-radius: 14px;
    padding: 16px 20px;
    text-align: left;
    cursor: pointer;
    transition: all 0.25s var(--ease-out-expo);
    color: inherit;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }}

  .step-btn:hover, .step-btn.active {{
    background: rgba(255, 186, 120, 0.09);
    border-color: var(--warm-accent);
    transform: translateX(8px);
  }}

  .step-btn.active .step-indicator {{
    background: var(--warm-accent);
    box-shadow: 0 0 10px var(--warm-accent);
  }}

  .step-indicator {{
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
  }}

  .demo-visual {{
    background: #080d15;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    padding: 34px;
    min-height: 380px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }}

  .demo-visual::before {{
    content: "";
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, var(--warm-glow) 0%, transparent 70%);
    pointer-events: none;
  }}

  .visual-badge {{
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--warm-accent);
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }}

  .visual-main {{
    font-size: 26px;
    font-weight: 300;
    color: #fff;
    line-height: 1.4;
    margin: 20px 0;
  }}

  .visual-quote {{
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.035);
    border-left: 2px solid var(--warm-accent);
    border-radius: 0 8px 8px 0;
    font-size: 13.5px;
    color: var(--text-secondary);
    line-height: 1.6;
  }}

  /* ── Architecture Slide 7 ── */
  .tech-pills {{
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
  }}

  .pill {{
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-family: var(--font-mono);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--cool-accent);
    transition: all 0.2s ease;
  }}

  .pill:hover {{
    background: rgba(255, 186, 120, 0.15);
    border-color: var(--warm-accent);
    color: #fff;
    transform: translateY(-2px);
  }}

  /* ── Final QR Slide ── */
  .qr-layout {{
    display: flex;
    align-items: center;
    gap: 56px;
    max-width: 980px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 28px;
    padding: 48px;
    backdrop-filter: blur(24px);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7);
  }}

  .qr-frame {{
    position: relative;
    padding: 16px;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    flex-shrink: 0;
    transition: transform 0.35s var(--ease-out-expo);
  }}

  .qr-frame:hover {{
    transform: scale(1.04) rotate(0.5deg);
  }}

  .qr-frame img {{
    display: block;
    width: 220px;
    height: 220px;
    border-radius: 8px;
  }}

  .qr-info h3 {{
    font-size: 30px;
    font-weight: 400;
    color: #fff;
    margin-bottom: 12px;
    letter-spacing: -0.01em;
  }}

  .qr-info p {{
    font-size: 15px;
    line-height: 1.7;
    color: var(--text-secondary);
    margin-bottom: 24px;
  }}

  .cta-group {{
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }}

  .cta-btn {{
    padding: 12px 24px;
    border-radius: 999px;
    font-size: 13.5px;
    letter-spacing: 0.08em;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.25s var(--ease-out-expo);
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }}

  .cta-primary {{
    background: linear-gradient(135deg, #ffba78, #ffd7a8);
    color: #0b111a;
    border: none;
    box-shadow: 0 4px 20px rgba(255, 186, 120, 0.35);
  }}

  .cta-primary:hover {{
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(255, 186, 120, 0.55);
  }}

  .cta-secondary {{
    background: rgba(255, 255, 255, 0.05);
    color: var(--cool-accent);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }}

  .cta-secondary:hover {{
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
    transform: translateY(-2px);
  }}

  /* ── Keyboard Keys Indicator ── */
  .kbd-hint {{
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
  }}

  kbd {{
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    padding: 2px 6px;
    color: var(--cool-accent);
  }}
</style>
</head>
<body>

<canvas class="bg-canvas" id="stars"></canvas>
<div class="grid-pattern"></div>
<div class="spotlight"></div>

<!-- Top Navigation -->
<nav class="top-nav">
  <a href="#" class="logo-block">
    <div class="logo-dot"></div>
    <span class="logo-text">第一次 · FIRST STEP</span>
    <span class="logo-tag">PITCH DECK</span>
  </a>

  <div class="nav-controls">
    <div class="kbd-hint">按 <kbd>←</kbd> <kbd>→</kbd> 翻页</div>
    <div class="slide-counter"><span id="currSlide">01</span> / 09</div>
    <button class="btn-icon" id="prevBtn" title="上一页 (←)">←</button>
    <button class="btn-icon" id="nextBtn" title="下一页 (→)">→</button>
    <button class="btn-icon" id="fsBtn" title="全屏演示 (F)">⛶</button>
  </div>
</nav>

<!-- Slides Stage -->
<main class="deck-container">

  <!-- SLIDE 1: COVER -->
  <section class="slide active" data-index="1">
    <div class="tagline">AI-ENHANCED SPATIAL SIMULATION</div>
    <h1 class="slide-title">
      所有浩瀚的未知<br>
      <span class="glow">都始于脚下笃定的一步</span>
    </h1>
    <p class="slide-subtitle">
      面向未知体验与公共空间动线焦虑的 3D 沉浸式模拟向导。<br>
      在真实面对前，先在安全的陪伴中走过一遍。
    </p>
    <div class="tech-pills">
      <span class="pill">Google Gemini API</span>
      <span class="pill">React 19</span>
      <span class="pill">Three.js / WebGL</span>
      <span class="pill">Cloudflare Global Edge</span>
    </div>
  </section>

  <!-- SLIDE 2: PAIN POINTS -->
  <section class="slide" data-index="2">
    <div class="tagline">THE HIDDEN ANXIETY</div>
    <h2 class="slide-title">人们不是不勇敢<br><strong>而是不知道第一步具体是什么</strong></h2>
    <p class="slide-subtitle">面对第一次坐飞机、三甲医院就医、甚至第一次公开演讲，陌生动线与复杂规则让很多人本能地退缩。</p>
    
    <div class="grid-cards">
      <div class="tilt-card hud-corners">
        <span class="card-number">01 / PASSIVE TEXT</span>
        <div class="card-title">长篇攻略 · 纸上谈兵</div>
        <p class="card-desc">密密麻麻的文字清单和短视频攻略无法建立真实的空间距离感。一到现场面对庞大的人流与指引，依然恐慌无措。</p>
      </div>

      <div class="tilt-card hud-corners">
        <span class="card-number">02 / CHATBOT TIRED</span>
        <div class="card-title">传统 AI 问答 · 缺乏具身感</div>
        <p class="card-desc">普通对话框需要用户自己精准提问。但用户在未知面前根本不知道该问什么，机械的文字交流无法消除肢体上的紧张感。</p>
      </div>

      <div class="tilt-card hud-corners">
        <span class="card-number">03 / DECISION TRAP</span>
        <div class="card-title">分支选择题 · 反增决策压力</div>
        <p class="card-desc">“如果是你你会怎么做？”普通剧情游戏强制用户选方向，让本就焦虑的用户陷入“选错怎么办、我是否不够勇敢”的新内耗。</p>
      </div>
    </div>
  </section>

  <!-- SLIDE 3: PHILOSOPHY -->
  <section class="slide" data-index="3">
    <div class="tagline">CORE DESIGN PHILOSOPHY</div>
    <h2 class="slide-title">为什么不让用户<strong>一开始做选择？</strong></h2>
    <p class="slide-subtitle">系统负责提供方向、示范和安全感；用户亲自完成每一个小动作，从而切身体会到“原来这是我做到的”。</p>

    <div class="pipeline-flow">
      <div class="pipeline-step">
        <span class="p-num">STEP 1</span>
        <span class="p-title">展示未知</span>
      </div>
      <span class="pipeline-arrow">→</span>
      <div class="pipeline-step">
        <span class="p-num">STEP 2</span>
        <span class="p-title">降低门槛</span>
      </div>
      <span class="pipeline-arrow">→</span>
      <div class="pipeline-step">
        <span class="p-num">STEP 3</span>
        <span class="p-title">示范小动作</span>
      </div>
      <span class="pipeline-arrow">→</span>
      <div class="pipeline-step">
        <span class="p-num">STEP 4</span>
        <span class="p-title">邀请尝试</span>
      </div>
      <span class="pipeline-arrow">→</span>
      <div class="pipeline-step">
        <span class="p-num">STEP 5</span>
        <span class="p-title">环境正反馈</span>
      </div>
      <span class="pipeline-arrow">→</span>
      <div class="pipeline-step">
        <span class="p-num">STEP 6</span>
        <span class="p-title">建立信心</span>
      </div>
    </div>

    <div class="grid-cards" style="max-width: 880px;">
      <div class="tilt-card">
        <div class="card-title">单线陪伴式引导</div>
        <p class="card-desc">不抛出繁杂分支，沿着清晰动线向前。每一步都有视觉光芒与动效在前方陪伴，用户随时知道下一步该看哪里。</p>
      </div>
      <div class="tilt-card">
        <div class="card-title">渐进式辅助剥离</div>
        <p class="card-desc">从最开始的高亮光圈与动作示范，到终点前完全隐去提示光标。用户在不知不觉中，完成了自主探索。</p>
      </div>
    </div>
  </section>

  <!-- SLIDE 4: THREE PRINCIPLES -->
  <section class="slide" data-index="4">
    <div class="tagline">INTERACTION FRAMEWORK</div>
    <h2 class="slide-title">极简克制的<strong>交互三原则</strong></h2>
    <p class="slide-subtitle">彻底抛弃复杂游戏机制，用最干净的体验设计还原真实世界的安全感。</p>

    <div class="grid-cards">
      <div class="tilt-card hud-corners">
        <span class="card-number">PRINCIPLE 01</span>
        <div class="card-title">一次只聚焦一件事<br><span style="font-size:14px;color:var(--text-muted);font-weight:300;">One action at a time</span></div>
        <p class="card-desc">绝不给用户看全流程冗长清单。每个瞬间视野里只有一个清晰可见的微目标：只看信息屏，或者只放随身包。</p>
      </div>

      <div class="tilt-card hud-corners">
        <span class="card-number">PRINCIPLE 02</span>
        <div class="card-title">示范在前提问在后<br><span style="font-size:14px;color:var(--text-muted);font-weight:300;">Show before asking</span></div>
        <p class="card-desc">在邀请用户动手前，先通过摄像机运镜、光圈收束或微动效完整示范一次动作路径，消除动作预期的不确定性。</p>
      </div>

      <div class="tilt-card hud-corners">
        <span class="card-number">PRINCIPLE 03</span>
        <div class="card-title">永不设置失败惩罚<br><span style="font-size:14px;color:var(--text-muted);font-weight:300;">No failure state</span></div>
        <p class="card-desc">点错或停顿不是错误。系统从不打分、扣血或 Game Over；只要用户迟疑超过 7 秒，更清晰的暖光指引便温柔浮现。</p>
      </div>
    </div>
  </section>

  <!-- SLIDE 5: MVP SHOWCASE -->
  <section class="slide" data-index="5">
    <div class="tagline">MVP EXPERIENCE BREAKDOWN</div>
    <h2 class="slide-title">首发场景：<strong>第一次坐飞机</strong></h2>
    <p class="slide-subtitle">2-3 分钟的轻量级 3D 沉浸漫游，亲手走完航站楼核心通关四重奏。</p>

    <div class="demo-box">
      <div class="step-selector">
        <button class="step-btn active" data-step="0">
          <div>
            <div style="font-size:12px;color:var(--warm-accent);font-family:var(--font-mono);">PHASE 01</div>
            <div style="font-size:16px;font-weight:500;">查阅航班屏 · 锁定目标</div>
          </div>
          <div class="step-indicator"></div>
        </button>

        <button class="step-btn" data-step="1">
          <div>
            <div style="font-size:12px;color:var(--warm-accent);font-family:var(--font-mono);">PHASE 02</div>
            <div style="font-size:16px;font-weight:500;">行李称重 · 避坑提醒</div>
          </div>
          <div class="step-indicator"></div>
        </button>

        <button class="step-btn" data-step="2">
          <div>
            <div style="font-size:12px;color:var(--warm-accent);font-family:var(--font-mono);">PHASE 03</div>
            <div style="font-size:16px;font-weight:500;">安检通道 · 物品分拣</div>
          </div>
          <div class="step-indicator"></div>
        </button>

        <button class="step-btn" data-step="3">
          <div>
            <div style="font-size:12px;color:var(--warm-accent);font-family:var(--font-mono);">PHASE 04</div>
            <div style="font-size:16px;font-weight:500;">独立寻路 · 抵达登机口</div>
          </div>
          <div class="step-indicator"></div>
        </button>
      </div>

      <div class="demo-visual">
        <div>
          <div class="visual-badge" id="demoBadge">FIRST FLIGHT · SIMULATION STAGE 01</div>
          <div class="visual-main" id="demoTitle">看向上方大屏，在海量滚动的航班代码中，亲手点击找到 FS001。</div>
        </div>
        <div class="visual-quote" id="demoQuote">
          “先看大屏再找登机口。登机口可能会临时变动，只要看懂航班号，航站楼就再也不会迷路。”
        </div>
      </div>
    </div>
  </section>

  <!-- SLIDE 6: AI AGENT -->
  <section class="slide" data-index="6">
    <div class="tagline">BACKGROUND INTELLIGENCE</div>
    <h2 class="slide-title">AI 行为观察者：<strong>隐身幕后的专属复盘</strong></h2>
    <p class="slide-subtitle">没有悬浮聊天窗打扰体验。基于 Google Gemini 3.8 Flash，安静记录你的真实行为事实。</p>

    <div class="grid-cards">
      <div class="tilt-card">
        <span class="card-number">DATA SENSING</span>
        <div class="card-title">细微行为捕获</div>
        <p class="card-desc">
          • 首次主动操作时延（迟疑秒数）<br>
          • 航班大屏查阅次数<br>
          • 安检物品放入习惯<br>
          • 是否依赖额外指引与自主寻路用时
        </p>
      </div>

      <div class="tilt-card" style="border-color: rgba(255,186,120,0.35);">
        <span class="card-number">GEMINI REASONING</span>
        <div class="card-title">克制有温度的复盘</div>
        <p class="card-desc" style="font-style: italic; color: #fff;">
          “你在出发前停了一会儿，9 秒后才动了第一步。你没有等所有不确定都消失，就先走出去了。<br><br>
          你不需要一次知道所有事情，才有资格走向下一步。”
        </p>
      </div>

      <div class="tilt-card">
        <span class="card-number">STRICT SAFETY</span>
        <div class="card-title">严格提示词准则</div>
        <p class="card-desc">
          不做空洞赞美，不做心理诊断；不捏造虚假航司规则；像一个安静的朋友，具体、客观地复述刚看到的事实。
        </p>
      </div>
    </div>
  </section>

  <!-- SLIDE 7: TECH ARCHITECTURE -->
  <section class="slide" data-index="7">
    <div class="tagline">FULL-STACK MODERN ARCHITECTURE</div>
    <h2 class="slide-title">全栈现代架构：<strong>轻巧、极速、无断点</strong></h2>
    <p class="slide-subtitle">纯前端 Web 3D 沉浸交互，结合边缘计算与全球 CDN 秒开分发。</p>

    <div class="grid-cards">
      <div class="tilt-card">
        <div class="card-number">FRONTEND 3D</div>
        <div class="card-title">具身空间渲染引擎</div>
        <p class="card-desc">React 19 + TypeScript + Vite + Three.js (@react-three/fiber)。3D 航站楼模型、高反射水磨石地面与像素伴侣角色流畅运行于各端浏览器。</p>
        <div class="tech-pills">
          <span class="pill">React 19</span>
          <span class="pill">Three.js</span>
          <span class="pill">Drei</span>
          <span class="pill">Web Audio</span>
        </div>
      </div>

      <div class="tilt-card">
        <div class="card-number">AI & BACKEND</div>
        <div class="card-title">Gemini 3.8 边缘智能</div>
        <p class="card-desc">Cloudflare Pages Functions 边缘函数代理 Google Gemini API，密钥安全隔离，搭配 8s 超时熔断与本地离线优雅降级机制。</p>
        <div class="tech-pills">
          <span class="pill">Gemini 3.8 Flash</span>
          <span class="pill">Cloudflare Functions</span>
          <span class="pill">JSON Schema</span>
        </div>
      </div>

      <div class="tilt-card">
        <div class="card-number">DEPLOYMENT</div>
        <div class="card-title">全球秒开边缘网络</div>
        <p class="card-desc">完全托管部署于 Cloudflare Pages 全球 Anycast CDN。无传统服务器运维负担，百毫秒级极速首屏加载，随时随地打开即体验。</p>
        <div class="tech-pills">
          <span class="pill">Cloudflare Pages</span>
          <span class="pill">Wrangler CLI</span>
          <span class="pill">GitHub CI</span>
        </div>
      </div>
    </div>
  </section>

  <!-- SLIDE 8: FUTURE ROADMAP -->
  <section class="slide" data-index="8">
    <div class="tagline">EXPANDING HORIZONS</div>
    <h2 class="slide-title">空间解忧宇宙：<strong>未来的场景矩阵</strong></h2>
    <p class="slide-subtitle">凡未至之处，皆有迹可循。把所有令人焦虑的未知公共经历，逐一拆解为温柔的第一步。</p>

    <div class="grid-cards">
      <div class="tilt-card">
        <span class="card-icon">🏥</span>
        <div class="card-title">第一次三甲医院就医</div>
        <p class="card-desc">建卡、分诊、叫号候诊、抽血化验、自助机取药。在无压环境里理清复杂的医院动线与医患交流流程。</p>
      </div>

      <div class="tilt-card">
        <span class="card-icon">☕</span>
        <div class="card-title">第一次独立咖啡馆点单</div>
        <p class="card-desc">从杯型容量、冷萃热萃，到奶泡浓度与糖浆配方。告别柜台前面对菜单和店员询问时的手足无措。</p>
      </div>

      <div class="tilt-card">
        <span class="card-icon">🎤</span>
        <div class="card-title">第一次百人公开表达</div>
        <p class="card-desc">走上聚光灯讲台，感受台下投来的数十道目光。练习深呼吸破冰、翻页激光笔操作与面对沉默时的心理定力。</p>
      </div>

      <div class="tilt-card">
        <span class="card-icon">💼</span>
        <div class="card-title">第一次重要商务答辩</div>
        <p class="card-desc">大厦访客门禁登记、乘高层电梯、会议室握手与落座礼仪。先在模拟中走一遍，现实里更自如从容。</p>
      </div>
    </div>
  </section>

  <!-- SLIDE 9: CTA & QR -->
  <section class="slide" data-index="9">
    <div class="qr-layout">
      <div class="qr-frame">
        <img src="data:image/png;base64,{qr_b64}" alt="扫码在线体验 First Step">
      </div>
      <div class="qr-info">
        <div class="tagline">READY TO STEP OUT</div>
        <h3>现在，亲自迈出第一步</h3>
        <p>
          手机相机或微信直接扫码，即可在移动端或电脑端直接开启 3D 沉浸模拟。<br>
          体验 Google Gemini 行为复盘与航站楼无压空间指引。
        </p>
        <div class="cta-group">
          <a href="https://the-first-step-7wo.pages.dev/" target="_blank" class="cta-btn cta-primary">
            立即在浏览器中打开 ↗
          </a>
          <a href="https://github.com/lFlower8113/FirstStep1" target="_blank" class="cta-btn cta-secondary">
            GitHub 开源仓库
          </a>
        </div>
      </div>
    </div>
  </section>

</main>

<!-- Bottom Dock Control -->
<div class="bottom-dock">
  <div class="dot active" data-slide="1"></div>
  <div class="dot" data-slide="2"></div>
  <div class="dot" data-slide="3"></div>
  <div class="dot" data-slide="4"></div>
  <div class="dot" data-slide="5"></div>
  <div class="dot" data-slide="6"></div>
  <div class="dot" data-slide="7"></div>
  <div class="dot" data-slide="8"></div>
  <div class="dot" data-slide="9"></div>
  <div class="dock-hint">FIRST STEP DECK</div>
</div>

<div class="bottom-progress">
  <div class="progress-fill" id="progressFill"></div>
</div>

<script>
  /* ── Interactive Stars Canvas Background ── */
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resizeCanvas() {{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 8000);
    for (let i = 0; i < count; i++) {{
      stars.push({{
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.2 + 0.05
      }});
    }}
  }}
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function animateStars() {{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(214, 222, 238, 0.8)';
    for (const s of stars) {{
      s.y -= s.speed;
      if (s.y < 0) s.y = canvas.height;
      ctx.globalAlpha = s.alpha * (0.6 + 0.4 * Math.sin(Date.now() * 0.002 + s.x));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }}
    requestAnimationFrame(animateStars);
  }}
  animateStars();

  /* ── Mouse Spotlight & 3D Tilt FX ── */
  window.addEventListener('mousemove', (e) => {{
    document.documentElement.style.setProperty('--mouse-x', `${{e.clientX}}px`);
    document.documentElement.style.setProperty('--mouse-y', `${{e.clientY}}px`);

    // 3D Card Tilt
    document.querySelectorAll('.tilt-card').forEach(card => {{
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--card-x', `${{x}}px`);
      card.style.setProperty('--card-y', `${{y}}px`);

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {{
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * -6.5;
        const rotY = ((x - cx) / cx) * 6.5;
        card.style.transform = `perspective(1000px) rotateX(${{rotX.toFixed(2)}}deg) rotateY(${{rotY.toFixed(2)}}deg) translateY(-4px)`;
      }} else {{
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      }}
    }});
  }});

  /* ── Presentation Slide Controller ── */
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const currSlideEl = document.getElementById('currSlide');
  const progressFill = document.getElementById('progressFill');
  const totalSlides = slides.length;
  let currentIndex = 0;

  function showSlide(index) {{
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;

    slides.forEach((s, idx) => {{
      s.classList.remove('active', 'prev');
      if (idx === index) {{
        s.classList.add('active');
      }} else if (idx < index) {{
        s.classList.add('prev');
      }}
    }});

    dots.forEach((dot, idx) => {{
      dot.classList.toggle('active', idx === index);
    }});

    currentIndex = index;
    currSlideEl.textContent = String(currentIndex + 1).padStart(2, '0');
    progressFill.style.width = `${{((currentIndex + 1) / totalSlides) * 100}}%`;
  }}

  function nextSlide() {{ showSlide(currentIndex + 1); }}
  function prevSlide() {{ showSlide(currentIndex - 1); }}

  document.getElementById('nextBtn').addEventListener('click', nextSlide);
  document.getElementById('prevBtn').addEventListener('click', prevSlide);

  dots.forEach(dot => {{
    dot.addEventListener('click', () => {{
      showSlide(parseInt(dot.dataset.slide, 10) - 1);
    }});
  }});

  window.addEventListener('keydown', (e) => {{
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {{
      e.preventDefault();
      nextSlide();
    }} else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {{
      e.preventDefault();
      prevSlide();
    }} else if (e.key === 'Home') {{
      showSlide(0);
    }} else if (e.key === 'End') {{
      showSlide(totalSlides - 1);
    }} else if (e.key === 'f' || e.key === 'F') {{
      toggleFullScreen();
    }}
  }});

  // Wheel slide navigation with throttling
  let lastWheel = 0;
  window.addEventListener('wheel', (e) => {{
    const now = Date.now();
    if (now - lastWheel < 600) return;
    if (Math.abs(e.deltaY) > 35) {{
      lastWheel = now;
      if (e.deltaY > 0) nextSlide();
      else prevSlide();
    }}
  }}, {{ passive: true }});

  // Touch Swipe for mobile/trackpad
  let touchStartX = 0;
  window.addEventListener('touchstart', e => {{ touchStartX = e.changedTouches[0].screenX; }}, false);
  window.addEventListener('touchend', e => {{
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 50) {{
      if (diff < 0) nextSlide();
      else prevSlide();
    }}
  }}, false);

  function toggleFullScreen() {{
    if (!document.fullscreenElement) {{
      document.documentElement.requestFullscreen().catch(() => {{}});
    }} else {{
      if (document.exitFullscreen) document.exitFullscreen();
    }}
  }}
  document.getElementById('fsBtn').addEventListener('click', toggleFullScreen);

  /* ── Interactive Demo Preview (Slide 5) ── */
  const demoData = [
    {{
      badge: "FIRST FLIGHT · SIMULATION STAGE 01",
      title: "看向上方大屏，在海量滚动的航班代码中，亲手点击找到 FS001。",
      quote: "“先看大屏再找登机口。登机口可能会临时变动，只要看懂航班号，航站楼就再也不会迷路。”"
    }},
    {{
      badge: "FIRST FLIGHT · SIMULATION STAGE 02",
      title: "行至值机岛进行行李称重，了解随身与托运额度的计费原则。",
      quote: "“出发前先确认票价是否含免费托运。随身手提行李一般限重 5-7kg，先确认再托运，少花冤枉钱。”"
    }},
    {{
      badge: "FIRST FLIGHT · SIMULATION STAGE 03",
      title: "穿过金属探测安检门，把手机与随身包逐一分拣进塑料托盘。",
      quote: "“把笔记本电脑、充电宝、雨伞放在最外层容易拿取的位置。安检人员只是一道安全守护，无需慌张。”"
    }},
    {{
      badge: "FIRST FLIGHT · SIMULATION STAGE 04",
      title: "辅助光标逐渐褪去，完全凭借自己的认知，自信走向 18 号登机口。",
      quote: "“你没有等所有不确定都彻底消失才动身，你已经完成了走向现实世界的第一步。”"
    }}
  ];

  const stepBtns = document.querySelectorAll('.step-btn');
  const demoBadge = document.getElementById('demoBadge');
  const demoTitle = document.getElementById('demoTitle');
  const demoQuote = document.getElementById('demoQuote');

  stepBtns.forEach(btn => {{
    btn.addEventListener('click', () => {{
      stepBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const idx = parseInt(btn.dataset.step, 10);
      const data = demoData[idx];

      demoBadge.textContent = data.badge;
      demoTitle.textContent = data.title;
      demoQuote.textContent = data.quote;
    }});
  }});
</script>
</body>
</html>
'''

with open('presentation/index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Created presentation/index.html successfully!")
