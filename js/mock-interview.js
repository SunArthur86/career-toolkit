/* ===== 模拟面试模块 ===== */
var MockInterview = (function() {
  // ===== 状态 =====
  var mock = {
    phase: 'idle',        // idle | setup | running | review | result
    questions: [],         // 本次题目列表
    currentIdx: 0,
    answers: [],           // 用户每题评分: 'pass'|'fail'|'skip'
    timer: null,
    timeLeft: 0,
    timePer: 60,           // 每题秒数
    totalCount: 10,        // 题目数
    difficulty: 'mixed',   // easy|medium|hard|mixed
    category: 'all',       // 分类key or 'all'
    startTime: 0,
    history: JSON.parse(safeLS.getItem('ct-mock-history') || '[]')
  };

  // ===== DOM 引用 =====
  var $ = function(id) { return document.getElementById(id); };

  // ===== 工具函数 =====
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function saveHistory() {
    // 只保留最近50次
    if (mock.history.length > 50) mock.history = mock.history.slice(-50);
    safeLS.setItem('ct-mock-history', JSON.stringify(mock.history));
  }

  function getCategoryName(key) {
    if (key === 'all') return '全部';
    var cat = CATEGORIES.find(function(c) { return c === key; });
    return cat || key;
  }

  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m > 0 ? m + ':' : '') + (s < 10 && m > 0 ? '0' : '') + s + 's';
  }

  // ===== 选题 =====
  function pickQuestions() {
    var pool = QUESTIONS.filter(function(q) {
      if (mock.category !== 'all' && q.cat !== mock.category) return false;
      if (mock.difficulty !== 'mixed' && q.diff !== mock.difficulty) return false;
      return true;
    });
    if (!pool.length) {
      showToast('⚠️ 没有符合条件的题目', 'error');
      return [];
    }
    pool = shuffle(pool);
    return pool.slice(0, mock.totalCount);
  }

  // ===== UI: 开始界面 =====
  function showSetup() {
    mock.phase = 'setup';
    var overlay = $('mock-overlay');
    if (!overlay) return;

    // 生成分类选项
    var catOptions = '<option value="all">📋 全部分类</option>';
    var catCounts = {};
    QUESTIONS.forEach(function(q) { catCounts[q.cat] = (catCounts[q.cat] || 0) + 1; });
    CATEGORIES.forEach(function(c) {
      if (catCounts[c]) {
        var icon = typeof CAT_ICONS !== 'undefined' && CAT_ICONS[c] ? CAT_ICONS[c] + ' ' : '';
        catOptions += '<option value="' + esc(c) + '">' + icon + esc(c) + ' (' + catCounts[c] + '题)</option>';
      }
    });

    // 最近成绩
    var lastHtml = '';
    if (mock.history.length > 0) {
      var last = mock.history[mock.history.length - 1];
      lastHtml = '<div class="mock-last-result">' +
        '<span>📅 上次: ' + new Date(last.date).toLocaleDateString('zh-CN') + '</span>' +
        '<span>✅ ' + last.pass + '/' + last.total + '</span>' +
        '<span>⏱️ ' + formatTime(Math.round(last.duration)) + '</span>' +
      '</div>';
    }

    overlay.innerHTML = '<div class="mock-card mock-setup">' +
      '<button class="modal-close" id="mock-close">✕</button>' +
      '<h2 class="mock-title">🎯 模拟面试</h2>' +
      '<p class="mock-subtitle">随机抽题 · 限时作答 · 实战模拟</p>' +
      lastHtml +
      '<div class="mock-form">' +
        '<div class="mock-field">' +
          '<label>📚 分类</label>' +
          '<select id="mock-cat">' + catOptions + '</select>' +
        '</div>' +
        '<div class="mock-field">' +
          '<label>💪 难度</label>' +
          '<div class="mock-btn-group" id="mock-diff-group">' +
            '<button class="mock-opt active" data-val="mixed">🔀 混合</button>' +
            '<button class="mock-opt" data-val="easy">🟢 简单</button>' +
            '<button class="mock-opt" data-val="medium">🟡 中等</button>' +
            '<button class="mock-opt" data-val="hard">🔴 困难</button>' +
          '</div>' +
        '</div>' +
        '<div class="mock-field">' +
          '<label>📝 题数</label>' +
          '<div class="mock-btn-group" id="mock-count-group">' +
            '<button class="mock-opt" data-val="5">5题</button>' +
            '<button class="mock-opt active" data-val="10">10题</button>' +
            '<button class="mock-opt" data-val="15">15题</button>' +
            '<button class="mock-opt" data-val="20">20题</button>' +
            '<button class="mock-opt" data-val="30">30题</button>' +
          '</div>' +
        '</div>' +
        '<div class="mock-field">' +
          '<label>⏱️ 每题限时</label>' +
          '<div class="mock-btn-group" id="mock-time-group">' +
            '<button class="mock-opt" data-val="30">30s</button>' +
            '<button class="mock-opt active" data-val="60">60s</button>' +
            '<button class="mock-opt" data-val="90">90s</button>' +
            '<button class="mock-opt" data-val="120">120s</button>' +
            '<button class="mock-opt" data-val="0">不限时</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<button class="btn-mock-start" id="mock-start-btn">🚀 开始模拟</button>' +
      (mock.history.length > 0 ? '<button class="btn-mock-history" id="mock-history-btn">📊 历史成绩 (' + mock.history.length + '次)</button>' : '') +
    '</div>';

    overlay.classList.add('show');
    bindSetupEvents();
  }

  function bindSetupEvents() {
    $('mock-close').addEventListener('click', closeOverlay);

    // 选项按钮组
    ['mock-diff-group', 'mock-count-group', 'mock-time-group'].forEach(function(gid) {
      var group = $(gid);
      if (!group) return;
      group.addEventListener('click', function(e) {
        var btn = e.target.closest('.mock-opt');
        if (!btn) return;
        group.querySelectorAll('.mock-opt').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });

    $('mock-start-btn').addEventListener('click', function() {
      mock.category = $('mock-cat').value;
      mock.difficulty = $('mock-diff-group').querySelector('.active').dataset.val;
      mock.totalCount = parseInt($('mock-count-group').querySelector('.active').dataset.val);
      mock.timePer = parseInt($('mock-time-group').querySelector('.active').dataset.val);
      startMock();
    });

    if ($('mock-history-btn')) {
      $('mock-history-btn').addEventListener('click', showHistory);
    }
  }

  // ===== 开始模拟 =====
  function startMock() {
    var qs = pickQuestions();
    if (!qs.length) return;
    mock.questions = qs;
    mock.answers = new Array(qs.length).fill('pending');
    mock.currentIdx = 0;
    mock.phase = 'running';
    mock.startTime = Date.now();
    showQuestion();
  }

  // ===== 显示题目 =====
  function showQuestion() {
    var overlay = $('mock-overlay');
    var q = mock.questions[mock.currentIdx];
    var idx = mock.currentIdx;
    var total = mock.questions.length;

    // 进度
    var progressPct = Math.round((idx / total) * 100);

    // 分类图标
    var icon = typeof CAT_ICONS !== 'undefined' && CAT_ICONS[q.cat] ? CAT_ICONS[q.cat] + ' ' : '';

    overlay.innerHTML = '<div class="mock-card mock-question">' +
      '<div class="mock-progress-bar"><div class="mock-progress-fill" style="width:' + progressPct + '%"></div></div>' +
      '<div class="mock-top-bar">' +
        '<span class="mock-counter">' + (idx + 1) + ' / ' + total + '</span>' +
        '<span class="mock-timer' + (mock.timePer > 0 ? '' : ' unlimited') + '" id="mock-timer">' +
          (mock.timePer > 0 ? formatTime(mock.timePer) : '∞ 不限时') +
        '</span>' +
        '<button class="mock-quit" id="mock-quit">✕ 退出</button>' +
      '</div>' +
      '<div class="mock-q-info">' +
        '<span class="mock-q-cat">' + icon + esc(q.cat) + '</span>' +
        '<span class="mock-q-diff ' + q.diff + '">' + q.diff + '</span>' +
      '</div>' +
      '<h2 class="mock-q-title">' + esc(q.q) + '</h2>' +
      '<div class="mock-answer-wrap" id="mock-answer-wrap" style="display:none">' +
        '<div class="mock-answer" id="mock-answer">' + q.a + '</div>' +
      '</div>' +
      '<div class="mock-actions" id="mock-actions">' +
        '<button class="btn-mock-show" id="mock-show-answer">💡 显示答案</button>' +
      '</div>' +
      '<div class="mock-judge" id="mock-judge" style="display:none">' +
        '<p class="mock-judge-label">这题你答得怎么样？</p>' +
        '<button class="btn-judge pass" id="mock-pass">✅ 答对了</button>' +
        '<button class="btn-judge fail" id="mock-fail">❌ 没答好</button>' +
        '<button class="btn-judge skip" id="mock-skip">⏭️ 跳过</button>' +
      '</div>' +
      // 答题卡缩略
      '<div class="mock-card-strip" id="mock-card-strip">' +
        buildCardStrip() +
      '</div>' +
    '</div>';

    // 启动计时
    if (mock.timePer > 0) {
      mock.timeLeft = mock.timePer;
      startTimer();
    }

    bindQuestionEvents();
  }

  function buildCardStrip() {
    var html = '';
    mock.answers.forEach(function(a, i) {
      var cls = a === 'pass' ? 'pass' : a === 'fail' ? 'fail' : a === 'skip' ? 'skip' : '';
      html += '<span class="strip-dot ' + cls + (i === mock.currentIdx ? ' current' : '') + '">' + (i + 1) + '</span>';
    });
    return html;
  }

  function bindQuestionEvents() {
    $('mock-quit').addEventListener('click', function() {
      clearInterval(mock.timer);
      showSetup();
    });

    $('mock-show-answer').addEventListener('click', function() {
      $('mock-answer-wrap').style.display = 'block';
      $('mock-actions').style.display = 'none';
      $('mock-judge').style.display = 'flex';
      // 显示答案后停止倒计时（暂停）
      clearInterval(mock.timer);
    });

    $('mock-pass').addEventListener('click', function() { judgeQuestion('pass'); });
    $('mock-fail').addEventListener('click', function() { judgeQuestion('fail'); });
    $('mock-skip').addEventListener('click', function() { judgeQuestion('skip'); });
  }

  // ===== 计时器 =====
  function startTimer() {
    clearInterval(mock.timer);
    updateTimerDisplay();
    mock.timer = setInterval(function() {
      mock.timeLeft--;
      updateTimerDisplay();
      if (mock.timeLeft <= 0) {
        clearInterval(mock.timer);
        // 时间到 → 自动显示答案
        var wrap = $('mock-answer-wrap');
        var actions = $('mock-actions');
        var judge = $('mock-judge');
        if (wrap && wrap.style.display === 'none') {
          wrap.style.display = 'block';
          if (actions) actions.style.display = 'none';
          if (judge) judge.style.display = 'flex';
        }
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    var el = $('mock-timer');
    if (!el) return;
    el.textContent = formatTime(Math.max(0, mock.timeLeft));
    // 最后10秒变红
    if (mock.timeLeft <= 10 && mock.timeLeft > 0) {
      el.classList.add('warning');
    } else {
      el.classList.remove('warning');
    }
  }

  // ===== 评分 =====
  function judgeQuestion(result) {
    clearInterval(mock.timer);
    mock.answers[mock.currentIdx] = result;
    mock.currentIdx++;

    if (mock.currentIdx >= mock.questions.length) {
      showResult();
    } else {
      showQuestion();
    }
  }

  // ===== 结果页 =====
  function showResult() {
    mock.phase = 'result';
    var duration = (Date.now() - mock.startTime) / 1000;
    var passCount = mock.answers.filter(function(a) { return a === 'pass'; }).length;
    var failCount = mock.answers.filter(function(a) { return a === 'fail'; }).length;
    var skipCount = mock.answers.filter(function(a) { return a === 'skip'; }).length;
    var total = mock.questions.length;
    var pct = Math.round(passCount / total * 100);

    // 评级
    var grade = '';
    if (pct >= 90) grade = '🏆 优秀！面试稳了！';
    else if (pct >= 70) grade = '👍 良好，继续保持！';
    else if (pct >= 50) grade = '💪 及格，还需努力！';
    else grade = '📚 需要加强复习！';

    // 分类分析
    var catStats = {};
    mock.questions.forEach(function(q, i) {
      if (!catStats[q.cat]) catStats[q.cat] = { pass: 0, fail: 0, skip: 0, total: 0 };
      catStats[q.cat].total++;
      catStats[q.cat][mock.answers[i]]++;
    });
    var catHtml = '';
    Object.keys(catStats).forEach(function(cat) {
      var s = catStats[cat];
      var catPct = Math.round(s.pass / s.total * 100);
      var barColor = catPct >= 70 ? 'var(--green)' : catPct >= 50 ? 'var(--orange)' : 'var(--red)';
      var icon = typeof CAT_ICONS !== 'undefined' && CAT_ICONS[cat] ? CAT_ICONS[cat] + ' ' : '';
      catHtml += '<div class="mock-cat-row">' +
        '<span class="mock-cat-name">' + icon + esc(cat) + '</span>' +
        '<div class="mock-cat-bar"><div class="mock-cat-fill" style="width:' + catPct + '%;background:' + barColor + '"></div></div>' +
        '<span class="mock-cat-pct">' + s.pass + '/' + s.total + ' (' + catPct + '%)</span>' +
      '</div>';
    });

    // 错题列表
    var wrongHtml = '';
    mock.questions.forEach(function(q, i) {
      if (mock.answers[i] === 'fail' || mock.answers[i] === 'skip') {
        wrongHtml += '<div class="mock-wrong-item">' +
          '<span class="mock-wrong-tag ' + mock.answers[i] + '">' + (mock.answers[i] === 'fail' ? '❌' : '⏭️') + '</span>' +
          '<span class="mock-wrong-title">' + esc(q.q) + '</span>' +
          '<span class="mock-wrong-cat">' + esc(q.cat) + '</span>' +
        '</div>';
      }
    });

    var overlay = $('mock-overlay');
    overlay.innerHTML = '<div class="mock-card mock-result">' +
      '<h2 class="mock-title">📊 模拟结果</h2>' +
      '<div class="mock-grade">' + grade + '</div>' +
      '<div class="mock-score-circle ' + (pct >= 70 ? 'good' : pct >= 50 ? 'ok' : 'bad') + '">' +
        '<span class="mock-score-num">' + pct + '</span>' +
        '<span class="mock-score-label">正确率</span>' +
      '</div>' +
      '<div class="mock-stats-row">' +
        '<div class="mock-stat"><span class="mock-stat-num pass">' + passCount + '</span><span class="mock-stat-label">✅ 答对</span></div>' +
        '<div class="mock-stat"><span class="mock-stat-num fail">' + failCount + '</span><span class="mock-stat-label">❌ 答错</span></div>' +
        '<div class="mock-stat"><span class="mock-stat-num skip">' + skipCount + '</span><span class="mock-stat-label">⏭️ 跳过</span></div>' +
        '<div class="mock-stat"><span class="mock-stat-num">' + formatTime(Math.round(duration)) + '</span><span class="mock-stat-label">⏱️ 总用时</span></div>' +
      '</div>' +
      (catHtml ? '<div class="mock-section"><h3>📁 分类分析</h3>' + catHtml + '</div>' : '') +
      (wrongHtml ? '<div class="mock-section"><h3>📝 错题回顾</h3>' + wrongHtml + '</div>' : '') +
      '<div class="mock-result-actions">' +
        '<button class="btn-mock-start" id="mock-retry">🔄 再来一次</button>' +
        '<button class="btn-mock-history" id="mock-to-history">📊 历史成绩</button>' +
        '<button class="btn-mock-back" id="mock-back-list">↩️ 返回题库</button>' +
      '</div>' +
    '</div>';

    // 保存历史
    mock.history.push({
      date: Date.now(),
      total: total,
      pass: passCount,
      fail: failCount,
      skip: skipCount,
      duration: duration,
      category: mock.category,
      difficulty: mock.difficulty,
      pct: pct
    });
    saveHistory();

    // 绑定按钮
    $('mock-retry').addEventListener('click', showSetup);
    $('mock-to-history').addEventListener('click', showHistory);
    $('mock-back-list').addEventListener('click', closeOverlay);
  }

  // ===== 历史成绩 =====
  function showHistory() {
    var overlay = $('mock-overlay');
    var listHtml = '';

    // 按时间倒序
    var sorted = mock.history.slice().reverse();
    sorted.forEach(function(h, i) {
      var date = new Date(h.date);
      var catLabel = h.category === 'all' ? '全部' : getCategoryName(h.category);
      var diffLabel = h.difficulty === 'mixed' ? '混合' : h.difficulty;
      var pctClass = h.pct >= 70 ? 'good' : h.pct >= 50 ? 'ok' : 'bad';
      listHtml += '<div class="mock-history-item">' +
        '<div class="mock-history-left">' +
          '<span class="mock-history-date">' + date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
          '<span class="mock-history-meta">' + catLabel + ' · ' + diffLabel + ' · ' + h.total + '题</span>' +
        '</div>' +
        '<div class="mock-history-right">' +
          '<span class="mock-history-pct ' + pctClass + '">' + h.pct + '%</span>' +
          '<span class="mock-history-detail">✅' + h.pass + ' ❌' + h.fail + ' ⏱️' + formatTime(Math.round(h.duration)) + '</span>' +
        '</div>' +
      '</div>';
    });

    // 趋势图（最近10次）
    var trendHtml = '';
    var recent = mock.history.slice(-10);
    if (recent.length >= 2) {
      var maxPct = 100;
      var svgW = 400;
      var svgH = 120;
      var step = svgW / (recent.length - 1);
      var points = recent.map(function(h, i) {
        var x = i * step;
        var y = svgH - (h.pct / maxPct) * svgH;
        return x + ',' + y;
      }).join(' ');
      var avgPct = Math.round(recent.reduce(function(s, h) { return s + h.pct; }, 0) / recent.length);
      trendHtml = '<div class="mock-trend">' +
        '<h3>📈 正确率趋势（最近' + recent.length + '次）</h3>' +
        '<div class="mock-trend-wrap">' +
          '<svg viewBox="0 0 ' + svgW + ' ' + svgH + '" class="mock-trend-svg">' +
            '<polyline points="' + points + '" fill="none" stroke="var(--accent)" stroke-width="2"/>' +
            recent.map(function(h, i) {
              var x = i * step;
              var y = svgH - (h.pct / maxPct) * svgH;
              return '<circle cx="' + x + '" cy="' + y + '" r="4" fill="var(--accent)"/>';
            }).join('') +
          '</svg>' +
        '</div>' +
        '<p class="mock-trend-avg">平均正确率: <strong>' + avgPct + '%</strong></p>' +
      '</div>';
    }

    overlay.innerHTML = '<div class="mock-card mock-history">' +
      '<button class="modal-close" id="mock-close">✕</button>' +
      '<h2 class="mock-title">📊 模拟面试历史</h2>' +
      '<div class="mock-history-summary">' +
        '<span>共 <strong>' + mock.history.length + '</strong> 次模拟</span>' +
      '</div>' +
      trendHtml +
      '<div class="mock-history-list">' + (listHtml || '<p style="text-align:center;color:#86868b;">暂无记录</p>') + '</div>' +
      '<div class="mock-result-actions">' +
        '<button class="btn-mock-start" id="mock-from-history">🎯 开始模拟</button>' +
        (mock.history.length > 0 ? '<button class="btn-mock-back" id="mock-clear-history">🗑️ 清除历史</button>' : '') +
      '</div>' +
    '</div>';

    $('mock-close').addEventListener('click', closeOverlay);
    $('mock-from-history').addEventListener('click', showSetup);
    if ($('mock-clear-history')) {
      $('mock-clear-history').addEventListener('click', function() {
        if (confirm('确定清除所有模拟面试历史？')) {
          mock.history = [];
          saveHistory();
          showHistory();
          showToast('✅ 历史已清除', 'success');
        }
      });
    }
  }

  // ===== 关闭 =====
  function closeOverlay() {
    clearInterval(mock.timer);
    mock.phase = 'idle';
    $('mock-overlay').classList.remove('show');
  }

  // ===== 初始化 =====
  function init() {
    // 给入口按钮绑定事件
    var btn = $('btn-mock-interview');
    if (btn) {
      btn.addEventListener('click', showSetup);
    }
  }

  return { init: init, showSetup: showSetup };
})();
