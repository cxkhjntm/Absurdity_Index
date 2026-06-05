# Chart.js 包装器设计文档

## 概述

为"荒谬指数"项目创建一个赛博朋克主题的Chart.js包装器，提供统一的图表配置和创建函数。

## 设计目标

1. **统一主题**：所有图表使用一致的赛博朋克视觉风格
2. **简单封装**：提供易于使用的函数接口
3. **响应式设计**：适配不同屏幕尺寸
4. **性能优化**：正确管理图表生命周期

## 颜色常量

```javascript
const CHART_COLORS = {
  // 主要霓虹色
  neonGreen: '#39FF14',
  neonBlue: '#00D4FF',
  neonPurple: '#BF40BF',
  neonGold: '#FFD700',
  
  // 背景色
  bgPrimary: '#0a0a0f',
  bgSecondary: '#12121a',
  bgCard: '#1a1a2e',
  
  // 文字色
  textPrimary: '#e0e0e0',
  textSecondary: '#888888',
  
  // 网格线色
  gridColor: 'rgba(255, 255, 255, 0.1)',
  
  // 事件等级色
  levelBasic: '#39FF14',
  levelCombo: '#00D4FF',
  levelRare: '#BF40BF',
  levelEpic: '#FFD700'
};
```

## 通用图表选项

```javascript
const COMMON_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(26, 26, 46, 0.9)',
      titleColor: '#e0e0e0',
      bodyColor: '#e0e0e0',
      borderColor: '#39FF14',
      borderWidth: 1,
      cornerRadius: 4,
      padding: 8
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false
      },
      ticks: {
        color: '#888888'
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false
      },
      ticks: {
        color: '#888888'
      }
    }
  }
};
```

## 图表函数

### 1. createMiniLineChart(canvasId, data)

**用途**：创建迷你折线图用于仪表盘

**参数**：
- `canvasId`：canvas元素的ID
- `data`：图表数据对象 `{ labels: [], values: [] }`

**配置特点**：
- 霓虹绿色线条
- 简化配置，无图例
- 响应式设计
- 自定义工具提示

### 2. createTrendLineChart(canvasId, data)

**用途**：创建趋势折线图用于周报

**参数**：
- `canvasId`：canvas元素的ID
- `data`：图表数据对象 `{ labels: [], values: [] }`

**配置特点**：
- 霓虹蓝色线条
- 完整配置，带图例
- 响应式设计
- 自定义工具提示

### 3. createDistributionChart(canvasId, data)

**用途**：创建分布环形图用于周报

**参数**：
- `canvasId`：canvas元素的ID
- `data`：图表数据对象 `{ labels: [], values: [] }`

**配置特点**：
- 使用四种霓虹色
- 中心显示总数
- 响应式设计
- 自定义工具提示

### 4. destroyChart(chart)

**用途**：销毁图表实例，释放内存

**参数**：
- `chart`：Chart.js实例

### 5. updateChart(chart, newData)

**用途**：更新图表数据，保持配置不变

**参数**：
- `chart`：Chart.js实例
- `newData`：新的数据对象

## 主题配置

### 暗色背景
- 主背景：`#0a0a0f`（深空黑）
- 次背景：`#12121a`（暗夜蓝黑）
- 卡片背景：`#1a1a2e`（星空灰）

### 霓虹色系
- 绿色：`#39FF14`（主强调色）
- 蓝色：`#00D4FF`（辅助色）
- 紫色：`#BF40BF`（次强调色）
- 金色：`#FFD700`（警告/史诗）

### 网格线
- 低透明度：`rgba(255, 255, 255, 0.1)`
- 无边框

### 工具提示
- 背景色：`rgba(26, 26, 46, 0.9)`
- 边框色：`#39FF14`
- 圆角：4px
- 内边距：8px

## 文件结构

```
js/
└── charts.js          # Chart.js包装器
```

## 依赖

- Chart.js（通过CDN引入）
- 项目CSS变量（用于颜色一致性）

## 使用示例

```javascript
// 创建迷你趋势图
const miniChart = createMiniLineChart('chart-mini-trend', {
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  values: [10, 15, 8, 20, 12, 5, 18]
});

// 创建趋势图
const trendChart = createTrendLineChart('chart-report-trend', {
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  values: [10, 15, 8, 20, 12, 5, 18]
});

// 创建分布图
const distributionChart = createDistributionChart('chart-report-distribution', {
  labels: ['BASIC', 'COMBO', 'RARE', 'EPIC'],
  values: [50, 30, 15, 5]
});

// 更新图表数据
updateChart(miniChart, {
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  values: [12, 18, 10, 25, 15, 8, 22]
});

// 销毁图表
destroyChart(miniChart);
```

## 验证计划

1. **功能验证**：
   - 验证所有图表函数正常工作
   - 验证图表响应式设计
   - 验证工具提示显示正确

2. **主题验证**：
   - 验证颜色符合赛博朋克主题
   - 验证网格线透明度
   - 验证工具提示样式

3. **性能验证**：
   - 验证图表销毁正确释放内存
   - 验证图表更新不造成内存泄漏

## 实现注意事项

1. **错误处理**：检查canvas元素是否存在
2. **内存管理**：正确销毁图表实例
3. **响应式设计**：使用`responsive: true`和`maintainAspectRatio: false`
4. **主题一致性**：使用项目CSS变量确保颜色一致