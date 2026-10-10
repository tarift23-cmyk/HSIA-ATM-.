/* Blank Page editor: A4 page you type on directly, Word-style formatting ribbon, movable photo / signature boxes,
   photo / handwriting scan, Print / PDF / PNG at 300 dpi. */
(function(){
  if(window.hsiaOpenBlank) return;
  var MARGIN = '15mm', DPI = 300, CFG_KEY = 'hsiaBlankScanCfg';
  var FAMILY = "'Noto Sans Bengali','Hind Siliguri',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
  var SIZES = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 48];
  var FONTS = [['', 'Default'], ['Arial, Helvetica, sans-serif', 'Arial'], ['"Times New Roman", Times, serif', 'Times New Roman'], ['"Courier New", monospace', 'Courier New'],
    ["'Noto Sans Bengali', sans-serif", 'Noto Sans Bengali'], ["'Noto Serif Bengali', serif", 'Noto Serif Bengali'], ['Kalpurush, sans-serif', 'Kalpurush'], ['SolaimanLipi, sans-serif', 'SolaimanLipi'], ['Nikosh, sans-serif', 'Nikosh']];
  var COLORS = ['#000000', '#7f7f7f', '#c00000', '#ff6600', '#ffd400', '#00a651', '#00a3e0', '#1f3fbf', '#7030a0', '#ffffff'];
  var HILITES = ['#ffff00', '#ffd966', '#a9f5a9', '#9de0ff', '#ffb3de', '#ffb3b3', '#d9d9d9', 'transparent'];
  var DEF = { photo:{ x:160, y:15, w:35, h:45 }, sign:{ x:145, y:255, w:40, h:14 } };
  var saved = '', size = 12, fam = '', marks = false;

  var CONTENT_CSS =
    '.bkc{position:relative;} .bkc ul,.bkc ol{margin:0;padding-left:1.6em;} .bkc sub,.bkc sup{font-size:0.75em;}' +
    '.bkc .ph{position:absolute;display:block;box-sizing:border-box;border:0.3mm solid #000;color:#888;font-size:9pt;line-height:1.2;text-align:center;}' +
    '.bkc .ph[data-k="photo"]{width:35mm;height:45mm;} .bkc .ph[data-k="sign"]{width:40mm;height:14mm;}' +
    '.bkc .ph:after{content:attr(data-l);position:absolute;left:0;right:0;top:50%;margin-top:-0.6em;}';

  var css = document.createElement('style');
  css.textContent = CONTENT_CSS +
    '#blkOv{position:fixed;inset:0;z-index:100000;background:#0b0b0d;color:#eee;display:flex;flex-direction:column;font-family:' + FAMILY + ';}' +
    '#blkOv .bk-top{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #222;flex:0 0 auto;}' +
    '#blkOv .bk-t{flex:1;min-width:0;font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '#blkOv .bk-b{min-width:42px;height:42px;border:1px solid #3a3a40;background:#18181d;color:#eee;border-radius:10px;font-size:18px;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0 8px;}' +
    '#blkOv .bk-p{padding:0 14px;background:#f6c84c;color:#222;border:0;font-size:15px;font-weight:600;}' +
    '#blkOv .bk-body{flex:1 1 auto;overflow:auto;padding:12px;-webkit-overflow-scrolling:touch;}' +
    '#blkOv .bk-wrap{position:relative;width:100%;max-width:640px;margin:0 auto 14px;background:#fff;border-radius:3px;overflow:hidden;}' +
    '#blkOv .bk-pg{position:absolute;left:0;top:0;transform-origin:0 0;width:210mm;height:297mm;box-sizing:border-box;padding:' + MARGIN + ';background:#fff;color:#000;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;overflow:hidden;font-family:' + FAMILY + ';outline:none;cursor:text;-webkit-user-select:text;user-select:text;}' +
    '#blkOv .bk-pg.empty:before{content:attr(data-ph);color:#aaa;position:absolute;left:' + MARGIN + ';top:' + MARGIN + ';pointer-events:none;}' +
    '#blkOv .bk-pg.marks div:after,#blkOv .bk-pg.marks li:after{content:"\\00b6";color:#9ab;font-size:0.7em;}' +
    '#blkOv .bk-pg .ph{touch-action:none;cursor:move;-webkit-user-select:none;user-select:none;}' +
    '#blkOv .bk-pg .ph.sel{outline:0.6mm solid #2f7df6;}' +
    '#blkOv .bk-pg .ph i{position:absolute;font-style:normal;color:#fff;background:#2f7df6;font-size:12pt;line-height:1;text-align:center;}' +
    '#blkOv .bk-pg .ph i.x{right:-4mm;top:-4mm;width:8mm;height:8mm;border-radius:50%;line-height:8mm;background:#e5484d;}' +
    '#blkOv .bk-pg .ph i.rs{right:-3mm;bottom:-3mm;width:6mm;height:6mm;border-radius:1mm;}' +
    '#blkOv .bk-rb{max-width:640px;margin:0 auto 10px;background:#15151a;border:1px solid #2a2a30;border-radius:12px;padding:6px;position:sticky;top:-12px;z-index:3;max-height:55vh;overflow:auto;}' +
    '#blkOv .rw{display:flex;gap:4px;margin-bottom:4px;align-items:stretch;}' +
    '#blkOv .rw.hid,#blkOv .bk-rb.col .more{display:none;}' +
    '#blkOv .rw button,#blkOv .rw select{height:38px;min-width:0;background:#0f0f12;color:#eee;border:1px solid #33333a;border-radius:8px;font-size:15px;font-family:inherit;padding:0 4px;display:flex;align-items:center;justify-content:center;}' +
    '#blkOv .rw button{flex:1 1 0;}' +
    '#blkOv .rw button.on{background:#25324a;border-color:#2f7df6;}' +
    '#blkOv .rw select{padding:0 6px;}' +
    '#blkOv .rw svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}' +
    '#blkOv .rw .sw{width:18px;height:18px;border-radius:50%;border:1px solid #666;flex:0 0 auto;}' +
    '#blkOv .rw button.txt{font-size:13px;white-space:nowrap;}' +
    '#blkOv .grip{height:14px !important;border:0 !important;background:transparent !important;}' +
    '#blkOv .grip:after{content:"";width:46px;height:5px;border-radius:3px;background:#555;}' +
    '#blkOv .bk-w{max-width:640px;margin:6px auto 0;font-size:12px;color:#ff6b6b;display:none;}' +
    '#blkOv .bk-m{position:absolute;right:12px;top:60px;background:#18181d;border:1px solid #3a3a40;border-radius:10px;padding:6px;display:none;z-index:6;}' +
    '#blkOv .bk-m button{display:block;width:100%;min-width:170px;margin:0;padding:11px 12px;background:none;border:0;color:#eee;font-size:15px;text-align:left;font-family:inherit;cursor:pointer;white-space:nowrap;}' +
    '#blkOv .bk-dlg{position:absolute;inset:0;z-index:7;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:14px;}' +
    '#blkOv .bk-dbox{width:100%;max-width:440px;background:#18181d;border:1px solid #333;border-radius:16px;padding:14px;max-height:92vh;overflow:auto;}' +
    '#blkOv .bk-dbox h3{margin:0 0 10px;font-size:16px;}' +
    '#blkOv .bk-dbox label{display:block;font-size:12px;color:#9a9aa3;margin:8px 0 3px;}' +
    '#blkOv .bk-dbox input,#blkOv .bk-dbox select{width:100%;box-sizing:border-box;height:40px;background:#0f0f12;color:#eee;border:1px solid #3a3a40;border-radius:8px;padding:0 10px;font-size:14px;font-family:inherit;}' +
    '#blkOv .bk-dbox .hint{font-size:12px;color:#8d8d96;line-height:1.5;margin-top:10px;}' +
    '#blkOv .bk-dbox .row{display:flex;gap:8px;margin-top:14px;}' +
    '#blkOv .bk-dbox .row button{flex:1;height:42px;border-radius:10px;border:1px solid #3a3a40;background:#222227;color:#eee;font-size:15px;font-weight:600;font-family:inherit;}' +
    '#blkOv .bk-dbox .row .go{background:#f6c84c;color:#222;border:0;}';
  document.head.appendChild(css);

  function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }

  /* ---------- keep only safe tags / styles; this is what gets printed and saved ---------- */
  function mmOf(v){ var m = /^(-?[\d.]+)mm$/.exec(v || ''); return m ? +m[1] : NaN; }
  function styleOf(el){
    var s = el.style, o = [], v;
    if(!s) return '';
    if((v = s.fontSize) && /^\d+(\.\d+)?(pt|px)$/.test(v)) o.push('font-size:' + v);
    if((v = s.fontFamily) && /^[\w\s,'"\-]+$/.test(v)) o.push('font-family:' + v);
    if((v = s.color) && /^(#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|[a-z]+)$/i.test(v)) o.push('color:' + v);
    if((v = s.backgroundColor) && /^(#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|[a-z]+)$/i.test(v)) o.push('background-color:' + v);
    if((v = s.textAlign) && /^(left|right|center|justify)$/.test(v)) o.push('text-align:' + v);
    if((v = s.lineHeight) && /^[\d.]+(%|px|pt)?$/.test(v)) o.push('line-height:' + v);
    if((v = s.marginLeft) && /^[\d.]+(px|pt|mm|em)$/.test(v) && parseFloat(v) > 0) o.push('margin-left:' + v);
    if((v = s.paddingLeft) && /^[\d.]+(px|pt|mm|em)$/.test(v) && parseFloat(v) > 0) o.push('padding-left:' + v);
    if((v = el.getAttribute('dir') || s.direction) && /^(ltr|rtl)$/.test(v)) o.push('direction:' + v);
    if((v = s.fontWeight) && /^(bold|[6-9]00)$/.test(v)) o.push('font-weight:bold');
    if((v = s.fontStyle) && v === 'italic') o.push('font-style:italic');
    if((v = s.textDecorationLine || s.textDecoration) && /underline|line-through/.test(v)) o.push('text-decoration:' + (/underline/.test(v) ? 'underline' : '') + (/line-through/.test(v) ? ' line-through' : ''));
    return o.join(';');
  }
  function clean(html){
    var doc = new DOMParser().parseFromString('<body>' + html + '</body>', 'text/html'), nBox = 0;
    function box(k){
      var kind = k.getAttribute('data-k') === 'sign' ? 'sign' : 'photo', d = DEF[kind], x = mmOf(k.style.left), y = mmOf(k.style.top), w = mmOf(k.style.width), h = mmOf(k.style.height);
      if(isNaN(w) || w < 5) w = d.w; if(isNaN(h) || h < 5) h = d.h;
      if(isNaN(x)){ var px = parseFloat(k.getAttribute('data-x')); x = isNaN(px) ? d.x - nBox * 5 : px * 2.1; }
      if(isNaN(y)){ var py = parseFloat(k.getAttribute('data-y')); y = isNaN(py) ? d.y + nBox * 5 : py * 2.97; }
      x = Math.max(0, Math.min(210 - w, x)); y = Math.max(0, Math.min(297 - h, y)); nBox++;
      return '<div class="ph" data-k="' + kind + '" data-l="' + (kind === 'sign' ? 'Signature' : 'Photo') + '" style="left:' + x.toFixed(1) + 'mm;top:' + y.toFixed(1) + 'mm;width:' + w.toFixed(1) + 'mm;height:' + h.toFixed(1) + 'mm"></div>';
    }
    function wrap(tag, st, inner){ return '<' + tag + (st ? ' style="' + esc(st) + '"' : '') + '>' + inner + '</' + tag + '>'; }
    function walk(n){
      var out = '';
      n.childNodes.forEach(function(k){
        if(k.nodeType === 3){ out += esc(k.nodeValue); return; }
        if(k.nodeType !== 1) return;
        var t = k.tagName.toLowerCase();
        if(/^(script|style|img|iframe|object|embed|svg|link|meta)$/.test(t)) return;
        if(t === 'br'){ out += '<br>'; return; }
        var cl = (k.getAttribute('class') || '').split(/\s+/);
        if(t === 'div' && cl.indexOf('ph') >= 0){ out += box(k); return; }
        var inner = walk(k), st = styleOf(k);
        if(cl.indexOf('c') >= 0 && st.indexOf('text-align') < 0) st += (st ? ';' : '') + 'text-align:center';
        if(cl.indexOf('r') >= 0 && st.indexOf('text-align') < 0) st += (st ? ';' : '') + 'text-align:right';
        if(t === 'b' || t === 'strong') out += wrap('b', st, inner);
        else if(t === 'i' || t === 'em') out += wrap('i', st, inner);
        else if(t === 'u') out += wrap('u', st, inner);
        else if(t === 's' || t === 'strike' || t === 'del') out += wrap('s', st, inner);
        else if(t === 'sub' || t === 'sup') out += wrap(t, st, inner);
        else if(t === 'font'){
          var fs = [], face = k.getAttribute('face'), col = k.getAttribute('color');
          if(face && /^[\w\s,'"\-]+$/.test(face)) fs.push('font-family:' + face);
          if(col && /^(#[0-9a-f]{3,8}|[a-z]+)$/i.test(col)) fs.push('color:' + col);
          out += fs.length || st ? wrap('span', (st ? st + (fs.length ? ';' : '') : '') + fs.join(';'), inner) : inner;
        }
        else if(t === 'span') out += st ? wrap('span', st, inner) : inner;
        else if(t === 'ul' || t === 'ol' || t === 'li') out += wrap(t, st, inner);
        else if(t === 'blockquote'){ if(st.indexOf('margin-left') < 0) st += (st ? ';' : '') + 'margin-left:40px'; out += wrap('div', st, inner); }
        else if(t === 'div' || t === 'p' || /^h[1-6]$/.test(t)) out += wrap('div', st, inner);
        else out += inner;
      });
      return out;
    }
    return walk(doc.body);
  }
  function pageStyle(){
    return 'position:relative;width:210mm;height:297mm;box-sizing:border-box;padding:' + MARGIN + ';background:#fff;color:#000;font-size:' + size + 'pt;' +
      'line-height:1.5;white-space:pre-wrap;word-wrap:break-word;overflow:hidden;font-family:' + (fam || FAMILY) + ';';
  }
  function getCfg(){ try{ return JSON.parse(localStorage.getItem(CFG_KEY) || '{}') || {}; }catch(e){ return {}; } }
  function lockBoxes(r){ r.querySelectorAll('.ph').forEach(function(x){ x.setAttribute('contenteditable', 'false'); }); }

  var I = {
    ul:'<svg viewBox="0 0 24 24"><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1.3" fill="currentColor"/><circle cx="4.5" cy="12" r="1.3" fill="currentColor"/><circle cx="4.5" cy="18" r="1.3" fill="currentColor"/></svg>',
    ol:'<svg viewBox="0 0 24 24"><path d="M10 6h11M10 12h11M10 18h11"/><text x="2" y="8" font-size="7" fill="currentColor" stroke="none">1</text><text x="2" y="14" font-size="7" fill="currentColor" stroke="none">2</text><text x="2" y="20" font-size="7" fill="currentColor" stroke="none">3</text></svg>',
    ind:'<svg viewBox="0 0 24 24"><path d="M3 5h18M11 10h10M11 14h10M3 19h18"/><path d="M3 9l5 3-5 3z" fill="currentColor"/></svg>',
    out:'<svg viewBox="0 0 24 24"><path d="M3 5h18M11 10h10M11 14h10M3 19h18"/><path d="M8 9l-5 3 5 3z" fill="currentColor"/></svg>',
    l:'<svg viewBox="0 0 24 24"><path d="M3 5h18M3 10h11M3 15h18M3 20h11"/></svg>',
    c:'<svg viewBox="0 0 24 24"><path d="M3 5h18M7 10h10M3 15h18M7 20h10"/></svg>',
    r:'<svg viewBox="0 0 24 24"><path d="M3 5h18M10 10h11M3 15h18M10 20h11"/></svg>',
    j:'<svg viewBox="0 0 24 24"><path d="M3 5h18M3 10h18M3 15h18M3 20h18"/></svg>',
    ls:'<svg viewBox="0 0 24 24"><path d="M10 6h11M10 12h11M10 18h11M5 4v16M3 6l2-2 2 2M3 18l2 2 2-2"/></svg>',
    ltr:'<svg viewBox="0 0 24 24"><path d="M3 5h18M3 19h18M12 10h9M12 14h9"/><path d="M3 9l6 3-6 3z" fill="currentColor"/></svg>',
    rtl:'<svg viewBox="0 0 24 24"><path d="M3 5h18M3 19h18M3 10h9M3 14h9"/><path d="M21 9l-6 3 6 3z" fill="currentColor"/></svg>'
  };

  function open(arg){
    if(document.getElementById('blkOv')) return;
    var ov = document.createElement('div'); ov.id = 'blkOv';
    var sOpts = SIZES.map(function(s){ return '<option value="' + s + '">' + s + ' pt</option>'; }).join('');
    var fOpts = FONTS.map(function(f, i){ return '<option value="' + i + '">' + f[1] + '</option>'; }).join('');
    ov.innerHTML =
      '<div class="bk-top"><button class="bk-b" id="bkX" aria-label="Close">✕</button><div class="bk-t">Blank Page</div>' +
      '<button class="bk-b" id="bkD" aria-label="Download">⬇</button><button class="bk-b bk-p" id="bkP">🖨️ প্রিন্ট</button></div>' +
      '<div class="bk-m" id="bkM"><button data-f="pdf">PDF (A4)</button><button data-f="png">PNG (A4)</button></div>' +
      '<div class="bk-body"><div class="bk-rb" id="bkRb">' +
        '<div class="rw"><select id="bkFam" aria-label="Font" style="flex:3">' + fOpts + '</select><select id="bkSz" aria-label="Font size" style="flex:1.6">' + sOpts + '</select>' +
          '<button data-a="smaller" aria-label="Smaller">A<span style="font-size:10px">−</span></button><button data-a="bigger" aria-label="Bigger">A<span style="font-size:10px">+</span></button></div>' +
        '<div class="rw"><button data-a="case" class="txt">Aa</button><button data-a="clear" class="txt" aria-label="Clear formatting">Tx</button>' +
          '<button data-a="bold" style="font-weight:800">B</button><button data-a="italic" style="font-style:italic;font-family:serif">I</button><button data-a="underline" style="text-decoration:underline">U</button><button data-a="strike" style="text-decoration:line-through">S</button>' +
          '<button data-a="sub" class="txt">X₂</button><button data-a="sup" class="txt">X²</button></div>' +
        '<div class="rw more"><button data-a="hl" aria-label="Highlight"><span style="background:#ffff00;color:#000;padding:0 4px;border-radius:3px;font-size:13px">ab</span></button><button data-a="hlmenu" class="txt">▾</button>' +
          '<button data-a="color" aria-label="Text color"><span style="border-bottom:4px solid #c00000;font-weight:700;line-height:1">A</span></button><button data-a="colormenu" class="txt">▾</button>' +
          '<button data-a="ul" aria-label="Bullets">' + I.ul + '</button><button data-a="ol" aria-label="Numbering">' + I.ol + '</button><button data-a="outdent" aria-label="Decrease indent">' + I.out + '</button><button data-a="indent" aria-label="Increase indent">' + I.ind + '</button></div>' +
        '<div class="rw more"><button data-a="left" aria-label="Align left">' + I.l + '</button><button data-a="center" aria-label="Center">' + I.c + '</button><button data-a="right" aria-label="Align right">' + I.r + '</button><button data-a="justify" aria-label="Justify">' + I.j + '</button>' +
          '<button data-a="spacing" aria-label="Line spacing">' + I.ls + '</button><button data-a="ltr" aria-label="Left to right">' + I.ltr + '</button><button data-a="rtl" aria-label="Right to left">' + I.rtl + '</button><button data-a="marks" class="txt" aria-label="Show paragraph marks">¶</button></div>' +
        '<div class="rw hid" id="bkPal"></div>' +
        '<div class="rw more"><button data-a="photo" class="txt">+ Photo box</button><button data-a="sign" class="txt">+ Signature box</button><button data-a="cfg" aria-label="Scan settings" style="flex:0 0 44px">⚙</button></div>' +
        '<div class="rw"><button class="grip" data-a="grip" aria-label="Show or hide tools"></button></div>' +
      '</div>' +
      '<div class="bk-wrap" id="bkW"><div class="bk-pg bkc empty" id="bkPg" contenteditable="true" spellcheck="false" data-ph="Tap anywhere on the page and type…"></div></div>' +
      '<div class="bk-w" id="bkWarn">Text is longer than one A4 page. The extra part will be cut off.</div></div>';
    document.body.appendChild(ov);
    var $ = function(id){ return document.getElementById(id); };
    var wrap = $('bkW'), pg = $('bkPg'), rb = $('bkRb'), pal = $('bkPal'), warn = $('bkWarn'), menu = $('bkM');
    var lastRange = null, selBox = null, drag = null, hlColor = '#ffff00', txColor = '#c00000';
    pg.innerHTML = saved || '<div><br></div>'; lockBoxes(pg);

    function scale(){ return wrap.clientWidth / pg.offsetWidth; }
    function fit(){ var s = scale(); pg.style.transform = 'scale(' + s + ')'; wrap.style.height = (pg.offsetHeight * s) + 'px'; }
    function html(){ return clean(pg.innerHTML); }
    function snapshot(){
      var c = pg.cloneNode(true);
      c.querySelectorAll('.ph i').forEach(function(x){ x.remove(); });
      c.querySelectorAll('.ph').forEach(function(x){ x.classList.remove('sel'); });
      return c.innerHTML;
    }
    function ensureBlock(){
      var f = pg.firstChild;
      if(!f || f.nodeType === 3){ if(pg.textContent.trim()){ pg.focus(); document.execCommand('formatBlock', false, 'div'); } }
    }
    function update(){
      ensureBlock();
      pg.style.fontSize = size + 'pt'; pg.style.fontFamily = fam || FAMILY;
      pg.classList.toggle('marks', marks);
      pg.classList.toggle('empty', !pg.textContent.trim() && !pg.querySelector('.ph, ul, ol, li'));
      saved = snapshot();
      warn.style.display = (pg.scrollHeight > pg.clientHeight + 2) ? 'block' : 'none';
    }
    pg.addEventListener('input', update);
    pg.addEventListener('paste', function(e){ e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); });

    /* ----- selection memory so the ribbon works even after the keyboard / focus moves ----- */
    function inPg(n){ return n && pg.contains(n.nodeType === 1 ? n : n.parentNode); }
    function selPt(){
      var n = lastRange ? lastRange.startContainer : pg, el = n.nodeType === 1 ? n : n.parentNode;
      var px = parseFloat(getComputedStyle(el).fontSize) || (size * 96 / 72);
      return Math.round(px * 72 / 96 * 2) / 2;
    }
    function syncTools(){
      try{
        ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript'].forEach(function(c, i){
          var b = rb.querySelector('[data-a="' + ['bold', 'italic', 'underline', 'strike', 'sub', 'sup'][i] + '"]');
          if(b) b.classList.toggle('on', document.queryCommandState(c));
        });
        var pt = selPt(), sel = $('bkSz'), best = 0, bd = 999;
        SIZES.forEach(function(s, i){ if(Math.abs(s - pt) < bd){ bd = Math.abs(s - pt); best = i; } });
        sel.selectedIndex = best;
      }catch(e){}
    }
    function onSel(){
      var s = window.getSelection(); if(!s || !s.rangeCount) return;
      var r = s.getRangeAt(0);
      if(inPg(r.startContainer) && inPg(r.endContainer)){ lastRange = r.cloneRange(); syncTools(); }
    }
    document.addEventListener('selectionchange', onSel);
    function withSel(fn){
      pg.focus();
      var s = window.getSelection();
      if(lastRange){ s.removeAllRanges(); s.addRange(lastRange); }
      fn(); onSel(); update();
    }
    function cmd(name, val, css){ withSel(function(){ document.execCommand('styleWithCSS', false, !!css); document.execCommand(name, false, val == null ? null : val); }); }
    function hasSel(){ return lastRange && !lastRange.collapsed; }

    function setPt(pt){
      pt = Math.max(6, Math.min(96, pt));
      if(hasSel()){
        withSel(function(){
          document.execCommand('styleWithCSS', false, false); document.execCommand('fontSize', false, '7');
          pg.querySelectorAll('font[size="7"]').forEach(function(f){
            var sp = document.createElement('span'); sp.style.fontSize = pt + 'pt';
            while(f.firstChild) sp.appendChild(f.firstChild);
            sp.querySelectorAll('[style]').forEach(function(x){ x.style.fontSize = ''; });
            f.parentNode.replaceChild(sp, f);
          });
        });
      } else { size = pt; update(); fit(); }
    }
    function blocks(){
      var out = [];
      if(!lastRange) return out;
      pg.querySelectorAll('div,p,li').forEach(function(b){
        if(b.classList.contains('ph') || b.closest('.ph')) return;
        if(b.querySelector('div,p,li')) return;
        if(lastRange.intersectsNode(b)) out.push(b);
      });
      return out;
    }
    function showRow(items){
      pal.innerHTML = items.map(function(it){ return '<button data-a="' + it.a + '" data-v="' + esc(it.v) + '" class="txt"' + (it.st ? ' style="' + it.st + '"' : '') + '>' + it.l + '</button>'; }).join('');
      pal.classList.remove('hid');
    }
    function palette(list, act){
      showRow(list.map(function(c){ return { a:act, v:c, l:'<span class="sw" style="background:' + (c === 'transparent' ? 'repeating-linear-gradient(45deg,#fff 0 3px,#d33 3px 5px)' : c) + '"></span>' }; }));
    }
    function caseOf(mode){
      withSel(function(){
        var t = window.getSelection().toString(); if(!t) return;
        var r = mode === 'upper' ? t.toUpperCase() : mode === 'lower' ? t.toLowerCase()
          : mode === 'title' ? t.toLowerCase().replace(/(^|[\s(\-])(\S)/g, function(m, a, b){ return a + b.toUpperCase(); })
          : t.toLowerCase().replace(/(^\s*|[.!?]\s+)(\S)/g, function(m, a, b){ return a + b.toUpperCase(); });
        document.execCommand('insertText', false, r);
      });
    }
    function addBox(kind){
      var d = DEF[kind], n = pg.querySelectorAll('.ph').length, el = document.createElement('div');
      el.className = 'ph'; el.setAttribute('data-k', kind); el.setAttribute('data-l', kind === 'sign' ? 'Signature' : 'Photo'); el.setAttribute('contenteditable', 'false');
      el.style.left = (d.x - n * 5) + 'mm'; el.style.top = (d.y + n * 5) + 'mm'; el.style.width = d.w + 'mm'; el.style.height = d.h + 'mm';
      pg.appendChild(el); selectBox(el); update();
    }
    function selectBox(b){
      if(selBox && selBox !== b) unselBox();
      selBox = b; if(!b) return;
      b.classList.add('sel');
      if(!b.querySelector('i')) b.insertAdjacentHTML('beforeend', '<i class="x" data-a="x">✕</i><i class="rs" data-a="rs"></i>');
    }
    function unselBox(){ if(selBox){ selBox.classList.remove('sel'); selBox.querySelectorAll('i').forEach(function(i){ i.remove(); }); selBox = null; } }

    /* ----- ribbon ----- */
    rb.addEventListener('click', function(e){
      var b = e.target.closest('button[data-a]'); if(!b) return;
      var a = b.getAttribute('data-a'), v = b.getAttribute('data-v');
      if(a !== 'hlmenu' && a !== 'colormenu' && a !== 'case' && a !== 'spacing' && a !== 'grip' && a !== 'hl' && a !== 'color') pal.classList.add('hid');
      if(a === 'bold') cmd('bold'); else if(a === 'italic') cmd('italic'); else if(a === 'underline') cmd('underline'); else if(a === 'strike') cmd('strikeThrough');
      else if(a === 'sub') cmd('subscript'); else if(a === 'sup') cmd('superscript');
      else if(a === 'clear') cmd('removeFormat');
      else if(a === 'smaller') setPt((hasSel() ? selPt() : size) - 1);
      else if(a === 'bigger') setPt((hasSel() ? selPt() : size) + 1);
      else if(a === 'case') showRow([{ a:'cs', v:'upper', l:'UPPER' }, { a:'cs', v:'lower', l:'lower' }, { a:'cs', v:'title', l:'Title Case' }, { a:'cs', v:'sentence', l:'Sentence' }]);
      else if(a === 'cs') caseOf(v);
      else if(a === 'hl') cmd('hiliteColor', hlColor, true);
      else if(a === 'hlmenu') palette(HILITES, 'hlpick');
      else if(a === 'hlpick'){ hlColor = v; b.blur(); cmd('hiliteColor', v, true); rb.querySelector('[data-a="hl"] span').style.background = v === 'transparent' ? '#fff' : v; }
      else if(a === 'color') cmd('foreColor', txColor, true);
      else if(a === 'colormenu') palette(COLORS, 'cpick');
      else if(a === 'cpick'){ txColor = v; cmd('foreColor', v, true); rb.querySelector('[data-a="color"] span').style.borderBottomColor = v; }
      else if(a === 'ul') cmd('insertUnorderedList'); else if(a === 'ol') cmd('insertOrderedList');
      else if(a === 'indent') cmd('indent'); else if(a === 'outdent') cmd('outdent');
      else if(a === 'left') cmd('justifyLeft', null, true); else if(a === 'center') cmd('justifyCenter', null, true);
      else if(a === 'right') cmd('justifyRight', null, true); else if(a === 'justify') cmd('justifyFull', null, true);
      else if(a === 'spacing') showRow(['1.0', '1.15', '1.5', '2.0', '2.5'].map(function(x){ return { a:'sp', v:x, l:x }; }));
      else if(a === 'sp') withSel(function(){ blocks().forEach(function(k){ k.style.lineHeight = v; }); });
      else if(a === 'ltr' || a === 'rtl') withSel(function(){ blocks().forEach(function(k){ k.setAttribute('dir', a); }); });
      else if(a === 'marks'){ marks = !marks; b.classList.toggle('on', marks); update(); }
      else if(a === 'photo') addBox('photo'); else if(a === 'sign') addBox('sign');
      else if(a === 'cfg') cfgDialog(ov);
      else if(a === 'grip'){ rb.classList.toggle('col'); pal.classList.add('hid'); }
    });
    $('bkSz').onchange = function(){ setPt(SIZES[this.selectedIndex]); };
    $('bkFam').onchange = function(){
      var f = FONTS[this.selectedIndex][0];
      if(hasSel()) cmd('fontName', f || 'inherit', true); else { fam = f; update(); }
    };
    ['bkSz', 'bkFam'].forEach(function(id){ $(id).value = id === 'bkSz' ? '12' : '0'; });

    /* ----- move / resize / delete the photo and signature boxes ----- */
    pg.addEventListener('pointerdown', function(e){
      var h = e.target.closest && e.target.closest('.ph');
      if(!h){ if(selBox){ unselBox(); update(); } return; }
      e.preventDefault();
      var role = e.target.getAttribute && e.target.getAttribute('data-a');
      if(role === 'x'){ h.remove(); selBox = null; update(); return; }
      selectBox(h);
      var pxmm = scale() * 96 / 25.4;
      drag = { h:h, mode:role === 'rs' ? 'rs' : 'mv', x:e.clientX, y:e.clientY, pxmm:pxmm,
        l:parseFloat(h.style.left) || 0, t:parseFloat(h.style.top) || 0, w:parseFloat(h.style.width) || 35, hh:parseFloat(h.style.height) || 45 };
      try{ h.setPointerCapture(e.pointerId); }catch(_){}
    });
    pg.addEventListener('pointermove', function(e){
      if(!drag) return;
      var dx = (e.clientX - drag.x) / drag.pxmm, dy = (e.clientY - drag.y) / drag.pxmm, h = drag.h;
      if(drag.mode === 'mv'){
        h.style.left = Math.max(0, Math.min(210 - drag.w, drag.l + dx)).toFixed(1) + 'mm';
        h.style.top = Math.max(0, Math.min(297 - drag.hh, drag.t + dy)).toFixed(1) + 'mm';
      } else {
        h.style.width = Math.max(8, Math.min(210 - drag.l, drag.w + dx)).toFixed(1) + 'mm';
        h.style.height = Math.max(8, Math.min(297 - drag.t, drag.hh + dy)).toFixed(1) + 'mm';
      }
    });
    function endDrag(){ if(drag){ drag = null; update(); } }
    pg.addEventListener('pointerup', endDrag); pg.addEventListener('pointercancel', endDrag);

    window.addEventListener('resize', fit);
    fit(); update(); syncTools();
    function close(){ window.removeEventListener('resize', fit); document.removeEventListener('selectionchange', onSel); ov.remove(); }
    $('bkX').onclick = close;

    $('bkP').onclick = function(){
      var f = document.createElement('iframe');
      f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
      document.body.appendChild(f);
      var d = f.contentWindow.document; d.open();
      d.write('<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}' + CONTENT_CSS + '.p{' + pageStyle() + '}</style></head><body><div class="p bkc">' + html() + '</div></body></html>');
      d.close();
      setTimeout(function(){ try{ f.contentWindow.focus(); f.contentWindow.print(); }catch(e){} setTimeout(function(){ f.remove(); }, 60000); }, 350);
    };
    $('bkD').onclick = function(e){ e.stopPropagation(); menu.style.display = menu.style.display === 'block' ? 'none' : 'block'; };
    ov.addEventListener('click', function(e){ if(!e.target.closest('.bk-m')){ menu.style.display = 'none'; } });
    menu.addEventListener('click', function(e){
      var b = e.target.closest('button'); if(!b) return;
      menu.style.display = 'none';
      render(html(), function(canvas){ b.getAttribute('data-f') === 'png' ? savePng(canvas) : savePdf(canvas); });
    });
    if(arg && arg.scan) startScan(ov, pg, update);
  }

  /* ---------- scan: photo of a handwritten / printed page -> editable text ---------- */
  var PROMPT =
    'Convert this photo of a handwritten or printed page (an application, letter, form, CV or any document; Bengali and/or English) into editable HTML. ' +
    'Transcribe the text exactly as written, in its original language and script. Do not translate, correct, summarise or add anything. ' +
    'Join lines that are only wrapped inside a paragraph into one paragraph. Start a new <div> for each paragraph and for each separate line such as date, address, salutation, subject, signature block or form field. ' +
    'Use <div class="c"> for centred lines and <div class="r"> for right-aligned lines. Use <b> for bold, underlined or clearly emphasised words (for example the subject line). ' +
    'Where the page has a passport-size photo or picture area, output <div class="ph" data-k="photo" data-x=".." data-y=".."></div>, where data-x and data-y are the position of its top-left corner as a percentage (0-100) of the page width and height. ' +
    'Where there is a handwritten signature or a signature box, output <div class="ph" data-k="sign" data-x=".." data-y=".."></div> the same way; if only a printed or written name is there, output the name as normal text. Put these boxes after the text, they float on the page. ' +
    'Use no other tags or attributes. Write [?] for a word you cannot read. Output only the HTML, with no explanation and no markdown fences.';

  function dlg(ov, inner){
    var d = ov.querySelector('.bk-dlg'); if(d) d.remove();
    d = document.createElement('div'); d.className = 'bk-dlg'; d.innerHTML = '<div class="bk-dbox">' + inner + '</div>';
    ov.appendChild(d); return d;
  }
  function cfgDialog(ov, after){
    var c = getCfg(), prov = c.prov || 'offline';
    var d = dlg(ov,
      '<h3>Scan settings</h3>' +
      '<label>Scan method</label><select id="cgP"><option value="offline">Offline (built-in, printed text)</option><option value="gemini">Google Gemini (handwriting)</option><option value="claude">Claude (handwriting)</option></select>' +
      '<div id="cgAi"><label>Your API key</label><input id="cgK" type="password" autocomplete="off" placeholder="Paste key here">' +
      '<label>Model</label><input id="cgM" type="text" autocapitalize="off" spellcheck="false"></div>' +
      '<div class="hint" id="cgH"></div>' +
      '<div class="row"><button id="cgC">Cancel</button><button class="go" id="cgS">Save</button></div>');
    var P = d.querySelector('#cgP'), K = d.querySelector('#cgK'), M = d.querySelector('#cgM');
    var DEF = { gemini:'gemini-flash-latest', claude:'claude-sonnet-5-5' };
    var HINT = {
      offline:'Works on the phone itself, no key and no cost. Reads printed or typed pages (Bengali + English). It cannot read handwriting reliably. The first scan downloads the language data once (about 20 MB). The photo never leaves the phone and is deleted right after reading.',
      ai:'Reading handwriting needs an AI service. The photo is sent to the provider you choose, and any usage is billed to your own key. The key is saved only on this device. The photo itself is deleted from the phone right after it is sent.'
    };
    function sync(){ var off = P.value === 'offline'; d.querySelector('#cgAi').style.display = off ? 'none' : 'block'; d.querySelector('#cgH').textContent = off ? HINT.offline : HINT.ai; }
    P.value = prov; K.value = c.key || ''; M.value = c.model || DEF[prov] || DEF.gemini; sync();
    P.onchange = function(){ if(P.value !== 'offline' && (!M.value || M.value === DEF.gemini || M.value === DEF.claude)) M.value = DEF[P.value]; sync(); };
    d.querySelector('#cgC').onclick = function(){ d.remove(); };
    d.querySelector('#cgS').onclick = function(){
      if(P.value !== 'offline' && !K.value.trim()){ alert('Please paste your API key.'); return; }
      try{ localStorage.setItem(CFG_KEY, JSON.stringify({ prov:P.value, key:K.value.trim(), model:M.value.trim() || DEF[P.value] || '' })); }catch(e){}
      d.remove(); if(after) after();
    };
  }
  /* straighten the page, even out the light (see docprep.js); falls back to the plain photo if it cannot */
  function loadPrep(){
    return new Promise(function(res){
      if(window.hsiaDocPrep){ res(); return; }
      var s = document.createElement('script'); s.src = 'forms/docprep.js';
      s.onload = function(){ res(); }; s.onerror = function(){ s.remove(); res(); };
      document.head.appendChild(s);
    });
  }
  function cleanPage(c){
    if(!window.hsiaDocPrep) return c;
    try{ var p = window.hsiaDocPrep.prepare(c, { maxSide:2000 }); c.width = c.height = 0; return p; }catch(e){ return c; }
  }
  function prepImage(file){
    return createImageBitmap(file).then(function(bmp){
      var s = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
      var c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      if(bmp.close) bmp.close();
      c = cleanPage(c);
      var b64 = c.toDataURL('image/jpeg', 0.85).split(',')[1];
      c.width = c.height = 0;
      return b64;
    });
  }
  function apiErr(j, r){ var e = new Error((j && j.error && j.error.message) || ('Error ' + r.status)); e.status = r.status; return e; }
  function retryable(e){ return e && (e.status === 429 || e.status === 500 || e.status === 503 || e.status === 504 || /high demand|overload|unavailable|try again/i.test(e.message || '') || e instanceof TypeError); }
  /* busy servers are common on the free tier: retry a few times, then try the lighter model */
  function callAiRetry(cfg, b64, say){
    var models = [cfg.model];
    if(cfg.prov !== 'claude' && cfg.model !== 'gemini-flash-lite-latest') models.push('gemini-flash-lite-latest');
    var waits = [0, 3000, 6000], jobs = [];
    models.forEach(function(m){ waits.forEach(function(w, i){ jobs.push({ m:m, w:w, i:i }); }); });
    var k = 0;
    function next(lastErr){
      if(k >= jobs.length) return Promise.reject(lastErr);
      var jb = jobs[k++];
      return new Promise(function(r){ setTimeout(r, jb.w); }).then(function(){
        if(say && (jb.w || jb.m !== cfg.model)) say('The service is busy, trying again' + (jb.m !== cfg.model ? ' with a lighter model' : '') + '…');
        return callAi({ prov:cfg.prov, key:cfg.key, model:jb.m }, b64);
      }).catch(function(e){ if(!retryable(e)) throw e; return next(e); });
    }
    return next();
  }
  function callAi(cfg, b64){
    if(cfg.prov === 'claude'){
      return fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'content-type':'application/json', 'x-api-key':cfg.key, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
        body:JSON.stringify({ model:cfg.model, max_tokens:4000, messages:[{ role:'user', content:[{ type:'image', source:{ type:'base64', media_type:'image/jpeg', data:b64 } }, { type:'text', text:PROMPT }] }] })
      }).then(function(r){ return r.json().then(function(j){ if(!r.ok) throw apiErr(j, r); return (j.content || []).map(function(p){ return p.text || ''; }).join(''); }); });
    }
    return fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(cfg.model) + ':generateContent', {
      method:'POST',
      headers:{ 'content-type':'application/json', 'x-goog-api-key':cfg.key },
      body:JSON.stringify({ contents:[{ parts:[{ text:PROMPT }, { inline_data:{ mime_type:'image/jpeg', data:b64 } }] }] })
    }).then(function(r){ return r.json().then(function(j){
      if(!r.ok) throw apiErr(j, r);
      var p = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
      if(!p) throw new Error('No text came back. Try a clearer photo.');
      return p.map(function(x){ return x.text || ''; }).join('');
    }); });
  }
  function ocrCanvas(file){
    return createImageBitmap(file).then(function(bmp){
      var s = Math.min(1, 2000 / Math.max(bmp.width, bmp.height)), c = document.createElement('canvas');
      c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
      var x = c.getContext('2d'); x.drawImage(bmp, 0, 0, c.width, c.height); if(bmp.close) bmp.close();
      if(window.hsiaDocPrep) return cleanPage(c);
      var im = x.getImageData(0, 0, c.width, c.height), d = im.data, h = new Uint32Array(256), i, n = d.length / 4, lo = 0, hi = 255, a = 0;
      for(i = 0; i < d.length; i += 4){ var g = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) | 0; d[i] = g; h[g]++; }
      while(lo < 255 && (a += h[lo]) < n * 0.01) lo++;
      a = 0; while(hi > 0 && (a += h[hi]) < n * 0.01) hi--;
      if(hi - lo < 30){ lo = 0; hi = 255; }
      for(i = 0; i < d.length; i += 4){ var v = Math.max(0, Math.min(255, ((d[i] - lo) * 255 / (hi - lo)) | 0)); d[i] = d[i + 1] = d[i + 2] = v; }
      x.putImageData(im, 0, 0);
      return c;
    });
  }
  function textToHtml(txt){
    return String(txt).replace(/\r/g, '').split(/\n\s*\n/).map(function(p){
      var ls = p.split('\n').map(function(l){ return l.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
      if(!ls.length) return '';
      var mx = Math.max.apply(null, ls.map(function(l){ return l.length; })), out = [], cur = '';
      ls.forEach(function(l){ cur = cur ? cur + ' ' + l : l; if(l.length < mx * 0.75){ out.push(cur); cur = ''; } });
      if(cur) out.push(cur);
      return out.map(function(l){ return '<div>' + esc(l) + '</div>'; }).join('');
    }).join('<div><br></div>');
  }
  function offlineRead(canvas, say){
    if(typeof Tesseract === 'undefined') return Promise.reject(new Error('The reader is not loaded yet. Check your internet once and try again.'));
    return Tesseract.createWorker('ben+eng', 1, { logger:function(m){
      if(m && m.status === 'recognizing text') say('Reading… ' + Math.round(m.progress * 100) + '%');
      else if(m && /loading|initializ/i.test(m.status || '')) say('Preparing the reader (first time downloads language data)…');
    } }).then(function(wk){
      return wk.setParameters({ tessedit_pageseg_mode:'3', preserve_interword_spaces:'1' })
        .then(function(){ return wk.recognize(canvas); })
        .then(function(res){ return wk.terminate().then(function(){ return res.data.text; }, function(){ return res.data.text; }); });
    });
  }
  function startScan(ov, ed, update){
    var cfg = getCfg(); if(!cfg.prov) cfg.prov = 'offline';
    if(cfg.prov !== 'offline' && !cfg.key){ cfgDialog(ov, function(){ startScan(ov, ed, update); }); return; }
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.style.display = 'none';
    document.body.appendChild(inp);
    inp.addEventListener('cancel', function(){ inp.remove(); });
    inp.onchange = function(){
      var file = inp.files && inp.files[0]; if(!file){ inp.remove(); return; }
      var d = dlg(ov, '<h3>Reading page…</h3><div class="hint" style="margin:0">This takes a few seconds.</div>');
      function wipe(){ try{ inp.value = ''; }catch(e){} inp.remove(); file = null; }
      var say = function(m){ var h = d.querySelector('.hint'); if(h) h.textContent = m; };
      var job = loadPrep().then(function(){ return cfg.prov === 'offline'
        ? ocrCanvas(file).then(function(cv){ wipe(); return offlineRead(cv, say).then(function(tx){ cv.width = cv.height = 0; return textToHtml(tx); }, function(e){ cv.width = cv.height = 0; throw e; }); })
        : prepImage(file).then(function(b64){ wipe(); return callAiRetry(cfg, b64, say); }); });
      job.then(function(txt){
        var h = clean(String(txt).replace(/```[a-z]*/gi, '').replace(/\s*\n\s*/g, ' ').trim());
        if(!h.trim()) throw new Error('Nothing was read. Try a clearer photo.');
        d.remove();
        if(ed.textContent.trim() && !confirm('Replace the current text with the scanned page?')) return;
        ed.innerHTML = h; lockBoxes(ed); update();
      }).catch(function(e){
        wipe();
        d = dlg(ov, '<h3>Scan failed</h3><div class="hint" style="margin:0;color:#ff7b7b">' + esc(e && e.status === 429 ? 'Free limit reached for now. Wait a minute and try again.' : e && (e.status === 503 || /high demand/i.test(e.message || '')) ? 'The AI service is very busy right now. Try again in a few minutes.' : ((e && e.message) || 'Could not read the photo.')) + '</div><div class="row"><button id="cgC">Close</button><button class="go" id="cgS">Settings</button></div>');
        d.querySelector('#cgC').onclick = function(){ d.remove(); };
        d.querySelector('#cgS').onclick = function(){ cfgDialog(ov); };
      });
    };
    if(navigator.userActivation && !navigator.userActivation.isActive){
      var d0 = dlg(ov, '<h3>Scan page</h3><div class="hint" style="margin:0">Choose a photo of the page (handwritten or printed).</div><div class="row"><button id="cgC">Cancel</button><button class="go" id="cgS">Choose photo</button></div>');
      d0.querySelector('#cgC').onclick = function(){ d0.remove(); inp.remove(); };
      d0.querySelector('#cgS').onclick = function(){ d0.remove(); inp.click(); };
    } else inp.click();
  }

  /* ---------- export: same layout engine as the preview, rendered at 300 dpi ---------- */
  function render(htmlStr, cb){
    var W = Math.round(210 / 25.4 * DPI), H = Math.round(297 / 25.4 * DPI);
    var div = document.createElement('div');
    div.setAttribute('class', 'bkc'); div.setAttribute('style', pageStyle());
    div.innerHTML = '<style>' + CONTENT_CSS + '</style>' + htmlStr;
    var xml = new XMLSerializer().serializeToString(div);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 793.7 1122.52">' +
      '<foreignObject width="793.7" height="1122.52">' + xml + '</foreignObject></svg>';
    var img = new Image();
    img.onload = function(){
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(img, 0, 0, W, H);
      cb(c);
    };
    img.onerror = function(){ alert('Could not create the file. Try Print instead.'); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function saveBlob(blob, name){
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(a.href); }, 5000);
  }
  function savePng(c){ c.toBlob(function(b){ saveBlob(b, 'Blank-Page.png'); }, 'image/png'); }
  function savePdf(c){
    c.toBlob(function(b){
      var fr = new FileReader();
      fr.onload = function(){
        var jpg = new Uint8Array(fr.result), enc = new TextEncoder(), parts = [], off = 0, xr = [];
        function add(x){ var u = typeof x === 'string' ? enc.encode(x) : x; parts.push(u); off += u.length; }
        function obj(n, body){ xr[n] = off; add(n + ' 0 obj\n'); add(body); add('\nendobj\n'); }
        add('%PDF-1.4\n');
        obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
        obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
        obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
        xr[4] = off; add('4 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + c.width + ' /Height ' + c.height + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpg.length + ' >>\nstream\n');
        add(jpg); add('\nendstream\nendobj\n');
        var cs = 'q 595.28 0 0 841.89 0 0 cm /Im0 Do Q';
        obj(5, '<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream');
        var xo = off; add('xref\n0 6\n0000000000 65535 f \n');
        for(var i = 1; i <= 5; i++) add(('0000000000' + xr[i]).slice(-10) + ' 00000 n \n');
        add('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xo + '\n%%EOF');
        saveBlob(new Blob(parts, { type:'application/pdf' }), 'Blank-Page.pdf');
      };
      fr.readAsArrayBuffer(b);
    }, 'image/jpeg', 1.0);
  }

  window.hsiaOpenBlank = open;
})();
