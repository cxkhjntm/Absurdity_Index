'use strict';

const Utils = (() => {

  /**
   * 生成 UUID v4
   * 使用 crypto API（优先）或 Math.random 回退
   * @returns {string} UUID v4 字符串
   */
  function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * 将 ISO 日期字符串格式化为可读的中文格式
   * @param {string} isoString - ISO 8601 日期字符串
   * @returns {string} 格式化后的日期，如 "2026年06月05日 14:30"
   */
  function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  }

  /**
   * 计算相对时间（距今多久）
   * @param {string} isoString - ISO 8601 日期字符串
   * @returns {string} 相对时间描述，如 "3分钟前"、"2小时前"
   */
  function relativeTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';

    const now = Date.now();
    const diff = now - date.getTime();

    if (diff < 0) return '刚刚';

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    if (weeks < 4) return `${weeks}周前`;
    if (months < 12) return `${months}个月前`;
    return `${years}年前`;
  }

  /**
   * 获取给定日期所在自然周的起止日期（周一至周日）
   * @param {Date|string} [date] - 日期对象或 ISO 字符串，默认为今天
   * @returns {{ start: Date, end: Date, startStr: string, endStr: string }}
   *   start/end 为 Date 对象（零点），startStr/endStr 为 "YYYY.MM.DD" 格式字符串
   */
  function getWeekRange(date) {
    const d = date ? new Date(date) : new Date();
    if (isNaN(d.getTime())) {
      const now = new Date();
      return _buildWeekRange(now);
    }
    return _buildWeekRange(d);
  }

  function _buildWeekRange(d) {
    const day = d.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;

    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diffToMon);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      start,
      end,
      startStr: _formatDateDot(start),
      endStr: _formatDateDot(end),
    };
  }

  function _formatDateDot(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }

  /**
   * 防抖函数
   * @param {Function} fn - 要防抖的函数
   * @param {number} ms - 延迟毫秒数
   * @returns {Function} 防抖后的函数（附带 cancel 方法）
   */
  function debounce(fn, ms) {
    let timer = null;

    function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    }

    debounced.cancel = () => {
      clearTimeout(timer);
      timer = null;
    };

    return debounced;
  }

  /**
   * 将数值限制在 [min, max] 范围内
   * @param {number} val - 输入值
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 截断后的值
   */
  function clamp(val, min, max) {
    const n = Number(val);
    if (isNaN(n)) return min;
    return Math.min(Math.max(n, min), max);
  }

  return {
    generateUUID,
    formatDate,
    relativeTime,
    getWeekRange,
    debounce,
    clamp,
  };
})();
