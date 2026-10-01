# 第一次 · FIRST STEP

> **AI 增强沉浸式互动模拟体验**  
> *不是让用户在未知中独自做出选择，而是让用户在陪伴和示范中，逐渐发现自己已经能够行动。*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-the--first--step.pages.dev-blue?style=for-the-badge&logo=cloudflare)](https://the-first-step-7wo.pages.dev)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r180-black?style=for-the-badge&logo=threedotjs)](https://threejs.org/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-3.8%20Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare)](https://pages.cloudflare.com/)

---

## 🌟 核心理念与解决的问题

很多时候，人们面对陌生经历（例如：第一次坐飞机、第一次去医院就诊、第一次公开演讲）时并不是不勇敢，而是面对陌生的空间和繁杂流程会本能地产生焦虑与心理压力。

**FIRST STEP** 不做一个让人疲惫的问答 Chatbot，也不做让用户陷入选择压力的分支游戏。它通过 **“Explore → Guided → Reflect”** 的单线引导体验，把庞杂未知的公共经历拆解为轻巧、可跟随、无压力的微小动作：

```text
展示未知 ──▶ 降低门槛 ──▶ 示范小动作 ──▶ 邀请尝试 ──▶ 环境反馈 ──▶ 建立信心
```

- **One action at a time**：不一次性丢出庞大清单，一次只专注当前一步。
- **Show before asking**：在要求互动前，先用微光、镜头移动与动效进行示范。
- **No failure state**：不设失败机制或打分惩罚，停顿时自动给予指引。
- **AI Stays Behind**：AI 作为安静的**行为观察者**退居幕后，在旅途结束时，基于用户的实际操作数据生成克制、有温度的专属行为复盘。

---

## 📂 项目结构

```text
FirstStep1/
├── app/                        # 核心 Web 应用
│   ├── api/                    # 本地开发与通用 Serverless API 路由
│   ├── functions/api/          # Cloudflare Pages Functions (Gemini 行为观察服务)
│   ├── src/
│   │   ├── components/         # 场景与界面组件 (引导浮层、星空背景、角色等)
│   │   ├── experience/         # 3D 场景与交互渲染 (Three.js / R3F / 声音系统)
│   │   ├── data/               # 机场航站楼场景动线、像素素材与文案数据
│   │   ├── state/              # 体验状态机与 Reducer
│   │   └── reflection.ts       # AI 行为复盘与离线兜底逻辑
│   ├── package.json
│   └── vite.config.ts
├── poster/                     # 4K 极简风视觉海报生成器 (Canvas 动态艺术渲染)
├── FIRST-STEP-MVP-产品方案.md   # 完整产品方案、交互哲学与场景规格白皮书
├── FIRST-STEP-DEMO-SCRIPT.md   # 现场演示逐字脚本与流程规范
└── README.md
```

---

## 🛠️ 技术栈

- **前端交互**：React 19 + TypeScript + Vite
- **3D 沉浸场景**：Three.js + `@react-three/fiber` + `@react-three/drei`
- **AI 行为观察**：Google Gemini API (`gemini-3.8-flash-high`)
- **部署与边缘函数**：Cloudflare Pages + Pages Functions / Wrangler

---

## 🚀 本地开发与体验

### 1. 克隆代码
```bash
git clone git@github.com:lFlower8113/FirstStep1.git
cd FirstStep1/app
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
在 `app` 目录下创建 `.env` 文件：
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash-high
```
*(注：即使未配置 API Key，前端也会启动本地克制复盘作为降级容灾方案，保证体验平滑)*

### 4. 启动开发服务器
```bash
npm run dev
```
打开浏览器访问 [http://localhost:5173](http://localhost:5173)。

---

## 🌐 部署指南 (Cloudflare Pages)

本项目支持两种方式部署至 Cloudflare Pages：

### 方式 A：通过 Wrangler CLI 命令行部署
在 `app` 目录下执行：
```bash
npm run build
npx wrangler pages deploy dist --project-name the-first-step
```

### 方式 B：连接 GitHub 自动构建
1. 在 Cloudflare Dashboard 中新建 Pages 项目，选择连接 GitHub 仓库 `lFlower8113/FirstStep1`。
2. 配置构建参数：
   - **Root directory (根目录)**: `app`
   - **Build command (构建命令)**: `npm run build`
   - **Build output directory (输出目录)**: `dist`
3. 在 Settings → Environment variables 中添加 `GEMINI_API_KEY` 变量。

---

## 📄 演示与白皮书文档

- [FIRST-STEP-MVP-产品方案.md](./FIRST-STEP-MVP-产品方案.md)：详细阐述了单线引导原则、多重陌生场景库规划（医院就医、公开演讲、商务洽谈等）与价值定位。
- [FIRST-STEP-DEMO-SCRIPT.md](./FIRST-STEP-DEMO-SCRIPT.md)：黑客松现场评委演示与走查脚本。
