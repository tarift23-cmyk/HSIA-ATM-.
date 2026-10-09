/* QBM photo scanner: photo -> deskew -> offline OCR (Tesseract) -> review -> Exchange / CL / UFN entries.
   The photo is never stored: it only lives in memory while scanning and is wiped as soon as OCR finishes. */
(function(){
  if(window.hsiaScanQbm) return;
  var $ = function(id){ return document.getElementById(id); };
  var esc = function(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); };

  var st = document.createElement('style');
  st.textContent =
    '#qsOv{position:fixed;inset:0;z-index:100010;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:10px;font-family:inherit;}' +
    '#qsOv .qs-box{width:100%;max-width:560px;max-height:96vh;display:flex;flex-direction:column;background:#161618;color:#eee;border:1px solid #333;border-radius:20px;overflow:hidden;}' +
    '#qsOv .qs-h{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #2a2a2e;}' +
    '#qsOv .qs-h b{flex:1;font-size:16px;}' +
    '#qsOv .qs-x{width:38px;height:38px;border:1px solid #3a3a40;background:#1d1d21;color:#eee;border-radius:10px;font-size:16px;}' +
    '#qsOv .qs-b{padding:12px 14px;overflow:auto;flex:1;}' +
    '#qsOv .qs-f{display:flex;gap:8px;padding:10px 14px;border-top:1px solid #2a2a2e;}' +
    '#qsOv .qs-f button{flex:1;padding:12px;border-radius:12px;border:1px solid #3a3a40;background:#222227;color:#eee;font-size:15px;font-weight:600;font-family:inherit;}' +
    '#qsOv .qs-f .go{background:#f6c84c;color:#222;border:0;}' +
    '#qsOv .qs-bar{height:8px;background:#2a2a2e;border-radius:6px;overflow:hidden;margin:12px 0;}' +
    '#qsOv .qs-bar i{display:block;height:100%;width:0;background:#f6c84c;transition:width .2s;}' +
    '#qsOv .qs-row{border:1px solid #2f2f35;border-radius:14px;padding:10px;margin-bottom:10px;background:#1b1b1f;}' +
    '#qsOv .qs-g{display:grid;grid-template-columns:1fr 1fr;gap:6px;}' +
    '#qsOv label{font-size:11px;color:#8d8d96;display:block;margin:0 0 2px;}' +
    '#qsOv input,#qsOv textarea,#qsOv select{width:100%;box-sizing:border-box;background:#0f0f12;color:#eee;border:1px solid #3a3a40;border-radius:8px;padding:7px;font-size:14px;font-family:inherit;}' +
    '#qsOv textarea{min-height:56px;resize:vertical;}' +
    '#qsOv .qs-s{font-size:12px;margin-top:6px;line-height:1.5;}' +
    '#qsOv .ok{color:#5fd68a;} #qsOv .bad{color:#ff7b7b;} #qsOv .mut{color:#8d8d96;}';
  document.head.appendChild(st);

  /* ------------ image helpers ------------ */
  function loadCanvas(file){
    return (window.createImageBitmap ? createImageBitmap(file) : Promise.reject()).then(function(bmp){
      var s = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
      var c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
      var x = c.getContext('2d'); x.drawImage(bmp, 0, 0, c.width, c.height);
      if(bmp.close) bmp.close();
      return c;
    });
  }
  function contrast(c){
    var x = c.getContext('2d'), im = x.getImageData(0, 0, c.width, c.height), d = im.data, h = new Uint32Array(256), i, n = d.length / 4;
    for(i = 0; i < d.length; i += 4){ var g = (d[i] * 0.3 + d[i+1] * 0.59 + d[i+2] * 0.11) | 0; d[i] = g; h[g]++; }
    var lo = 0, hi = 255, a = 0;
    while(lo < 255 && (a += h[lo]) < n * 0.01) lo++;
    a = 0; while(hi > 0 && (a += h[hi]) < n * 0.01) hi--;
    if(hi - lo < 30){ lo = 0; hi = 255; }
    for(i = 0; i < d.length; i += 4){ var v = Math.max(0, Math.min(255, ((d[i] - lo) * 255 / (hi - lo)) | 0)); d[i] = d[i+1] = d[i+2] = v; }
    x.putImageData(im, 0, 0);
  }
  function skewAngle(c){
    var s = 700 / c.width, w = 700, h = Math.round(c.height * s), t = document.createElement('canvas'); t.width = w; t.height = h;
    var tx = t.getContext('2d'); tx.drawImage(c, 0, 0, w, h);
    var d = tx.getImageData(0, 0, w, h).data, pts = [], i, j;
    for(j = 0; j < h; j++) for(i = 0; i < w; i++) if(d[(j * w + i) * 4] < 110) pts.push(i, j);
    t.width = t.height = 0;
    var best = 0, bs = -1, a, k, rad, sn, cs, hist, off = w + 50, sc;
    for(a = -4; a <= 4.001; a += 0.25){
      rad = a * Math.PI / 180; sn = Math.sin(rad); cs = Math.cos(rad); hist = new Uint32Array(h + 2 * off);
      for(k = 0; k < pts.length; k += 2){ var yy = (pts[k+1] * cs - pts[k] * sn + off) | 0; if(yy >= 0 && yy < hist.length) hist[yy]++; }
      sc = 0; for(k = 0; k < hist.length; k++) sc += hist[k] * hist[k];
      if(sc > bs){ bs = sc; best = a; }
    }
    return best;
  }
  function rotate(c, deg){
    if(Math.abs(deg) < 0.2) return c;
    var r = deg * Math.PI / 180, w = c.width, h = c.height, o = document.createElement('canvas'); o.width = w; o.height = h;
    var x = o.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
    x.translate(w / 2, h / 2); x.rotate(-r); x.translate(-w / 2, -h / 2); x.drawImage(c, 0, 0);
    c.width = c.height = 0; return o;
  }

  /* ------------ OCR result -> rows ------------ */
  var BOUNDS = [0.083, 0.282, 0.391, 0.678, 0.885];     /* SL | Person detailed | Place | Date & period | Person relieved | Remarks */
  function colOf(xc, L, W){ var f = (xc - L) / W, i = 0; while(i < BOUNDS.length && f > BOUNDS[i]) i++; return i; }
  function median(a){ a = a.slice().sort(function(p, q){ return p - q; }); return a.length ? a[a.length >> 1] : 10; }
  function cleanDate(t){ return String(t).replace(/[Oo]/g, '0').replace(/[lI|]/g, '1').replace(/[—–]/g, '-'); }
  var DATE_RE = /(\d{1,2})\s*(?:-\s*(\d{1,2}))?\s*[\/.]\s*(\d{1,2})\s*[\/.]\s*(\d{4})\s*(?:\(?\s*(\d{4})\s*-\s*(\d{4})\s*\)?)?/;

  function buildRows(words){
    words = words.filter(function(w){ return w.text && w.text.trim() && w.confidence > 20; });
    if(words.length < 10) return [];
    var hts = words.map(function(w){ return w.bbox.y1 - w.bbox.y0; }), mh = median(hts);
    words.forEach(function(w){ w.xc = (w.bbox.x0 + w.bbox.x1) / 2; w.yc = (w.bbox.y0 + w.bbox.y1) / 2; });
    /* table left / right edge */
    var sl = words.filter(function(w){ return /^SL/i.test(w.text); })[0];
    var L = Math.min.apply(null, words.map(function(w){ return w.bbox.x0; })), R = Math.max.apply(null, words.map(function(w){ return w.bbox.x1; }));
    var rm = words.filter(function(w){ return /^(RMKS|Leave|UFN|Exchange|Change)/i.test(w.text); });
    if(rm.length) R = Math.max.apply(null, rm.map(function(w){ return w.bbox.x1; })) + mh * 0.6;
    if(sl) L = Math.min(L, sl.bbox.x0 - mh * 0.4);
    var W = Math.max(1, R - L);
    /* group into text lines */
    words.sort(function(p, q){ return p.yc - q.yc; });
    var lines = [];
    words.forEach(function(w){
      var ln = lines[lines.length - 1];
      if(ln && Math.abs(w.yc - ln.yc) < mh * 0.55){ ln.w.push(w); ln.yc = ln.w.reduce(function(s, k){ return s + k.yc; }, 0) / ln.w.length; }
      else lines.push({ yc:w.yc, w:[w] });
    });
    lines.forEach(function(ln){
      ln.cell = ['', '', '', '', '', ''];
      ln.w.sort(function(p, q){ return p.xc - q.xc; }).forEach(function(w){ var c = colOf(w.xc, L, W); ln.cell[c] += (ln.cell[c] ? ' ' : '') + w.text; });
      ln.date = DATE_RE.test(cleanDate(ln.cell[3]));
    });
    /* serial numbers */
    var sls = [];
    lines.forEach(function(ln){ var m = /^\d{1,2}$/.exec(ln.cell[0].trim()); if(m) sls.push({ n:+m[0], yc:ln.yc }); });
    var seq = [], last = 0;
    sls.forEach(function(s){ if(s.n === last + 1 || (s.n > last && s.n <= last + 2 && seq.length)){ seq.push(s); last = s.n; } else if(!seq.length && s.n === 1){ seq.push(s); last = 1; } });
    if(!seq.length) return [];
    var dl = lines.filter(function(l){ return l.date; });
    /* partition date lines over rows (dynamic programming, keeps order) */
    var m = seq.length, k = dl.length, INF = 1e18, f = [], bk = [], i, j, p;
    for(i = 0; i <= m; i++){ f.push(new Array(k + 1).fill(INF)); bk.push(new Array(k + 1).fill(0)); }
    f[0][0] = 0;
    for(i = 1; i <= m; i++) for(j = 0; j <= k; j++) for(p = j; p >= 0; p--){
      if(f[i-1][p] >= INF) continue;
      var cost = 0, q;
      if(p === j) cost = Math.pow(mh * 2, 2);
      else for(q = p; q < j; q++) cost += Math.pow(dl[q].yc - seq[i-1].yc, 2);
      if(j - p > 6) break;
      if(f[i-1][p] + cost < f[i][j]){ f[i][j] = f[i-1][p] + cost; bk[i][j] = p; }
    }
    var rows = seq.map(function(s){ return { sl:s.n, yc:s.yc, lines:[], dlines:[] }; });
    j = k; for(i = m; i >= 1; i--){ p = bk[i][j]; for(var q = p; q < j; q++){ rows[i-1].dlines.push(dl[q]); rows[i-1].lines.push(dl[q]); } j = p; }
    /* other text lines -> nearest row */
    lines.forEach(function(ln){
      if(ln.date) return;
      var txt = ln.cell.slice(1).join('').trim(); if(!txt) return;
      if(ln.yc < seq[0].yc - mh * 2.5) return;           /* title + header */
      var best = null, bd = INF;
      rows.forEach(function(r){
        var ys = r.dlines.map(function(l){ return l.yc; }).concat([r.yc]), lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys);
        var d = ln.yc < lo ? lo - ln.yc : ln.yc > hi ? ln.yc - hi : 0;
        if(d < bd || (d === bd && best && ln.yc > r.yc)){ bd = d; best = r; }
      });
      if(best && bd < mh * 3) best.lines.push(ln);
    });
    var out = [];
    rows.forEach(function(r){
      r.lines.sort(function(a, b){ return a.yc - b.yc; });
      var cell = function(c){ return r.lines.map(function(l){ return l.cell[c]; }).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(); };
      var dates = r.dlines.sort(function(a, b){ return a.yc - b.yc; }).map(function(l){ return l.cell[3].replace(/\s+/g, ' ').trim(); });
      var det = cell(1);
      if(!det && !dates.length) return;
      out.push({ sl:r.sl, detailed:det, place:cell(2), dates:dates.join('\n'), relieved:cell(4).replace(/^[-\s_.]+$/, ''), rmk:cell(5) });
    });
    return out;
  }

  /* ------------ matching to the roster ------------ */
  var HON = /^(mr|mrs|ms|md|mst|miss|dr)\.?$/i;
  function nameTokens(n){ return String(n || '').toLowerCase().replace(/[^a-z0-9\s.\-]/g, ' ').split(/[\s.]+/).filter(function(t){ return t && !HON.test(t); }); }
  function stripNo(t){ return t.replace(/-\d+$/, ''); }
  function nameMatches(qbm, full){
    var q = nameTokens(qbm).map(stripNo).filter(function(t){ return t.length >= 3; });
    if(!q.length) return false;
    var f = nameTokens(full).map(stripNo);
    return q.every(function(t){ return f.some(function(u){ return u === t || (t.length >= 4 && u.indexOf(t) === 0); }); });
  }
  function placeOk(pos, place){
    var p = String(place || '').toUpperCase().replace(/[\s_]+/g, ''), u = String(pos).toUpperCase().replace(/[\s_]+/g, '');
    if(!p) return true;
    if(p === 'ACC-L' || p === 'ACCL' || p === 'ACC-LOWER') return u.indexOf('ACCLOWER') === 0;
    if(p === 'ACC') return u.indexOf('ACCUPPER') === 0;
    return u.replace(/-/g, '').indexOf(p.replace(/-/g, '')) === 0;
  }
  function shiftOf(period){
    var s = /^(\d{4})-/.exec(period || ''); if(!s) return '';
    return s[1] === '0730' ? 'Morning' : s[1] === '1400' ? 'Afternoon' : (s[1] === '2030' || s[1] === '0000' || s[1] === '0300') ? 'Night' : '';
  }
  function parseDuty(text){
    var m = DATE_RE.exec(cleanDate(text)); if(!m) return null;
    var a = +m[1], b = m[2] ? +m[2] : a, mo = +m[3], y = +m[4], p1 = m[5] || '', p2 = m[6] || '';
    var cross = p1 && p2 && +p2 < +p1 && p2 !== '0000';
    var end = cross ? Math.max(a, b - 1) : b, dates = [], d, dim = new Date(Date.UTC(y, mo, 0)).getUTCDate();
    if(mo < 1 || mo > 12 || a < 1 || a > dim) return null;
    for(d = a; d <= Math.min(end, dim); d++) dates.push(y + '-' + String(mo).padStart(2, '0') + '-' + String(d).padStart(2, '0'));
    var half = p1 === '2030' && p2 === '0300' ? '1' : p1 === '0300' ? '2' : '';
    return { dates:dates, period:p1 && p2 ? p1 + '-' + p2 : '', shift:shiftOf(p1 ? p1 + '-' + p2 : ''), half:half };
  }
  function kindOf(rmk){
    var r = String(rmk || '').toLowerCase();
    if(/leave|^cl$|\bcl\b/.test(r)) return { cl:true };
    if(/ufn/.test(r)) return { special:true, spType:'UFN' };
    if(/^(el|medical|festival|training|maternity)/.test(r)) return { special:true, spType:r.replace(/^./, function(c){ return c.toUpperCase(); }) };
    return {};
  }
  function allRosters(){
    var out = [];
    [['roster', typeof ROSTER !== 'undefined' ? ROSTER : []], ['rosterCtrl', typeof ROSTER_CTRL !== 'undefined' ? ROSTER_CTRL : []], ['rosterComm', typeof ROSTER_COMM !== 'undefined' ? ROSTER_COMM : []]].forEach(function(t){
      (t[1] || []).forEach(function(r){ if(r && r.pos && r.names) out.push({ table:t[0], row:r }); });
    });
    return out;
  }
  function fullName(n){
    var hit = [];
    allRosters().forEach(function(x){ x.row.names.forEach(function(nm){ if(nm && nameMatches(n, nm) && hit.indexOf(String(nm).trim()) < 0) hit.push(String(nm).trim()); }); });
    return hit.length === 1 ? hit[0] : String(n || '').replace(/^\s*(mr|mrs|ms)\.?\s+/i, '').trim();
  }
  function matchDuty(row, dk, duty){
    var P = dk.split('-').map(Number), cands = [];
    if(!duty.shift) return { ok:false, msg:'Cannot read the duty period' };
    allRosters().forEach(function(x){
      for(var t = 0; t < 5; t++){
        if(shiftFor(t, P[0], P[1] - 1, P[2]) !== duty.shift) continue;
        var nm = String(x.row.names[t] || '').trim();
        if(!nm || nm === '-') continue;
        if(row.relieved && !nameMatches(row.relieved, nm)) continue;
        cands.push({ table:x.table, pos:x.row.pos, team:t, who:nm });
      }
    });
    var byPlace = cands.filter(function(c){ return placeOk(c.pos, row.place); });
    if(byPlace.length) cands = byPlace;
    else if(row.place && cands.length > 1) return { ok:false, msg:'Place "' + row.place + '" not found' };
    if(cands.length === 1) return { ok:true, c:cands[0] };
    return { ok:false, msg: cands.length ? 'More than one match (' + cands.slice(0, 3).map(function(c){ return c.pos + '/' + 'ABCDE'[c.team]; }).join(', ') + ') — fix Place or Relieved' : 'No roster match' };
  }

  /* ------------ UI ------------ */
  var rowsData = [];
  function ov(){ var o = $('qsOv'); if(!o){ o = document.createElement('div'); o.id = 'qsOv'; document.body.appendChild(o); } return o; }
  function closeOv(){ var o = $('qsOv'); if(o) o.remove(); }
  function progress(msg, pct){
    ov().innerHTML = '<div class="qs-box"><div class="qs-h"><b>Scanning QBM…</b></div><div class="qs-b"><div>' + esc(msg) + '</div><div class="qs-bar"><i style="width:' + (pct || 0) + '%"></i></div><div class="mut" style="font-size:12px">The photo is deleted from memory as soon as reading finishes.</div></div></div>';
  }
  function status(i){
    var r = rowsData[i], el = $('qsS' + i), html = [], lines = r.dates.split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
    r.res = [];
    if(!lines.length) html.push('<span class="bad">No date lines</span>');
    lines.forEach(function(ln){
      var du = parseDuty(ln);
      if(!du){ html.push('<span class="bad">✕ ' + esc(ln) + ' — cannot read date</span>'); return; }
      du.dates.forEach(function(dk){
        var m = matchDuty(r, dk, du);
        if(m.ok){ r.res.push({ dk:dk, duty:du, c:m.c }); html.push('<span class="ok">✓ ' + dk + ' ' + esc(du.period) + ' → ' + esc(m.c.pos) + ' · Team ' + 'ABCDE'[m.c.team] + ' (' + esc(m.c.who) + ')</span>'); }
        else html.push('<span class="bad">✕ ' + dk + ' ' + esc(du.period) + ' — ' + esc(m.msg) + '</span>');
      });
    });
    el.innerHTML = html.join('<br>');
    updateCount();
  }
  function updateCount(){
    var n = rowsData.reduce(function(s, r){ return s + (r.res ? r.res.length : 0); }, 0), b = $('qsGo');
    if(b){ b.textContent = 'Apply ' + n + ' duty' + (n === 1 ? '' : 's'); b.disabled = !n; b.style.opacity = n ? 1 : .5; }
  }
  function review(){
    var h = '<div class="qs-box"><div class="qs-h"><b>Check scanned QBM</b><button class="qs-x" id="qsX">✕</button></div><div class="qs-b">' +
      '<div class="mut" style="font-size:12px;margin-bottom:10px">Fix any wrong text below. Only green (✓) lines will be added. Photo already deleted.</div>';
    if(!rowsData.length) h += '<div class="bad">No table rows were found. Take the photo straight from above, with the whole table in view and good light.</div>';
    rowsData.forEach(function(r, i){
      h += '<div class="qs-row"><div class="mut" style="font-size:12px;margin-bottom:6px">SL ' + r.sl + '</div><div class="qs-g">' +
        '<div><label>Person detailed</label><input data-i="' + i + '" data-f="detailed" value="' + esc(r.detailed) + '"></div>' +
        '<div><label>Duty place</label><input data-i="' + i + '" data-f="place" value="' + esc(r.place) + '"></div>' +
        '<div><label>Person relieved</label><input data-i="' + i + '" data-f="relieved" value="' + esc(r.relieved) + '"></div>' +
        '<div><label>Remarks</label><input data-i="' + i + '" data-f="rmk" value="' + esc(r.rmk) + '"></div></div>' +
        '<div style="margin-top:6px"><label>Date &amp; duty period (one per line)</label><textarea data-i="' + i + '" data-f="dates">' + esc(r.dates) + '</textarea></div>' +
        '<div class="qs-s" id="qsS' + i + '"></div></div>';
    });
    h += '</div><div class="qs-f"><button id="qsCancel">Cancel</button><button class="go" id="qsGo">Apply</button></div></div>';
    ov().innerHTML = h;
    $('qsX').onclick = $('qsCancel').onclick = closeOv;
    ov().querySelectorAll('[data-f]').forEach(function(el){
      el.addEventListener('input', function(){ var i = +el.getAttribute('data-i'); rowsData[i][el.getAttribute('data-f')] = el.value; status(i); });
    });
    rowsData.forEach(function(_, i){ status(i); });
    $('qsGo').onclick = apply;
  }
  function apply(){
    var n = 0, cl = [];
    try{
      window._exBatch = true;
      rowsData.forEach(function(r){
        var k = kindOf(r.rmk), sub = fullName(r.detailed);
        (r.res || []).forEach(function(x){
          var pe = { table:x.c.table, pos:x.c.pos, team:x.c.team, subName:sub, nightHalf:x.duty.half || '', who:x.c.who };
          if(k.cl){ pe.cl = true; pe.vacant = !sub; pe.nightHalf = ''; }
          else if(k.special){ pe.special = true; pe.spType = k.spType; pe.vacant = !sub; pe.nightHalf = ''; }
          else if(!k.cl && !k.special){ pe.nightHalf = ''; }
          exPutEntry(x.dk, pe); exVacateMovedCell(x.dk, pe); n++;
          if(k.cl) cl.push({ dk:x.dk, r:{ thmr:false, table:pe.table, pos:pe.pos, team:pe.team, who:pe.who, shift:x.duty.shift, dateKey:x.dk } });
        });
      });
    } finally { window._exBatch = false; }
    try{ cl.forEach(function(c){ clLedgerSet(c.dk, c.r, clDaysForShift(c.r.shift)); }); }catch(e){}
    try{ saveExchangesData(EXCHANGES); }catch(e){}
    try{ auditLog('qbm-scan', n + ' duty entries added from QBM photo'); }catch(e){}
    try{ renderExchangeList(); renderRoster(); renderRosterCtrl(); if(typeof renderRosterComm === 'function') renderRosterComm(); checkMyExchangeNotifications(); }catch(e){}
    try{ var q = $('qbmOverlay'); if(q && q.classList.contains('show')) renderQbm(); }catch(e){}
    closeOv();
    alert(n + ' duty' + (n === 1 ? '' : 's') + ' added to Exchange / CL and QBM.');
  }

  function run(file, input){
    var canvas = null, url = null;
    function wipe(){
      try{ if(canvas){ canvas.width = canvas.height = 0; } }catch(e){}
      canvas = null;
      try{ if(url) URL.revokeObjectURL(url); }catch(e){}
      url = null;
      try{ input.value = ''; }catch(e){}
      file = null;
    }
    progress('Preparing photo…', 5);
    loadCanvas(file).then(function(c){
      canvas = c; contrast(canvas); progress('Straightening…', 15);
      return new Promise(function(r){ setTimeout(r, 30); });
    }).then(function(){
      canvas = rotate(canvas, skewAngle(canvas));
      progress('Reading text (first time needs internet to download the language file)…', 25);
      if(typeof Tesseract === 'undefined') throw new Error('OCR library not loaded. Check your internet and try again.');
      return Tesseract.recognize(canvas, 'eng', { logger:function(m){ if(m && m.status === 'recognizing text') progress('Reading text… ' + Math.round(m.progress * 100) + '%', 25 + m.progress * 70); } });
    }).then(function(res){
      var words = (res.data && res.data.words) || [];
      wipe();                                                    /* photo gone */
      rowsData = buildRows(words);
      review();
    }).catch(function(e){
      wipe();
      ov().innerHTML = '<div class="qs-box"><div class="qs-h"><b>Scan failed</b><button class="qs-x" id="qsX">✕</button></div><div class="qs-b bad">' + esc((e && e.message) || 'Could not read this photo.') + '</div></div>';
      $('qsX').onclick = closeOv;
    });
  }

  window.hsiaScanQbm = function(){
    if(typeof rosterUnlocked === 'undefined' || !rosterUnlocked){ alert('Only admin can scan a QBM.'); return; }
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*'; inp.style.display = 'none';
    inp.onchange = function(){ var f = inp.files && inp.files[0]; if(f) run(f, inp); };
    document.body.appendChild(inp);
    inp.click();
    setTimeout(function(){ if(inp.parentNode && !inp.files.length) { /* keep until chosen */ } }, 0);
  };
})();
