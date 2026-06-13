/* ===== 算法动画模块 ===== */
var Algorithm = (function() {
  var canvas, ctx;
  var arr = [];
  var running = false;
  var paused = false;
  var currentAlgo = 'bubble';
  var speed = 5;
  var size = 30;
  var compares = 0, swaps = 0;
  var highlights = {}; // index -> color
  var animResolve = null;
  var stopFlag = false;

  var ALGO_INFO = {
    bubble: { name:'冒泡排序', time:'O(n²)', space:'O(1)', stable:true,
      desc:'相邻元素两两比较，每轮把最大值冒泡到末尾。就像水中的气泡，较大的元素逐渐上浮。' },
    quick: { name:'快速排序', time:'O(nlogn)', space:'O(logn)', stable:false,
      desc:'选基准(pivot)，小的放左边大的放右边，递归处理。分治法的经典应用。' },
    merge: { name:'归并排序', time:'O(nlogn)', space:'O(n)', stable:true,
      desc:'拆成两半分别排序，再合并两个有序数组。稳定排序的代表。' },
    insert: { name:'插入排序', time:'O(n²)', space:'O(1)', stable:true,
      desc:'从左到右，将每个元素插入到前面已排序部分的正确位置。就像打扑克牌整理手牌。' },
    heap: { name:'堆排序', time:'O(nlogn)', space:'O(1)', stable:false,
      desc:'建最大堆，依次取出堆顶元素放到末尾。原地排序，不需要额外空间。' },
    binarysearch: { name:'二分查找', time:'O(logn)', space:'O(1)', stable:true,
      desc:'有序数组中，每次比较中间元素，缩小一半范围。类似猜数字游戏。' },
    bfs: { name:'BFS 广搜', time:'O(V+E)', space:'O(V)', stable:true,
      desc:'按层级遍历图/树，先访问所有邻居再深入。用队列实现。' },
    dfs: { name:'DFS 深搜', time:'O(V+E)', space:'O(V)', stable:false,
      desc:'沿一条路径深入到底再回溯。用栈(递归)实现。' },
    selection: { name:'选择排序', time:'O(n²)', space:'O(1)', stable:false,
      desc:'每轮从未排序区找最小值，放到已排序区末尾。简单但不稳定。' },
    shell: { name:'希尔排序', time:'O(nlog²n)', space:'O(1)', stable:false,
      desc:'按递减间隔分组插入排序，间隔缩小到1时退化为插入排序。比插入排序快得多。' },
    counting: { name:'计数排序', time:'O(n+k)', space:'O(k)', stable:true,
      desc:'统计每个值出现次数，按顺序输出。非比较排序，适合值范围小的整数。' }
  };

  function resetArr() {
    arr = [];
    for (var i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 90) + 10);
    }
    highlights = {};
    compares = 0;
    swaps = 0;
    updateCounters();
    drawBars();
  }

  function updateCounters() {
    document.getElementById('algo-compares').textContent = compares;
    document.getElementById('algo-swaps').textContent = swaps;
  }

  function getCanvasBg() {
    return getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg').trim() || '#1d1d1f';
  }

  function drawBars() {
    if (!canvas || !ctx) return;
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.fillStyle = getCanvasBg();
    ctx.fillRect(0, 0, w, h);

    var n = arr.length;
    var gap = 2;
    var barW = Math.max(2, (w - gap * (n + 1)) / n);
    var maxVal = 100;

    for (var i = 0; i < n; i++) {
      var barH = (arr[i] / maxVal) * (h - 40);
      var x = gap + i * (barW + gap);
      var y = h - 20 - barH;

      var color = '#4a9eff';
      if (highlights[i] === 'compare') color = '#ff9500';
      else if (highlights[i] === 'swap') color = '#ff3b30';
      else if (highlights[i] === 'sorted') color = '#34c759';
      else if (highlights[i] === 'pivot') color = '#af52de';
      else if (highlights[i] === 'active') color = '#ff9500';

      ctx.fillStyle = color;
      // 圆角矩形
      var radius = Math.min(3, barW / 2);
      radius = Math.max(1, radius);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barW - radius, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
      ctx.lineTo(x + barW, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.fill();

      // 数值标签（如果柱子够宽）
      if (barW > 14) {
        ctx.fillStyle = '#fff';
        ctx.font = Math.min(11, barW - 2) + 'px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(arr[i], x + barW / 2, y - 4);
      }
    }
  }

  function sleep() {
    var ms = Math.max(10, 500 / speed);
    return new Promise(function(resolve) {
      if (stopFlag) { resolve(); return; }
      setTimeout(resolve, ms);
    });
  }

  // ===== 排序算法 =====
  async function bubbleSort() {
    var n = arr.length;
    for (var i = 0; i < n - 1; i++) {
      for (var j = 0; j < n - 1 - i; j++) {
        if (stopFlag) return;
        while (paused) await sleep();
        highlights[j] = 'compare';
        highlights[j + 1] = 'compare';
        compares++;
        updateCounters();
        drawBars();
        await sleep();
        if (arr[j] > arr[j + 1]) {
          var tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;
          swaps++;
          highlights[j] = 'swap';
          highlights[j + 1] = 'swap';
          updateCounters();
          drawBars();
          await sleep();
        }
        highlights[j] = null;
        highlights[j + 1] = null;
      }
      highlights[n - 1 - i] = 'sorted';
    }
    highlights[0] = 'sorted';
    drawBars();
  }

  async function quickSort() {
    async function qs(lo, hi) {
      if (lo >= hi || stopFlag) return;
      while (paused) await sleep();
      var pivot = arr[hi];
      highlights[hi] = 'pivot';
      var idx = lo;
      for (var j = lo; j < hi; j++) {
        if (stopFlag) return;
        while (paused) await sleep();
        highlights[j] = 'compare';
        compares++;
        updateCounters();
        drawBars();
        await sleep();
        if (arr[j] < pivot) {
          var tmp = arr[idx]; arr[idx] = arr[j]; arr[j] = tmp;
          swaps++;
          highlights[idx] = 'swap';
          updateCounters();
          drawBars();
          await sleep();
          highlights[idx] = null;
          idx++;
        }
        highlights[j] = null;
      }
      var tmp2 = arr[idx]; arr[idx] = arr[hi]; arr[hi] = tmp2;
      swaps++;
      highlights[hi] = null;
      highlights[idx] = 'sorted';
      updateCounters();
      drawBars();
      await sleep();
      await qs(lo, idx - 1);
      await qs(idx + 1, hi);
    }
    await qs(0, arr.length - 1);
    for (var i = 0; i < arr.length; i++) highlights[i] = 'sorted';
    drawBars();
  }

  async function mergeSort() {
    async function ms(lo, hi) {
      if (lo >= hi || stopFlag) return;
      while (paused) await sleep();
      var mid = Math.floor((lo + hi) / 2);
      await ms(lo, mid);
      await ms(mid + 1, hi);
      await merge(lo, mid, hi);
    }
    async function merge(lo, mid, hi) {
      var left = arr.slice(lo, mid + 1);
      var right = arr.slice(mid + 1, hi + 1);
      var i = 0, j = 0, k = lo;
      while (i < left.length && j < right.length) {
        if (stopFlag) return;
        while (paused) await sleep();
        highlights[k] = 'compare';
        compares++;
        updateCounters();
        drawBars();
        await sleep();
        if (left[i] <= right[j]) {
          arr[k] = left[i]; i++;
        } else {
          arr[k] = right[j]; j++;
        }
        swaps++;
        highlights[k] = 'swap';
        updateCounters();
        drawBars();
        await sleep();
        highlights[k] = null;
        k++;
      }
      while (i < left.length) {
        arr[k] = left[i]; highlights[k] = 'active'; drawBars(); await sleep(); highlights[k] = null; i++; k++;
      }
      while (j < right.length) {
        arr[k] = right[j]; highlights[k] = 'active'; drawBars(); await sleep(); highlights[k] = null; j++; k++;
      }
    }
    await ms(0, arr.length - 1);
    for (var i = 0; i < arr.length; i++) highlights[i] = 'sorted';
    drawBars();
  }

  async function insertSort() {
    for (var i = 1; i < arr.length; i++) {
      var key = arr[i];
      var j = i - 1;
      highlights[i] = 'pivot';
      drawBars();
      await sleep();
      while (j >= 0 && arr[j] > key) {
        if (stopFlag) return;
        while (paused) await sleep();
        compares++;
        highlights[j] = 'compare';
        updateCounters();
        drawBars();
        await sleep();
        arr[j + 1] = arr[j];
        swaps++;
        highlights[j + 1] = 'swap';
        updateCounters();
        drawBars();
        await sleep();
        highlights[j] = null;
        highlights[j + 1] = null;
        j--;
      }
      arr[j + 1] = key;
      highlights[i] = null;
    }
    for (var k = 0; k < arr.length; k++) highlights[k] = 'sorted';
    drawBars();
  }

  async function heapSort() {
    function heapify(n, i) {
      var largest = i;
      var l = 2 * i + 1;
      var r = 2 * i + 2;
      if (l < n) { compares++; if (arr[l] > arr[largest]) largest = l; }
      if (r < n) { compares++; if (arr[r] > arr[largest]) largest = r; }
      return largest;
    }
    async function siftDown(n, i) {
      while (true) {
        if (stopFlag) return;
        while (paused) await sleep();
        var largest = heapify(n, i);
        if (largest === i) break;
        highlights[i] = 'compare';
        highlights[largest] = 'compare';
        updateCounters();
        drawBars();
        await sleep();
        var tmp = arr[i]; arr[i] = arr[largest]; arr[largest] = tmp;
        swaps++;
        highlights[i] = 'swap';
        highlights[largest] = 'swap';
        updateCounters();
        drawBars();
        await sleep();
        highlights[i] = null;
        highlights[largest] = null;
        i = largest;
      }
    }
    // Build heap
    for (var i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
      await siftDown(arr.length, i);
    }
    // Extract
    for (var i = arr.length - 1; i > 0; i--) {
      if (stopFlag) return;
      var tmp = arr[0]; arr[0] = arr[i]; arr[i] = tmp;
      swaps++;
      highlights[i] = 'sorted';
      updateCounters();
      drawBars();
      await sleep();
      await siftDown(i, 0);
    }
    highlights[0] = 'sorted';
    drawBars();
  }

  async function selectionSort() {
    var n = arr.length;
    for (var i = 0; i < n - 1; i++) {
      if (stopFlag) return;
      var minIdx = i;
      highlights[i] = 'compare';
      for (var j = i + 1; j < n; j++) {
        if (stopFlag) return;
        while (paused) await sleep();
        compares++;
        highlights[j] = 'compare';
        updateCounters();
        drawBars();
        await sleep();
        if (arr[j] < arr[minIdx]) {
          if (minIdx !== i) highlights[minIdx] = null;
          minIdx = j;
        } else {
          highlights[j] = null;
        }
      }
      if (minIdx !== i) {
        var tmp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = tmp;
        swaps++;
        highlights[i] = 'swap';
        highlights[minIdx] = 'swap';
        updateCounters();
        drawBars();
        await sleep();
        highlights[minIdx] = null;
      }
      highlights[i] = 'sorted';
      updateCounters();
      drawBars();
    }
    highlights[n - 1] = 'sorted';
    drawBars();
  }

  async function shellSort() {
    var n = arr.length;
    var gap = Math.floor(n / 2);
    while (gap > 0) {
      for (var i = gap; i < n; i++) {
        if (stopFlag) return;
        while (paused) await sleep();
        var temp = arr[i];
        var j = i;
        highlights[i] = 'compare';
        updateCounters();
        drawBars();
        await sleep();
        while (j >= gap) {
          compares++;
          if (arr[j - gap] > temp) {
            arr[j] = arr[j - gap];
            swaps++;
            highlights[j] = 'swap';
            highlights[j - gap] = 'swap';
            updateCounters();
            drawBars();
            await sleep();
            highlights[j] = null;
            highlights[j - gap] = null;
            j -= gap;
          } else {
            break;
          }
        }
        arr[j] = temp;
        highlights[i] = null;
        highlights[j] = null;
        drawBars();
      }
      gap = Math.floor(gap / 2);
    }
    for (var i = 0; i < n; i++) highlights[i] = 'sorted';
    drawBars();
  }

  async function countingSort() {
    var n = arr.length;
    var max = 0;
    for (var i = 0; i < n; i++) { if (arr[i] > max) max = arr[i]; }
    var count = [];
    for (var i = 0; i <= max; i++) count[i] = 0;
    for (var i = 0; i < n; i++) count[arr[i]]++;

    // 显示计数过程
    document.getElementById('algo-description').innerHTML = '值范围: 0~' + max + '，统计频率中...';
    for (var i = 0; i < n; i++) {
      if (stopFlag) return;
      while (paused) await sleep();
      compares++; // 计数排序用"扫描"计数替代"比较"计数
      updateCounters();
      highlights[i] = 'compare';
      drawBars();
      await sleep();
      highlights[i] = null;
    }

    // 按计数重建数组
    var idx = 0;
    for (var val = 0; val <= max; val++) {
      while (count[val] > 0) {
        if (stopFlag) return;
        while (paused) await sleep();
        arr[idx] = val;
        swaps++;
        highlights[idx] = 'swap';
        updateCounters();
        drawBars();
        await sleep();
        highlights[idx] = 'sorted';
        count[val]--;
        idx++;
      }
    }
    drawBars();
  }

  async function binarySearch() {
    // 先排序
    arr.sort(function(a, b) { return a - b; });
    for (var i = 0; i < arr.length; i++) highlights[i] = null;
    drawBars();
    await sleep();

    var target = arr[Math.floor(Math.random() * arr.length)];
    document.getElementById('algo-description').innerHTML = '查找目标值: <strong>' + target + '</strong>';
    var lo = 0, hi = arr.length - 1;
    while (lo <= hi) {
      if (stopFlag) return;
      while (paused) await sleep();
      var mid = Math.floor((lo + hi) / 2);
      // 高亮搜索范围
      for (var i = lo; i <= hi; i++) highlights[i] = 'active';
      highlights[mid] = 'pivot';
      compares++;
      updateCounters();
      drawBars();
      await sleep();
      await sleep();
      if (arr[mid] === target) {
        highlights[mid] = 'sorted';
        drawBars();
        document.getElementById('algo-description').innerHTML = '✅ 找到目标 <strong>' + target + '</strong>，索引 ' + mid;
        return;
      } else if (arr[mid] < target) {
        for (var i = lo; i <= mid; i++) highlights[i] = null;
        lo = mid + 1;
      } else {
        for (var i = mid; i <= hi; i++) highlights[i] = null;
        hi = mid - 1;
      }
      for (var i = 0; i < arr.length; i++) {
        if (highlights[i] === 'active') highlights[i] = null;
      }
    }
    document.getElementById('algo-description').innerHTML = '❌ 未找到目标 ' + target;
  }

  // 共享的树形绘制工具
  var _treeNodeCache = null;
  var _treeNodeCacheKey = '';

  function computeTreeLayout(n, w, h) {
    var cacheKey = n + '|' + w + '|' + h;
    if (_treeNodeCacheKey === cacheKey && _treeNodeCache) return _treeNodeCache;
    var levels = Math.floor(Math.log2(n)) + 1;
    var nodeR = Math.min(20, Math.max(10, w / (Math.pow(2, levels) * 2.5)));
    var yStep = (h - 40) / (levels + 1);
    var positions = [];
    for (var i = 0; i < n; i++) {
      var level = Math.floor(Math.log2(i + 1));
      var posInLevel = i - (Math.pow(2, level) - 1);
      var nodesInLevel = Math.pow(2, level);
      var xStep = w / (nodesInLevel + 1);
      positions[i] = { x: xStep * (posInLevel + 1), y: yStep * (level + 1) };
    }
    _treeNodeCache = { positions: positions, nodeR: nodeR, levels: levels };
    _treeNodeCacheKey = cacheKey;
    return _treeNodeCache;
  }

  function drawTreeCommon(title) {
    if (!canvas || !ctx) return;
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.fillStyle = getCanvasBg();
    ctx.fillRect(0, 0, w, h);
    var n = arr.length;
    var layout = computeTreeLayout(n, w, h);
    var positions = layout.positions;
    var nodeR = layout.nodeR;
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var edgeColor = isDark ? '#555' : '#333';

    // 画边
    for (var i = 0; i < n; i++) {
      var p = positions[i];
      var left = 2 * i + 1, right = 2 * i + 2;
      if (left < n) {
        var c = positions[left];
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = (highlights[left] || highlights[i]) ? (isDark ? '#999' : '#666') : edgeColor;
        ctx.lineWidth = 1.5; ctx.stroke();
      }
      if (right < n) {
        var c = positions[right];
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = (highlights[right] || highlights[i]) ? (isDark ? '#999' : '#666') : edgeColor;
        ctx.lineWidth = 1.5; ctx.stroke();
      }
    }

    // 画节点
    for (var i = 0; i < n; i++) {
      var p = positions[i];
      var color = '#4a9eff';
      if (highlights[i] === 'sorted') color = '#34c759';
      else if (highlights[i] === 'compare') color = '#ff9500';
      else if (highlights[i] === 'active') color = '#ff9500';
      else if (highlights[i] === 'swap') color = '#ff3b30';

      ctx.beginPath();
      ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = isDark ? '#333' : '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = Math.max(9, nodeR - 4) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(arr[i], p.x, p.y);
    }

    // 标题
    ctx.fillStyle = isDark ? '#98989d' : '#86868b';
    ctx.font = '13px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(title, 16, 24);
  }

  async function bfsDemo() {
    // 树形BFS可视化
    var treeDepth = Math.min(4, Math.floor(Math.log2(size)));
    var nodeCount = Math.pow(2, treeDepth + 1) - 1;
    var treeArr = [];
    for (var i = 0; i < nodeCount && i < size; i++) {
      treeArr.push(Math.floor(Math.random() * 90) + 10);
    }
    arr = treeArr.slice();
    highlights = {};

    // BFS
    var visited = {};
    var queue = [0];
    while (queue.length > 0) {
      if (stopFlag) return;
      while (paused) await sleep();
      var idx = queue.shift();
      if (idx >= arr.length || visited[idx]) continue;
      visited[idx] = true;
      highlights[idx] = 'sorted';
      compares++;
      updateCounters();
      drawTreeCommon('BFS 层序遍历');
      await sleep();
      var left = 2 * idx + 1;
      var right = 2 * idx + 2;
      if (left < arr.length && !visited[left]) {
        highlights[left] = 'compare';
        queue.push(left);
      }
      if (right < arr.length && !visited[right]) {
        highlights[right] = 'compare';
        queue.push(right);
      }
      drawTreeCommon('BFS 层序遍历');
      await sleep();
    }
    drawTreeCommon('BFS 层序遍历');
  }

  async function dfsDemo() {
    // 树形DFS可视化（复用BFS的drawTree）
    var treeDepth = Math.min(4, Math.floor(Math.log2(size)));
    var nodeCount = Math.pow(2, treeDepth + 1) - 1;
    var treeArr = [];
    for (var i = 0; i < nodeCount && i < size; i++) {
      treeArr.push(Math.floor(Math.random() * 90) + 10);
    }
    arr = treeArr.slice();
    highlights = {};

    var visited = {};
    async function dfs(idx) {
      if (idx >= arr.length || visited[idx] || stopFlag) return;
      while (paused) await sleep();
      visited[idx] = true;
      highlights[idx] = 'sorted';
      compares++; updateCounters();
      drawTreeCommon('DFS 深度优先遍历'); await sleep();
      var left = 2 * idx + 1, right = 2 * idx + 2;
      if (left < arr.length && !visited[left]) {
        highlights[left] = 'compare';
        drawTreeCommon('DFS 深度优先遍历'); await sleep();
        await dfs(left);
      }
      if (right < arr.length && !visited[right]) {
        highlights[right] = 'compare';
        drawTreeCommon('DFS 深度优先遍历'); await sleep();
        await dfs(right);
      }
    }
    await dfs(0);
    drawTreeCommon('DFS 深度优先遍历');
  }

  function updateInfo() {
    var info = ALGO_INFO[currentAlgo];
    document.getElementById('algo-time').textContent = info.time;
    document.getElementById('algo-space').textContent = info.space;
    document.getElementById('algo-description').textContent = info.desc;
  }

  async function start() {
    if (running) {
      stopFlag = true;
      await sleep();
      stopFlag = false;
    }
    running = true;
    paused = false;
    compares = 0;
    swaps = 0;
    highlights = {};
    updateCounters();

    if (currentAlgo !== 'binarysearch') resetArr();
    else { arr.sort(function(a, b) { return a - b; }); drawBars(); }

    var algos = {

      bubble: bubbleSort,
      quick: quickSort,
      merge: mergeSort,
      insert: insertSort,
      heap: heapSort,
      selection: selectionSort,
      shell: shellSort,
      counting: countingSort,
      binarysearch: binarySearch,
      bfs: bfsDemo,
      dfs: dfsDemo
    };

    var statusEl = document.getElementById('algo-status');
    if (statusEl) { statusEl.textContent = '运行中'; statusEl.className = 'algo-status running'; }

    if (algos[currentAlgo]) await algos[currentAlgo]();
    running = false;

    // 完成动画
    if (!stopFlag) {
      if (statusEl) { statusEl.textContent = '已完成'; statusEl.className = 'algo-status done'; }
      showCompletion();
    } else {
      if (statusEl) { statusEl.textContent = ''; statusEl.className = 'algo-status'; }
    }
  }

  function showCompletion() {
    var desc = document.getElementById('algo-description');
    var name = ALGO_INFO[currentAlgo] ? ALGO_INFO[currentAlgo].name : '';
    desc.innerHTML = '🎉 <strong>' + name + '完成！</strong> 比较 ' + compares + ' 次，交换 ' + swaps + ' 次';

    // Canvas 撒花效果
    if (!ctx || !canvas) return;
    var dpr = window.devicePixelRatio || 1;
    var cw = canvas.width / dpr, ch = canvas.height / dpr;
    var particles = [];
    for (var i = 0; i < 40; i++) {
      particles.push({
        x: cw / 2,
        y: ch / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12 - 4,
        size: Math.random() * 6 + 3,
        color: ['#ff9500','#34c759','#0071e3','#ff3b30','#af52de'][Math.floor(Math.random()*5)],
        life: 1
      });
    }
    var frames = 0;
    function animateParticles() {
      if (frames++ > 40) return;
      // 重绘底层柱状图
      drawBars();
      // 叠加粒子
      particles.forEach(function(p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.life -= 0.025;
        if (p.life > 0) {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  function init() {
    canvas = document.getElementById('algo-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 响应窗口缩放
    function resizeCanvas() {
      var wrap = canvas.parentElement;
      var dpr = window.devicePixelRatio || 1;
      var w = wrap.clientWidth - 0;
      var h = Math.max(300, Math.min(500, w * 0.55));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!running) drawBars();
    }
    window.addEventListener('resize', function() {
      clearTimeout(window._algoResize);
      window._algoResize = setTimeout(resizeCanvas, 200);
    });
    resizeCanvas();

    resetArr();
    updateInfo();

    // 算法选择
    var inited = false;
    document.getElementById('algo-list').addEventListener('click', function(e) {
      if (!inited) { inited = true; resizeCanvas(); }
      var btn = e.target.closest('.algo-btn');
      if (!btn) return;
      document.querySelectorAll('.algo-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentAlgo = btn.dataset.algo;
      updateInfo();
      stopFlag = true;
      // 清空状态标签
      var statusEl = document.getElementById('algo-status');
      if (statusEl) { statusEl.textContent = ''; statusEl.className = 'algo-status'; }
      setTimeout(function() {
        stopFlag = false;
        running = false;
        resetArr();
      }, 100);
    });

    // 播放
    var playBtn = document.getElementById('btn-algo-play');
    playBtn.addEventListener('click', function() {
      if (running && !paused) return; // 防双击
      start();
    });

    // 暂停
    document.getElementById('btn-algo-pause').addEventListener('click', function() {
      paused = !paused;
      this.textContent = paused ? '▶ 继续' : '⏸ 暂停';
      var statusEl = document.getElementById('algo-status');
      if (statusEl) {
        statusEl.textContent = paused ? '已暂停' : '运行中';
        statusEl.className = 'algo-status ' + (paused ? 'paused' : 'running');
      }
    });

    // 重置
    document.getElementById('btn-algo-reset').addEventListener('click', function() {
      stopFlag = true;
      setTimeout(function() {
        stopFlag = false;
        running = false;
        paused = false;
        document.getElementById('btn-algo-pause').textContent = '⏸ 暂停';
        var statusEl = document.getElementById('algo-status');
        if (statusEl) { statusEl.textContent = ''; statusEl.className = 'algo-status'; }
        resetArr();
      }, 100);
    });

    // 速度
    document.getElementById('algo-speed').addEventListener('input', function() {
      speed = parseInt(this.value, 10);
      var sv = document.getElementById('algo-speed-val');
      if (sv) sv.textContent = speed;
    });

    // 数量
    document.getElementById('algo-size').addEventListener('input', function() {
      size = parseInt(this.value, 10);
      if (!running) resetArr();
    });
  }

  // 暴露的暂停方法（供 app.js visibilitychange 调用）
  function pause() {
    if (running && !paused) {
      paused = true;
      var btn = document.getElementById('btn-algo-pause');
      if (btn) btn.textContent = '▶ 继续';
      var statusEl = document.getElementById('algo-status');
      if (statusEl) {
        statusEl.textContent = '已暂停';
        statusEl.className = 'algo-status paused';
      }
    }
  }

  // Tab 切换时重新调整 canvas（解决初始隐藏导致尺寸为 0 的问题）
  function onShow() {
    if (canvas && ctx) {
      var wrap = canvas.parentElement;
      if (wrap && wrap.clientWidth > 0) {
        var dpr = window.devicePixelRatio || 1;
        var w = wrap.clientWidth;
        var h = Math.max(300, Math.min(500, w * 0.55));
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (!running) drawBars();
      }
    }
  }

  return { init: init, pause: pause, onShow: onShow };
})();
