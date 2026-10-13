(function(){
  if(window.hsiaOpenForm) return;
  var BASE = ((document.currentScript && document.currentScript.src) || 'forms/forms.js').replace(/[^\/]*$/, '');
  var HDR = BASE + 'header.png';
  /* CSS is embedded here so the editor never depends on forms.css being loaded (it was not being applied) */
  var XF_CSS = ".xf-sheet{ box-sizing:border-box; background:#fff; color:#000; position:relative; overflow:hidden; -webkit-print-color-adjust:exact; print-color-adjust:exact;\n  font-family:\"Noto Sans Bengali\",\"Kalpurush\",\"SolaimanLipi\",\"Siyam Rupali\",\"Nirmala UI\",\"Vrinda\",\"FreeSans\",sans-serif; line-height:1.35; }\n.xf-sheet *{ box-sizing:border-box; }\n.xf-sheet img{ display:block; margin:0 auto; }\n.xf-fill{ flex:1 1 0; min-width:0; padding:0 1.2mm; min-height:1.45em; white-space:pre-wrap; overflow-wrap:anywhere; }\n.xf-cl .xf-fill{ border-bottom:1.3px dotted #000; }\n.xf-ex .xf-fill.xf-empty{ border-bottom:1px dotted #888; }\n.xf-b{ font-weight:700; }\n/* ---- CL form: A4 portrait ---- */\n.xf-cl{ width:210mm; height:297mm; padding:8mm 19mm 6mm 19mm; font-size:11pt; }\n.xf-cl .xf-hdr img{ width:70mm; height:auto; }\n.xf-cl .xf-office{ display:flex; justify-content:center; align-items:flex-end; gap:1.5mm; margin-top:0.5mm; font-weight:700; }\n.xf-cl .xf-office .xf-fill{ flex:0 0 105mm; }\n.xf-cl .xf-title{ text-align:center; font-weight:700; font-size:15.5pt; margin:4.5mm 0 8mm; }\n.xf-cl .xf-title span{ border-bottom:1.5px solid #000; padding-bottom:0.3mm; }\n.xf-cl .xf-li{ display:flex; align-items:flex-end; margin-bottom:5.6mm; }\n.xf-cl .xf-li .n{ width:8mm; flex:none; font-weight:700; }\n.xf-cl .xf-li .l{ flex:none; font-weight:700; }\n.xf-cl .xf-sigbox{ margin:7mm 0 0 auto; width:38%; }\n.xf-cl .xf-sigbox .xf-dots{ border-top:1.3px dotted #000; margin-top:13mm; margin-bottom:1mm; }\n.xf-cl .xf-sigbox .xf-sl{ display:flex; align-items:flex-end; font-weight:700; margin-top:0.8mm; }\n.xf-cl .xf-sigbox .xf-sl .xf-fill{ border-bottom:0; }\n.xf-cl .xf-row{ display:flex; align-items:flex-end; margin-top:5.2mm; }\n.xf-cl .xf-row .t{ flex:none; font-weight:700; white-space:nowrap; }\n.xf-cl .xf-ind1{ margin-left:11mm; }\n.xf-cl .xf-ind2{ margin-left:40%; }\n.xf-cl .xf-hr{ border-top:1.4px solid #000; margin-top:8mm; padding-top:1mm; }\n.xf-cl .xf-note{ font-size:10pt; line-height:1.5; }\n.xf-cl .xf-note p{ margin:0 0 0.4mm 0; }\n.xf-cl .xf-note .sub{ margin-left:9mm; text-indent:-8mm; padding-left:8mm; margin-top:0.6mm; }\n/* ---- Exchange form: A4 width x half A4 height ---- */\n.xf-ex{ width:210mm; height:148.5mm; padding:4mm 12mm 3mm 12mm; font-size:10pt; }\n.xf-ex .xf-hdr img{ width:66mm; height:auto; }\n.xf-ex .xf-addr{ text-align:center; font-weight:700; font-size:8.6pt; margin-top:0.6mm; }\n.xf-ex .xf-addr2{ text-align:center; font-weight:700; font-size:9pt; }\n.xf-ex .xf-boxt{ text-align:center; margin:1.6mm 0 2.2mm; }\n.xf-ex .xf-boxt span{ display:inline-block; border:1.3px solid #000; padding:0.4mm 3.5mm; font-weight:700; font-size:11pt; }\n.xf-ex .xf-r{ display:flex; align-items:flex-end; min-height:7.4mm; }\n.xf-ex .xf-r.sg{ min-height:12mm; }\n.xf-ex .xf-r .n{ width:8mm; flex:none; }\n.xf-ex .xf-r .l{ width:55mm; flex:none; }\n.xf-ex .xf-r .c{ width:5mm; flex:none; }\n.xf-ex .xf-r .m{ flex:1 1 0; min-width:0; display:flex; align-items:flex-end; gap:1.5mm; }\n.xf-ex .xf-r .t{ flex:none; white-space:nowrap; }\n.xf-ex .xf-r .gap{ flex:0 0 5mm; }\n.xf-ex .xf-r .w2{ flex:1.25 1 0; }\n.xf-ex .xf-r .w1{ flex:1 1 0; }\n.xf-ex .xf-r .sgn{ flex:1 1 0; white-space:nowrap; padding-left:1.2mm; }\n/* ---- edit screen ---- */\n.xf-ov{ position:fixed; inset:0; z-index:20000; background:#141416; color:#ececf0; display:flex; flex-direction:column; font-family:inherit; }\n.xf-ov[hidden]{ display:none; }\n.xf-top{ display:flex; align-items:center; gap:8px; padding:calc(8px + env(safe-area-inset-top,0px)) 10px 8px; border-bottom:1px solid #34343a; background:#1b1b1f; }\n.xf-top .xf-tt{ flex:1 1 auto; min-width:0; font-size:14px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }\n.xf-top button{ white-space:nowrap; height:38px; min-width:38px; padding:0 12px; border-radius:10px; border:1px solid #3b3b42; background:#26262b; color:#ececf0; font-size:14px; cursor:pointer; font-family:inherit; }\n.xf-top button.ico{ display:inline-flex; align-items:center; justify-content:center; padding:0 10px; }\n.xf-top button.ico[disabled]{ opacity:.5; }\n.xf-top button.pri{ background:#e8c35a; color:#1a1405; border-color:#e8c35a; font-weight:700; }\n.xf-body{ flex:1 1 auto; overflow:auto; -webkit-overflow-scrolling:touch; padding:12px 12px calc(24px + env(safe-area-inset-bottom,0px)); }\n.xf-grp{ border:1px solid #34343a; border-radius:12px; padding:10px 10px 4px; margin-bottom:10px; background:#1a1a1e; }\n.xf-grp h4{ margin:0 0 8px; font-size:12.5px; color:#a9a9b3; letter-spacing:.3px; font-weight:600; }\n.xf-fld{ margin-bottom:9px; }\n.xf-fld label{ display:block; font-size:12px; color:#b5b5bf; margin-bottom:3px; }\n.xf-fld input, .xf-fld textarea{ box-sizing:border-box; width:100%; border:1px solid #3b3b42; background:#101012; color:#f2f2f5; border-radius:9px; padding:9px 10px; font-size:15px; font-family:inherit; outline:none; }\n.xf-fld input:focus, .xf-fld textarea:focus{ border-color:#22d3ee; }\n.xf-fld textarea{ min-height:62px; resize:vertical; }\n.xf-pvl{ font-size:12px; color:#a9a9b3; margin:14px 2px 6px; }\n.xf-pv{ background:#2a2a2e; border-radius:10px; overflow:hidden; position:relative; }\n.xf-pvin{ transform-origin:0 0; position:absolute; left:0; top:0; }\n.xf-pvin .xf-sheet{ box-shadow:none; }\n#xfPrint{ display:none; }\n@media print{\n  html, body.xf-printing{ background:#fff !important; height:auto !important; min-height:0 !important; overflow:visible !important; margin:0 !important; padding:0 !important; position:static !important; }\n  body.xf-printing > *:not(#xfPrint){ display:none !important; }\n  body.xf-printing #xfPrint{ display:block !important; }\n  #xfPrint .xf-sheet{ margin:0; page-break-inside:avoid; break-inside:avoid; }\n}\n";
  function injectCss(){
    if(document.getElementById('xfStyle')) return;
    var st = document.createElement('style'); st.id = 'xfStyle'; st.textContent = XF_CSS; document.head.appendChild(st);
  }

  function esc(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function fill(V, k, extra){ var t = V && V[k] ? String(V[k]) : ''; return '<span class="xf-fill ' + (extra || '') + (t ? '' : ' xf-empty') + '">' + (t ? esc(t) : '&nbsp;') + '</span>'; }

  /* ---------- CL form (A4 portrait) ---------- */
  function clHtml(V){
    var li = function(n, label, k){ return '<div class="xf-li"><span class="n">' + n + '</span><span class="l">' + label + '</span>' + fill(V, k) + '</div>'; };
    return '<div class="xf-sheet xf-cl">'
      + '<div class="xf-hdr"><img alt="" src="' + HDR + '"></div>'
      + '<div class="xf-office"><span>অফিস</span>' + fill(V, 'office') + '</div>'
      + '<div class="xf-title"><span>নৈমিত্তিক ছুটির দরখাস্ত ফরম</span></div>'
      + li('১।', 'দরখাস্তকারী কর্মকর্তা/কর্মচারীর নাম ও পদবী', 'name')
      + li('২।', 'মোট জমাকৃত ছুটির পরিমান', 'total')
      + li('৩।', 'প্রার্থিত ছুটির সময় কাল ও পরিমান', 'period')
      + li('৪।', 'ছুটির কারণ', 'reason')
      + li('৫।', 'প্রার্থীর ছুটি সময়কালীন ঠিকানা', 'addr')
      + '<div class="xf-sigbox"><div class="xf-dots"></div><div class="xf-b">দরখাস্তকারীর স্বাক্ষর</div><div class="xf-sl"><span>তারিখ :-</span>' + fill(V, 'adate') + '</div></div>'
      + '<div class="xf-row xf-ind1"><span class="t">ঊর্ধ্বতন কর্তৃপক্ষের সুপারিশ</span>' + fill(V, 'rec1') + '</div>'
      + '<div class="xf-row xf-ind2">' + fill(V, 'rec2') + '</div>'
      + '<div class="xf-row xf-ind2"><span class="t">স্বাক্ষর</span><span class="xf-fill"></span><span class="t">পদবী</span>' + fill(V, 'rpost') + '</div>'
      + '<div class="xf-row xf-ind2"><span class="t">তারিখ</span>' + fill(V, 'rdate') + '</div>'
      + '<div class="xf-row" style="margin-top:7mm"><span class="t">ছুটি মঞ্জুরকারী কর্মকর্তার মন্তব্য</span>' + fill(V, 'com1') + '</div>'
      + '<div class="xf-row">' + fill(V, 'com2') + '</div>'
      + '<div class="xf-row xf-ind2"><span class="t">স্বাক্ষর</span><span class="xf-fill"></span><span class="t">তারিখ</span>' + fill(V, 'cdate') + '</div>'
      + '<div class="xf-hr"><div class="xf-note">'
      + '<p class="xf-b">ছুটির ধরন :-</p><p class="xf-b">নৈমিত্তিক ছুটি :- ২০ (বিশ) দিন।</p>'
      + '<p class="sub">(ক) কোন কর্মচারীকে একযোগে (১০) দিনের অধিক নৈমিত্তিক ছুটি প্রদান করা যাইবে না।</p>'
      + '<p class="sub">(খ) সর্বোচ্চ ৩ দিনের নৈমিত্তিক ছুটি যে কোন শুক্রবার বা সাধারণ ছুটির পূর্বে বা পরে সংযুক্ত করার অনুমতি প্রদান করা যাইতে পারে কিন্তু দুইটি (হলিডে) মধ্যবর্তী কোন কাজের দিনে এই ছুটি প্রদান করিয়া সংশ্লিষ্ট দুইটি ছুটির সহিত সংযুক্ত করিবার অনুমতি দেওয়া যাইবে না।</p>'
      + '</div></div></div>';
  }

  /* ---------- Exchange form (A4 width x half A4 height) ---------- */
  function exHtml(V){
    var r = function(n, label, inner, cls){ return '<div class="xf-r ' + (cls || '') + '"><span class="n">' + n + '</span><span class="l">' + label + '</span><span class="c">' + (label ? ':' : '') + '</span><div class="m">' + inner + '</div></div>'; };
    var T = function(t){ return '<span class="t">' + t + '</span>'; };
    return '<div class="xf-sheet xf-ex">'
      + '<div class="xf-hdr"><img alt="" src="' + HDR + '"></div>'
      + '<div class="xf-addr">হযরত শাহজালাল আন্তর্জাতিক বিমান বন্দর কুর্মিটোলা, ঢাকা-১২২৯</div>'
      + '<div class="xf-addr2">এটিএস শাখা</div>'
      + '<div class="xf-boxt"><span>কর্তব্য পরিবর্তন ফরম</span></div>'
      + r('১।', 'আবেদনকারীর নাম / পদবী', fill(V, 'name'))
      + r('', 'ঠিকানা', fill(V, 'addr'))
      + r('২।', 'বিনিময়ে কর্তব্য কাজ', T('তারিখ:') + fill(V, 'd1', 'w2') + '<span class="gap"></span>' + T('সময়:') + fill(V, 't1', 'w1'))
      + r('', '', T('কর্তব্যস্থল:') + fill(V, 'p1'))
      + r('৩।', 'বিনিময়ে কখন কর্তব্য করিবেন', T('তারিখ:') + fill(V, 'd2', 'w2') + '<span class="gap"></span>' + T('সময়:') + fill(V, 't2', 'w1'))
      + r('', '', T('কর্তব্যস্থল:') + fill(V, 'p2', 'w2') + '<span class="gap"></span><span class="sgn w1">আবেদনকারীর স্বাক্ষর</span>', 'sg')
      + r('৪।', 'যিনি বিনিময় করিতে সম্মত', T('নাম/পদবী:') + fill(V, 'pname'))
      + r('', '', T('ঠিকানা:') + fill(V, 'paddr', 'w2') + '<span class="gap"></span><span class="sgn w1">স্বাক্ষর ও তারিখ' + (V && V.pdate ? ': ' + esc(V.pdate) : '') + '</span>', 'sg')
      + r('৫।', 'নিয়ন্ত্রক কর্মকর্তার মন্তব্য', fill(V, 'remark'))
      + '<div class="xf-r sg"><span class="n"></span><span class="l"></span><span class="c"></span><div class="m"><span class="w2"></span><span class="gap"></span><span class="sgn w1">স্বাক্ষর ও তারিখ</span></div></div>'
      + '</div>';
  }

  var FORMS = {
    cl: { title:'CL Form — নৈমিত্তিক ছুটির দরখাস্ত', page:'210mm 297mm', w:210, h:297, png:'CL-Form.png', defaults:{ office:"নির্বাহী পরিচালকের দপ্তর,হশা়আবি,ATM শাখা" }, html:clHtml, groups:[
      { t:'দরখাস্তকারী', f:[['office','অফিস'],['name','১। নাম ও পদবী'],['total','২। মোট জমাকৃত ছুটির পরিমান'],['period','৩। প্রার্থিত ছুটির সময় কাল ও পরিমান'],['reason','৪। ছুটির কারণ'],['addr','৫। ছুটি সময়কালীন ঠিকানা'],['adate','তারিখ']] },
      { t:'ঊর্ধ্বতন কর্তৃপক্ষ', f:[['rec1','সুপারিশ (১ম লাইন)'],['rec2','সুপারিশ (২য় লাইন)'],['rpost','পদবী'],['rdate','তারিখ']] },
      { t:'ছুটি মঞ্জুরকারী কর্মকর্তা', f:[['com1','মন্তব্য (১ম লাইন)'],['com2','মন্তব্য (২য় লাইন)'],['cdate','তারিখ']] } ] },
    ex: { title:'Exchange Form — কর্তব্য পরিবর্তন ফরম', page:'210mm 297mm', w:210, h:148.5, png:'Exchange-Form.png', defaults:{}, html:exHtml, groups:[
      { t:'১। আবেদনকারী', f:[['name','নাম / পদবী'],['addr','ঠিকানা']] },
      { t:'২। বিনিময়ে কর্তব্য কাজ', f:[['d1','তারিখ'],['t1','সময়'],['p1','কর্তব্যস্থল']] },
      { t:'৩। বিনিময়ে কখন কর্তব্য করিবেন', f:[['d2','তারিখ'],['t2','সময়'],['p2','কর্তব্যস্থল']] },
      { t:'৪। যিনি বিনিময় করিতে সম্মত', f:[['pname','নাম / পদবী'],['paddr','ঠিকানা'],['pdate','স্বাক্ষরের তারিখ (ঐচ্ছিক)']] },
      { t:'৫। নিয়ন্ত্রক কর্মকর্তা', f:[['remark','মন্তব্য','area']] } ] }
  };
  window.hsiaFormHtml = function(key, V){ return FORMS[key].html(V || {}); };
  window.hsiaFormMeta = FORMS;

  var ov = null, cur = null, vals = {}, pageStyle = null, printRoot = null;
  function key(k){ return 'hsia_form_' + k; }
  function load(k){ var v = {}; try{ v = JSON.parse(localStorage.getItem(key(k)) || '{}') || {}; }catch(e){ v = {}; } return withDefaults(k, v); }
  function withDefaults(k, v){ var d = FORMS[k].defaults || {}; for(var n in d){ if(!v[n]) v[n] = d[n]; } return v; }
  function save(){ try{ localStorage.setItem(key(cur), JSON.stringify(vals)); }catch(e){} }
  function build(){
    injectCss();
    ov = document.createElement('div'); ov.className = 'xf-ov'; ov.hidden = true;
    ov.innerHTML = '<div class="xf-top"><button type="button" data-x="close" aria-label="Close">✕</button><div class="xf-tt"></div><button type="button" data-x="reset" title="সব মুছুন">↺</button><button type="button" class="ico" data-x="png" aria-label="PNG ডাউনলোড" title="PNG ডাউনলোড (A4)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/></svg></button><button type="button" class="pri" data-x="print">🖨️ প্রিন্ট</button></div>'
      + '<div class="xf-body"><div class="xf-fields"></div><div class="xf-pvl" style="height:6px;margin:0"></div><div class="xf-pv"><div class="xf-pvin"></div></div></div>';
    document.body.appendChild(ov);
    pageStyle = document.createElement('style'); pageStyle.id = 'xfPageStyle'; document.head.appendChild(pageStyle);
    printRoot = document.createElement('div'); printRoot.id = 'xfPrint'; document.body.appendChild(printRoot);
    ov.addEventListener('click', function(e){
      var b = e.target.closest && e.target.closest('[data-x]'); if(!b) return; var a = b.getAttribute('data-x');
      if(a === 'close') close(); else if(a === 'print') doPrint(); else if(a === 'png') doPng(b); else if(a === 'reset'){ if(confirm('এই ফর্মের সব লেখা মুছে ফেলবেন?')){ vals = withDefaults(cur, {}); save(); fields(); preview(); } }
    });
    ov.addEventListener('input', function(e){ var t = e.target; if(t && t.getAttribute && t.getAttribute('data-k')){ vals[t.getAttribute('data-k')] = t.value; save(); preview(); } });
    window.addEventListener('resize', function(){ if(ov && !ov.hidden) preview(); });
  }
  function fields(){
    var f = FORMS[cur], box = ov.querySelector('.xf-fields'), h = '';
    f.groups.forEach(function(g){
      h += '<div class="xf-grp"><h4>' + esc(g.t) + '</h4>';
      g.f.forEach(function(x){
        var id = 'xf_' + x[0];
        h += '<div class="xf-fld"><label for="' + id + '">' + esc(x[1]) + '</label>'
          + (x[2] === 'area' ? '<textarea id="' + id + '" data-k="' + x[0] + '">' + esc(vals[x[0]] || '') + '</textarea>'
                             : '<input id="' + id + '" type="text" data-k="' + x[0] + '" value="' + esc(vals[x[0]] || '') + '" autocomplete="off">') + '</div>';
      });
      h += '</div>';
    });
    box.innerHTML = h;
  }
  function preview(){
    var f = FORMS[cur], pv = ov.querySelector('.xf-pv'), inn = ov.querySelector('.xf-pvin');
    var pxw = f.w * 96 / 25.4, pxh = f.h * 96 / 25.4, s = Math.min(1, (pv.clientWidth || 340) / pxw);
    inn.innerHTML = f.html(vals); inn.style.width = pxw + 'px'; inn.style.height = pxh + 'px'; inn.style.transform = 'scale(' + s + ')';
    pv.style.height = Math.ceil(pxh * s) + 'px';
  }
  function open(k){
    if(!FORMS[k]) return; if(!ov) build();
    cur = k; vals = load(k); ov.querySelector('.xf-tt').textContent = FORMS[k].title;
    ov.hidden = false; document.documentElement.style.overscrollBehavior = 'none';
    fields(); preview(); ov.querySelector('.xf-body').scrollTop = 0;
    setTimeout(preview, 80);
  }
  function close(){ if(ov) ov.hidden = true; }
  function doPrint(){
    var f = FORMS[cur];
    printRoot.innerHTML = f.html(vals);
    pageStyle.textContent = '@page{ size:' + f.page + '; margin:0; }';
    document.body.classList.add('xf-printing');
    var done = function(){ document.body.classList.remove('xf-printing'); pageStyle.textContent = ''; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    var imgs = Array.prototype.slice.call(printRoot.querySelectorAll('img')), go = function(){ setTimeout(function(){ try{ window.print(); }catch(e){ done(); alert('এই ব্রাউজার থেকে প্রিন্ট চালু করা যায়নি।'); } }, 150); };
    Promise.race([ Promise.all(imgs.map(function(im){ return im.complete ? 0 : new Promise(function(r){ im.onload = im.onerror = r; }); })), new Promise(function(r){ setTimeout(r, 2500); }) ]).then(go);
  }

  /* ---------- PNG export: A4 page, as sharp as the device allows (600 dpi, falls back to lower if the phone runs out of memory) ---------- */
  var hdrData = null;
  function toDataUrl(url){
    return fetch(url).then(function(r){ if(!r.ok) throw new Error('img'); return r.blob(); }).then(function(b){
      return new Promise(function(res, rej){ var fr = new FileReader(); fr.onload = function(){ res(fr.result); }; fr.onerror = rej; fr.readAsDataURL(b); });
    });
  }
  function crcTable(){ var t = [], c, n, k; for(n = 0; n < 256; n++){ c = n; for(k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; }
  function setDpi(buf, dpi){   // write a pHYs chunk so viewers/printers know it is A4 at this dpi
    try{
      var src = new Uint8Array(buf), ppm = Math.round(dpi / 0.0254), chunk = new Uint8Array(21), dv = new DataView(chunk.buffer), T = crcTable();
      dv.setUint32(0, 9); chunk.set([0x70, 0x48, 0x59, 0x73], 4); dv.setUint32(8, ppm); dv.setUint32(12, ppm); chunk[16] = 1;
      var c = 0xFFFFFFFF; for(var i = 4; i < 17; i++) c = T[(c ^ chunk[i]) & 255] ^ (c >>> 8); dv.setUint32(17, (c ^ 0xFFFFFFFF) >>> 0);
      var out = new Uint8Array(src.length + 21); out.set(src.subarray(0, 33), 0); out.set(chunk, 33); out.set(src.subarray(33), 54);
      return out;
    }catch(e){ return new Uint8Array(buf); }
  }
  function sheetSvg(f, pw, ph){
    var box = document.createElement('div'); box.innerHTML = f.html(vals);
    var im = box.querySelector('img'); if(im && hdrData) im.setAttribute('src', hdrData);
    var markup = new XMLSerializer().serializeToString(box.firstChild);
    var css = XF_CSS.split('/* ---- edit screen ---- */')[0].replace(/&/g, '&amp;').replace(/</g, '&lt;');
    var sw = f.w * 96 / 25.4, sh = f.h * 96 / 25.4;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + pw + '" height="' + ph + '" viewBox="0 0 ' + pw + ' ' + ph + '">'
      + '<foreignObject x="0" y="0" width="' + sw + '" height="' + sh + '"><div xmlns="http://www.w3.org/1999/xhtml" style="width:' + sw + 'px;height:' + sh + 'px;background:#fff"><style>' + css + '</style>' + markup + '</div></foreignObject></svg>';
  }
  function renderPng(f){
    var pw = 210 * 96 / 25.4, ph = 297 * 96 / 25.4;
    var p = hdrData ? Promise.resolve() : toDataUrl(HDR).then(function(d){ hdrData = d; });
    return p.then(function(){ return (document.fonts && document.fonts.ready) || 0; }).then(function(){
      var img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sheetSvg(f, pw, ph));
      return (img.decode ? img.decode() : new Promise(function(r, j){ img.onload = r; img.onerror = j; })).then(function(){ return img; });
    }).then(function(img){
      var tiers = [600, 450, 300, 200], i = 0;
      function attempt(){
        if(i >= tiers.length) return Promise.reject(new Error('canvas'));
        var dpi = tiers[i++], W = Math.round(210 / 25.4 * dpi), H = Math.round(297 / 25.4 * dpi);
        var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        var cx = cv.getContext('2d'); if(!cx) return attempt();
        try{
          cx.fillStyle = '#fff'; cx.fillRect(0, 0, W, H); cx.drawImage(img, 0, 0, W, H);
          if(cx.getImageData(0, 0, 1, 1).data[3] !== 255) { cv.width = cv.height = 1; return attempt(); }
        }catch(e){ cv.width = cv.height = 1; return attempt(); }
        return new Promise(function(res){ cv.toBlob(res, 'image/png'); }).then(function(b){
          cv.width = cv.height = 1;
          if(!b || !b.size) return attempt();
          return b.arrayBuffer().then(function(buf){ return new Blob([setDpi(buf, dpi)], { type:'image/png' }); });
        });
      }
      return attempt();
    });
  }
  function doPng(btn){
    if(btn.disabled) return;
    var f = FORMS[cur], old = btn.innerHTML;
    btn.disabled = true; btn.textContent = '⏳';
    renderPng(f).then(function(blob){
      var a = document.createElement('a'), u = URL.createObjectURL(blob);
      a.href = u; a.download = f.png; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(u); }, 15000);
    }).catch(function(){ alert('PNG বানানো যায়নি। আবার চেষ্টা করুন, অথবা প্রিন্ট থেকে “Save as PDF” ব্যবহার করুন।'); })
    .then(function(){ btn.disabled = false; btn.innerHTML = old; });
  }
  window.hsiaOpenForm = open;
})();
