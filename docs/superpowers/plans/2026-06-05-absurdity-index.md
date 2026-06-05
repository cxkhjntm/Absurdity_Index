# Absurdity Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cyberpunk-style personal absurdity event tracking system that gamifies workplace absurdity with points, achievements, levels, trend charts, and AI-generated content.

**Architecture:** Single-page application with vanilla HTML/CSS/JS, using localStorage for persistence, Chart.js for visualization, html2canvas for export, and OpenAI-compatible API for AI features.

**Tech Stack:** HTML5, Vanilla CSS (with CSS variables), Vanilla JavaScript (ES6+), localStorage, Chart.js (CDN), html2canvas (CDN), OpenAI API.

---

## File Structure

```
荒谬指数/
├── index.html          # 主 HTML 文件（已存在）
├── css/
│   ├── index.css       # 设计系统：CSS 变量、reset、基础排版
│   ├── layout.css      # 侧边栏、页面容器、网格布局
│   ├── components.css  # 通用组件：卡片、按钮、输入框、模态框、进度条
│   ├── dashboard.css   # 仪表盘模块专用样式
│   ├── record.css      # 记录事件模块专用样式
│   ├── achievements.css # 成就殿堂模块专用样式
│   ├── report.css      # 周报模块专用样式
│   ├── settings.css    # 控制台/设置模块专用样式
│   └── animations.css  # 霓虹发光、故障风(Glitch)、扫描线、呼吸灯动画
├── js/
│   ├── utils.js        # 工具函数（UUID、日期等）
│   ├── store.js        # 数据层：localStorage 读写、数据模型
│   ├── ai.js           # AI 服务层：API 调用、Prompt 构建、降级处理
│   ├── charts.js       # Chart.js 封装（配置、主题）
│   ├── dashboard.js    # 仪表盘模块逻辑
│   ├── record.js       # 事件记录模块逻辑
│   ├── achievements.js # 成就模块逻辑
│   ├── report.js       # 周报生成与导出逻辑
│   ├── settings.js     # 设置模块逻辑
│   └── app.js          # 应用入口，路由/导航管理
└── assets/
    └── favicon.svg     # 站点图标
```

---

## Task 1: CSS Design System (index.css)

**Files:**
- Create: `css/index.css`

- [ ] **Step 1: Create CSS variables**

```css
:root {
  /* Color Palette */
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-card: #1a1a2e;
  --accent-green: #39FF14;
  --accent-purple: #BF40BF;
  --accent-blue: #00D4FF;
  --accent-gold: #FFD700;
  --text-primary: #e0e0e0;
  --text-secondary: #888888;
  
  /* Event Level Colors */
  --level-basic: var(--accent-green);
  --level-combo: var(--accent-blue);
  --level-rare: var(--accent-purple);
  --level-epic: var(--accent-gold);
  
  /* Typography */
  --font-display: 'Orbitron', sans-serif;
  --font-body: 'Noto Sans SC', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}
```

- [ ] **Step 2: Add CSS reset**

```css
/* CSS Reset */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-body);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 100vh;
}

a {
  color: inherit;
  text-decoration: none;
}

ul,
ol {
  list-style: none;
}

img {
  max-width: 100%;
  height: auto;
}

button {
  font: inherit;
  cursor: pointer;
  border: none;
  background: none;
}

input,
textarea,
select {
  font: inherit;
  border: none;
  background: none;
  outline: none;
}
```

- [ ] **Step 3: Add base typography**

```css
/* Base Typography */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-display);
  font-weight: 700;
  line-height: 1.2;
}

h1 {
  font-size: 2.5rem;
}

h2 {
  font-size: 2rem;
}

h3 {
  font-size: 1.5rem;
}

h4 {
  font-size: 1.25rem;
}

p {
  margin-bottom: var(--space-md);
}

code,
pre {
  font-family: var(--font-mono);
}

.text-secondary {
  color: var(--text-secondary);
}

.neon-glow {
  text-shadow: 
    0 0 5px var(--accent-green),
    0 0 10px var(--accent-green),
    0 0 20px var(--accent-green),
    0 0 40px var(--accent-green);
}

.hidden {
  display: none !important;
}
```

- [ ] **Step 4: Verify file creation**

Run: `ls css/`
Expected: `index.css` exists

- [ ] **Step 5: Commit**

```bash
git add css/index.css
git commit -m "feat: add CSS design system with variables and reset"
```

---

## Task 2: Layout Styles (layout.css)

**Files:**
- Create: `css/layout.css`

- [ ] **Step 1: Create app container layout**

```css
/* App Container */
.app-container {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  background-color: var(--bg-secondary);
  border-right: 1px solid rgba(57, 255, 20, 0.1);
  display: flex;
  flex-direction: column;
  padding: var(--space-lg);
  position: fixed;
  width: 260px;
  height: 100vh;
  overflow-y: auto;
}

.sidebar__brand {
  margin-bottom: var(--space-2xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid rgba(57, 255, 20, 0.1);
}

.sidebar__logo {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--accent-green);
  line-height: 1.2;
  margin-bottom: var(--space-xs);
}

.sidebar__subtitle {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}

.sidebar__nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  position: relative;
}

.sidebar__link:hover {
  background-color: rgba(57, 255, 20, 0.05);
}

.sidebar__link.active {
  background-color: rgba(57, 255, 20, 0.1);
  border-left: 3px solid var(--accent-green);
}

.sidebar__link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: var(--accent-green);
  box-shadow: 0 0 10px var(--accent-green);
}

.sidebar__icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.sidebar__label {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.sidebar__label-cn {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: block;
}

.sidebar__footer {
  margin-top: auto;
  padding-top: var(--space-lg);
  border-top: 1px solid rgba(57, 255, 20, 0.1);
}

.sidebar__version {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Main Content */
.main-content {
  background-color: var(--bg-primary);
  padding: var(--space-xl);
  margin-left: 260px;
  min-height: 100vh;
}

/* Top Bar */
.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid rgba(57, 255, 20, 0.1);
}

/* Page Sections */
.page {
  display: none;
}

.page--active {
  display: block;
}

.page__header {
  margin-bottom: var(--space-2xl);
}

.page__title {
  font-size: 2rem;
  color: var(--accent-green);
  margin-bottom: var(--space-xs);
}

.page__subtitle {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-xl);
}

.dashboard__total-score {
  grid-column: span 2;
}

/* Section Titles */
.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  font-size: 1.25rem;
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid rgba(57, 255, 20, 0.1);
}

.section-icon {
  font-size: 1.5rem;
}
```

- [ ] **Step 2: Add responsive styles**

```css
/* Responsive Styles */
@media (max-width: 1024px) {
  .app-container {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: relative;
    width: 100%;
    height: auto;
    padding: var(--space-md);
  }
  
  .sidebar__nav {
    flex-direction: row;
    overflow-x: auto;
    gap: var(--space-sm);
  }
  
  .sidebar__link {
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-sm);
    min-width: 80px;
    text-align: center;
  }
  
  .sidebar__label,
  .sidebar__label-cn {
    font-size: 0.75rem;
  }
  
  .main-content {
    margin-left: 0;
    padding: var(--space-md);
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard__total-score {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .sidebar__brand {
    display: none;
  }
  
  .sidebar__footer {
    display: none;
  }
  
  .page__title {
    font-size: 1.5rem;
  }
}
```

- [ ] **Step 3: Verify file creation**

Run: `ls css/`
Expected: `index.css` and `layout.css` exist

- [ ] **Step 4: Commit**

```bash
git add css/layout.css
git commit -m "feat: add layout styles for sidebar and main content"
```

---

## Task 3: Component Styles (components.css)

**Files:**
- Create: `css/components.css`

- [ ] **Step 1: Create card component**

```css
/* Card Component */
.card {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  border: 1px solid rgba(57, 255, 20, 0.1);
  transition: all var(--transition-normal);
}

.card:hover {
  border-color: rgba(57, 255, 20, 0.3);
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.1);
}

.card--highlight {
  border-color: var(--accent-green);
  box-shadow: 0 0 30px rgba(57, 255, 20, 0.2);
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid rgba(57, 255, 20, 0.1);
}

.card__label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.card__body {
  /* Card body content */
}
```

- [ ] **Step 2: Create button components**

```css
/* Button Components */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all var(--transition-fast);
  cursor: pointer;
  border: 1px solid transparent;
}

.btn--primary {
  background-color: var(--accent-green);
  color: var(--bg-primary);
  border-color: var(--accent-green);
}

.btn--primary:hover {
  background-color: transparent;
  color: var(--accent-green);
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.3);
}

.btn--accent {
  background-color: transparent;
  color: var(--accent-blue);
  border-color: var(--accent-blue);
}

.btn--accent:hover {
  background-color: var(--accent-blue);
  color: var(--bg-primary);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}

.btn--ghost {
  background-color: transparent;
  color: var(--text-secondary);
  border-color: var(--text-secondary);
}

.btn--ghost:hover {
  color: var(--text-primary);
  border-color: var(--text-primary);
}

.btn--danger {
  background-color: transparent;
  color: #ff4444;
  border-color: #ff4444;
}

.btn--danger:hover {
  background-color: #ff4444;
  color: var(--bg-primary);
  box-shadow: 0 0 20px rgba(255, 68, 68, 0.3);
}

.btn--sm {
  padding: var(--space-sm) var(--space-md);
  font-size: 0.75rem;
}

.btn--glow {
  animation: pulse-glow 2s infinite;
}

.btn__icon {
  font-size: 1.25rem;
}

.btn__text {
  /* Button text */
}
```

- [ ] **Step 3: Create input components**

```css
/* Input Components */
.input-text,
.input-textarea,
.input-select {
  width: 100%;
  padding: var(--space-md);
  background-color: var(--bg-secondary);
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-body);
  transition: all var(--transition-fast);
}

.input-text:focus,
.input-textarea:focus,
.input-select:focus {
  border-color: var(--accent-green);
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.2);
  outline: none;
}

.input-textarea {
  min-height: 100px;
  resize: vertical;
}

.input-textarea--code {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.5;
}

.input-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2339FF14' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right var(--space-md) center;
  background-size: 1rem;
  padding-right: var(--space-2xl);
}

.form-group {
  margin-bottom: var(--space-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--space-sm);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}
```

- [ ] **Step 4: Create badge component**

```css
/* Badge Component */
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge--basic {
  background-color: rgba(57, 255, 20, 0.2);
  color: var(--accent-green);
  border: 1px solid var(--accent-green);
}

.badge--combo {
  background-color: rgba(0, 212, 255, 0.2);
  color: var(--accent-blue);
  border: 1px solid var(--accent-blue);
}

.badge--rare {
  background-color: rgba(191, 64, 191, 0.2);
  color: var(--accent-purple);
  border: 1px solid var(--accent-purple);
}

.badge--epic {
  background-color: rgba(255, 215, 0, 0.2);
  color: var(--accent-gold);
  border: 1px solid var(--accent-gold);
}

.badge--stage {
  background-color: rgba(57, 255, 20, 0.1);
  color: var(--accent-green);
  border: 1px solid rgba(57, 255, 20, 0.3);
}
```

