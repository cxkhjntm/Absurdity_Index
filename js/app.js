'use strict';

/**
 * ABSURDITY INDEX — Application Entry Point
 *
 * 初始化所有模块，管理页面导航、模态框和 Toast 通知。
 * 所有函数暴露为全局变量，供其他模块调用。
 */

(function () {
  /* ================================================================
     STATE
     ================================================================ */

  let _currentPage = 'dashboard';

  function initApp() {
    if (typeof initStore === 'function') {
      initStore();
    }

    _initModules();

    setupNavigation();
    setupQuickRecord();
    setupModal();

    const hash = (location.hash || '').replace('#', '');
    const initialPage = _isValidPage(hash) ? hash : 'dashboard';
    navigateTo(initialPage, { initial: true });

    console.log('[ABSURDITY INDEX] System online // 系统已启动');
  }

  function _initModules() {
    if (typeof Dashboard !== 'undefined' && Dashboard.initDashboard) {
      Dashboard.initDashboard();
    }
    if (typeof Record !== 'undefined' && Record.initRecord) {
      Record.initRecord();
    }
    if (typeof Achievements !== 'undefined' && Achievements.initAchievements) {
      Achievements.initAchievements();
    }
    if (typeof Report !== 'undefined' && Report.initReport) {
      Report.initReport();
    }
    if (typeof Settings !== 'undefined' && Settings.initSettings) {
      Settings.initSettings();
    }
  }

  /* ================================================================
     NAVIGATION
     ================================================================ */

  function setupNavigation() {
    var sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.addEventListener('click', function (e) {
        var link = e.target.closest('.sidebar__link');
        if (!link) return;
        e.preventDefault();

        var pageName = link.getAttribute('data-page');
        if (pageName) {
          navigateTo(pageName);
        }
      });
    }

    window.addEventListener('hashchange', function () {
      var hash = (location.hash || '').replace('#', '');
      if (_isValidPage(hash) && hash !== _currentPage) {
        navigateTo(hash, { fromHash: true });
      }
    });
  }

  function navigateTo(pageName, opts) {
    opts = opts || {};
    if (!_isValidPage(pageName)) return;

    _activatePage(pageName);
    _activateNav(pageName);

    if (!opts.fromHash && !opts.initial) {
      location.hash = pageName;
    }

    refreshPage(pageName);

    _currentPage = pageName;
  }

  function refreshPage(pageName) {
    switch (pageName) {
      case 'dashboard':
        if (typeof Dashboard !== 'undefined' && Dashboard.updateDashboard) {
          Dashboard.updateDashboard();
        }
        break;
      case 'record':
        break;
      case 'achievements':
        if (typeof Achievements !== 'undefined' && Achievements.renderAchievements) {
          Achievements.renderAchievements();
        }
        break;
      case 'report':
        if (typeof Report !== 'undefined' && Report.populateWeekSelector) {
          Report.populateWeekSelector();
        }
        if (typeof Report !== 'undefined' && Report.renderReport) {
          var reportData = Report.generateReport(0);
          Report.renderReport(reportData);
        }
        break;
      case 'settings':
        if (typeof Settings !== 'undefined' && Settings.loadSettings) {
          Settings.loadSettings();
        }
        break;
    }
  }

  function _activatePage(pageName) {
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
      var page = pages[i];
      if (page.getAttribute('data-page') === pageName) {
        page.classList.add('page--active');
      } else {
        page.classList.remove('page--active');
      }
    }
  }

  function _activateNav(pageName) {
    var links = document.querySelectorAll('.sidebar__link');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link.getAttribute('data-page') === pageName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  }

  function _isValidPage(pageName) {
    var valid = ['dashboard', 'record', 'achievements', 'report', 'settings'];
    return valid.indexOf(pageName) !== -1;
  }

  /* ================================================================
     QUICK RECORD
     ================================================================ */

  function setupQuickRecord() {
    var btn = document.getElementById('btn-quick-record');
    if (!btn) return;

    btn.addEventListener('click', function () {
      navigateTo('record');
    });
  }

  /* ================================================================
     MODAL
     ================================================================ */

  function setupModal() {
    var overlay   = document.getElementById('modal-overlay');
    var btnClose  = document.getElementById('btn-modal-close');

    if (btnClose) {
      btnClose.addEventListener('click', hideModal);
    }

    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          hideModal();
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        hideModal();
      }
    });
  }

  /**
   * 显示模态框。
   *
   * 支持两种 buttons 格式：
   * 1. [{ text, className, onClick }]       — Record 模块使用
   * 2. [{ label, className, action }] + cb  — Settings 模块使用
   *
   * @param {string}   title    - 模态框标题
   * @param {string}   bodyHTML - 模态框正文 HTML
   * @param {Object[]} buttons  - 按钮配置数组
   * @param {Function} [callback] - settings 风格的回调，接收 action 字符串
   */
  function showModal(title, bodyHTML, buttons, callback) {
    var overlay   = document.getElementById('modal-overlay');
    var titleEl   = document.getElementById('modal-title');
    var bodyEl    = document.getElementById('modal-body');
    var footerEl  = document.getElementById('modal-footer');

    if (!overlay || !titleEl || !bodyEl || !footerEl) return;

    titleEl.textContent = title || '';
    bodyEl.innerHTML = bodyHTML || '';
    footerEl.innerHTML = '';

    if (Array.isArray(buttons)) {
      buttons.forEach(function (btn) {
        var buttonEl = document.createElement('button');
        buttonEl.type = 'button';
        buttonEl.className = btn.className || 'btn btn--primary';
        buttonEl.textContent = btn.text || btn.label || '确定';

        if (typeof btn.onClick === 'function') {
          buttonEl.addEventListener('click', function (e) {
            btn.onClick(e);
          });
        }

        if (btn.action && typeof callback === 'function') {
          buttonEl.addEventListener('click', function () {
            callback(btn.action);
          });
        }

        footerEl.appendChild(buttonEl);
      });
    }

    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    var closeBtn = document.getElementById('btn-modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function hideModal() {
    var overlay = document.getElementById('modal-overlay');
    if (!overlay) return;

    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  /* ================================================================
     TOAST
     ================================================================ */

  /**
   * 显示一条 Toast 通知。
   * 自动在 3 秒后淡出移除。
   *
   * @param {string} message - 通知文本
   * @param {string} [type]  - 类型： success | error | warning | info（默认 info）
   */
  function showToast(message, type) {
    type = type || 'info';

    var container = document.getElementById('toast-container');
    if (!container) {
      console.log('[Toast][' + type + '] ' + message);
      return;
    }

    var toast = document.createElement('div');
    toast.className = 'toast toast--' + _escapeAttr(type);

    var iconMap = {
      success: '\u2713',
      error:   '\u2717',
      warning: '\u26A0',
      info:    '\u2139',
    };

    toast.innerHTML =
      '<span class="toast__icon">' + (iconMap[type] || iconMap.info) + '</span>' +
      '<span class="toast__message">' + _escapeHtml(message) + '</span>';

    container.appendChild(toast);

    void toast.offsetWidth;
    toast.classList.add('toast--visible');

    setTimeout(function () {
      toast.classList.remove('toast--visible');
      toast.classList.add('toast--exiting');
      toast.addEventListener('transitionend', function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, { once: true });

      setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 500);
    }, 3000);
  }

  /* ================================================================
     HELPERS
     ================================================================ */

  function _escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str || ''));
    return div.innerHTML;
  }

  function _escapeAttr(str) {
    return (str || '').replace(/[^a-z0-9_-]/gi, '');
  }

  /* ================================================================
     EXPOSE GLOBALS
     ================================================================ */

  window.initApp      = initApp;
  window.setupNavigation  = setupNavigation;
  window.navigateTo   = navigateTo;
  window.refreshPage  = refreshPage;
  window.setupQuickRecord = setupQuickRecord;
  window.setupModal   = setupModal;
  window.showModal    = showModal;
  window.hideModal    = hideModal;
  window.showToast    = showToast;

  /* ================================================================
     BOOTSTRAP
     ================================================================ */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
