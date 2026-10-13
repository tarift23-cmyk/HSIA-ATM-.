/* Photo clean-up before reading: find the paper, straighten its perspective, even out the light, remove small tilt.
   Works only on the phone. Pure pixel maths, no libraries. */
(function(){
  if(window.hsiaDocPrep) return;

  function otsu(g){
    var h = new Uint32Array(256), i, n = 0, sum = 0, sB = 0, wB = 0, best = 128, mx = -1;
    for(i = 0; i < g.length; i += 3) h[g[i]]++;
    for(i = 0; i < 256; i++){ n += h[i]; sum += i * h[i]; }
    for(i = 0; i < 256; i++){
      wB += h[i]; if(!wB) continue; var wF = n - wB; if(!wF) break;
      sB += i * h[i]; var mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF);
      if(v > mx){ mx = v; best = i; }
    }
    return best;
  }
  function shrink(g, w, h, tw){
    var s = Math.min(1, tw / w), w2 = Math.max(8, Math.round(w * s)), h2 = Math.max(8, Math.round(h * s)), o = new Uint8Array(w2 * h2), x, y, bx = w / w2, by = h / h2;
    for(y = 0; y < h2; y++) for(x = 0; x < w2; x++){
      var sx = 0, n = 0, yy, xx, y0 = Math.floor(y * by), y1 = Math.min(h, Math.ceil((y + 1) * by)), x0 = Math.floor(x * bx), x1 = Math.min(w, Math.ceil((x + 1) * bx));
      for(yy = y0; yy < y1; yy++) for(xx = x0; xx < x1; xx++){ sx += g[yy * w + xx]; n++; }
      o[y * w2 + x] = n ? sx / n : 255;
    }
    return { g:o, w:w2, h:h2, sx:w / w2, sy:h / h2 };
  }
  function boxBlur(g, w, h, r){
    var t = new Uint8Array(g.length), o = new Uint8Array(g.length), x, y, k, s, n;
    for(y = 0; y < h; y++) for(x = 0; x < w; x++){ s = 0; n = 0; for(k = -r; k <= r; k++){ var q = x + k; if(q >= 0 && q < w){ s += g[y * w + q]; n++; } } t[y * w + x] = s / n; }
    for(x = 0; x < w; x++) for(y = 0; y < h; y++){ s = 0; n = 0; for(k = -r; k <= r; k++){ var q2 = y + k; if(q2 >= 0 && q2 < h){ s += t[q2 * w + x]; n++; } } o[y * w + x] = s / n; }
    return o;
  }
  /* corners of the paper (full-resolution coordinates) or null when it cannot be found reliably */
  function findQuad(g, w, h){
    var d = shrink(g, w, h, 320), b = boxBlur(d.g, d.w, d.h, 2), W = d.w, H = d.h, thr = otsu(b), i, mask = new Uint8Array(W * H);
    for(i = 0; i < mask.length; i++) mask[i] = b[i] > thr ? 1 : 0;
    var lab = new Int32Array(W * H), st = new Int32Array(W * H), best = 0, bestId = 0, id = 0, x, y;
    for(i = 0; i < mask.length; i++){
      if(!mask[i] || lab[i]) continue;
      id++; var sp = 0, cnt = 0; st[sp++] = i; lab[i] = id;
      while(sp){
        var p = st[--sp]; cnt++; x = p % W; y = (p - x) / W;
        if(x > 0 && mask[p - 1] && !lab[p - 1]){ lab[p - 1] = id; st[sp++] = p - 1; }
        if(x < W - 1 && mask[p + 1] && !lab[p + 1]){ lab[p + 1] = id; st[sp++] = p + 1; }
        if(y > 0 && mask[p - W] && !lab[p - W]){ lab[p - W] = id; st[sp++] = p - W; }
        if(y < H - 1 && mask[p + W] && !lab[p + W]){ lab[p + W] = id; st[sp++] = p + W; }
      }
      if(cnt > best){ best = cnt; bestId = id; }
    }
    if(best < W * H * 0.2) return null;
    var tl = null, tr = null, br = null, bl = null, a, c;
    for(y = 0; y < H; y++) for(x = 0; x < W; x++){
      if(lab[y * W + x] !== bestId) continue;
      a = x + y; c = x - y;
      if(!tl || a < tl.a) tl = { x:x, y:y, a:a };
      if(!br || a > br.a) br = { x:x, y:y, a:a };
      if(!tr || c > tr.c) tr = { x:x, y:y, c:c };
      if(!bl || c < bl.c) bl = { x:x, y:y, c:c };
    }
    var q = [tl, tr, br, bl], area = 0;
    for(i = 0; i < 4; i++){ var p1 = q[i], p2 = q[(i + 1) % 4]; area += p1.x * p2.y - p2.x * p1.y; }
    area = Math.abs(area) / 2;
    if(area < W * H * 0.25 || area > W * H * 0.97) return null;
    /* it must look like a sheet of paper seen in perspective, otherwise leave the photo alone */
    var sd = [dist(tl, tr), dist(tr, br), dist(br, bl), dist(bl, tl)];
    if(Math.min(sd[0], sd[2]) / Math.max(sd[0], sd[2]) < 0.72 || Math.min(sd[1], sd[3]) / Math.max(sd[1], sd[3]) < 0.72) return null;
    for(i = 0; i < 4; i++){
      var P = q[(i + 3) % 4], C = q[i], N = q[(i + 1) % 4], v1x = P.x - C.x, v1y = P.y - C.y, v2x = N.x - C.x, v2y = N.y - C.y;
      var cosv = (v1x * v2x + v1y * v2y) / (Math.sqrt(v1x * v1x + v1y * v1y) * Math.sqrt(v2x * v2x + v2y * v2y) || 1);
      if(Math.abs(cosv) > 0.5) return null;          /* corner angle must be 60..120 degrees */
    }
    var cx = (tl.x + tr.x + br.x + bl.x) / 4, cy = (tl.y + tr.y + br.y + bl.y) / 4;
    return q.map(function(p){ return { x:(p.x + (cx - p.x) * 0.006 + 0.5) * d.sx, y:(p.y + (cy - p.y) * 0.006 + 0.5) * d.sy }; });
  }
  function solveH(src, dst){          /* maps dst -> src */
    var A = [], i, j, k;
    for(i = 0; i < 4; i++){
      var X = dst[i].x, Y = dst[i].y, u = src[i].x, v = src[i].y;
      A.push([X, Y, 1, 0, 0, 0, -u * X, -u * Y, u]);
      A.push([0, 0, 0, X, Y, 1, -v * X, -v * Y, v]);
    }
    for(i = 0; i < 8; i++){
      var m = i; for(j = i + 1; j < 8; j++) if(Math.abs(A[j][i]) > Math.abs(A[m][i])) m = j;
      var t = A[i]; A[i] = A[m]; A[m] = t;
      if(Math.abs(A[i][i]) < 1e-12) return null;
      for(j = i + 1; j < 8; j++){ var f = A[j][i] / A[i][i]; for(k = i; k < 9; k++) A[j][k] -= f * A[i][k]; }
    }
    var h = new Array(8);
    for(i = 7; i >= 0; i--){ var s = A[i][8]; for(j = i + 1; j < 8; j++) s -= A[i][j] * h[j]; h[i] = s / A[i][i]; }
    return h;
  }
  function dist(a, b){ return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)); }
  function warp(g, w, h, q, maxSide){
    var ow = Math.max(dist(q[0], q[1]), dist(q[3], q[2])), oh = Math.max(dist(q[0], q[3]), dist(q[1], q[2])), m = Math.max(ow, oh), s = m > maxSide ? maxSide / m : (m < 1200 ? 1200 / m : 1);
    ow = Math.round(ow * s); oh = Math.round(oh * s);
    if(ow < 50 || oh < 50) return null;
    var H = solveH(q, [{ x:0, y:0 }, { x:ow, y:0 }, { x:ow, y:oh }, { x:0, y:oh }]); if(!H) return null;
    var o = new Uint8Array(ow * oh), x, y;
    for(y = 0; y < oh; y++) for(x = 0; x < ow; x++){
      var dn = H[6] * x + H[7] * y + 1, sx = (H[0] * x + H[1] * y + H[2]) / dn, sy = (H[3] * x + H[4] * y + H[5]) / dn;
      if(sx < 0 || sy < 0 || sx >= w - 1 || sy >= h - 1){ o[y * ow + x] = 255; continue; }
      var x0 = sx | 0, y0 = sy | 0, fx = sx - x0, fy = sy - y0, i = y0 * w + x0;
      o[y * ow + x] = (g[i] * (1 - fx) + g[i + 1] * fx) * (1 - fy) + (g[i + w] * (1 - fx) + g[i + w + 1] * fx) * fy;
    }
    return { g:o, w:ow, h:oh };
  }
  /* even out shadows and uneven light */
  function flatten(g, w, h){
    var bs = Math.max(24, Math.round(w / 30)), gw = Math.ceil(w / bs), gh = Math.ceil(h / bs), grid = new Float32Array(gw * gh), x, y, i, j;
    for(j = 0; j < gh; j++) for(i = 0; i < gw; i++){
      var mx = 0, y1 = Math.min(h, (j + 1) * bs), x1 = Math.min(w, (i + 1) * bs);
      for(y = j * bs; y < y1; y += 2) for(x = i * bs; x < x1; x += 2){ var v = g[y * w + x]; if(v > mx) mx = v; }
      grid[j * gw + i] = mx;
    }
    var g2 = new Float32Array(gw * gh);
    for(j = 0; j < gh; j++) for(i = 0; i < gw; i++){
      var s = 0, n = 0;
      for(var dj = -1; dj <= 1; dj++) for(var di = -1; di <= 1; di++){ var jj = j + dj, ii = i + di; if(jj < 0 || ii < 0 || jj >= gh || ii >= gw) continue; s += grid[jj * gw + ii]; n++; }
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
  function stretch(g){
    var h = new Uint32Array(256), i, n = g.length, lo = 0, hi = 255, a = 0;
    for(i = 0; i < n; i++) h[g[i]]++;
    while(lo < 255 && (a += h[lo]) < n * 0.01) lo++;
    a = 0; while(hi > 0 && (a += h[hi]) < n * 0.01) hi--;
    if(hi - lo < 30) return g;
    var o = new Uint8Array(n); for(i = 0; i < n; i++){ var v = (g[i] - lo) * 255 / (hi - lo); o[i] = v < 0 ? 0 : v > 255 ? 255 : v; }
    return o;
  }
  /* small remaining tilt of the text lines, in degrees */
  function textSkew(g, w, h){
    var d = shrink(g, w, h, 700), thr = otsu(d.g) * 0.85, pts = [], x, y;
    for(y = 0; y < d.h; y++) for(x = 0; x < d.w; x++) if(d.g[y * d.w + x] < thr) pts.push(x, y);
    if(pts.length < 400) return 0;
    var best = 0, bs = -1, a, k, hist, off = d.w + 50, sc;
    for(a = -3; a <= 3.001; a += 0.1){
      var rad = a * Math.PI / 180, sn = Math.sin(rad), cs = Math.cos(rad); hist = new Uint32Array(d.h + 2 * off);
      for(k = 0; k < pts.length; k += 2){ var yy = (pts[k + 1] * cs - pts[k] * sn + off) | 0; if(yy >= 0 && yy < hist.length) hist[yy]++; }
      sc = 0; for(k = 0; k < hist.length; k++) sc += hist[k] * hist[k];
      if(sc > bs){ bs = sc; best = a; }
    }
    return best;
  }
  function rotateGray(g, w, h, deg){
    var r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), o = new Uint8Array(g.length), x, y, cx = w / 2, cy = h / 2;
    for(y = 0; y < h; y++) for(x = 0; x < w; x++){
      var dx = x - cx, dy = y - cy, sx = cx + dx * c - dy * s, sy = cy + dx * s + dy * c;
      if(sx < 0 || sy < 0 || sx >= w - 1 || sy >= h - 1){ o[y * w + x] = 255; continue; }
      var x0 = sx | 0, y0 = sy | 0, fx = sx - x0, fy = sy - y0, i = y0 * w + x0;
      o[y * w + x] = (g[i] * (1 - fx) + g[i + 1] * fx) * (1 - fy) + (g[i + w] * (1 - fx) + g[i + w + 1] * fx) * fy;
    }
    return o;
  }

  /* gray pipeline (pure) */
  function process(g, w, h, opts){
    opts = opts || {};
    var info = { warped:false };
    var q = findQuad(g, w, h);
    if(q){
      var r = warp(g, w, h, q, opts.maxSide || 2000);
      if(r){ g = r.g; w = r.w; h = r.h; info.warped = true; }
    }
    g = stretch(flatten(g, w, h));
    if(!opts.noDeskew){
      var a = textSkew(g, w, h);
      if(Math.abs(a) >= 0.2){ g = rotateGray(g, w, h, -a); info.angle = a; }
    }
    return { g:g, w:w, h:h, info:info };
  }
  /* canvas in -> new gray canvas out */
  function prepare(canvas, opts){
    var x = canvas.getContext('2d'), d = x.getImageData(0, 0, canvas.width, canvas.height).data, g = new Uint8Array(canvas.width * canvas.height), i;
    for(i = 0; i < g.length; i++) g[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) | 0;
    var r = process(g, canvas.width, canvas.height, opts);
    var c = document.createElement('canvas'); c.width = r.w; c.height = r.h;
    var cx = c.getContext('2d'), im = cx.createImageData(r.w, r.h), o = im.data;
    for(i = 0; i < r.g.length; i++){ o[i * 4] = o[i * 4 + 1] = o[i * 4 + 2] = r.g[i]; o[i * 4 + 3] = 255; }
    cx.putImageData(im, 0, 0);
    c.hsiaInfo = r.info;
    return c;
  }
  window.hsiaDocPrep = { prepare:prepare, warpQuad:warp, flatten:flatten, stretch:stretch, _t:{ process:process, findQuad:findQuad } };
})();