- [ ] **Step 5: Create progress bar component**

```css
/* Progress Bar Component */
.progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin: var(--space-md) 0;
}

.progress-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-green), var(--accent-blue));
  border-radius: var(--radius-sm);
  transition: width var(--transition-normal);
  position: relative;
}

.progress-bar__fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: progress-shine 2s infinite;
}

.progress-text {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-secondary);
}
```

- [ ] **Step 6: Create modal component**

```css
/* Modal Component */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--accent-green);
  box-shadow: 0 0 40px rgba(57, 255, 20, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid rgba(57, 255, 20, 0.1);
}

.modal__title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--accent-green);
}

.modal__close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: var(--space-sm);
  line-height: 1;
}

.modal__close:hover {
  color: var(--text-primary);
}

.modal__body {
  padding: var(--space-lg);
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-top: 1px solid rgba(57, 255, 20, 0.1);
}
```

- [ ] **Step 7: Create toast component**

```css
/* Toast Component */
.toast-container {
  position: fixed;
  top: var(--space-lg);
  right: var(--space-lg);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.toast {
  background-color: var(--bg-card);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  border-left: 4px solid var(--accent-green);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  min-width: 300px;
  max-width: 400px;
  animation: slide-in-right 0.3s ease-out;
}

.toast--success {
  border-left-color: var(--accent-green);
}

.toast--error {
  border-left-color: #ff4444;
}

.toast--info {
  border-left-color: var(--accent-blue);
}

.toast--warning {
  border-left-color: var(--accent-gold);
}

.toast__icon {
  font-size: 1.25rem;
}

.toast__message {
  flex: 1;
  font-size: 0.875rem;
}

.toast__close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-xs);
  font-size: 1rem;
}

.toast__close:hover {
  color: var(--text-primary);
}
```

- [ ] **Step 8: Verify file creation**

Run: `ls css/`
Expected: `index.css`, `layout.css`, and `components.css` exist

- [ ] **Step 9: Commit**

```bash
git add css/components.css
git commit -m "feat: add component styles for cards, buttons, inputs, and modals"
```

---

## Task 4: Dashboard Styles (dashboard.css)

**Files:**
- Create: `css/dashboard.css`

- [ ] **Step 1: Create dashboard-specific styles**

```css
/* Dashboard Module Styles */
.dashboard__total-score {
  text-align: center;
  padding: var(--space-2xl);
}

.score-display {
  font-family: var(--font-display);
  font-size: 4rem;
  font-weight: 900;
  color: var(--accent-green);
  display: block;
  margin-bottom: var(--space-sm);
}

.score-unit {
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.dashboard__current-level {
  /* Level card styles */
}

.level-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--accent-purple);
  margin-bottom: var(--space-md);
}

.dashboard__weekly-trend {
  /* Weekly trend card styles */
}

.dashboard__recent-events {
  /* Recent events card styles */
}

/* Event List */
.event-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.event-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent-green);
  transition: all var(--transition-fast);
}

.event-item:hover {
  background-color: rgba(57, 255, 20, 0.05);
}

.event-item--basic {
  border-left-color: var(--level-basic);
}

.event-item--combo {
  border-left-color: var(--level-combo);
}

.event-item--rare {
  border-left-color: var(--level-rare);
}

.event-item--epic {
  border-left-color: var(--level-epic);
}

.event-item__icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.event-item__info {
  flex: 1;
  min-width: 0;
}

.event-item__title {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-item__time {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.event-item__score {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent-green);
}

.event-list__empty {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: var(--space-md);
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls css/`
Expected: `dashboard.css` exists

- [ ] **Step 3: Commit**

```bash
git add css/dashboard.css
git commit -m "feat: add dashboard module styles"
```

---

## Task 5: Record Module Styles (record.css)

**Files:**
- Create: `css/record.css`

- [ ] **Step 1: Create record module styles**

```css
/* Record Module Styles */
.record-section {
  margin-bottom: var(--space-2xl);
}

.record-ai {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* AI Preview */
.ai-preview {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  border: 1px solid rgba(57, 255, 20, 0.2);
  margin-top: var(--space-lg);
}

.ai-preview__header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.score-badge {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-green);
}

.ai-preview__title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

.ai-preview__comment {
  font-style: italic;
  color: var(--text-secondary);
  margin-bottom: var(--space-lg);
  padding-left: var(--space-md);
  border-left: 2px solid var(--accent-purple);
}

.ai-preview__achievement {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background-color: rgba(191, 64, 191, 0.1);
  border-radius: var(--radius-md);
  border: 1px solid rgba(191, 64, 191, 0.3);
  margin-bottom: var(--space-lg);
}

.achievement-icon {
  font-size: 2rem;
}

.achievement-name {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--accent-purple);
}

.achievement-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.ai-preview__actions {
  display: flex;
  gap: var(--space-md);
}

/* Quick Events Grid */
.quick-events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-md);
}

.quick-event-btn {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background-color: var(--bg-card);
  border: 1px solid rgba(57, 255, 20, 0.1);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.quick-event-btn:hover {
  border-color: var(--accent-green);
  background-color: rgba(57, 255, 20, 0.05);
  transform: translateY(-2px);
}

.quick-event-btn__icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.quick-event-btn__text {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.quick-event-btn__score {
  font-family: var(--font-display);
  font-weight: 700;
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls css/`
Expected: `record.css` exists

- [ ] **Step 3: Commit**

```bash
git add css/record.css
git commit -m "feat: add record module styles"
```

---

## Task 6: Achievements Module Styles (achievements.css)

**Files:**
- Create: `css/achievements.css`

- [ ] **Step 1: Create achievements module styles**

```css
/* Achievements Module Styles */
.achievements-stats {
  display: flex;
  align-items: baseline;
  gap: var(--space-md);
  margin-bottom: var(--space-2xl);
}

.achievements-stats__count {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 900;
  color: var(--accent-green);
}

.achievements-stats__label {
  font-size: 1rem;
  color: var(--text-secondary);
}

/* Achievements Grid */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-lg);
}

.achievement-card {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  border: 1px solid rgba(57, 255, 20, 0.1);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.achievement-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.achievement-card--locked {
  opacity: 0.5;
  filter: grayscale(0.8);
}

.achievement-card--locked:hover {
  transform: none;
  box-shadow: none;
}

.achievement-card--common {
  border-color: rgba(255, 255, 255, 0.2);
}

.achievement-card--common:hover {
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

.achievement-card--rare {
  border-color: var(--accent-purple);
}

.achievement-card--rare:hover {
  box-shadow: 0 0 30px rgba(191, 64, 191, 0.3);
}

.achievement-card--epic {
  border-color: var(--accent-gold);
}

.achievement-card--epic:hover {
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}

.achievement-card--legendary {
  border-image: linear-gradient(
    135deg,
    var(--accent-green),
    var(--accent-blue),
    var(--accent-purple),
    var(--accent-gold)
  ) 1;
}

.achievement-card--legendary:hover {
  box-shadow: 0 0 40px rgba(57, 255, 20, 0.3);
}

.achievement-card__rarity-badge {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  background-color: rgba(0, 0, 0, 0.5);
}

.achievement-card__emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--space-md);
}

.achievement-card__name {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.achievement-card__desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
  line-height: 1.5;
}

.achievement-card__time {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.achievements-grid__empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--space-2xl);
  color: var(--text-secondary);
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls css/`
Expected: `achievements.css` exists

- [ ] **Step 3: Commit**

```bash
git add css/achievements.css
git commit -m "feat: add achievements module styles"
```

---

## Task 7: Report Module Styles (report.css)

**Files:**
- Create: `css/report.css`

- [ ] **Step 1: Create report module styles**

```css
/* Report Module Styles */
.report-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2xl);
  gap: var(--space-lg);
}

.report-content {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  border: 1px solid rgba(57, 255, 20, 0.1);
}

.report-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid rgba(57, 255, 20, 0.1);
}

.report-header__title {
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--accent-green);
  margin-bottom: var(--space-sm);
}

.report-header__date {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Report Stats Row */
.report-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
}

.report-stat-card {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  text-align: center;
  border: 1px solid rgba(57, 255, 20, 0.1);
}

.report-stat-card__label {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-sm);
}

.report-stat-card__value {
  display: block;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-green);
}

.report-stat-card__delta {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  margin-top: var(--space-sm);
}

.report-stat-card__delta--up {
  color: var(--accent-green);
}

.report-stat-card__delta--down {
  color: #ff4444;
}

/* Report Charts Row */
.report-charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-xl);
  margin-bottom: var(--space-2xl);
}

.report-chart-container {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  border: 1px solid rgba(57, 255, 20, 0.1);
}

.report-chart-title {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: var(--space-lg);
  text-align: center;
}

/* Report Sections */
.report-section {
  margin-bottom: var(--space-2xl);
}

.report-section__title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--accent-green);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid rgba(57, 255, 20, 0.1);
}

/* Top Events */
.report-top-events {
  list-style: none;
  counter-reset: top-events;
}

.report-top-event {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-sm);
  counter-increment: top-events;
}

.report-top-event__rank {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-gold);
  min-width: 40px;
}

.report-top-event__title {
  flex: 1;
  font-size: 0.875rem;
}

.report-top-event__score {
  font-family: var(--font-display);
  font-weight: 700;
}

.report-top-events__empty {
  text-align: center;
  padding: var(--space-lg);
  color: var(--text-secondary);
  font-style: italic;
}

/* Report Achievements */
.report-achievements {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-md);
}

.report-achievement {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid rgba(191, 64, 191, 0.2);
}

.report-achievement__emoji {
  font-size: 1.5rem;
}

.report-achievement__name {
  font-size: 0.875rem;
  font-weight: 500;
}

.report-achievements__empty {
  text-align: center;
  padding: var(--space-lg);
  color: var(--text-secondary);
  font-style: italic;
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls css/`
Expected: `report.css` exists

- [ ] **Step 3: Commit**

```bash
git add css/report.css
git commit -m "feat: add report module styles"
```

---

## Task 8: Settings Module Styles (settings.css)

**Files:**
- Create: `css/settings.css`

- [ ] **Step 1: Create settings module styles**

```css
/* Settings Module Styles */
.settings-section {
  margin-bottom: var(--space-2xl);
}

.settings-form {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  border: 1px solid rgba(57, 255, 20, 0.1);
}

/* Prompt Editor */
.prompt-editor {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  border: 1px solid rgba(57, 255, 20, 0.1);
}

.prompt-group {
  margin-bottom: var(--space-xl);
}

.prompt-group:last-child {
  margin-bottom: 0;
}

.prompt-group__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

/* Data Actions */
.data-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}

/* Connection Status */
.connection-status {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
}

.connection-status--success {
  color: var(--accent-green);
  background-color: rgba(57, 255, 20, 0.1);
  border: 1px solid var(--accent-green);
}

.connection-status--error {
  color: #ff4444;
  background-color: rgba(255, 68, 68, 0.1);
  border: 1px solid #ff4444;
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls css/`
Expected: `settings.css` exists

