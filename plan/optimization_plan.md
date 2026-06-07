# 荒谬指数 (Absurdity Index) 项目分析与优化计划

## 1. 现状分析与 Bug 定位

经过对项目源码的全面审查，发现项目整体结构清晰，分层合理，但在**时间计算**、**数据展示**、**长时间停留时的状态同步**、**移动端响应式体验**以及**部分逻辑/性能细节**上存在若干隐藏问题。

### 1.1 时间计算 Bug：周日数据错乱
**位置：** `js/store.js` -> `getWeeklyStats(weeksAgo)`
**问题描述：**
在该方法中，计算“本周的周一”时使用了以下公式：
```javascript
startOfWeek.setDate(now.getDate() - now.getDay() + 1 - (weeksAgo * 7));
```
在 JavaScript 的 `Date` 对象中，`getDay()` 返回的周日为 `0`。这意味着如果今天是周日，计算过程将变为 `now.getDate() - 0 + 1`，将 `startOfWeek` 定位到了**明天的日期（即下周一）**。这会导致：
- 周日报表数据完全清空，因为时间范围被错误地切到了下周。
- 趋势图和周报在此期间会展示错误的数据或无数据。

**对比参考：**
项目中的 `js/utils.js` -> `_buildWeekRange` 正确处理了这一问题：
```javascript
const diffToMon = day === 0 ? -6 : 1 - day;
```

### 1.2 夏令时 (DST) 隐患与跨周计算错误
**位置：** `js/report.js` -> `generateReport(weeksAgo)` 和 `populateWeekSelector()`
**问题描述：**
1. 在计算“几周前”的时间时，直接使用了硬编码的毫秒数相减：
   ```javascript
   Date.now() - weeksAgo * 7 * 24 * 60 * 60 * 1000
   ```
   在某些存在夏令时 / 冬令时切换的时区，或者时差变化时，相差的一小时可能会导致时间戳跨越午夜边界，使得原本属于周一凌晨的事件被划入上周日。
2. 此外，`weeksSpan` 在 `populateWeekSelector` 中的计算：
   ```javascript
   const weeksSpan = Math.ceil((now - oldest) / msPerWeek);
   ```
   若 oldest 事件发生在昨晚（周日），今天（周一）查看时，距离未满 7 天，相减除以一周毫秒数结果小于 1，`Math.ceil` 得到 `1`。计算 `i = 1` 时通过 `Date.now() - i * msPerWeek` 得到的日期可能直接跳过了真正的上个自然周。

### 1.3 数据刷新与日期对齐问题
**问题描述：**
本项目是一个单页应用 (SPA)。目前只有在路由哈希改变 (`hashchange`) 或者手动点击侧边栏时才会触发 `refreshPage(pageName)`。如果用户在浏览器中长时间挂机（例如从周日晚上一直开到周一早晨）：
- 仪表盘和周报依旧保留在昨天的“本周”上下文中。
- 虽然新产生的记录会追加时间戳，但界面的图表（如 `dashboard` 中的 `miniChart`）和周报不会自动向前滚动一周。
- **确实有必要加入刷新机制以对齐日期。**

### 1.4 AI 配置被误删的 UX Bug (Settings/Store Bug)
**位置：** `js/settings.js` -> `handleClear()` 与 `js/store.js` -> `clearData()`
**问题描述：**
在控制台点击“清空所有数据”时，`clearData()` 会粗暴地将整个 store 覆盖为 `defaultData`。这将导致用户辛苦配置的 **AI API Key、Base URL 以及自定义提示词等全部丢失**。
**期望行为：** 清空数据应仅重置记录（events）、成就（achievements）和等级（level），而应当保留用户的系统配置（aiConfig）。

