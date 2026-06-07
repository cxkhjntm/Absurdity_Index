'use strict';

const Report = (() => {
  let els = {};
  let trendChart = null;
  let distributionChart = null;

  const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  const LEVEL_LABELS = {
    basic: 'BASIC',
    combo: 'COMBO',
    rare:  'RARE',
    epic:  'EPIC',
  };

  function initReport() {
    _cacheElements();
    _bindEvents();
    populateWeekSelector();
    _renderCurrentWeek();
  }

  function _cacheElements() {
    els = {
      weekSelector:      document.getElementById('report-week-selector'),
      btnExport:         document.getElementById('btn-export-report'),
      content:           document.getElementById('report-content'),
      dateRange:         document.getElementById('report-date-range'),
      weekScore:         document.getElementById('report-week-score'),
      weekDelta:         document.getElementById('report-week-delta'),
      eventCount:        document.getElementById('report-event-count'),
      newAchievements:   document.getElementById('report-new-achievements'),
      trendCanvas:       document.getElementById('chart-report-trend'),
      distCanvas:        document.getElementById('chart-report-distribution'),
      topEventsList:     document.getElementById('report-top-events'),
      achievementsList:  document.getElementById('report-achievements-list'),
    };
  }

  function _bindEvents() {
    if (els.weekSelector) {
      els.weekSelector.addEventListener('change', _onWeekChange);
    }
    if (els.btnExport) {
      els.btnExport.addEventListener('click', exportAsImage);
    }
  }

  function _onWeekChange() {
    const value = els.weekSelector.value;
    if (value === 'current') {
      _renderCurrentWeek();
    } else {
      const weeksAgo = parseInt(value, 10);
      if (!isNaN(weeksAgo)) {
        const reportData = generateReport(weeksAgo);
        renderReport(reportData);
      }
    }
  }

  function populateWeekSelector() {
    if (!els.weekSelector) return;

    const prevValue = els.weekSelector.value;
    els.weekSelector.innerHTML = '<option value="current">本周</option>';

    const store = getStore();
    const events = store.events || [];
    if (events.length === 0) return;

    const oldest = events.reduce((min, ev) => {
      const t = new Date(ev.timestamp).getTime();
      return t < min ? t : min;
    }, Infinity);

    const currentWeekRange = Utils.getWeekRange();
    const oldestWeekRange = Utils.getWeekRange(new Date(oldest));
    const msDiff = currentWeekRange.start.getTime() - oldestWeekRange.start.getTime();
    const weeksSpan = Math.round(msDiff / (7 * 24 * 60 * 60 * 1000));
    const maxWeeks = Math.min(weeksSpan, 12);

    for (let i = 1; i <= maxWeeks; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i * 7);
      const { startStr, endStr } = Utils.getWeekRange(targetDate);
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = `${startStr} — ${endStr}`;
      els.weekSelector.appendChild(option);
    }

    if (prevValue && els.weekSelector.querySelector(`option[value="${prevValue}"]`)) {
      els.weekSelector.value = prevValue;
    }
  }

  function generateReport(weeksAgo) {
    if (typeof weeksAgo === 'undefined') weeksAgo = 0;

    const stats = getWeeklyStats(weeksAgo);
    const prevStats = getWeeklyStats(weeksAgo + 1);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - weeksAgo * 7);
    const weekRange = Utils.getWeekRange(targetDate);

    const trendData = _buildTrendData(stats.events);
    const distributionData = _buildDistributionData(stats.events);
    const topEvents = _buildTopEvents(stats.events);

    // Use Utils.getWeekRange for consistent week boundaries
    const weekStart = new Date(weekRange.start);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekRange.end);
    weekEnd.setHours(23, 59, 59, 999);
    const newAchievements = _buildWeekAchievements(weekStart, weekEnd);

    const delta = stats.totalAbsurdity - prevStats.totalAbsurdity;
    const deltaPercent = prevStats.totalAbsurdity > 0
      ? Math.round((delta / prevStats.totalAbsurdity) * 100)
      : (stats.totalAbsurdity > 0 ? 100 : 0);

    return {
      dateRange:       `${weekRange.startStr} — ${weekRange.endStr}`,
      weekScore:       stats.totalAbsurdity,
      eventCount:      stats.totalEvents,
      delta,
      deltaPercent,
      trendData,
      distributionData,
      topEvents,
      newAchievements,
    };
  }

  function _buildTrendData(events) {
    const values = [0, 0, 0, 0, 0, 0, 0];

    (events || []).forEach(ev => {
      const d = new Date(ev.timestamp);
      const jsDay = d.getDay();
      const idx = jsDay === 0 ? 6 : jsDay - 1; // Sun→6, Mon→0
      values[idx] += (ev.score || ev.absurdityLevel || 0);
    });

    return { labels: DAY_LABELS, values };
  }

  function _buildDistributionData(events) {
    const counts = { basic: 0, combo: 0, rare: 0, epic: 0 };

    (events || []).forEach(ev => {
      const level = (ev.level || 'basic').toLowerCase();
      if (counts[level] !== undefined) {
        counts[level]++;
      }
    });

    return {
      labels: Object.keys(counts).map(k => LEVEL_LABELS[k]),
      values: Object.values(counts),
    };
  }

  function _buildTopEvents(events) {
    return (events || [])
      .slice()
      .sort((a, b) => (b.score || b.absurdityLevel || 0) - (a.score || a.absurdityLevel || 0))
      .slice(0, 3)
      .map(ev => ({
        title: ev.title || ev.desc || '未命名事件',
        score: ev.score || ev.absurdityLevel || 0,
        level: (ev.level || 'basic').toLowerCase(),
      }));
  }

  function _buildWeekAchievements(weekStart, weekEnd) {
    const store = getStore();
    const achievements = store.achievements || [];
    const startMs = weekStart.getTime();
    const endMs = weekEnd.getTime();

    return achievements.filter(ach => {
      if (!ach.unlockedAt) return false;
      const t = new Date(ach.unlockedAt).getTime();
      return !isNaN(t) && t >= startMs && t <= endMs;
    });
  }

  function renderReport(reportData) {
    if (!reportData) return;

    _renderDateRange(reportData.dateRange);
    _renderStats(reportData);
    _renderTrendChart(reportData.trendData);
    _renderDistributionChart(reportData.distributionData);
    _renderTopEvents(reportData.topEvents);
    _renderAchievements(reportData.newAchievements);
  }

  function _renderCurrentWeek() {
    const reportData = generateReport(0);
    renderReport(reportData);
  }

  function _renderDateRange(dateRange) {
    if (els.dateRange) {
      els.dateRange.textContent = dateRange || '';
    }
  }

  function _renderStats(data) {
    if (els.weekScore) {
      els.weekScore.textContent = data.weekScore;
      _flashElement(els.weekScore);
    }

    if (els.weekDelta) {
      if (data.delta === 0) {
        els.weekDelta.textContent = '—';
        els.weekDelta.className = 'report-stat-card__delta';
      } else if (data.delta > 0) {
        els.weekDelta.textContent = `↑ ${data.deltaPercent}% vs 上周`;
        els.weekDelta.className = 'report-stat-card__delta report-stat-card__delta--up';
      } else {
        els.weekDelta.textContent = `↓ ${Math.abs(data.deltaPercent)}% vs 上周`;
        els.weekDelta.className = 'report-stat-card__delta report-stat-card__delta--down';
      }
    }

    if (els.eventCount) {
      els.eventCount.textContent = data.eventCount;
    }

    if (els.newAchievements) {
      els.newAchievements.textContent = data.newAchievements.length;
    }
  }

  function _flashElement(el) {
    el.classList.add('report-stat-card__value--animating');
    el.addEventListener('animationend', () => {
      el.classList.remove('report-stat-card__value--animating');
    }, { once: true });
  }

  function _renderTrendChart(trendData) {
    if (!els.trendCanvas) return;

    if (trendChart) {
      destroyChart(trendChart);
      trendChart = null;
    }

    const hasData = trendData.values.some(v => v > 0);

    if (!hasData) {
      _showChartEmpty(els.trendCanvas, '📈', '本周暂无数据');
      return;
    }

    _hideChartEmpty(els.trendCanvas);
    trendChart = createTrendLineChart('chart-report-trend', trendData);
  }

  function _renderDistributionChart(distData) {
    if (!els.distCanvas) return;

    if (distributionChart) {
      destroyChart(distributionChart);
      distributionChart = null;
    }

    const hasData = distData.values.some(v => v > 0);

    if (!hasData) {
      _showChartEmpty(els.distCanvas, '📊', '本周暂无数据');
      return;
    }

    _hideChartEmpty(els.distCanvas);
    distributionChart = createDistributionChart('chart-report-distribution', distData);
  }

  function _showChartEmpty(canvas, icon, text) {
    canvas.style.display = 'none';
    const body = canvas.parentElement;
    if (!body || body.querySelector('.chart-empty')) return;

    const empty = document.createElement('div');
    empty.className = 'chart-empty';
    empty.innerHTML = `
      <span class="chart-empty__icon">${icon}</span>
      <p class="chart-empty__text">${_escapeHtml(text)}</p>
    `;
    body.appendChild(empty);
  }

  function _hideChartEmpty(canvas) {
    canvas.style.display = '';
    const body = canvas.parentElement;
    if (!body) return;
    const empty = body.querySelector('.chart-empty');
    if (empty) empty.remove();
  }

  function _renderTopEvents(topEvents) {
    if (!els.topEventsList) return;

    if (!topEvents || topEvents.length === 0) {
      els.topEventsList.innerHTML = '<li class="report-top-events__empty">本周暂无记录</li>';
      return;
    }

    els.topEventsList.innerHTML = topEvents.map((ev, i) => `
      <li class="report-top-event">
        <span class="report-top-event__rank">#${i + 1}</span>
        <span class="report-top-event__title">${_escapeHtml(ev.title)}</span>
        <span class="report-top-event__score badge badge--${ev.level}">+${ev.score}</span>
      </li>
    `).join('');
  }

  function _renderAchievements(achievements) {
    if (!els.achievementsList) return;

    if (!achievements || achievements.length === 0) {
      els.achievementsList.innerHTML = '<p class="report-achievements__empty">本周暂无新成就</p>';
      return;
    }

    els.achievementsList.innerHTML = achievements.map(ach => `
      <div class="report-achievement-chip">
        <span class="report-achievement-chip__emoji">${ach.emoji || '🏆'}</span>
        <span class="report-achievement-chip__name">${_escapeHtml(ach.name || '未命名成就')}</span>
      </div>
    `).join('');
  }

  function exportAsImage() {
    if (!els.content) return;

    if (typeof html2canvas === 'undefined') {
      console.error('[Report] html2canvas not loaded');
      return;
    }

    els.content.classList.add('report-content--exporting');

    html2canvas(els.content, {
      backgroundColor: '#0a0a0f',
      scale: 2,
      useCORS: true,
      logging: false,
      onclone: (doc) => {
        const cloned = doc.getElementById('report-content');
        if (cloned) {
          cloned.style.backgroundColor = '#0a0a0f';
        }
      },
    }).then(canvas => {
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `absurdity-report-${dateStr}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }).catch(err => {
      console.error('[Report] Export failed:', err);
    }).finally(() => {
      els.content.classList.remove('report-content--exporting');
    });
  }

  function _escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  return {
    initReport,
    generateReport,
    renderReport,
    exportAsImage,
    populateWeekSelector,
  };
})();