- [ ] **Step 3: Commit**

```bash
git add css/settings.css
git commit -m "feat: add settings module styles"
```

---

## Task 9: Animation Styles (animations.css)

**Files:**
- Create: `css/animations.css`

- [ ] **Step 1: Create animation styles**

```css
/* Animation Styles */

/* Scanline Overlay */
.scanline-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 9999;
  opacity: 0.3;
}

/* Glitch Text Effect */
.glitch-text {
  position: relative;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch-text::before {
  left: 2px;
  text-shadow: -2px 0 #ff00c1;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim 5s infinite linear alternate-reverse;
}

.glitch-text::after {
  left: -2px;
  text-shadow: -2px 0 #ff00c1, 2px 0 #00fff9;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim2 5s infinite linear alternate-reverse;
}

/* Glitch Animation */
@keyframes glitch-anim {
  0% {
    clip: rect(31px, 9999px, 94px, 0);
    transform: skew(0.8deg);
  }
  5% {
    clip: rect(70px, 9999px, 71px, 0);
    transform: skew(0.1deg);
  }
  10% {
    clip: rect(29px, 9999px, 16px, 0);
    transform: skew(0.6deg);
  }
  15% {
    clip: rect(68px, 9999px, 98px, 0);
    transform: skew(0.9deg);
  }
  20% {
    clip: rect(31px, 9999px, 16px, 0);
    transform: skew(0.5deg);
  }
  25% {
    clip: rect(16px, 9999px, 84px, 0);
    transform: skew(0.2deg);
  }
  30% {
    clip: rect(15px, 9999px, 85px, 0);
    transform: skew(0.7deg);
  }
  35% {
    clip: rect(2px, 9999px, 98px, 0);
    transform: skew(0.4deg);
  }
  40% {
    clip: rect(75px, 9999px, 73px, 0);
    transform: skew(0.1deg);
  }
  45% {
    clip: rect(62px, 9999px, 24px, 0);
    transform: skew(0.8deg);
  }
  50% {
    clip: rect(50px, 9999px, 93px, 0);
    transform: skew(0.3deg);
  }
  55% {
    clip: rect(60px, 9999px, 56px, 0);
    transform: skew(0.6deg);
  }
  60% {
    clip: rect(10px, 9999px, 99px, 0);
    transform: skew(0.9deg);
  }
  65% {
    clip: rect(25px, 9999px, 16px, 0);
    transform: skew(0.2deg);
  }
  70% {
    clip: rect(79px, 9999px, 28px, 0);
    transform: skew(0.5deg);
  }
  75% {
    clip: rect(18px, 9999px, 9px, 0);
    transform: skew(0.8deg);
  }
  80% {
    clip: rect(18px, 9999px, 35px, 0);
    transform: skew(0.1deg);
  }
  85% {
    clip: rect(83px, 9999px, 50px, 0);
    transform: skew(0.4deg);
  }
  90% {
    clip: rect(52px, 9999px, 74px, 0);
    transform: skew(0.7deg);
  }
  95% {
    clip: rect(63px, 9999px, 97px, 0);
    transform: skew(0.3deg);
  }
  100% {
    clip: rect(80px, 9999px, 10px, 0);
    transform: skew(0.6deg);
  }
}

@keyframes glitch-anim2 {
  0% {
    clip: rect(65px, 9999px, 100px, 0);
    transform: skew(0.4deg);
  }
  5% {
    clip: rect(52px, 9999px, 74px, 0);
    transform: skew(0.7deg);
  }
  10% {
    clip: rect(28px, 9999px, 10px, 0);
    transform: skew(0.2deg);
  }
  15% {
    clip: rect(15px, 9999px, 85px, 0);
    transform: skew(0.5deg);
  }
  20% {
    clip: rect(79px, 9999px, 28px, 0);
    transform: skew(0.8deg);
  }
  25% {
    clip: rect(63px, 9999px, 97px, 0);
    transform: skew(0.1deg);
  }
  30% {
    clip: rect(50px, 9999px, 93px, 0);
    transform: skew(0.4deg);
  }
  35% {
    clip: rect(18px, 9999px, 35px, 0);
    transform: skew(0.7deg);
  }
  40% {
    clip: rect(31px, 9999px, 16px, 0);
    transform: skew(0.2deg);
  }
  45% {
    clip: rect(70px, 9999px, 71px, 0);
    transform: skew(0.5deg);
  }
  50% {
    clip: rect(10px, 9999px, 99px, 0);
    transform: skew(0.8deg);
  }
  55% {
    clip: rect(83px, 9999px, 50px, 0);
    transform: skew(0.1deg);
  }
  60% {
    clip: rect(2px, 9999px, 98px, 0);
    transform: skew(0.4deg);
  }
  65% {
    clip: rect(68px, 9999px, 98px, 0);
    transform: skew(0.7deg);
  }
  70% {
    clip: rect(25px, 9999px, 16px, 0);
    transform: skew(0.2deg);
  }
  75% {
    clip: rect(44px, 9999px, 56px, 0);
    transform: skew(0.5deg);
  }
  80% {
    clip: rect(60px, 9999px, 56px, 0);
    transform: skew(0.8deg);
  }
  85% {
    clip: rect(75px, 9999px, 73px, 0);
    transform: skew(0.1deg);
  }
  90% {
    clip: rect(29px, 9999px, 16px, 0);
    transform: skew(0.4deg);
  }
  95% {
    clip: rect(62px, 9999px, 24px, 0);
    transform: skew(0.7deg);
  }
  100% {
    clip: rect(31px, 9999px, 94px, 0);
    transform: skew(0.2deg);
  }
}

/* Pulse Glow Animation */
@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 5px var(--accent-green), 0 0 10px var(--accent-green);
  }
  50% {
    box-shadow: 0 0 20px var(--accent-green), 0 0 40px var(--accent-green);
  }
  100% {
    box-shadow: 0 0 5px var(--accent-green), 0 0 10px var(--accent-green);
  }
}

/* Progress Shine Animation */
@keyframes progress-shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Slide In Right Animation */
@keyframes slide-in-right {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Fade In Animation */
@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* Fade Out Animation */
@keyframes fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* Utility Animation Classes */
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-fade-out {
  animation: fade-out 0.3s ease-out;
}

.animate-slide-in {
  animation: slide-in-right 0.3s ease-out;
}

.animate-pulse {
  animation: pulse-glow 2s infinite;
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls css/`
Expected: `animations.css` exists

- [ ] **Step 3: Commit**

```bash
git add css/animations.css
git commit -m "feat: add animation styles for glitch, neon, and scanline effects"
```

---

## Task 10: Utility Functions (utils.js)

**Files:**
- Create: `js/utils.js`

- [ ] **Step 1: Create utility functions**

```javascript
// utils.js - Utility Functions

/**
 * Generate a UUID v4
 * @returns {string} UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Format ISO date string to readable format
 * @param {string} isoString - ISO 8601 date string
 * @returns {string} Formatted date
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

/**
 * Get relative time string (e.g., "3 minutes ago")
 * @param {string} isoString - ISO 8601 date string
 * @returns {string} Relative time
 */
function relativeTime(isoString) {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return '刚刚';
  } else if (diffMin < 60) {
    return `${diffMin}分钟前`;
  } else if (diffHour < 24) {
    return `${diffHour}小时前`;
  } else if (diffDay < 7) {
    return `${diffDay}天前`;
  } else {
    return formatDate(isoString);
  }
}

/**
 * Get week range (Monday to Sunday) for a given date
 * @param {Date} date - Date object (defaults to current date)
 * @returns {Object} { weekStart: Date, weekEnd: Date }
 */
function getWeekRange(date = new Date()) {
  const dayOfWeek = date.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - diffToMonday);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return { weekStart, weekEnd };
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} ms - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(fn, ms = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Clamp a number between min and max
 * @param {number} val - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} Is empty
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// Export utilities (for potential module usage)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateUUID,
    formatDate,
    relativeTime,
    getWeekRange,
    debounce,
    clamp,
    formatNumber,
    deepClone,
    isEmpty
  };
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls js/`
Expected: `utils.js` exists

- [ ] **Step 3: Commit**

```bash
git add js/utils.js
git commit -m "feat: add utility functions for UUID, dates, and common operations"
```

---

## Task 11: Data Store (store.js)

**Files:**
- Create: `js/store.js`

- [ ] **Step 1: Create data store**

```javascript
// store.js - Data Layer

const STORAGE_KEY = 'absurdity_data';

// Default data structure
const DEFAULT_DATA = {
  events: [],
  achievements: [],
  level: {
    stage: 1,
    totalScore: 0,
    currentTitle: '形式主义实习生',
    titleHistory: []
  },
  weeklyReports: [],
  aiConfig: {
    baseUrl: '',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    prompts: {
      eventAnalysis: `你是一个荒谬事件分析专家。用户会描述一个职场中遇到的荒谬事件。
请分析并返回 JSON 格式：
{
  "level": "basic|combo|rare|epic",
  "score": 数字,
  "title": "事件标题（简洁幽默）",
  "achievement": "成就名称（如果值得一个成就的话）",
  "achievement_desc": "成就描述",
  "comment": "一句毒舌点评"
}`,
      achievementGen: `你是一个成就系统设计师，风格是赛博朋克+黑色幽默。
根据以下荒谬事件，生成一个有趣的成就：
事件等级：{level}，事件描述：{description}
返回 JSON：{ "name": "成就名称", "desc": "成就描述", "emoji": "一个合适的emoji" }`,
      levelNaming: `你是一个赛博朋克世界的命名大师。
