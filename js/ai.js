'use strict';

const AI = (() => {

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
只返回称号本身（3-8个字），不要引号，不要解释，不要其他任何内容。`
  };


  /**
   * Get AI configuration from store
   * @returns {Object} AI config
   */
  function getAIConfig() {
    const store = getStore();
    const cfg  = store.aiConfig || {};

    return {
      enabled:  cfg.enabled  ?? false,
      baseUrl:  cfg.baseUrl  || 'https://api.openai.com/v1',
      apiKey:   cfg.apiKey   ?? '',
      model:    cfg.model    ?? 'gpt-3.5-turbo',
      prompts: {
        eventAnalysis:   cfg.prompts?.eventAnalysis   ?? DEFAULT_PROMPTS.eventAnalysis,
        achievementGen:  cfg.prompts?.achievementGen   ?? DEFAULT_PROMPTS.achievementGen,
        levelNaming:     cfg.prompts?.levelNaming      ?? DEFAULT_PROMPTS.levelNaming,
      }
    };
  }

  /**
   * Check if AI is configured and available
   * @returns {boolean}
   */
  function isAIAvailable() {
    const cfg = getAIConfig();
    return !!(cfg.baseUrl && cfg.apiKey);
  }

  /**
   * Call an OpenAI-compatible chat completions endpoint
   * @param {Array<{role:string, content:string}>} messages
   * @param {Object} [options] – override model / temperature / max_tokens
   * @returns {Promise<string>} assistant message content
   */
  async function callAI(messages, options = {}) {
    const cfg = getAIConfig();

    if (!isAIAvailable()) {
      throw new Error('AI not configured');
    }

    const url = `${cfg.baseUrl.replace(/\/+$/, '')}/chat/completions`;

    const body = {
      model:       options.model       ?? cfg.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens:  options.max_tokens  ?? 500,
    };

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify(body),
      });
    } catch (networkErr) {
      throw new Error(`Network error: ${networkErr.message}`);
    }

    if (!response.ok) {
      let errText = '';
      try { errText = await response.text(); } catch (_) { }
      throw new Error(`AI API error: ${response.status} – ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  /**
   * Analyze an absurd event description
   * @param {string} description
   * @returns {Promise<Object>} { level, score, title, achievement, achievement_desc, comment }
   */
  async function analyzeEvent(description) {
    const cfg = getAIConfig();

    const messages = [
      { role: 'system', content: cfg.prompts.eventAnalysis },
      { role: 'user',   content: description },
    ];

    try {
      const raw = await callAI(messages);
      const parsed = _extractJSON(raw);
      if (parsed) return parsed;
      throw new Error('Invalid JSON response');
    } catch (err) {
      console.error('[AI] analyzeEvent failed, using fallback:', err);
      return getFallbackAnalysis(description);
    }
  }

  /**
   * Generate an achievement for a given event
   * @param {string} level   – event level (basic / combo / rare / epic)
   * @param {string} description
   * @returns {Promise<Object>} { name, desc, emoji }
   */
  async function generateAchievement(level, description) {
    const cfg = getAIConfig();

    const prompt = cfg.prompts.achievementGen
      .replace(/\{level\}/g, level)
      .replace(/\{description\}/g, description);

    const messages = [{ role: 'user', content: prompt }];

    try {
      const raw = await callAI(messages);
      const parsed = _extractJSON(raw);
      if (parsed) return parsed;
      throw new Error('Invalid JSON response');
    } catch (err) {
      console.error('[AI] generateAchievement failed, using fallback:', err);
      return getFallbackAchievement(level);
    }
  }

  /**
   * Generate a level / title name
   * @param {number} score – current total score
   * @param {number} stage – current stage (1‑4)
   * @returns {Promise<string>}
   */
  async function generateLevelName(score, stage) {
    const cfg = getAIConfig();

    const prompt = cfg.prompts.levelNaming
      .replace(/\{score\}/g, score)
      .replace(/\{stage\}/g, stage);

    const messages = [{ role: 'user', content: prompt }];

    try {
      const raw = await callAI(messages);
      return raw.trim().replace(/^["'"']+|["'"']+$/g, '');
    } catch (err) {
      console.error('[AI] generateLevelName failed, using fallback:', err);
      return getFallbackLevelName(stage);
    }
  }

  /**
   * Test connectivity to the configured AI endpoint
   * @returns {Promise<{success:boolean, message:string, response?:string}>}
   */
  async function testConnection() {
    try {
      const reply = await callAI([
        { role: 'user', content: 'Hello, this is a connection test. Reply with "OK" only.' }
      ], { max_tokens: 10 });

      return {
        success:  true,
        message:  '连接成功',
        response: reply.trim(),
      };
    } catch (err) {
      return {
        success: false,
        message: err.message,
      };
    }
  }

  /**
   * Keyword-based fallback analysis when AI is unavailable
   * @param {string} description
   * @returns {Object}
   */
  function getFallbackAnalysis(description) {
    const lower = description.toLowerCase();

    let level = 'basic';
    let score = 1;

    if (/领导|上级|总监|总裁|boss/i.test(lower)) {
      level = 'rare';  score = 10;
    } else if (/驳回|返工|推翻|优化|重做/i.test(lower)) {
      level = 'epic';  score = 50;
    } else if (/重复|多处|三[次个遍]|来回|第[二三四五]次/i.test(lower)) {
      level = 'combo'; score = 3;
    }

    const title = description.length > 20
      ? description.substring(0, 20) + '…'
      : description;

    // Map level to a reasonable absurdity score for fallback
    const absurdityMap = { basic: 30, combo: 50, rare: 70, epic: 90 };

    return {
      level,
      score,
      absurdity_score: absurdityMap[level] || 30,
      title,
      achievement:      null,
      achievement_desc:  null,
      comment:          '⚠️ AI 暂时无法分析，已使用默认评分',
    };
  }

  /**
   * Return a random fallback achievement for the given level
   * @param {string} level
   * @returns {Object} { name, desc, emoji }
   */
  function getFallbackAchievement(level) {
    const pool = {
      basic: [
        { name: '初入荒谬',   desc: '记录了第一件荒谬事',        emoji: '📝' },
        { name: '日常吐槽',   desc: '又一件荒谬事',              emoji: '😤' },
        { name: '小丑竟是我', desc: '习惯就好',                  emoji: '🤡' },
      ],
      combo: [
        { name: '连击大师',   desc: '荒谬事接连不断',            emoji: '🔗' },
        { name: '重复受害者', desc: '被重复流程折磨',            emoji: '🔄' },
        { name: '套娃现场',   desc: '荒谬之中还有荒谬',          emoji: '🪆' },
      ],
      rare: [
        { name: '稀有发现',   desc: '发现了罕见的荒谬',          emoji: '💎' },
        { name: '领导认证',   desc: '连领导都看不下去了',        emoji: '👔' },
        { name: '会议终结者', desc: '一个会开了三小时',          emoji: '⏰' },
      ],
      epic: [
        { name: '史诗级荒谬', desc: '见证了史诗级的荒谬',        emoji: '🔥' },
        { name: '荒谬觉醒',   desc: '荒谬指数爆表',              emoji: '⚡' },
        { name: '系统崩溃',   desc: '连系统都无法承受的荒谬',    emoji: '💥' },
      ],
    };

    const candidates = pool[level] || pool.basic;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  /**
   * Return a fallback level name for the given stage
   * @param {number} stage (1‑4)
   * @returns {string}
   */
  function getFallbackLevelName(stage) {
    const names = {
      1: '形式主义实习生',
      2: '流程卷王',
      3: '官僚主义大师',
      4: '荒谬觉醒者',
    };
    return names[stage] || '荒谬新手';
  }

  /**
   * Try to extract the first JSON object from a string
   * @param {string} text
   * @returns {Object|null}
   */
  function _extractJSON(text) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch (_) {
      return null;
    }
  }

  return {
    getAIConfig,
    isAIAvailable,
    callAI,
    analyzeEvent,
    generateAchievement,
    generateLevelName,
    testConnection,
    getFallbackAnalysis,
    getFallbackAchievement,
    getFallbackLevelName,
  };

})();