### 1.5 状态不一致 Bug：分数计算漂移 (State Inconsistency)
**位置：** `js/dashboard.js` 与 `js/record.js`
**问题描述：**
- `dashboard.js` 显示的“荒谬总值”是动态遍历所有存在的记录计算出来的（`_computeTotalScore`）。
- 但 `record.js` 在判断等级称号更新概率时，读取的是 `store.level.experience`（历史累计累加值）。
- 当用户在仪表盘**删除历史事件**（`deleteEvent`）时，`dashboard` 的总分会下降，但 `store.level.experience` 并没有随之扣减。这会导致显示出来的分数与系统底层用于计算概率的分数**脱节**。

### 1.6 渲染性能与 DOM 操作优化 (Performance Optimization)
**位置：** `js/achievements.js`
**问题描述：**
1. **O(M*N) 复杂度查询：** 在 `renderAchievements()` 内部循环渲染成就卡片时，为了生成来源描述(`sourceDesc`)，会调用 `(store.events || []).find(...)`。如果成就和事件数量较多，这里会产生 $O(M \times N)$ 的性能消耗。
2. **多次触发重排 (DOM Reflows)：** `checkAndUnlockAchievements` 内部如果在一次事件后解锁了多个成就，会多次调用 `addAchievementToDisplay`，进而多次触发 `renderAchievements()` 导致整个成就网格多次重绘。

### 1.7 移动端 UI 锁死陷阱：缺少侧边栏菜单切换按钮与逻辑
**位置：** `css/layout.css` 和 `js/app.js`
**问题描述：**
- 在 `layout.css` 的媒体查询 `@media screen and (max-width: 768px)` 中，侧边栏样式被设置为 `transform: translateX(-100%)` 以便在移动端隐藏，并提供了 `.sidebar.open` 样式用于展开：
  ```css
  .sidebar.open { transform: translateX(0); }
  ```
- 然而，`index.html` 的 `#top-bar` 区域**没有放置任何菜单汉堡包切换按钮**。
- 同时，`js/app.js` 中**没有任何控制 `.open` 类切换的代码**。
- 这导致在移动端（屏幕宽度 < 768px）时，侧边栏被彻底隐藏，用户无法点击侧边栏进行任何页面跳转，整个应用在移动端陷入功能闭环死锁。

### 1.8 隐藏图表渐变失效 Bug：Canvas 初始高度为 0
**位置：** `js/charts.js` -> `createMiniLineChart` 和 `createTrendLineChart`
**问题描述：**
- 图表渐变色是使用 Canvas 高度动态创建的：
  ```javascript
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  ```
- 可是，当应用初次加载时，只有默认页面是显示的，其他隐藏页面（例如 Report 或当初始哈希是 Settings 时的 Dashboard）其 `canvas` 所在容器的 `display` 为 `none`。
- 此时 `canvas.height` 计算结果为 `0`，导致创建出的渐变区域高度为 0 且坐标失效。当用户切回这些页面时，图表折线下方的填充色会变为纯色、黑色或完全消失，失去酷炫的视觉渐变效果。

### 1.9 图表中心文字重合与偏移 Bug：Legend 占据高度
**位置：** `js/charts.js` -> `createDistributionChart` (doughnut 图表)
**问题描述：**
- Doughnut 图表通过 `beforeDraw` 插件在圆环正中心绘制总数文字：
  ```javascript
  const centerX = width / 2;
  const centerY = height / 2;
  ```
- 实际上，由于 doughnut 图表下方配置了图例（`position: 'bottom'`），Chart.js 会动态将圆环整体向上推移以留出底部图例空间。
- 这样，canvas 的正中心点 `(width/2, height/2)` 已经不再是圆环的物理中心，导致绘制的 "总数" 和数字错位偏下，与圆环底部的彩带发生重合遮挡。

### 1.10 周报导出截图动画截断 Bug
**位置：** `js/report.js` -> `exportAsImage`
**问题描述：**
- `report.css` 中为周报内容设置了 staggered entry animation 动效（`report-content-enter`、`report-top-event-enter` 等），带有可观的 `animation-delay`。
- `html2canvas` 截图导出时会克隆 DOM 节点并在一瞬间内渲染截图。因为克隆节点在临时 document 中重新激活了 CSS 动画，而截图是瞬间完成的，`html2canvas` 会直接截取到子元素刚处于延迟状态（`opacity: 0` 或 `transform` 位移中）的半透明甚至空白画面。
- 此外，`report.js` 中虽然执行了 `els.content.classList.add('report-content--exporting')`，但是该样式类在 CSS 文件中**根本不存在**，并未起到取消动效的作用。