当前用户荒谬积分：{score}，所处阶段：{stage}（共4阶段）。
请生成一个有趣的、带有讽刺意味的等级称号，风格参考：形式主义实习生、流程卷王、官僚主义大师。
只返回称号本身，不要其他内容。`
    }
  }
};

// Current store instance
let storeData = null;

/**
 * Initialize store - load from localStorage or create default
 */
function initStore() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      storeData = JSON.parse(saved);
      // Merge with defaults to ensure all fields exist
      storeData = mergeWithDefaults(storeData, DEFAULT_DATA);
    } else {
      storeData = deepClone(DEFAULT_DATA);
    }
  } catch (error) {
    console.error('Failed to load store:', error);
    storeData = deepClone(DEFAULT_DATA);
  }
}

/**
 * Merge saved data with defaults to ensure all fields exist
 */
function mergeWithDefaults(saved, defaults) {
  const result = { ...defaults };
  
  for (const key in saved) {
    if (saved.hasOwnProperty(key)) {
      if (typeof saved[key] === 'object' && !Array.isArray(saved[key]) && saved[key] !== null) {
        result[key] = mergeWithDefaults(saved[key], defaults[key] || {});
      } else {
        result[key] = saved[key];
      }
    }
  }
  
  return result;
}

/**
 * Save store to localStorage
 */
function saveStore() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storeData));
  } catch (error) {
    console.error('Failed to save store:', error);
  }
}

/**
 * Get current store data
 * @returns {Object} Store data
 */
function getStore() {
  if (!storeData) {
    initStore();
  }
  return storeData;
}

/**
 * Add a new event
 * @param {Object} eventData - Event data
 * @returns {Object} Created event
 */
function addEvent(eventData) {
  const store = getStore();
  
  const event = {
    id: generateUUID(),
    timestamp: new Date().toISOString(),
    level: eventData.level,
    score: eventData.score,
    title: eventData.title,
    description: eventData.description || '',
    achievement: eventData.achievement || null,
    aiComment: eventData.aiComment || null
  };
  
  store.events.unshift(event); // Add to beginning
  
  // Add achievement if provided
  if (event.achievement) {
    addAchievement({
      name: event.achievement.name,
      description: event.achievement.desc,
      emoji: event.achievement.emoji,
      rarity: determineAchievementRarity(event.level),
      eventId: event.id
    });
  }
  
  // Update level
  updateLevel(event.score);
  
  saveStore();
  return event;
}

/**
 * Add a new achievement
 * @param {Object} achievementData - Achievement data
 * @returns {Object} Created achievement
 */
function addAchievement(achievementData) {
  const store = getStore();
  
  const achievement = {
    id: generateUUID(),
    name: achievementData.name,
    description: achievementData.description,
    emoji: achievementData.emoji,
    rarity: achievementData.rarity || 'common',
    unlockedAt: new Date().toISOString(),
    eventId: achievementData.eventId || null
  };
  
  store.achievements.push(achievement);
  saveStore();
  return achievement;
}

/**
 * Determine achievement rarity based on event level
 */
function determineAchievementRarity(eventLevel) {
  switch (eventLevel) {
    case 'epic': return 'legendary';
    case 'rare': return 'epic';
    case 'combo': return 'rare';
    default: return 'common';
  }
}

/**
 * Update level based on new score
 * @param {number} scoreToAdd - Score to add
 */
function updateLevel(scoreToAdd) {
  const store = getStore();
  
  store.level.totalScore += scoreToAdd;
  
  // Determine stage
  let newStage;
  if (store.level.totalScore <= 50) {
    newStage = 1;
  } else if (store.level.totalScore <= 200) {
    newStage = 2;
  } else if (store.level.totalScore <= 500) {
    newStage = 3;
  } else {
    newStage = 4;
  }
  
  // Check if stage changed
  if (newStage !== store.level.stage) {
    store.level.stage = newStage;
    // Title will be updated by AI or default
  }
  
  saveStore();
}

/**
 * Get weekly statistics
 * @param {Date} weekStart - Week start date
 * @param {Date} weekEnd - Week end date
 * @returns {Object} Weekly stats
 */
function getWeeklyStats(weekStart, weekEnd) {
  const store = getStore();
  
  const weekEvents = store.events.filter(event => {
    const eventDate = new Date(event.timestamp);
    return eventDate >= weekStart && eventDate <= weekEnd;
  });
  
  const totalScore = weekEvents.reduce((sum, event) => sum + event.score, 0);
  const eventCount = weekEvents.length;
  
  // Get top events
  const topEvents = [...weekEvents]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  
  // Get achievements unlocked this week
  const newAchievements = store.achievements.filter(achievement => {
    const unlockDate = new Date(achievement.unlockedAt);
    return unlockDate >= weekStart && unlockDate <= weekEnd;
  });
  
  // Calculate level distribution
  const levelDistribution = {
    basic: weekEvents.filter(e => e.level === 'basic').length,
    combo: weekEvents.filter(e => e.level === 'combo').length,
    rare: weekEvents.filter(e => e.level === 'rare').length,
    epic: weekEvents.filter(e => e.level === 'epic').length
  };
  
  // Calculate daily trend
  const dailyTrend = [];
  const currentDate = new Date(weekStart);
  while (currentDate <= weekEnd) {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayScore = weekEvents
      .filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= dayStart && eventDate <= dayEnd;
      })
      .reduce((sum, event) => sum + event.score, 0);
    
    dailyTrend.push({
      date: new Date(currentDate),
      score: dayScore
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return {
    totalScore,
    eventCount,
    topEvents,
    newAchievements,
    levelDistribution,
    dailyTrend
  };
}

/**
 * Export store data as JSON string
 * @returns {string} JSON string
 */
function exportData() {
  return JSON.stringify(getStore(), null, 2);
}

/**
 * Import data from JSON string
 * @param {string} jsonString - JSON string to import
 * @param {boolean} merge - Whether to merge with existing data
 */
function importData(jsonString, merge = false) {
  try {
    const imported = JSON.parse(jsonString);
    
    if (merge) {
      // Merge with existing data
      const current = getStore();
      storeData = {
        events: [...current.events, ...imported.events],
        achievements: [...current.achievements, ...imported.achievements],
        level: imported.level || current.level,
        weeklyReports: [...current.weeklyReports, ...imported.weeklyReports],
        aiConfig: { ...current.aiConfig, ...imported.aiConfig }
      };
    } else {
      storeData = imported;
    }
    
    saveStore();
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}

/**
 * Clear all data
 */
function clearData() {
  storeData = deepClone(DEFAULT_DATA);
  saveStore();
}

// Initialize store on load
initStore();
```

- [ ] **Step 2: Verify file creation**

Run: `ls js/`
Expected: `store.js` exists

- [ ] **Step 3: Commit**

```bash
git add js/store.js
git commit -m "feat: add data store with localStorage persistence"
```

---

## Task 12: AI Service Layer (ai.js)

**Files:**
- Create: `js/ai.js`

- [ ] **Step 1: Create AI service layer**

```javascript
// ai.js - AI Service Layer

/**
 * Get AI configuration from store
 * @returns {Object} AI config
 */
function getAIConfig() {
  const store = getStore();
  return store.aiConfig;
}

/**
 * Check if AI is available (has baseUrl and apiKey)
 * @returns {boolean} Is AI available
 */
function isAIAvailable() {
  const config = getAIConfig();
  return config.baseUrl && config.apiKey;
}

/**
 * Call AI API
 * @param {Array} messages - Messages array
 * @returns {Promise<Object>} AI response
 */
async function callAI(messages) {
  const config = getAIConfig();
  
  if (!isAIAvailable()) {
    throw new Error('AI not configured');
  }
  
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Analyze event using AI
 * @param {string} description - Event description
 * @returns {Promise<Object>} Analysis result
 */
async function analyzeEvent(description) {
  const config = getAIConfig();
  
  const messages = [
    {
      role: 'system',
      content: config.prompts.eventAnalysis
    },
    {
      role: 'user',
      content: description
    }
  ];
  
  try {
    const response = await callAI(messages);
    // Try to parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON response');
  } catch (error) {
    console.error('AI analysis failed:', error);
    // Return fallback
    return getFallbackAnalysis(description);
  }
}

/**
 * Generate achievement using AI
 * @param {string} level - Event level
 * @param {string} description - Event description
 * @returns {Promise<Object>} Achievement data
 */
async function generateAchievement(level, description) {
  const config = getAIConfig();
  
  const prompt = config.prompts.achievementGen
    .replace('{level}', level)
    .replace('{description}', description);
  
  const messages = [
    {
      role: 'user',
      content: prompt
    }
  ];
  
  try {
    const response = await callAI(messages);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON response');
  } catch (error) {
    console.error('AI achievement generation failed:', error);
    return getFallbackAchievement(level);
  }
}

/**
 * Generate level name using AI
 * @param {number} score - Current score
 * @param {number} stage - Current stage
 * @returns {Promise<string>} Level name
 */
async function generateLevelName(score, stage) {
  const config = getAIConfig();
  
  const prompt = config.prompts.levelNaming
    .replace('{score}', score)
    .replace('{stage}', stage);
  
  const messages = [
    {
      role: 'user',
      content: prompt
    }
  ];
  
  try {
    const response = await callAI(messages);
    return response.trim();
  } catch (error) {
    console.error('AI level naming failed:', error);
    return getFallbackLevelName(stage);
  }
}

/**
 * Test AI connection
 * @returns {Promise<Object>} Test result
 */
async function testConnection() {
  try {
    const response = await callAI([
      {
        role: 'user',
        content: 'Hello, this is a test. Please respond with "OK".'
      }
    ]);
    
    return {
      success: true,
      message: 'Connection successful',
      response: response
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Get fallback analysis when AI is unavailable
 * @param {string} description - Event description
 * @returns {Object} Fallback analysis
 */
function getFallbackAnalysis(description) {
  // Simple keyword-based analysis
  const lowerDesc = description.toLowerCase();
  
  let level = 'basic';
  let score = 1;
  
  if (lowerDesc.includes('重复') || lowerDesc.includes('多处') || lowerDesc.includes('三个')) {
    level = 'combo';
    score = 3;
  } else if (lowerDesc.includes('领导') || lowerDesc.includes('上级')) {
    level = 'rare';
    score = 10;
  } else if (lowerDesc.includes('驳回') || lowerDesc.includes('优化')) {
    level = 'epic';
    score = 50;
  }
  
  return {
    level: level,
    score: score,
    title: description.substring(0, 20) + '...',
    achievement: null,
    achievement_desc: null,
    comment: 'AI 暂时无法分析，已使用默认评分'
  };
}

/**
 * Get fallback achievement when AI is unavailable
 * @param {string} level - Event level
 * @returns {Object} Fallback achievement
 */
function getFallbackAchievement(level) {
  const achievements = {
    basic: [
      { name: '初入荒谬', desc: '记录了第一件荒谬事', emoji: '📝' },
      { name: '日常吐槽', desc: '又一件荒谬事', emoji: '😤' }
    ],
    combo: [
      { name: '连击大师', desc: '荒谬事接连不断', emoji: '🔗' },
      { name: '重复受害者', desc: '被重复流程折磨', emoji: '🔄' }
    ],
    rare: [
      { name: '稀有发现', desc: '发现了罕见的荒谬', emoji: '💎' },
      { name: '领导认证', desc: '连领导都看不下去了', emoji: '👔' }
    ],
    epic: [
      { name: '史诗级荒谬', desc: '见证了史诗级的荒谬', emoji: '🔥' },
      { name: '荒谬觉醒', desc: '荒谬指数爆表', emoji: '⚡' }
    ]
  };
  
  const levelAchievements = achievements[level] || achievements.basic;
  return levelAchievements[Math.floor(Math.random() * levelAchievements.length)];
}

/**
 * Get fallback level name when AI is unavailable
 * @param {number} stage - Current stage
 * @returns {string} Level name
 */
function getFallbackLevelName(stage) {
  const names = {
    1: '形式主义实习生',
    2: '流程卷王',
    3: '官僚主义大师',
    4: '荒谬觉醒者'
  };
  
  return names[stage] || '荒谬新手';
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls js/`
Expected: `ai.js` exists

- [ ] **Step 3: Commit**

```bash
git add js/ai.js
git commit -m "feat: add AI service layer with fallback strategies"
```

---

## Task 13: Chart.js Wrapper (charts.js)

**Files:**
- Create: `js/charts.js`

