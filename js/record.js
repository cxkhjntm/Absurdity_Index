'use strict';

const Record = (() => {

  let els = {};
  let _pendingAIResult = null;

  function initRecord() {
    _cacheElements();
    setupAIAnalysis();
    setupQuickEvents();
  }

  function _cacheElements() {
    els = {
      aiInput:      document.getElementById('record-ai-input'),
      btnAnalyze:   document.getElementById('btn-ai-analyze'),
      preview:      document.getElementById('ai-result-preview'),
      resultLevel:  document.getElementById('ai-result-level'),
      resultScore:  document.getElementById('ai-result-score'),
      resultTitle:  document.getElementById('ai-result-title'),
      resultComment:document.getElementById('ai-result-comment'),
      resultAch:    document.getElementById('ai-result-achievement'),
      resultAchEmoji:document.getElementById('ai-result-achievement-emoji'),
      resultAchName:document.getElementById('ai-result-achievement-name'),
      resultAchDesc:document.getElementById('ai-result-achievement-desc'),
      btnConfirm:   document.getElementById('btn-confirm-ai'),
      btnRetry:     document.getElementById('btn-retry-ai'),
      quickGrid:    document.getElementById('quick-events-grid'),
    };
  }

  function setupAIAnalysis() {
    if (els.btnAnalyze) {
      els.btnAnalyze.addEventListener('click', handleAIAnalyze);
    }
    if (els.btnConfirm) {
      els.btnConfirm.addEventListener('click', handleConfirmAI);
    }
    if (els.btnRetry) {
      els.btnRetry.addEventListener('click', handleRetryAI);
    }
    if (els.aiInput) {
      els.aiInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          handleAIAnalyze();
        }
      });
    }
  }

  function setupQuickEvents() {
    if (!els.quickGrid) return;

    els.quickGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.quick-event-btn');
      if (!btn) return;

      btn.classList.remove('quick-event-btn--flash');
      void btn.offsetWidth;
      btn.classList.add('quick-event-btn--flash');
      btn.addEventListener('animationend', () => {
        btn.classList.remove('quick-event-btn--flash');
      }, { once: true });

      handleQuickEvent(btn);
    });
  }

  /**
   * Handle AI analyze button click: validate input, call AI, show preview.
   * @async
   */
  async function handleAIAnalyze() {
    const text = (els.aiInput?.value || '').trim();
    if (!text) {
      _showToast('请先描述你遇到的荒谬事件', 'warning');
      els.aiInput?.focus();
      return;
    }

    if (!AI.isAIAvailable()) {
      _showAINotice();
      return;
    }

    _setAnalyzeLoading(true);

    try {
      const result = await AI.analyzeEvent(text);
      _pendingAIResult = { ...result, description: text };
      showAIPreview(result);
    } catch (err) {
      console.error('[Record] AI analysis failed:', err);
      _showToast('AI 分析失败：' + (err.message || '未知错误'), 'error');
    } finally {
      _setAnalyzeLoading(false);
    }
  }

  /**
   * Render AI analysis result in the preview panel.
   * @param {{ level: string, score: number, title: string, comment?: string, achievement?: string, achievement_desc?: string }} result
   */
  function showAIPreview(result) {
    if (!els.preview) return;

    const level = (result.level || 'basic').toLowerCase();
    const levelLabels = { basic: 'BASIC', combo: 'COMBO', rare: 'RARE', epic: 'EPIC' };
    const absurdityScore = result.absurdity_score || 0;

    if (els.resultLevel) {
      els.resultLevel.textContent = levelLabels[level] || 'BASIC';
      els.resultLevel.className = 'badge badge--' + level;
    }
    if (els.resultScore) {
      els.resultScore.textContent = '+' + (result.score || 0) + (absurdityScore ? ' (荒谬度: ' + absurdityScore + '/100)' : '');
    }
    if (els.resultTitle) {
      els.resultTitle.textContent = result.title || '未命名事件';
    }
    if (els.resultComment) {
      if (result.comment) {
        els.resultComment.textContent = result.comment;
        els.resultComment.style.display = '';
      } else {
        els.resultComment.style.display = 'none';
      }
    }
    // Only show achievement preview if absurdity score meets threshold
    if (result.achievement && absurdityScore >= 66) {
      if (els.resultAch) els.resultAch.classList.remove('hidden');
      if (els.resultAchEmoji) els.resultAchEmoji.textContent = '🏆';
      if (els.resultAchName) els.resultAchName.textContent = result.achievement;
      if (els.resultAchDesc) els.resultAchDesc.textContent = result.achievement_desc || '';
    } else {
      if (els.resultAch) els.resultAch.classList.add('hidden');
    }

    els.preview.classList.remove('hidden');
    els.preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Confirm AI analysis: save event + achievement, update level, refresh UI.
   */
  function handleConfirmAI() {
    if (!_pendingAIResult) return;

    const result = _pendingAIResult;
    const level = (result.level || 'basic').toLowerCase();
    const score = result.score || 0;
    const absurdityScore = result.absurdity_score || 0;

    const achievementObj = result.achievement ? {
      name: result.achievement,
      desc: result.achievement_desc || '',
      emoji: '🏆',
    } : null;

    const eventData = {
      level:       level,
      score:       score,
      absurdityScore: absurdityScore,
      title:       result.title || '未命名事件',
      description: result.description || '',
      aiComment:   result.comment || null,
    };

    // Only attach achievement to event if absurdity_score >= 66
    if (achievementObj && absurdityScore >= 66) {
      eventData.achievement = achievementObj;
    }

    const savedEvent = addEvent(eventData);

    // Only save achievement if absurdity_score threshold met
    if (achievementObj && absurdityScore >= 66) {
      _saveAchievement(achievementObj, savedEvent.id);
    }

    _updateLevelWithChance(score, level);

    // Check for predefined achievement unlocks
    if (typeof Achievements !== 'undefined' && Achievements.checkAndUnlockAchievements) {
      Achievements.checkAndUnlockAchievements();
    }

    if (els.aiInput) els.aiInput.value = '';
    _hidePreview();
    _pendingAIResult = null;

    _refreshModules();
    _showToast('荒谬事件已记录 +' + score + ' 荒谬值', 'success');
  }

  /**
   * Retry AI analysis: hide preview, clear state, focus input.
   */
  function handleRetryAI() {
    _hidePreview();
    _pendingAIResult = null;
    if (els.aiInput) {
      els.aiInput.value = '';
      els.aiInput.focus();
    }
  }

  /**
   * Handle quick event button click: show confirmation or save directly.
   * @param {HTMLElement} btn
   */
  function handleQuickEvent(btn) {
    const level = btn.dataset.level || 'basic';
    const score = parseInt(btn.dataset.score, 10) || 1;
    const desc  = btn.dataset.desc  || '';

    if (AI.isAIAvailable()) {
      showEventConfirmation(level, score, desc);
    } else {
      confirmEvent({ level, score, title: desc, description: desc });
    }
  }

  /**
   * Show event confirmation modal with optional AI achievement generation.
   * @param {string} level
   * @param {number} score
   * @param {string} desc
   */
  function showEventConfirmation(level, score, desc) {
    const levelLabels = {
      basic: 'BASIC ⚡',
      combo: 'COMBO 🔗',
      rare:  'RARE 💎',
      epic:  'EPIC 🔥',
    };

    const bodyHTML = `
      <div class="confirm-event-preview">
        <div class="confirm-event-preview__header">
          <span class="badge badge--${_escapeAttr(level)}">${levelLabels[level] || level}</span>
          <span class="score-badge">+${score}</span>
        </div>
        <p class="confirm-event-preview__desc">${_escapeHtml(desc)}</p>
      </div>
    `;

    const footerButtons = [
      {
        text: '确认记录',
        className: 'btn btn--primary',
        onClick: () => {
          if (typeof hideModal === 'function') hideModal();
          confirmEvent({ level, score, title: desc, description: desc });
        },
      },
      {
        text: 'AI 生成成就',
        className: 'btn btn--accent',
        onClick: async (e) => {
          const clickBtn = e.currentTarget;
          clickBtn.disabled = true;
          clickBtn.textContent = '生成中...';
          try {
            const achievement = await AI.generateAchievement(level, desc);
            if (typeof hideModal === 'function') hideModal();
            confirmEvent({
              level, score, title: desc, description: desc,
              achievement: {
                name:  achievement.name  || '未命名成就',
                desc:  achievement.desc  || '',
                emoji: achievement.emoji || '🏆',
              },
            });
          } catch (err) {
            console.error('[Record] Achievement generation failed:', err);
            const fallback = AI.getFallbackAchievement(level);
            if (typeof hideModal === 'function') hideModal();
            confirmEvent({
              level, score, title: desc, description: desc,
              achievement: { name: fallback.name, desc: fallback.desc, emoji: fallback.emoji },
            });
          }
        },
      },
      {
        text: '取消',
        className: 'btn btn--ghost',
        onClick: () => {
          if (typeof hideModal === 'function') hideModal();
        },
      },
    ];

    if (typeof showModal === 'function') {
      showModal('确认记录荒谬事件', bodyHTML, footerButtons);
    }
  }

  /**
   * Confirm and persist an event (and optional achievement) to the store.
   * @param {{ level: string, score: number, title: string, description: string, achievement?: { name: string, desc: string, emoji: string } }} data
   */
  function confirmEvent(data) {
    const level = (data.level || 'basic').toLowerCase();
    const score = data.score || 0;

    const eventData = {
      level:       level,
      score:       score,
      title:       data.title || '未命名事件',
      description: data.description || '',
      aiComment:   data.aiComment || null,
    };

    if (data.achievement) {
      eventData.achievement = data.achievement;
    }

    const savedEvent = addEvent(eventData);

    if (data.achievement) {
      _saveAchievement(data.achievement, savedEvent.id);
    }

    _updateLevelWithChance(score, level);

    // Check for predefined achievement unlocks
    if (typeof Achievements !== 'undefined' && Achievements.checkAndUnlockAchievements) {
      Achievements.checkAndUnlockAchievements();
    }

    _refreshModules();
    _showToast('荒谬事件已记录 +' + score + ' 荒谬值', 'success');
  }

  function _setAnalyzeLoading(loading) {
    if (!els.btnAnalyze) return;

    if (loading) {
      els.btnAnalyze.classList.add('btn--loading');
      els.btnAnalyze.disabled = true;
      const iconEl = els.btnAnalyze.querySelector('.btn__icon');
      const textEl = els.btnAnalyze.querySelector('.btn__text');
      if (iconEl) iconEl.textContent = '⏳';
      if (textEl) textEl.textContent = 'ANALYZING...';
      const recordAI = els.aiInput?.closest('.record-ai');
      if (recordAI) recordAI.classList.add('record-ai--analyzing');
    } else {
      els.btnAnalyze.classList.remove('btn--loading');
      els.btnAnalyze.disabled = false;
      const iconEl = els.btnAnalyze.querySelector('.btn__icon');
      const textEl = els.btnAnalyze.querySelector('.btn__text');
      if (iconEl) iconEl.textContent = '🔍';
      if (textEl) textEl.textContent = 'AI 分析';
      const recordAI = els.aiInput?.closest('.record-ai');
      if (recordAI) recordAI.classList.remove('record-ai--analyzing');
    }
  }

  function _hidePreview() {
    if (els.preview) {
      els.preview.classList.add('hidden');
    }
  }

  function _showAINotice() {
    const recordAI = els.aiInput?.closest('.record-ai');
    if (!recordAI) return;

    const existing = recordAI.querySelector('.record-ai__notice');
    if (existing) existing.remove();

    const notice = document.createElement('div');
    notice.className = 'record-ai__notice';
    notice.innerHTML = `
      <span class="record-ai__notice-icon">⚠️</span>
      <span>AI 未配置。请前往 <a href="#settings" style="color: var(--accent-green); text-decoration: underline;">设置页面</a> 配置 API，或使用下方快捷事件按钮记录。</span>
    `;
    recordAI.appendChild(notice);

    setTimeout(() => {
      if (notice.parentNode) {
        notice.style.opacity = '0';
        notice.style.transition = 'opacity 0.3s';
        setTimeout(() => notice.remove(), 300);
      }
    }, 5000);
  }

  function _saveAchievement(achievement, eventId) {
    const rarity = _determineRarity(achievement);
    addAchievement({
      name:        achievement.name || '未命名成就',
      description: achievement.desc || '',
      emoji:       achievement.emoji || '🏆',
      rarity:      rarity,
      eventId:     eventId,
    });
  }

  function _determineRarity(achievement) {
    const name = (achievement.name || '').toLowerCase();
    const desc = (achievement.desc || '').toLowerCase();
    const combined = name + ' ' + desc;

    if (/传说|legendary|终极|至尊/.test(combined)) return 'legendary';
    if (/史诗|epic|觉醒|崩塌|崩溃/.test(combined)) return 'epic';
    if (/稀有|rare|认证|终结/.test(combined)) return 'rare';
    return 'common';
  }

  /**
   * Update level with probability-based title regeneration.
   * probability = addedScore / remaining-to-next-stage; stage 4 fixed at 60%.
   * @param {number} addedScore
   * @param {string} level
   */
  function _updateLevelWithChance(addedScore, level) {
    updateLevel({ experience: addedScore });

    const store  = getStore();
    const total  = store.level.experience || 0;
    const stage  = _getStage(total);

    let probability;
    if (stage >= 4) {
      probability = 0.6;
    } else {
      const nextThreshold = _getStageThreshold(stage + 1);
      const remaining     = Math.max(nextThreshold - total, 1);
      probability = Math.min(addedScore / remaining, 1);
    }

    if (Math.random() < probability) {
      _tryGenerateLevelName(total, stage);
    }
  }

  function _getStage(score) {
    if (score >= 501) return 4;
    if (score >= 201) return 3;
    if (score >= 51)  return 2;
    return 1;
  }

  function _getStageThreshold(stage) {
    const thresholds = { 1: 0, 2: 51, 3: 201, 4: 501 };
    return thresholds[stage] || 501;
  }

  async function _tryGenerateLevelName(totalScore, stage) {
    try {
      const newName = await AI.generateLevelName(totalScore, stage);
      if (newName && typeof newName === 'string' && newName.length < 30) {
        updateLevel({ title: newName });
      }
    } catch (err) {
      console.warn('[Record] Level name generation failed:', err.message);
    }
  }

  function _refreshModules() {
    if (typeof Dashboard !== 'undefined' && Dashboard.updateDashboard) {
      Dashboard.updateDashboard();
    }
    if (typeof Achievements !== 'undefined' && Achievements.renderAchievements) {
      Achievements.renderAchievements();
    }
  }

  function _showToast(message, type) {
    if (typeof showToast === 'function') {
      showToast(message, type);
      return;
    }
    const prefix = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' }[type] || 'ℹ';
    console.log(`[Toast ${prefix}] ${message}`);
  }

  function _escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str || ''));
    return div.innerHTML;
  }

  function _escapeAttr(str) {
    return (str || '').replace(/[^a-z0-9_-]/gi, '');
  }

  return {
    initRecord,
    setupAIAnalysis,
    setupQuickEvents,
    handleAIAnalyze,
    showAIPreview,
    handleConfirmAI,
    handleRetryAI,
    handleQuickEvent,
    showEventConfirmation,
    confirmEvent,
  };

})();
