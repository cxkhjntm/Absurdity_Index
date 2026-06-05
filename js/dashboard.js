'use strict';

const Dashboard = (() => {
  let els = {};
  let miniChart = null;
  let _lastScore = 0;

  const LEVEL_STAGES = [
    { stage: 1, min: 0,   max: 50,  title: '形式主义实习生' },
    { stage: 2, min: 51,  max: 200, title: '流程卷王' },
    { stage: 3, min: 201, max: 500, title: '官僚主义大师' },
    { stage: 4, min: 501, max: Infinity, title: '荒谬觉醒者' },
  ];

  const LEVEL_ICONS = {
    basic: '⚡',
    combo: '🔗',
    rare:  '💎',
    epic:  '🔥',
  };

  function initDashboard() {
    _cacheElements();
    updateDashboard();
  }

  function _cacheElements() {
    els = {
      scoreValue:      document.getElementById('total-score-value'),
      levelStageBadge: document.getElementById('level-stage-badge'),
      levelTitle:      document.getElementById('level-title'),
      levelProgress:   document.getElementById('level-progress'),
      levelProgressTxt:document.getElementById('level-progress-text'),
      miniTrendCanvas: document.getElementById('chart-mini-trend'),
      recentList:      document.getElementById('recent-events-list'),
    };
  }

  function updateDashboard() {
    renderTotalScore();
    renderLevel();
    renderMiniTrend();
    renderRecentEvents();
  }

  function renderTotalScore() {
    if (!els.scoreValue) return;

    const store = getStore();
    const totalScore = _computeTotalScore(store);

    if (totalScore === _lastScore) return;

    _animateScore(_lastScore, totalScore);
    _lastScore = totalScore;
  }

  function _computeTotalScore(store) {
    if (!store.events || store.events.length === 0) return 0;
    return store.events.reduce((sum, ev) => sum + (ev.score || ev.absurdityLevel || 0), 0);
  }

  function _animateScore(from, to) {
    const el = els.scoreValue;
    if (!el) return;

    const duration = 600;
    const startTime = performance.now();
    const diff = to - from;

    el.classList.add('score-display--updating');
    const onEnd = () => el.classList.remove('score-display--updating');
    el.addEventListener('animationend', onEnd, { once: true });

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + diff * eased);
      el.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function renderLevel() {
    const store = getStore();
    const totalScore = _computeTotalScore(store);
    const stage = _getStageForScore(totalScore);

    if (els.levelStageBadge) {
      els.levelStageBadge.textContent = `阶段 ${stage.stage}`;
    }

    if (els.levelTitle) {
      const title = (store.level && store.level.title) || stage.title;
      els.levelTitle.textContent = title;
    }

    if (els.levelProgress && els.levelProgressTxt) {
      if (stage.max === Infinity) {
        els.levelProgress.style.width = '100%';
        els.levelProgressTxt.textContent = '已达到最高阶段';
      } else {
        const rangeSize = stage.max - stage.min + 1;
        const progress = Utils.clamp(((totalScore - stage.min + 1) / rangeSize) * 100, 0, 100);
        els.levelProgress.style.width = `${progress.toFixed(1)}%`;
        els.levelProgressTxt.textContent = `${totalScore} / ${stage.max} 到下一阶段`;
      }
    }
  }

  function _getStageForScore(score) {
    for (let i = LEVEL_STAGES.length - 1; i >= 0; i--) {
      if (score >= LEVEL_STAGES[i].min) return LEVEL_STAGES[i];
    }
    return LEVEL_STAGES[0];
  }

  function renderMiniTrend() {
    if (!els.miniTrendCanvas) return;

    const trendData = _buildWeeklyTrendData();
    const hasData = trendData.values.some(v => v > 0);

    if (!hasData) {
      _showChartEmpty();
      if (miniChart) {
        destroyChart(miniChart);
        miniChart = null;
      }
      return;
    }

    _hideChartEmpty();

    if (miniChart) {
      updateChart(miniChart, trendData);
    } else {
      miniChart = createMiniLineChart('chart-mini-trend', trendData);
    }
  }

  function _buildWeeklyTrendData() {
    const dayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const values = [0, 0, 0, 0, 0, 0, 0];

    const store = getStore();
    if (!store.events || store.events.length === 0) {
      return { labels: dayLabels, values };
    }

    const { start, end } = Utils.getWeekRange();

    store.events.forEach(ev => {
      const d = new Date(ev.timestamp);
      if (d >= start && d <= end) {
        // JS getDay(): 0=Sun,1=Mon…6=Sat → map to 0=Mon…6=Sun
        const jsDay = d.getDay();
        const idx = jsDay === 0 ? 6 : jsDay - 1;
        values[idx] += (ev.score || ev.absurdityLevel || 0);
      }
    });

    return { labels: dayLabels, values };
  }

  function _showChartEmpty() {
    const body = els.miniTrendCanvas && els.miniTrendCanvas.parentElement;
    if (!body || body.querySelector('.chart-empty')) return;

    els.miniTrendCanvas.style.display = 'none';

    const empty = document.createElement('div');
    empty.className = 'chart-empty';
    empty.innerHTML = `
      <span class="chart-empty__icon">📈</span>
      <p class="chart-empty__text">本周暂无数据</p>
    `;
    body.appendChild(empty);
  }

  function _hideChartEmpty() {
    const body = els.miniTrendCanvas && els.miniTrendCanvas.parentElement;
    if (!body) return;

    els.miniTrendCanvas.style.display = '';
    const empty = body.querySelector('.chart-empty');
    if (empty) empty.remove();
  }

  function renderRecentEvents() {
    if (!els.recentList) return;

    const store = getStore();
    const events = (store.events || [])
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    if (events.length === 0) {
      els.recentList.innerHTML = `
        <li class="event-list__empty">
          <span class="empty-icon">🌑</span>
          <p>尚无荒谬记录</p>
          <p class="text-secondary">点击上方按钮开始记录</p>
        </li>
      `;
      return;
    }

    els.recentList.innerHTML = events.map(ev => {
      const level = (ev.level || 'basic').toLowerCase();
      const icon  = LEVEL_ICONS[level] || '⚡';
      const title = ev.title || ev.desc || '未命名事件';
      const score = ev.score || ev.absurdityLevel || 0;
      const time  = Utils.relativeTime(ev.timestamp);

      return `
        <li class="event-item event-item--${level}">
          <span class="event-item__icon">${icon}</span>
          <div class="event-item__info">
            <span class="event-item__title">${_escapeHtml(title)}</span>
            <span class="event-item__time">${_escapeHtml(time)}</span>
          </div>
          <span class="event-item__score">+${score}</span>
        </li>
      `;
    }).join('');
  }

  function _escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  return {
    initDashboard,
    updateDashboard,
    renderTotalScore,
    renderLevel,
    renderMiniTrend,
    renderRecentEvents,
  };
})();
