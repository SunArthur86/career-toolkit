/* ===== 主入口 ===== */
// (safeLS 已移至 safe-ls.js，确保最先加载)

// ===== 全局工具函数 =====
function esc(s) {
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
function showToast(msg, type) {
  var c = document.getElementById('toast-container');
  if (!c) return;
  var t = document.createElement('div');
  t.className = 'toast toast-' + (type || 'info');
  t.textContent = msg;
  c.appendChild(t);
  requestAnimationFrame(function() { t.classList.add('show'); });
  setTimeout(function() {
    t.classList.remove('show');
    setTimeout(function() { t.remove(); }, 300);
  }, 2500);
}
function clipboardWrite(text, btn) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      if (btn) { var orig = btn.textContent; btn.textContent = '✅'; setTimeout(function(){ btn.textContent = orig; }, 1500); }
      showToast('已复制到剪贴板', 'success');
    }).catch(function() { fallbackCopy(text, btn); });
  } else {
    fallbackCopy(text, btn);
  }
}
function fallbackCopy(text, btn) {
  var ta = document.createElement('textarea');
  ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); if (btn) { var orig = btn.textContent; btn.textContent = '✅'; setTimeout(function(){ btn.textContent = orig; }, 1500); } showToast('已复制到剪贴板', 'success'); }
  catch(e) { showToast('复制失败，请手动复制', 'error'); }
  document.body.removeChild(ta);
}

