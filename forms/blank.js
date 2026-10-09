/* Blank Page editor: A4 preview on top, one text box below. Print / PDF / PNG at 300 dpi. */
(function(){
  if(window.hsiaOpenBlank) return;
  var MARGIN = '15mm', FONT = '12pt', DPI = 300;
  var FAMILY = "'Noto Sans Bengali','Hind Siliguri',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
  var saved = '';

  var css = document.createElement('style');
  css.textContent =
    '#blkOv{position:fixed;inset:0;z-index:100000;background:#0b0b0d;color:#eee;display:flex;flex-direction:column;font-family:' + FAMILY + ';}' +
    '#blkOv .bk-top{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #222;flex:0 0 auto;}' +
    '#blkOv .bk-t{flex:1;font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '#blkOv .bk-b{min-width:42px;height:42px;border:1px solid #3a3a40;background:#18181d;color:#eee;border-radius:10px;font-size:18px;font-family:inherit;cursor:pointer;}' +
    '#blkOv .bk-p{padding:0 14px;background:#f6c84c;color:#222;border:0;font-size:15px;font-weight:600;}' +
    '#blkOv .bk-body{flex:1 1 auto;overflow:auto;padding:12px;-webkit-overflow-scrolling:touch;}' +
    '#blkOv .bk-l{font-size:13px;color:#9a9aa3;margin:0 0 6px;}' +
    '#blkOv .bk-wrap{position:relative;width:100%;max-width:640px;margin:0 auto 14px;background:#fff;border-radius:3px;overflow:hidden;}' +
    '#blkOv .bk-pg{position:absolute;left:0;top:0;transform-origin:0 0;width:210mm;height:297mm;box-sizing:border-box;padding:' + MARGIN + ';background:#fff;color:#000;font-size:' + FONT + ';line-height:1.5;white-space:pre-wrap;word-wrap:break-word;overflow:hidden;font-family:' + FAMILY + ';}' +
    '#blkOv .bk-box{max-width:640px;margin:0 auto;background:#18181d;border:1px solid #2c2c32;border-radius:12px;padding:10px;}' +
    '#blkOv textarea{width:100%;box-sizing:border-box;min-height:140px;background:#0f0f12;color:#eee;border:1px solid #3a3a40;border-radius:10px;padding:10px;font-size:16px;font-family:inherit;resize:vertical;}' +
    '#blkOv .bk-w{max-width:640px;margin:6px auto 0;font-size:12px;color:#ff6b6b;display:none;}' +
    '#blkOv .bk-m{position:absolute;right:12px;top:60px;background:#18181d;border:1px solid #3a3a40;border-radius:10px;padding:6px;display:none;z-index:2;}' +
    '#blkOv .bk-m button{display:block;width:100%;min-width:130px;margin:0;padding:11px 12px;background:none;border:0;color:#eee;font-size:15px;text-align:left;font-family:inherit;cursor:pointer;}';
  document.head.appendChild(css);

  function esc(t){ return String(t).replace(/[&<>]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c]; }); }
  function pageStyle(){
    return 'width:210mm;height:297mm;box-sizing:border-box;padding:' + MARGIN + ';background:#fff;color:#000;font-size:' + FONT +
      ';line-height:1.5;white-space:pre-wrap;word-wrap:break-word;overflow:hidden;font-family:' + FAMILY + ';';
  }

  function open(){
    if(document.getElementById('blkOv')) return;
    var ov = document.createElement('div'); ov.id = 'blkOv';
    ov.innerHTML =
      '<div class="bk-top"><button class="bk-b" id="bkX" aria-label="Close">✕</button><div class="bk-t">Blank Page</div>' +
      '<button class="bk-b" id="bkD" aria-label="Download">⬇</button><button class="bk-b bk-p" id="bkP">🖨️ প্রিন্ট</button></div>' +
      '<div class="bk-m" id="bkM"><button data-f="pdf">PDF (A4)</button><button data-f="png">PNG (A4)</button></div>' +
      '<div class="bk-body"><div class="bk-l">Preview</div><div class="bk-wrap" id="bkW"><div class="bk-pg" id="bkPg"></div></div>' +
      '<div class="bk-box"><div class="bk-l">Write / Type here</div><textarea id="bkT" placeholder="Type here…"></textarea></div>' +
      '<div class="bk-w" id="bkWarn">Text is longer than one A4 page. The extra part will be cut off.</div></div>';
    document.body.appendChild(ov);
    var $ = function(id){ return document.getElementById(id); };
    var wrap = $('bkW'), pg = $('bkPg'), ta = $('bkT'), warn = $('bkWarn'), menu = $('bkM');
    ta.value = saved;

    function fit(){
      var pw = pg.offsetWidth, ph = pg.offsetHeight, s = wrap.clientWidth / pw;
      pg.style.transform = 'scale(' + s + ')';
      wrap.style.height = (ph * s) + 'px';
    }
    function update(){
      saved = ta.value; pg.textContent = ta.value;
      warn.style.display = (pg.scrollHeight > pg.clientHeight + 2) ? 'block' : 'none';
    }
    ta.addEventListener('input', update);
    window.addEventListener('resize', fit);
    fit(); update();
    function close(){ window.removeEventListener('resize', fit); ov.remove(); }
    $('bkX').onclick = close;

    $('bkP').onclick = function(){
      var f = document.createElement('iframe');
      f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
      document.body.appendChild(f);
      var d = f.contentWindow.document; d.open();
      d.write('<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff}.p{' + pageStyle() + '}</style></head><body><div class="p">' + esc(ta.value) + '</div></body></html>');
      d.close();
      setTimeout(function(){ try{ f.contentWindow.focus(); f.contentWindow.print(); }catch(e){} setTimeout(function(){ f.remove(); }, 60000); }, 350);
    };

    $('bkD').onclick = function(e){ e.stopPropagation(); menu.style.display = menu.style.display === 'block' ? 'none' : 'block'; };
    ov.addEventListener('click', function(e){ if(!e.target.closest('#bkM') && e.target.id !== 'bkD') menu.style.display = 'none'; });
    menu.addEventListener('click', function(e){
      var b = e.target.closest('button'); if(!b) return;
      menu.style.display = 'none';
      render(ta.value, function(canvas){ b.getAttribute('data-f') === 'png' ? savePng(canvas) : savePdf(canvas); });
    });
  }

  /* Same layout engine as the preview: HTML -> SVG foreignObject -> 300 dpi canvas */
  function render(text, cb){
    var W = Math.round(210 / 25.4 * DPI), H = Math.round(297 / 25.4 * DPI);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 793.7 1122.52">' +
      '<foreignObject width="793.7" height="1122.52"><div xmlns="http://www.w3.org/1999/xhtml" style="' + pageStyle() + '">' + esc(text) + '</div></foreignObject></svg>';
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
