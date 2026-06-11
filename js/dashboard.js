'use strict';

const Dashboard = (() => {
  let els = {};
  let miniChart = null;
  let _lastScore = 0;
  const HISTORY_PAGE_SIZE = 20;
  let _historyDisplayCount = HISTORY_PAGE_SIZE;

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

    // Attach history delete handler once (event delegation)
    if (els.historyList) {
      els.historyList.addEventListener('click', _handleHistoryClick, false);
    }
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
      historyList:     document.getElementById('history-list'),
    };
  }

  function updateDashboard() {
    renderTotalScore();
    renderLevel();
    renderMiniTrend();
    renderRecentEvents();
    renderHistoryList();
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
        const range = stage.max - stage.min;
        const progress = range > 0 ? Utils.clamp(((totalScore - stage.min) / range) * 100, 0, 100) : 0;
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

  /**
   * Render full event history list with descriptions, achievements, and delete actions.
   */
  function renderHistoryList() {
    if (!els.historyList) return;

    const store = getStore();
    const events = (store.events || [])
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (events.length === 0) {
      _historyDisplayCount = HISTORY_PAGE_SIZE;
      els.historyList.innerHTML = `
        <div class="history-list__empty">
          <span class="empty-icon">📭</span>
          <p>暂无历史记录</p>
        </div>
      `;
      return;
    }

    const visibleEvents = events.slice(0, _historyDisplayCount);
    const hasMore = events.length > _historyDisplayCount;

    let html = visibleEvents.map(ev => {
      const level = (ev.level || 'basic').toLowerCase();
      const icon  = LEVEL_ICONS[level] || '⚡';
      const title = ev.title || ev.desc || '未命名事件';
      const score = ev.score || 0;
      const time  = Utils.formatDate(ev.timestamp);
      const desc  = ev.description || '';
      const ach   = ev.achievement;

      let achHTML = '';
      if (ach) {
        achHTML = `
          <div class="history-item__achievement">
            <span class="history-item__ach-icon">${ach.emoji || '🏆'}</span>
            <span class="history-item__ach-name">${_escapeHtml(ach.name || '')}</span>
          </div>
        `;
      }

      return `
        <div class="history-item history-item--${level}" data-event-id="${ev.id}">
          <div class="history-item__header">
            <span class="history-item__icon">${icon}</span>
            <span class="history-item__title">${_escapeHtml(title)}</span>
            <span class="badge badge--${level}">+${score}</span>
            <button class="history-item__delete" data-delete-id="${ev.id}" title="删除记录">×</button>
          </div>
          ${desc ? `<p class="history-item__desc">${_escapeHtml(desc)}</p>` : ''}
          ${ev.aiComment ? `<p class="history-item__comment">🤖 ${_escapeHtml(ev.aiComment)}</p>` : ''}
          ${achHTML}
          <time class="history-item__time">${_escapeHtml(time)}</time>
        </div>
      `;
    }).join('');

    if (hasMore) {
      const remaining = events.length - _historyDisplayCount;
      html += `
        <button class="history-list__load-more" id="btn-load-more-history" type="button">
          <span class="btn__icon">📜</span>
          <span>加载更多（还有 ${remaining} 条）</span>
        </button>
      `;
    }

    els.historyList.innerHTML = html;

    // Bind load-more button
    const loadMoreBtn = document.getElementById('btn-load-more-history');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', _handleLoadMore, { once: true });
    }
  }

  function _handleLoadMore() {
    _historyDisplayCount += HISTORY_PAGE_SIZE;
    renderHistoryList();
  }

  function _handleHistoryClick(e) {
    const deleteBtn = e.target.closest('[data-delete-id]');
    if (!deleteBtn) return;

    const eventId = deleteBtn.dataset.deleteId;
    if (!eventId) return;

    if (typeof showModal === 'function') {
      showModal('确认删除', '<p>确定要删除这条荒谬记录吗？关联的成就也会一并删除，且无法恢复。</p>', [
        {
          text: '确认删除',
          className: 'btn btn--danger',
          onClick: () => {
            if (typeof hideModal === 'function') hideModal();
            if (typeof deleteEvent === 'function') {
              deleteEvent(eventId);
              updateDashboard();
              // Also refresh achievements since associated achievements are cascade-deleted
              if (typeof Achievements !== 'undefined' && Achievements.renderAchievements) {
                Achievements.renderAchievements();
              }
              if (typeof showToast === 'function') {
                showToast('记录及关联成就已删除', 'info');
              }
            }
          },
        },
        {
          text: '取消',
          className: 'btn btn--ghost',
          onClick: () => { if (typeof hideModal === 'function') hideModal(); },
        },
      ]);
    } else {
      if (confirm('确定要删除这条荒谬记录吗？关联的成就也会一并删除。')) {
        if (typeof deleteEvent === 'function') {
          deleteEvent(eventId);
          updateDashboard();
          if (typeof Achievements !== 'undefined' && Achievements.renderAchievements) {
            Achievements.renderAchievements();
          }
        }
      }
    }
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
    renderHistoryList,
    resetHistoryPagination() { _historyDisplayCount = HISTORY_PAGE_SIZE; },
  };
})();
