'use strict';

const CHART_COLORS = {
  neonGreen: '#39FF14',
  neonBlue: '#00D4FF',
  neonPurple: '#BF40BF',
  neonGold: '#FFD700',
  bgPrimary: '#0a0a0f',
  bgSecondary: '#12121a',
  bgCard: '#1a1a2e',
  textPrimary: '#e0e0e0',
  textSecondary: '#888888',
  gridColor: 'rgba(255, 255, 255, 0.1)',
  levelBasic: '#39FF14',
  levelCombo: '#00D4FF',
  levelRare: '#BF40BF',
  levelEpic: '#FFD700'
};

const COMMON_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart'
  },
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
      padding: 8,
      titleFont: {
        family: "'JetBrains Mono', monospace",
        size: 12,
        weight: 'bold'
      },
      bodyFont: {
        family: "'Noto Sans SC', sans-serif",
        size: 11
      },
      callbacks: {
        label: function(context) {
          return ` ${context.dataset.label}: ${context.parsed.y}`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false
      },
      ticks: {
        color: '#888888',
        font: {
          family: "'JetBrains Mono', monospace",
          size: 10
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false
      },
      ticks: {
        color: '#888888',
        font: {
          family: "'JetBrains Mono', monospace",
          size: 10
        }
      },
      beginAtZero: true
    }
  }
};

function createMiniLineChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas element with id "${canvasId}" not found`);
    return null;
  }

  const ctx = canvas.getContext('2d');

  const config = {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: '荒谬值',
        data: data.values,
        borderColor: CHART_COLORS.neonGreen,
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(57, 255, 20, 0.3)');
          gradient.addColorStop(1, 'rgba(57, 255, 20, 0.0)');
          return gradient;
        },
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: CHART_COLORS.neonGreen,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2
      }]
    },
    options: {
      ...COMMON_OPTIONS,
      plugins: {
        ...COMMON_OPTIONS.plugins,
        legend: { display: false }
      },
      scales: {
        x: { ...COMMON_OPTIONS.scales.x, display: false },
        y: { ...COMMON_OPTIONS.scales.y, display: false }
      }
    }
  };

  return new Chart(ctx, config);
}

function createTrendLineChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas element with id "${canvasId}" not found`);
    return null;
  }

  const ctx = canvas.getContext('2d');

  const config = {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: '荒谬值趋势',
        data: data.values,
        borderColor: CHART_COLORS.neonBlue,
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(0, 212, 255, 0.0)');
          return gradient;
        },
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: CHART_COLORS.neonBlue,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: CHART_COLORS.neonBlue,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2
      }]
    },
    options: {
      ...COMMON_OPTIONS,
      plugins: {
        ...COMMON_OPTIONS.plugins,
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: CHART_COLORS.textPrimary,
            font: {
              family: "'JetBrains Mono', monospace",
              size: 11
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        }
      }
    }
  };

  return new Chart(ctx, config);
}

function createDistributionChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas element with id "${canvasId}" not found`);
    return null;
  }

  const ctx = canvas.getContext('2d');
  const total = data.values.reduce((sum, value) => sum + value, 0);

  const config = {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: [
          CHART_COLORS.levelBasic,
          CHART_COLORS.levelCombo,
          CHART_COLORS.levelRare,
          CHART_COLORS.levelEpic
        ],
        borderColor: CHART_COLORS.bgCard,
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      animation: {
        animateRotate: true,
        animateScale: true
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: CHART_COLORS.textPrimary,
            font: {
              family: "'JetBrains Mono', monospace",
              size: 11
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          ...COMMON_OPTIONS.plugins.tooltip,
          callbacks: {
            label: function(context) {
              const dataset = context.dataset.data;
              const currentTotal = dataset.reduce((sum, v) => sum + v, 0);
              const percentage = currentTotal > 0 ? ((context.parsed / currentTotal) * 100).toFixed(1) : '0.0';
              return ` ${context.label}: ${context.parsed} (${percentage}%)`;
            }
          }
        }
      }
    },
    plugins: [{
      id: 'centerText',
      beforeDraw: function(chart) {
        const { width, height, ctx } = chart;
        ctx.restore();

        const fontSize = Math.min(width, height) / 6;
        ctx.font = `bold ${fontSize}px 'Orbitron', sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = CHART_COLORS.neonGreen;

        // Obtain center coordinates from the first arc element to adjust for bottom legend shift
        const meta = chart.getDatasetMeta(0);
        const firstArc = meta && meta.data && meta.data[0];
        const centerX = firstArc ? firstArc.x : width / 2;
        const centerY = firstArc ? firstArc.y : height / 2;

        ctx.fillText(total.toString(), centerX, centerY - fontSize / 4);

        const labelSize = fontSize / 2.5;
        ctx.font = `${labelSize}px 'Noto Sans SC', sans-serif`;
        ctx.fillStyle = CHART_COLORS.textSecondary;
        ctx.fillText('总数', centerX, centerY + fontSize / 2);

        ctx.save();
      }
    }]
  };

  return new Chart(ctx, config);
}

function destroyChart(chart) {
  if (chart && typeof chart.destroy === 'function') {
    chart.destroy();
  }
}

function updateChart(chart, newData) {
  if (!chart || !chart.data) {
    console.error('Invalid chart instance');
    return;
  }

  chart.data.labels = newData.labels;
  chart.data.datasets[0].data = newData.values;
  chart.update('active');
}

if (typeof window !== 'undefined') {
  window.createMiniLineChart = createMiniLineChart;
  window.createTrendLineChart = createTrendLineChart;
  window.createDistributionChart = createDistributionChart;
  window.destroyChart = destroyChart;
  window.updateChart = updateChart;
  window.CHART_COLORS = CHART_COLORS;
}