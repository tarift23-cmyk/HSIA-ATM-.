/* Salary Fixation editor (বেতন নির্ধারণী বিবরণী) — Legal size (8.5 x 14 in) form, every cell editable.
   Settings > Important PDF > Others > Salary Fixation.  Everything typed is auto-saved on this device only.
   Print: first offers to save a Legal PDF (600 dpi, JPEG quality 100), then opens the print dialog (vector text, Legal page). */
(function(){
  if(window.hsiaOpenSalary) return;
  var KEY = 'hsiaSalaryFix2', SIGKEY = 'hsiaSalarySig1', PW = 816, PH = 1344;          // legal page in CSS px (8.5in x 14in at 96 dpi)
  var FAMILY = "'Noto Sans Bengali','Hind Siliguri',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
  var LOGO_L = 'data:image/jpeg;base64,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';
  var LOGO_R = 'data:image/jpeg;base64,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';

  /* ---------- page layout (shared by editor, print and PDF) ---------- */
  var PAGE_CSS =
    '.sfp{position:relative;width:612pt;height:1008pt;box-sizing:border-box;background:#fff;color:#000;font-family:' + FAMILY + ';font-size:11pt;line-height:15pt;overflow:hidden;text-align:left;}' +
    '.sfp *{box-sizing:border-box;} .sfp .a{position:absolute;} .sfp img.a{display:block;}' +
    '.sfp .e{outline:none;min-height:14pt;} .sfp .ib{display:inline-block;min-width:60pt;} .sfp .il{display:inline;min-height:0;}' +
    '.sfp .sm{font-size:8.6pt;}' +
    '.sfp .bl{display:inline-block;min-width:30pt;border-bottom:0.75pt dotted #000;text-align:center;white-space:pre;outline:none;line-height:13pt;}' +
    '.sfp .bl:before{content:"\\200b";}' +
    '.sfp table.tb{position:absolute;left:47.1pt;top:95pt;width:517.9pt;border-collapse:collapse;table-layout:fixed;}' +
    '.sfp .tb td{border:0.75pt solid #000;padding:0 3pt 0 5.7pt;height:16.556pt;line-height:14pt;vertical-align:middle;overflow:hidden;white-space:nowrap;}' +
    '.sfp .tb td.sn{vertical-align:top;padding-top:1pt;} .sfp .tb td.cn{padding:0;text-align:center;}' +
    '.sfp .tb td.vv{padding-top:0.5pt;padding-bottom:0.5pt;}' +
    '.sfp .ps{font-size:10.4pt;} .sfp .ln{display:block;text-align:justify;text-align-last:justify;white-space:normal;}' +
    '.sfp .ln.l{text-align:left;text-align-last:left;}' +
    '.sfp .sg{display:grid;grid-template-columns:1fr 1fr 1fr;text-align:center;}' +
    '.sfp .tb tr{height:16.556pt;} .sfp .bd{font-weight:700;}' +
    '.sfp .fl{display:flex;align-items:baseline;white-space:nowrap;width:518pt;line-height:13pt;} .sfp .fl>*{flex:none;} .sfp .fl .il{white-space:pre;} .sfp .fl .bl+.bl{margin-left:4pt;}' +
    '.sfp .bl.nb{border-bottom-color:transparent;} .sfp .sb{display:block;min-width:0;line-height:15.6pt;min-height:15.6pt;}' +
    '.sfp .sgi{display:block;width:100%;height:100%;object-fit:contain;}' +
    '@media print{.sfp{height:1006pt;}}';

  var ROWS = [
    ['০১', 1, 'জাতীয় পরিচয়পত্র নম্বর', '', 'এনআইডি নম্বর'],
    ['০২', 2, 'ক) কর্মচারীর নাম', '', 'কর্মচারীর নাম', 'name'],
    [0, 0, 'খ) কর্মচারীর পদবি', 'এরোড্রাম সহকারী'],
    ['০৩', 1, 'পদায়নকৃত দপ্তরের নাম', 'নিবার্হী পরিচালকের দপ্তর, এটিএম শাখা, হশাআবি, কুর্মিটোলা, ঢাকা', '', 'sm'],
    ['০৪', 1, 'ই আই এন', '', 'ই আই এন'],
    ['০৫', 1, 'জন্ম তারিখ', '', 'দিন/মাস/বছর'],
    ['০৬', 4, 'ক) চাকরিতে প্রথম যোগদানের তারিখ', '', 'দিন/মাস/বছর'],
    [0, 0, 'খ) প্রথম যোগদানের তারিখে পদবি', 'এরোড্রাম সহকারী'],
    [0, 0, 'গ) পদায়নকৃত দপ্তরের নাম', 'নিবার্হী পরিচালকের দপ্তর, এটিএম শাখা, হশাআবি, কুর্মিটোলা, ঢাকা।', '', 'sm'],
    [0, 0, 'ঘ) যোগদানের তারিখে পদের গ্রেড', '১০ম ।'],
    ['০৭', 4, '৩০-০৬-২০২৬ তারিখে', ''],
    [0, 0, 'ক) গৃহীত মূল বেতন', '১৬০০০ টাকা'],
    [0, 0, 'খ) পি পি (যদি থাকে)', '-'],
    [0, 0, 'গ) মোট বেতন <b>(৭ক+৭খ)</b>', '১৬০০০ টাকা'],
    ['০৮', 4, 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী ৩০-০৬-২০২৬ তারিখে', ''],
    [0, 0, 'ক) প্রাপ্ত গ্রেড ও স্কেল', 'গ্রেড: ১০ম ও স্কেল: (১৬০০০-৩৮৬৪০) টাকা'],
    [0, 0, 'খ) প্রাপ্ত গ্রেডের প্রারম্ভিক ধাপ', '১৬০০০ টাকা'],
    [0, 0, 'গ) পার্থক্য <b>(৭গ-৮খ)</b>', '০০ টাকা'],
    ['০৯', 4, 'জাতীয় বেতন স্কেল ২০২৬ অনুযায়ী ০১-০৭-২০২৬ তারিখে', ''],
    [0, 0, 'ক) প্রাপ্য গ্রেড ও স্কেল', 'গ্রেড: ১০ম ও স্কেল: (৩২০০০-৭৭৩০০) টাকা'],
    [0, 0, 'খ) প্রাপ্য গ্রেডের প্রারম্ভিক ধাপ', '৩২০০০ টাকা'],
    [0, 0, 'গ) মোট বেতন <b>(৮গ+৯খ)</b>', '৩২০০০ টাকা'],
    ['১০', 1, 'জাতীয় বেতন স্কেল-২০২৬ অনুযায়ী সম/উচ্চতর ধাপ', '৩২০০০ টাকা'],
    ['১১', 1, '০১-০৭-২০২৬ তারিখে নির্ধারিত বেতন', '৩২০০০ টাকা'],
    ['১২', 1, '০১-০৭-২০২৬ তারিখে বার্ষিক বেতন বৃদ্ধি (ইনক্রিমেন্ট)সহ নির্ধারিত বেতন', '৩২০০০ টাকা'],
    ['১৩', 1, 'বেতন বৃদ্ধির পরিমাণ <b>(১১-৭গ)</b>', '১৬০০০ টাকা'],
    ['১৪', 1, 'বর্ধিত বেতনের অংশ <b>(১৩ এর ৪০% অথবা ৫০%)</b>', '৮০০০ টাকা'],
    ['১৫', 1, '০১-০৭-২০২৬ তারিখে প্রাপ্য বেতন (৪০% অথবা ৫০% বৃদ্ধি অনুযায়ী) <b>(৭গ+১৪)</b>', '২৪০০০ টাকা'],
    ['১৬', 1, '০১-০৭-২০২৬ তারিখে বার্ষিক বেতন বৃদ্ধি (ইনক্রিমেন্ট)সহ প্রাপ্য বেতন <b>(১৫+(১২-১১))</b>', '২৪০০০ টাকা'],
    ['১৭', 1, '০১-০১-২০২৭ তারিখে বেতন বৃদ্ধির পরবর্তী অংশ <b>(১৩ এর ২৫% অথবা ৩০%)</b>', '৪০০০ টাকা'],
    ['১৮', 1, '০১-০১-২০২৭ তারিখে নির্ধারিত প্রাপ্য বেতন <b>(১৬+১৭)</b>', '২৮০০০ টাকা'],
    ['১৯', 1, '০১-০১-২০২৭ তারিখে বেতন বৃদ্ধির অবশিষ্ট অংশ <b>(১৩ এর ২৫% অথবা ৩০%)</b>', '৪০০০ টাকা'],
    ['২০', 1, '০১-০৭-২০২৭ তারিখে নির্ধারিত প্রাপ্য বেতন ১০০% <b>(১৮+১৯)</b>', '৩২০০০ টাকা'],
    ['২১', 1, '০১-০৭-২০২৭ তারিখে বর্ধিত বেতন বৃদ্ধি (ইনক্রিমেন্ট)সহ প্রাপ্য', '৩২০০০ টাকা']
  ];

  var state = {}, nameIdx = -1;
  try{ state = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }catch(e){ state = {}; }
  var sig = ''; try{ sig = localStorage.getItem(SIGKEY) || ''; }catch(e){ sig = ''; }
  var fitC = {};
  var saveT = 0;
  function save(){ clearTimeout(saveT); saveT = setTimeout(function(){ try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){} }, 300); }
  function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  /* keep text + <b> only */
  function san(html, keep){
    var doc = new DOMParser().parseFromString('<body>' + html + '</body>', 'text/html');
    function w(n){
      var o = '';
      n.childNodes.forEach(function(k){
        if(k.nodeType === 3) o += esc(k.nodeValue.replace(/[\u200b]/g, '').replace(/\u00a0/g, ' '));
        else if(k.nodeType === 1){
          var t = k.tagName.toLowerCase();
          if(t === 'br') o += ' ';
          else if(t === 'b' || t === 'strong') o += '<b>' + w(k) + '</b>';
          else o += w(k);
        }
      });
      return o;
    }
    var r = w(doc.body).replace(/\s+/g, ' ');
    return keep ? r : r.trim();
  }

  /* ---------- build the page; edit=true makes every cell an editable box ---------- */
  function build(edit){
    var n = 0;
    function val(i, d){ return Object.prototype.hasOwnProperty.call(state, i) ? state[i] : d; }
    function ed(tag, cls, d, ph, keep){
      var i = n++, fs = fitC[i] ? ' style="font-size:' + fitC[i] + 'pt"' : '';
      return '<' + tag + ' class="e ' + (cls || '') + '"' + fs + (edit ? ' contenteditable="true" spellcheck="false" data-i="' + i + '"' + (keep ? ' data-k="1"' : '') + ' data-ph="' + esc(ph || '') + '"' : '') + '>' + val(i, d) + '</' + tag + '>';
    }
    function bl(w, ph, g, cls){
      var i = n++;
      return '<span class="bl' + (cls ? ' ' + cls : '') + '" style="' + (g ? 'flex:' + g + ' 0 auto;' : '') + 'min-width:' + w + 'pt"' + (edit ? ' contenteditable="true" spellcheck="false" data-i="' + i + '" title="' + esc(ph || '') + '"' : '') + '>' + val(i, '') + '</span>';
    }
    function t(d){ return ed('span', 'il', d, '', true); }
    function ab(st, inner){ return '<div class="a" style="' + st + '">' + inner + '</div>'; }

    var h = '<div class="sfp">';
    h += '<img class="a" alt="" style="left:51.9pt;top:44.5pt;width:34.1pt;height:35.6pt" src="' + LOGO_L + '">';
    h += '<img class="a" alt="" style="left:518.6pt;top:43pt;width:46.5pt;height:35.6pt" src="' + LOGO_R + '">';
    h += ab('left:90pt;right:90pt;top:43.5pt;text-align:center;font-size:12pt;line-height:15pt', ed('div', 'ib bd', 'বাংলাদেশ বেসামরিক বিমান চলাচল কর্তৃপক্ষ'));
    h += ab('left:90pt;right:90pt;top:58.5pt;text-align:center', ed('div', 'ib', 'সদরদপ্তর, কুর্মিটোলা, ঢাকা।'));
    h += ab('left:0;right:0;top:79.5pt;text-align:center', ed('div', 'ib bd', 'জাতীয় বেতন স্কেল-২০২৬ অনুযায়ী ০১-০৭-২০২৬ তারিখে বেতন নির্ধারণের বিবরণী'));

    h += '<table class="tb"><colgroup><col style="width:28.2pt"><col style="width:276.3pt"><col style="width:13.4pt"><col></colgroup><tbody>';
    ROWS.forEach(function(r){
      h += '<tr>';
      if(r[0]) h += '<td class="sn" rowspan="' + r[1] + '">' + ed('div', '', r[0], '') + '</td>';
      h += '<td>' + ed('div', '', r[2], '') + '</td><td class="cn">:</td>';
      var isName = r[5] === 'name';
      if(isName) nameIdx = n;
      h += '<td class="vv">' + ed('div', 'v' + ((r[4] === 'sm' || r[5] === 'sm') ? ' sm' : ''), r[3], (r[4] && r[4] !== 'sm') ? r[4] : '') + '</td></tr>';
    });
    h += '</tbody></table>';

    var SB = 'left:108.4pt;top:661pt;width:130pt;height:37pt';
    if(edit) h += '<div class="a sgx" style="' + SB + '">' + (sig ? '<img class="sgi" alt="" src="' + sig + '">' : '<span>✍️ সিগনেচার</span>') + '</div>';
    else if(sig) h += '<div class="a" style="' + SB + '"><img class="sgi" alt="" src="' + sig + '"></div>';
    h += ab('left:113.4pt;width:120pt;top:698.8pt;text-align:center', ed('div', 'ib', 'স্বাক্ষর'));
    h += ab('left:395.5pt;width:140pt;top:698.8pt;text-align:center', ed('div', 'ib', 'আয়ন-ব্যয়ন কর্মকর্তা'));
    h += ab('left:210.2pt;width:240pt;top:728.9pt;text-align:center', ed('div', 'ib bd', 'নিরীক্ষা অফিসে ব্যবহারের জন্য'));
    h += ab('left:47pt;top:744.4pt;white-space:nowrap', t('নথি নং- ৩০.৩১.০০০০.০০০.৩১১.৭৪.০০০৭.২৬/') + bl(60, 'নথি নং', 0, 'nb'));
    h += ab('right:47pt;top:744.4pt;white-space:nowrap', t('তারিখ: ') + bl(28, 'দিন', 0, 'nb') + t(' / ') + bl(24, 'মাস', 0, 'nb') + t(' /২০২৬'));

    function fl(k, top, inner){
      var f = fitC['L' + k];
      return ab('left:47pt;top:' + top + 'pt;font-size:10.4pt', '<div class="fl" data-f="L' + k + '"' + (f ? ' style="font-size:' + f + 'pt"' : '') + '>' + inner + '</div>');
    }
    h += fl(1, 758.6, bl(20, 'নাম', 2.4) + bl(20, 'পদ', 1) + t('এর বর্তমান পদের বেতন নির্ধারণী বিবরণী পরীক্ষা করা হলো। জাতীয় বেতন স্কেল-২০২৬'));
    h += fl(2, 772.2, t('অনুযায়ী গ্রেড-') + bl(20, 'গ্রেড', 40) + t(' (') + bl(30, 'স্কেল', 85) + t(') টাকা স্কেলে ০১-০৭-২০২৬ তারিখে মূল বেতন নির্ধারণ ') + bl(24, 'টাকা', 56) + t(' (') + bl(24, 'কথায়', 60));
    h += fl(3, 785.3, '<span class="bl dc" style="min-width:92pt"></span>' + t(') টাকা অনুমোদন করা হলো (সার্ভিস বইয়ের পৃষ্ঠা নং-') + bl(60, 'পৃষ্ঠা নং') + t(')।'));
    h += fl(4, 801.0, t('০১-০৭-২০২৬ তারিখে বর্ধিত বেতনের ৪০%/৫০% ও বার্ষিক ইনক্রিমেন্টসহ বেতন ') + bl(24, 'টাকা', 54) + t(' (') + bl(40, 'কথায়', 140) + t(') টাকা প্রাপ্য।'));
    h += fl(5, 817.1, t('০১-০১-২০২৭ তারিখ হতে বেতন নির্ধারণের ৭০%/৭৫% সুবিধাসহ ') + bl(24, 'টাকা', 75) + t(' (') + bl(40, 'কথায়', 150) + t(') টাকা এবং'));
    h += fl(6, 832.7, t('০১-০৭-২০২৭ তারিখ হতে বেতন নির্ধারণের ১০০% সুবিধাসহ ') + bl(24, 'টাকা', 75) + t(' (') + bl(40, 'কথায়', 150) + t(') টাকা প্রাপ্য।'));
    h += fl(7, 848.3, t('পরবর্তী বার্ষিক বেতন বৃদ্ধির তারিখ: ') + bl(80, 'তারিখ', 0, 'nb') + t(' খ্রি.।'));

    var sg = '';
    for(var k = 0; k < 3; k++) sg += '<div>' + ed('div', 'sb', ['সদস্য', 'সদস্য সচিব', 'সভাপতি'][k]) + ed('div', 'sb', '(বেতন নির্ধারণী প্রতিপাদন কমিটি)') + '</div>';
    h += ab('left:47pt;width:518pt;top:873.5pt', '<div class="sg">' + sg + '</div>');
    return h + '</div>';
  }

  /* ---------- editor UI ---------- */
  var UI_CSS =
    '#salOv{position:fixed;inset:0;z-index:100000;background:#0b0b0d;color:#eee;display:flex;flex-direction:column;font-family:' + FAMILY + ';}' +
    '#salOv .sl-top{display:flex;align-items:center;gap:5px;padding:8px 10px;border-bottom:1px solid #222;flex:0 0 auto;}' +
    '#salOv .sl-t{flex:1;min-width:0;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '#salOv .sl-b{min-width:36px;height:38px;border:1px solid #3a3a40;background:#18181d;color:#eee;border-radius:10px;font-size:18px;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0 8px;}' +
    '#salOv .sl-p{padding:0 11px;background:#f6c84c;color:#222;border:0;font-size:15px;font-weight:600;}' +
    '#salOv .sl-z{font-size:12px;color:#9a9aa3;min-width:32px;text-align:center;}' +
    '#salOv .sl-body{flex:1 1 auto;overflow:auto;padding:12px;-webkit-overflow-scrolling:touch;}' +
    '#salOv .sl-wrap{position:relative;margin:0 auto 14px;background:#fff;border-radius:3px;overflow:hidden;}' +
    '#salOv .sl-pg{position:absolute;left:0;top:0;transform-origin:0 0;width:612pt;height:1008pt;}' +
    '#salOv .sl-hint{max-width:760px;margin:0 auto 8px;font-size:12px;color:#8d8d96;line-height:1.5;text-align:center;}' +
    '#salOv .e:empty{background:rgba(47,125,246,.10);} #salOv .e:empty:before{content:attr(data-ph);color:#8aa0c8;}' +
    '#salOv .e:focus,#salOv .bl:focus{background:rgba(47,125,246,.16);} #salOv .bl{background:rgba(47,125,246,.06);}' +
    '#salOv .sl-m{position:absolute;right:12px;top:60px;background:#18181d;border:1px solid #3a3a40;border-radius:10px;padding:6px;display:none;z-index:6;}' +
    '#salOv .sl-m button{display:block;width:100%;min-width:200px;margin:0;padding:11px 12px;background:none;border:0;color:#eee;font-size:15px;text-align:left;font-family:inherit;cursor:pointer;white-space:nowrap;}' +
    '#salOv .sl-dlg{position:absolute;inset:0;z-index:7;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:14px;}' +
    '#salOv .sl-dbox{width:100%;max-width:420px;background:#18181d;border:1px solid #333;border-radius:16px;padding:16px;max-height:92vh;overflow:auto;}' +
    '#salOv .sl-dbox h3{margin:0 0 10px;font-size:17px;}' +
    '#salOv .sl-dbox .hint{font-size:13px;color:#a8a8b2;line-height:1.6;}' +
    '#salOv .sl-dbox .col{display:flex;flex-direction:column;gap:8px;margin-top:14px;}' +
    '#salOv .sl-dbox .col button{min-height:46px;border-radius:12px;border:1px solid #3a3a40;background:#222227;color:#eee;font-size:15px;font-weight:600;font-family:inherit;padding:8px 12px;}' +
    '#salOv .sl-dbox .col .go{background:#f6c84c;color:#222;border:0;}' +
    '#salOv .sgx{border:1px dashed rgba(47,125,246,.6);border-radius:3pt;display:flex;align-items:center;justify-content:center;color:#8aa0c8;font-size:9pt;cursor:pointer;background:rgba(47,125,246,.05);} #salOv .sgx .sgi{padding:1pt;}' +
    '#salOv .sl-dbox input[type=range]{width:100%;margin:2px 0 8px;} #salOv .sl-dbox .lb{display:flex;justify-content:space-between;font-size:13px;color:#a8a8b2;margin-top:8px;}' +
    '#salOv .sl-dbox .ck{display:flex;align-items:center;gap:8px;font-size:14px;margin-top:6px;} #salOv .sl-dbox .pv{border-radius:10px;padding:8px;background:repeating-conic-gradient(#d9d9d9 0 25%,#fff 0 50%) 0 0/16px 16px;} #salOv .sl-dbox .pv canvas{display:block;width:100%;height:auto;}' +
    '#salOv .sl-bar{height:8px;border-radius:4px;background:#2a2a30;margin-top:12px;overflow:hidden;} #salOv .sl-bar i{display:block;height:100%;width:0;background:#f6c84c;transition:width .2s;}';
  var css = document.createElement('style');
  css.textContent = PAGE_CSS + UI_CSS;
  document.head.appendChild(css);

  var zoom = 1, ZOOMS = [1, 1.5, 2, 3];

  function open(){
    if(document.getElementById('salOv')) return;
    var ov = document.createElement('div'); ov.id = 'salOv';
    ov.innerHTML =
      '<div class="sl-top"><button class="sl-b" id="slX" aria-label="Close">✕</button><div class="sl-t">Salary Fixation</div>' +
      '<button class="sl-b" id="slZm" aria-label="Zoom out">−</button><div class="sl-z" id="slZ">100%</div><button class="sl-b" id="slZp" aria-label="Zoom in">＋</button>' +
      '<button class="sl-b" id="slM" aria-label="Menu">⋯</button><button class="sl-b sl-p" id="slP">🖨️ Print</button></div>' +
      '<div class="sl-m" id="slMenu"><button data-a="pdf">💾 PDF সেভ (Legal · 600 dpi)</button><button data-a="pdfa4">💾 PDF সেভ (A4 · সর্বোচ্চ রেজোলিউশন)</button><button data-a="reset">⟲ সব মুছে নতুন ফর্ম</button></div>' +
      '<div class="sl-body" id="slBody"><div class="sl-hint">যেকোনো ঘরে ট্যাপ করে লিখুন · Enter = পরের ঘরে · স্বয়ংক্রিয়ভাবে সেভ হয় · Legal size (8.5×14 in)</div>' +
      '<div class="sl-wrap" id="slWrap"><div class="sl-pg" id="slPg"></div></div></div>';
    document.body.appendChild(ov);
    var $ = function(id){ return document.getElementById(id); };
    var wrap = $('slWrap'), pg = $('slPg'), body = $('slBody'), menu = $('slMenu');
    pg.innerHTML = build(true); fitAll(pg);
    try{ if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ fitAll(pg); }); }catch(e){}
    setTimeout(function(){ fitAll(pg); }, 500);

    function fit(){
      var base = Math.min(body.clientWidth - 24, 760), w = base * zoom, s = w / PW;
      wrap.style.width = w + 'px'; wrap.style.height = (PH * s) + 'px';
      pg.style.transform = 'scale(' + s + ')';
      $('slZ').textContent = Math.round(zoom * 100) + '%';
    }
    window.addEventListener('resize', fit); fit();
    function close(){ window.removeEventListener('resize', fit); ov.remove(); }
    $('slX').onclick = close;
    $('slZm').onclick = function(){ var i = ZOOMS.indexOf(zoom); if(i > 0){ zoom = ZOOMS[i - 1]; fit(); } };
    $('slZp').onclick = function(){ var i = ZOOMS.indexOf(zoom); if(i < ZOOMS.length - 1){ zoom = ZOOMS[i + 1]; fit(); } };

    /* typing: auto-save, Enter = next box, plain-text paste */
    pg.addEventListener('input', function(e){
      var el = e.target.closest && e.target.closest('[data-i]'); if(!el) return;
      state[el.getAttribute('data-i')] = san(el.innerHTML, el.getAttribute('data-k') === '1'); save();
      var f = el.closest('.fl[data-f]');
      if(f) fitOne(f, f.getAttribute('data-f'));
      else if(el.matches('.tb td > .e')) fitOne(el, el.getAttribute('data-i'));
    });
    pg.addEventListener('click', function(e){
      if(e.target.closest && e.target.closest('.sgx')) sigFlow(ov, function(){
        var b = pg.querySelector('.sgx');
        if(b) b.innerHTML = sig ? '<img class="sgi" alt="" src="' + sig + '">' : '<span>✍️ সিগনেচার</span>';
      });
    });
    pg.addEventListener('keydown', function(e){
      if(e.key !== 'Enter') return;
      e.preventDefault();
      var all = [].slice.call(pg.querySelectorAll('.bl[contenteditable], .e.v')), i = all.indexOf(e.target.closest('[contenteditable]'));
      var nx = all[i + 1]; if(!nx) return;
      nx.focus();
      try{ var r = document.createRange(); r.selectNodeContents(nx); r.collapse(false); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }catch(x){}
    });
    pg.addEventListener('paste', function(e){
      var tx = (e.clipboardData || window.clipboardData).getData('text');
      e.preventDefault(); document.execCommand('insertText', false, String(tx).replace(/\s*[\r\n]+\s*/g, ' '));
    });

    /* menu */
    $('slM').onclick = function(e){ e.stopPropagation(); menu.style.display = menu.style.display === 'block' ? 'none' : 'block'; };
    ov.addEventListener('click', function(e){ if(!e.target.closest('.sl-m')) menu.style.display = 'none'; });
    menu.addEventListener('click', function(e){
      var b = e.target.closest('button'); if(!b) return; menu.style.display = 'none';
      if(b.getAttribute('data-a') === 'pdf') pdfFlow(ov, false);
      else if(b.getAttribute('data-a') === 'pdfa4') pdfFlow(ov, false, 'a4');
      else if(confirm('সব ঘর মুছে ফর্মটি আবার নতুনের মতো করা হবে। ঠিক আছে?')){
        state = {}; fitC = {}; try{ localStorage.removeItem(KEY); }catch(x){} pg.innerHTML = build(true); fitAll(pg);
      }
    });
    $('slP').onclick = function(){ printDialog(ov); };
  }

  /* ---------- shrink-to-fit: a cell or line never wraps / spills, so every row & line keeps the exact form position ---------- */
  function fitOne(el, key){
    el.style.fontSize = ''; delete fitC[key];
    var st = parseFloat(getComputedStyle(el).fontSize) * 0.75, s = st;
    if(!st) return;
    while(el.scrollWidth > el.clientWidth + 0.5 && s > st * 0.55){ s -= 0.2; el.style.fontSize = s.toFixed(1) + 'pt'; }
    if(s < st) fitC[key] = +s.toFixed(1);
  }
  function fitAll(pg){
    [].forEach.call(pg.querySelectorAll('.tb td > .e[data-i]'), function(el){ fitOne(el, el.getAttribute('data-i')); });
    [].forEach.call(pg.querySelectorAll('.fl[data-f]'), function(el){ fitOne(el, el.getAttribute('data-f')); });
  }

  /* ---------- signature: camera / PNG / JPG -> paper removed, levelled, cropped, transparent PNG ---------- */
  function sigPrep(im){
    var sc = Math.min(1, 1100 / Math.max(im.naturalWidth, im.naturalHeight));
    var w = Math.max(1, Math.round(im.naturalWidth * sc)), h = Math.max(1, Math.round(im.naturalHeight * sc)), N = w * h, i, j;
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, w, h);
    var px = x.getImageData(0, 0, w, h).data, tr = 0;
    for(i = 3; i < px.length; i += 16) if(px[i] < 200) tr++;
    var P = { w: w, h: h, orig: c, hasAlpha: tr > (N / 4) * 0.02, angle: 0 };
    if(P.hasAlpha) return P;
    var g = new Uint8Array(N);
    for(i = 0, j = 0; i < N; i++, j += 4) g[i] = (px[j] * 77 + px[j + 1] * 150 + px[j + 2] * 29) >> 8;
    /* paper brightness map: shrink, max-filter (ink disappears), blur, enlarge */
    var k = Math.max(1, Math.round(Math.max(w, h) / 220)), sw = Math.max(2, Math.ceil(w / k)), sh = Math.max(2, Math.ceil(h / k));
    var sm = new Uint8Array(sw * sh), a, b, r;
    for(b = 0; b < sh; b++) for(a = 0; a < sw; a++){ var mx = 0; for(var yy = 0; yy < k; yy++) for(var xx = 0; xx < k; xx++){ var X = a * k + xx, Y = b * k + yy; if(X < w && Y < h){ var v = g[Y * w + X]; if(v > mx) mx = v; } } sm[b * sw + a] = mx; }
    r = Math.max(2, Math.round(Math.min(sw, sh) / 10));
    function sep(src, fn){ var t1 = new Float32Array(sw * sh), o = new Float32Array(sw * sh);
      for(b = 0; b < sh; b++) for(a = 0; a < sw; a++) t1[b * sw + a] = fn(src, b * sw, a, sw, 1);
      for(b = 0; b < sh; b++) for(a = 0; a < sw; a++) o[b * sw + a] = fn(t1, a, b, sh, sw);
      return o; }
    function fmax(s_, base, pos, len, st){ var m = 0; for(var d = -r; d <= r; d++){ var q = pos + d; if(q < 0 || q >= len) continue; var v = s_[base + q * st]; if(v > m) m = v; } return m; }
    function fav(s_, base, pos, len, st){ var sum = 0, cnt = 0; for(var d = -r; d <= r; d++){ var q = pos + d; if(q < 0 || q >= len) continue; sum += s_[base + q * st]; cnt++; } return sum / cnt; }
    var dil = sep(sm, fmax), bgS = sep(dil, fav);
    var bc = document.createElement('canvas'); bc.width = sw; bc.height = sh;
    var bx = bc.getContext('2d'), bd = bx.createImageData(sw, sh);
    for(i = 0; i < sw * sh; i++){ var q = Math.max(1, Math.min(255, Math.round(bgS[i]))); bd.data[i * 4] = bd.data[i * 4 + 1] = bd.data[i * 4 + 2] = q; bd.data[i * 4 + 3] = 255; }
    bx.putImageData(bd, 0, 0);
    var fc = document.createElement('canvas'); fc.width = w; fc.height = h;
    var fx = fc.getContext('2d', { willReadFrequently: true }); fx.imageSmoothingEnabled = true; fx.drawImage(bc, 0, 0, w, h);
    var bg = fx.getImageData(0, 0, w, h).data, norm = new Uint8Array(N), hist = new Float64Array(256);
    for(i = 0, j = 0; i < N; i++, j += 4){ var nv = Math.min(255, Math.round(g[i] * 255 / Math.max(bg[j], 40))); norm[i] = nv; hist[nv]++; }
    /* Otsu threshold */
    var sumAll = 0, wB = 0, sumB = 0, best = -1, T = 128, t_;
    for(t_ = 0; t_ < 256; t_++) sumAll += t_ * hist[t_];
    for(t_ = 0; t_ < 256; t_++){ wB += hist[t_]; if(!wB) continue; var wF = N - wB; if(!wF) break; sumB += t_ * hist[t_]; var mB = sumB / wB, mF = (sumAll - sumB) / wF, bv = wB * wF * (mB - mF) * (mB - mF); if(bv > best){ best = bv; T = t_; } }
    T = Math.max(80, Math.min(215, T));
    /* ink mask without the photo's border (shadows), tiny specks removed */
    var mk = new Uint8Array(N), mx_ = Math.round(w * 0.025), my_ = Math.round(h * 0.025), yy2, xx2;
    for(yy2 = my_; yy2 < h - my_; yy2++) for(xx2 = mx_; xx2 < w - mx_; xx2++) if(norm[yy2 * w + xx2] < T) mk[yy2 * w + xx2] = 1;
    var lab = new Int32Array(N), areas = [0], stack = new Int32Array(N), nl = 0, total = 0;
    for(i = 0; i < N; i++){ if(!mk[i] || lab[i]) continue; nl++; var sp = 0, ar = 0; stack[sp++] = i; lab[i] = nl;
      while(sp){ var p = stack[--sp]; ar++; var px_ = p % w, py_ = (p / w) | 0;
        for(var dy = -1; dy <= 1; dy++) for(var dx = -1; dx <= 1; dx++){ if(!dx && !dy) continue; var nx = px_ + dx, ny = py_ + dy; if(nx < 0 || ny < 0 || nx >= w || ny >= h) continue; var np = ny * w + nx; if(mk[np] && !lab[np]){ lab[np] = nl; stack[sp++] = np; } } }
      areas.push(ar); total += ar; }
    var minA = Math.max(10, total * 0.0015), keep = new Uint8Array(N);
    for(i = 0; i < N; i++) if(mk[i] && areas[lab[i]] >= minA) keep[i] = 1;
    var kd = new Uint8Array(N), tmp = new Uint8Array(N), R2 = 2;
    for(yy2 = 0; yy2 < h; yy2++) for(xx2 = 0; xx2 < w; xx2++){ var on = 0; for(var d2 = -R2; d2 <= R2 && !on; d2++){ var q2 = xx2 + d2; if(q2 >= 0 && q2 < w && keep[yy2 * w + q2]) on = 1; } tmp[yy2 * w + xx2] = on; }
    for(yy2 = 0; yy2 < h; yy2++) for(xx2 = 0; xx2 < w; xx2++){ var on2 = 0; for(var d3 = -R2; d3 <= R2 && !on2; d3++){ var q3 = yy2 + d3; if(q3 >= 0 && q3 < h && tmp[q3 * w + xx2]) on2 = 1; } kd[yy2 * w + xx2] = on2; }
    /* ink colour = average of the sure-ink pixels (black stays black, blue stays blue) */
    var rs = 0, gs = 0, bs = 0, cn = 0;
    for(i = 0, j = 0; i < N; i++, j += 4) if(keep[i] && norm[i] < T - 15){ rs += px[j]; gs += px[j + 1]; bs += px[j + 2]; cn++; }
    var col = [20, 20, 24];
    if(cn > 20){ rs /= cn; gs /= cn; bs /= cn; var sat = Math.max(rs, gs, bs) - Math.min(rs, gs, bs); if(sat > 28){ var f = 0.8; col = [Math.round(rs * f), Math.round(gs * f), Math.round(bs * f)]; } }
    P.norm = norm; P.kd = kd; P.T = T; P.col = col; P.keep = keep;
    /* auto level: rotate so the strokes line up horizontally (projection profile) */
    var pts = [], stp = Math.max(1, Math.round(total / 15000));
    for(i = 0, j = 0; i < N; i += stp) if(keep[i]) pts.push(i);
    P.angle = 0;
    if(pts.length > 200){
      var cxm = w / 2, cym = h / 2, bins = new Float64Array(Math.ceil(Math.hypot(w, h)) + 4), off = bins.length / 2;
      var score = function(deg){ var rad = deg * Math.PI / 180, cs = Math.cos(rad), sn = Math.sin(rad); bins.fill(0);
        for(var m = 0; m < pts.length; m++){ var X = pts[m] % w - cxm, Y = ((pts[m] / w) | 0) - cym; bins[Math.round(X * sn + Y * cs + off)]++; }
        var sc2 = 0; for(var u = 0; u < bins.length; u++) sc2 += bins[u] * bins[u]; return sc2; };
      var s0 = score(0), bestA = 0, bestS = s0, dd;
      for(dd = -30; dd <= 30; dd += 0.5){ var sv = score(dd); if(sv > bestS){ bestS = sv; bestA = dd; } }
      for(dd = bestA - 0.5; dd <= bestA + 0.5; dd += 0.1){ var sv2 = score(dd); if(sv2 > bestS){ bestS = sv2; bestA = dd; } }
      if(bestS > s0 * 1.03) P.angle = Math.round(bestA * 2) / 2;
    }
    return P;
  }
  /* turn the prepared photo into a cropped transparent signature canvas */
  function sigRender(P, angle, adj, remove){
    var w = P.w, h = P.h, c = document.createElement('canvas'), x, i, j;
    c.width = w; c.height = h; x = c.getContext('2d', { willReadFrequently: true });
    if(P.hasAlpha || !remove){ x.drawImage(P.orig, 0, 0); }
    else {
      var id = x.createImageData(w, h), d = id.data, thi = Math.max(110, Math.min(250, P.T + 20 + adj)), tlo = Math.max(0, thi - 70);
      for(i = 0, j = 0; i < w * h; i++, j += 4){
        d[j] = P.col[0]; d[j + 1] = P.col[1]; d[j + 2] = P.col[2];
        var a = P.kd[i] ? Math.max(0, Math.min(1, (thi - P.norm[i]) / (thi - tlo))) : 0;
        d[j + 3] = Math.round(a * 255);
      }
      x.putImageData(id, 0, 0);
    }
    var rad = angle * Math.PI / 180, cs = Math.abs(Math.cos(rad)), sn = Math.abs(Math.sin(rad));
    var W2 = Math.ceil(w * cs + h * sn), H2 = Math.ceil(w * sn + h * cs);
    var rc = document.createElement('canvas'); rc.width = W2; rc.height = H2;
    var rx = rc.getContext('2d', { willReadFrequently: true });
    var opaque = !P.hasAlpha && !remove;
    if(opaque){ rx.fillStyle = '#fff'; rx.fillRect(0, 0, W2, H2); }
    rx.translate(W2 / 2, H2 / 2); rx.rotate(rad); rx.drawImage(c, -w / 2, -h / 2);
    var dt = rx.getImageData(0, 0, W2, H2).data, x0 = W2, y0 = H2, x1 = -1, y1 = -1, yy, xx;
    var white = opaque;
    for(yy = 0; yy < H2; yy++) for(xx = 0; xx < W2; xx++){
      var q = (yy * W2 + xx) * 4, on = white ? (dt[q + 3] > 0 && (dt[q] < 235 || dt[q + 1] < 235 || dt[q + 2] < 235)) : dt[q + 3] > 14;
      if(on){ if(xx < x0) x0 = xx; if(xx > x1) x1 = xx; if(yy < y0) y0 = yy; if(yy > y1) y1 = yy; }
    }
    if(x1 < 0){ x0 = 0; y0 = 0; x1 = W2 - 1; y1 = H2 - 1; }
    var pad = 3; x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(W2 - 1, x1 + pad); y1 = Math.min(H2 - 1, y1 + pad);
    var cw = x1 - x0 + 1, ch = y1 - y0 + 1, sc = Math.min(1, 800 / cw, 300 / ch);
    var oc = document.createElement('canvas'); oc.width = Math.max(1, Math.round(cw * sc)); oc.height = Math.max(1, Math.round(ch * sc));
    var ox = oc.getContext('2d'); ox.imageSmoothingQuality = 'high'; ox.drawImage(rc, x0, y0, cw, ch, 0, 0, oc.width, oc.height);
    return oc;
  }
  function sigFlow(ov, done){
    var d = dlg(ov, '<h3>✍️ সিগনেচার</h3><div class="hint">সাদা কাগজে সই করে ক্যামেরায় তুলুন, অথবা PNG / JPG ইমপোর্ট করুন। কাগজের ব্যাকগ্রাউন্ড বাদ দিয়ে শুধু সিগনেচার নেওয়া হবে এবং বাঁকা থাকলে সোজা করা হবে।</div>' +
      '<div class="col"><button class="go" id="sgCam">📷 ক্যামেরা দিয়ে তুলুন</button><button id="sgFile">🖼️ PNG / JPG ইমপোর্ট</button>' + (sig ? '<button id="sgDel">🗑️ সিগনেচার মুছুন</button>' : '') + '<button id="sgC">বাতিল</button></div>' +
      '<input type="file" id="sgI1" accept="image/*" capture="environment" hidden><input type="file" id="sgI2" accept="image/png,image/jpeg,image/*" hidden>');
    d.querySelector('#sgC').onclick = function(){ d.remove(); };
    d.querySelector('#sgCam').onclick = function(){ d.querySelector('#sgI1').click(); };
    d.querySelector('#sgFile').onclick = function(){ d.querySelector('#sgI2').click(); };
    var del = d.querySelector('#sgDel');
    if(del) del.onclick = function(){ sig = ''; try{ localStorage.removeItem(SIGKEY); }catch(e){} d.remove(); done(); };
    function got(e){
      var f = e.target.files && e.target.files[0]; if(!f) return;
      var u = URL.createObjectURL(f), im = new Image();
      im.onload = function(){
        URL.revokeObjectURL(u);
        var P; try{ P = sigPrep(im); }catch(err){ alert('ছবি প্রসেস করা যায়নি।'); return; }
        d.remove(); sigEdit(ov, P, done);
      };
      im.onerror = function(){ URL.revokeObjectURL(u); alert('ছবি পড়া যায়নি। PNG বা JPG দিন।'); };
      im.src = u;
    }
    d.querySelector('#sgI1').onchange = got; d.querySelector('#sgI2').onchange = got;
  }
  function sigEdit(ov, P, done){
    var d = dlg(ov, '<h3>✍️ সিগনেচার ঠিক করুন</h3><div class="pv"><canvas id="sgCv"></canvas></div>' +
      '<div class="lb"><span>↻ ঘোরান (লেভেল)</span><span id="sgAv"></span></div><input type="range" id="sgA" min="-45" max="45" step="0.5">' +
      (P.hasAlpha ? '' : '<div class="lb"><span>◐ গাঢ়তা</span></div><input type="range" id="sgT" min="-40" max="40" step="1" value="0"><label class="ck"><input type="checkbox" id="sgRm" checked> কাগজের ব্যাকগ্রাউন্ড মুছুন</label>') +
      '<div class="col"><button class="go" id="sgOk">✔ ব্যবহার করুন</button><button id="sgX">বাতিল</button></div>');
    var A = d.querySelector('#sgA'), Tt = d.querySelector('#sgT'), Rm = d.querySelector('#sgRm'), cv = d.querySelector('#sgCv'), av = d.querySelector('#sgAv'), cur = null, tm = 0;
    A.value = P.angle;
    function draw(){
      var ang = parseFloat(A.value) || 0; av.textContent = ang.toFixed(1) + '°';
      cur = sigRender(P, ang, Tt ? parseFloat(Tt.value) : 0, Rm ? Rm.checked : false);
      cv.width = cur.width; cv.height = cur.height; cv.getContext('2d').drawImage(cur, 0, 0);
    }
    function later(){ clearTimeout(tm); tm = setTimeout(draw, 60); }
    A.oninput = later; if(Tt) Tt.oninput = later; if(Rm) Rm.onchange = draw;
    draw();
    d.querySelector('#sgX').onclick = function(){ d.remove(); };
    d.querySelector('#sgOk').onclick = function(){
      draw();
      try{ sig = cur.toDataURL('image/png'); }catch(e){ alert('সিগনেচার সেভ করা যায়নি।'); return; }
      try{ localStorage.setItem(SIGKEY, sig); }catch(e){}
      d.remove(); done();
    };
  }

  function dlg(ov, html){
    var d = document.createElement('div'); d.className = 'sl-dlg';
    d.innerHTML = '<div class="sl-dbox">' + html + '</div>'; ov.appendChild(d); return d;
  }

  /* Print: offer the Legal PDF first, then the print dialog */
  function printDialog(ov){
    var d = dlg(ov, '<h3>🖨️ প্রিন্ট</h3><div class="hint">প্রিন্টের আগে ফর্মটি <b>Legal size (8.5×14 in)</b> PDF হিসেবে সবচেয়ে ভালো কোয়ালিটিতে (600 dpi) সেভ করে নিতে পারেন।</div>' +
      '<div class="col"><button class="go" id="sdS">💾 PDF সেভ করে প্রিন্ট করুন</button><button id="sdP">🖨️ PDF ছাড়া সরাসরি প্রিন্ট</button><button id="sdC">বাতিল</button></div>');
    d.querySelector('#sdC').onclick = function(){ d.remove(); };
    d.querySelector('#sdP').onclick = function(){ d.remove(); doPrint(); };
    d.querySelector('#sdS').onclick = function(){ d.remove(); pdfFlow(ov, true); };
  }
  function pdfFlow(ov, thenPrint, paper){
    var d = dlg(ov, '<h3>💾 PDF তৈরি হচ্ছে…</h3><div class="hint" id="sdMsg">Legal size · 600 dpi — একটু সময় লাগবে, অপেক্ষা করুন।</div><div class="sl-bar"><i id="sdBar"></i></div>');
    var msg = d.querySelector('#sdMsg'), bar = d.querySelector('#sdBar');
    exportPdf(function(i, n, dpi){ bar.style.width = Math.round(i / n * 100) + '%'; msg.textContent = (paper === 'a4' ? 'A4 size · ' : 'Legal size · ') + dpi + ' dpi — ' + i + '/' + n; },
      function(blob){
        saveBlob(blob, fileName(paper));
        if(thenPrint){ d.querySelector('h3').textContent = '✅ PDF সেভ হয়েছে'; msg.textContent = 'এখন প্রিন্ট ডায়ালগ খুলছে…'; setTimeout(function(){ d.remove(); doPrint(); }, 1000); }
        else { d.querySelector('h3').textContent = '✅ PDF সেভ হয়েছে'; msg.innerHTML = esc(fileName(paper)) + ' (' + (blob.size / 1048576).toFixed(1) + ' MB)<div class="col"><button class="go" id="sdOk">ঠিক আছে</button></div>'; d.querySelector('#sdOk').onclick = function(){ d.remove(); }; }
      },
      function(){
        d.querySelector('h3').textContent = '⚠️ PDF তৈরি করা যায়নি';
        msg.innerHTML = 'এই ডিভাইসে PDF বানানো গেল না।' + (thenPrint ? ' চাইলে সরাসরি প্রিন্ট করুন।' : '') + '<div class="col">' + (thenPrint ? '<button class="go" id="sdPr">🖨️ প্রিন্ট করুন</button>' : '') + '<button id="sdCl">বন্ধ করুন</button></div>';
        var pr = d.querySelector('#sdPr'); if(pr) pr.onclick = function(){ d.remove(); doPrint(); };
        d.querySelector('#sdCl').onclick = function(){ d.remove(); };
      }, paper);
  }

  function doPrint(){
    var f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(f);
    var d = f.contentWindow.document; d.open();
    d.write('<!doctype html><html><head><meta charset="utf-8"><title>' + esc(fileName().replace(/\.pdf$/, '')) + '</title><style>@page{size:8.5in 14in;margin:0}html,body{margin:0;padding:0;background:#fff}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}' + PAGE_CSS + '</style></head><body>' + build(false) + '</body></html>');
    d.close();
    setTimeout(function(){ try{ f.contentWindow.focus(); f.contentWindow.print(); }catch(e){} setTimeout(function(){ f.remove(); }, 60000); }, 600);
  }

  function fileName(paper){
    var rawNm = nameIdx >= 0 ? state[nameIdx] : '';
    var nm = rawNm ? String(rawNm).replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/[\\\/:*?"<>|]+/g, '').trim().replace(/\s+/g, '-') : '';
    return 'Salary-Fixation' + (nm ? '-' + nm : '') + (paper === 'a4' ? '-A4' : '') + '.pdf';
  }
  function saveBlob(blob, name){
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(a.href); }, 8000);
  }

  /* ---------- PDF: the same layout rendered in 2-inch bands (so even 600 dpi never needs a giant canvas), JPEG quality 100 ---------- */
  function exportPdf(prog, done, fail, paper){
    var ladder = paper === 'a4' ? [1200, 900, 600, 450, 300] : [600, 450, 300], li = 0;
    (function attempt(){
      var dpi = ladder[li];
      renderBands(dpi, prog, function(bands, dim){ done(buildPdf(bands, dim, paper)); }, function(){ if(++li < ladder.length) attempt(); else fail(); });
    })();
  }
  function renderBands(dpi, prog, ok, bad){
    var scale = dpi / 96, BAND = 192, OVL = 4, N = Math.ceil(PH / BAND);
    var W = Math.round(PW * scale), Hd = Math.round((BAND + OVL) * scale), vbH = Hd / scale;
    var host = document.createElement('div'); host.innerHTML = '<style>' + PAGE_CSS + '</style>' + build(false);
    var xml = new XMLSerializer().serializeToString(host), bands = [];
    function one(i){
      if(i >= N){ ok(bands, { W: W, Hd: Hd, vbH: vbH, BAND: BAND, N: N }); return; }
      prog(i, N, dpi);
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + Hd + '" viewBox="0 ' + (i * BAND) + ' ' + PW + ' ' + vbH + '">' +
        '<foreignObject x="0" y="0" width="' + PW + '" height="' + PH + '">' + xml + '</foreignObject></svg>';
      var img = new Image();
      img.onload = function(){
        try{
          var c = document.createElement('canvas'); c.width = W; c.height = Hd;
          var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, Hd); x.drawImage(img, 0, 0, W, Hd);
          c.toBlob(function(b){
            c.width = c.height = 0;
            if(!b){ bad(); return; }
            var fr = new FileReader();
            fr.onload = function(){ bands.push(new Uint8Array(fr.result)); setTimeout(function(){ one(i + 1); }, 0); };
            fr.onerror = bad; fr.readAsArrayBuffer(b);
          }, 'image/jpeg', 1.0);
        }catch(e){ bad(); }
      };
      img.onerror = bad;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
    one(0);
  }
  function buildPdf(bands, m, paper){
    var enc = new TextEncoder(), parts = [], off = 0, xr = [], N = bands.length;
    function add(x){ var u = typeof x === 'string' ? enc.encode(x) : x; parts.push(u); off += u.length; }
    function obj(n, b){ xr[n] = off; add(n + ' 0 obj\n'); add(b); add('\nendobj\n'); }
    var A4 = paper === 'a4', K = A4 ? 841.89 / 1008 : 1, PWp = A4 ? 595.28 : 612, PHp = A4 ? 841.89 : 1008;
    var hPt = m.Hd / m.W * 612 * K, xo = '';
    for(var i = 0; i < N; i++) xo += '/Im' + i + ' ' + (4 + i) + ' 0 R ';
    add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PWp + ' ' + PHp + '] /Resources << /XObject << ' + xo + '>> >> /Contents ' + (4 + N) + ' 0 R >>');
    for(i = 0; i < N; i++){
      xr[4 + i] = off;
      add((4 + i) + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + m.W + ' /Height ' + m.Hd + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + bands[i].length + ' >>\nstream\n');
      add(bands[i]); add('\nendstream\nendobj\n');
    }
    var cs = '';
    for(i = 0; i < N; i++) cs += 'q ' + (612 * K).toFixed(4) + ' 0 0 ' + hPt.toFixed(4) + ' ' + ((PWp - 612 * K) / 2).toFixed(4) + ' ' + (PHp - i * m.BAND * 0.75 * K - hPt).toFixed(4) + ' cm /Im' + i + ' Do Q\n';
    obj(4 + N, '<< /Length ' + cs.length + ' >>\nstream\n' + cs + 'endstream');
    var xs = off, cnt = 5 + N;
    add('xref\n0 ' + cnt + '\n0000000000 65535 f \n');
    for(i = 1; i < cnt; i++) add(('0000000000' + xr[i]).slice(-10) + ' 00000 n \n');
    add('trailer\n<< /Size ' + cnt + ' /Root 1 0 R >>\nstartxref\n' + xs + '\n%%EOF');
    return new Blob(parts, { type: 'application/pdf' });
  }

  window.hsiaOpenSalary = open;
})();