- [ ] **Step 1: Create Chart.js wrapper**

```javascript
// charts.js - Chart.js Configuration and Wrapper

// Cyberpunk theme colors
const CHART_COLORS = {
  green: '#39FF14',
  blue: '#00D4FF',
  purple: '#BF40BF',
  gold: '#FFD700',
  grid: 'rgba(57, 255, 20, 0.1)',
  text: '#888888'
};

// Common chart options
const COMMON_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: CHART_COLORS.text,
        font: {
          family: "'JetBrains Mono', monospace",
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: '#1a1a2e',
      titleColor: '#e0e0e0',
      bodyColor: '#e0e0e0',
      borderColor: CHART_COLORS.green,
      borderWidth: 1,
      titleFont: {
        family: "'Orbitron', sans-serif",
        size: 14
      },
      bodyFont: {
        family: "'Noto Sans SC', sans-serif",
        size: 12
      },
      padding: 12,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: {
        color: CHART_COLORS.grid,
        drawBorder: false
      },
      ticks: {
        color: CHART_COLORS.text,
        font: {
          family: "'JetBrains Mono', monospace",
          size: 10
        }
      }
    },
    y: {
      grid: {
        color: CHART_COLORS.grid,
        drawBorder: false
      },
      ticks: {
        color: CHART_COLORS.text,
        font: {
          family: "'JetBrains Mono', monospace",
          size: 10
        }
      }
    }
  }
};

/**
 * Create mini line chart for dashboard
 * @param {string} canvasId - Canvas element ID
 * @param {Object} data - Chart data
 * @returns {Chart} Chart instance
 */
function createMiniLineChart(canvasId, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: '荒谬值',
        data: data.values,
        borderColor: CHART_COLORS.green,
        backgroundColor: `${CHART_COLORS.green}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: CHART_COLORS.green,
        pointBorderColor: CHART_COLORS.green,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      ...COMMON_OPTIONS,
      plugins: {
        ...COMMON_OPTIONS.plugins,
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ...COMMON_OPTIONS.scales.x,
          display: false
        },
        y: {
          ...COMMON_OPTIONS.scales.y,
          display: false
        }
      }
    }
  });
}

/**
 * Create trend line chart for weekly report
 * @param {string} canvasId - Canvas element ID
 * @param {Object} data - Chart data
 * @returns {Chart} Chart instance
 */
