(function(){
  if(window.hsiaOpenForm) return;
  var BASE = ((document.currentScript && document.currentScript.src) || 'forms/forms.js').replace(/[^\/]*$/, '');
  var HDR = BASE + 'header.png';
  var VER = 'smj1';
  /* ---- SutonnyMJ (Bijoy): the font + the Unicode->Bijoy converter live in blank.js; the typed text stays Unicode, it is converted when the sheet is drawn ---- */
  var smj = null, smjLoading = null, smjFail = false;
  function injectSmjFace(){
    if(!smj || document.getElementById('xfSmjFace')) return;
    var st = document.createElement('style'); st.id = 'xfSmjFace'; st.textContent = smj.faceCss; document.head.appendChild(st);
  }
  function ensureSmj(){
    if(!smj && window.hsiaSMJ) smj = window.hsiaSMJ;
    if(smj){ injectSmjFace(); return Promise.resolve(true); }
    if(smjFail) return Promise.resolve(false);
    if(!smjLoading) smjLoading = new Promise(function(res){
      var s = document.createElement('script'); s.src = BASE + 'blank.js?v=' + VER;
      s.onload = function(){ smj = window.hsiaSMJ || null; if(!smj) smjFail = true; res(!!smj); };
      s.onerror = function(){ smjFail = true; s.remove(); res(false); };
      document.head.appendChild(s);
    });
    return smjLoading.then(function(ok){ if(ok) injectSmjFace(); return ok; });
  }
  function smjFonts(){
    if(!smj || !document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.race([ Promise.all([ document.fonts.load('12pt SutonnyMJ', 'Avwg'), document.fonts.load('12pt SutonnyMJ', '(: )') ]), new Promise(function(r){ setTimeout(r, 2500); }) ]).catch(function(){});
  }
  function toSmj(h){
    if(!smj) return h;
    var d = new DOMParser().parseFromString('<body>' + h + '</body>', 'text/html');
    /* SutonnyMJ draws Latin letters as Bangla letters, so English words are kept out of it (own font); NBSP is "ড়" in Bijoy, so it is dropped */
    function conv(t){ return smj.toBijoy(t.replace(/([^\u09a1\u09a2\u09af])\u09bc/g, '$1')); }
    (function walk(n){
      Array.prototype.slice.call(n.childNodes).forEach(function(k){
        if(k.nodeType === 1){ walk(k); return; }
        if(k.nodeType !== 3) return;
        var v = k.nodeValue.replace(/\u00a0/g, ' ');
        if(!v.trim()){ k.nodeValue = ''; return; }
        var parts = v.split(/([A-Za-z][A-Za-z0-9.&'\-]*)/), fr = d.createDocumentFragment();
        parts.forEach(function(p, i){
          if(!p) return;
          if(i % 2){ var sp = d.createElement('span'); sp.className = 'xf-en'; sp.textContent = p; fr.appendChild(sp); }
          else fr.appendChild(d.createTextNode(/[\u0980-\u09FF]/.test(p) ? conv(p) : p));
        });
        k.parentNode.replaceChild(fr, k);
      });
    })(d.body);
    var sh = d.body.querySelector('.xf-sheet'); if(sh) sh.className += ' xf-smj';
    return d.body.innerHTML;
  }
  function sheetHtml(f, V){ var h = f.html(V); return smj ? toSmj(h) : h; }
  /* CSS is embedded here so the editor never depends on forms.css being loaded (it was not being applied) */
  var XF_CSS = ".xf-sheet{ box-sizing:border-box; background:#fff; color:#000; position:relative; overflow:hidden; -webkit-print-color-adjust:exact; print-color-adjust:exact;\n  font-family:\"Noto Sans Bengali\",\"Kalpurush\",\"SolaimanLipi\",\"Siyam Rupali\",\"Nirmala UI\",\"Vrinda\",\"FreeSans\",sans-serif; line-height:1.35; }\n.xf-sheet *{ box-sizing:border-box; }\n.xf-sheet img{ display:block; margin:0 auto; }\n.xf-fill{ flex:1 1 0; min-width:0; padding:0 1.2mm; min-height:1.45em; white-space:pre-wrap; overflow-wrap:anywhere; }\n.xf-cl .xf-fill{ border-bottom:1.3px dotted #000; }\n.xf-ex .xf-fill.xf-empty{ border-bottom:1px dotted #888; }\n.xf-b{ font-weight:700; }\n/* ---- CL form: A4 portrait ---- */\n.xf-cl{ width:210mm; height:297mm; padding:8mm 19mm 6mm 19mm; font-size:11pt; }\n.xf-cl .xf-hdr img{ width:70mm; height:auto; }\n.xf-cl .xf-office{ display:flex; justify-content:center; align-items:flex-end; gap:1.5mm; margin-top:0.5mm; font-weight:700; }\n.xf-cl .xf-office .xf-fill{ flex:0 0 105mm; }\n.xf-cl .xf-title{ text-align:center; font-weight:700; font-size:15.5pt; margin:4.5mm 0 8mm; }\n.xf-cl .xf-title span{ border-bottom:1.5px solid #000; padding-bottom:0.3mm; }\n.xf-cl .xf-li{ display:flex; align-items:flex-end; margin-bottom:5.6mm; }\n.xf-cl .xf-li .n{ width:8mm; flex:none; font-weight:700; }\n.xf-cl .xf-li .l{ flex:none; font-weight:700; }\n.xf-cl .xf-sigbox{ margin:7mm 0 0 auto; width:38%; }\n.xf-cl .xf-sigbox .xf-dots{ border-top:1.3px dotted #000; margin-top:0; margin-bottom:1mm; }\n.xf-cl .xf-sigbox .xf-sl{ display:flex; align-items:flex-end; font-weight:700; margin-top:0.8mm; }\n.xf-cl .xf-sigbox .xf-sl .xf-fill{ border-bottom:0; }\n.xf-cl .xf-row{ display:flex; align-items:flex-end; margin-top:5.2mm; }\n.xf-cl .xf-row .t{ flex:none; font-weight:700; white-space:nowrap; }\n.xf-cl .xf-ind1{ margin-left:11mm; }\n.xf-cl .xf-ind2{ margin-left:40%; }\n.xf-cl .xf-hr{ border-top:1.4px solid #000; margin-top:8mm; padding-top:1mm; }\n.xf-cl .xf-note{ font-size:10pt; line-height:1.5; }\n.xf-cl .xf-note p{ margin:0 0 0.4mm 0; }\n.xf-cl .xf-note .sub{ margin-left:9mm; text-indent:-8mm; padding-left:8mm; margin-top:0.6mm; }\n/* ---- Exchange form: A4 width x half A4 height ---- */\n.xf-ex{ width:210mm; height:148.5mm; padding:4mm 12mm 3mm 12mm; font-size:10pt; }\n.xf-ex .xf-hdr img{ width:66mm; height:auto; }\n.xf-ex .xf-addr{ text-align:center; font-weight:700; font-size:8.6pt; margin-top:0.6mm; }\n.xf-ex .xf-addr2{ text-align:center; font-weight:700; font-size:9pt; }\n.xf-ex .xf-boxt{ text-align:center; margin:1.6mm 0 2.2mm; }\n.xf-ex .xf-boxt span{ display:inline-block; border:1.3px solid #000; padding:0.4mm 3.5mm; font-weight:700; font-size:11pt; }\n.xf-ex .xf-r{ display:flex; align-items:flex-end; min-height:7.4mm; }\n.xf-ex .xf-r.sg{ min-height:12mm; }\n.xf-ex .xf-r .n{ width:8mm; flex:none; }\n.xf-ex .xf-r .l{ width:55mm; flex:none; }\n.xf-ex .xf-r .c{ width:5mm; flex:none; }\n.xf-ex .xf-r .m{ flex:1 1 0; min-width:0; display:flex; align-items:flex-end; gap:1.5mm; }\n.xf-ex .xf-r .t{ flex:none; white-space:nowrap; }\n.xf-ex .xf-r .gap{ flex:0 0 5mm; }\n.xf-ex .xf-r .w2{ flex:1.25 1 0; }\n.xf-ex .xf-r .w1{ flex:1 1 0; }\n.xf-ex .xf-r .sgn{ flex:1 1 0; white-space:nowrap; padding-left:1.2mm; }\n/* ---- SutonnyMJ (Bijoy) version of both forms ---- */\n.xf-smj{ font-family:SutonnyMJ,'Noto Sans Bengali',sans-serif; line-height:1.167; }\n.xf-smj .xf-en{ font-family:'Times New Roman',Times,'Liberation Serif',serif; font-size:.86em; }\n.xf-cl.xf-smj{ font-size:12.65pt; }\n.xf-cl.xf-smj .xf-title{ font-size:17.82pt; }\n.xf-cl.xf-smj .xf-note{ font-size:11.5pt; line-height:1.2; }\n.xf-ex.xf-smj{ font-size:11.5pt; }\n.xf-ex.xf-smj .xf-addr{ font-size:9.89pt; }\n.xf-ex.xf-smj .xf-addr2{ font-size:10.35pt; }\n.xf-ex.xf-smj .xf-boxt span{ font-size:12.65pt; }\n.xf-sheet [data-sig]{ position:relative; }\n.xf-sg{ height:13mm; }\n.xf-sheet .xf-sgi{ position:absolute; left:50%; bottom:0.4mm; transform:translateX(-50%); max-height:11mm; max-width:94%; width:auto; height:auto; margin:0; }\n.xf-ex .xf-sgi{ bottom:70%; max-height:10mm; }\n/* ---- edit screen ---- */\n.xf-pv [data-sig]{ cursor:pointer; background:rgba(43,108,176,.10); -webkit-tap-highlight-color:transparent; }\n.xf-pv .xf-sg:empty::after{ content:'✍ Signature'; position:absolute; left:50%; bottom:2mm; transform:translateX(-50%); font:600 9pt system-ui,sans-serif; color:#2b6cb0; white-space:nowrap; }\n.xf-ov{ position:fixed; inset:0; z-index:20000; background:#141416; color:#ececf0; display:flex; flex-direction:column; font-family:inherit; }\n.xf-ov[hidden]{ display:none; }\n.xf-top{ display:flex; align-items:center; gap:8px; padding:calc(8px + env(safe-area-inset-top,0px)) 10px 8px; border-bottom:1px solid #34343a; background:#1b1b1f; }\n.xf-top .xf-tt{ flex:1 1 auto; min-width:0; font-size:14px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }\n.xf-top button{ white-space:nowrap; height:38px; min-width:38px; padding:0 12px; border-radius:10px; border:1px solid #3b3b42; background:#26262b; color:#ececf0; font-size:14px; cursor:pointer; font-family:inherit; }\n.xf-top button.ico{ display:inline-flex; align-items:center; justify-content:center; padding:0 10px; }\n.xf-top button.ico[disabled]{ opacity:.5; }\n.xf-top button.pri{ background:#e8c35a; color:#1a1405; border-color:#e8c35a; font-weight:700; }\n.xf-body{ flex:1 1 auto; overflow:auto; -webkit-overflow-scrolling:touch; padding:12px 12px calc(24px + env(safe-area-inset-bottom,0px)); }\n.xf-grp{ border:1px solid #34343a; border-radius:12px; padding:10px 10px 4px; margin-bottom:10px; background:#1a1a1e; }\n.xf-grp h4{ margin:0 0 8px; font-size:12.5px; color:#a9a9b3; letter-spacing:.3px; font-weight:600; }\n.xf-fld{ margin-bottom:9px; }\n.xf-fld label{ display:block; font-size:12px; color:#b5b5bf; margin-bottom:3px; }\n.xf-fld input, .xf-fld textarea{ box-sizing:border-box; width:100%; border:1px solid #3b3b42; background:#101012; color:#f2f2f5; border-radius:9px; padding:9px 10px; font-size:15px; font-family:inherit; outline:none; }\n.xf-fld input:focus, .xf-fld textarea:focus{ border-color:#22d3ee; }\n.xf-fld textarea{ min-height:62px; resize:vertical; }\n.xf-pvl{ font-size:12px; color:#a9a9b3; margin:14px 2px 6px; }\n.xf-pv{ background:#2a2a2e; border-radius:10px; overflow:hidden; position:relative; }\n.xf-pvin{ transform-origin:0 0; position:absolute; left:0; top:0; }\n.xf-pvin .xf-sheet{ box-shadow:none; }\n.xf-pv .xf-fill{ cursor:text; outline:none; -webkit-tap-highlight-color:transparent; }\n.xf-pv .xf-fill:focus{ background:rgba(34,211,238,.18); }\n.xf-sheet .xf-fill.xf-editing{ font-family:'Noto Sans Bengali','Kalpurush','SolaimanLipi','Nirmala UI',sans-serif; }\n#xfPrint{ display:none; }\n@media print{\n  html, body.xf-printing{ background:#fff !important; height:auto !important; min-height:0 !important; overflow:visible !important; margin:0 !important; padding:0 !important; position:static !important; }\n  body.xf-printing > *:not(#xfPrint){ display:none !important; }\n  body.xf-printing #xfPrint{ display:block !important; }\n  #xfPrint .xf-sheet{ margin:0; page-break-inside:avoid; break-inside:avoid; }\n}\n";
  function injectCss(){
    if(document.getElementById('xfStyle')) return;
    var st = document.createElement('style'); st.id = 'xfStyle'; st.textContent = XF_CSS; document.head.appendChild(st);
  }

  function esc(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function fill(V, k, extra){ var t = V && V[k] ? String(V[k]) : ''; return '<span class="xf-fill ' + (extra || '') + (t ? '' : ' xf-empty') + '" data-k="' + k + '">' + (t ? esc(t) : '') + '</span>'; }

  function sgi(V, k){ return V && V[k] && /^data:image\//.test(V[k]) ? '<img class="xf-sgi" alt="" src="' + V[k] + '">' : ''; }
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
      + '<div class="xf-sigbox"><div class="xf-sg" data-sig="sig1">' + sgi(V, 'sig1') + '</div><div class="xf-dots"></div><div class="xf-b">দরখাস্তকারীর স্বাক্ষর</div><div class="xf-sl"><span>তারিখ :-</span>' + fill(V, 'adate') + '</div></div>'
      + '<div class="xf-row xf-ind1"><span class="t">ঊর্ধ্বতন কর্তৃপক্ষের সুপারিশ</span>' + fill(V, 'rec1') + '</div>'
      + '<div class="xf-row xf-ind2">' + fill(V, 'rec2') + '</div>'
      + '<div class="xf-row xf-ind2"><span class="t">স্বাক্ষর</span><span class="xf-fill xf-sgf" data-sig="sig2">' + sgi(V, 'sig2') + '</span><span class="t">পদবী</span>' + fill(V, 'rpost') + '</div>'
      + '<div class="xf-row xf-ind2"><span class="t">তারিখ</span>' + fill(V, 'rdate') + '</div>'
      + '<div class="xf-row" style="margin-top:7mm"><span class="t">ছুটি মঞ্জুরকারী কর্মকর্তার মন্তব্য</span>' + fill(V, 'com1') + '</div>'
      + '<div class="xf-row">' + fill(V, 'com2') + '</div>'
      + '<div class="xf-row xf-ind2"><span class="t">স্বাক্ষর</span><span class="xf-fill xf-sgf" data-sig="sig3">' + sgi(V, 'sig3') + '</span><span class="t">তারিখ</span>' + fill(V, 'cdate') + '</div>'
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
      + r('', '', T('কর্তব্যস্থল:') + fill(V, 'p2', 'w2') + '<span class="gap"></span><span class="sgn w1" data-sig="exA">' + sgi(V, 'exA') + 'আবেদনকারীর স্বাক্ষর</span>', 'sg')
      + r('৪।', 'যিনি বিনিময় করিতে সম্মত', T('নাম/পদবী:') + fill(V, 'pname'))
      + r('', '', T('ঠিকানা:') + fill(V, 'paddr', 'w2') + '<span class="gap"></span><span class="sgn w1" data-sig="exB">' + sgi(V, 'exB') + 'স্বাক্ষর ও তারিখ' + (V && V.pdate ? ': ' + esc(V.pdate) : '') + '</span>', 'sg')
      + r('৫।', 'নিয়ন্ত্রক কর্মকর্তার মন্তব্য', fill(V, 'remark'))
      + '<div class="xf-r sg"><span class="n"></span><span class="l"></span><span class="c"></span><div class="m"><span class="w2"></span><span class="gap"></span><span class="sgn w1" data-sig="exC">' + sgi(V, 'exC') + 'স্বাক্ষর ও তারিখ</span></div></div>'
      + '</div>';
  }

  var FORMS = {
    cl: { title:'CL Form — নৈমিত্তিক ছুটির দরখাস্ত', page:'210mm 297mm', w:210, h:297, png:'CL-Form.png', defaults:{ office:"নির্বাহী পরিচালকের দপ্তর,হশাআবি,ATM শাখা" }, html:clHtml, groups:[
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
      + '<div class="xf-body"><div class="xf-pv"><div class="xf-pvin"></div></div></div>';
    document.body.appendChild(ov);
    pageStyle = document.createElement('style'); pageStyle.id = 'xfPageStyle'; document.head.appendChild(pageStyle);
    printRoot = document.createElement('div'); printRoot.id = 'xfPrint'; document.body.appendChild(printRoot);
    ov.addEventListener('click', function(e){
      var sg = e.target.closest && e.target.closest('[data-sig]'); if(sg && ov.querySelector('.xf-pv').contains(sg)){ openSig(sg.getAttribute('data-sig')); return; }
      var b = e.target.closest && e.target.closest('[data-x]'); if(!b) return; var a = b.getAttribute('data-x');
      if(a === 'close') close(); else if(a === 'print') doPrint(); else if(a === 'png') doPng(b); else if(a === 'reset'){ if(confirm('এই ফর্মের সব লেখা মুছে ফেলবেন?')){ vals = withDefaults(cur, {}); save(); preview(); } }
    });
    function fk(t){ return t && t.classList && t.classList.contains('xf-fill') && t.getAttribute('data-k') ? t.getAttribute('data-k') : null; }
    ov.addEventListener('focusin', function(e){
      var t = e.target, k = fk(t); if(!k || t.classList.contains('xf-editing')) return;
      t.classList.add('xf-editing'); t.classList.remove('xf-empty'); t.textContent = vals[k] || '';
      try{ var r = document.createRange(); r.selectNodeContents(t); r.collapse(false); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }catch(x){}
    });
    ov.addEventListener('focusout', function(e){
      var t = e.target, k = fk(t); if(!k) return;
      t.classList.remove('xf-editing'); renderFill(t);
      setTimeout(function(){ if(pend && !ov.querySelector('.xf-fill.xf-editing')){ pend = false; preview(); } }, 300);
    });
    ov.addEventListener('input', function(e){ var t = e.target, k = fk(t); if(k){ vals[k] = (t.textContent || '').replace(/\u00a0/g, ' '); save(); } });
    ov.addEventListener('keydown', function(e){ var k = fk(e.target); if(k && k !== 'remark' && e.key === 'Enter') e.preventDefault(); });
    ov.addEventListener('paste', function(e){ if(!fk(e.target)) return; e.preventDefault(); var tx = ((e.clipboardData || window.clipboardData).getData('text') || '').replace(/\r?\n/g, ' '); document.execCommand('insertText', false, tx); });
    window.addEventListener('resize', function(){ if(ov && !ov.hidden) fit(); });
  }
  var pend = false;
  function fit(){
    var f = FORMS[cur], pv = ov.querySelector('.xf-pv'), inn = ov.querySelector('.xf-pvin');
    var pxw = f.w * 96 / 25.4, pxh = f.h * 96 / 25.4, s = Math.min(1, (pv.clientWidth || 340) / pxw);
    inn.style.width = pxw + 'px'; inn.style.height = pxh + 'px'; inn.style.transform = 'scale(' + s + ')';
    pv.style.height = Math.ceil(pxh * s) + 'px';
  }
  function renderFill(el){   /* redraw one field (Bijoy-converted when SutonnyMJ is on) after editing */
    var v = vals[el.getAttribute('data-k')] || '';
    if(!v){ el.textContent = ''; el.classList.add('xf-empty'); }   /* empty stays truly empty: an NBSP would be drawn as "ড়" in SutonnyMJ (Bijoy) */
    else { el.classList.remove('xf-empty'); el.innerHTML = smj ? toSmj(esc(v)) : esc(v); }
  }
  function preview(){
    var f = FORMS[cur], inn = ov.querySelector('.xf-pvin');
    inn.innerHTML = sheetHtml(f, vals);
    Array.prototype.forEach.call(inn.querySelectorAll('.xf-fill[data-k]'), function(el){
      try{ el.contentEditable = 'plaintext-only'; }catch(e){}
      if(el.contentEditable !== 'plaintext-only') el.contentEditable = 'true';
      el.spellcheck = false; el.setAttribute('autocapitalize', 'off'); el.setAttribute('autocomplete', 'off');
    });
    fit();
  }
  function open(k){
    if(!FORMS[k]) return; if(!ov) build();
    ensureSmj().then(function(){ if(ov && !ov.hidden && cur === k){ if(ov.querySelector('.xf-fill.xf-editing')) pend = true; else preview(); } });
    cur = k; vals = load(k); ov.querySelector('.xf-tt').textContent = FORMS[k].title;
    ov.hidden = false; document.documentElement.style.overscrollBehavior = 'none';
    preview(); ov.querySelector('.xf-body').scrollTop = 0;
    setTimeout(function(){ if(ov && !ov.hidden) fit(); }, 80);
  }
  function close(){ if(ov) ov.hidden = true; document.documentElement.style.overscrollBehavior = ''; }   /* open() turns pull-to-refresh off while the editor is on screen; give it back when the editor closes */
  function doPrint(){
    ensureSmj().then(smjFonts).then(doPrint2);
  }
  function doPrint2(){
    var f = FORMS[cur];
    printRoot.innerHTML = sheetHtml(f, vals);
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
    var box = document.createElement('div'); box.innerHTML = sheetHtml(f, vals);
    var im = box.querySelector('img'); if(im && hdrData) im.setAttribute('src', hdrData);
    var markup = new XMLSerializer().serializeToString(box.firstChild);
    var css = ((smj ? smj.faceCss : '') + XF_CSS.split('/* ---- edit screen ---- */')[0]).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    var sw = f.w * 96 / 25.4, sh = f.h * 96 / 25.4;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + pw + '" height="' + ph + '" viewBox="0 0 ' + pw + ' ' + ph + '">'
      + '<foreignObject x="0" y="0" width="' + sw + '" height="' + sh + '"><div xmlns="http://www.w3.org/1999/xhtml" style="width:' + sw + 'px;height:' + sh + 'px;background:#fff"><style>' + css + '</style>' + markup + '</div></foreignObject></svg>';
  }
  function renderPng(f){
    var pw = 210 * 96 / 25.4, ph = 297 * 96 / 25.4;
    var p = hdrData ? Promise.resolve() : toDataUrl(HDR).then(function(d){ hdrData = d; });
    return p.then(function(){ return ensureSmj(); }).then(smjFonts).then(function(){ return (document.fonts && document.fonts.ready) || 0; }).then(function(){
      var img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sheetSvg(f, pw, ph));
      return (img.decode ? img.decode() : new Promise(function(r, j){ img.onload = r; img.onerror = j; })).then(function(){ return img; });
    }).then(function(img){
      /* the first draw makes the browser load the font embedded in the SVG; give it a moment, then draw the real page */
      if(!smj) return img;
      try{ var w0 = document.createElement('canvas'); w0.width = 40; w0.height = 56; w0.getContext('2d').drawImage(img, 0, 0, 40, 56); }catch(e){}
      return new Promise(function(r){ setTimeout(function(){ r(img); }, 800); });
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

  /* ---------- signature popup: draw with a finger, or take a photo of a paper signature; saved signatures can be reused ---------- */
  var sigOv = null, sigSlot = '', sigPad = null, sigCtx = null, sigDraw = false, sigLast = null;
  function sigLib(){ try{ var a = JSON.parse(localStorage.getItem('hsia_sig_lib') || '[]'); return Array.isArray(a) ? a : []; }catch(e){ return []; } }
  function sigLibSave(a){ try{ localStorage.setItem('hsia_sig_lib', JSON.stringify(a.slice(0, 6))); }catch(e){} }
  function sigTrim(cv){   /* crop to the ink, return a PNG data URL ('' when empty) */
    var w = cv.width, h = cv.height, d = cv.getContext('2d').getImageData(0, 0, w, h).data, x0 = w, y0 = h, x1 = -1, y1 = -1, x, y;
    for(y = 0; y < h; y++) for(x = 0; x < w; x++) if(d[(y * w + x) * 4 + 3] > 24){ if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y; }
    if(x1 < 0) return '';
    var p = 6; x0 = Math.max(0, x0 - p); y0 = Math.max(0, y0 - p); x1 = Math.min(w - 1, x1 + p); y1 = Math.min(h - 1, y1 + p);
    var o = document.createElement('canvas'); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1;
    o.getContext('2d').drawImage(cv, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
    return o.toDataURL('image/png');
  }
  function sigClear(){ sigCtx.clearRect(0, 0, sigPad.width, sigPad.height); }
  function sigPos(e){ var r = sigPad.getBoundingClientRect(); return [(e.clientX - r.left) * sigPad.width / r.width, (e.clientY - r.top) * sigPad.height / r.height]; }
  function sigThumbs(){
    var box = sigOv.querySelector('.xs-lib'), a = sigLib();
    box.innerHTML = a.length ? a.map(function(u, i){ return '<span class="xs-th"><img data-use="' + i + '" alt="" src="' + u + '"><b data-del="' + i + '">✕</b></span>'; }).join('') : '<span class="xs-none">সংরক্ষিত স্বাক্ষর নেই</span>';
  }
  function sigClose(){ if(sigOv) sigOv.hidden = true; }
  function sigSet(url){ if(url) vals[sigSlot] = url; else delete vals[sigSlot]; save(); preview(); sigClose(); }
  function sigFromPhoto(file){
    var img = new Image(), u = URL.createObjectURL(file);
    img.onload = function(){
      var sc = Math.min(1, 900 / img.width), c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
      var x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      var id = x.getImageData(0, 0, c.width, c.height), d = id.data;
      for(var i = 0; i < d.length; i += 4){   /* paper (light) -> transparent, ink (dark) -> opaque */
        var l = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2], a = l < 100 ? 255 : l > 175 ? 0 : Math.round(255 * (175 - l) / 75);
        d[i] = Math.min(d[i], 40); d[i + 1] = Math.min(d[i + 1], 40); d[i + 2] = Math.min(d[i + 2], 70); d[i + 3] = a;
      }
      x.putImageData(id, 0, 0);
      var t = sigTrim(c); if(!t){ alert('ছবিতে স্বাক্ষর পাওয়া যায়নি। সাদা কাগজে গাঢ় কালিতে আবার তুলুন।'); return; }
      var im2 = new Image(); im2.onload = function(){ sigClear(); var s2 = Math.min(sigPad.width * .94 / im2.width, sigPad.height * .94 / im2.height); sigCtx.drawImage(im2, (sigPad.width - im2.width * s2) / 2, (sigPad.height - im2.height * s2) / 2, im2.width * s2, im2.height * s2); }; im2.src = t;
    };
    img.onerror = function(){ alert('ছবি পড়া যায়নি।'); };
    img.src = u;
  }
  function sigBuild(){
    var st = document.createElement('style');
    st.textContent = '.xs-ov{position:fixed;inset:0;z-index:20001;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:10px}.xs-ov[hidden]{display:none}.xs-box{background:#1b1b1f;color:#ececf0;border:1px solid #34343a;border-radius:16px;width:100%;max-width:440px;max-height:94vh;overflow:auto;padding:14px;font-family:system-ui,sans-serif}.xs-box h3{margin:0 0 4px;font-size:15px}.xs-box p{margin:0 0 8px;font-size:12px;color:#a9a9b3}.xs-pad{width:100%;aspect-ratio:5/2;background:#fff;border-radius:10px;touch-action:none;display:block}.xs-row{display:flex;gap:8px;margin-top:10px}.xs-row button,.xs-row label{flex:1;text-align:center;padding:11px 4px;border-radius:10px;border:1px solid #3b3b42;background:#26262b;color:#ececf0;font-size:13px;font-weight:600;cursor:pointer}.xs-row .pri{background:#e8c35a;color:#1a1405;border-color:#e8c35a;font-weight:700}.xs-lib{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;min-height:20px}.xs-th{position:relative;background:#fff;border-radius:8px;padding:4px;width:30%;height:44px;display:flex;align-items:center;justify-content:center}.xs-th img{max-width:100%;max-height:100%;cursor:pointer}.xs-th b{position:absolute;top:-6px;right:-6px;background:#c33;color:#fff;border-radius:50%;width:18px;height:18px;font-size:10px;display:flex;align-items:center;justify-content:center;cursor:pointer}.xs-none{font-size:12px;color:#a9a9b3}.xs-lb{font-size:12px;color:#a9a9b3;margin-top:10px}';
    document.head.appendChild(st);
    sigOv = document.createElement('div'); sigOv.className = 'xs-ov'; sigOv.hidden = true;
    sigOv.innerHTML = '<div class="xs-box"><h3>স্বাক্ষর যোগ করুন</h3><p>নিচের সাদা ঘরে আঙুল দিয়ে স্বাক্ষর আঁকুন, অথবা কাগজে করা স্বাক্ষরের ছবি দিন।</p><canvas class="xs-pad" width="750" height="300"></canvas>'
      + '<div class="xs-row"><button type="button" data-a="clear">মুছুন</button><label>ছবি থেকে<input type="file" accept="image/*" hidden></label></div>'
      + '<div class="xs-lb">সংরক্ষিত স্বাক্ষর (চাপলে বসবে)</div><div class="xs-lib"></div>'
      + '<div class="xs-row"><button type="button" data-a="cancel">বাতিল</button><button type="button" data-a="remove">সরান</button><button type="button" class="pri" data-a="ok">ব্যবহার করুন</button></div></div>';
    document.body.appendChild(sigOv);
    sigPad = sigOv.querySelector('canvas'); sigCtx = sigPad.getContext('2d'); sigCtx.lineCap = 'round'; sigCtx.lineJoin = 'round'; sigCtx.strokeStyle = '#111';
    sigPad.addEventListener('pointerdown', function(e){ e.preventDefault(); sigDraw = true; try{ sigPad.setPointerCapture(e.pointerId); }catch(x){} sigLast = sigPos(e); sigCtx.lineWidth = 6; sigCtx.beginPath(); sigCtx.arc(sigLast[0], sigLast[1], 3, 0, 6.3); sigCtx.fillStyle = '#111'; sigCtx.fill(); });
    sigPad.addEventListener('pointermove', function(e){ if(!sigDraw) return; e.preventDefault(); var p = sigPos(e); sigCtx.beginPath(); sigCtx.moveTo(sigLast[0], sigLast[1]); sigCtx.lineTo(p[0], p[1]); sigCtx.stroke(); sigLast = p; });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function(n){ sigPad.addEventListener(n, function(){ sigDraw = false; }); });
    sigOv.querySelector('input').addEventListener('change', function(e){ var f = e.target.files && e.target.files[0]; if(f) sigFromPhoto(f); e.target.value = ''; });
    sigOv.addEventListener('click', function(e){
      var t = e.target, a = t.getAttribute && t.getAttribute('data-a');
      if(t === sigOv || a === 'cancel'){ sigClose(); return; }
      if(a === 'clear'){ sigClear(); return; }
      if(a === 'remove'){ sigSet(''); return; }
      if(a === 'ok'){
        var u = sigTrim(sigPad); if(!u){ alert('প্রথমে স্বাক্ষর আঁকুন বা ছবি দিন।'); return; }
        var lib = sigLib().filter(function(x){ return x !== u; }); lib.unshift(u); sigLibSave(lib); sigSet(u); return;
      }
      if(t.hasAttribute && t.hasAttribute('data-del')){ var l2 = sigLib(); l2.splice(+t.getAttribute('data-del'), 1); sigLibSave(l2); sigThumbs(); return; }
      if(t.hasAttribute && t.hasAttribute('data-use')){ sigSet(sigLib()[+t.getAttribute('data-use')] || ''); return; }
    });
  }
  function openSig(slot){
    if(!sigOv) sigBuild();
    sigSlot = slot; sigClear(); sigThumbs(); sigOv.hidden = false;
    if(vals[slot]){ var im = new Image(); im.onload = function(){ var s2 = Math.min(sigPad.width * .94 / im.width, sigPad.height * .94 / im.height); sigCtx.drawImage(im, (sigPad.width - im.width * s2) / 2, (sigPad.height - im.height * s2) / 2, im.width * s2, im.height * s2); }; im.src = vals[slot]; }
  }
  window.hsiaOpenForm = open;
})();
