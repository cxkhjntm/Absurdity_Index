'use strict';

const Settings = (() => {

  const DEFAULT_PROMPTS = {
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
只返回称号本身，不要其他内容。`,
  };

  let els = {};

  function initSettings() {
    _cacheElements();
    _bindEvents();
    loadSettings();
  }

  function _cacheElements() {
    els = {
      apiUrl:           document.getElementById('setting-api-url'),
      apiKey:           document.getElementById('setting-api-key'),
      model:            document.getElementById('setting-model'),
      connectionStatus: document.getElementById('connection-status'),
      btnTest:          document.getElementById('btn-test-connection'),
      promptEventAnalysis:  document.getElementById('prompt-event-analysis'),
      promptAchievementGen: document.getElementById('prompt-achievement-gen'),
      promptLevelNaming:    document.getElementById('prompt-level-naming'),
      btnSavePrompts:       document.getElementById('btn-save-prompts'),
      btnExport:       document.getElementById('btn-export-data'),
      btnImport:       document.getElementById('btn-import-data'),
      importFileInput: document.getElementById('import-file-input'),
      btnClear:        document.getElementById('btn-clear-data'),
    };
  }

  function _bindEvents() {
    if (els.apiUrl) els.apiUrl.addEventListener('change', saveAIConfig);
    if (els.apiKey) els.apiKey.addEventListener('change', saveAIConfig);
    if (els.model)  els.model.addEventListener('change', saveAIConfig);
    if (els.btnTest) els.btnTest.addEventListener('click', testConnection);
    if (els.btnSavePrompts) els.btnSavePrompts.addEventListener('click', savePrompts);

    document.querySelectorAll('[data-reset-prompt]').forEach(btn => {
      btn.addEventListener('click', () => {
        resetPrompt(btn.getAttribute('data-reset-prompt'));
      });
    });

    if (els.btnExport) els.btnExport.addEventListener('click', handleExport);
    if (els.btnImport) els.btnImport.addEventListener('click', () => {
      if (els.importFileInput) els.importFileInput.click();
    });
    if (els.importFileInput) els.importFileInput.addEventListener('change', handleImport);
    if (els.btnClear) els.btnClear.addEventListener('click', handleClear);
  }

  function loadSettings() {
    const store = getStore();
    const cfg   = store.aiConfig || {};

    if (els.apiUrl) els.apiUrl.value = cfg.baseUrl || '';
    if (els.apiKey) els.apiKey.value = cfg.apiKey || '';
    if (els.model)  els.model.value  = cfg.model || 'gpt-3.5-turbo';

    const prompts = cfg.prompts || {};
    if (els.promptEventAnalysis) {
      els.promptEventAnalysis.value = prompts.eventAnalysis || DEFAULT_PROMPTS.eventAnalysis;
    }
    if (els.promptAchievementGen) {
      els.promptAchievementGen.value = prompts.achievementGen || DEFAULT_PROMPTS.achievementGen;
    }
    if (els.promptLevelNaming) {
      els.promptLevelNaming.value = prompts.levelNaming || DEFAULT_PROMPTS.levelNaming;
    }
  }

  function saveAIConfig() {
    const store = getStore();
    if (!store.aiConfig) store.aiConfig = {};

    store.aiConfig.baseUrl = els.apiUrl ? els.apiUrl.value.trim() : '';
    store.aiConfig.apiKey  = els.apiKey ? els.apiKey.value.trim() : '';
    store.aiConfig.model   = (els.model ? els.model.value.trim() : '') || 'gpt-3.5-turbo';
    store.aiConfig.enabled = !!(store.aiConfig.baseUrl && store.aiConfig.apiKey);

    saveStore(store);
    _showToast('AI 配置已保存', 'success');
  }

  function savePrompts() {
    const store = getStore();
    if (!store.aiConfig) store.aiConfig = {};
    if (!store.aiConfig.prompts) store.aiConfig.prompts = {};

    if (els.promptEventAnalysis) {
      store.aiConfig.prompts.eventAnalysis = els.promptEventAnalysis.value;
    }
    if (els.promptAchievementGen) {
      store.aiConfig.prompts.achievementGen = els.promptAchievementGen.value;
    }
    if (els.promptLevelNaming) {
      store.aiConfig.prompts.levelNaming = els.promptLevelNaming.value;
    }

    saveStore(store);
    _showToast('提示词已保存', 'success');
  }

  function resetPrompt(promptKey) {
    const defaultText = DEFAULT_PROMPTS[promptKey];
    if (!defaultText) return;

    const textareaMap = {
      eventAnalysis:  els.promptEventAnalysis,
      achievementGen: els.promptAchievementGen,
      levelNaming:    els.promptLevelNaming,
    };

    const textarea = textareaMap[promptKey];
    if (textarea) textarea.value = defaultText;

    const store = getStore();
    if (!store.aiConfig) store.aiConfig = {};
    if (!store.aiConfig.prompts) store.aiConfig.prompts = {};
    store.aiConfig.prompts[promptKey] = defaultText;
    saveStore(store);

    _showToast('已恢复默认提示词', 'info');
  }

  async function testConnection() {
    if (!els.btnTest || !els.connectionStatus) return;

    saveAIConfig();

    if (!AI.isAIAvailable()) {
      els.connectionStatus.textContent = '✗ 请先填写 API URL 和 API Key';
      els.connectionStatus.className = 'connection-status connection-status--error';
      return;
    }

    els.btnTest.disabled = true;
    els.btnTest.querySelector('.btn__text').textContent = '测试中...';
    els.connectionStatus.textContent = '';
    els.connectionStatus.className = 'connection-status';

    try {
      const result = await AI.testConnection();
      if (result.success) {
        els.connectionStatus.textContent = `✓ ${result.message}`;
        els.connectionStatus.className = 'connection-status connection-status--success';
        _showToast('AI 连接测试成功', 'success');
      } else {
        els.connectionStatus.textContent = `✗ ${result.message}`;
        els.connectionStatus.className = 'connection-status connection-status--error';
        _showToast('AI 连接测试失败', 'error');
      }
    } catch (err) {
      els.connectionStatus.textContent = `✗ ${err.message}`;
      els.connectionStatus.className = 'connection-status connection-status--error';
      _showToast('AI 连接测试失败', 'error');
    } finally {
      els.btnTest.disabled = false;
      els.btnTest.querySelector('.btn__text').textContent = '测试连接';
    }
  }

  function handleExport() {
    try {
      const jsonStr = exportData();
      const blob    = new Blob([jsonStr], { type: 'application/json' });
      const url     = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href     = url;
      a.download = `absurdity-index-backup-${_dateStamp()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      _showToast('数据已导出', 'success');
    } catch (err) {
      console.error('[Settings] Export failed:', err);
      _showToast('导出失败: ' + err.message, 'error');
    }
  }

  function handleImport(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        importData(e.target.result);
        loadSettings();
        _showToast('数据导入成功', 'success');
        _refreshSiblingModules();
      } catch (err) {
        console.error('[Settings] Import failed:', err);
        _showToast('导入失败: ' + err.message, 'error');
      }
    };
    reader.onerror = () => _showToast('文件读取失败', 'error');
    reader.readAsText(file);

    event.target.value = '';
  }

  function handleClear() {
    _showConfirmModal(
      '⚠️ 确认清空数据',
      '<p>此操作将<strong>永久删除</strong>所有荒谬记录、成就和配置数据。</p><p>此操作不可撤销。</p>',
      [
        { label: '取消',     className: 'btn btn--ghost', action: 'close' },
        { label: '确认清空', className: 'btn btn--danger', action: 'confirm-clear' },
      ],
      (action) => {
        if (action === 'confirm-clear') {
          clearData();
          loadSettings();
          _showToast('所有数据已清空', 'warning');
          _refreshSiblingModules();
        }
      }
    );
  }

  function _refreshSiblingModules() {
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
    console.log(`[Settings][${type}] ${message}`);
  }

  function _showConfirmModal(title, bodyHTML, buttons, callback) {
    if (typeof showModal === 'function') {
      showModal(title, bodyHTML, buttons, callback);
      return;
    }
    if (confirm(title.replace(/<[^>]+>/g, '') + '\n\n确定要继续吗？')) {
      const confirmBtn = buttons.find(b => b.action && b.action !== 'close');
      if (confirmBtn && callback) callback(confirmBtn.action);
    }
  }

  function _dateStamp() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  return {
    initSettings,
    loadSettings,
    saveAIConfig,
    savePrompts,
    resetPrompt,
    testConnection,
    handleExport,
    handleImport,
    handleClear,
  };

})();