function createTrendLineChart(canvasId, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: '每日荒谬值',
        data: data.values,
        borderColor: CHART_COLORS.green,
        backgroundColor: `${CHART_COLORS.green}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: CHART_COLORS.green,
        pointBorderColor: CHART_COLORS.green,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      ...COMMON_OPTIONS,
      plugins: {
        ...COMMON_OPTIONS.plugins,
        legend: {
          display: false
        }
      }
    }
  });
}

/**
 * Create distribution doughnut chart
 * @param {string} canvasId - Canvas element ID
 * @param {Object} data - Chart data
 * @returns {Chart} Chart instance
 */
function createDistributionChart(canvasId, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['基础 (BASIC)', '连击 (COMBO)', '稀有 (RARE)', '史诗 (EPIC)'],
      datasets: [{
        data: [data.basic, data.combo, data.rare, data.epic],
        backgroundColor: [
          `${CHART_COLORS.green}80`,
          `${CHART_COLORS.blue}80`,
          `${CHART_COLORS.purple}80`,
          `${CHART_COLORS.gold}80`
        ],
        borderColor: [
          CHART_COLORS.green,
          CHART_COLORS.blue,
          CHART_COLORS.purple,
          CHART_COLORS.gold
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          CHART_COLORS.green,
          CHART_COLORS.blue,
          CHART_COLORS.purple,
          CHART_COLORS.gold
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: CHART_COLORS.text,
            font: {
              family: "'Noto Sans SC', sans-serif",
              size: 12
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: COMMON_OPTIONS.plugins.tooltip
      },
      cutout: '60%'
    }
  });
}

/**
 * Destroy chart instance
 * @param {Chart} chart - Chart instance to destroy
 */
function destroyChart(chart) {
  if (chart) {
    chart.destroy();
  }
}

/**
 * Update chart data
 * @param {Chart} chart - Chart instance
 * @param {Object} newData - New data
 */
function updateChart(chart, newData) {
  if (!chart) return;
  
  if (newData.labels) {
    chart.data.labels = newData.labels;
  }
  
  if (newData.values) {
    chart.data.datasets[0].data = newData.values;
  }
  
  chart.update();
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls js/`
Expected: `charts.js` exists

- [ ] **Step 3: Commit**

```bash
git add js/charts.js
git commit -m "feat: add Chart.js wrapper with cyberpunk theme"
```

---

## Task 14: Dashboard Module (dashboard.js)

**Files:**
- Create: `js/dashboard.js`

- [ ] **Step 1: Create dashboard module**

```javascript
// dashboard.js - Dashboard Module

let miniTrendChart = null;

/**
 * Initialize dashboard
 */
function initDashboard() {
  updateDashboard();
}

/**
 * Update all dashboard components
 */
function updateDashboard() {
  renderTotalScore();
  renderLevel();
  renderMiniTrend();
  renderRecentEvents();
}

/**
 * Render total score with animation
 */
function renderTotalScore() {
  const store = getStore();
  const scoreElement = document.getElementById('total-score-value');
  
  if (!scoreElement) return;
  
  const currentScore = parseInt(scoreElement.textContent) || 0;
  const targetScore = store.level.totalScore;
  
  if (currentScore === targetScore) return;
  
  // Animate score change
  animateValue(scoreElement, currentScore, targetScore, 1000);
}

/**
 * Animate numeric value change
 * @param {HTMLElement} element - Element to animate
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} duration - Animation duration in ms
 */
function animateValue(element, start, end, duration) {
  const range = end - start;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const eased = 1 - Math.pow(1 - progress, 3);
    
    const current = Math.floor(start + range * eased);
    element.textContent = formatNumber(current);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

/**
 * Render level information
 */
function renderLevel() {
  const store = getStore();
  
  const stageBadge = document.getElementById('level-stage-badge');
  const titleElement = document.getElementById('level-title');
  const progressBar = document.getElementById('level-progress');
  const progressText = document.getElementById('level-progress-text');
  
  if (!stageBadge || !titleElement || !progressBar || !progressText) return;
  
  // Update stage badge
  stageBadge.textContent = `阶段 ${store.level.stage}`;
  
  // Update title
  titleElement.textContent = store.level.currentTitle;
  
  // Calculate progress
  const stageThresholds = [0, 50, 200, 500, Infinity];
  const currentStageMin = stageThresholds[store.level.stage - 1];
  const nextStageMin = stageThresholds[store.level.stage];
  const progress = store.level.stage === 4 
    ? 100 
    : ((store.level.totalScore - currentStageMin) / (nextStageMin - currentStageMin)) * 100;
  
  // Update progress bar
  progressBar.style.width = `${Math.min(progress, 100)}%`;
  
  // Update progress text
  if (store.level.stage === 4) {
    progressText.textContent = '已达最高阶段';
  } else {
    const remaining = nextStageMin - store.level.totalScore;
    progressText.textContent = `${store.level.totalScore} / ${nextStageMin} 到下一阶段`;
  }
}

/**
 * Render mini trend chart
 */
function renderMiniTrend() {
  const { weekStart, weekEnd } = getWeekRange();
  const stats = getWeeklyStats(weekStart, weekEnd);
  
  const labels = stats.dailyTrend.map(day => {
    const date = new Date(day.date);
    return ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
  });
  
  const values = stats.dailyTrend.map(day => day.score);
  
  // Destroy existing chart
  destroyChart(miniTrendChart);
  
  // Create new chart
  miniTrendChart = createMiniLineChart('chart-mini-trend', {
    labels,
    values
  });
}

/**
 * Render recent events list
 */
function renderRecentEvents() {
  const store = getStore();
  const eventsList = document.getElementById('recent-events-list');
  
  if (!eventsList) return;
  
  // Get recent 5 events
  const recentEvents = store.events.slice(0, 5);
  
  if (recentEvents.length === 0) {
    eventsList.innerHTML = `
      <li class="event-list__empty">
        <span class="empty-icon">🌑</span>
        <p>尚无荒谬记录</p>
        <p class="text-secondary">点击上方按钮开始记录</p>
      </li>
    `;
    return;
  }
  
  const levelIcons = {
    basic: '⚡',
    combo: '🔗',
    rare: '💎',
    epic: '🔥'
  };
  
  eventsList.innerHTML = recentEvents.map(event => `
    <li class="event-item event-item--${event.level}">
      <span class="event-item__icon">${levelIcons[event.level] || '⚡'}</span>
      <div class="event-item__info">
        <span class="event-item__title">${escapeHTML(event.title)}</span>
        <span class="event-item__time">${relativeTime(event.timestamp)}</span>
      </div>
      <span class="event-item__score">+${event.score}</span>
    </li>
  `).join('');
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initDashboard,
    updateDashboard,
    renderTotalScore,
    renderLevel,
    renderMiniTrend,
    renderRecentEvents
  };
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls js/`
Expected: `dashboard.js` exists

- [ ] **Step 3: Commit**

```bash
git add js/dashboard.js
git commit -m "feat: add dashboard module with score animation and charts"
```

---

## Task 15: Record Module (record.js)

**Files:**
- Create: `js/record.js`

- [ ] **Step 1: Create record module**

```javascript
// record.js - Event Recording Module

/**
 * Initialize record module
 */
function initRecord() {
  setupAIAnalysis();
  setupQuickEvents();
}

/**
 * Setup AI analysis functionality
 */
function setupAIAnalysis() {
  const analyzeBtn = document.getElementById('btn-ai-analyze');
  const confirmBtn = document.getElementById('btn-confirm-ai');
  const retryBtn = document.getElementById('btn-retry-ai');
  
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', handleAIAnalyze);
  }
  
  if (confirmBtn) {
    confirmBtn.addEventListener('click', handleConfirmAI);
  }
  
  if (retryBtn) {
    retryBtn.addEventListener('click', handleRetryAI);
  }
}

/**
 * Setup quick event buttons
 */
function setupQuickEvents() {
  const quickEventBtns = document.querySelectorAll('.quick-event-btn');
  
  quickEventBtns.forEach(btn => {
    btn.addEventListener('click', () => handleQuickEvent(btn));
  });
}

/**
 * Handle AI analysis button click
 */
async function handleAIAnalyze() {
  const input = document.getElementById('record-ai-input');
  const analyzeBtn = document.getElementById('btn-ai-analyze');
  const preview = document.getElementById('ai-result-preview');
  
  if (!input || !analyzeBtn || !preview) return;
  
  const description = input.value.trim();
  
  if (!description) {
    showToast('请输入事件描述', 'warning');
    return;
  }
  
  // Show loading state
  analyzeBtn.disabled = true;
  analyzeBtn.querySelector('.btn__text').textContent = 'ANALYZING...';
  
  try {
    const result = await analyzeEvent(description);
    showAIPreview(result, description);
  } catch (error) {
    console.error('AI analysis failed:', error);
    showToast('AI 分析失败，请重试或使用快捷记录', 'error');
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.querySelector('.btn__text').textContent = 'AI 分析';
  }
}

/**
 * Show AI analysis preview
 * @param {Object} result - Analysis result
 * @param {string} description - Original description
 */
function showAIPreview(result, description) {
  const preview = document.getElementById('ai-result-preview');
  const levelBadge = document.getElementById('ai-result-level');
  const scoreBadge = document.getElementById('ai-result-score');
  const titleElement = document.getElementById('ai-result-title');
  const commentElement = document.getElementById('ai-result-comment');
  const achievementSection = document.getElementById('ai-result-achievement');
  const achievementEmoji = document.getElementById('ai-result-achievement-emoji');
  const achievementName = document.getElementById('ai-result-achievement-name');
  const achievementDesc = document.getElementById('ai-result-achievement-desc');
  
  if (!preview) return;
  
  // Store result for confirmation
  preview.dataset.result = JSON.stringify(result);
  preview.dataset.description = description;
  
  // Update preview content
  if (levelBadge) {
    levelBadge.textContent = result.level.toUpperCase();
    levelBadge.className = `badge badge--${result.level}`;
  }
  
  if (scoreBadge) {
    scoreBadge.textContent = `+${result.score}`;
  }
  
  if (titleElement) {
    titleElement.textContent = result.title;
  }
  
  if (commentElement) {
    commentElement.textContent = result.comment;
  }
  
  // Show achievement if exists
  if (achievementSection) {
    if (result.achievement) {
      achievementSection.classList.remove('hidden');
      if (achievementEmoji) achievementEmoji.textContent = result.achievement_emoji || '🏆';
      if (achievementName) achievementName.textContent = result.achievement;
      if (achievementDesc) achievementDesc.textContent = result.achievement_desc || '';
    } else {
      achievementSection.classList.add('hidden');
    }
  }
  
  // Show preview
  preview.classList.remove('hidden');
}

/**
 * Handle confirm AI result
 */
function handleConfirmAI() {
  const preview = document.getElementById('ai-result-preview');
  
  if (!preview) return;
  
  const result = JSON.parse(preview.dataset.result);
  const description = preview.dataset.description;
  
  // Create event data
  const eventData = {
    level: result.level,
    score: result.score,
    title: result.title,
    description: description,
    achievement: result.achievement ? {
      name: result.achievement,
      desc: result.achievement_desc,
      emoji: result.achievement_emoji || '🏆'
    } : null,
    aiComment: result.comment
  };
  
  // Save event
  confirmEvent(eventData);
  
  // Reset form
  resetRecordForm();
}

/**
 * Handle retry AI analysis
 */
function handleRetryAI() {
  const preview = document.getElementById('ai-result-preview');
  if (preview) {
    preview.classList.add('hidden');
  }
  
  // Focus on input
  const input = document.getElementById('record-ai-input');
  if (input) {
    input.focus();
  }
}

/**
 * Handle quick event button click
 * @param {HTMLElement} btn - Button element
 */
async function handleQuickEvent(btn) {
  const level = btn.dataset.level;
  const score = parseInt(btn.dataset.score);
  const description = btn.dataset.desc;
  
  let achievement = null;
  
  // Try to generate achievement with AI
  if (isAIAvailable()) {
    try {
      achievement = await generateAchievement(level, description);
    } catch (error) {
      console.error('AI achievement generation failed:', error);
    }
  }
  
  // Use fallback if AI failed or unavailable
  if (!achievement) {
    achievement = getFallbackAchievement(level);
  }
  
  // Create event data
  const eventData = {
    level: level,
    score: score,
    title: description,
    description: description,
    achievement: achievement,
    aiComment: null
  };
  
  // Show confirmation modal
  showEventConfirmation(eventData);
}

/**
 * Show event confirmation modal
 * @param {Object} eventData - Event data
 */
function showEventConfirmation(eventData) {
  const levelIcons = {
    basic: '⚡',
    combo: '🔗',
    rare: '💎',
    epic: '🔥'
  };
  
  const bodyHTML = `
    <div class="ai-preview">
      <div class="ai-preview__header">
        <span class="badge badge--${eventData.level}">${eventData.level.toUpperCase()}</span>
        <span class="score-badge">+${eventData.score}</span>
      </div>
      <h4 class="ai-preview__title">${escapeHTML(eventData.title)}</h4>
      ${eventData.achievement ? `
        <div class="ai-preview__achievement">
          <span class="achievement-icon">${eventData.achievement.emoji || '🏆'}</span>
          <div>
            <p class="achievement-name">${escapeHTML(eventData.achievement.name)}</p>
            <p class="achievement-desc">${escapeHTML(eventData.achievement.desc)}</p>
          </div>
        </div>
      ` : ''}
    </div>
  `;
  
  showModal('确认记录', bodyHTML, [
    {
      text: '确认提交',
      class: 'btn--primary',
      onclick: () => {
        confirmEvent(eventData);
        hideModal();
      }
    },
    {
      text: '取消',
      class: 'btn--ghost',
      onclick: () => hideModal()
    }
  ]);
}

/**
 * Confirm and save event
 * @param {Object} eventData - Event data
 */
function confirmEvent(eventData) {
  const event = addEvent(eventData);
  
  showToast(`荒谬事件已记录 +${event.score} 分`, 'success');
  
  // Check for level name change probability
  checkLevelNameChange(event.score);
  
  // Update dashboard if visible
  if (document.getElementById('page-dashboard').classList.contains('page--active')) {
    updateDashboard();
  }
}

/**
 * Check if level name should change
 * @param {number} scoreAdded - Score added
 */
function checkLevelNameChange(scoreAdded) {
  const store = getStore();
  
  // Calculate change probability
  let probability;
  if (store.level.stage === 4) {
    probability = 0.6; // 60% for final stage
  } else {
    const stageThresholds = [0, 50, 200, 500];
    const nextStageMin = stageThresholds[store.level.stage];
    const remaining = nextStageMin - store.level.totalScore;
    probability = scoreAdded / remaining;
  }
  
  // Random check
  if (Math.random() < probability) {
    triggerLevelNameChange();
  }
}

/**
 * Trigger level name change
 */
async function triggerLevelNameChange() {
  const store = getStore();
  
  try {
    let newTitle;
    if (isAIAvailable()) {
      newTitle = await generateLevelName(store.level.totalScore, store.level.stage);
    } else {
      newTitle = getFallbackLevelName(store.level.stage);
    }
    
    // Update store
    store.level.currentTitle = newTitle;
    store.level.titleHistory.push({
      title: newTitle,
      changedAt: new Date().toISOString()
    });
    
    saveStore();
    
    showToast(`等级称号已更新: ${newTitle}`, 'info');
    
    // Update dashboard
    if (document.getElementById('page-dashboard').classList.contains('page--active')) {
      renderLevel();
    }
  } catch (error) {
    console.error('Level name change failed:', error);
  }
}

/**
 * Reset record form
 */
function resetRecordForm() {
  const input = document.getElementById('record-ai-input');
  const preview = document.getElementById('ai-result-preview');
  
  if (input) {
    input.value = '';
  }
  
  if (preview) {
    preview.classList.add('hidden');
  }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initRecord,
    handleAIAnalyze,
    handleQuickEvent,
    confirmEvent,
    resetRecordForm
  };
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls js/`
Expected: `record.js` exists

- [ ] **Step 3: Commit**

```bash
git add js/record.js
git commit -m "feat: add record module with AI analysis and quick events"
```

---

## Task 16: Achievements Module (achievements.js)

**Files:**
- Create: `js/achievements.js`

- [ ] **Step 1: Create achievements module**

```javascript
// achievements.js - Achievements Module

/**
 * Initialize achievements page
 */
function initAchievements() {
  renderAchievements();
}

/**
 * Render achievements grid
 */
function renderAchievements() {
  const store = getStore();
  const grid = document.getElementById('achievements-grid');
  const countElement = document.getElementById('achievements-count');
  
  if (!grid) return;
  
  // Update count
  if (countElement) {
    countElement.textContent = store.achievements.length;
  }
  
  // Check if empty
  if (store.achievements.length === 0) {
    grid.innerHTML = `
      <div class="achievements-grid__empty">
        <span class="empty-icon">🔒</span>
        <p>尚无成就解锁</p>
        <p class="text-secondary">去记录一些荒谬事件吧！</p>
      </div>
    `;
    return;
  }
  
  // Sort achievements by unlock time (newest first)
  const sortedAchievements = [...store.achievements].sort(
    (a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt)
  );
  
  // Render achievements
  grid.innerHTML = sortedAchievements.map(achievement => `
    <div class="achievement-card achievement-card--${achievement.rarity}">
      <div class="achievement-card__rarity-badge">${getRarityLabel(achievement.rarity)}</div>
      <span class="achievement-card__emoji">${achievement.emoji || '🏆'}</span>
      <h4 class="achievement-card__name">${escapeHTML(achievement.name)}</h4>
      <p class="achievement-card__desc">${escapeHTML(achievement.description)}</p>
      <time class="achievement-card__time">${formatDate(achievement.unlockedAt)}</time>
    </div>
  `).join('');
}

/**
 * Get rarity label in Chinese
 * @param {string} rarity - Rarity level
 * @returns {string} Chinese label
 */
function getRarityLabel(rarity) {
  const labels = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  };
  
  return labels[rarity] || '普通';
}

/**
 * Add achievement to display
 * @param {Object} achievement - Achievement data
 */
function addAchievementToDisplay(achievement) {
  const store = getStore();
  store.achievements.push(achievement);
  
  // Re-render if on achievements page
  if (document.getElementById('page-achievements').classList.contains('page--active')) {
    renderAchievements();
  }
}

/**
 * Get achievement statistics
 * @returns {Object} Achievement stats
 */
function getAchievementStats() {
  const store = getStore();
  
  const stats = {
    total: store.achievements.length,
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0
  };
  
  store.achievements.forEach(achievement => {
    if (stats.hasOwnProperty(achievement.rarity)) {
      stats[achievement.rarity]++;
    }
  });
  
  return stats;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initAchievements,
    renderAchievements,
    addAchievementToDisplay,
    getAchievementStats
  };
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls js/`
Expected: `achievements.js` exists

- [ ] **Step 3: Commit**

```bash
git add js/achievements.js
git commit -m "feat: add achievements module with rarity system"
```

---

## Task 17: Report Module (report.js)

**Files:**
- Create: `js/report.js`

- [ ] **Step 1: Create report module**

```javascript
// report.js - Weekly Report Module

let reportTrendChart = null;
let reportDistributionChart = null;

/**
 * Initialize report page
 */
function initReport() {
  setupReportControls();
  generateReport();
}

/**
 * Setup report controls
 */
function setupReportControls() {
  const weekSelector = document.getElementById('report-week-selector');
  const exportBtn = document.getElementById('btn-export-report');
  
  if (weekSelector) {
    populateWeekSelector();
    weekSelector.addEventListener('change', handleWeekChange);
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', exportAsImage);
  }
}

/**
 * Populate week selector with options
 */
function populateWeekSelector() {
  const weekSelector = document.getElementById('report-week-selector');
  if (!weekSelector) return;
  
  // Clear existing options
  weekSelector.innerHTML = '<option value="current">本周</option>';
  
  // Add last 4 weeks
  for (let i = 1; i <= 4; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    const { weekStart, weekEnd } = getWeekRange(date);
    
    const option = document.createElement('option');
    option.value = weekStart.toISOString();
    option.textContent = `${formatDate(weekStart.toISOString())} — ${formatDate(weekEnd.toISOString())}`;
    weekSelector.appendChild(option);
  }
}

/**
 * Handle week selection change
 */
function handleWeekChange() {
  const weekSelector = document.getElementById('report-week-selector');
  if (!weekSelector) return;
  
  if (weekSelector.value === 'current') {
    generateReport();
  } else {
    const weekStart = new Date(weekSelector.value);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    generateReport(weekStart, weekEnd);
  }
}

/**
 * Generate report for specified week
 * @param {Date} weekStart - Week start date
 * @param {Date} weekEnd - Week end date
 */
function generateReport(weekStart, weekEnd) {
  if (!weekStart || !weekEnd) {
    const range = getWeekRange();
    weekStart = range.weekStart;
    weekEnd = range.weekEnd;
  }
  
  const stats = getWeeklyStats(weekStart, weekEnd);
  
  renderReportHeader(weekStart, weekEnd);
  renderReportStats(stats);
  renderReportCharts(stats);
  renderTopEvents(stats.topEvents);
  renderNewAchievements(stats.newAchievements);
}

/**
 * Render report header
 * @param {Date} weekStart - Week start date
 * @param {Date} weekEnd - Week end date
 */
function renderReportHeader(weekStart, weekEnd) {
  const dateRangeElement = document.getElementById('report-date-range');
  if (!dateRangeElement) return;
  
  dateRangeElement.textContent = `${formatDate(weekStart.toISOString())} — ${formatDate(weekEnd.toISOString())}`;
}

/**
 * Render report statistics
 * @param {Object} stats - Weekly statistics
 */
function renderReportStats(stats) {
  const weekScoreElement = document.getElementById('report-week-score');
  const weekDeltaElement = document.getElementById('report-week-delta');
  const eventCountElement = document.getElementById('report-event-count');
  const newAchievementsElement = document.getElementById('report-new-achievements');
  
  if (weekScoreElement) {
    weekScoreElement.textContent = formatNumber(stats.totalScore);
  }
  
  if (weekDeltaElement) {
    // Calculate delta from previous week
    const store = getStore();
    const currentWeekIndex = store.weeklyReports.length;
    
    if (currentWeekIndex > 0) {
      const previousReport = store.weeklyReports[currentWeekIndex - 1];
      const delta = stats.totalScore - previousReport.totalScore;
      const percentage = previousReport.totalScore > 0 
        ? Math.round((delta / previousReport.totalScore) * 100)
        : 0;
      
      if (delta > 0) {
        weekDeltaElement.textContent = `↑ ${percentage}%`;
        weekDeltaElement.className = 'report-stat-card__delta report-stat-card__delta--up';
      } else if (delta < 0) {
        weekDeltaElement.textContent = `↓ ${Math.abs(percentage)}%`;
        weekDeltaElement.className = 'report-stat-card__delta report-stat-card__delta--down';
      } else {
        weekDeltaElement.textContent = '—';
        weekDeltaElement.className = 'report-stat-card__delta';
      }
    } else {
      weekDeltaElement.textContent = '—';
    }
  }
  
  if (eventCountElement) {
    eventCountElement.textContent = stats.eventCount;
  }
  
  if (newAchievementsElement) {
    newAchievementsElement.textContent = stats.newAchievements.length;
  }
}

/**
 * Render report charts
 * @param {Object} stats - Weekly statistics
 */
function renderReportCharts(stats) {
  // Destroy existing charts
  destroyChart(reportTrendChart);
  destroyChart(reportDistributionChart);
  
  // Create trend chart
  const trendLabels = stats.dailyTrend.map(day => {
    const date = new Date(day.date);
    return ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
  });
  
  reportTrendChart = createTrendLineChart('chart-report-trend', {
    labels: trendLabels,
    values: stats.dailyTrend.map(day => day.score)
  });
  
  // Create distribution chart
  reportDistributionChart = createDistributionChart('chart-report-distribution', stats.levelDistribution);
}

/**
 * Render top events
 * @param {Array} topEvents - Top events array
 */
function renderTopEvents(topEvents) {
  const topEventsElement = document.getElementById('report-top-events');
  if (!topEventsElement) return;
  
  if (topEvents.length === 0) {
    topEventsElement.innerHTML = '<li class="report-top-events__empty">本周暂无记录</li>';
    return;
  }
  
  topEventsElement.innerHTML = topEvents.map((event, index) => `
    <li class="report-top-event">
      <span class="report-top-event__rank">#${index + 1}</span>
      <span class="report-top-event__title">${escapeHTML(event.title)}</span>
      <span class="report-top-event__score badge badge--${event.level}">+${event.score}</span>
    </li>
  `).join('');
}

/**
 * Render new achievements
 * @param {Array} newAchievements - New achievements array
 */
function renderNewAchievements(newAchievements) {
  const achievementsElement = document.getElementById('report-achievements-list');
  if (!achievementsElement) return;
  
  if (newAchievements.length === 0) {
    achievementsElement.innerHTML = '<p class="report-achievements__empty">本周暂无新成就</p>';
    return;
  }
  
  achievementsElement.innerHTML = newAchievements.map(achievement => `
    <div class="report-achievement">
      <span class="report-achievement__emoji">${achievement.emoji || '🏆'}</span>
      <span class="report-achievement__name">${escapeHTML(achievement.name)}</span>
    </div>
  `).join('');
}

/**
 * Export report as image
 */
async function exportAsImage() {
  const reportContent = document.getElementById('report-content');
  const exportBtn = document.getElementById('btn-export-report');
  
  if (!reportContent || !exportBtn) return;
  
  // Show loading state
  exportBtn.disabled = true;
  exportBtn.querySelector('.btn__text').textContent = '导出中...';
  
  try {
    const canvas = await html2canvas(reportContent, {
      backgroundColor: '#0a0a0f',
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    // Create download link
    const link = document.createElement('a');
    link.download = `荒谬周报_${formatDate(new Date().toISOString()).replace(/[.:]/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showToast('周报已导出为图片', 'success');
  } catch (error) {
    console.error('Export failed:', error);
    showToast('导出失败，请重试', 'error');
  } finally {
    exportBtn.disabled = false;
    exportBtn.querySelector('.btn__text').textContent = '导出为图片';
  }
}

/**
 * Save weekly report to history
 */
function saveWeeklyReport() {
  const { weekStart, weekEnd } = getWeekRange();
  const stats = getWeeklyStats(weekStart, weekEnd);
  
  const store = getStore();
  
  // Check if report already exists for this week
  const existingIndex = store.weeklyReports.findIndex(report => {
    const reportStart = new Date(report.weekStart);
    return reportStart.getTime() === weekStart.getTime();
  });
  
  const reportData = {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    totalScore: stats.totalScore,
    eventCount: stats.eventCount,
    topEvents: stats.topEvents,
    newAchievements: stats.newAchievements
  };
  
  if (existingIndex >= 0) {
    // Update existing report
    store.weeklyReports[existingIndex] = reportData;
  } else {
    // Add new report
    store.weeklyReports.push(reportData);
  }
  
  saveStore();
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initReport,
    generateReport,
    exportAsImage,
    saveWeeklyReport
  };
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls js/`
Expected: `report.js` exists

- [ ] **Step 3: Commit**

```bash
git add js/report.js
git commit -m "feat: add report module with charts and image export"
```

---

## Task 18: Settings Module (settings.js)

**Files:**
- Create: `js/settings.js`

- [ ] **Step 1: Create settings module**

```javascript
// settings.js - Settings Module

/**
 * Initialize settings page
 */
function initSettings() {
  setupSettingsForm();
  setupPromptEditor();
  setupDataManagement();
  loadSettings();
}

/**
 * Setup settings form
 */
function setupSettingsForm() {
  const testBtn = document.getElementById('btn-test-connection');
  
  if (testBtn) {
    testBtn.addEventListener('click', testConnection);
  }
}

/**
 * Setup prompt editor
 */
function setupPromptEditor() {
  const saveBtn = document.getElementById('btn-save-prompts');
  const resetBtns = document.querySelectorAll('[data-reset-prompt]');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', savePrompts);
  }
  
  resetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const promptKey = btn.dataset.resetPrompt;
      resetPrompt(promptKey);
    });
  });
}

