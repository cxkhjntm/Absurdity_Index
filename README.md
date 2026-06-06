# ABSURDITY INDEX // 荒谬指数

> 一个赛博朋克风格的个人荒谬事件追踪系统，把职场中的荒谬流程、重复劳动和形式主义操作，变成可记录、可评分、可回顾的游戏化体验。

## 项目简介

ABSURDITY INDEX 是一个纯前端、无需构建工具的单页应用。它支持记录荒谬事件、自动计算荒谬值、解锁成就、生成周报并导出图片，还可以接入 OpenAI 兼容 API，让事件分析、成就命名和等级称号带上 AI 风格的黑色幽默。

## 核心功能

- 仪表盘：查看荒谬总值、当前等级、本周趋势和最近事件。
- 记录事件：支持 AI 智能分析，也支持经典快捷事件一键记录。
- 成就殿堂：自动展示已解锁成就，并按普通、稀有、史诗、传说分级。
- 荒谬周报：按自然周统计数据，支持趋势图、分布图、TOP 事件和图片导出。
- 控制台：配置 AI 接口、编辑提示词、导入导出数据、清空本地记录。

## 技术栈

- HTML5
- Vanilla CSS
- Vanilla JavaScript
- localStorage
- Chart.js
- html2canvas
- OpenAI 兼容 API

## 快速开始

### 方式一：直接打开

1. 克隆或下载本仓库。
2. 直接用浏览器打开根目录下的 index.html。

### 方式二：本地静态服务器

如果你希望通过本地服务器访问，推荐使用 VS Code Live Server 或任意静态服务器。

## 初次使用建议

1. 先进入“控制台”页面，按需填写 API Base URL、API Key 和模型名称。
2. 如果不配置 AI，也可以直接使用快捷事件和本地记录功能。
3. 在“控制台”里可以导出、导入或清空本地数据。

## 数据说明

- 数据默认保存在浏览器 localStorage 中。
- 事件、成就、等级和周报都会随浏览器本地数据一起持久化。
- 通过“控制台”可以导出 JSON 备份，或者导入已有数据恢复。

## 项目结构

```
.
├── index.html
├── css/
├── js/
├── assets/
└── docs/
    └── project-introduction.md
```

## 文档

- English README: [README.en.md](README.en.md)
- Project introduction: [docs/project-introduction.md](docs/project-introduction.md)

## 说明

本项目的第三方图表与导出能力通过 CDN 引入，无需额外构建步骤。