### 1.11 “荒谬周报读者”成就解锁条件错误
**位置：** `js/achievements.js` -> `checkAndUnlockAchievements`
**问题描述：**
- `'weekly-report'` （荒谬周报读者）成就的描述是：“查看你的第一份荒谬周报”。
- 然而其解锁检查条件被错误地写为：
  ```javascript
  { id: 'weekly-report',  condition: events.length >= 1 }
  ```
- 这导致用户在记录完第一个荒谬事件后，就会直接在其他页面解锁“周报读者”成就，根本不需要真正去查看周报。

### 1.12 缺失默认 API Base URL 导致配置死锁
**位置：** `js/store.js` -> `defaultData` 与 `js/ai.js` -> `isAIAvailable`
**问题描述：**
- 在默认的 store 数据模型中没有为 `aiConfig` 包含 `baseUrl` 字段。
- 即使 `index.html` 中 API URL 的输入框有 `placeholder="https://api.openai.com/v1"`，如果用户因为看到 placeholder 而选择不填写 API URL（直接提交 API Key 并期望其使用官方默认路径），`isAIAvailable` 将返回 `false`，从而导致 AI 助手提示“未配置”而无法使用。

### 1.13 提示词模板替换限制
**位置：** `js/ai.js` -> `generateAchievement` 和 `generateLevelName`
**问题描述：**
- 代码中使用 `prompt.replace('{level}', level)` 等方法替换模板。
- 原生 JavaScript `String.prototype.replace(string, string)` 只会替换**首个匹配项**。如果用户在自定义配置中多次使用相同的占位符，后面的部分将无法被成功替换。

---

## 2. 后续修改代码的计划

为全面修复这三轮分析中发现的所有 bug，建议按以下阶段化步骤实施修改：

### Phase 1: 修复核心时间计算与夏令时逻辑
1. **修正 `store.js` 中的周计算：**
   将 `getWeeklyStats` 中关于 `startOfWeek` 的计算修改为与 `utils.js` 统一的逻辑，处理周日为 `0` 的越界。
   ```javascript
   const day = now.getDay();
   const diffToMon = day === 0 ? -6 : 1 - day;
   startOfWeek.setDate(now.getDate() + diffToMon - (weeksAgo * 7));
   ```
2. **重构 `report.js` 中的时间偏移：**
   - 彻底停用硬编码的毫秒数相减。
   - 使用标准 Date 对象的 calendar 加减法：
     ```javascript
     const targetDate = new Date();
     targetDate.setDate(targetDate.getDate() - weeksAgo * 7);
     ```
   - 修复 `weeksSpan` 逻辑，以自然周为跨度确定历史列表项，避免 oldest 事件在临近的自然周转换中发生遗漏或错乱。

### Phase 2: 修复状态不一致与配置丢失 Bug
1. **保留 AI 配置：**
   - 修改 `store.js` 的 `clearData()` 方法，在覆盖为 `defaultData` 前先读取并备份当前的 `aiConfig`，重置后重新写回，防止清空数据时抹除 API Key 与提示词。
2. **统一分数计算 (SSOT)：**
   - 在 `deleteEvent` 中，除了剔除事件与级联删除成就外，应扣减等级经验值。建议废除 `store.level.experience` 的单独递增，统一通过动态汇总 `events` 中所有记录的分数来计算经验，实现单一真理源。

### Phase 3: 引入日期对齐与页面自动刷新
1. **智能同步与自动刷新：**
   - 在 `app.js` 中监听 `window` 的 `focus` 与 `visibilitychange` 事件。当用户切回标签页时，检测当前日期是否较上次激活时已跨天，若跨天则自动调用 `refreshPage(_currentPage)` 重算图表与本周边界。