(async function() {
  // 等待题库加载
  if (typeof loadQuestions === 'function') {
    await loadQuestions();
  }
  // 隐藏加载动画
  var loader = document.getElementById('loader-overlay');
  if (loader) {
    setTimeout(function() { loader.classList.add('hidden'); }, 300);
    setTimeout(function() { loader.style.display = 'none'; }, 800);
  }
  // ===== 深色模式 =====
  var savedTheme = safeLS.getItem('ct-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  document.getElementById('theme-toggle').addEventListener('click', function() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    safeLS.setItem('ct-theme', next);
    updateThemeIcon(next);
  });

  function updateThemeIcon(theme) {
    document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // ===== Tab 切换 =====
  var tabs = document.querySelectorAll('.nav-tab');
  var panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var panel = document.getElementById('tab-' + tab.dataset.tab);
      panel.classList.add('active');
      // 重新触发动画
      panel.style.animation = 'none';
      panel.offsetHeight; // reflow
      panel.style.animation = '';
      // 算法 tab 显示时重新调整 canvas
      if (tab.dataset.tab === 'algorithm' && typeof Algorithm !== 'undefined' && Algorithm.onShow) {
        setTimeout(function() { Algorithm.onShow(); }, 100);
      }
    });
  });

  // ===== 回到顶部 =====
  var backBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) backBtn.classList.add('show');
    else backBtn.classList.remove('show');
  });
  backBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== 导出功能 =====
  var exportOverlay = document.getElementById('export-overlay');
  document.getElementById('btn-export').addEventListener('click', function() {
    var data = {
      exportDate: new Date().toISOString(),
      mastered: JSON.parse(safeLS.getItem('ct-mastered') || '[]'),
      bookmarks: JSON.parse(safeLS.getItem('ct-bookmarks') || '[]'),
      radar: JSON.parse(safeLS.getItem('ct-radar') || '{}'),
      theme: safeLS.getItem('ct-theme') || 'light',
      srCards: JSON.parse(safeLS.getItem('ct-sr-cards') || '{}'),
      notes: JSON.parse(safeLS.getItem('ct-notes') || '{}'),
      streakHistory: JSON.parse(safeLS.getItem('ct-streak-history') || '[]'),
      dailyGoal: safeLS.getItem('ct-daily-goal') || '10'
    };
    var masteredDetails = data.mastered.map(function(id) {
      var q = QUESTIONS.find(function(x) { return x.id === id; });
      return q ? { id: id, q: q.q, cat: q.cat, diff: q.diff } : { id: id };
    });
    data.masteredDetails = masteredDetails;
    data.summary = {
      totalQuestions: QUESTIONS.length,
      mastered: data.mastered.length,
      bookmarks: data.bookmarks.length,
      progress: Math.round(data.mastered.length / QUESTIONS.length * 100) + '%'
    };
    document.getElementById('export-content').textContent = JSON.stringify(data, null, 2);
    exportOverlay.classList.add('show');
  });

  document.getElementById('export-close').addEventListener('click', function() {
    exportOverlay.classList.remove('show');
  });
  exportOverlay.addEventListener('click', function(e) {
    if (e.target === this) exportOverlay.classList.remove('show');
  });

  document.getElementById('btn-export-copy').addEventListener('click', function() {
    var text = document.getElementById('export-content').textContent;
    clipboardWrite(text, this);
  });

  document.getElementById('btn-export-download').addEventListener('click', function() {
    var text = document.getElementById('export-content').textContent;
    var blob = new Blob([text], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'career-toolkit-' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // ===== 导入功能 =====
  document.getElementById('btn-import-data').addEventListener('click', function() {
    document.getElementById('import-file-input').click();
  });
  document.getElementById('import-file-input').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    // 文件大小限制 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ 文件过大（最大5MB）', 'error');
      e.target.value = '';
      return;
    }
    // 文件类型检查
    if (!file.name.endsWith('.json')) {
      showToast('⚠️ 请选择 .json 文件', 'error');
      e.target.value = '';
      return;
    }
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var data = JSON.parse(ev.target.result);
        // 验证数据格式
        if (!data.mastered || !data.bookmarks) {
          showToast('⚠️ 无效的数据文件', 'error');
          return;
        }
        if (data.mastered) safeLS.setItem('ct-mastered', JSON.stringify(data.mastered));
        if (data.bookmarks) safeLS.setItem('ct-bookmarks', JSON.stringify(data.bookmarks));
        if (data.radar) safeLS.setItem('ct-radar', JSON.stringify(data.radar));
        if (data.theme) safeLS.setItem('ct-theme', data.theme);
        if (data.srCards) safeLS.setItem('ct-sr-cards', JSON.stringify(data.srCards));
        if (data.notes) safeLS.setItem('ct-notes', JSON.stringify(data.notes));
        if (data.streakHistory) safeLS.setItem('ct-streak-history', JSON.stringify(data.streakHistory));
        if (data.dailyGoal) safeLS.setItem('ct-daily-goal', data.dailyGoal);
        document.getElementById('export-close').click();
        showToast('✅ 数据导入成功！页面将刷新', 'success');
        location.reload();
      } catch(err) {
        showToast('⚠️ 文件解析失败: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // 允许重复选择同一文件
  });

  // ===== 初始化各模块 =====
  Interview.init();
  MockInterview.init();
  Radar.init();
  Algorithm.init();

  // ===== 移动端底部Tab栏 =====
  var mobileTabs = document.querySelectorAll('.mobile-tab');
  var tabNames = ['interview', 'radar', 'algorithm'];

  function switchTab(tabName) {
    // 同步导航栏Tab
    tabs.forEach(function(t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    panels.forEach(function(p) { p.classList.remove('active'); });
    mobileTabs.forEach(function(t) { t.classList.remove('active'); });

    var navTab = document.querySelector('.nav-tab[data-tab="' + tabName + '"]');
    var panel = document.getElementById('tab-' + tabName);
    var mobileTab = document.querySelector('.mobile-tab[data-tab="' + tabName + '"]');

    if (navTab) { navTab.classList.add('active'); navTab.setAttribute('aria-selected', 'true'); }
    if (panel) { panel.classList.add('active'); panel.style.animation = 'none'; panel.offsetHeight; panel.style.animation = ''; }
    if (mobileTab) mobileTab.classList.add('active');

    // 算法 tab 显示时重新调整 canvas
    if (tabName === 'algorithm' && typeof Algorithm !== 'undefined' && Algorithm.onShow) {
      setTimeout(function() { Algorithm.onShow(); }, 100);
    }

    // URL hash路由
    if (history.replaceState) history.replaceState(null, '', '#' + tabName);
  }

  mobileTabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      switchTab(tab.dataset.tab);
    });
  });

  // 同步导航栏Tab点击到底部Tab
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      mobileTabs.forEach(function(t) { t.classList.remove('active'); });
      var mt = document.querySelector('.mobile-tab[data-tab="' + tab.dataset.tab + '"]');
      if (mt) mt.classList.add('active');
    });
  });

  // ===== 触摸手势滑动切换Tab =====
  var touchStartX = 0;
  var touchEndX = 0;
  document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    var diff = touchStartX - touchEndX;
    if (Math.abs(diff) < 80) return; // 滑动距离不够
    // 获取当前活跃tab
    var activeTab = document.querySelector('.nav-tab.active');
    if (!activeTab) return;
    var currentIdx = tabNames.indexOf(activeTab.dataset.tab);
    if (diff > 0 && currentIdx < tabNames.length - 1) {
      switchTab(tabNames[currentIdx + 1]); // 左滑→下一个
    } else if (diff < 0 && currentIdx > 0) {
      switchTab(tabNames[currentIdx - 1]); // 右滑→上一个
    }
  }, { passive: true });

  // ===== URL hash路由恢复 =====
  var hashTab = location.hash.replace('#', '');
  if (hashTab && tabNames.indexOf(hashTab) >= 0) {
    switchTab(hashTab);
  }
  window.addEventListener('hashchange', function() {
    var h = location.hash.replace('#', '');
    if (h && tabNames.indexOf(h) >= 0) switchTab(h);
  });

  // ===== 页面可见性：切Tab暂停算法 =====
  document.addEventListener('visibilitychange', function() {
    if (document.hidden && typeof Algorithm !== 'undefined' && Algorithm.pause) {
      Algorithm.pause();
    }
  });
})();
