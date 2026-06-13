/* ===== Career Toolkit 数据加载器 ===== */
/* 从 data/ 目录按分类加载 Markdown 题库 */

var QUESTIONS = [];
var _catCatalog = null;

// 获取分类目录
async function loadCatalog() {
  if (_catCatalog) return _catCatalog;
  var res = await fetch('data/catalog.json');
  if (!res.ok) throw new Error('catalog HTTP ' + res.status);
  _catCatalog = await res.json();
  return _catCatalog;
}

// Markdown → 题目数组
function parseMd(text, cat) {
  var questions = [];
  var blocks = text.split(/\n---\n/);
  blocks.forEach(function(block) {
    if (!block.trim() || block.indexOf('##') === -1) return;
    var q = { cat: cat, diff: 'medium', q: '', a: '', id: 0, tags: [] };
    var titleMatch = block.match(/^##\s+\d+\.\s+(.+)$/m);
    if (titleMatch) q.q = titleMatch[1].trim();
    var metaMatch = block.match(/\*\*难度\*\*:\s*(\w+)/);
    if (metaMatch) q.diff = metaMatch[1].trim().toLowerCase();
    var idMatch = block.match(/\*\*ID\*\*:\s*(\d+)/);
    if (idMatch) q.id = parseInt(idMatch[1]);
    var tagMatch = block.match(/\*\*标签\*\*:\s*(.+)/);
    if (tagMatch) q.tags = tagMatch[1].split(/[,，]/).map(function(t){return t.trim();}).filter(Boolean);
    if (!q.id || !q.q) return;
    // 全文搜索用纯文本
    q._searchText = (q.q + ' ' + q.cat + ' ' + block.replace(/```[\s\S]*?```/g,'').replace(/[#*\-]/g,'')).toLowerCase();
    // 构建答案HTML
    var ans = '';
    var sections = block.match(/####\s+.+?(?=####|$)/gs);
    if (sections) {
      sections.forEach(function(sec) {
        var headMatch = sec.match(/^####\s+(.+)$/m);
        var heading = headMatch ? headMatch[1].trim() : '';
        var body = sec.replace(/^####.+$/m, '').trim();
        if (!body) return;
        // code blocks with optional language
        body = body.replace(/```(\w*)\n([\s\S]*?)```/g, function(m, lang, code) {
          return '\x00PRE\x00' + code.trim() + '\x00/PRE\x00';
        });
        // **bold**
        body = body.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // inline code
        body = body.replace(/`([^`]+)`/g, '<code>$1</code>');
        // unordered lists
        body = body.replace(/^[-*]\s+(.+)$/gm, '\x00LI\x00$1\x00/LI\x00');
        body = body.replace(/(\x00LI\x00[\s\S]*?\x00\/LI\x00)+/g, function(m) {
          return '\x00UL\x00' + m.replace(/\x00LI\x00/g, '<li>').replace(/\x00\/LI\x00/g, '</li>') + '\x00/UL\x00';
        });
        // line breaks (outside PRE)
        body = body.replace(/(\x00PRE\x00[\s\S]*?\x00\/PRE\x00)|(\n)/g, function(m, pre, nl) {
          return pre || '<br>';
        });
        body = body.replace(/<br>\s*(\x00UL\x00)/g, '$1');
        // restore markers
        body = body.replace(/\x00PRE\x00([\s\S]*?)\x00\/PRE\x00/g, '<pre>$1</pre>');
        body = body.replace(/\x00UL\x00([\s\S]*?)\x00\/UL\x00/g, '<ul>$1</ul>');
        // section mapping
        if (heading.indexOf('\u{1F3AF}') >= 0) ans += '<h3 class="sec-essence">\u{1F3AF} 本质</h3><div class="answer-section answer-essence">' + body + '</div>';
        else if (heading.indexOf('\u{1F9D2}') >= 0) ans += '<h3 class="sec-analogy">\u{1F9D2} 类比</h3><div class="answer-section answer-analogy">' + body + '</div>';
        else if (heading.indexOf('\u{1F4CA}') >= 0) ans += '<h3 class="sec-diagram">\u{1F4CA} 图解</h3><pre class="answer-diagram">' + body + '</pre>';
        else if (heading.indexOf('\u{1F527}') >= 0) ans += '<h3 class="sec-detail">\u{1F527} 详解</h3><div class="answer-section answer-detail">' + body + '</div>';
        else if (heading.indexOf('\u{1F4BB}') >= 0) ans += '<h3 class="sec-code">\u{1F4BB} 代码</h3><pre class="answer-code">' + body + '</pre>';
        else if (heading.indexOf('\u{2753}') >= 0) ans += '<h3 class="sec-followup">\u{2753} 追问</h3><div class="answer-section answer-followup">' + body + '</div>';
        else ans += '<h3>' + heading + '</h3><div class="answer-section">' + body + '</div>';
      });
    }
    q.a = ans || '<p>详见题目描述</p>';
    questions.push(q);
  });
  return questions;
}

// 加载全部题目
async function loadQuestions() {
  try {
    var catalog = await loadCatalog();
    var all = await Promise.all(
      catalog.map(function(c) {
        return fetch(c.file).then(function(r) {
          if (!r.ok) throw new Error(c.file + ' HTTP ' + r.status);
          return r.text();
        }).then(function(md) {
          return parseMd(md, c.cat);
        });
      })
    );
    QUESTIONS = [];
    all.forEach(function(arr) { QUESTIONS = QUESTIONS.concat(arr); });
    QUESTIONS.sort(function(a, b) { return a.id - b.id; });
    return QUESTIONS;
  } catch (e) {
    console.error('题库加载失败:', e);
    return [];
  }
}

// 按分类懒加载
var _catCache = {};
async function loadCategory(catKey) {
  if (_catCache[catKey]) return _catCache[catKey];
  var catalog = await loadCatalog();
  var entry = catalog.find(function(c) { return c.key === catKey; });
  if (!entry) return [];
  var res = await fetch(entry.file);
  if (!res.ok) return [];
  var md = await res.text();
  _catCache[catKey] = parseMd(md, entry.cat);
  return _catCache[catKey];
}
