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
    '#qsOv .need{border-color:#f6c84c !important;background:#2a2410 !important;} #qsOv .ok{color:#5fd68a;} #qsOv .bad{color:#ff7b7b;} #qsOv .mut{color:#8d8d96;}';
  document.head.appendChild(st);

  /* ------------ image helpers ------------ */
  function loadCanvas(file){
    return (window.createImageBitmap ? createImageBitmap(file) : Promise.reject()).then(function(bmp){
      var s = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
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
  function getGray(c){
    var x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data, g = new Uint8Array(c.width * c.height), i;
    for(i = 0; i < g.length; i++) g[i] = d[i * 4];
    return g;
  }
  function putGray(c, g){
    var x = c.getContext('2d'), im = x.createImageData(c.width, c.height), d = im.data, i;
    for(i = 0; i < g.length; i++){ d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = g[i]; d[i * 4 + 3] = 255; }
    x.putImageData(im, 0, 0);
  }
  function otsu(g){
    var h = new Uint32Array(256), i, n = g.length, sum = 0, sB = 0, wB = 0, best = 0, mx = -1;
    for(i = 0; i < n; i += 7){ h[g[i]]++; }
    n = 0; for(i = 0; i < 256; i++){ n += h[i]; sum += i * h[i]; }
    for(i = 0; i < 256; i++){
      wB += h[i]; if(!wB) continue; var wF = n - wB; if(!wF) break;
      sB += i * h[i]; var mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF);
      if(v > mx){ mx = v; best = i; }
    }
    return best;
  }
  /* even out shadows / uneven light so one threshold works over the whole sheet */
  function flattenGray(g, w, h){
    var bs = Math.max(24, Math.round(w / 30)), gw = Math.ceil(w / bs), gh = Math.ceil(h / bs), grid = new Float32Array(gw * gh), x, y, i, j;
    for(j = 0; j < gh; j++) for(i = 0; i < gw; i++){
      var mx = 0, y1 = Math.min(h, (j + 1) * bs), x1 = Math.min(w, (i + 1) * bs);
      for(y = j * bs; y < y1; y += 2) for(x = i * bs; x < x1; x += 2){ var v = g[y * w + x]; if(v > mx) mx = v; }
      grid[j * gw + i] = mx;
    }
    var g2 = new Float32Array(gw * gh);
    for(j = 0; j < gh; j++) for(i = 0; i < gw; i++){
      var s = 0, n = 0;
      for(var dj = -1; dj <= 1; dj++) for(var di = -1; di <= 1; di++){
        var jj = j + dj, ii = i + di; if(jj < 0 || ii < 0 || jj >= gh || ii >= gw) continue;
        s += grid[jj * gw + ii]; n++;
      }
      g2[j * gw + i] = s / n;
    }
    var out = new Uint8Array(g.length);
    for(y = 0; y < h; y++){
      var fy = Math.min(gh - 1.001, Math.max(0, y / bs - 0.5)), j0 = fy | 0, ty = fy - j0;
      for(x = 0; x < w; x++){
        var fx = Math.min(gw - 1.001, Math.max(0, x / bs - 0.5)), i0 = fx | 0, tx = fx - i0;
        var bg = (g2[j0 * gw + i0] * (1 - tx) + g2[j0 * gw + i0 + 1] * tx) * (1 - ty) + (g2[(j0 + 1) * gw + i0] * (1 - tx) + g2[(j0 + 1) * gw + i0 + 1] * tx) * ty;
        var o = g[y * w + x] * 255 / Math.max(60, bg); out[y * w + x] = o > 255 ? 255 : o;
      }
    }
    return out;
  }
  /* angle (degrees) that makes the long ruled lines horizontal (only line pixels vote, so text cannot confuse it) */
  function skewFromGray(g, w, h){
    var thr = otsu(g) * 0.92, minRun = Math.max(24, Math.round(w * 0.025)), pts = [], x, y, s, e, gap;
    for(y = 0; y < h; y++){
      x = 0;
      while(x < w){
        if(g[y * w + x] >= thr){ x++; continue; }
        s = x; e = x; gap = 0;
        while(x < w && gap <= 1){ if(g[y * w + x] < thr){ e = x; gap = 0; } else gap++; x++; }
        if(e - s + 1 >= minRun) for(var k = s; k <= e; k += 4) pts.push(k, y);
      }
    }
    if(pts.length < 200) return 0;
    var best = 0, bs = -1, a, rad, sn, cs, hist, off = w + 50, sc, n;
    for(a = -6; a <= 6.001; a += 0.05){
      rad = a * Math.PI / 180; sn = Math.sin(rad); cs = Math.cos(rad); hist = new Uint32Array(h + 2 * off);
      for(n = 0; n < pts.length; n += 2){ var yy = (pts[n + 1] * cs - pts[n] * sn + off) | 0; if(yy >= 0 && yy < hist.length) hist[yy]++; }
      sc = 0; for(n = 0; n < hist.length; n++) sc += hist[n] * hist[n];
      if(sc > bs){ bs = sc; best = a; }
    }
    return best;
  }
  /* connected pieces of a line mask -> least-squares lines  v = a*u + b  (u = x for horizontal, y for vertical) */
  function fitLines(m, w, h, vertical, minSpan){
    var vis = new Uint8Array(w * h), stack = new Int32Array(w * h), comps = [], idx, p, sp, x, y, dx, dy, nx, ny, ni;
    for(idx = 0; idx < m.length; idx++){
      if(!m[idx] || vis[idx]) continue;
      var c = { n:0, su:0, sv:0, suu:0, suv:0, u0:1e9, u1:-1e9 };
      sp = 0; stack[sp++] = idx; vis[idx] = 1;
      while(sp){
        p = stack[--sp]; x = p % w; y = (p - x) / w;
        var u = vertical ? y : x, v = vertical ? x : y;
        c.n++; c.su += u; c.sv += v; c.suu += u * u; c.suv += u * v; if(u < c.u0) c.u0 = u; if(u > c.u1) c.u1 = u;
        for(dy = -1; dy <= 1; dy++) for(dx = -1; dx <= 1; dx++){
          nx = x + dx; ny = y + dy; if(nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          ni = ny * w + nx; if(m[ni] && !vis[ni]){ vis[ni] = 1; stack[sp++] = ni; }
        }
      }
      if(c.u1 - c.u0 >= w * 0.04) comps.push(c);
    }
    function fit(c){ var d = c.n * c.suu - c.su * c.su; c.a = d > 1e-6 ? (c.n * c.suv - c.su * c.sv) / d : 0; c.b = (c.sv - c.a * c.su) / c.n; }
    comps.forEach(fit);
    var merged = true;
    while(merged){
      merged = false;
      outer: for(var i = 0; i < comps.length; i++) for(var j = i + 1; j < comps.length; j++){
        var A = comps[i], B = comps[j], um = (Math.max(A.u0, B.u0) + Math.min(A.u1, B.u1)) / 2;
        if(Math.max(A.u0, B.u0) > Math.min(A.u1, B.u1)) um = (A.u1 < B.u0 ? (A.u1 + B.u0) : (B.u1 + A.u0)) / 2;
        if(Math.abs((A.a * um + A.b) - (B.a * um + B.b)) < 6 && Math.abs(A.a - B.a) < 0.03){
          A.n += B.n; A.su += B.su; A.sv += B.sv; A.suu += B.suu; A.suv += B.suv; A.u0 = Math.min(A.u0, B.u0); A.u1 = Math.max(A.u1, B.u1); fit(A);
          comps.splice(j, 1); merged = true; break outer;
        }
      }
    }
    return comps.filter(function(c){ return c.u1 - c.u0 >= minSpan && Math.abs(c.a) < 0.12; });
  }
  /* erase the table's ruled lines so they cannot be read as "|" or merge with the text; also report where they were */
  function removeLinesGray(g, w, h){
    var thr = otsu(g) * 0.95, soft = Math.min(250, thr + 45), hm = new Uint8Array(w * h), vm = new Uint8Array(w * h), x, y, s, e, gap, k;
    var minH = Math.round(w * 0.05), minV = Math.round(h * 0.03);
    for(y = 0; y < h; y++){
      x = 0;
      while(x < w){
        if(g[y * w + x] >= thr){ x++; continue; }
        s = x; e = x; gap = 0;
        while(x < w && gap <= 3){ if(g[y * w + x] < thr){ e = x; gap = 0; } else gap++; x++; }
        if(e - s + 1 >= minH) for(k = s; k <= e; k++) hm[y * w + k] = 1;
      }
    }
    for(x = 0; x < w; x++){
      y = 0;
      while(y < h){
        if(g[y * w + x] >= thr){ y++; continue; }
        s = y; e = y; gap = 0;
        while(y < h && gap <= 3){ if(g[y * w + x] < thr){ e = y; gap = 0; } else gap++; y++; }
        if(e - s + 1 >= minV) for(k = s; k <= e; k++) vm[k * w + x] = 1;
      }
    }
    var mask = new Uint8Array(w * h), i;
    for(i = 0; i < mask.length; i++) mask[i] = hm[i] | vm[i];
    var out = new Uint8Array(g);
    for(y = 1; y < h - 1; y++) for(x = 1; x < w - 1; x++){
      i = y * w + x;
      if(mask[i]) out[i] = 255;
      else if(g[i] < soft && (mask[i - 1] || mask[i + 1] || mask[i - w] || mask[i + w])) out[i] = 255;
    }
    var hl = fitLines(hm, w, h, false, w * 0.5).sort(function(p, q){ return (p.a * w / 2 + p.b) - (q.a * w / 2 + q.b); });
    var ym = hl.length > 1 ? ((hl[0].a * w / 2 + hl[0].b) + (hl[hl.length - 1].a * w / 2 + hl[hl.length - 1].b)) / 2 : h / 2;
    var cand = fitLines(vm, w, h, true, h * 0.15).filter(function(c){ var xx = c.a * ym + c.b; return xx > w * 0.02 && xx < w * 0.98; });
    var xs = function(c){ return c.a * ym + c.b; };
    var best = null, bs = -1, p1, p2;
    for(p1 = 0; p1 < cand.length; p1++) for(p2 = 0; p2 < cand.length; p2++){
      var L = xs(cand[p1]), R = xs(cand[p2]), W = R - L; if(W < w * 0.4) continue;
      var sc = 0; BOUNDS_ALL.forEach(function(f){ if(cand.some(function(c){ return Math.abs(xs(c) - (L + f * W)) < W * 0.02; })) sc++; });
      if(sc > bs){ bs = sc; best = { L:cand[p1], R:cand[p2], W:W, x0:L }; }
    }
    var vl = [];
    if(best && bs >= 5){
      BOUNDS.forEach(function(f){
        var want = best.x0 + f * best.W, near = null, nd = best.W * 0.02;
        cand.forEach(function(c){ var d = Math.abs(xs(c) - want); if(d < nd){ nd = d; near = c; } });
        if(!near){ var sl = (best.L.a + best.R.a) / 2; near = { a:sl, b:want - sl * ym }; }
        vl.push({ a:near.a, b:near.b });
      });
    }
    return { img:out, hl:hl.map(function(c){ return { a:c.a, b:c.b }; }), vl:vl };
  }
  function rotate(c, deg){
    if(Math.abs(deg) < 0.2) return c;
    var r = deg * Math.PI / 180, w = c.width, h = c.height, o = document.createElement('canvas'); o.width = w; o.height = h;
    var x = o.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
    x.translate(w / 2, h / 2); x.rotate(-r); x.translate(-w / 2, -h / 2); x.drawImage(c, 0, 0);
    c.width = c.height = 0; return o;
  }

  /* ------------ OCR result -> rows ------------ */
  var BOUNDS = [0.083, 0.282, 0.391, 0.678, 0.885], BOUNDS_ALL = [0, 0.083, 0.282, 0.391, 0.678, 0.885, 1];     /* SL | Person detailed | Place | Date & period | Person relieved | Remarks */
  function colOf(xc, L, W){ var f = (xc - L) / W, i = 0; while(i < BOUNDS.length && f > BOUNDS[i]) i++; return i; }
  function median(a){ a = a.slice().sort(function(p, q){ return p - q; }); return a.length ? a[a.length >> 1] : 10; }
  function cleanDate(t){ return String(t).replace(/[Oo]/g, '0').replace(/[lI|]/g, '1').replace(/[—–]/g, '-'); }
  var DATE_RE = /(\d{1,2})\s*(?:-\s*(\d{1,2}))?\s*[\/.]\s*(\d{1,2})\s*[\/.]\s*(\d{4})\s*(?:\(?\s*(\d{4})\s*-\s*(\d{4})\s*\)?)?/;

  function stripHon(s){ return String(s || '').replace(/(^|\s)(mr|mrs|ms|miss)\.?(?=\s|$)/gi, ' ').replace(/\s+/g, ' ').trim(); }
  /* a word we trust enough to keep: confident and made of real letters / digits */
  function okWord(w){
    var s = String(w.text).replace(/[^A-Za-z0-9]/g, '');
    if(w.confidence < 45) return false;
    if(s.length >= 2) return true;
    return s.length === 1 && /[A-Za-z]/.test(s) && /\.$/.test(w.text.trim());
  }
  var CLEAN_EDGE = /^[^A-Za-z0-9(]+|[^A-Za-z0-9).]+$/g;
  function tidy(s){ return String(s || '').replace(/\s+/g, ' ').replace(CLEAN_EDGE, '').replace(/^[-_\s.]+$/, ''); }
  function buildRowsGrid(words, grid){
    words = words.filter(function(w){ return w.text && w.text.trim() && w.confidence > 15; });
    var hts = words.map(function(w){ return w.bbox.y1 - w.bbox.y0; }), mh = median(hts), hl = grid.hl, vl = grid.vl;
    words.forEach(function(w){ w.xc = (w.bbox.x0 + w.bbox.x1) / 2; w.yc = (w.bbox.y0 + w.bbox.y1) / 2; });
    var fb = null;
    if(vl.length !== 5){
      var L = Math.min.apply(null, words.map(function(w){ return w.bbox.x0; })), R = Math.max.apply(null, words.map(function(w){ return w.bbox.x1; }));
      fb = BOUNDS.map(function(f){ return L + (R - L) * f; });
    }
    var colAt = function(x, y){ var c = 0, n = vl.length === 5 ? 5 : fb.length; while(c < n && x > (vl.length === 5 ? vl[c].a * y + vl[c].b : fb[c])) c++; return c; };
    var nb = hl.length - 1, bands = [], k;
    for(k = 0; k < nb; k++) bands.push({ w:[] });
    words.forEach(function(w){
      var ys = hl.map(function(l){ return l.a * w.xc + l.b; }), b = -1;
      for(k = 0; k < nb; k++) if(w.yc > ys[k] && w.yc < ys[k + 1]){ b = k; break; }
      if(b >= 0) bands[b].w.push(w);
    });
    var hdr = -1;
    bands.forEach(function(b, i){ var n = b.w.filter(function(w){ return /^(PERSON|DETAILED|DUTY|PLACE|DATE|RELIEVED|RMKS|SL\.?|PERIOD)$/i.test(w.text.replace(/[^A-Za-z.]/g, '')); }).length; if(hdr < 0 && n >= 2) hdr = i; });
    var out = [];
    bands.forEach(function(b, i){
      if(i <= hdr) return;
      var ws = b.w.slice().sort(function(p, q){ return p.yc - q.yc; }), lines = [];
      ws.forEach(function(w){
        var ln = lines[lines.length - 1];
        if(ln && Math.abs(w.yc - ln.yc) < mh * 0.55){ ln.w.push(w); ln.yc = ln.w.reduce(function(s, k2){ return s + k2.yc; }, 0) / ln.w.length; }
        else lines.push({ yc:w.yc, w:[w] });
      });
      var dropped = {};
      lines.forEach(function(ln){
        ln.cell = ['', '', '', '', '', ''];
        ln.w.sort(function(p, q){ return p.xc - q.xc; }).forEach(function(w){
          var c = colAt(w.xc, w.yc);
          if((c === 1 || c === 2 || c === 4 || c === 5) && !okWord(w)){ if(/[A-Za-z0-9]/.test(w.text) || w.text.length > 1) dropped[c] = true; return; }
          ln.cell[c] += (ln.cell[c] ? ' ' : '') + w.text;
        });
      });
      var cell = function(c){ var v = tidy(lines.map(function(l){ return l.cell[c]; }).filter(Boolean).join(' ')); return (c === 1 || c === 4) ? stripHon(v) : v; };
      var dates = lines.map(function(l){ return l.cell[3]; }).filter(function(s){ return DATE_RE.test(cleanDate(s)); }).map(function(s){ return s.replace(/\s+/g, ' ').replace(/^[^0-9]+/, '').trim(); });
      var det = cell(1), plc = cell(2), rel = cell(4), rk = cell(5);
      if(!det && !dates.length && !plc && !rel) return;
      out.push({ sl:i - hdr, detailed:det, place:plc, dates:dates.join('\n'), relieved:rel, rmk:rk,
        need:{ detailed:!det || !!dropped[1], place:!plc || !!dropped[2], relieved:!!dropped[4] || (!rel && !/ufn/i.test(rk)), rmk:!rk || !!dropped[5], dates:!dates.length } });
    });
    return out;
  }
  function buildRows(words, grid){
    if(grid && grid.hl && grid.hl.length >= 4){ var r = buildRowsGrid(words, grid); if(r.length) return r; }
    return buildRowsLines(words);
  }
  function buildRowsLines(words){
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
      out.push({ sl:r.sl, detailed:stripHon(det), place:cell(2), dates:dates.join('\n'), relieved:stripHon(cell(4).replace(/^[-\s_.]+$/, '')), rmk:cell(5), need:{ detailed:!det, dates:!dates.length } });
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
  function nd(r, f){ return r.need && r.need[f] ? 'need' : ''; }
  function review(){
    var h = '<div class="qs-box"><div class="qs-h"><b>Check scanned QBM</b><button class="qs-x" id="qsX">✕</button></div><div class="qs-b">' +
      '<div class="mut" style="font-size:12px;margin-bottom:10px">Mr. / Mrs. are removed. Parts the scanner could not read are left out: please type them in the yellow boxes. Only green (✓) lines will be added. Photo already deleted.</div>';
    if(!rowsData.length) h += '<div class="bad">No table rows were found. Take the photo straight from above, with the whole table in view and good light.</div>';
    rowsData.forEach(function(r, i){
      h += '<div class="qs-row"><div class="mut" style="font-size:12px;margin-bottom:6px">SL ' + r.sl + '</div><div class="qs-g">' +
        '<div><label>Person detailed</label><input data-i="' + i + '" data-f="detailed" class="' + nd(r, 'detailed') + '" placeholder="Type name" value="' + esc(r.detailed) + '"></div>' +
        '<div><label>Duty place</label><input data-i="' + i + '" data-f="place" class="' + nd(r, 'place') + '" placeholder="Type place" value="' + esc(r.place) + '"></div>' +
        '<div><label>Person relieved</label><input data-i="' + i + '" data-f="relieved" class="' + nd(r, 'relieved') + '" placeholder="Type name" value="' + esc(r.relieved) + '"></div>' +
        '<div><label>Remarks</label><input data-i="' + i + '" data-f="rmk" class="' + nd(r, 'rmk') + '" placeholder="Leave / UFN / Exchange" value="' + esc(r.rmk) + '"></div></div>' +
        '<div style="margin-top:6px"><label>Date &amp; duty period (one per line)</label><textarea data-i="' + i + '" data-f="dates" class="' + nd(r, 'dates') + '" placeholder="e.g. 10/10/2026 (1400-2030)">' + esc(r.dates) + '</textarea></div>' +
        '<div class="qs-s" id="qsS' + i + '"></div></div>';
    });
    h += '</div><div class="qs-f"><button id="qsCancel">Cancel</button><button class="go" id="qsGo">Apply</button></div></div>';
    ov().innerHTML = h;
    $('qsX').onclick = $('qsCancel').onclick = closeOv;
    ov().querySelectorAll('[data-f]').forEach(function(el){
      el.addEventListener('input', function(){ var i = +el.getAttribute('data-i'); rowsData[i][el.getAttribute('data-f')] = el.value; if(el.value.trim()) el.classList.remove('need'); status(i); });
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
    var canvas = null, url = null, grid = null;
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
      putGray(canvas, flattenGray(getGray(canvas), canvas.width, canvas.height));
      canvas = rotate(canvas, skewFromGray(getGray(canvas), canvas.width, canvas.height));
      var lr = removeLinesGray(getGray(canvas), canvas.width, canvas.height);
      grid = { hl:lr.hl, vl:lr.vl };
      putGray(canvas, lr.img);
      progress('Reading text (first time needs internet to download the language file)…', 25);
      if(typeof Tesseract === 'undefined') throw new Error('OCR library not loaded. Check your internet and try again.');
      return Tesseract.createWorker('eng', 1, { logger:function(m){ if(m && m.status === 'recognizing text') progress('Reading text… ' + Math.round(m.progress * 100) + '%', 25 + m.progress * 70); } }).then(function(wk){
        return wk.setParameters({ tessedit_pageseg_mode:'11', preserve_interword_spaces:'1' }).then(function(){ return wk.recognize(canvas); }).then(function(res){ return wk.terminate().then(function(){ return res; }, function(){ return res; }); });
      });
    }).then(function(res){
      var words = (res.data && res.data.words) || [];
      wipe();                                                    /* photo gone */
      rowsData = buildRows(words, grid);
      review();
    }).catch(function(e){
      wipe();
      ov().innerHTML = '<div class="qs-box"><div class="qs-h"><b>Scan failed</b><button class="qs-x" id="qsX">✕</button></div><div class="qs-b bad">' + esc((e && e.message) || 'Could not read this photo.') + '</div></div>';
      $('qsX').onclick = closeOv;
    });
  }

  window._qbmT = { flattenGray:flattenGray, BOUNDS_:BOUNDS, skewFromGray:skewFromGray, removeLinesGray:removeLinesGray, buildRows:buildRows, parseDuty:parseDuty };
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
