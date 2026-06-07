'use strict';

const Achievements = (() => {
  const ACHIEVEMENT_POOL = [
    {
      id: 'first-record',
      name: '初入荒谬',
      description: '记录你的第一件荒谬事件',
      emoji: '🌑',
      rarity: 'common',
    },
    {
      id: 'three-records',
      name: '荒谬新手',
      description: '累计记录 3 件荒谬事件',
      emoji: '📝',
      rarity: 'common',
    },
    {
      id: 'ten-records',
      name: '荒谬收集者',
      description: '累计记录 10 件荒谬事件',
      emoji: '📦',
      rarity: 'common',
    },
    {
      id: 'first-basic',
      name: '日常荒谬',
      description: '记录一件 BASIC 级别的荒谬事件',
      emoji: '⚡',
      rarity: 'common',
    },
    {
      id: 'score-50',
      name: '荒谬入门',
      description: '荒谬总值达到 50 分',
      emoji: '📊',
      rarity: 'common',
    },
    {
      id: 'first-combo',
      name: '连环荒谬',
      description: '记录一件 COMBO 级别的荒谬事件',
      emoji: '🔗',
      rarity: 'rare',
    },
    {
      id: 'first-rare',
      name: '稀有发现',
      description: '记录一件 RARE 级别的荒谬事件',
      emoji: '💎',
      rarity: 'rare',
    },
    {
      id: 'score-200',
      name: '荒谬进阶',
      description: '荒谬总值达到 200 分',
      emoji: '🎯',
      rarity: 'rare',
    },
    {
      id: 'five-combo',
      name: '流程大师',
      description: '累计记录 5 件 COMBO 级别事件',
      emoji: '🔄',
      rarity: 'rare',
    },
    {
      id: 'weekly-report',
      name: '荒谬周报读者',
      description: '查看你的第一份荒谬周报',
      emoji: '📋',
      rarity: 'rare',
    },
    {
      id: 'first-epic',
      name: '史诗荒谬',
      description: '记录一件 EPIC 级别的荒谬事件',
      emoji: '🔥',
      rarity: 'epic',
    },
    {
      id: 'score-500',
      name: '荒谬觉醒',
      description: '荒谬总值达到 500 分',
      emoji: '💥',
      rarity: 'epic',
    },
    {
      id: 'three-epic',
      name: '荒谬收割机',
      description: '累计记录 3 件 EPIC 级别事件',
      emoji: '⚔️',
      rarity: 'epic',
    },
    {
      id: 'level-4',
      name: '荒谬觉醒者',
      description: '达到等级阶段 4',
      emoji: '👑',
      rarity: 'epic',
    },
    {
      id: 'score-1000',
      name: '荒谬传说',
      description: '荒谬总值达到 1000 分',
      emoji: '🌟',
      rarity: 'legendary',
    },
    {
      id: 'five-epic',
      name: '官僚克星',
      description: '累计记录 5 件 EPIC 级别事件',
      emoji: '🗡️',
      rarity: 'legendary',
    },
    {
      id: 'all-levels',
      name: '全等级制霸',
      description: '记录过所有等级的荒谬事件',
      emoji: '🏆',
      rarity: 'legendary',
    },
    {
      id: 'fifty-records',
      name: '荒谬百科全书',
      description: '累计记录 50 件荒谬事件',
      emoji: '📚',
      rarity: 'legendary',
    },
  ];

  let els = {};

  const RARITY_LABELS = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  };

  function initAchievements() {
    _cacheElements();
    renderAchievements();
    // Retroactively check and unlock achievements for existing events
    // This handles cases where events were recorded before the unlock logic was added
    checkAndUnlockAchievements();
  }

  function _cacheElements() {
    els = {
      grid: document.getElementById('achievements-grid'),
      count: document.getElementById('achievements-count'),
    };
  }

  function renderAchievements() {
    if (!els.grid) {
      _cacheElements();
      if (!els.grid) return;
    }

    const store = getStore();
    const storeAchievements = store.achievements || [];
    const poolIds = new Set(ACHIEVEMENT_POOL.map(p => p.id));
    const unlockedMap = new Map(storeAchievements.map(a => [a.id, a]));
    const eventsMap = new Map((store.events || []).map(e => [e.id, e]));

    const unlockedCards = [];
    const lockedCards = [];

    ACHIEVEMENT_POOL.forEach(poolItem => {
      if (unlockedMap.has(poolItem.id)) {
        unlockedCards.push(_buildAchievementCard(poolItem, unlockedMap.get(poolItem.id), false, eventsMap));
      } else {
        lockedCards.push(_buildAchievementCard(poolItem, null, true, eventsMap));
      }
    });

    storeAchievements.forEach(storeAch => {
      if (!poolIds.has(storeAch.id)) {
        unlockedCards.push(_buildAchievementCard(storeAch, storeAch, false, eventsMap));
      }
    });

    const allCards = [...unlockedCards, ...lockedCards];

    if (allCards.length === 0) {
      els.grid.innerHTML = `
        <div class="achievements-grid__empty">
          <span class="empty-icon">🔒</span>
          <p>尚无成就解锁</p>
          <p class="text-secondary">去记录一些荒谬事件吧！</p>
        </div>
      `;
    } else {
      els.grid.innerHTML = allCards.join('');
    }

    _updateStatsCount(storeAchievements.length);
  }

  function _buildAchievementCard(poolItem, unlockedData, locked, eventsMap) {
    const rarity = poolItem.rarity || 'common';
    const rarityClass = `achievement-card--${rarity}`;
    const lockedClass = locked ? ' achievement-card--locked' : '';
    const rarityLabel = getRarityLabel(rarity);
    const unlockTime = unlockedData
      ? Utils.formatDate(unlockedData.unlockedAt)
      : '';

    // For dynamic achievements, name may be in 'name' field directly
    const name = poolItem.name || '未命名成就';
    const description = poolItem.description || poolItem.desc || '';
    const emoji = poolItem.emoji || '🏆';
    const id = poolItem.id || ('dynamic-' + Math.random().toString(36).substr(2, 6));

    // Look up source event if eventId exists
    let sourceDesc = '';
    if (unlockedData && unlockedData.eventId && eventsMap) {
      const sourceEvent = eventsMap.get(unlockedData.eventId);
      if (sourceEvent) {
        sourceDesc = sourceEvent.description || sourceEvent.title || '';
      }
    }

    return `
      <div class="achievement-card ${rarityClass}${lockedClass}" data-achievement-id="${id}">
        <div class="achievement-card__rarity-badge">${_escapeHtml(rarityLabel)}</div>
        <span class="achievement-card__emoji">${emoji}</span>
        <h4 class="achievement-card__name">${_escapeHtml(name)}</h4>
        <p class="achievement-card__desc">${_escapeHtml(description)}</p>
        ${sourceDesc ? `<p class="achievement-card__source" title="${_escapeHtml(sourceDesc)}">📌 ${_escapeHtml(sourceDesc.length > 40 ? sourceDesc.substring(0, 40) + '…' : sourceDesc)}</p>` : ''}
        ${unlockTime ? `<time class="achievement-card__time">${_escapeHtml(unlockTime)}</time>` : ''}
      </div>
    `;
  }

  function getRarityLabel(rarity) {
    return RARITY_LABELS[rarity] || '未知';
  }

  function addAchievementToDisplay(achievement) {
    if (!achievement || !achievement.id) return;

    const store = getStore();
    const alreadyExists = (store.achievements || []).some(a => a.id === achievement.id);
    if (alreadyExists) return;

    addAchievement(achievement);
    renderAchievements();

    if (els.grid) {
      const card = els.grid.querySelector(`[data-achievement-id="${achievement.id}"]`);
      if (card) {
        card.classList.add('achievement-card--newly-unlocked');
        card.addEventListener('animationend', () => {
          card.classList.remove('achievement-card--newly-unlocked');
        }, { once: true });
      }
    }

    _flashStatsCount();
  }

  function getAchievementStats() {
    const store = getStore();
    const storeAchievements = store.achievements || [];
    const poolIds = new Set(ACHIEVEMENT_POOL.map(p => p.id));
    const unlockedPoolIds = new Set(storeAchievements.filter(a => poolIds.has(a.id)).map(a => a.id));
    const dynamicCount = storeAchievements.filter(a => !poolIds.has(a.id)).length;
    const totalPool = ACHIEVEMENT_POOL.length;
    const unlockedPool = unlockedPoolIds.size;

    const byRarity = {
      common: { total: 0, unlocked: 0 },
      rare: { total: 0, unlocked: 0 },
      epic: { total: 0, unlocked: 0 },
      legendary: { total: 0, unlocked: 0 },
    };

    ACHIEVEMENT_POOL.forEach(item => {
      if (byRarity[item.rarity]) {
        byRarity[item.rarity].total++;
        if (unlockedPoolIds.has(item.id)) {
          byRarity[item.rarity].unlocked++;
        }
      }
    });

    storeAchievements.filter(a => !poolIds.has(a.id)).forEach(item => {
      const rarity = item.rarity || 'common';
      if (byRarity[rarity]) {
        byRarity[rarity].total++;
        byRarity[rarity].unlocked++;
      }
    });

    return {
      total: totalPool + dynamicCount,
      unlocked: storeAchievements.length,
      locked: totalPool - unlockedPool,
      percentage: totalPool > 0 ? Math.round((unlockedPool / totalPool) * 100) : 0,
      byRarity,
    };
  }

  function _updateStatsCount(count) {
    if (!els.count) return;

    const current = parseInt(els.count.textContent, 10) || 0;
    if (current === count) return;

    const duration = 400;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(current + (count - current) * eased);
      els.count.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function _flashStatsCount() {
    if (!els.count) return;
    els.count.classList.add('achievements-stats__count--updating');
    els.count.addEventListener('animationend', () => {
      els.count.classList.remove('achievements-stats__count--updating');
    }, { once: true });
  }

  /**
   * Check all predefined achievement conditions and unlock any that are met.
   * Called after each event submission.
   */
  function checkAndUnlockAchievements() {
    const store = getStore();
    const events = store.events || [];
    const totalScore = events.reduce((sum, e) => sum + (e.score || 0), 0);
    const unlockedIds = new Set((store.achievements || []).map(a => a.id));

    // Count events by level
    const levelCounts = { basic: 0, combo: 0, rare: 0, epic: 0 };
    const hasLevel = { basic: false, combo: false, rare: false, epic: false };
    events.forEach(e => {
      const lvl = (e.level || 'basic').toLowerCase();
      if (levelCounts[lvl] !== undefined) {
        levelCounts[lvl]++;
        hasLevel[lvl] = true;
      }
    });

    // Current stage
    const stage = totalScore >= 501 ? 4 : totalScore >= 201 ? 3 : totalScore >= 51 ? 2 : 1;

    // Define all condition checks
    const checks = [
      { id: 'first-record',   condition: events.length >= 1 },
      { id: 'three-records',  condition: events.length >= 3 },
      { id: 'ten-records',    condition: events.length >= 10 },
      { id: 'fifty-records',  condition: events.length >= 50 },
      { id: 'first-basic',    condition: hasLevel.basic },
      { id: 'first-combo',    condition: hasLevel.combo },
      { id: 'first-rare',     condition: hasLevel.rare },
      { id: 'first-epic',     condition: hasLevel.epic },
      { id: 'five-combo',     condition: levelCounts.combo >= 5 },
      { id: 'three-epic',     condition: levelCounts.epic >= 3 },
      { id: 'five-epic',      condition: levelCounts.epic >= 5 },
      { id: 'score-50',       condition: totalScore >= 50 },
      { id: 'score-200',      condition: totalScore >= 200 },
      { id: 'score-500',      condition: totalScore >= 500 },
      { id: 'score-1000',     condition: totalScore >= 1000 },
      { id: 'level-4',        condition: stage >= 4 },
      { id: 'all-levels',     condition: hasLevel.basic && hasLevel.combo && hasLevel.rare && hasLevel.epic },
      { id: 'weekly-report',  condition: store.hasReadReport === true },
    ];

    let newlyUnlocked = [];

    checks.forEach(({ id, condition }) => {
      if (condition && !unlockedIds.has(id)) {
        const poolItem = ACHIEVEMENT_POOL.find(p => p.id === id);
        if (poolItem) {
          addAchievementToDisplay(poolItem);
          newlyUnlocked.push(poolItem);
        }
      }
    });

    // Show toast for newly unlocked achievements
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(ach => {
        if (typeof showToast === 'function') {
          showToast(`🏆 成就解锁：${ach.name}`, 'success');
        }
      });
    }

    return newlyUnlocked;
  }

  function _escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  return {
    initAchievements,
    renderAchievements,
    getRarityLabel,
    addAchievementToDisplay,
    getAchievementStats,
    checkAndUnlockAchievements,
  };
})();
