'use strict';

const AI = (() => {

  const DEFAULT_PROMPTS = {
    eventAnalysis: `你是一个荒谬事件分析专家。用户会描述一个职场中遇到的荒谬事件。
请分析并返回 JSON 格式：
{
  "level": "basic|combo|rare|epic",
  "score": 数字（basic=1, combo=3, rare=10, epic=50）,
  "absurdity_score": 0到100的整数（表示这件事的荒谬程度，越荒谬越高），
  "title": "事件标题（简洁幽默）",
  "achievement": "成就名称（如果荒谬程度足够高，值得一个成就的话）",
  "achievement_desc": "成就描述",
  "comment": "一句毒舌点评"
}
注意：absurdity_score 是 0-100 的荒谬评分，只有真正荒谬的事件才应该给高分。achievement 字段只在你认为事件足够荒谬时才填写。`,
    achievementGen: `你是一个成就系统设计师，风格是赛博朋克+黑色幽默。
根据以下荒谬事件，生成一个有趣的成就：
事件等级：{level}，事件描述：{description}
返回 JSON：{ "name": "成就名称", "desc": "成就描述", "emoji": "一个合适的emoji" }`,
    levelNaming: `你是一个赛博朋克世界的命名大师。
当前用户荒谬积分：{score}，所处阶段：{stage}（共4阶段）。
请生成一个有趣的、带有讽刺意味的等级称号，风格参考：形式主义实习生、流程卷王、官僚主义大师。
只返回称号本身，不要其他内容。`
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
      baseUrl:  cfg.baseUrl  ?? '',
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
      .replace('{level}', level)
      .replace('{description}', description);

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
      .replace('{score}', score)
      .replace('{stage}', stage);

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
