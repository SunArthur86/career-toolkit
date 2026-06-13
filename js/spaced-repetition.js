/* ===== SM-2 间隔重复算法 + 闪卡学习模式 + 笔记 ===== */
var SR = (function() {
  // SM-2 parameters per question: { id, interval, ease, reps, nextReview, lastReview, quality }
  // quality: 0=完全不会, 1=答错但看到想起来了, 2=困难, 3=正确但慢, 4=正确, 5=完美
  var REVIEW_INTERVALS = {
    0: { label: '😵 完全不会', interval: 0 },
    1: { label: '😕 看到才想起', interval: 0 },
    2: { label: '😅 困难', interval: 1 },
    3: { label: '🤔 正确但慢', interval: 3 },
    4: { label: '✅ 正确', interval: 7 },
    5: { label: '🎯 完美', interval: 14 }
  };

  function getCards() {
    return JSON.parse(safeLS.getItem('ct-sr-cards') || '{}');
  }
  function saveCards(cards) {
    safeLS.setItem('ct-sr-cards', JSON.stringify(cards));
  }

  function getCard(id) {
    var cards = getCards();
    return cards[id] || null;
  }

  // SM-2 核心算法
  function updateCard(id, quality) {
    var cards = getCards();
    var card = cards[id] || {
      id: id, interval: 0, ease: 2.5, reps: 0,
      nextReview: Date.now(), lastReview: 0
    };
    card.lastReview = Date.now();
    card.quality = quality;

    if (quality < 2) {
      // 答错，重置
      card.reps = 0;
      card.interval = 0;
      card.nextReview = Date.now();
    } else {
      card.reps++;
      if (card.reps === 1) card.interval = REVIEW_INTERVALS[quality].interval || 1;
      else if (card.reps === 2) card.interval = Math.max(2, Math.round((REVIEW_INTERVALS[quality].interval || 3) * 1.5));
      else card.interval = Math.round(card.interval * card.ease);

      // 更新 ease factor
      card.ease = Math.max(1.3, card.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

      card.nextReview = Date.now() + card.interval * 24 * 60 * 60 * 1000;
    }

    cards[id] = card;
    saveCards(cards);
    return card;
  }

  // 获取今天需要复习的题目
  function getDueReviews() {
    var cards = getCards();
    var now = Date.now();
    var due = [];
    for (var id in cards) {
      if (cards[id].nextReview <= now) {
        var q = QUESTIONS.find(function(x) { return x.id == id; });
        if (q) due.push({ question: q, card: cards[id] });
      }
    }
    // 按优先级排序：逾期最久的优先
    due.sort(function(a, b) { return a.card.nextReview - b.card.nextReview; });
    return due;
  }

  // 获取明天/本周即将复习的数量
  function getUpcomingCount(days) {
    var cards = getCards();
    var target = Date.now() + days * 24 * 60 * 60 * 1000;
    var count = 0;
    for (var id in cards) {
      if (cards[id].nextReview <= target && cards[id].nextReview > Date.now()) count++;
    }
    return count;
  }

  // 获取复习统计
  function getStats() {
    var cards = getCards();
    var now = Date.now();
    var total = 0, due = 0, learned = 0, mastered = 0;
    for (var id in cards) {
      total++;
      if (cards[id].nextReview <= now) due++;
      if (cards[id].reps > 0) learned++;
      if (cards[id].reps >= 3 && cards[id].ease >= 2.5) mastered++;
    }
    return { total: total, due: due, learned: learned, mastered: mastered };
  }

  // 格式化下次复习时间
  function formatNextReview(nextReview) {
    var diff = nextReview - Date.now();
    if (diff <= 0) return '现在';
    var days = Math.round(diff / (24 * 60 * 60 * 1000));
    if (days === 0) return '今天';
    if (days === 1) return '明天';
    if (days < 7) return days + '天后';
    if (days < 30) return Math.round(days / 7) + '周后';
    return Math.round(days / 30) + '个月后';
  }

  // ===== 笔记系统 =====
  function getNotes() {
    return JSON.parse(safeLS.getItem('ct-notes') || '{}');
  }
  function getNote(id) {
    return getNotes()[id] || '';
  }
  function saveNote(id, text) {
    var notes = getNotes();
    if (text && text.trim()) notes[id] = text.trim();
    else delete notes[id];
    safeLS.setItem('ct-notes', JSON.stringify(notes));
  }
  function getNoteCount() {
    return Object.keys(getNotes()).length;
  }

  // ===== 闪卡模式状态 =====
  var flashState = {
    active: false,
    queue: [],
    index: 0,
    showAnswer: false
  };

  function startFlashcard(mode) {
    var queue = [];
    if (mode === 'review') {
      queue = getDueReviews().map(function(r) { return r.question; });
    } else if (mode === 'random') {
      var shuffled = QUESTIONS.slice().sort(function() { return Math.random() - 0.5; });
      queue = shuffled.slice(0, Math.min(20, shuffled.length));
    } else if (mode === 'weak') {
      // 错题/困难题
      var cards = getCards();
      var weakIds = [];
      for (var id in cards) {
        if (cards[id].quality !== undefined && cards[id].quality < 3) {
          var q = QUESTIONS.find(function(x) { return x.id == id; });
          if (q) weakIds.push(q);
        }
      }
      queue = weakIds.length ? weakIds : QUESTIONS.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 10);
    } else if (mode === 'bookmark') {
      var bms = JSON.parse(safeLS.getItem('ct-bookmarks') || '[]');
      queue = bms.map(function(id) {
        return QUESTIONS.find(function(q) { return q.id === id; });
      }).filter(Boolean);
    }
    if (!queue.length) {
      showToast('没有可用的题目', 'error');
      return;
    }
    flashState.active = true;
    flashState.queue = queue;
    flashState.index = 0;
    flashState.showAnswer = false;
    renderFlashcard();
  }

  function renderFlashcard() {
    var q = flashState.queue[flashState.index];
    if (!q) { exitFlashcard(); return; }

    var overlay = document.getElementById('flashcard-overlay');
    var cardEl = overlay.querySelector('.flashcard');
    var counterEl = document.getElementById('flash-counter');
    counterEl.textContent = (flashState.index + 1) + ' / ' + flashState.queue.length;

    // 更新进度条
    var pct = ((flashState.index + 1) / flashState.queue.length) * 100;
    document.getElementById('flash-progress').style.width = pct + '%';

    // 渲染卡片内容
    var front = overlay.querySelector('.flashcard-front');
    var back = overlay.querySelector('.flashcard-back');

    front.querySelector('.flash-cat').textContent = q.cat;
    front.querySelector('.flash-diff').textContent = q.diff;
    front.querySelector('.flash-diff').className = 'flash-diff ' + q.diff;
    front.querySelector('.flash-question').textContent = q.q;

    var srCard = getCard(q.id);
    var srInfo = '';
    if (srCard) {
      srInfo = '<div class="flash-sr-info">间隔:' + srCard.interval + '天 | 重复:' + srCard.reps + '次 | 下次:' + formatNextReview(srCard.nextReview) + '</div>';
    }

    back.innerHTML = '<div class="flash-answer-header">' + esc(q.cat) + '</div>' + q.a + srInfo;

    // 翻转控制
    if (flashState.showAnswer) {
      cardEl.classList.add('flipped');
      overlay.querySelector('.flash-actions-rate').style.display = 'flex';
      overlay.querySelector('.flash-btn-flip').style.display = 'none';
    } else {
      cardEl.classList.remove('flipped');
      overlay.querySelector('.flash-actions-rate').style.display = 'none';
      overlay.querySelector('.flash-btn-flip').style.display = 'flex';
    }

    overlay.classList.add('show');
  }

  function flipCard() {
    flashState.showAnswer = true;
    renderFlashcard();
  }

  function rateCard(quality) {
    var q = flashState.queue[flashState.index];
    if (!q) return;
    updateCard(q.id, quality);
    flashState.index++;
    flashState.showAnswer = false;
    if (flashState.index >= flashState.queue.length) {
      // 完成
      showToast('🎉 完成 ' + flashState.queue.length + ' 道题！', 'success');
      exitFlashcard();
    } else {
      renderFlashcard();
    }
  }

  function exitFlashcard() {
    flashState.active = false;
    document.getElementById('flashcard-overlay').classList.remove('show');
  }

  function init() {
    document.getElementById('flash-flip').addEventListener('click', flipCard);
    document.getElementById('flash-exit').addEventListener('click', exitFlashcard);
    document.getElementById('flash-prev').addEventListener('click', function() {
      if (flashState.index > 0) { flashState.index--; flashState.showAnswer = false; renderFlashcard(); }
    });
    document.getElementById('flash-next-skip').addEventListener('click', function() {
      flashState.index++;
      if (flashState.index >= flashState.queue.length) exitFlashcard();
      else { flashState.showAnswer = false; renderFlashcard(); }
    });

    // 评分按钮
    var rateBtns = document.querySelectorAll('.flash-rate-btn');
    rateBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        rateCard(parseInt(this.dataset.quality, 10));
      });
    });

    // 闪卡模式快捷键
    document.addEventListener('keydown', function(e) {
      if (!flashState.active) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === ' ') { e.preventDefault(); if (!flashState.showAnswer) flipCard(); }
      if (e.key === 'Escape') exitFlashcard();
      if (flashState.showAnswer) {
        if (e.key >= '0' && e.key <= '5') rateCard(parseInt(e.key, 10));
      }
    });
  }

  return {
    updateCard: updateCard,
    getCard: getCard,
    getDueReviews: getDueReviews,
    getUpcomingCount: getUpcomingCount,
    getStats: getStats,
    formatNextReview: formatNextReview,
    REVIEW_INTERVALS: REVIEW_INTERVALS,
    getNote: getNote,
    saveNote: saveNote,
    getNoteCount: getNoteCount,
    startFlashcard: startFlashcard,
    exitFlashcard: exitFlashcard,
    init: init
  };
})();
