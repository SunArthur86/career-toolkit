/* ===== 面试突击模块 (增强版) ===== */
var Interview = (function() {
  var state = {
    currentCat: '全部',
    search: '',
    showBookmarkOnly: false,
    diffFilter: 'all',
    currentModalId: null,
    mastered: JSON.parse(safeLS.getItem('ct-mastered') || '[]'),
    bookmarks: JSON.parse(safeLS.getItem('ct-bookmarks') || '[]'),
    selectedIdx: -1
  };

  function save() {
    safeLS.setItem('ct-mastered', JSON.stringify(state.mastered));
    safeLS.setItem('ct-bookmarks', JSON.stringify(state.bookmarks));
  }

  function isMastered(id) { return state.mastered.indexOf(id) >= 0; }
  function isBookmarked(id) { return state.bookmarks.indexOf(id) >= 0; }

  function getFiltered() {
    return QUESTIONS.filter(function(q) {
      if (state.currentCat !== '全部' && q.cat !== state.currentCat) return false;
      if (state.showBookmarkOnly && !isBookmarked(q.id)) return false;
      if (state.diffFilter !== 'all' && q.diff !== state.diffFilter) return false;
      if (state.search) {
        var s = state.search.toLowerCase();
        // 全文搜索：标题 + 分类 + 答案纯文本
        if (!q._searchText && q.a) q._searchText = (q.q + ' ' + q.cat + ' ' + q.a.replace(/<[^>]+>/g,'')).toLowerCase();
        var haystack = q._searchText || (q.q + ' ' + q.cat).toLowerCase();
        if (haystack.indexOf(s) < 0) return false;
      }
      return true;
    });
  }

  function highlight(text, search) {
    if (!search) return esc(text);
    var escaped = esc(text);
    var re = new RegExp('(' + search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return escaped.replace(re, '<mark>$1</mark>');
  }

  function updateStats() {
    var total = QUESTIONS.length;
    var mastered = state.mastered.length;
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-done').textContent = mastered;
    document.getElementById('stat-bookmark').textContent = state.bookmarks.length;

    var today = new Date().toDateString();
    var todayCount = JSON.parse(safeLS.getItem('ct-today') || '[]');
    var todays = todayCount.filter(function(t) { return t.date === today; });
    document.getElementById('stat-today').textContent = todays.length;

    // 复习统计
    var srStats = SR.getStats();
    var dueEl = document.getElementById('stat-due');
    if (dueEl) dueEl.textContent = srStats.due;

    // 进度条
    var pct = total > 0 ? Math.round(mastered / total * 100) : 0;
    var fill = document.getElementById('progress-fill');
    var detail = document.getElementById('progress-detail');
    var pctEl = document.getElementById('progress-pct');
    if (fill) fill.style.width = pct + '%';
    if (detail) detail.textContent = '已掌握 ' + mastered + ' / ' + total + ' 题';
    if (pctEl) pctEl.textContent = pct + '%';

    // 进度环
    var ring = document.getElementById('progress-ring');
    if (ring) {
      var circumference = 2 * Math.PI * 26;
      var offset = circumference - (pct / 100) * circumference;
      ring.style.strokeDashoffset = offset;
      var ringText = document.getElementById('progress-ring-text');
      if (ringText) ringText.textContent = pct + '%';
    }
  }

  function renderFilters() {
    var wrap = document.getElementById('category-filters');
    var html = '<span class="chip active" data-cat="全部">📋 全部 <span class="chip-count">' + QUESTIONS.length + '</span></span>';
    var catCounts = {};
    QUESTIONS.forEach(function(q) { catCounts[q.cat] = (catCounts[q.cat] || 0) + 1; });
    CATEGORIES.forEach(function(c) {
      if (catCounts[c]) {
        var icon = typeof CAT_ICONS !== 'undefined' && CAT_ICONS[c] ? CAT_ICONS[c] + ' ' : '';
        html += '<span class="chip" data-cat="' + esc(c) + '">' + icon + esc(c) + ' <span class="chip-count">' + catCounts[c] + '</span></span>';
      }
    });
    wrap.innerHTML = html;
  }

  function renderList() {
    var list = getFiltered();
    var wrap = document.getElementById('question-list');
    if (!list.length) {
      wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>没有找到匹配的题目</p><p class="empty-hint">试试调整搜索关键词或筛选条件</p></div>';
      wrap._allItems = [];
      wrap._renderCount = 0;
      return;
    }
    wrap._allItems = list;
    wrap._renderCount = 0;
    wrap._batchSize = 20;
    wrap.innerHTML = '';
    renderBatch(wrap);
  }

  function renderBatch(wrap) {
    var list = wrap._allItems;
    if (!list) return;
    var start = wrap._renderCount;
    var end = Math.min(start + wrap._batchSize, list.length);
    var frag = document.createDocumentFragment();
    for (var i = start; i < end; i++) {
      var q = list[i];
      var mClass = isMastered(q.id) ? ' mastered' : '';
      var bClass = isBookmarked(q.id) ? ' active' : '';
      var srCard = SR.getCard(q.id);
      var srBadge = '';
      if (srCard && srCard.reps > 0) {
        var dueNow = srCard.nextReview <= Date.now();
        srBadge = '<span class="q-sr-badge' + (dueNow ? ' due' : '') + '" title="下次复习:' + SR.formatNextReview(srCard.nextReview) + '">' + (dueNow ? '🔁' : '📅') + '</span>';
      }
      var noteBadge = SR.getNote(q.id) ? '<span class="q-note-badge" title="有笔记">📝</span>' : '';
      var card = document.createElement('div');
      card.className = 'q-card' + mClass;
      card.dataset.id = q.id;
      card.dataset.idx = i;
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', q.q);
      card.innerHTML = '<div class="q-num">' + (i + 1) + '</div>' +
        '<div class="q-content"><div class="q-title">' + highlight(q.q, state.search) + '</div>' +
        '<div class="q-meta">' + esc(q.cat) + '</div></div>' +
        '<div class="q-tags"><span class="q-tag ' + q.diff + '">' + q.diff + '</span>' + srBadge + noteBadge + '</div>' +
        '<span class="q-fav' + bClass + '" data-fav="' + q.id + '">⭐</span>';
      frag.appendChild(card);
    }
    wrap.appendChild(frag);
    wrap._renderCount = end;
    // 选中状态
    updateSelectedCard();
  }

  function updateSelectedCard() {
    var cards = document.querySelectorAll('#question-list .q-card');
    cards.forEach(function(c) { c.classList.remove('selected'); });
    if (state.selectedIdx >= 0) {
      var target = document.querySelector('#question-list .q-card[data-idx="' + state.selectedIdx + '"]');
      if (target) target.classList.add('selected');
    }
  }

  function openModal(id) {
    var q = QUESTIONS.find(function(x) { return x.id === id; });
    if (!q) return;
    state.currentModalId = id;
    document.getElementById('modal-category').textContent = q.cat;
    var diffEl = document.getElementById('modal-difficulty');
    diffEl.textContent = q.diff;
    diffEl.className = 'modal-difficulty ' + q.diff;
    document.getElementById('modal-title').textContent = q.q;
    document.getElementById('modal-body').innerHTML = q.a;

    // SR 状态显示
    var srCard = SR.getCard(id);
    var srInfoEl = document.getElementById('modal-sr-info');
    if (srCard) {
      srInfoEl.innerHTML = '<span class="modal-sr-stat">📅 下次复习: ' + SR.formatNextReview(srCard.nextReview) + '</span>' +
        '<span class="modal-sr-stat">🔁 已复习: ' + srCard.reps + '次</span>' +
        '<span class="modal-sr-stat">📊 熟练度: ' + srCard.ease.toFixed(1) + '</span>';
      srInfoEl.style.display = 'flex';
    } else {
      srInfoEl.innerHTML = '<span class="modal-sr-stat">💡 点击评分按钮开始间隔复习</span>';
      srInfoEl.style.display = 'flex';
    }

    // 笔记区域
    var noteArea = document.getElementById('modal-note-area');
    noteArea.value = SR.getNote(id);

    // 代码块复制按钮
    setTimeout(function() {
      document.querySelectorAll('#modal-body pre').forEach(function(pre) {
        if (pre.querySelector('.code-copy-btn')) return;
        var btn = document.createElement('button');
        btn.textContent = '复制';
        btn.className = 'code-copy-btn';
        btn.addEventListener('click', function() {
          clipboardWrite(pre.textContent, btn);
        });
        pre.style.position = 'relative';
        pre.appendChild(btn);
      });
    }, 50);

    var favBtn = document.getElementById('btn-fav');
    favBtn.textContent = isBookmarked(id) ? '⭐ 取消收藏' : '⭐ 收藏';
    var masterBtn = document.getElementById('btn-master');
    masterBtn.textContent = isMastered(id) ? '↩️ 取消掌握' : '✅ 已掌握';
    document.getElementById('question-modal').classList.add('show');
  }

  function closeModal() {
    // 自动保存笔记
    if (state.currentModalId) {
      var noteText = document.getElementById('modal-note-area').value;
      SR.saveNote(state.currentModalId, noteText);
    }
    document.getElementById('question-modal').classList.remove('show');
    state.currentModalId = null;
  }

  function toggleMaster() {
    var id = state.currentModalId;
    if (!id) return;
    var idx = state.mastered.indexOf(id);
    if (idx >= 0) state.mastered.splice(idx, 1);
    else state.mastered.push(id);
    save();
    var today = new Date().toDateString();
    var todayList = JSON.parse(safeLS.getItem('ct-today') || '[]');
    todayList.push({ id: id, date: today });
    var weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    var weekStr = weekAgo.toDateString();
    todayList = todayList.filter(function(t) { return t.date >= weekStr || new Date(t.date) >= weekAgo; });
    safeLS.setItem('ct-today', JSON.stringify(todayList));
    recordStreakDay();
    updateStats();
    updateStudyPlan();
    renderList();
    openModal(id);
  }

  function toggleFav() {
    var id = state.currentModalId;
    if (!id) return;
    var idx = state.bookmarks.indexOf(id);
    if (idx >= 0) state.bookmarks.splice(idx, 1);
    else state.bookmarks.push(id);
    save();
    updateStats();
    renderList();
    openModal(id);
  }

  function toggleFavFromList(id) {
    var idx = state.bookmarks.indexOf(id);
    if (idx >= 0) state.bookmarks.splice(idx, 1);
    else state.bookmarks.push(id);
    save();
    updateStats();
    renderList();
  }

  function nextQuestion(dir) {
    var list = getFiltered();
    var curIdx = list.findIndex(function(q) { return q.id === state.currentModalId; });
    var next = curIdx + dir;
    if (next < 0) next = list.length - 1;
    if (next >= list.length) next = 0;
    if (list[next]) openModal(list[next].id);
  }

  function randomQuestion() {
    var list = getFiltered();
    if (list.length) openModal(list[Math.floor(Math.random() * list.length)].id);
  }

  function calcStreak() {
    var history = JSON.parse(safeLS.getItem('ct-streak-history') || '[]');
    var today = new Date(); today.setHours(0,0,0,0);
    var streak = 0;
    var d = new Date(today);
    var todayStr = d.toDateString();
    var todayHasActivity = history.indexOf(todayStr) >= 0;
    if (!todayHasActivity) d.setDate(d.getDate() - 1);
    while (history.indexOf(d.toDateString()) >= 0) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  function recordStreakDay() {
    var history = JSON.parse(safeLS.getItem('ct-streak-history') || '[]');
    var today = new Date().toDateString();
    if (history.indexOf(today) < 0) {
      history.push(today);
      if (history.length > 90) history = history.slice(-90);
      safeLS.setItem('ct-streak-history', JSON.stringify(history));
    }
  }

  function updateStudyPlan() {
    var sel = document.getElementById('daily-goal-select');
    var goal = parseInt(sel.value, 10) || 10;
    safeLS.setItem('ct-daily-goal', goal);
    var today = new Date().toDateString();
    var todayList = JSON.parse(safeLS.getItem('ct-today') || '[]');
    var todayCount = todayList.filter(function(t) { return t.date === today; }).length;
    var pct = Math.min(100, Math.round(todayCount / goal * 100));

    document.getElementById('daily-done').textContent = todayCount;
    document.getElementById('daily-target').textContent = goal;
    document.getElementById('daily-bar-fill').style.width = pct + '%';
    document.getElementById('streak-count').textContent = calcStreak();

    var hint = document.getElementById('streak-hint');
    var streak = calcStreak();
    if (!hint) return;
    if (streak === 0 && todayCount === 0) {
      hint.textContent = '💡 从今天开始，每天完成目标即可累计连续天数！';
      hint.style.display = 'block';
    } else if (streak === 0 && todayCount > 0) {
      hint.textContent = '🎯 再坚持一天就能开始连续打卡！';
      hint.style.display = 'block';
    } else if (pct >= 100) {
      hint.textContent = '🎉 今日目标已达成！继续加油！';
      hint.style.display = 'block';
    } else {
      hint.style.display = 'none';
    }

    // 复习面板更新
    var srStats = SR.getStats();
    var duePanel = document.getElementById('sr-due-count');
    if (duePanel) duePanel.textContent = srStats.due;
    var learnedPanel = document.getElementById('sr-learned-count');
    if (learnedPanel) learnedPanel.textContent = srStats.learned;
    var totalPanel = document.getElementById('sr-total-count');
    if (totalPanel) totalPanel.textContent = srStats.total;
  }

  function init() {
    renderFilters();
    renderList();
    updateStats();

    var savedGoal = safeLS.getItem('ct-daily-goal');
    if (savedGoal) document.getElementById('daily-goal-select').value = savedGoal;
    updateStudyPlan();

    document.getElementById('daily-goal-select').addEventListener('change', updateStudyPlan);

    // 快捷键帮助
    document.getElementById('btn-shortcuts').addEventListener('click', function() {
      document.getElementById('shortcuts-overlay').classList.add('show');
    });
    document.getElementById('shortcuts-close').addEventListener('click', function() {
      document.getElementById('shortcuts-overlay').classList.remove('show');
    });
    document.getElementById('shortcuts-overlay').addEventListener('click', function(e) {
      if (e.target === this) this.classList.remove('show');
    });

    // 搜索（防抖200ms）
    var searchTimer = null;
    document.getElementById('search-input').addEventListener('input', function(e) {
      clearTimeout(searchTimer);
      var val = e.target.value;
      searchTimer = setTimeout(function() {
        state.search = val;
        state.selectedIdx = -1;
        renderList();
      }, 200);
    });

    // 分类筛选
    document.getElementById('category-filters').addEventListener('click', function(e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      state.currentCat = chip.dataset.cat;
      document.querySelectorAll('#category-filters .chip').forEach(function(c) { c.classList.remove('active'); });
      chip.classList.add('active');
      renderList();
    });

    // 收藏筛选
    document.getElementById('btn-bookmark-filter').addEventListener('click', function() {
      state.showBookmarkOnly = !state.showBookmarkOnly;
      this.classList.toggle('active');
      renderList();
    });

    // 难度筛选
    var diffs = ['all', 'easy', 'medium', 'hard'];
    var diffIdx = 0;
    document.getElementById('btn-difficulty').addEventListener('click', function() {
      diffIdx = (diffIdx + 1) % diffs.length;
      state.diffFilter = diffs[diffIdx];
      this.textContent = state.diffFilter === 'all' ? '难度 ▾' : '难度: ' + state.diffFilter;
      renderList();
    });

    // 随机
    document.getElementById('btn-random').addEventListener('click', randomQuestion);

    // 闪卡模式入口
    document.getElementById('btn-flash-review').addEventListener('click', function() { SR.startFlashcard('review'); });
    document.getElementById('btn-flash-random').addEventListener('click', function() { SR.startFlashcard('random'); });
    document.getElementById('btn-flash-weak').addEventListener('click', function() { SR.startFlashcard('weak'); });
    document.getElementById('btn-flash-bookmark').addEventListener('click', function() { SR.startFlashcard('bookmark'); });

    // 列表点击
    var qList = document.getElementById('question-list');
    qList.addEventListener('click', function(e) {
      var fav = e.target.closest('.q-fav');
      if (fav) { toggleFavFromList(parseInt(fav.dataset.fav, 10)); return; }
      var card = e.target.closest('.q-card');
      if (card) {
        state.selectedIdx = parseInt(card.dataset.idx, 10);
        updateSelectedCard();
        openModal(parseInt(card.dataset.id, 10));
      }
    });
    qList.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var card = e.target.closest('.q-card');
        if (card) openModal(parseInt(card.dataset.id, 10));
      }
    });

    // 列表键盘导航 j/k
    document.addEventListener('keydown', function(e) {
      if (document.getElementById('question-modal').classList.contains('show')) return;
      if (document.getElementById('flashcard-overlay').classList.contains('show')) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      var list = qList._allItems || [];
      if (e.key === 'j') {
        e.preventDefault();
        if (state.selectedIdx < list.length - 1) { state.selectedIdx++; updateSelectedCard(); scrollSelectedIntoView(); }
      } else if (e.key === 'k') {
        e.preventDefault();
        if (state.selectedIdx > 0) { state.selectedIdx--; updateSelectedCard(); scrollSelectedIntoView(); }
      } else if (e.key === 'Enter' && state.selectedIdx >= 0) {
        var q = list[state.selectedIdx];
        if (q) openModal(q.id);
      }
    });

    function scrollSelectedIntoView() {
      var sel = document.querySelector('.q-card.selected');
      if (sel) sel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // 滚动懒加载
    window.addEventListener('scroll', function() {
      if (!qList._allItems || qList._renderCount >= qList._allItems.length) return;
      var last = qList.lastElementChild;
      if (!last) return;
      var rect = last.getBoundingClientRect();
      if (rect.top < window.innerHeight + 200) renderBatch(qList);
    });

    // 弹窗
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('question-modal').addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });
    document.getElementById('btn-master').addEventListener('click', toggleMaster);
    document.getElementById('btn-fav').addEventListener('click', toggleFav);
    document.getElementById('btn-prev').addEventListener('click', function() { nextQuestion(-1); });
    document.getElementById('btn-next').addEventListener('click', function() { nextQuestion(1); });

    // 弹窗内评分按钮
    var rateBtns = document.querySelectorAll('.modal-rate-btn');
    rateBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var quality = parseInt(this.dataset.quality, 10);
        var id = state.currentModalId;
        if (id) {
          SR.updateCard(id, quality);
          updateStats();
          updateStudyPlan();
          showToast('已评分: ' + SR.REVIEW_INTERVALS[quality].label, 'success');
          openModal(id);
        }
      });
    });

    // 全局快捷键
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') e.target.blur();
        return;
      }
      var modalOpen = document.getElementById('question-modal').classList.contains('show');
      if (modalOpen) {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') nextQuestion(-1);
        if (e.key === 'ArrowRight') nextQuestion(1);
        if (e.key === 'f' || e.key === 'F') toggleFav();
        if (e.key === 'm' || e.key === 'M') toggleMaster();
        if (e.key === 'n' || e.key === 'N') { document.getElementById('modal-note-area').focus(); e.preventDefault(); }
        return;
      }
      if (document.getElementById('shortcuts-overlay').classList.contains('show')) {
        if (e.key === 'Escape') document.getElementById('shortcuts-overlay').classList.remove('show');
        return;
      }
      if (document.getElementById('export-overlay').classList.contains('show')) {
        if (e.key === 'Escape') document.getElementById('export-overlay').classList.remove('show');
        return;
      }
      if (e.key === 'r' || e.key === 'R') randomQuestion();
      if (e.key === '/') { e.preventDefault(); document.getElementById('search-input').focus(); }
      if (e.key === '1') document.querySelector('[data-tab="interview"]').click();
      if (e.key === '2') document.querySelector('[data-tab="radar"]').click();
      if (e.key === '3') document.querySelector('[data-tab="algorithm"]').click();
      if (e.key === 'd' || e.key === 'D') document.getElementById('theme-toggle').click();
      if (e.key === '?') document.getElementById('shortcuts-overlay').classList.add('show');
    });

    // 初始化 SR
    SR.init();
  }

  return { init: init };
})();