/**
 * Setup data management buttons
 */
function setupDataManagement() {
  const exportBtn = document.getElementById('btn-export-data');
  const importBtn = document.getElementById('btn-import-data');
  const clearBtn = document.getElementById('btn-clear-data');
  const importInput = document.getElementById('import-file-input');
  
  if (exportBtn) {
    exportBtn.addEventListener('click', handleExport);
  }
  
  if (importBtn) {
    importBtn.addEventListener('click', () => importInput?.click());
  }
  
  if (importInput) {
    importInput.addEventListener('change', handleImport);
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', handleClear);
  }
}

/**
 * Load settings from store
 */
function loadSettings() {
  const store = getStore();
  const config = store.aiConfig;
  
  // Load AI config
  const apiUrlInput = document.getElementById('setting-api-url');
  const apiKeyInput = document.getElementById('setting-api-key');
  const modelInput = document.getElementById('setting-model');
  
  if (apiUrlInput) apiUrlInput.value = config.baseUrl || '';
  if (apiKeyInput) apiKeyInput.value = config.apiKey || '';
  if (modelInput) modelInput.value = config.model || 'gpt-3.5-turbo';
  
  // Load prompts
  const eventAnalysisTextarea = document.getElementById('prompt-event-analysis');
  const achievementGenTextarea = document.getElementById('prompt-achievement-gen');
  const levelNamingTextarea = document.getElementById('prompt-level-naming');
  
  if (eventAnalysisTextarea) eventAnalysisTextarea.value = config.prompts.eventAnalysis || '';
  if (achievementGenTextarea) achievementGenTextarea.value = config.prompts.achievementGen || '';
  if (levelNamingTextarea) levelNamingTextarea.value = config.prompts.levelNaming || '';
}

/**
 * Save AI configuration
 */
function saveAIConfig() {
  const store = getStore();
  
  const apiUrlInput = document.getElementById('setting-api-url');
  const apiKeyInput = document.getElementById('setting-api-key');
  const modelInput = document.getElementById('setting-model');
  
  if (apiUrlInput) store.aiConfig.baseUrl = apiUrlInput.value.trim();
  if (apiKeyInput) store.aiConfig.apiKey = apiKeyInput.value.trim();
  if (modelInput) store.aiConfig.model = modelInput.value.trim() || 'gpt-3.5-turbo';
  
  saveStore();
  showToast('AI 配置已保存', 'success');
}

