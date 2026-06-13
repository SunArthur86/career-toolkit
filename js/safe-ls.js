/* ===== 安全存储（无痕模式兼容）===== */
/* 必须最先加载，所有模块共用 safeLS */
var _lsOk = true;
try { localStorage.setItem('_t', '1'); localStorage.removeItem('_t'); } catch(e) { _lsOk = false; }
var safeLS = {
  getItem: function(k) { if (!_lsOk) return null; try { return localStorage.getItem(k); } catch(e) { return null; } },
  setItem: function(k, v) { if (!_lsOk) return; try { localStorage.setItem(k, v); } catch(e) {} },
  removeItem: function(k) { if (!_lsOk) return; try { localStorage.removeItem(k); } catch(e) {} }
};
