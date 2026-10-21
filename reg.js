/* reg.js - mandatory login for HSIA ATM: trial gate, Google / EIN+password login, registration with photos, roster choice, admin approval.
   Data lives in Firebase (hsia_people/*, see the Rules). Add it to index.html with <script src="reg.js"></script>.
   DORMANT by default: nothing changes for anybody until the admin turns on "Mandatory login" in Settings (stored in Firebase hsia_public/config).
   Hard switch: window.HSIA_NEWLOGIN=false; before this script. */
(function(){
if(window.HSIA_NEWLOGIN===false) return;
var R, barEl, admEl, U=null, P=undefined, Pready=false, adm=false, busy=false, cur='', unsub=null;
var v='home', tab='p', f={}, np={}, db={fold:null,prof:{}}, pics={};
var TR=864e5, TM=['A','B','C','D','E'], OT=['OJTI','Standby','Regular (9-5, Fri-Sat off)','6 days a week','Other'];
var CFG=null, authKnown=false, epochBusy=false, ts=0;
function TK(){ return 'HSIA_TRIAL_'+((CFG&&CFG.epoch)||0); }
function on(){ return !!(CFG&&CFG.loginRequired); }
var DEF=[{id:'f1',n:'Controller',posts:[{id:'p1',n:'SATO'},{id:'p2',n:'DD'},{id:'p3',n:'AD'},{id:'p4',n:'Aerodrome Officer'}]},{id:'f2',n:'Aerodrome Assistant',posts:[{id:'p5',n:'Aerodrome Assistant'}]},{id:'f3',n:'Operator',posts:[{id:'p6',n:'Aerodrome Operator'},{id:'p7',n:'Radio Operator'}]},{id:'f4',n:'Traffic Hand & Marshaller',posts:[{id:'p8',n:'Traffic Hand'},{id:'p9',n:'Marshaller'}]}];
var $=function(s){ return R.querySelector(s); };
var esc=function(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
var dn=function(s){ return String(s||'').replace(/[\u09e6-\u09ef]/g,function(c){ return '\u09e6\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee\u09ef'.indexOf(c); }); };
var dName=function(id){ var g,p; for(g of (db.fold||[])) for(p of g.posts) if(p.id===id) return p.n; return ''; };
var man=function(u){ return !!((db.prof[u]||{}).man); };
var left=function(){ return TR-(Date.now()-ts); };
var hms=function(x){ x=Math.max(0,x)/1000|0; return [x/3600|0,x/60%60|0,x%60].map(function(n){ return String(n).padStart(2,'0'); }).join(':'); };
var tl=function(p){ return !p.team?'-':p.team==='O'?'Others'+(p.oth?' \u00b7 '+p.oth:''):'Team '+p.team+(p.pos?' \u00b7 '+p.pos:''); };
var ref=function(p){ return _fbDb.ref(p); };
var Q=Promise.resolve();
function W(fn){ Q=Q.then(fn).catch(function(e){ console.warn(e); alert('Could not save: '+((e&&e.message)||e)); }); return Q; }
function sv(k,x){ if(x===db&&db.fold) W(function(){ return ref('hsia_people/folders').set(db.fold); }); return 1; }
function loadPics(u){ return ref('hsia_people/pics/'+u).once('value').then(function(s){ pics[u]=s.val()||{}; }).catch(function(){ pics[u]=pics[u]||{}; }); }
function loadAll(){ return ref('hsia_people/profiles').once('value').then(function(s){ db.prof=s.val()||{}; }); }
function normFold(x){ var a=Array.isArray(x)?x:Object.keys(x).map(function(k){ return x[k]; }); return a.filter(Boolean).map(function(g){ var ps=g.posts||[]; ps=Array.isArray(ps)?ps:Object.keys(ps).map(function(k){ return ps[k]; }); return {id:g.id,n:g.n,posts:ps.filter(Boolean)}; }); }
function commit(st,note){
  var u=f._u, p=Object.assign({},f); delete p._u; p.st=st; p.note=note||''; p.at=Date.now();
  if(np.t) p.t=np.t; else if(db.prof[u]&&db.prof[u].t) p.t=db.prof[u].t;
  var ch={}; if(np.p) ch.p=np.p; if(np.a) ch.a=np.a; db.prof[u]=p; pics[u]=Object.assign({},pics[u]||{},ch); np={};
  W(function(){ return ref('hsia_people/profiles/'+u).set(p); }); if(ch.p||ch.a) W(function(){ return ref('hsia_people/pics/'+u).update(ch); });
  return 1;
}
function publish(u,p){ W(function(){ return Promise.all([ref('hsia_people/dir/'+u).set({bn:p.bn||'',en:p.en||''}),ref('hsia_people/phones/'+u).set(p.ph||'')]); }); }
function unpublish(u){ W(function(){ return Promise.all([ref('hsia_people/dir/'+u).remove(),ref('hsia_people/phones/'+u).remove()]); }); }
function finish(u,sel){ var p=db.prof[u]||P||{}; Object.assign(p,sel); if(p.st==='draft') p.st='pending'; db.prof[u]=p; W(function(){ return ref('hsia_people/profiles/'+u).update(Object.assign({},sel,{st:p.st})); }); v='home'; busy=false; render(); }
function usage(){ return ''; }
function ferr(e){ var c=(e&&e.code)||''; return /email-already-in-use/.test(c)?'An account with this EIN already exists. Please log in.':/wrong-password|user-not-found|invalid-credential|invalid-login/.test(c)?'Wrong EIN or password':/network/.test(c)?'No internet connection':/operation-not-allowed/.test(c)?'Email/Password sign-in is not enabled in Firebase yet':/popup-closed|cancelled-popup/.test(c)?'':((e&&e.message)||String(e)); }
const SPEC={p:{w:413,h:531,kb:40,n:'Passport photo'},a:{w:650,h:1005,kb:110,n:'AVSEC ID photo'}};   /* 35\u00d745 mm and 55\u00d785 mm at ~300 dpi */
const MIME=document.createElement('canvas').toDataURL('image/webp').indexOf('image/webp')>0?'image/webp':'image/jpeg';
const kbOf=d=>Math.round((d.length-d.indexOf(',')-1)*.75/1024*10)/10;
function enc(c,max){let lo=.3,hi=.92,best=c.toDataURL(MIME,lo);for(let i=0;i<8;i++){const q=(lo+hi)/2,d=c.toDataURL(MIME,q);if(kbOf(d)<=max){best=d;lo=q}else hi=q}return best}
function pick(k,cam){const i=document.createElement('input');i.type='file';i.accept='image/*';if(cam)i.capture=k==='p'?'user':'environment';
 i.onchange=()=>{const fl=i.files[0];if(!fl)return;const im=new Image();im.onload=()=>cropper(k,im);im.onerror=()=>alert('Could not open the photo');im.src=URL.createObjectURL(fl)};i.click()}
/* ===== 4-corner perspective crop: the corners are auto-detected, can be dragged, then the quad is warped flat to the exact size ===== */
const MAXS=1600;
function srcCanvas(im){const s=Math.min(1,MAXS/Math.max(im.width,im.height)),w=Math.round(im.width*s),h=Math.round(im.height*s),c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);return c}
function rot90(c){const r=document.createElement('canvas');r.width=c.height;r.height=c.width;const g=r.getContext('2d');g.translate(c.height,0);g.rotate(Math.PI/2);g.drawImage(c,0,0);return r}
function defQuad(c,S){const a=S.w/S.h;let bw,bh;if(c.width/c.height>a){bh=c.height*.8;bw=bh*a}else{bw=c.width*.8;bh=bw/a}const x=(c.width-bw)/2,y=(c.height-bh)/2;return[[x,y],[x+bw,y],[x+bw,y+bh],[x,y+bh]]}
function detect(c){const s=160/Math.max(c.width,c.height),w=Math.max(8,Math.round(c.width*s)),h=Math.max(8,Math.round(c.height*s)),t=document.createElement('canvas');t.width=w;t.height=h;const g=t.getContext('2d');g.drawImage(c,0,0,w,h);
 const d=g.getImageData(0,0,w,h).data,n=w*h,gr=new Uint8Array(n),H=new Array(256).fill(0);
 for(let i=0;i<n;i++){gr[i]=d[i*4]*.3+d[i*4+1]*.59+d[i*4+2]*.11;H[gr[i]]++}
 let sum=0;for(let i=0;i<256;i++)sum+=i*H[i];let wB=0,sB=0,mx=-1,th=128;
 for(let i=0;i<256;i++){wB+=H[i];const wF=n-wB;if(!wB||!wF)continue;sB+=i*H[i];const a=sB/wB,b=(sum-sB)/wF,v=wB*wF*(a-b)*(a-b);if(v>mx){mx=v;th=i}}
 let best=null,bs=0;   /* biggest blob (light-on-dark or dark-on-light) that does not touch the picture edge = the page / card */
 for(const pol of[0,1]){const m=new Uint8Array(n),seen=new Uint8Array(n);for(let i=0;i<n;i++)m[i]=((gr[i]>th)?1:0)===pol?1:0;
  for(let i=0;i<n;i++){if(!m[i]||seen[i])continue;const st=[i];seen[i]=1;let a=0,bd=0,t1=1e9,t2=-1e9,t3=-1e9,t4=1e9;const P=[0,0,0,0];
   while(st.length){const j=st.pop(),x=j%w,y=(j/w)|0;a++;if(!x||!y||x===w-1||y===h-1)bd=1;const s1=x+y,s2=x-y;
    if(s1<t1){t1=s1;P[0]=[x,y]}if(s2>t3){t3=s2;P[1]=[x,y]}if(s1>t2){t2=s1;P[2]=[x,y]}if(s2<t4){t4=s2;P[3]=[x,y]}
    for(const k of[x>0?j-1:-1,x<w-1?j+1:-1,y>0?j-w:-1,y<h-1?j+w:-1])if(k>=0&&m[k]&&!seen[k]){seen[k]=1;st.push(k)}}
   if(!bd&&a>n*.1&&a<n*.92&&a>bs){const ar=Math.abs(P.reduce((z,p,i)=>z+p[0]*P[(i+1)%4][1]-P[(i+1)%4][0]*p[1],0))/2;if(ar>n*.12){bs=a;best=P}}}}
 return best&&best.map(p=>[(p[0]+.5)*c.width/w,(p[1]+.5)*c.height/h])}
function homog(q,W,H){const D=[[0,0],[W,0],[W,H],[0,H]],A=[];   /* destination rectangle -> source quad */
 for(let i=0;i<4;i++){const[x,y]=D[i],[u,v]=q[i];A.push([x,y,1,0,0,0,-x*u,-y*u,u]);A.push([0,0,0,x,y,1,-x*v,-y*v,v])}
 for(let c=0;c<8;c++){let p=c;for(let r=c+1;r<8;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;[A[c],A[p]]=[A[p],A[c]];
  for(let r=0;r<8;r++){if(r===c)continue;const f=A[r][c]/A[c][c];for(let k=c;k<9;k++)A[r][k]-=f*A[c][k]}}
 return A.map((r,i)=>r[8]/r[i])}
function warp(c,q,W,H){const s=c.getContext('2d').getImageData(0,0,c.width,c.height).data,sw=c.width,sh=c.height,m=homog(q,W,H),o=document.createElement('canvas');o.width=W;o.height=H;const g=o.getContext('2d'),im=g.createImageData(W,H),od=im.data;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const z=m[6]*x+m[7]*y+1,u=(m[0]*x+m[1]*y+m[2])/z,v=(m[3]*x+m[4]*y+m[5])/z,i=(y*W+x)*4;
  if(!(u>=0&&v>=0&&u<=sw-1&&v<=sh-1)){od[i]=od[i+1]=od[i+2]=od[i+3]=255;continue}
  const x0=u|0,y0=v|0,x1=Math.min(x0+1,sw-1),y1=Math.min(y0+1,sh-1),fx=u-x0,fy=v-y0;
  for(let k=0;k<3;k++)od[i+k]=s[(y0*sw+x0)*4+k]*(1-fx)*(1-fy)+s[(y0*sw+x1)*4+k]*fx*(1-fy)+s[(y1*sw+x0)*4+k]*(1-fx)*fy+s[(y1*sw+x1)*4+k]*fx*fy;od[i+3]=255}
 g.putImageData(im,0,0);return o}
function cropper(k,im){const S=SPEC[k];let cur=srcCanvas(im),q,sk,cw,ch,dg=-1;
 const o=document.createElement('div');o.className='ov';
 o.innerHTML=`<div><b>${S.n} \u2014 drag the dots to the corners</b><p class="mut">Place the four dots on the four corners; the photo is straightened. (The dots find the corners by themselves.)</p><canvas></canvas><button class="g" id="rt">\u21bb Rotate</button><button class="g" id="au">\u27f2 Auto corners</button><button class="b" id="ok">\u2714 Done</button><button class="b" id="cx" style="background:var(--c);color:var(--t);border:1px solid var(--l)">Cancel</button></div>`;
 R.appendChild(o);const cv=o.querySelector('canvas'),x=cv.getContext('2d');
 const paint=()=>{x.clearRect(0,0,cw,ch);x.drawImage(cur,0,0,cw,ch);x.lineWidth=2;x.strokeStyle='#4da3ff';x.beginPath();q.forEach((p,i)=>x[i?'lineTo':'moveTo'](p[0]*sk,p[1]*sk));x.closePath();x.stroke();
  q.forEach(p=>{x.beginPath();x.arc(p[0]*sk,p[1]*sk,11,0,7);x.fillStyle='rgba(255,255,255,.92)';x.fill();x.lineWidth=3;x.strokeStyle='#1a5fd0';x.stroke()})};
 const setup=a=>{const f=Math.min(Math.min(innerWidth-32,360)/cur.width,innerHeight*.5/cur.height);sk=f;cw=Math.round(cur.width*f);ch=Math.round(cur.height*f);cv.width=cw;cv.height=ch;if(a||!q)q=detect(cur)||defQuad(cur,S);paint()};
 setup(1);
 cv.onpointerdown=e=>{const r=cv.getBoundingClientRect(),X=e.clientX-r.left,Y=e.clientY-r.top;let b=40;dg=-1;q.forEach((p,i)=>{const d=Math.hypot(p[0]*sk-X,p[1]*sk-Y);if(d<b){b=d;dg=i}});if(dg>=0)cv.setPointerCapture(e.pointerId)};
 cv.onpointermove=e=>{if(dg<0)return;const r=cv.getBoundingClientRect();q[dg]=[Math.max(0,Math.min(cur.width,(e.clientX-r.left)/sk)),Math.max(0,Math.min(cur.height,(e.clientY-r.top)/sk))];paint()};cv.onpointerup=()=>dg=-1;
 o.querySelector('#rt').onclick=()=>{cur=rot90(cur);setup(1)};o.querySelector('#au').onclick=()=>setup(1);o.querySelector('#cx').onclick=()=>o.remove();
 o.querySelector('#ok').onclick=()=>{const w=warp(cur,q,S.w,S.h),d=enc(w,S.kb);np[k]=d;
  if(k==='p'){const t=document.createElement('canvas');t.width=96;t.height=Math.round(96*S.h/S.w);t.getContext('2d').drawImage(w,0,0,t.width,t.height);np.t=enc(t,5)}
  o.remove();showPic(k)}}
function showPic(k){const d=np[k]||(pics[f._u]||{})[k];$('#pv'+k).style.backgroundImage=d?`url(${d})`:'';$('#pk'+k).innerHTML=d?`<span class="kb">${kbOf(d)} KB</span> \u00b7 ${SPEC[k].w}\u00d7${SPEC[k].h}px \u00b7 ${MIME.slice(6)}`:'No photo'}


const fld=(id,l,val,x)=>`<label>${l}<input id="${id}" value="${esc(val)}" ${x||''}></label>`;
const picH=(k,u)=>`<div class="pic"><div class="pv" id="pv${k}"></div><div><b>${SPEC[k].n}${k==='a'?' (optional)':' *'}</b><div class="mut" id="pk${k}"></div><button type="button" class="g" data-k="${k}">Gallery</button><button type="button" class="g" data-k="${k}" data-c="1">Camera</button></div></div>`;
function fields(u){const su=v==='signup';return fld('bn','Name (Bangla) *',f.bn)+fld('en','Name (English) *',f.en)+`<label>Designation *<button type="button" class="in" id="ds">${esc(dName(f.des))||'Select designation \u25be'}</button></label>`+fld('ein','EIN number *',f.ein,man(u)?'readonly':'inputmode="numeric"')+fld('mail','Gmail'+(man(u)||su?' (optional)':''),f.mail,man(u)||su?'inputmode="email"':'readonly')+fld('ph','Phone number *',f.ph,'inputmode="tel"')+picH('p',u)+picH('a',u)}
function bind(){['bn','en','ein','ph','mail'].forEach(i=>$('#'+i).oninput=e=>f[i]=e.target.value);
 $('#ds').onclick=()=>{const o=document.createElement('div');o.className='ov';o.innerHTML='<div><div class="ttl">Select designation</div>'+db.fold.map(g=>`<div class="fh">${esc(g.n)}</div>`+g.posts.map(d=>`<div class="row" data-i="${d.id}">${esc(d.n)}</div>`).join('')).join('')+'</div>';R.appendChild(o);
  o.onclick=e=>{const r=e.target.closest('[data-i]');if(r){f.des=r.dataset.i;$('#ds').textContent=dName(f.des)}if(r||e.target===o)o.remove()}};
 R.querySelectorAll('.pic button').forEach(b=>b.onclick=()=>pick(b.dataset.k,b.dataset.c));showPic('p');showPic('a')}
function check(strict){const miss=[],bad=[];
 if(!f.bn)miss.push('Name (Bangla)');else if(!/[\u0980-\u09FF]/.test(f.bn))bad.push('Name (Bangla) must be written in Bangla');
 if(!f.en)miss.push('Name (English)');else if(!/[A-Za-z]{2}/.test(f.en))bad.push('Name (English)');
 if(!f.des)miss.push('Designation');
 f.ein=dn(f.ein||'').trim();if(!f.ein)miss.push('EIN number');else if(!/^\d{3,12}$/.test(f.ein))bad.push('EIN (digits only)');else if(Object.keys(db.prof).some(x=>x!==f._u&&db.prof[x].ein===f.ein))bad.push('EIN already registered');
 if(f.mail&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.mail))bad.push('Gmail');
 f.ph=dn(f.ph||'').replace(/[\s-]/g,'');if(!f.ph)miss.push('Phone number');else if(!/^(\+?88)?01\d{9}$/.test(f.ph))bad.push('Phone (01XXXXXXXXX)');
 const o=pics[f._u]||{};if(!(np.p||o.p))miss.push('Passport photo');
 if(bad.length){alert('Please fix: '+bad.join(', '));return false}
 f.inc=miss.length?1:0;if(!miss.length)return true;
 if(strict){alert('Still empty: '+miss.join(', ')+'. Fill them in (or reject with a reason).');return false}
 return confirm('These are empty: '+miss.join(', ')+'.\n\nPlease fill them in. Press OK to send to the admin anyway, or Cancel to go back.')}

function popup(t,msg,cb){const o=document.createElement('div');o.className='ov';o.innerHTML=`<div><div class="ttl">${t}</div><p style="margin:0">${msg}</p><button class="b" id="pok">\u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c1\u09a8</button><button class="b gh" id="pcx">\u09ac\u09be\u09a4\u09bf\u09b2</button></div>`;R.appendChild(o);o.querySelector('#pcx').onclick=()=>o.remove();o.querySelector('#pok').onclick=()=>{o.remove();cb()}}
function gate(m){m.innerHTML=`<div class="card"><div class="ttl">HSIA ATM</div><button class="b" id="g1" style="margin-top:0">\ud83d\udd10 Login</button><button class="b gh" id="g2">Continue without login</button><p class="mut" style="margin:12px 0 0">\u09b2\u0997\u0987\u09a8 \u099b\u09be\u09a1\u09bc\u09be \u09e8\u09ea \u0998\u09a3\u09cd\u099f\u09be\u09b0 \u099f\u09cd\u09b0\u09be\u09af\u09bc\u09be\u09b2 \u09aa\u09be\u09ac\u09c7\u09a8; \u098f\u09b0\u09aa\u09b0 \u09b2\u0997\u0987\u09a8 \u09b2\u09be\u0997\u09ac\u09c7\u0964</p></div>`;
 $('#g1').onclick=()=>{v='login';render()};$('#g2').onclick=()=>popup('\u099f\u09cd\u09b0\u09be\u09af\u09bc\u09be\u09b2 \u2014 \u09e8\u09ea \u0998\u09a3\u09cd\u099f\u09be','\u0986\u09aa\u09a8\u09bf \u098f\u0996\u09a8 \u09e8\u09ea \u0998\u09a3\u09cd\u099f\u09be \u09b2\u0997\u0987\u09a8 \u099b\u09be\u09a1\u09bc\u09be \u0985\u09cd\u09af\u09be\u09aa \u09a6\u09c7\u0996\u09a4\u09c7 \u09aa\u09be\u09b0\u09ac\u09c7\u09a8\u0964 \u0989\u09aa\u09b0\u09c7\u09b0 \u09b2\u09be\u09b2 \u09ac\u09be\u09b0\u09c7 \u09ac\u09be\u0995\u09bf \u09b8\u09ae\u09af\u09bc \u09a6\u09c7\u0996\u09be\u09ac\u09c7\u0964 \u09b8\u09ae\u09af\u09bc \u09b6\u09c7\u09b7 \u09b9\u09b2\u09c7 \u098f\u0987 \u09a1\u09bf\u09ad\u09be\u0987\u09b8\u09c7 \u09b2\u0997\u0987\u09a8 \u099b\u09be\u09a1\u09bc\u09be \u0986\u09b0 \u09a2\u09cb\u0995\u09be \u09af\u09be\u09ac\u09c7 \u09a8\u09be\u0964',()=>{ts=Date.now();localStorage.setItem(TK(),ts);render()})}
function trial(m){m.innerHTML=`<div class="card"><h3>\u0985\u09cd\u09af\u09be\u09aa \u09aa\u09cd\u09b0\u09bf\u09ad\u09bf\u0989 \u2014 \u099f\u09cd\u09b0\u09be\u09af\u09bc\u09be\u09b2</h3><p class="mut">\u09b2\u0997\u0986\u0989\u099f \u0985\u09ac\u09b8\u09cd\u09a5\u09be\u09af\u09bc \u09af\u09a4\u099f\u09c1\u0995\u09c1 \u09a6\u09c7\u0996\u09be \u09af\u09be\u09af\u09bc \u09a4\u09a4\u099f\u09c1\u0995\u09c1 (\u09b6\u09c1\u09a7\u09c1 \u0986\u099c\u0995\u09c7\u09b0 \u09b0\u09cb\u09b8\u09cd\u099f\u09be\u09b0)\u0964</p></div><button class="b" id="t1">Login / \u09a8\u09bf\u09ac\u09a8\u09cd\u09a7\u09a8</button>`;$('#t1').onclick=()=>{v='login';render()}}

/* ---------- roster choice: the app's real duty roster tables ---------- */
function rosterTabs(){
  var t=[], g=function(n){ try{ return eval(n); }catch(e){ return null; } };
  [['roster','Aerodrome Assistant','ROSTER'],['rosterCtrl','Controllers','ROSTER_CTRL'],['rosterComm','Communication','ROSTER_COMM']].forEach(function(x){ var r=g(x[2]); if(Array.isArray(r)&&r.length) t.push({k:x[0],n:x[1],rows:r}); });
  return t;
}
function rosterPick(cb,cx){
  var o=document.createElement('div'); o.className='ov'; R.appendChild(o); var tabs=rosterTabs(), at=0;
  function s1(){
    var T=tabs[at], rows=T?T.rows:[];
    o.innerHTML='<div><div class="ttl">Find your name in the duty roster</div><p class="mut" style="margin:0 0 6px">Tap your own name.</p>'
     +(tabs.length>1?'<div>'+tabs.map(function(t,i){ return '<button class="g'+(i===at?' on':'')+'" data-tb="'+i+'">'+t.n+'</button>'; }).join('')+'</div>':'')
     +'<input id="rq" placeholder="Search a name..."><div style="overflow-x:auto;margin-top:8px"><table class="rt"><tr><th></th>'+TM.map(function(t){ return '<th>Team '+t+'</th>'; }).join('')+'</tr>'
     +rows.map(function(r,i){ return '<tr><th>'+esc(r.pos)+'</th>'+TM.map(function(t,j){ var n=(r.names||[])[j]; var ok=n&&String(n).trim()&&!/^-+$/.test(String(n).trim()); return ok?'<td data-n="'+esc(n)+'" data-r="'+esc(r.pos)+'" data-t="'+t+'">'+esc(n)+'</td>':'<td></td>'; }).join('')+'</tr>'; }).join('')
     +'</table></div><button class="b gh" id="rn">I am not in this roster table (Others / Traffic Hand / Marshaller)</button>'+(cx?'<a class="lnk" id="rc">Cancel</a>':'')+'</div>';
    var q=o.querySelector('#rq'); q.oninput=function(){ var t=q.value.trim().toLowerCase(); o.querySelectorAll('td[data-n]').forEach(function(c){ c.classList.toggle('dim',!!t&&c.dataset.n.toLowerCase().indexOf(t)<0); }); };
    o.querySelector('#rn').onclick=s2;
    o.onclick=function(e){ var b=e.target.closest('[data-tb]'), c=e.target.closest('td[data-n]');
      if(b){ at=+b.dataset.tb; s1(); } else if(e.target.id==='rc') o.remove();
      else if(c&&confirm('Team '+c.dataset.t+' \u00b7 '+c.dataset.r+' \u00b7 '+c.dataset.n+'\n\nIs this you?')){ o.remove(); cb({team:c.dataset.t,pos:c.dataset.r,rn:c.dataset.n,oth:''}); } };
  }
  function s2(){
    o.innerHTML='<div><div class="ttl">Others - your type</div>'+OT.map(function(t,i){ return '<button class="pk" data-x="'+i+'" style="width:100%;margin-top:8px">'+esc(t)+'</button>'; }).join('')+'<a class="lnk" id="tb2">&larr; Back to roster</a></div>';
    o.onclick=function(e){ var b=e.target.closest('[data-x]'); if(b){ o.remove(); cb({team:'O',pos:'',rn:'',oth:OT[+b.dataset.x]}); } else if(e.target.id==='tb2') s1(); };
  }
  if(tabs.length) s1(); else s2();
}
/* ---------- screens ---------- */
function google(){
  var A=firebase.auth(), pr=new firebase.auth.GoogleAuthProvider();
  A.signInWithPopup(pr).catch(function(e){ if(/popup-blocked/.test((e&&e.code)||'')) return A.signInWithRedirect(pr); var m=ferr(e); if(m) alert(m); });
}
function login(m,ex){
  m.innerHTML=(ex?'<div class="card"><b>Your 24-hour trial has ended.</b><p class="mut" style="margin:6px 0 0">Please log in to continue.</p></div>':'')+'<div class="card"><div class="ttl">HSIA ATM</div><button class="b" id="gl" style="margin-top:0">Continue with Google</button><p class="mut" style="text-align:center;margin:16px 0 0">or sign in with your EIN and password</p><label>EIN number<input id="le" inputmode="numeric"></label><label>Password<input id="lp" type="password" autocomplete="current-password"></label><div class="two"><button class="b" id="li">Login</button><button class="b gh" id="lc">Create new account</button></div></div><a class="lnk" id="al">Admin sign-in</a>'+(ex?'':'<a class="lnk" id="bk2">&larr; Back</a>');
  if($('#bk2')) $('#bk2').onclick=function(){ v='home'; render(); };
  $('#gl').onclick=google;
  $('#li').onclick=function(){ var e=dn($('#le').value).trim(), pw=$('#lp').value; if(!/^\d{3,12}$/.test(e)) return alert('Enter a valid EIN (digits only)'); if(pw.length<5) return alert('Password must be at least 5 characters');
    firebase.auth().signInWithEmailAndPassword(e+'@hsia.app','HSIA#'+pw).catch(function(x){ alert(ferr(x)); }); };
  $('#lc').onclick=function(){ v='signup'; render(); };
  $('#al').onclick=function(){ try{ if(typeof requireRosterAuth==='function') requireRosterAuth(); }catch(e){} };
}
function signup(m){
  f={mail:'',_u:'',man:true}; np={};
  m.innerHTML='<div class="card"><div class="ttl">Create account</div><p class="mut">Fields marked * are required. The admin will review your details before approval.</p>'+fields('')+'<label>Create your password * (minimum 5 characters)<input id="pw1" type="password" autocomplete="new-password"></label><label>Confirm password *<input id="pw2" type="password" autocomplete="new-password"></label><button class="b" id="sv">Save &amp; continue</button><button class="b gh" id="sb">&larr; Back to login</button></div>';
  bind(); $('#sb').onclick=function(){ v='login'; render(); };
  $('#sv').onclick=function(){
    var a=$('#pw1').value; if(!dn(f.ein||'').trim()) return alert('EIN number is required: it is your login ID'); if(a.length<5) return alert('Password must be at least 5 characters'); if(a!==$('#pw2').value) return alert('Passwords do not match'); if(!check()) return;
    busy=true; firebase.auth().createUserWithEmailAndPassword(f.ein+'@hsia.app','HSIA#'+a).then(function(cr){ f._u=cr.user.uid; f.man=true; commit('draft'); rosterPick(function(sel){ finish(f._u,sel); }); }).catch(function(e){ busy=false; alert(ferr(e)); });
  };
}
function form(m){
  var em=(U&&U.email)||''; f=P?Object.assign({},P,{_u:U.uid}):/@hsia\.app$/.test(em)?{ein:em.split('@')[0],mail:'',man:true,_u:U.uid}:{mail:em,_u:U.uid}; np={};
  m.innerHTML='<div class="card"><div class="ttl">Registration</div><p class="mut">Fields marked * are required. The admin will review your details.</p>'+fields(f._u)+'<button class="b" id="sv">Save</button></div>';
  bind(); $('#sv').onclick=function(){ if(check()&&commit('draft')) rosterPick(function(sel){ finish(U.uid,sel); }); };
}
function ask(t,val,cb){const o=document.createElement('div');o.className='ov';o.innerHTML=`<div><div class="ttl">${t}</div><input id="at" value="${esc(val)}"><button class="b" id="aok">\u09b8\u09c7\u09ad</button><button class="b gh" id="acx">\u09ac\u09be\u09a4\u09bf\u09b2</button></div>`;R.appendChild(o);const i=o.querySelector('#at');i.focus();o.querySelector('#acx').onclick=()=>o.remove();o.querySelector('#aok').onclick=()=>{const x=i.value.trim();if(x){o.remove();cb(x)}}}
function sortable(box,sel,hs,done){box.addEventListener('pointerdown',e=>{const h=e.target.closest(hs),it=h&&h.closest(sel);if(!it||it.parentNode!==box)return;e.preventDefault();
 const y0=e.clientY,sb=[...box.children].filter(c=>c!==it),mids=sb.map(c=>{const r=c.getBoundingClientRect();return r.top+r.height/2});let k=0;it.classList.add('dg');
 const mv=ev=>{it.style.transform=`translateY(${ev.clientY-y0}px)`;k=mids.filter(x=>x<ev.clientY).length;sb.forEach((c,i)=>c.classList.toggle('ins',i===k));box.classList.toggle('insb',k===sb.length)};
 const up=()=>{['pointermove','pointerup','pointercancel'].forEach((n,i)=>document.removeEventListener(n,i?up:mv));sb.forEach(c=>c.classList.remove('ins'));box.classList.remove('insb');it.classList.remove('dg');it.style.transform='';const ids=sb.map(c=>c.dataset.id);ids.splice(k,0,it.dataset.id);done(ids)};
 document.addEventListener('pointermove',mv);document.addEventListener('pointerup',up);document.addEventListener('pointercancel',up)})}
const inUse=id=>Object.values(db.prof).some(p=>p.des===id);
function admin(m){const L=st=>Object.keys(db.prof).filter(u=>db.prof[u].st===st).sort((a,b)=>(+db.prof[a].ein||1e15)-(+db.prof[b].ein||1e15));
 const row=u=>{const p=db.prof[u];return`<div class="row" data-u="${u}"><img src="${(db.prof[u]||{}).t||''}"><div><b>${esc(p.ein)} \u00b7 ${esc(p.bn)}</b>${p.inc?' <span style="color:#e8a0a8;font-size:12px">\u26a0 incomplete</span>':''}<br><span class="mut">${esc(p.en)} \u00b7 ${esc(dName(p.des))} \u00b7 ${tl(p)}</span></div></div>`};
 let h=`<div class="tabs"><button class="g ${tab==='p'?'on':''}" data-t="p">\u09aa\u09c7\u09a8\u09cd\u09a1\u09bf\u0982 (${L('pending').length})</button><button class="g ${tab==='a'?'on':''}" data-t="a">\u0985\u09a8\u09c1\u09ae\u09cb\u09a6\u09bf\u09a4</button><button class="g ${tab==='d'?'on':''}" data-t="d">\u09aa\u09a6</button><button class="g ${tab==='o'?'on':''}" data-t="o">Directory</button></div>`;
 if(tab==='p')h+=`<div class="card">${L('pending').concat(L('rejected')).map(row).join('')||'<span class="mut">\u0995\u09cb\u09a8\u09cb \u09aa\u09c7\u09a8\u09cd\u09a1\u09bf\u0982 \u09a8\u09c7\u0987</span>'}</div>`;
 if(tab==='a')h+=db.fold.map(g=>{const l=L('approved').filter(u=>g.posts.some(p=>p.id===db.prof[u].des));return l.length?`<div class="card"><div class="ttl">${esc(g.n)} (${l.length})</div>`+g.posts.map(p=>{const x=l.filter(u=>db.prof[u].des===p.id);return x.length?`<div class="fh">${esc(p.n)}</div>`+x.map(row).join(''):''}).join('')+'</div>':''}).join('')||'<div class="card mut">\u0995\u09c7\u0989 \u0985\u09a8\u09c1\u09ae\u09cb\u09a6\u09bf\u09a4 \u09a8\u09af\u09bc</div>';
 if(tab==='o'){let n=0;h+=`<div class="card"><div class="ttl">Directory (admin only)</div><p class="mut" style="margin:0 0 6px">Everyone approved, in folder order then EIN order. This is what the Information Flow "Others" tab will hold. Gmail is shown here only; central search shows names and phone, never Gmail.</p>${db.fold.flatMap(g=>g.posts).flatMap(q=>L('approved').filter(u=>db.prof[u].des===q.id)).map(u=>{const x=db.prof[u];return`<div class="row" style="cursor:default"><div>${++n}. <b>${esc(x.bn)}</b> \u00b7 ${esc(x.en)}<br><span class="mut">\u2709 ${esc(x.mail||'\u2014')} \u00b7 \ud83d\udcde ${esc(x.ph)}</span></div></div>`}).join('')||'<span class="mut">Nobody approved yet</span>'}</div>`}
 if(tab==='d')h+=`<div class="card"><div class="ttl">\u09ab\u09cb\u09b2\u09cd\u09a1\u09be\u09b0 \u0993 \u09aa\u09a6</div><p class="mut" style="margin:0 0 6px">\u283f \u09a7\u09b0\u09c7 \u099f\u09c7\u09a8\u09c7 \u0995\u09cd\u09b0\u09ae \u09ac\u09a6\u09b2\u09be\u09a8 \u00b7 \u270e \u09a8\u09be\u09ae \u09ac\u09a6\u09b2\u09be\u09a8 \u00b7 \uff0b \u09ad\u09c7\u09a4\u09b0\u09c7 \u09aa\u09a6 \u09af\u09cb\u0997</p><div id="fl">${db.fold.map(g=>`<div class="fd" data-id="${g.id}"><div class="fr"><span class="gp fg">\u283f</span><b class="fn">${esc(g.n)}</b><button class="ic" data-e="${g.id}">\u270e</button><button class="ic" data-a="${g.id}">\uff0b</button><button class="ic" data-x="${g.id}">\u2715</button></div><div class="pl">${g.posts.map(p=>`<div class="ps" data-id="${p.id}"><span class="gp pg">\u283f</span><span class="fn">${esc(p.n)}</span><button class="ic" data-e="${p.id}">\u270e</button><button class="ic" data-x="${p.id}">\u2715</button></div>`).join('')}</div></div>`).join('')}</div><button class="b" data-a="">\uff0b \u09a8\u09a4\u09c1\u09a8 \u09ab\u09cb\u09b2\u09cd\u09a1\u09be\u09b0</button></div>`;
 m.innerHTML=h+'<a class="lnk" id="bk">\u2190 \u09ab\u09bf\u09b0\u09c7 \u09af\u09be\u09a8</a>';
 if(tab==='d'){const sv2=()=>{sv(0,db);render()};sortable($('#fl'),'.fd','.fg',ids=>{db.fold=ids.map(i=>db.fold.find(g=>g.id===i));sv2()});
  R.querySelectorAll('.pl').forEach(pl=>sortable(pl,'.ps','.pg',ids=>{const g=db.fold.find(x=>x.id===pl.parentNode.dataset.id);g.posts=ids.map(i=>g.posts.find(x=>x.id===i));sv2()}))}
 m.onclick=e=>{const t=e.target.closest('[data-t]'),r=e.target.closest('[data-u]'),ed=e.target.closest('[data-e]'),ad=e.target.closest('[data-a]'),x=e.target.closest('[data-x]'),fin=id=>db.fold.find(g=>g.id===id);
  if(t){tab=t.dataset.t;render()}else if(r)loadPics(r.dataset.u).then(()=>review(r.dataset.u));
  else if(ed){const id=ed.dataset.e,g=fin(id),p=g||db.fold.flatMap(z=>z.posts).find(z=>z.id===id);ask('\u09a8\u09be\u09ae \u09ac\u09a6\u09b2\u09be\u09a8',p.n,n=>{p.n=n;sv(0,db);render()})}
  else if(ad){const gid=ad.dataset.a;ask(gid?'\u09a8\u09a4\u09c1\u09a8 \u09aa\u09a6\u09c7\u09b0 \u09a8\u09be\u09ae':'\u09a8\u09a4\u09c1\u09a8 \u09ab\u09cb\u09b2\u09cd\u09a1\u09be\u09b0\u09c7\u09b0 \u09a8\u09be\u09ae','',n=>{if(gid)fin(gid).posts.push({id:'p'+Date.now(),n});else db.fold.push({id:'f'+Date.now(),n,posts:[]});sv(0,db);render()})}
  else if(x){const id=x.dataset.x,g=fin(id);if(g?g.posts.some(z=>inUse(z.id)):inUse(id))return alert('\u098f\u09a4\u09c7 \u09ac\u09cd\u09af\u09ac\u09b9\u09be\u09b0\u0995\u09be\u09b0\u09c0 \u0986\u099b\u09c7, \u09ae\u09cb\u099b\u09be \u09af\u09be\u09ac\u09c7 \u09a8\u09be');if(!confirm('\u09ae\u09c1\u099b\u09ac\u09c7\u09a8?'))return;
   if(g)db.fold=db.fold.filter(z=>z!==g);else db.fold.forEach(z=>z.posts=z.posts.filter(q=>q.id!==id));sv(0,db);render()}
  else if(e.target.id==='bk'){v='home';m.onclick=null;render()}}}

function review(u){f={...db.prof[u],_u:u};np={};const o=document.createElement('div');o.className='ov';
 o.innerHTML=`<div><h3>\u09af\u09be\u099a\u09be\u0987 \u0993 \u0985\u09a8\u09c1\u09ae\u09cb\u09a6\u09a8</h3>${fields(u)}<label>Roster position<button type="button" class="in" id="rp">${esc(tl(f))}</button></label><label>\u0985\u09cd\u09af\u09be\u09a1\u09ae\u09bf\u09a8 \u09a8\u09cb\u099f (\u09ac\u09be\u09a4\u09bf\u09b2 \u09b9\u09b2\u09c7 \u0987\u0989\u099c\u09be\u09b0 \u09a6\u09c7\u0996\u09ac\u09c7)<input id="nt" value="${esc(f.note)}"></label><button class="b" id="ap">\u2714 Approve</button><button class="b" id="rj" style="background:var(--no);color:#fff">\u2715 Reject</button><button class="b" id="cl" style="background:var(--c);color:var(--t);border:1px solid var(--l)">\u09ac\u09a8\u09cd\u09a7 \u0995\u09b0\u09c1\u09a8</button></div>`;
 R.appendChild(o);bind();$('#rp').onclick=()=>rosterPick(sel=>{Object.assign(f,sel);$('#rp').textContent=tl(f)},1);
 $('#cl').onclick=()=>o.remove();$('#ap').onclick=()=>{if(check(1)&&commit('approved')){publish(f._u,f);o.remove();render()}};
 $('#rj').onclick=()=>{const n=$('#nt').value.trim();if(!n)return alert('\u0995\u09be\u09b0\u09a3 \u09b2\u09bf\u0996\u09c1\u09a8');if(commit('rejected',n)){unpublish(f._u);o.remove();render()}}}
/* ---------- routing ---------- */
function show(on){ R.style.display=on?'block':'none'; }
function bar(h,c){ barEl.className=c||''; barEl.innerHTML=h||''; barEl.style.display=h?'block':'none'; document.body.style.paddingTop=h?'26px':''; }
function render(){ cur=''; route(); }
function screen(name,fn){ show(true); if(cur===name) return; cur=name; fn($('#app')); }
function route(){
  if(!db.fold||!R||!CFG) return;
  var real=!!(U&&!U.isAnonymous), tr=!real&&ts&&left()>0;
  admEl.style.display=adm?'inline-block':'none';
  if(adm){ bar(''); if(v==='admin') return screen('admin'+tab,admin); show(false); return; }
  if(!on()){ bar(''); show(false); cur=''; return; }                 /* dormant: the app is exactly as before */
  if(epochBusy) return;
  if(authKnown&&String(CFG.epoch)!==localStorage.getItem('HSIA_REG_EPOCH')){ enforceEpoch(); return; }
  if(busy) return;
  if(!real){
    if(v==='signup'){ bar(''); return screen('signup',signup); }
    if(v==='login'){ bar(tr?'<span id="tb">Trial - '+hms(left())+' left</span>':'',tr?'tb':''); return screen('login',login); }
    if(tr){ bar('<span id="tb">Trial - '+hms(left())+' left</span><a id="rgLogin">Login</a>','tb'); show(false); cur=''; return; }
    bar(''); if(ts) return screen('expired',function(m){ login(m,1); });
    return screen('gate',gate);
  }
  if(!Pready){ bar(''); return screen('load',function(m){ m.innerHTML='<div class="card mut">Loading...</div>'; }); }
  if(!P||v==='form'){ bar(P?statusHtml():''); return screen('form',form); }
  if(P.st==='draft'){ bar(statusHtml()); if(!R.querySelector('.ov')) rosterPick(function(sel){ finish(U.uid,sel); }); return show(true); }
  bar(statusHtml(),P.st==='approved'?'ok':P.st==='rejected'?'no':'wait'); show(false); cur='';
  if(P.st==='approved'&&!sessionStorage.getItem('HSIA_WELCOME')){ sessionStorage.setItem('HSIA_WELCOME','1'); setTimeout(function(){ if(P&&P.st==='approved') bar(''); },6000); }
}
/* Mandatory login was just switched on (a new epoch): everybody except admins is logged out once, then has to register / log in */
function enforceEpoch(){
  if(epochBusy) return; epochBusy=true;
  var had=!!localStorage.getItem('HSIA_AUTH_USER_V1');
  var done=function(){ localStorage.setItem('HSIA_REG_EPOCH',String(CFG.epoch)); epochBusy=false; if(had){ location.reload(); } else route(); };
  try{ if(typeof clearAuthSession==='function') clearAuthSession(); else localStorage.removeItem('HSIA_AUTH_USER_V1'); }catch(e){}
  var real=!!(U&&!U.isAnonymous);
  if(!real) return done();
  ref('hsia_private/adminCheck').once('value').then(done,function(){            /* only an admin may read this: anybody else is signed out */
    firebase.auth().signOut().then(function(){ return firebase.auth().signInAnonymously().catch(function(){}); }).then(done,done); });
}
function adminBox(){
  var b=document.getElementById('regActivateBtn'), s=document.getElementById('regActivateStatus'); if(!b) return;
  b.textContent=on()?'\uD83D\uDD13 \u09AC\u09BE\u09A7\u09CD\u09AF\u09A4\u09BE\u09AE\u09C2\u09B2\u0995 \u09B2\u0997\u0987\u09A8 \u09AC\u09A8\u09CD\u09A7 \u0995\u09B0\u09C1\u09A8':'\uD83D\uDD10 \u09AC\u09BE\u09A7\u09CD\u09AF\u09A4\u09BE\u09AE\u09C2\u09B2\u0995 \u09B2\u0997\u0987\u09A8 \u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09C1\u09A8';
  if(s) s.textContent=on()?'\uD83D\uDFE2 \u099A\u09BE\u09B2\u09C1: \u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u09AC\u09BE\u09A6\u09C7 \u09B8\u09AC\u09BE\u0987\u0995\u09C7 \u09B2\u0997\u0987\u09A8/\u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8 \u0995\u09B0\u09A4\u09C7 \u09B9\u099A\u09CD\u099B\u09C7':'\u26AA \u09AC\u09A8\u09CD\u09A7: \u0986\u0997\u09C7\u09B0 \u09AE\u09A4\u09CB \u099A\u09B2\u099B\u09C7';
  b.onclick=function(){
    if(!(window.hsiaCanSeeOthers&&window.hsiaCanSeeOthers())) return alert('Admin only');
    var cfg=ref('hsia_public/config');
    if(!on()){
      if(!confirm('Mandatory login ON?\n\nEveryone except admins is logged out (Google accounts too). Everybody must register with EIN + password or Continue with Google and fill the form. Without that nobody can open the app after the 24-hour trial.')) return;
      cfg.set({loginRequired:true,epoch:Date.now(),at:Date.now(),by:(firebase.auth().currentUser||{}).email||''}).catch(function(e){ alert('Could not save: '+((e&&e.message)||e)+'\n(Check the Firebase Rules for hsia_public/config)'); });
    } else { cfg.update({loginRequired:false}).catch(function(e){ alert('Could not save: '+((e&&e.message)||e)); }); }
  };
}
function statusHtml(){ var o='<a id="rgOut">Logout</a>'; return !P?'':P.st==='approved'?'Welcome '+esc(P.en)+o:P.st==='rejected'?'REJECTED - '+esc(P.note)+'<a id="rgEdit">Edit</a>'+o:'ID PENDING - waiting for admin approval'+o; }
function attach(u){
  if(unsub){ try{ unsub(); }catch(e){} unsub=null; } P=undefined; Pready=false;
  if(!u||u.isAnonymous) return;
  var r=ref('hsia_people/profiles/'+u.uid), h=function(s){ P=s.val(); if(P) db.prof[u.uid]=P; Pready=true; route(); };
  r.on('value',h,function(){ P=null; Pready=true; route(); }); unsub=function(){ r.off('value',h); };
  loadPics(u.uid);
}
function css(){ var s=document.createElement('style'); s.textContent="#hsiaReg{--bg:#030202;--c:#171616;--p2:#262525;--l:#454444;--t:#F0F1F3;--m:#8B909B;--a:#D6D8DC;--ok:#23724a;--no:#a8434b;--w:#a9741a}\n#hsiaReg *{box-sizing:border-box}\n#hsiaReg{background:#030202;color:#F0F1F3;font:15px/1.45 Inter,\"Noto Sans Bengali\",system-ui,sans-serif}\n#hsiaReg main{max-width:480px;margin:0 auto;padding:18px 16px calc(36px + env(safe-area-inset-bottom,0px))}\n#hsiaReg .bar{padding:calc(9px + env(safe-area-inset-top,0px)) 14px 9px;font:700 13px 'Space Grotesk',Inter,sans-serif;letter-spacing:.04em;text-align:center;color:#fff;position:sticky;top:0;z-index:5}\n#hsiaReg .ok{background:var(--ok)}\n#hsiaReg .no{background:var(--no)}\n#hsiaReg .wait{background:var(--w)}\n#hsiaReg .card{background:var(--c);border:1px solid var(--l);border-radius:16px;padding:16px;margin:12px 0;box-shadow:0 20px 60px rgba(0,0,0,.35)}\n#hsiaReg .ttl{font:700 11px 'Space Grotesk',Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--m);margin-bottom:10px}\n#hsiaReg h3{margin:0 0 6px;font-family:'Space Grotesk',Inter,sans-serif}\n#hsiaReg .mut{color:var(--m);font-size:13px}\n#hsiaReg label{display:block;font-size:12px;color:var(--m);margin:12px 0 0;letter-spacing:.02em}\n#hsiaReg input,#hsiaReg select,#hsiaReg .in{width:100%;padding:11px 12px;margin-top:5px;border-radius:10px;border:1px solid var(--l);background:var(--bg);color:var(--t);font:inherit;text-align:left}\n#hsiaReg input:focus{outline:0;border-color:#A6ABB4}\n#hsiaReg input[readonly]{opacity:.6}\n#hsiaReg button{font:inherit;cursor:pointer}\n#hsiaReg .b,#hsiaReg .g{font-family:'Space Grotesk',Inter,sans-serif}\n#hsiaReg .b{width:100%;margin-top:12px;padding:12px 16px;border-radius:12px;border:1px solid #d6d8dc;background:linear-gradient(135deg,#A9AEB8,#DADCE0);color:#14151a;font-weight:700;font-size:14px;letter-spacing:.02em}\n#hsiaReg .b.gh{background:var(--p2);color:var(--m);border:1px solid var(--l)}\n#hsiaReg .g{padding:8px 13px;margin:6px 6px 0 0;border-radius:10px;border:1px solid var(--l);background:transparent;color:var(--m);font-weight:600;font-size:12.5px}\n#hsiaReg .two{display:flex;gap:10px}\n#hsiaReg .lnk{display:block;text-align:center;color:var(--m);margin:18px;text-decoration:underline;cursor:pointer;font-size:13px}\n#hsiaReg .pic{display:flex;gap:12px;align-items:center;margin-top:14px}\n#hsiaReg .pv{width:86px;height:110px;border-radius:10px;border:1px dashed var(--l);background:var(--bg) center/cover no-repeat;flex:none}\n#hsiaReg .row{display:flex;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--l);cursor:pointer}\n#hsiaReg .row:first-child{border:0}\n#hsiaReg .row img{width:40px;height:52px;object-fit:cover;border-radius:6px;background:var(--bg)}\n#hsiaReg .tabs{display:flex;gap:8px}\n#hsiaReg .tabs .g{flex:1;margin:0;border-radius:999px}\n#hsiaReg .tabs .on{background:rgba(139,144,155,.32);border-color:var(--t);color:var(--t)}\n#hsiaReg .ov{position:fixed;inset:0;z-index:20;background:rgba(0,0,0,.72);display:flex;align-items:flex-end;justify-content:center}\n#hsiaReg .ov>div{background:var(--c);border:1px solid var(--l);width:100%;max-width:480px;max-height:92vh;overflow:auto;border-radius:16px 16px 0 0;padding:16px 16px calc(18px + env(safe-area-inset-bottom,0px))}\n#hsiaReg canvas{touch-action:none;border-radius:8px;border:1px solid var(--l);display:block;margin:8px auto}\n#hsiaReg .kb{font-weight:700;color:var(--a)}\n#hsiaReg .rt{width:100%;border-collapse:collapse;font-size:12px}\n#hsiaReg .rt th,#hsiaReg .rt td{border:1px solid var(--l);padding:8px 3px;text-align:center}\n#hsiaReg .rt th{color:var(--m);font:700 10.5px 'Space Grotesk',Inter,sans-serif;white-space:nowrap}\n#hsiaReg .rt td[data-n]{cursor:pointer}\n#hsiaReg .rt td.dim{opacity:.2}\n#hsiaReg .av{flex:none;width:84px;height:84px;border-radius:50%;padding:3px;background:conic-gradient(#ff6a6a,#ffd36a,#7bff9a,#6ab4ff,#b58cff,#ff6a6a)}\n#hsiaReg .av i{display:block;width:100%;height:100%;border-radius:50%;background:var(--bg) center 25%/cover no-repeat}\n#hsiaReg .bar.tb{padding:calc(4px + env(safe-area-inset-top,0px)) 10px 4px;font-size:11px;background:var(--no)}\n#hsiaReg .pk{flex:1;padding:13px 0;border-radius:10px;border:1px solid var(--l);background:var(--p2);color:var(--m);font:700 15px 'Space Grotesk',Inter,sans-serif}\n#hsiaReg .pk:active{background:linear-gradient(135deg,#A6ABB4,#D6D8DC);color:#1B2130}\n#hsiaReg .fd{border:1px solid var(--l);border-radius:12px;padding:4px 10px;margin:8px 0;background:var(--p2)}\n#hsiaReg .fr,#hsiaReg .ps{display:flex;align-items:center;gap:8px;padding:7px 0}\n#hsiaReg .ps{border-top:1px solid var(--l)}\n#hsiaReg .pl{margin-left:14px}\n#hsiaReg .fn{flex:1;min-width:0;word-break:break-word}\n#hsiaReg .gp{padding:6px 8px;color:var(--m);font-size:18px;touch-action:none;user-select:none;cursor:grab}\n#hsiaReg .ic{width:34px;height:34px;border-radius:9px;border:1px solid var(--l);background:transparent;color:var(--m);font-size:15px}\n#hsiaReg .dg{opacity:.7;background:var(--c);position:relative;z-index:3}\n#hsiaReg .ins{box-shadow:0 -2px 0 var(--a)}\n#hsiaReg .insb{box-shadow:0 2px 0 var(--a)}\n#hsiaReg .fh{font:700 11px 'Space Grotesk',Inter,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--m);margin:12px 0 2px}\n#hsiaReg{position:fixed;inset:0;z-index:10050;overflow:auto;-webkit-overflow-scrolling:touch}\n#hsiaReg main{padding-top:calc(34px + env(safe-area-inset-top,0px))}\n#hsiaRegBar{position:fixed;top:0;left:0;right:0;z-index:10060;padding:calc(4px + env(safe-area-inset-top,0px)) 10px 4px;font:700 11px 'Space Grotesk',Inter,system-ui,sans-serif;letter-spacing:.04em;text-align:center;color:#fff;display:none}\n#hsiaRegBar a{color:#fff;text-decoration:underline;margin-left:10px;cursor:pointer}\n#hsiaRegBar.ok{background:#23724a}#hsiaRegBar.no{background:#a8434b}#hsiaRegBar.wait{background:#a9741a}#hsiaRegBar.tb{background:#a8434b}\n#hsiaRegAdm{display:none}"; document.head.appendChild(s);
  if(!document.getElementById('hsiaRegFonts')){ var l=document.createElement('link'); l.id='hsiaRegFonts'; l.rel='stylesheet'; l.href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Grotesk:wght@500;700&display=swap'; document.head.appendChild(l); } }
function tick(){
  var a=!!(window.hsiaCanSeeOthers&&window.hsiaCanSeeOthers()); if(a!==adm){ adm=a; render(); }
  if(!on()||(U&&!U.isAnonymous)) return; if(!ts) return;
  if(left()<=0){ if(barEl.className==='tb'&&cur===''||document.getElementById('tb')) render(); return; }
  var e=document.getElementById('tb'); if(e) e.textContent='Trial - '+hms(left())+' left';
}
function boot(){
  css(); R=document.createElement('div'); R.id='hsiaReg'; R.style.display='none'; R.innerHTML='<main id="app"></main>'; document.body.appendChild(R);
  barEl=document.createElement('div'); barEl.id='hsiaRegBar'; document.body.appendChild(barEl);
  admEl=document.createElement('button'); admEl.id='hsiaRegAdm'; admEl.type='button'; admEl.className='fr-dbimport'; admEl.textContent='Registrations';
  /* sits in Settings, to the right of the Mandatory login button (falls back to the page body if Settings is missing) */
  var _ab=document.getElementById('regActivateBtn'); if(_ab&&_ab.parentNode){ _ab.parentNode.style.cssText+=';display:flex;flex-wrap:wrap;gap:8px;align-items:stretch'; _ab.parentNode.appendChild(admEl); } else document.body.appendChild(admEl);
  admEl.onclick=function(){ loadAll().then(function(){ v='admin'; render(); }).catch(function(e){ alert('Could not load: '+((e&&e.message)||e)); }); };
  barEl.onclick=function(e){ var t=e.target;
    if(t.id==='rgOut'){ firebase.auth().signOut().then(function(){ P=undefined; return firebase.auth().signInAnonymously().catch(function(){}); }); }
    else if(t.id==='rgEdit'){ v='form'; render(); } else if(t.id==='rgLogin'){ v='login'; render(); } };
  var tries=0, t=setInterval(function(){
    tries++; var ok=typeof firebase!=='undefined'&&firebase.auth&&firebase.apps&&firebase.apps.length&&typeof _fbDb!=='undefined'&&_fbDb;
    if(!ok){ if(tries>80) clearInterval(t); return; }
    clearInterval(t);
    ref('hsia_people/folders').on('value',function(s){ var x=s.val(); db.fold=x?normFold(x):JSON.parse(JSON.stringify(DEF)); route(); },function(){ db.fold=db.fold||JSON.parse(JSON.stringify(DEF)); route(); });
    ref('hsia_public/config').on('value',function(s){ CFG=s.val()||{loginRequired:false}; ts=+localStorage.getItem(TK())||0; adminBox(); render(); },function(){ CFG={loginRequired:false}; adminBox(); route(); });
    firebase.auth().onAuthStateChanged(function(u){ U=u; authKnown=true; attach(u); route(); });
    setInterval(tick,1000);
  },250);
}
window.hsiaRegAdmin=function(){ if(admEl) admEl.click(); };
if(document.body) boot(); else document.addEventListener('DOMContentLoaded',boot);
})();
