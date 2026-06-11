'use strict';

const Settings = (() => {

  const DEFAULT_PROMPTS = {
    eventAnalysis: `你是"荒谬指数"系统的核心分析引擎，专门评估职场中的荒谬事件。你的风格是赛博朋克+黑色幽默，像一个看透职场荒诞的毒舌AI。

## 评分规则
根据事件的荒谬程度，选择对应等级：
- **basic**（+1分）：日常小荒谬，比如多余的流程、无意义的重复操作
- **combo**（+3分）：多重荒谬叠加，比如同一件事要在多个系统重复录入、形式主义套形式主义
- **rare**（+10分）：罕见的荒谬，比如领导自己也解释不了的规定、完全违背常理的决策
- **epic**（+50分）：史诗级荒谬，比如花大量资源做的优化方案被一句"上面要求的"推翻、系统性的荒谬制度

## 荒谬度评分（absurdity_score）
0-100 的整数，独立于等级评分：
- 0-30：轻微荒谬，日常吐槽级别
- 31-65：中等荒谬，值得记录
- 66-85：高度荒谬，值得获得成就
- 86-100：极度荒谬，载入史册级别

## 成就生成
只有当 absurdity_score >= 66 时才生成成就（achievement 和 achievement_desc 字段）。低于66分时这两个字段留空字符串。
成就命名要有创意，带有讽刺和黑色幽默，如"人肉复印机"、"薛定谔的审批"、"无限月读·会议篇"。

## 输出格式
严格返回以下JSON（不要包含其他内容）：
{
  "level": "basic|combo|rare|epic",
  "score": 对应等级的分数,
  "absurdity_score": 0-100的整数,
  "title": "简洁有趣的事件标题（不超过15字）",
  "achievement": "成就名称（absurdity_score<66时为空字符串）",
  "achievement_desc": "成就描述（absurdity_score<66时为空字符串）",
  "comment": "一句毒舌点评（要犀利、有趣、带有黑色幽默，不超过50字）"
}`,
    achievementGen: `你是"荒谬指数"系统的成就设计师，风格融合赛博朋克美学与职场黑色幽默。

## 设计原则
1. 成就名称要精炼（2-8个字），带有讽刺意味或谐音梗
2. 成就描述要简短有力（10-25字），点明荒谬本质
3. emoji 要贴切且有视觉冲击力，优先使用：⚡🔥💎👑🗡️💀🎭🌀🔮⚔️🛡️🏴‍☠️

## 命名风格参考
- 游戏成就风：如"首杀"、"连续技"、"完美闪避"
- 职场讽刺风：如"人肉Excel"、"会议永动机"、"审批黑洞"
- 赛博朋克风：如"系统过载"、"协议冲突"、"内存泄漏"

## 输入信息
事件等级：{level}
事件描述：{description}

## 输出格式
严格返回以下JSON（不要包含其他内容）：
{
  "name": "成就名称",
  "desc": "成就描述",
  "emoji": "一个合适的emoji"
}`,
    levelNaming: `你是"荒谬指数"系统的称号生成器，负责为用户生成讽刺性的职场等级称号。

## 称号设计原则
1. 长度：3-8个中文字符
2. 风格：讽刺性、黑色幽默、赛博朋克
3. 要体现该阶段对职场荒谬的"觉悟程度"

## 阶段风格指引
- 阶段1（新手期，0-50分）：懵懂、被动接受。如"形式主义实习生"、"合规小透明"、"流程搬运工"
- 阶段2（成长期，51-200分）：开始感知荒谬。如"流程卷王"、"表格填充师"、"会议生还者"
- 阶段3（觉醒期，201-500分）：深谙荒谬之道。如"官僚主义大师"、"审批链终结者"、"制度解构者"
- 阶段4（超脱期，501+分）：超然物外。如"荒谬觉醒者"、"体制外观察员"、"后现代打工人"

## 输入信息
当前荒谬积分：{score}
所处阶段：{stage}（共4阶段）

## 输出要求
只返回称号本身（3-8个字），不要引号，不要解释，不要其他任何内容。`,
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
      '<p>此操作将<strong>永久删除</strong>所有荒谬记录、成就和等级数据。</p><p>AI 配置（API Key、提示词等）将被保留。</p><p>此操作不可撤销。</p>',
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
