/* forms/imgform.js \u2014 editable image forms: \u0985\u09b0\u09cd\u099c\u09bf\u09a4 \u099b\u09c1\u099f\u09bf\u09b0 \u0986\u09ac\u09c7\u09a6\u09a8 (CSC-2/A) and \u09ac\u09bf\u09a6\u09c7\u09b6 \u09ad\u09cd\u09b0\u09ae\u09a3\u09c7\u09b0 \u0986\u09ac\u09c7\u09a6\u09a8 (CA/Pro-3).
   The pages are the ORIGINAL forms as 600 dpi black-and-white A4 pictures (forms/f_*.png). The person taps on a line / after a colon and types; the text is
   written on top at the same position. Export (PNG / JPG / PDF / DOCX) renders every page at 600 dpi (300 dpi on iPhone, whose canvas cannot be that big). */
(function(){
var PW=4960, PH=7016;
var FORMS={
  earned:{ title:'\u0985\u09b0\u09cd\u099c\u09bf\u09a4 \u099b\u09c1\u099f\u09bf\u09b0 \u0986\u09ac\u09c7\u09a6\u09a8 (CSC-2/A)', file:'earned-leave-form', pages:['earned_1','earned_2'] },
  abroad:{ title:'\u09ac\u09bf\u09a6\u09c7\u09b6 \u09ad\u09cd\u09b0\u09ae\u09a3\u09c7\u09b0 \u0986\u09ac\u09c7\u09a6\u09a8 (CA/Pro-3)', file:'foreign-travel-form', pages:['abroad_1','abroad_2','abroad_3'] }
};
var SN={"earned_1":{"b":[[2404,1911,2537,2028],[3184,1919,3317,2036],[3899,1921,4033,2038],[2401,2060,2534,2177],[3188,2050,3322,2167],[3904,2055,4037,2172],[2404,2204,2537,2321],[2406,2828,2540,2946],[3526,2843,3659,2960]],"l":[[2284,3448,651],[2459,4384,1232],[2458,4384,1386],[2458,2634,1538],[2732,3348,1538],[3496,3793,1538],[3940,4190,1538],[2458,4384,1692],[2458,4384,1843],[3273,4436,2280],[2450,2943,2459],[3146,3642,2459],[3884,4206,2459],[2459,4384,2610],[2458,4384,2761],[2458,4384,3353],[2458,4384,3504],[2458,4384,3651],[2458,4384,3802],[2458,4384,3953],[2459,4384,4104],[2466,3062,5471],[3456,4024,5471],[2462,3606,5622],[3801,4274,5622],[2462,2908,5800],[3138,3606,5800],[3801,4274,5800],[2462,2908,5976],[3138,3606,5976],[3801,4274,5976]],"k":[[2360,724],[2328,1228],[2328,1382],[2328,1534],[2328,1688],[2328,1840],[2328,2455],[2328,2606],[2328,2757],[2328,3349],[2328,3798],[2328,3949],[2328,4100],[2328,4518],[2328,4632],[2328,4792],[2328,5141],[2328,5256],[2328,5467],[2328,5618],[2328,5796],[2328,5972],[2328,6322],[2328,6440]]},"earned_2":{"l":[[1334,3064,2760],[3490,4358,2760],[1240,3046,2946],[976,3052,3096],[976,3052,3246]],"k":[[2330,740],[2330,1326],[2330,1442],[2330,1598],[2330,2180],[2330,2298]]},"abroad_1":{"l":[],"k":[[2654,702],[2654,892],[2654,1110],[2654,1308],[2654,1506],[2654,1734],[2654,1942],[2654,2140],[2654,2348],[2654,2802],[2654,3142],[2654,4466]]},"abroad_2":{"l":[[785,2385,5100],[2728,4553,5100],[776,2376,5278],[2538,3688,5278],[885,1535,6158],[885,1535,6747]],"k":[[2732,756],[2732,944],[2732,1133],[2732,1321],[2732,2075],[2730,3018],[2732,3206],[2732,3395],[2732,3584],[2732,3772],[2732,3960],[2732,4150],[2732,4338]]},"abroad_3":{"l":[],"k":[],"c":[[986,2442],[2445,3100],[3102,3829],[3832,4594]]}};
var ROWS3=[[999,1664],[1667,2330],[2333,2997],[2999,3664],[3667,4330]];
var FONT='"Noto Sans Bengali","Hind Siliguri","Nirmala UI","Bangla Sangam MN","Kohinoor Bangla",Arial,sans-serif';
var S=null, root=null, imgs={};
function $(id){ return document.getElementById(id); }
function save(){ try{ localStorage.setItem('hsia_if_'+S.key, JSON.stringify({ items:S.items, size:S.size })); }catch(e){} }
function css(){
  if($('hifCss')) return;
  var st=document.createElement('style'); st.id='hifCss';
  st.textContent='.hif{position:fixed;inset:0;z-index:10040;background:#030202;color:#F0F1F3;display:flex;flex-direction:column;font:14px/1.4 Inter,system-ui,sans-serif}'
  +'.hif button{font:inherit;font-family:"Space Grotesk",Inter,sans-serif;cursor:pointer;color:#F0F1F3;background:#262525;border:1px solid #454444;border-radius:10px;padding:7px 11px;font-weight:600}'
  +'.hif button.on{background:linear-gradient(135deg,#A9AEB8,#DADCE0);color:#14151a;border-color:#d6d8dc}'
  +'.hif-top,.hif-tools{display:flex;align-items:center;gap:6px;padding:8px 10px;flex-wrap:wrap;border-bottom:1px solid #454444;background:#171616}.hif-top b{flex:1;min-width:120px;font-size:13px}'
  +'.hif-body{flex:1;overflow:auto;background:#262525;padding:8px;-webkit-overflow-scrolling:touch}.hif-page{position:relative;margin:0 auto 14px;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,.5)}'
  +'.hif-page canvas{display:block;width:100%;height:100%;pointer-events:none}.hi{position:absolute;white-space:pre;color:#0a1f8f;line-height:1;cursor:text;font-family:'+FONT+'}'
  +'.hi.c{color:#0a1f8f;font-weight:700}.hif input.hie{position:absolute;border:0;border-bottom:2px solid #1a5fd0;background:rgba(255,255,160,.45);color:#000;padding:0;margin:0;outline:0;font-family:'+FONT+'}'
  +'.hif .w path{fill:#262525;stroke:#454444;stroke-width:1.5;cursor:pointer}.hif .w g.on path,.hif .w g:active path{fill:#A9AEB8}.hif .w text{fill:#F0F1F3;font:700 15px "Space Grotesk",Inter,sans-serif;text-anchor:middle;dominant-baseline:middle;pointer-events:none}'
  +'.hif .w g.on text,.hif .w g:active text{fill:#14151a}.hif .w .ctr{fill:#030202;stroke:#454444}.hif .ov{position:fixed;inset:0;z-index:5;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;flex-direction:column}';
  document.head.appendChild(st);
  if(!$('hifFont')){ var l=document.createElement('link'); l.id='hifFont'; l.rel='stylesheet'; l.href='https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;700&display=swap'; document.head.appendChild(l); }
}
function kScale(){ return S.w/PW; }
function updPg(){
  var body=$('hifBody'), br=body.getBoundingClientRect(), idx=0;
  S.pages.forEach(function(_,i){ var el=$('hifPage'+i); if(el && el.getBoundingClientRect().top-br.top<=br.height*.4) idx=i; });
  S.pg=idx; $('hifPg').textContent=(idx+1)+' / '+S.pages.length;
}
function render(){
  var body=$('hifBody'), ratio=body.scrollHeight?body.scrollTop/body.scrollHeight:0;
  S.w=Math.round((body.clientWidth-16)*S.z); var k=kScale(), h=Math.round(S.w*PH/PW);
  $('hifZ').textContent=Math.round(S.z*100)+'%';
  S.pages.forEach(function(pg,pi){
    var page=$('hifPage'+pi); page.style.width=S.w+'px'; page.style.height=h+'px';
    paintBg(pi);
    page.querySelectorAll('.hi,.hie').forEach(function(n){ n.remove(); });
    (S.items[pg]||[]).forEach(function(it,i){
      var d=document.createElement('div'); d.className='hi'+(it.t==='c'?' c':''); d.textContent=it.t==='c'?'\u2714':it.v; d.dataset.i=i;
      var fs=S.size*k; d.style.fontSize=fs+'px'; d.style.left=(it.x*k)+'px'; d.style.top=(it.y*k-fs*.82)+'px'; if(it.t==='c'){ d.style.left=(it.x*k-fs*.45)+'px'; d.style.top=(it.y*k-fs*.6)+'px'; }
      page.appendChild(d);
    });
  });
  body.scrollTop=ratio*body.scrollHeight; updPg();
}
/* every page picture is drawn into its own canvas, one after another (keeps phone memory low); shrunk in steps of two with smoothing so thin strokes survive */
var paintQ=Promise.resolve();
function paintBg(pi){
  var pg=S.pages[pi], cv=$('hifImg'+pi), dpr=Math.min(window.devicePixelRatio||1,3), tw=Math.min(2600,Math.round(S.w*dpr)), th=Math.round(tw*PH/PW), tok=(S.tok[pi]=(S.tok[pi]||0)+1);
  if(S.bgKey[pi]===tw) return;
  paintQ=paintQ.then(function(){ if(tok!==S.tok[pi]) return; return loadImg(pg).then(function(im){
    if(tok!==S.tok[pi]){ delete imgs[pg]; return; } var cur=im;
    while(cur.width/2>=tw){ var h=document.createElement('canvas'); h.width=Math.round(cur.width/2); h.height=Math.round(cur.height/2); var g=h.getContext('2d'); g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high'; g.drawImage(cur,0,0,h.width,h.height); cur=h; }
    cv.width=tw; cv.height=th; var c=cv.getContext('2d'); c.imageSmoothingEnabled=true; c.imageSmoothingQuality='high'; c.fillStyle='#fff'; c.fillRect(0,0,tw,th); c.drawImage(cur,0,0,tw,th); S.bgKey[pi]=tw; delete imgs[pg];
  }); }).catch(function(){});
}
/* merge dotted-line pieces of ONE row that are only a few pixels apart (a dotted line detected in fragments) */
function mergedLines(L){
  var out=[]; L.slice().sort(function(a,b){ return a[2]-b[2]||a[0]-b[0]; }).forEach(function(l){
    var p=out[out.length-1]; if(p && Math.abs(p[2]-l[2])<8 && l[0]-p[1]<160){ p[1]=Math.max(p[1],l[1]); } else out.push([l[0],l[1],l[2]]);
  }); return out;
}
/* typing is allowed ONLY on a blank field, and the text always starts at the beginning of that field (just after the colon / at the start of the dotted line) */
function snap(x,y){
  var s=SN[S.pages[S.pg]]||{l:[],k:[]}, best=null, bd=1e9, i, d, Ls=mergedLines(s.l);
  for(i=0;i<Ls.length;i++){ var L=Ls[i]; d=y-L[2]; if(d>=-105 && d<=30 && Math.abs(d)<bd && x>L[0]-60 && x<L[1]+60){ bd=Math.abs(d); best={x:L[0]+8,y:L[2]-10,w:L[1]-L[0]-12}; } }
  if(best) return best;
  bd=1e9; for(i=0;i<s.k.length;i++){ var K=s.k[i]; d=y-K[1]; if(d>=-85 && d<=40 && Math.abs(d)<bd && x>K[0]){ bd=Math.abs(d); best={x:K[0]+70,y:K[1]+8,w:4420-(K[0]+70)}; } }
  if(best) return best;
  if(s.c){ var cy=null, cx=null, j;
    for(j=0;j<ROWS3.length;j++) if(y>=ROWS3[j][0]&&y<=ROWS3[j][1]) cy=ROWS3[j];
    for(j=0;j<s.c.length;j++) if(x>=s.c[j][0]&&x<=s.c[j][1]) cx=s.c[j];
    if(cy&&cx) return {x:cx[0]+30, w:cx[1]-cx[0]-60, y:Math.min(Math.max(y+S.size*.3,cy[0]+S.size*1.1),cy[1]-30)};
  }
  return null;
}
function edit(it,isNew){
  var pi=S.pg, pg=S.pages[pi], page=$('hifPage'+pi), k=kScale(), fs=S.size*k, inp=document.createElement('input');
  inp.className='hie'; inp.value=it.v||''; inp.style.fontSize=fs+'px'; inp.style.left=(it.x*k)+'px'; inp.style.top=(it.y*k-fs*.95)+'px'; inp.style.height=(fs*1.25)+'px'; var mw=it.w||(PW-it.x-60); inp.style.width=Math.max(30,mw*k)+'px';
  page.appendChild(inp); inp.focus();
  var mc=document.createElement('canvas').getContext('2d'); function fit(){ mc.font=S.size+'px '+FONT; var a=Array.from(inp.value); while(a.length&&mc.measureText(a.join('')).width>mw) a.pop(); var t=a.join(''); if(t!==inp.value) inp.value=t; }
  inp.addEventListener('input',function(e){ if(!e.isComposing) fit(); }); inp.addEventListener('compositionend',fit);
  function done(){
    fit();
    var v=inp.value.replace(/\s+$/,''); inp.remove(); var arr=S.items[pg]||(S.items[pg]=[]), at=arr.indexOf(it);
    if(!v){ if(at>=0) arr.splice(at,1); } else { it.v=v; if(at<0) arr.push(it); }
    save(); render();
  }
  inp.onblur=done; inp.onkeydown=function(e){ if(e.key==='Enter'){ inp.blur(); } };
}
function onPage(e){
  if(e.target.classList.contains('hie')) return;
  var pageEl=e.target.closest&&e.target.closest('.hif-page'); if(!pageEl) return;
  S.pg=+pageEl.dataset.pi; $('hifPg').textContent=(S.pg+1)+' / '+S.pages.length;
  var pg=S.pages[S.pg], r=pageEl.getBoundingClientRect(), k=kScale(), x=(e.clientX-r.left)/k, y=(e.clientY-r.top)/k, arr=S.items[pg]||(S.items[pg]=[]);
  var hit=e.target.closest&&e.target.closest('.hi');
  if(hit){ var it=arr[+hit.dataset.i]; if(!it) return; if(it.t==='c'){ arr.splice(+hit.dataset.i,1); save(); render(); } else { hit.remove(); edit(it); } return; }
  var bx=(SN[pg]||{}).b||[], bi=-1, q;
  for(q=0;q<bx.length;q++) if(x>=bx[q][0]-20&&x<=bx[q][2]+20&&y>=bx[q][1]-20&&y<=bx[q][3]+20){ bi=q; break; }
  if(bi>=0){ var at=-1; arr.forEach(function(m,j){ if(m.t==='c'&&m.b===bi) at=j; });
    if(at>=0) arr.splice(at,1); else arr.push({t:'c',b:bi,x:(bx[bi][0]+bx[bi][2])/2,y:(bx[bi][1]+bx[bi][3])/2+S.size*.25});
    save(); render(); return; }
  if(S.tool==='c'){ $('hifSt').textContent='\u099f\u09bf\u0995 \u09b6\u09c1\u09a7\u09c1 \u09ac\u0995\u09cd\u09b8\u09c7\u09b0 \u09ad\u09c7\u09a4\u09b0\u09c7 \u09a6\u09c7\u0993\u09af\u09bc\u09be \u09af\u09be\u09ac\u09c7\u0964'; return; }
  var p=snap(x,y); if(!p){ $('hifSt').textContent='\u098f\u0996\u09be\u09a8\u09c7 \u09b2\u09c7\u0996\u09be \u09af\u09be\u09ac\u09c7 \u09a8\u09be \u2014 \u09b2\u09be\u0987\u09a8 \u09ac\u09be \u0995\u09cb\u09b2\u09a8\u09c7\u09b0 \u09aa\u09b0\u09c7 \u099f\u09cd\u09af\u09be\u09aa \u0995\u09b0\u09c1\u09a8\u0964'; return; } var ex=null; arr.forEach(function(q){ if(q.t==='t'&&Math.abs(q.x-p.x)<6&&Math.abs(q.y-p.y)<40) ex=q; }); if(ex){ ex.w=p.w; var nd=pageEl.querySelector('.hi[data-i="'+arr.indexOf(ex)+'"]'); if(nd) nd.remove(); edit(ex); return; }
  edit({t:'t',x:p.x,y:p.y,v:'',w:p.w},true);
}
/* ---------- export ---------- */
function loadImg(pg){ return new Promise(function(res,rej){ if(imgs[pg]) return res(imgs[pg]); var im=new Image(); im.onload=function(){ imgs[pg]=im; res(im); }; im.onerror=rej; im.src='forms/f_'+pg+'.png'; }); }
function pageCanvas(pg,sc){
  return loadImg(pg).then(function(im){
    var c=document.createElement('canvas'); c.width=Math.round(PW*sc); c.height=Math.round(PH*sc); var g=c.getContext('2d');
    g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); g.imageSmoothingEnabled=false; g.drawImage(im,0,0,c.width,c.height); delete imgs[pg]; g.fillStyle='#000'; g.strokeStyle='#000'; g.textBaseline='alphabetic';
    (S.items[pg]||[]).forEach(function(it){
      if(it.t==='c'){ var s=S.size*sc; g.lineWidth=s*.11; g.lineCap='round'; g.lineJoin='round'; g.beginPath(); g.moveTo(it.x*sc-s*.4,it.y*sc-s*.25); g.lineTo(it.x*sc-s*.12,it.y*sc+s*.05); g.lineTo(it.x*sc+s*.42,it.y*sc-s*.55); g.stroke(); }
      else { g.font=Math.round(S.size*sc)+'px '+FONT; g.fillText(it.v,it.x*sc,it.y*sc); }
    });
    return c;
  });
}
function toBlob(c,t,q){ return new Promise(function(r){ c.toBlob(r,t,q); }); }
function flat(c){ return c; }
var CT_ZIP=(function(){var CT=(()=>{const t=[];for(let i=0;i<256;i++){let c=i;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[i]=c>>>0}return t})();
var crc=b=>{let c=-1;for(let i=0;i<b.length;i++)c=CT[(c^b[i])&255]^(c>>>8);return(c^-1)>>>0};
function zipBlob(files,type){const E=new TextEncoder(),out=[],cd=[];let off=0;
 for(const[name,data]of files){const nb=E.encode(name),d=typeof data==='string'?E.encode(data):data,c=crc(d),h=new DataView(new ArrayBuffer(30)),e=new DataView(new ArrayBuffer(46));
  h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(12,0x21,true);h.setUint32(14,c,true);h.setUint32(18,d.length,true);h.setUint32(22,d.length,true);h.setUint16(26,nb.length,true);out.push(h.buffer,nb,d);
  e.setUint32(0,0x02014b50,true);e.setUint16(4,20,true);e.setUint16(6,20,true);e.setUint16(14,0x21,true);e.setUint32(16,c,true);e.setUint32(20,d.length,true);e.setUint32(24,d.length,true);e.setUint16(28,nb.length,true);e.setUint32(42,off,true);cd.push(e.buffer,nb);off+=30+nb.length+d.length}
 const s=cd.reduce((a,b)=>a+b.byteLength,0),z=new DataView(new ArrayBuffer(22));z.setUint32(0,0x06054b50,true);z.setUint16(8,files.length,true);z.setUint16(10,files.length,true);z.setUint32(12,s,true);z.setUint32(16,off,true);
 return new Blob([...out,...cd,z.buffer],{type})}return zipBlob;})();
function pdfPages(js){
  var E=new TextEncoder(),P=[],off={},n=0,N=js.length; function add(x){ var b=typeof x==='string'?E.encode(x):x; P.push(b); n+=b.length; }
  function o(i,s){ off[i]=n; add(i+' 0 obj\n'+s+'\nendobj\n'); }
  add('%PDF-1.4\n'); o(1,'<</Type/Catalog/Pages 2 0 R>>'); o(2,'<</Type/Pages/Kids['+js.map(function(_,i){ return (3+3*i)+' 0 R'; }).join(' ')+']/Count '+N+'>>');
  js.forEach(function(p,i){ var a=3+3*i, cs='q 595.28 0 0 841.89 0 0 cm /Im0 Do Q';
    o(a,'<</Type/Page/Parent 2 0 R/MediaBox[0 0 595.28 841.89]/Resources<</XObject<</Im0 '+(a+1)+' 0 R>>>>/Contents '+(a+2)+' 0 R>>');
    off[a+1]=n; add((a+1)+' 0 obj\n<</Type/XObject/Subtype/Image/Width '+p.W+'/Height '+p.H+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length '+p.d.length+'>>\nstream\n'); add(p.d); add('\nendstream\nendobj\n');
    o(a+2,'<</Length '+cs.length+'>>\nstream\n'+cs+'\nendstream'); });
  var x=n,T=3+3*N, xr='xref\n0 '+T+'\n0000000000 65535 f \n'; for(var k=1;k<T;k++) xr+=String(off[k]).padStart(10,'0')+' 00000 n \n';
  add(xr+'trailer\n<</Size '+T+'/Root 1 0 R>>\nstartxref\n'+x+'\n%%EOF'); return new Blob(P,{type:'application/pdf'});
}
function docxPages(js){
  var R='http://schemas.openxmlformats.org/', X='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', cx=6645910, cy=Math.round(cx*PH/PW), body='', rels='', files=[];
  js.forEach(function(p,i){ var id=i+1;
    body+='<w:p><w:pPr>'+(i?'<w:pageBreakBefore/>':'')+'</w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="'+cx+'" cy="'+cy+'"/><wp:docPr id="'+id+'" name="Page'+id+'"/><a:graphic><a:graphicData uri="'+R+'drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="'+id+'" name="p'+id+'.jpg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId'+id+'"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+cx+'" cy="'+cy+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
    rels+='<Relationship Id="rId'+id+'" Type="'+R+'officeDocument/2006/relationships/image" Target="media/p'+id+'.jpg"/>'; files.push(['word/media/p'+id+'.jpg',p.d]); });
  var doc=X+'<w:document xmlns:w="'+R+'wordprocessingml/2006/main" xmlns:r="'+R+'officeDocument/2006/relationships" xmlns:wp="'+R+'drawingml/2006/wordprocessingDrawing" xmlns:a="'+R+'drawingml/2006/main" xmlns:pic="'+R+'drawingml/2006/picture"><w:body>'+body+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="360" w:right="720" w:bottom="360" w:left="720" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr></w:body></w:document>';
  return CT_ZIP([['[Content_Types].xml',X+'<Types xmlns="'+R+'package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
    ['_rels/.rels',X+'<Relationships xmlns="'+R+'package/2006/relationships"><Relationship Id="rId1" Type="'+R+'officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
    ['word/document.xml',doc],['word/_rels/document.xml.rels',X+'<Relationships xmlns="'+R+'package/2006/relationships">'+rels+'</Relationships>']].concat(files),'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}
function dl(b,name){ var a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(a.href); },8000); }
function exportAs(f,dpi){
  var sc=dpi/600, F=FORMS[S.key], st=$('hifSt'), name=F.file+'-'+new Date().toISOString().slice(0,10), mime=f==='PNG'?'image/png':'image/jpeg', jobs=[], out=[];
  if(document.fonts&&document.fonts.load){ try{ document.fonts.load('40px "Noto Sans Bengali"','\u0985\u0986\u0995'); }catch(e){} }
  st.textContent='Preparing '+f+' at '+dpi+' dpi\u2026';
  var chain=Promise.resolve();
  S.pages.forEach(function(pg,i){
    chain=chain.then(function(){ return pageCanvas(pg,sc); }).then(function(c){ return toBlob(c,mime,.93).then(function(b){ c.width=c.height=1; if(!b) throw new Error('canvas too large'); return b; }); })
      .then(function(b){ if(f==='PNG'||f==='JPG'){ dl(b,name+'-p'+(i+1)+(f==='PNG'?'.png':'.jpg')); st.textContent='Saved page '+(i+1)+' of '+S.pages.length+' \u00b7 '+(b.size/1024).toFixed(0)+' KB'; return new Promise(function(r){ setTimeout(r,700); }); }
        return b.arrayBuffer().then(function(ab){ out.push({d:new Uint8Array(ab),W:Math.round(PW*sc),H:Math.round(PH*sc)}); }); });
  });
  return chain.then(function(){
    if(f==='PDF'||f==='DOCX'){ var b=f==='PDF'?pdfPages(out):docxPages(out); dl(b,name+'.'+f.toLowerCase()); st.textContent='Saved '+name+'.'+f.toLowerCase()+' \u00b7 '+(b.size/1024).toFixed(0)+' KB \u00b7 '+dpi+' dpi'; }
  }).catch(function(e){
    if(dpi>300){ st.textContent='This phone could not make '+dpi+' dpi, trying 300 dpi\u2026'; return exportAs(f,300); }
    st.textContent='Export failed: '+(e&&e.message||e);
  });
}
function wheel(){
  var o=document.createElement('div'), FM=['PNG','JPG','PDF','DOCX'], s=''; o.className='ov';
  var sel=localStorage.getItem('T_FMT')||'PNG';
  FM.forEach(function(f,i){ var a=i*Math.PI/2-3*Math.PI/4, g=.07, m=a+Math.PI/4, tx=150+98*Math.cos(m), ty=150+98*Math.sin(m);
    s+='<g data-f="'+f+'" class="'+(f===sel?'on':'')+'"><path d="'+sector(58,138,a+g,a+Math.PI/2-g)+'"/><text x="'+tx.toFixed(1)+'" y="'+ty.toFixed(1)+'">'+f+'</text></g>'; });
  o.innerHTML='<div class="w"><svg viewBox="0 0 300 300" width="320" height="320"><circle cx="150" cy="150" r="146" fill="none" stroke="#454444"/>'+s+'<circle class="ctr" cx="150" cy="150" r="48"/><text x="150" y="150" id="hifCt" style="font-size:17px">'+sel+'</text></svg></div><button id="hifCl" style="margin-top:14px;min-width:160px">Close</button>';
  $('hif').appendChild(o);
  o.querySelectorAll('[data-f]').forEach(function(g){ g.onclick=function(){ var f=g.dataset.f; try{ localStorage.setItem('T_FMT',f); }catch(e){} o.remove(); exportAs(f,/iP(hone|ad|od)/.test(navigator.userAgent)?300:600); }; });
  $('hifCl').onclick=function(){ o.remove(); }; o.onclick=function(e){ if(e.target===o) o.remove(); };
}
var sector=function(r0,r1,a0,a1){const p=(r,a)=>[(150+r*Math.cos(a)).toFixed(1),(150+r*Math.sin(a)).toFixed(1)];const A=p(r1,a0),B=p(r1,a1),C=p(r0,a1),D=p(r0,a0);return`M${A}A${r1},${r1} 0 0 1 ${B}L${C}A${r0},${r0} 0 0 0 ${D}Z`};
function go(d){ var n=S.pg+d; if(n<0||n>=S.pages.length) return; var body=$('hifBody'), el=$('hifPage'+n); body.scrollTop+=el.getBoundingClientRect().top-body.getBoundingClientRect().top-8; updPg(); }
function zoom(d){ var z=[1,1.5,2,3,4], i=z.indexOf(S.z); i=Math.max(0,Math.min(z.length-1,i+d)); S.z=z[i]; render(); }
function close(){ if(root){ root.remove(); root=null; } }
window.hsiaOpenImgForm=function(key){
  var F=FORMS[key]; if(!F) return; css(); close();
  var saved=null; try{ saved=JSON.parse(localStorage.getItem('hsia_if_'+key)||'null'); }catch(e){}
  S={ key:key, pages:F.pages, pg:0, z:1, w:0, tok:{}, bgKey:{}, tool:'t', size:(saved&&saved.size)||92, items:(saved&&saved.items)||{} };
  root=document.createElement('div'); root.className='hif'; root.id='hif';
  root.innerHTML='<div class="hif-top"><b>'+F.title+'</b><button id="hifPv">\u25c0</button><span id="hifPg"></span><button id="hifNx">\u25b6</button><button id="hifEx" title="Export" style="background:#FFD9A0;color:#2a1a00;border-color:#FFD9A0">\u2b07</button><button id="hifX">\u2715</button></div>'
   +'<div class="hif-tools"><button id="hifT" class="on">T  Text</button><button id="hifC">\u2714 Mark</button><button id="hifZm">\u2212</button><span id="hifZ">100%</span><button id="hifZp">+</button><button id="hifFm">A\u2212</button><button id="hifFp">A+</button><button id="hifClr">Clear page</button></div>'
   +'<div class="hif-body" id="hifBody"></div><div id="hifSt" style="padding:6px 10px;font-size:12px;color:#8B909B;background:#171616;border-top:1px solid #454444">[imgform v7] Tap a line or the place after a colon, then type. Zoom with + / \u2212.</div>';
  document.body.appendChild(root);
  F.pages.forEach(function(_,i){ var d=document.createElement('div'); d.className='hif-page'; d.id='hifPage'+i; d.dataset.pi=i; d.innerHTML='<canvas id="hifImg'+i+'"></canvas>'; $('hifBody').appendChild(d); });
  $('hifX').onclick=close; $('hifPv').onclick=function(){ go(-1); }; $('hifNx').onclick=function(){ go(1); }; $('hifEx').onclick=wheel;
  $('hifT').onclick=function(){ S.tool='t'; $('hifT').classList.add('on'); $('hifC').classList.remove('on'); }; $('hifC').onclick=function(){ S.tool='c'; $('hifC').classList.add('on'); $('hifT').classList.remove('on'); };
  $('hifZm').onclick=function(){ zoom(-1); }; $('hifZp').onclick=function(){ zoom(1); };
  $('hifFm').onclick=function(){ S.size=Math.max(50,S.size-8); save(); render(); }; $('hifFp').onclick=function(){ S.size=Math.min(160,S.size+8); save(); render(); };
  $('hifClr').onclick=function(){ if(confirm('Clear everything written on this page?')){ S.items[S.pages[S.pg]]=[]; save(); render(); } };
  $('hifBody').addEventListener('click',onPage); $('hifBody').addEventListener('scroll',updPg,{passive:true});
  render();
};
})();
