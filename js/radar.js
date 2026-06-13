/* ===== 技术雷达图模块 ===== */
var Radar = (function() {
  var canvas, ctx;
  var values = JSON.parse(safeLS.getItem('ct-radar') || 'null') || {};
  var animFrame = null;
  var targetValues = {};

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }
  // 主题感知颜色
  function themeColors() {
    var dark = isDark();
    return {
      grid: dark ? '#38383a' : '#e8e8ed',
      gridOuter: dark ? '#48484a' : '#d2d2d7',
      label: dark ? '#e5e5ea' : '#1d1d1f',
      sublabel: dark ? '#98989d' : '#86868b',
      accent: dark ? '#0a84ff' : '#0071e3',
      accentAlpha: dark ? 'rgba(10,132,255,' : 'rgba(0,113,227,'
    };
  }

  function getValues() {
    RADAR_SKILLS.forEach(function(s) {
      if (typeof values[s.key] === 'undefined') values[s.key] = 50;
      targetValues[s.key] = values[s.key];
    });
    return values;
  }

  function draw() {
    if (!canvas) return;
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.width / dpr, h = canvas.height / dpr;
    var cx = w / 2, cy = h / 2;
    var r = Math.min(cx, cy) - 60;
    var n = RADAR_SKILLS.length;
    var step = (Math.PI * 2) / n;

    ctx.clearRect(0, 0, w, h);

    var tc = themeColors();

    // 背景网格
    for (var lv = 1; lv <= 5; lv++) {
      var lr = (r / 5) * lv;
      ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var angle = step * i - Math.PI / 2;
        var x = cx + lr * Math.cos(angle);
        var y = cy + lr * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = lv === 5 ? tc.gridOuter : tc.grid;
      ctx.lineWidth = 1;
      ctx.stroke();

      // 刻度标签
      if (lv % 2 === 0) {
        ctx.fillStyle = tc.sublabel;
        ctx.font = '11px -apple-system, sans-serif';
        ctx.fillText(String(lv * 20), cx + 4, cy - lr + 14);
      }
    }

    // 轴线 + 标签
    for (var i = 0; i < n; i++) {
      var angle = step * i - Math.PI / 2;
      var x = cx + r * Math.cos(angle);
      var y = cy + r * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = tc.grid;
      ctx.stroke();

      // 标签
      var lx = cx + (r + 30) * Math.cos(angle);
      var ly = cy + (r + 30) * Math.sin(angle);
      ctx.fillStyle = tc.label;
      ctx.font = '13px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(RADAR_SKILLS[i].name, lx, ly);
    }

    // 数据区域
    ctx.beginPath();
    for (var i = 0; i <= n; i++) {
      var idx = i % n;
      var angle = step * idx - Math.PI / 2;
      var val = (values[RADAR_SKILLS[idx].key] || 0) / 100;
      var vr = r * val;
      var x = cx + vr * Math.cos(angle);
      var y = cy + vr * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    // 渐变填充
    var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, tc.accentAlpha + '0.05)');
    grad.addColorStop(0.5, tc.accentAlpha + '0.15)');
    grad.addColorStop(1, tc.accentAlpha + '0.25)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = tc.accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 数据点
    for (var i = 0; i < n; i++) {
      var angle = step * i - Math.PI / 2;
      var val = (values[RADAR_SKILLS[i].key] || 0) / 100;
      var vr = r * val;
      var x = cx + vr * Math.cos(angle);
      var y = cy + vr * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = tc.accent;
      ctx.fill();
      ctx.strokeStyle = isDark() ? '#2c2c2e' : '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 历史对比（如果有上次数据）
    var prevData = safeLS.getItem('ct-radar-prev');
    if (prevData) {
      try {
        var prev = JSON.parse(prevData);
        ctx.beginPath();
        for (var i = 0; i <= n; i++) {
          var idx = i % n;
          var angle = step * idx - Math.PI / 2;
          var val = (prev[RADAR_SKILLS[idx].key] || 0) / 100;
          var vr = r * val;
          var x = cx + vr * Math.cos(angle);
          var y = cy + vr * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255,149,0,0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        // 历史点
        for (var i = 0; i < n; i++) {
          var angle = step * i - Math.PI / 2;
          var val = (prev[RADAR_SKILLS[i].key] || 0) / 100;
          var vr = r * val;
          var x = cx + vr * Math.cos(angle);
          var y = cy + vr * Math.sin(angle);
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,149,0,0.6)';
          ctx.fill();
        }
        // 图例
        ctx.fillStyle = tc.accent;
        ctx.fillRect(20, h - 40, 12, 12);
        ctx.fillStyle = tc.sublabel;
        ctx.font = '12px -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('当前', 38, h - 30);
        ctx.fillStyle = 'rgba(255,149,0,0.6)';
        ctx.fillRect(80, h - 40, 12, 12);
        ctx.fillStyle = tc.sublabel;
        ctx.fillText('上次', 98, h - 30);
      } catch(e) {}
    }
  }

  function animateDraw() {
    var changed = false;
    RADAR_SKILLS.forEach(function(s) {
      var cur = values[s.key] || 0;
      var tar = targetValues[s.key] || 0;
      if (Math.abs(cur - tar) > 0.5) {
        values[s.key] = cur + (tar - cur) * 0.15;
        changed = true;
      } else {
        values[s.key] = tar;
      }
    });
    draw();
    if (changed) animFrame = requestAnimationFrame(animateDraw);
  }

  function renderSliders() {
    var wrap = document.getElementById('skill-sliders');
    var html = '';
    RADAR_SKILLS.forEach(function(s) {
      var v = values[s.key] || 50;
      html += '<div class="skill-row">';
      html += '<span class="skill-label">' + s.name + '</span>';
      html += '<input type="range" min="0" max="100" value="' + v + '" data-key="' + s.key + '">';
      html += '<span class="skill-val" id="sv-' + s.key + '">' + v + '</span>';
      html += '</div>';
    });
    wrap.innerHTML = html;
  }

  function generateReport() {
    var report = document.getElementById('radar-report');
    var content = document.getElementById('radar-report-content');
    var strong = [], medium = [], weak = [];
    RADAR_SKILLS.forEach(function(s) {
      var v = values[s.key] || 0;
      if (v >= 80) strong.push(s.name + '(' + v + ')');
      else if (v >= 50) medium.push(s.name + '(' + v + ')');
      else weak.push(s.name + '(' + v + ')');
    });
    var avg = RADAR_SKILLS.reduce(function(sum, s) { return sum + (values[s.key] || 0); }, 0) / RADAR_SKILLS.length;
    var html = '<p>综合评分: <strong>' + Math.round(avg) + '</strong>/100</p>';
    if (strong.length) html += '<p>💪 强项: ' + strong.map(function(s) { return '<span class="tag strong">' + s + '</span>'; }).join(' ') + '</p>';
    if (medium.length) html += '<p>📈 待提升: ' + medium.map(function(s) { return '<span class="tag medium">' + s + '</span>'; }).join(' ') + '</p>';
    if (weak.length) html += '<p>⚠️ 薄弱: ' + weak.map(function(s) { return '<span class="tag weak">' + s + '</span>'; }).join(' ') + '</p>';
    content.innerHTML = html;
    report.style.display = 'block';
  }

  function init() {
    canvas = document.getElementById('radar-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    getValues();
    renderSliders();

    // 响应窗口缩放
    function resizeCanvas() {
      var wrap = canvas.parentElement;
      var dpr = window.devicePixelRatio || 1;
      var size = Math.min(wrap.clientWidth - 48, 600);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    window.addEventListener('resize', function() {
      clearTimeout(window._radarResize);
      window._radarResize = setTimeout(resizeCanvas, 200);
    });
    resizeCanvas();

    animateDraw();

    // 滑块事件
    document.getElementById('skill-sliders').addEventListener('input', function(e) {
      if (e.target.type !== 'range') return;
      var key = e.target.dataset.key;
      var val = parseInt(e.target.value, 10);
      targetValues[key] = val;
      document.getElementById('sv-' + key).textContent = val;
      if (animFrame) cancelAnimationFrame(animFrame);
      animateDraw();
    });

    // 保存
    document.getElementById('btn-radar-save').addEventListener('click', function() {
      // 保存当前到历史
      var prev = safeLS.getItem('ct-radar');
      if (prev) safeLS.setItem('ct-radar-prev', prev);
      safeLS.setItem('ct-radar', JSON.stringify(targetValues));
      values = JSON.parse(JSON.stringify(targetValues));
      generateReport();
      this.textContent = '✅ 已保存';
      var self = this;
      setTimeout(function() { self.textContent = '💾 保存评估'; }, 1500);
    });

    // 重置
    document.getElementById('btn-radar-reset').addEventListener('click', function() {
      RADAR_SKILLS.forEach(function(s) { targetValues[s.key] = 50; });
      renderSliders();
      if (animFrame) cancelAnimationFrame(animFrame);
      animateDraw();
      document.getElementById('radar-report').style.display = 'none';
    });

    // 导出
    document.getElementById('btn-radar-export').addEventListener('click', function() {
      generateReport();
    });

    // 鼠标悬停tooltip
    var tooltip = document.createElement('div');
    tooltip.className = 'radar-tooltip';
    tooltip.style.cssText = 'position:absolute;padding:6px 12px;background:rgba(0,0,0,0.8);color:#fff;font-size:12px;border-radius:8px;pointer-events:none;opacity:0;transition:opacity 0.2s;z-index:100;white-space:nowrap;';
    canvas.parentElement.style.position = 'relative';
    canvas.parentElement.appendChild(tooltip);

    canvas.addEventListener('mousemove', function(e) {
      var rect = canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var cw = canvas.width / dpr, ch = canvas.height / dpr;
      var cx = cw / 2, cy = ch / 2;
      var r = Math.min(cx, cy) - 60;
      var n = RADAR_SKILLS.length;
      var step = (Math.PI * 2) / n;
      var found = false;

      for (var i = 0; i < n; i++) {
        var angle = step * i - Math.PI / 2;
        var val = (values[RADAR_SKILLS[i].key] || 0) / 100;
        var vr = r * val;
        var px = cx + vr * Math.cos(angle);
        var py = cy + vr * Math.sin(angle);
        var dist = Math.sqrt((mx - px) * (mx - px) + (my - py) * (my - py));
        if (dist < 15) {
          tooltip.textContent = RADAR_SKILLS[i].name + ': ' + (values[RADAR_SKILLS[i].key] || 0);
          tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
          tooltip.style.top = (e.clientY - rect.top - 30) + 'px';
          tooltip.style.opacity = '1';
          found = true;
          break;
        }
      }
      if (!found) tooltip.style.opacity = '0';
    });
    canvas.addEventListener('mouseleave', function() {
      tooltip.style.opacity = '0';
    });
  }

  return { init: init };
})();
