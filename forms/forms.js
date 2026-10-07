(function(){
  if(window.hsiaOpenForm) return;
  var BASE = ((document.currentScript && document.currentScript.src) || 'forms/forms.js').replace(/[^\/]*$/, '');
  var HDR = BASE + 'header.png';
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
    cl: { title:'CL Form — নৈমিত্তিক ছুটির দরখাস্ত', page:'210mm 297mm', w:210, h:297, html:clHtml, groups:[
      { t:'দরখাস্তকারী', f:[['office','অফিস'],['name','১। নাম ও পদবী'],['total','২। মোট জমাকৃত ছুটির পরিমান'],['period','৩। প্রার্থিত ছুটির সময় কাল ও পরিমান'],['reason','৪। ছুটির কারণ'],['addr','৫। ছুটি সময়কালীন ঠিকানা'],['adate','তারিখ']] },
      { t:'ঊর্ধ্বতন কর্তৃপক্ষ', f:[['rec1','সুপারিশ (১ম লাইন)'],['rec2','সুপারিশ (২য় লাইন)'],['rpost','পদবী'],['rdate','তারিখ']] },
      { t:'ছুটি মঞ্জুরকারী কর্মকর্তা', f:[['com1','মন্তব্য (১ম লাইন)'],['com2','মন্তব্য (২য় লাইন)'],['cdate','তারিখ']] } ] },
    ex: { title:'Exchange Form — কর্তব্য পরিবর্তন ফরম', page:'210mm 148.5mm', w:210, h:148.5, html:exHtml, groups:[
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
  function load(k){ try{ return JSON.parse(localStorage.getItem(key(k)) || '{}') || {}; }catch(e){ return {}; } }
  function save(){ try{ localStorage.setItem(key(cur), JSON.stringify(vals)); }catch(e){} }
  function build(){
    ov = document.createElement('div'); ov.className = 'xf-ov'; ov.hidden = true;
    ov.innerHTML = '<div class="xf-top"><button type="button" data-x="close" aria-label="Close">✕</button><div class="xf-tt"></div><button type="button" data-x="reset" title="সব মুছুন">↺</button><button type="button" class="pri" data-x="print">🖨️ প্রিন্ট</button></div>'
      + '<div class="xf-body"><div class="xf-fields"></div><div class="xf-pvl">প্রিভিউ (প্রিন্টে আসল মাপে ছাপা হবে — PDF সেভ করতে প্রিন্ট থেকে “Save as PDF” বাছুন)</div><div class="xf-pv"><div class="xf-pvin"></div></div></div>';
    document.body.appendChild(ov);
    pageStyle = document.createElement('style'); pageStyle.id = 'xfPageStyle'; document.head.appendChild(pageStyle);
    printRoot = document.createElement('div'); printRoot.id = 'xfPrint'; document.body.appendChild(printRoot);
    ov.addEventListener('click', function(e){
      var b = e.target.closest && e.target.closest('[data-x]'); if(!b) return; var a = b.getAttribute('data-x');
      if(a === 'close') close(); else if(a === 'print') doPrint(); else if(a === 'reset'){ if(confirm('এই ফর্মের সব লেখা মুছে ফেলবেন?')){ vals = {}; save(); fields(); preview(); } }
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
  window.hsiaOpenForm = open;
})();