2. **增加手动刷新入口：**
   - 在 `index.html` 的 `header#top-bar` 中新增一个【刷新同步】按钮（带赛博朋克旋转动效与 Neon 呼吸灯），支持手动拉取最新状态并弹窗 Toast 反馈。

### Phase 4: 移动端体验优化与 UI 锁死修复
1. **新增菜单切换按钮：**
   - 在 `index.html` 的 `#top-bar` 靠左位置，为移动端新增一个侧边栏切换汉堡包按钮 (`#btn-sidebar-toggle`)，仅在屏幕宽度 <= 768px 时可见。
2. **侧边栏展开/折叠交互逻辑：**
   - 在 `js/app.js` 中增加移动端侧边栏切换事件：点击菜单按钮时，为 `#sidebar` 切换 `.open` 类。
   - 用户在侧边栏中点击任意导航项跳转后，应自动关闭侧边栏（移除 `.open` 类），避免遮挡主界面内容。

### Phase 5: 图表特效及截图导出修复
1. **修复动态 Canvas 渐变：**
   - 修改 `charts.js`。不再使用固定的 `canvas.height` 创建静态 gradient，而是使用 Chart.js 数据集的背景色回调函数（`backgroundColor: (context) => { ... }`），从 context 中动态提取 `chart.chartArea`，在图表首次真正渲染/重绘时动态创建渐变，彻底解决隐藏页面初始化渐变失效的缺陷。
2. **修正 Doughnut 中心文字坐标：**
   - 修改 `charts.js` 中 doughnut 的 `beforeDraw` 插件。提取首个 Arc 元素的圆心坐标：
     ```javascript
     const meta = chart.getDatasetMeta(0);
     const arc = meta.data[0];
     const centerX = arc ? arc.x : width / 2;
     const centerY = arc ? arc.y : height / 2;
     ```
     以确保文字始终完美居中于圆环内空区域。
3. **消除 html2canvas 动画截图截断：**
   - 在 `css/report.css` 中明确写入 `.report-content--exporting` 类的控制逻辑：
     ```css
     .report-content--exporting,
     .report-content--exporting * {
       animation: none !important;
       transition: none !important;
       transform: none !important;
       opacity: 1 !important;
     }
     ```
     在导出图像的瞬间强行使所有元素立刻呈现 100% 最终渲染形态，告别截图中的白屏与透明残缺。

### Phase 6: 逻辑优化与系统鲁棒性微调
1. **修正“周报读者”解锁条件：**
   - 在 `store.js` 默认模型中增加 `hasReadReport: false` 字段。
   - 当用户成功导航到 `report` 界面时，触发 `store` 保存 `hasReadReport: true`。
   - 将 `achievements.js` 中的 `'weekly-report'` 解锁判定条件改为 `store.hasReadReport === true`。
2. **补充默认 Base URL 配置：**
   - 在 `store.js` 的 `defaultData.aiConfig` 中加入默认 `'https://api.openai.com/v1'`，保证即使只配置 Key 也可即装即用。
3. **全局占位符替换修复：**
   - 在 `ai.js` 中将模板的 `.replace()` 方法替换为正则全局匹配 `replace(/\{level\}/g, ...)`，支持多次配置占位符的场景。
4. **性能重构：**
   - 优化 `achievements.js` 的渲染性能，通过在循环外构建 Map 字典将事件查询复杂度从 $O(M \times N)$ 优化到 $O(M + N)$，并支持批量渲染，防止多次调用 `addAchievementToDisplay` 产生回流。

> **结论：** 此次分析追加了多项针对移动端布局死锁、Chart.js 特殊展示缺陷以及 html2canvas 渲染时效性的关键修正。落实此计划后，应用将在底层计算的严密性、UI 显示适配以及赛博朋克动效的精致度上达到极高的生产水准。
