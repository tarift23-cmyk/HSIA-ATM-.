/* Blank Page editor: A4 preview on top, one rich-text box below (font size, bold, photo / signature boxes),
   photo/handwriting scan (AI, your own key), Print / PDF / PNG at 300 dpi. */
(function(){
  if(window.hsiaOpenBlank) return;
  var MARGIN = '15mm', DPI = 300, CFG_KEY = 'hsiaBlankScanCfg';
  var FAMILY = "'Noto Sans Bengali','Hind Siliguri',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
  var SIZES = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28];
  var saved = '', size = 12;

  /* content styles shared by preview, print and file export */
  var CONTENT_CSS =
    '.bkc .ph{display:inline-block;box-sizing:border-box;border:0.3mm solid #000;vertical-align:top;margin:1mm;position:relative;color:#888;font-size:9pt;line-height:1.2;text-align:center;}' +
    '.bkc .ph[data-k="photo"]{width:35mm;height:45mm;}' +
    '.bkc .ph[data-k="sign"]{width:40mm;height:14mm;}' +
    '.bkc .ph:after{content:attr(data-l);position:absolute;left:0;right:0;top:50%;margin-top:-0.6em;}' +
    '.bkc .c{text-align:center;} .bkc .r{text-align:right;}';

  var css = document.createElement('style');
  css.textContent = CONTENT_CSS +
    '#blkOv{position:fixed;inset:0;z-index:100000;background:#0b0b0d;color:#eee;display:flex;flex-direction:column;font-family:' + FAMILY + ';}' +
    '#blkOv .bk-top{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #222;flex:0 0 auto;}' +
    '#blkOv .bk-t{flex:1;min-width:0;font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '#blkOv .bk-b{min-width:42px;height:42px;border:1px solid #3a3a40;background:#18181d;color:#eee;border-radius:10px;font-size:18px;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0 8px;}' +
    '#blkOv .bk-p{padding:0 14px;background:#f6c84c;color:#222;border:0;font-size:15px;font-weight:600;}' +
    '#blkOv .bk-body{flex:1 1 auto;overflow:auto;padding:12px;-webkit-overflow-scrolling:touch;}' +
    '#blkOv .bk-l{font-size:13px;color:#9a9aa3;}' +
    '#blkOv .bk-wrap{position:relative;width:100%;max-width:640px;margin:6px auto 14px;background:#fff;border-radius:3px;overflow:hidden;}' +
    '#blkOv .bk-pg{position:absolute;left:0;top:0;transform-origin:0 0;width:210mm;height:297mm;box-sizing:border-box;padding:' + MARGIN + ';background:#fff;color:#000;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;overflow:hidden;font-family:' + FAMILY + ';outline:none;cursor:text;-webkit-user-select:text;user-select:text;}' +
    '#blkOv .bk-pg:empty:before{content:attr(data-ph);color:#aaa;}' +
    '#blkOv .bk-box{max-width:640px;margin:0 auto;background:#18181d;border:1px solid #2c2c32;border-radius:12px;padding:10px;}' +
    '#blkOv .bk-tb{display:flex;align-items:center;gap:6px;margin:0 auto 8px;flex-wrap:wrap;max-width:640px;position:sticky;top:-12px;z-index:2;background:#0b0b0d;padding:6px 0;}' +
    '#blkOv .bk-tb .sp{flex:1;}' +
    '#blkOv .bk-tb select,#blkOv .bk-tb button{height:36px;background:#0f0f12;color:#eee;border:1px solid #3a3a40;border-radius:8px;font-size:14px;font-family:inherit;padding:0 10px;}' +
    '#blkOv .bk-tb .bold{font-weight:800;min-width:38px;}' +
    '#blkOv .bk-ed{min-height:150px;max-height:40vh;overflow:auto;background:#0f0f12;color:#eee;border:1px solid #3a3a40;border-radius:10px;padding:10px;font-size:16px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;outline:none;}' +
    '#blkOv .bk-ed:empty:before{content:attr(data-ph);color:#6f6f78;}' +
    '#blkOv .bk-ed .ph{border-color:#aaa;}' +
    '#blkOv .bk-w{max-width:640px;margin:6px auto 0;font-size:12px;color:#ff6b6b;display:none;}' +
    '#blkOv .bk-m{position:absolute;right:12px;top:60px;background:#18181d;border:1px solid #3a3a40;border-radius:10px;padding:6px;display:none;z-index:3;}' +
    '#blkOv .bk-m button{display:block;width:100%;min-width:170px;margin:0;padding:11px 12px;background:none;border:0;color:#eee;font-size:15px;text-align:left;font-family:inherit;cursor:pointer;white-space:nowrap;}' +
    '#blkOv .bk-dlg{position:absolute;inset:0;z-index:5;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:14px;}' +
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

  /* keep only a safe, small set of tags: b u i br div(c/r/ph) */
  function clean(html){
    var doc = new DOMParser().parseFromString('<body>' + html + '</body>', 'text/html');
    function walk(n){
      var out = '';
      n.childNodes.forEach(function(k){
        if(k.nodeType === 3){ out += esc(k.nodeValue); return; }
        if(k.nodeType !== 1) return;
        var t = k.tagName.toLowerCase(), inner;
        if(t === 'script' || t === 'style' || t === 'img' || t === 'iframe') return;
        if(t === 'br'){ out += '<br>'; return; }
        var cl = (k.getAttribute('class') || '').split(/\s+/);
        if(t === 'div' && cl.indexOf('ph') >= 0){
          var sg = k.getAttribute('data-k') === 'sign';
          out += '<div class="ph" data-k="' + (sg ? 'sign' : 'photo') + '" data-l="' + (sg ? 'Signature' : 'Photo') + '"></div>'; return;
        }
        inner = walk(k);
        if(t === 'b' || t === 'strong') out += '<b>' + inner + '</b>';
        else if(t === 'u') out += '<u>' + inner + '</u>';
        else if(t === 'i' || t === 'em') out += '<i>' + inner + '</i>';
        else if(t === 'div' || t === 'p') out += '<div' + (cl.indexOf('c') >= 0 ? ' class="c"' : cl.indexOf('r') >= 0 ? ' class="r"' : '') + '>' + inner + '</div>';
        else out += inner;
      });
      return out;
    }
    return walk(doc.body);
  }
  function pageStyle(){
    return 'width:210mm;height:297mm;box-sizing:border-box;padding:' + MARGIN + ';background:#fff;color:#000;font-size:' + size + 'pt;' +
      'line-height:1.5;white-space:pre-wrap;word-wrap:break-word;overflow:hidden;font-family:' + FAMILY + ';';
  }
  function getCfg(){ try{ return JSON.parse(localStorage.getItem(CFG_KEY) || '{}') || {}; }catch(e){ return {}; } }

  function lockBoxes(r){ r.querySelectorAll('.ph').forEach(function(x){ x.setAttribute('contenteditable', 'false'); }); }
  function open(arg){
    if(document.getElementById('blkOv')) return;
    var ov = document.createElement('div'); ov.id = 'blkOv';
    var opts = SIZES.map(function(s){ return '<option value="' + s + '"' + (s === size ? ' selected' : '') + '>' + s + ' pt</option>'; }).join('');
    ov.innerHTML =
      '<div class="bk-top"><button class="bk-b" id="bkX" aria-label="Close">✕</button><div class="bk-t">Blank Page</div>' +
      '<button class="bk-b" id="bkD" aria-label="Download">⬇</button><button class="bk-b bk-p" id="bkP">🖨️ প্রিন্ট</button></div>' +
      '<div class="bk-m" id="bkM"><button data-f="pdf">PDF (A4)</button><button data-f="png">PNG (A4)</button></div>' +
      '<div class="bk-body"><div class="bk-tb"><select id="bkSz" aria-label="Font size">' + opts + '</select><button class="bold" id="bkBold" aria-label="Bold">B</button>' +
      '<button id="bkPh">+ Photo box</button><button id="bkSg">+ Signature box</button><button id="bkCfg" aria-label="Scan settings">⚙</button></div>' +
      '<div class="bk-wrap" id="bkW"><div class="bk-pg bkc" id="bkPg" contenteditable="true" spellcheck="false" data-ph="Tap anywhere on the page and type…"></div></div>' +
      '<div class="bk-w" id="bkWarn">Text is longer than one A4 page. The extra part will be cut off.</div></div>';
    document.body.appendChild(ov);
    var $ = function(id){ return document.getElementById(id); };
    var wrap = $('bkW'), pg = $('bkPg'), ed = pg, warn = $('bkWarn'), menu = $('bkM');
    pg.innerHTML = saved; lockBoxes(pg);

    function fit(){
      var pw = pg.offsetWidth, ph = pg.offsetHeight, s = wrap.clientWidth / pw;
      pg.style.transform = 'scale(' + s + ')';
      wrap.style.height = (ph * s) + 'px';
    }
    function html(){ return clean(pg.innerHTML); }
    function update(){
      saved = pg.innerHTML; pg.style.fontSize = size + 'pt';
      warn.style.display = (pg.scrollHeight > pg.clientHeight + 2) ? 'block' : 'none';
    }
    pg.addEventListener('input', update);
    pg.addEventListener('paste', function(e){
      e.preventDefault();
      var t = (e.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, t);
    });
    $('bkSz').onchange = function(){ size = +this.value; update(); };
    ['bkBold', 'bkPh', 'bkSg'].forEach(function(id){ $(id).addEventListener('mousedown', function(e){ e.preventDefault(); }); $(id).addEventListener('touchstart', function(e){ e.preventDefault(); $(id).click(); }, { passive:false }); });
    $('bkBold').onclick = function(){ pg.focus(); document.execCommand('bold'); update(); };
    $('bkCfg').onclick = function(){ cfgDialog(ov); };
    function addBox(k, l){
      pg.focus();
      document.execCommand('insertHTML', false, '<div class="ph" data-k="' + k + '" data-l="' + l + '" contenteditable="false"></div>&nbsp;');
      lockBoxes(pg); update();
    }
    $('bkPh').onclick = function(){ addBox('photo', 'Photo'); };
    $('bkSg').onclick = function(){ addBox('sign', 'Signature'); };
    window.addEventListener('resize', fit);
    fit(); update();
    function close(){ window.removeEventListener('resize', fit); ov.remove(); }
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
    'Where the page has a passport-size photo or picture area, output <div class="ph" data-k="photo"></div> at that position (inside <div class="r"> if it is on the right side). ' +
    'Where there is a handwritten signature or a signature box, output <div class="ph" data-k="sign"></div> at that position; if only a printed or written name is there, output the name as normal text. ' +
    'Use no other tags or attributes. Write [?] for a word you cannot read. Output only the HTML, with no explanation and no markdown fences.';

  function dlg(ov, inner){
    var d = ov.querySelector('.bk-dlg'); if(d) d.remove();
    d = document.createElement('div'); d.className = 'bk-dlg'; d.innerHTML = '<div class="bk-dbox">' + inner + '</div>';
    ov.appendChild(d); return d;
  }
  function cfgDialog(ov, after){
    var c = getCfg(), prov = c.prov || 'gemini';
    var d = dlg(ov,
      '<h3>Scan settings</h3>' +
      '<label>AI provider</label><select id="cgP"><option value="gemini">Google Gemini</option><option value="claude">Claude (Anthropic)</option></select>' +
      '<label>Your API key</label><input id="cgK" type="password" autocomplete="off" placeholder="Paste key here">' +
      '<label>Model</label><input id="cgM" type="text" autocapitalize="off" spellcheck="false">' +
      '<div class="hint">Reading handwriting needs an AI service. The photo is sent to the provider you choose, and any usage is billed to your own key. The key is saved only on this device. The photo itself is deleted from the phone right after it is sent.</div>' +
      '<div class="row"><button id="cgC">Cancel</button><button class="go" id="cgS">Save</button></div>');
    var P = d.querySelector('#cgP'), K = d.querySelector('#cgK'), M = d.querySelector('#cgM');
    var DEF = { gemini:'gemini-flash-latest', claude:'claude-sonnet-5-5' };
    P.value = prov; K.value = c.key || ''; M.value = c.model || DEF[prov];
    P.onchange = function(){ if(!M.value || M.value === DEF.gemini || M.value === DEF.claude) M.value = DEF[P.value]; };
    d.querySelector('#cgC').onclick = function(){ d.remove(); };
    d.querySelector('#cgS').onclick = function(){
      if(!K.value.trim()){ alert('Please paste your API key.'); return; }
      try{ localStorage.setItem(CFG_KEY, JSON.stringify({ prov:P.value, key:K.value.trim(), model:M.value.trim() || DEF[P.value] })); }catch(e){}
      d.remove(); if(after) after();
    };
  }
  function prepImage(file){
    return createImageBitmap(file).then(function(bmp){
      var s = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
      var c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      if(bmp.close) bmp.close();
      var b64 = c.toDataURL('image/jpeg', 0.85).split(',')[1];
      c.width = c.height = 0;
      return b64;
    });
  }
  function callAi(cfg, b64){
    if(cfg.prov === 'claude'){
      return fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'content-type':'application/json', 'x-api-key':cfg.key, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
        body:JSON.stringify({ model:cfg.model, max_tokens:4000, messages:[{ role:'user', content:[{ type:'image', source:{ type:'base64', media_type:'image/jpeg', data:b64 } }, { type:'text', text:PROMPT }] }] })
      }).then(function(r){ return r.json().then(function(j){ if(!r.ok) throw new Error((j.error && j.error.message) || ('Error ' + r.status)); return (j.content || []).map(function(p){ return p.text || ''; }).join(''); }); });
    }
    return fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(cfg.model) + ':generateContent', {
      method:'POST',
      headers:{ 'content-type':'application/json', 'x-goog-api-key':cfg.key },
      body:JSON.stringify({ contents:[{ parts:[{ text:PROMPT }, { inline_data:{ mime_type:'image/jpeg', data:b64 } }] }] })
    }).then(function(r){ return r.json().then(function(j){
      if(!r.ok) throw new Error((j.error && j.error.message) || ('Error ' + r.status));
      var p = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
      if(!p) throw new Error('No text came back. Try a clearer photo.');
      return p.map(function(x){ return x.text || ''; }).join('');
    }); });
  }
  function startScan(ov, ed, update){
    var cfg = getCfg();
    if(!cfg.key){ cfgDialog(ov, function(){ startScan(ov, ed, update); }); return; }
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.style.display = 'none';
    document.body.appendChild(inp);
    inp.addEventListener('cancel', function(){ inp.remove(); });
    inp.onchange = function(){
      var file = inp.files && inp.files[0]; if(!file){ inp.remove(); return; }
      var d = dlg(ov, '<h3>Reading page…</h3><div class="hint" style="margin:0">This takes a few seconds.</div>');
      function wipe(){ try{ inp.value = ''; }catch(e){} inp.remove(); file = null; }
      prepImage(file).then(function(b64){ wipe(); var p = callAi(cfg, b64); b64 = null; return p; }).then(function(txt){
        var h = clean(String(txt).replace(/```[a-z]*/gi, '').replace(/\s*\n\s*/g, ' ').trim());
        if(!h.trim()) throw new Error('Nothing was read. Try a clearer photo.');
        d.remove();
        if(ed.textContent.trim() && !confirm('Replace the current text with the scanned page?')) return;
        ed.innerHTML = h; lockBoxes(ed); update();
      }).catch(function(e){
        wipe();
        d = dlg(ov, '<h3>Scan failed</h3><div class="hint" style="margin:0;color:#ff7b7b">' + esc((e && e.message) || 'Could not read the photo.') + '</div><div class="row"><button id="cgC">Close</button><button class="go" id="cgS">Settings</button></div>');
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