/**
 * Save prompts
 */
function savePrompts() {
  const store = getStore();
  
  const eventAnalysisTextarea = document.getElementById('prompt-event-analysis');
  const achievementGenTextarea = document.getElementById('prompt-achievement-gen');
  const levelNamingTextarea = document.getElementById('prompt-level-naming');
  
  if (eventAnalysisTextarea) {
    store.aiConfig.prompts.eventAnalysis = eventAnalysisTextarea.value;
  }
  
  if (achievementGenTextarea) {
    store.aiConfig.prompts.achievementGen = achievementGenTextarea.value;
  }
  
  if (levelNamingTextarea) {
    store.aiConfig.prompts.levelNaming = levelNamingTextarea.value;
  }
  
  saveStore();
  showToast('提示词已保存', 'success');
}

/**
 * Reset prompt to default
 * @param {string} promptKey - Prompt key to reset
 */
function resetPrompt(promptKey) {
  const store = getStore();
  
  const defaultPrompts = {
    eventAnalysis: `你是一个荒谬事件分析专家。用户会描述一个职场中遇到的荒谬事件。
请分析并返回 JSON 格式：
{
  "level": "basic|combo|rare|epic",
  "score": 数字,
  "title": "事件标题（简洁幽默）",
  "achievement": "成就名称（如果值得一个成就的话）",
  "achievement_desc": "成就描述",
  "comment": "一句毒舌点评"
}`,
    achievementGen: `你是一个成就系统设计师，风格是赛博朋克+黑色幽默。
根据以下荒谬事件，生成一个有趣的成就：
事件等级：{level}，事件描述：{description}
返回 JSON：{ "name": "成就名称", "desc": "成就描述", "emoji": "一个合适的emoji" }`,
    levelNaming: `你是一个赛博朋克世界的命名大师。
当前用户荒谬积分：{score}，所处阶段：{stage}（共4阶段）。
请生成一个有趣的、带有讽刺意味的等级称号，风格参考：形式主义实习生、流程卷王、官僚主义大师。
只返回称号本身，不要其他内容。`
  };
  
  if (defaultPrompts[promptKey]) {
    store.aiConfig.prompts[promptKey] = defaultPrompts[promptKey];
    saveStore();
    
    // Update textarea
    const textareaId = `prompt-${promptKey.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    const textarea = document.getElementById(textareaId);
    if (textarea) {
      textarea.value = defaultPrompts[promptKey];
    }
    
    showToast('提示词已恢复默认', 'info');
  }
}

/**
 * Test AI connection
 */
async function testConnection() {
  const testBtn = document.getElementById('btn-test-connection');
  const statusElement = document.getElementById('connection-status');
  
  if (!testBtn || !statusElement) return;
  
  // Save config first
  saveAIConfig();
  
  // Show loading state
  testBtn.disabled = true;
  testBtn.querySelector('.btn__text').textContent = '测试中...';
  statusElement.textContent = '';
  statusElement.className = 'connection-status';
  
  try {
    const result = await testConnection();
    
    if (result.success) {
      statusElement.textContent = '✓ 连接成功';
      statusElement.className = 'connection-status connection-status--success';
    } else {
      statusElement.textContent = `✗ ${result.message}`;
      statusElement.className = 'connection-status connection-status--error';
    }
  } catch (error) {
    statusElement.textContent = `✗ ${error.message}`;
    statusElement.className = 'connection-status connection-status--error';
  } finally {
    testBtn.disabled = false;
    testBtn.querySelector('.btn__text').textContent = '测试连接';
  }
}

/**
 * Handle data export
 */
function handleExport() {
  const data = exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.download = `荒谬指数_${formatDate(new Date().toISOString()).replace(/[.:]/g, '-')}.json`;
  link.href = url;
  link.click();
  
  URL.revokeObjectURL(url);
  showToast('数据已导出', 'success');
}

/**
 * Handle data import
 * @param {Event} event - Input change event
 */
function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const success = importData(e.target.result, false);
    
    if (success) {
      showToast('数据已导入', 'success');
      loadSettings(); // Reload settings
      
      // Update dashboard if visible
      if (document.getElementById('page-dashboard').classList.contains('page--active')) {
        updateDashboard();
      }
    } else {
      showToast('导入失败，请检查文件格式', 'error');
    }
  };
  
  reader.onerror = function() {
    showToast('读取文件失败', 'error');
  };
  
  reader.readAsText(file);
  
  // Reset input
  event.target.value = '';
}

/**
 * Handle data clear
 */
function handleClear() {
  showModal(
    '确认清空数据',
    '<p>此操作将清空所有数据，包括事件记录、成就、等级和配置。</p><p><strong>此操作不可撤销！</strong></p>',
    [
      {
        text: '确认清空',
        class: 'btn--danger',
        onclick: () => {
          clearData();
          loadSettings();
          hideModal();
          showToast('所有数据已清空', 'info');
          
          // Update dashboard if visible
          if (document.getElementById('page-dashboard').classList.contains('page--active')) {
            updateDashboard();
          }
        }
      },
      {
        text: '取消',
        class: 'btn--ghost',
        onclick: () => hideModal()
      }
    ]
  );
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initSettings,
    loadSettings,
    saveAIConfig,
    savePrompts,
    resetPrompt,
    testConnection,
    handleExport,
    handleImport,
    handleClear
  };
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls js/`
Expected: `settings.js` exists

- [ ] **Step 3: Commit**

```bash
git add js/settings.js
git commit -m "feat: add settings module with AI config and data management"
```

---

## Task 19: Application Entry Point (app.js)

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: Create application entry point**

```javascript
// app.js - Application Entry Point

// Global state
let currentPage = 'dashboard';

/**
 * Initialize application
 */
function initApp() {
  // Initialize all modules
  initDashboard();
  initRecord();
  initAchievements();
  initReport();
  initSettings();
  
  // Setup navigation
  setupNavigation();
  
  // Setup quick record button
  setupQuickRecord();
  
  // Setup modal
  setupModal();
  
  // Navigate to initial page
  navigateTo('dashboard');
  
  console.log('ABSURDITY INDEX // 荒谬指数 - 系统已启动');
}

/**
 * Setup navigation
 */
function setupNavigation() {
  const navLinks = document.querySelectorAll('.sidebar__link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      navigateTo(page);
    });
  });
  
  // Handle hash change
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && hash !== currentPage) {
      navigateTo(hash);
    }
  });
}

/**
 * Navigate to specified page
 * @param {string} pageName - Page name
 */
function navigateTo(pageName) {
  // Update current page
  currentPage = pageName;
  
  // Update hash
  window.location.hash = pageName;
  
  // Update navigation active state
  const navLinks = document.querySelectorAll('.sidebar__link');
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageName);
  });
  
  // Update page visibility
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.classList.toggle('page--active', page.dataset.page === pageName);
  });
  
  // Refresh page content
  refreshPage(pageName);
}

/**
 * Refresh page content
 * @param {string} pageName - Page name
 */
function refreshPage(pageName) {
  switch (pageName) {
    case 'dashboard':
      updateDashboard();
      break;
    case 'record':
      resetRecordForm();
      break;
    case 'achievements':
      renderAchievements();
      break;
    case 'report':
      generateReport();
      break;
    case 'settings':
      loadSettings();
      break;
  }
}

/**
 * Setup quick record button
 */
function setupQuickRecord() {
  const quickRecordBtn = document.getElementById('btn-quick-record');
  
  if (quickRecordBtn) {
    quickRecordBtn.addEventListener('click', () => {
      navigateTo('record');
    });
  }
}

/**
 * Setup modal
 */
function setupModal() {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalCloseBtn = document.getElementById('btn-modal-close');
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        hideModal();
      }
    });
  }
  
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', hideModal);
  }
  
  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideModal();
    }
  });
}

/**
 * Show modal
 * @param {string} title - Modal title
 * @param {string} bodyHTML - Modal body HTML
 * @param {Array} buttons - Modal buttons
 */
function showModal(title, bodyHTML, buttons = []) {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');
  
  if (!modalOverlay || !modalTitle || !modalBody || !modalFooter) return;
  
  // Set content
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHTML;
  
  // Set buttons
  modalFooter.innerHTML = buttons.map(btn => `
    <button class="btn ${btn.class || ''}" type="button">
      ${btn.text}
    </button>
  `).join('');
  
  // Add event listeners
  const buttonElements = modalFooter.querySelectorAll('.btn');
  buttonElements.forEach((btnElement, index) => {
    if (buttons[index]?.onclick) {
      btnElement.addEventListener('click', buttons[index].onclick);
    }
  });
  
  // Show modal
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

/**
 * Hide modal
 */
function hideModal() {
  const modalOverlay = document.getElementById('modal-overlay');
  
  if (modalOverlay) {
    modalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, info, warning)
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '⚠'
  };
  
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${icons[type] || 'ℹ'}</span>
    <span class="toast__message">${escapeHTML(message)}</span>
    <button class="toast__close" type="button">&times;</button>
  `;
  
  // Add close functionality
  const closeBtn = toast.querySelector('.toast__close');
  closeBtn.addEventListener('click', () => {
    toast.remove();
  });
  
  // Add to container
  container.appendChild(toast);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 3000);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initApp,
    navigateTo,
    showModal,
    hideModal,
    showToast,
    escapeHTML
  };
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls js/`
Expected: `app.js` exists

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: add application entry point with navigation and modal"
```

---

## Task 20: Favicon (favicon.svg)

**Files:**
- Create: `assets/favicon.svg`

- [ ] **Step 1: Create favicon**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="neonGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#39FF14;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00D4FF;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100" height="100" rx="20" fill="#0a0a0f"/>
  
  <!-- Outer ring -->
  <circle cx="50" cy="50" r="40" fill="none" stroke="url(#neonGreen)" stroke-width="3" filter="url(#glow)"/>
  
  <!-- Inner circle -->
  <circle cx="50" cy="50" r="30" fill="none" stroke="url(#neonGreen)" stroke-width="2" filter="url(#glow)"/>
  
  <!-- Exclamation mark -->
  <text x="50" y="65" font-family="Orbitron, sans-serif" font-size="40" font-weight="900" fill="url(#neonGreen)" text-anchor="middle" filter="url(#glow)">!</text>
  
  <!-- Decorative dots -->
  <circle cx="50" cy="20" r="3" fill="#39FF14" filter="url(#glow)"/>
  <circle cx="50" cy="80" r="3" fill="#00D4FF" filter="url(#glow)"/>
  <circle cx="20" cy="50" r="3" fill="#BF40BF" filter="url(#glow)"/>
  <circle cx="80" cy="50" r="3" fill="#FFD700" filter="url(#glow)"/>
</svg>
```

- [ ] **Step 2: Verify file creation**

Run: `ls assets/`
Expected: `favicon.svg` exists

- [ ] **Step 3: Commit**

```bash
git add assets/favicon.svg
git commit -m "feat: add favicon with cyberpunk neon design"
```

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-06-05-absurdity-index.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**