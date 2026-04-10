/* ═══════════════════════════════════════════════════════════════════
DAZURA NEURAL SYSTEMS — dazura_app.js
─────────────────────────────────────────────────────────────────
קוד הממשק המלא: מנוע חיפוש, BOM, ייצוא, גרף, סורק ועוד
טוען אחרי: dazura_semantics.js
═══════════════════════════════════════════════════════════════════ */

(function(){
/* ══ LS KEYS ══ */
const LS={DB:‘dazura_v45_db’,BOM:‘dazura_v45_bom’,FAM:‘dazura_v45_fam’,STOCK:‘dazura_v45_stock’,VERS:‘dazura_v45_versions’,THEME:‘dazura_v45_theme’,FONT:‘dazura_v45_font’};
function tryParse(k,d){try{return JSON.parse(localStorage.getItem(k))||d;}catch{return d;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{toast(‘שגיאת שמירה’,’#e00’);}}

/* ══ STATE ══ */
let db=tryParse(LS.DB,[]),bom=tryParse(LS.BOM,[]),families=tryParse(LS.FAM,[‘Connectors’,‘Wires’,‘Tools’]),versions=tryParse(LS.VERS,[]);
let stockMap={},stockRows=[],isApproved=false,currentBase64=’’,customFields=[],searchDebounce=null,selectedKeys=new Set(),famSearchFilter=null;
let toastTimer=null;

/* ══ THEME ENGINE ══ */
const THEMES=[
{id:’’,           label:‘🔵 כחול מקצועי’, desc:‘כחול מקצועי’},
{id:‘t-midnight’, label:‘🌑 Midnight’,     desc:‘Midnight’},
{id:‘t-slate’,    label:‘⬛ Slate Dark’,   desc:‘Slate Dark’},
{id:‘t-forest’,   label:‘🌲 Forest’,       desc:‘Forest’},
{id:‘t-amber’,    label:‘🟡 Amber’,        desc:‘Amber’},
{id:‘t-rose’,     label:‘🌸 Rose’,         desc:‘Rose’},
{id:‘t-arctic’,   label:‘🧊 Arctic’,       desc:‘Arctic’},
{id:‘t-violet’,   label:‘💜 Violet’,       desc:‘Violet Pro’},
{id:‘t-carbon’,   label:‘⚫ Carbon’,       desc:‘Carbon’},
{id:‘t-solar’,    label:‘☀️ Solar’,        desc:‘Solar’},
];
let themeIdx=parseInt(tryParse(LS.THEME,0))||0;
function applyTheme(){document.body.className=THEMES[themeIdx].id;document.getElementById(‘themeBtn’).textContent=‘🎨 ‘+(THEMES[themeIdx].desc||THEMES[themeIdx].label.replace(/^\S+ /,’’));save(LS.THEME,themeIdx);}
document.getElementById(‘themeBtn’).addEventListener(‘click’,()=>{themeIdx=(themeIdx+1)%THEMES.length;applyTheme();});
if(!localStorage.getItem(LS.THEME)&&window.matchMedia&&window.matchMedia(’(prefers-color-scheme: dark)’).matches){themeIdx=1;}
applyTheme();

/* ══ FONT SIZE ══ */
const fontSlider=document.getElementById(‘fontSlider’);
const savedFont=localStorage.getItem(LS.FONT);
if(savedFont){fontSlider.value=savedFont;document.documentElement.style.setProperty(’–font-base’,savedFont+‘px’);}
fontSlider.addEventListener(‘input’,()=>{const v=fontSlider.value;document.documentElement.style.setProperty(’–font-base’,v+‘px’);localStorage.setItem(LS.FONT,v);});

/* ══ PRINT ══ */
document.getElementById(‘printBOMBtn’).addEventListener(‘click’,()=>{switchTab(‘bom’);setTimeout(()=>window.print(),200);});

/* ══ TOAST ══ */
function toast(m,c){
if(toastTimer)clearTimeout(toastTimer);
const t=document.getElementById(‘toast’);
t.textContent=m;t.style.background=c||’’;
t.classList.add(‘show’);
toastTimer=setTimeout(()=>{t.classList.remove(‘show’);toastTimer=null;},2500);
}

/* ══ ESC ══ */
function esc(s){return String(s||’’).replace(/&/g,’&’).replace(/</g,’<’).replace(/>/g,’>’).replace(/”/g,’"’).replace(/’/g,’'’);}

/* ══ RESIZE IMAGE ══ */
function resizeImage(file,cb){const c=document.createElement(‘canvas’),img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{const m=200;let w=img.width,h=img.height;if(w>m||h>m){if(w>h){h=Math.round(h*m/w);w=m;}else{w=Math.round(w*m/h);h=m;}}c.width=w;c.height=h;c.getContext(‘2d’).drawImage(img,0,0,w,h);URL.revokeObjectURL(url);cb(c.toDataURL(‘image/jpeg’,.75));};img.onerror=()=>{URL.revokeObjectURL(url);cb(’’);};img.src=url;}

/* ════════════════════════════════════════════════════════
ENGINE v2
════════════════════════════════════════════════════════ */
function editDist(a,b){
a=a.toLowerCase();b=b.toLowerCase();
if(a===b)return 0;
const la=a.length,lb=b.length;
if(!la)return lb;if(!lb)return la;
let prev=Array.from({length:lb+1},(_,i)=>i),curr=[];
for(let i=1;i<=la;i++){
curr[0]=i;
for(let j=1;j<=lb;j++)curr[j]=a[i-1]===b[j-1]?prev[j-1]:1+Math.min(prev[j],curr[j-1],prev[j-1]);
[prev,curr]=[curr,prev];
}
return prev[lb];
}

function tokenize(s){
return String(s||’’).toLowerCase()
.replace(/[^\w\u0590-\u05ff\s]/g,’ ’)
.split(/\s+/).filter(w=>w.length>1);
}

function soundex(s){
s=String(s||’’).toUpperCase().replace(/[^A-Z0-9]/g,’’);
if(!s)return’0000’;
const map={B:‘1’,F:‘1’,P:‘1’,V:‘1’,C:‘2’,G:‘2’,J:‘2’,K:‘2’,Q:‘2’,S:‘2’,X:‘2’,Z:‘2’,
D:‘3’,T:‘3’,L:‘4’,M:‘5’,N:‘5’,R:‘6’};
let code=s[0],prev=map[s[0]]||‘0’;
for(let i=1;i<s.length&&code.length<4;i++){
const c=map[s[i]]||‘0’;
if(c!==‘0’&&c!==prev)code+=c;
prev=c;
}
return (code+‘000’).slice(0,4);
}

function metaphone(s){
s=String(s||’’).toUpperCase().replace(/[^A-Z]/g,’’);
if(!s)return’’;
s=s.replace(/^AE|^GN|^KN|^PN|^WR/,’’);
let r=’’;
for(let i=0;i<s.length;i++){
const c=s[i],p=s[i-1]||’’,n=s[i+1]||’’,nn=s[i+2]||’’;
if(‘AEIOU’.includes(c)){if(i===0)r+=c;continue;}
if(c===‘B’){if(p!==‘M’)r+=‘B’;continue;}
if(c===‘C’){if(n===‘I’||n===‘E’||n===‘Y’){r+=‘S’;}else if(n===‘H’){r+=‘X’;i++;}else r+=‘K’;continue;}
if(c===‘D’){r+=n===‘G’&&‘IEY’.includes(nn)?‘J’:‘T’;continue;}
if(c===‘G’){if(n===‘H’&&!‘AEIOU’.includes(nn))continue;if(n===‘N’&&(nn===’’||(nn===‘E’&&s[i+3]===’’)))continue;if(‘IEY’.includes(n))r+=‘J’;else r+=‘K’;continue;}
if(c===‘H’){if(‘AEIOU’.includes(n)&&!‘AEIOU’.includes(p))r+=‘H’;continue;}
if(c===‘K’){if(p!==‘C’)r+=‘K’;continue;}
if(c===‘P’){r+=n===‘H’?‘F’:‘P’;continue;}
if(c===‘Q’){r+=‘K’;continue;}
if(c===‘S’){r+=n===‘H’||(n===‘I’&&(‘AO’.includes(nn)))?‘X’:‘S’;continue;}
if(c===‘T’){r+=n===‘H’?‘0’:(n===‘I’&&‘AO’.includes(nn))?‘X’:‘T’;continue;}
if(c===‘V’){r+=‘F’;continue;}
if(c===‘W’||c===‘Y’){if(‘AEIOU’.includes(n))r+=c;continue;}
if(c===‘X’){r+=‘KS’;continue;}
if(c===‘Z’){r+=‘S’;continue;}
r+=c;
}
return r;
}

function phoneticSim(a,b){
const sa=soundex(a),sb=soundex(b);
const ma=metaphone(a),mb=metaphone(b);
let score=0;
if(sa===sb)score+=0.4;
if(ma&&mb&&ma===mb)score+=0.4;
else if(ma&&mb){const ml=Math.max(ma.length,mb.length)||1;score+=0.4*Math.max(0,1-editDist(ma,mb)/ml);}
const ml2=Math.max(a.length,b.length)||1;
score+=0.2*Math.max(0,1-editDist(a,b)/ml2);
return Math.min(score,1);
}

let tfidfIndex={idf:{},docs:[]};

function buildItemText(item){
return […Array(3).fill(item.k),…Array(2).fill(item.v||’’),item.c||’’,…(item.custom||[]).flatMap(f=>[f.label,f.label,f.value,f.value]),…(item.req||[]),item.tool||’’].join(’ ’);
}

function buildTFIDF(){
const N=db.length;
if(!N){tfidfIndex={idf:{},docs:[]};return;}
const df={};
const docTokens=db.map(item=>{
const tokens=tokenize(buildItemText(item));
const tf={};
tokens.forEach(t=>{tf[t]=(tf[t]||0)+1;});
const maxTF=Math.max(…Object.values(tf),1);
Object.keys(tf).forEach(t=>tf[t]=tf[t]/maxTF);
Object.keys(tf).forEach(t=>{df[t]=(df[t]||0)+1;});
return tf;
});
const idf={};
Object.keys(df).forEach(t=>{idf[t]=Math.log((N+1)/(df[t]+1))+1;});
const docs=docTokens.map(tf=>{
const vec={};
Object.keys(tf).forEach(t=>{vec[t]=tf[t]*(idf[t]||1);});
const norm=Math.sqrt(Object.values(vec).reduce((s,v)=>s+v*v,0))||1;
Object.keys(vec).forEach(t=>vec[t]/=norm);
return vec;
});
tfidfIndex={idf,docs};
const badge=document.getElementById(‘engineBadge’);
if(badge)badge.textContent=`🧠 Engine v2 · TF-IDF · Cosine · Phonetic · ${N} פריטים indexed · ${Object.keys(idf).length} terms`;
}

function queryTFIDF(qText){
const {idf,docs}=tfidfIndex;
if(!docs.length)return[];
const tokens=tokenize(qText);
const tf={};
tokens.forEach(t=>{tf[t]=(tf[t]||0)+1;});
const maxTF=Math.max(…Object.values(tf),1);
const qvec={};
Object.keys(tf).forEach(t=>{qvec[t]=(tf[t]/maxTF)*(idf[t]||Math.log(2));});
const qnorm=Math.sqrt(Object.values(qvec).reduce((s,v)=>s+v*v,0))||1;
Object.keys(qvec).forEach(t=>qvec[t]/=qnorm);
return docs.map((dvec,i)=>{
let dot=0;
Object.keys(qvec).forEach(t=>{if(dvec[t])dot+=qvec[t]*dvec[t];});
return{idx:i,cos:dot};
});
}

function cosineSim(vecA,vecB){
let dot=0,na=0,nb=0;
const keys=new Set([…Object.keys(vecA),…Object.keys(vecB)]);
keys.forEach(k=>{const a=vecA[k]||0,b=vecB[k]||0;dot+=a*b;na+=a*a;nb+=b*b;});
return dot/(Math.sqrt(na)*Math.sqrt(nb)||1);
}

let _dupCache=null,_dupCacheLen=-1;
function invalidateDupCache(){_dupCache=null;_dupCacheLen=-1;tfidfIndex={idf:{},docs:[]};}
function ensureTFIDF(){if(!tfidfIndex.docs.length&&db.length)buildTFIDF();}

function altScore(qi,ci,fromIdx,toIdx){
if(!qi||!ci||qi.k.toLowerCase()===ci.k.toLowerCase())return{score:0,reasons:[]};
let score=0;const reasons=[];
const ps=phoneticSim(qi.k,ci.k);
const phonePts=Math.round(ps*30);
score+=phonePts;
if(ps>0.55)reasons.push(`צליל דומה (${Math.round(ps*100)}%)`);
ensureTFIDF();
const {docs}=tfidfIndex;
if(docs.length&&fromIdx!==undefined&&toIdx!==undefined&&docs[fromIdx]&&docs[toIdx]){
const cos=cosineSim(docs[fromIdx],docs[toIdx]);
const cosPts=Math.round(cos*40);
score+=cosPts;
if(cos>0.25)reasons.push(`תוכן דומה (${Math.round(cos*100)}%)`);
}else{
const qw=tokenize(qi.v),cw=tokenize(ci.v);
if(qw.length&&cw.length){const ov=qw.filter(w=>cw.includes(w)).length;const ovPts=Math.round(ov/Math.max(qw.length,cw.length)*15);score+=ovPts;if(ovPts>3)reasons.push(`תיאור דומה`);}
}
if(qi.c&&ci.c&&qi.c===ci.c){score+=20;reasons.push(`משפחה: ${esc(qi.c)}`);}
const qf=qi.custom||[],cf=ci.custom||[];
if(qf.length){
let matched=0;
qf.forEach(f=>{const c2=cf.find(x=>x.label.toLowerCase()===f.label.toLowerCase());if(c2&&f.value&&c2.value&&f.value.toLowerCase()===c2.value.toLowerCase()){matched++;reasons.push(`${esc(f.label)}=${esc(f.value)}`);}});
if(matched)score+=Math.round(matched/qf.length*20);
}
const finalScore=Math.min(score,100);
if(finalScore>5&&fromIdx!==undefined&&toIdx!==undefined)emitNeuralSignal(fromIdx,toIdx,finalScore,1);
return{score:finalScore,reasons};
}

function findBestAlt(k){
ensureTFIDF();
const fromIdx=db.findIndex(x=>x.k.toLowerCase()===k.toLowerCase());
const qi=fromIdx>=0?db[fromIdx]:null;
if(!qi){
const cs=db.map((c,ci)=>{const ps=phoneticSim(k,c.k);const s=Math.round(ps*60);if(s>5)emitNeuralSignal(0,ci,s,0);return{item:c,score:s,reasons:s>5?[`צליל דומה (${Math.round(ps*100)}%)`]:[]};}).filter(x=>x.score>5).sort((a,b)=>b.score-a.score);
return cs.length?cs[0]:null;
}
const sc=db.map((c,ci)=>({item:c,…altScore(qi,c,fromIdx,ci)})).filter(x=>x.item.k.toLowerCase()!==k.toLowerCase()&&x.score>5).sort((a,b)=>b.score-a.score);
return sc.length?sc[0]:null;
}

function findDuplicates(){
if(_dupCacheLen===db.length&&_dupCache!==null)return _dupCache;
ensureTFIDF();
const {docs}=tfidfIndex;
const p=[];
for(let i=0;i<db.length;i++){
for(let j=i+1;j<db.length;j++){
const ps=phoneticSim(db[i].k,db[j].k);
const cos=docs[i]&&docs[j]?cosineSim(docs[i],docs[j]):0;
const sim=(ps*0.6+cos*0.4);
if(sim>=0.65)p.push({a:db[i].k,b:db[j].k,sim:Math.round(sim*100)});
}
}
_dupCache=p;_dupCacheLen=db.length;
return p;
}

/* ══ FAMILY ══ */
function saveFamilies(){save(LS.FAM,families);}
function updateFamilyList(keepVal){
const sel=document.getElementById(‘catSelect’),prev=keepVal||sel.value;
families=[…new Set([…families,…db.map(x=>x.c).filter(Boolean)])].sort();
saveFamilies();
sel.innerHTML=families.map(f=>`<option value="${esc(f)}">${esc(f)}</option>`).join(’’);
if(prev&&families.includes(prev))sel.value=prev;
const ff=document.getElementById(‘dbFamFilter’);
if(ff)ff.innerHTML=`<option value="">כל המשפחות</option>`+families.map(f=>`<option value="${esc(f)}">${esc(f)}</option>`).join(’’);
renderFamFilterChips();
}
document.getElementById(‘addFamilyBtn’).addEventListener(‘click’,()=>{
const inp=document.getElementById(‘newFamilyInput’),btn=document.getElementById(‘addFamilyBtn’);
if(btn.textContent.trim()===’+ חדשה’){inp.style.display=‘block’;inp.focus();btn.textContent=‘✔ שמור’;}
else{const n=inp.value.trim();if(!n){toast(‘הכנס שם משפחה’,’’);return;}if(families.includes(n)){toast(‘קיים’,’’);return;}families.push(n);saveFamilies();updateFamilyList(n);document.getElementById(‘catSelect’).value=n;inp.value=’’;inp.style.display=‘none’;btn.textContent=’+ חדשה’;toast(`"${n}" נוספה ✅`,’’);}
});
document.getElementById(‘newFamilyInput’).addEventListener(‘keydown’,e=>{if(e.key===‘Enter’)document.getElementById(‘addFamilyBtn’).click();if(e.key===‘Escape’){e.target.value=’’;e.target.style.display=‘none’;document.getElementById(‘addFamilyBtn’).textContent=’+ חדשה’;}});
document.getElementById(‘delFamilyBtn’).addEventListener(‘click’,()=>{const n=document.getElementById(‘catSelect’).value;if(db.some(x=>x.c===n)){toast(`"${n}" בשימוש`,’’);return;}if(!confirm(`למחוק "${n}"?`))return;families=families.filter(f=>f!==n);saveFamilies();updateFamilyList();toast(‘נמחקה’,’’);});

function renderFamFilterChips(){
const el=document.getElementById(‘famFilterChips’);if(!el)return;
if(families.length>10){
el.innerHTML=`<select id="famDropdown" style="width:100%;padding:6px 9px;border-radius:7px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:.88em;margin-bottom:8px;"><option value="">🔽 כל המשפחות</option>${families.map(f=>`<option value=”${esc(f)}” ${famSearchFilter===f?‘selected’:’’}>${esc(f)}</option>`).join('')}</select>`;
el.querySelector(’#famDropdown’).addEventListener(‘change’,e=>{famSearchFilter=e.target.value||null;clearTimeout(searchDebounce);searchDebounce=setTimeout(solve,50);});
}else{
el.innerHTML=`<span class="fam-chip${!famSearchFilter?' active':''}" data-fam="">הכל</span>`+families.map(f=>`<span class="fam-chip${famSearchFilter===f?' active':''}" data-fam="${esc(f)}">${esc(f)}</span>`).join(’’);
el.querySelectorAll(’.fam-chip’).forEach(c=>c.addEventListener(‘click’,()=>{famSearchFilter=c.dataset.fam||null;renderFamFilterChips();clearTimeout(searchDebounce);searchDebounce=setTimeout(solve,50);}));
}
}

/* ══ CUSTOM FIELDS ══ */
function renderCF(){
const ct=document.getElementById(‘customFieldsList’);ct.innerHTML=’’;
customFields.forEach((f,i)=>{const r=document.createElement(‘div’);r.className=‘cf-row’;r.innerHTML=`<input type="text" placeholder="שם שדה" value="${esc(f.label)}" data-i="${i}" data-r="label"><input type="text" placeholder="ערך" value="${esc(f.value)}" data-i="${i}" data-r="value"><button class="btn-rm-field" data-i="${i}">✖</button>`;ct.appendChild(r);});
ct.querySelectorAll(‘input’).forEach(inp=>inp.addEventListener(‘input’,e=>customFields[+e.target.dataset.i][e.target.dataset.r]=e.target.value));
ct.querySelectorAll(’.btn-rm-field’).forEach(b=>b.addEventListener(‘click’,e=>{customFields.splice(+e.currentTarget.dataset.i,1);renderCF();}));
}
document.getElementById(‘addCustomFieldBtn’).addEventListener(‘click’,()=>{customFields.push({label:’’,value:’’});renderCF();const ins=document.querySelectorAll(’#customFieldsList input[data-r=“label”]’);if(ins.length)ins[ins.length-1].focus();});

/* ══ IMAGE ══ */
document.getElementById(‘itemImg’).addEventListener(‘change’,function(){if(this.files&&this.files[0])resizeImage(this.files[0],b=>{currentBase64=b;const p=document.getElementById(‘setupPreview’);p.src=b;p.style.display=b?‘block’:‘none’;});});

/* ══ SAVE ITEM ══ */
document.getElementById(‘saveBtn’).addEventListener(‘click’,()=>{
const k=document.getElementById(‘key’).value.trim();
if(!k){toast(‘נא להזין מק”ט’,’’);return;}
const item={k,v:document.getElementById(‘val’).value.trim(),c:document.getElementById(‘catSelect’).value,img:currentBase64,minStock:parseInt(document.getElementById(‘minStockInput’)?.value)||0,location:(document.getElementById(‘warehouseLocation’)?.value||’’).trim(),rules:[],
req:document.getElementById(‘reqInput’).value.split(’,’).map(s=>s.trim()).filter(Boolean),
tool:document.getElementById(‘toolInput’).value.trim(),
acc:document.getElementById(‘accInput’).value.split(’,’).map(s=>s.trim()).filter(Boolean),
custom:customFields.filter(f=>f.label).map(f=>({label:f.label.trim(),value:f.value.trim()}))};
const idx=db.findIndex(x=>x.k.toLowerCase()===k.toLowerCase());
if(idx>-1)db[idx]=item;else db.push(item);
save(LS.DB,db);invalidateDupCache();buildTFIDF();toast(‘נשמר ✅’,’’);
currentBase64=’’;customFields=[];
document.getElementById(‘setupPreview’).style.display=‘none’;
document.getElementById(‘itemImg’).value=’’;
renderCF();updateFamilyList(item.c);renderDBTable();
});

/* ══ BULK CSV ══ */
function parseBulkCSV(text){
const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);let imported=0,skipped=0;
lines.forEach((line,li)=>{const sep=line.includes(’;’)?’;’:’,’;const parts=line.split(sep).map(p=>p.replace(/^[”’]|[”’]$/g,’’).trim());if(li===0&&parts[0].toLowerCase()===‘partnumber’)return;if(!parts[0]){skipped++;return;}const k=parts[0],v=parts[1]||’’,c=parts[2]||‘General’,custom=[];for(let i=3;i<parts.length-1;i+=2)if(parts[i])custom.push({label:parts[i],value:parts[i+1]||’’});const item={k,v,c,img:’’,req:[],tool:’’,acc:[],custom};const idx=db.findIndex(x=>x.k.toLowerCase()===k.toLowerCase());if(idx>-1)db[idx]=item;else db.push(item);imported++;});
save(LS.DB,db);invalidateDupCache();buildTFIDF();updateFamilyList();return{imported,skipped};
}
function setupDrop(zoneId,fileId,cb){
const z=document.getElementById(zoneId);
z.addEventListener(‘click’,()=>document.getElementById(fileId).click());
z.addEventListener(‘dragover’,e=>{e.preventDefault();z.style.borderColor=‘var(–primary)’;});
z.addEventListener(‘dragleave’,()=>z.style.borderColor=’’);
z.addEventListener(‘drop’,e=>{e.preventDefault();z.style.borderColor=’’;const f=e.dataTransfer.files[0];if(f)cb(f);});
document.getElementById(fileId).addEventListener(‘change’,function(){if(this.files[0])cb(this.files[0]);this.value=’’;});
}
setupDrop(‘bulkDropZone’,‘bulkCsvFile’,file=>{
if(file.name.match(/.xlsx?$/i)){
const r=new FileReader();r.onload=ev=>{try{
const wb2=XLSX.read(ev.target.result,{type:‘array’});
const ws2=wb2.Sheets[wb2.SheetNames[0]];
const rows=XLSX.utils.sheet_to_json(ws2,{header:1,defval:’’});
let imported=0;
rows.forEach((row,li)=>{if(li===0)return;const k=String(row[0]||’’).trim();if(!k)return;const v=String(row[1]||’’).trim(),c=String(row[2]||‘General’).trim(),custom=[];for(let i=3;i<row.length-1;i+=2)if(row[i])custom.push({label:String(row[i]).trim(),value:String(row[i+1]||’’).trim()});const item={k,v,c,img:’’,req:[],tool:’’,acc:[],custom,minStock:0,location:’’};const idx2=db.findIndex(x=>x.k.toLowerCase()===k.toLowerCase());if(idx2>-1)db[idx2]=item;else db.push(item);imported++;});
save(LS.DB,db);invalidateDupCache();buildTFIDF();updateFamilyList();renderDBTable();
const info=document.getElementById(‘importInfo’);if(info){info.style.display=‘block’;info.textContent=‘✅ יובאו מ-Excel ‘+imported;}
toast(‘יובאו ‘+imported+’ מ-Excel’,’’);
}catch(e){toast(‘שגיאת Excel’,’’);}};r.readAsArrayBuffer(file);
}else{
const r=new FileReader();r.onload=ev=>{const{imported,skipped}=parseBulkCSV(ev.target.result);const info=document.getElementById(‘importInfo’);if(info){info.style.display=‘block’;info.textContent=‘✅ יובאו ‘+imported+(skipped?’ (’+skipped+’ דולגו)’:’’);}toast(‘יובאו ‘+imported,’’);};r.readAsText(file);
}
});

/* ════════════════
SEARCH v2
════════════════ */
function solve(){
const q=document.getElementById(‘q’).value.trim();
const thr=parseInt(document.getElementById(‘precisionRange’).value);
const chat=document.getElementById(‘chat’);
if(!q){chat.innerHTML=’’;return;}
ensureTFIDF();
const ql=q.toLowerCase();
const _semExpanded=typeof dazuraExpand===‘function’?dazuraExpand(q):[];
const qTokens=tokenize(q);
const cosScores=queryTFIDF(q);

let res=db.map((item,dbIdx)=>{
const area=(item.k+’ ‘+item.v+’ ‘+item.c+’ ‘+(item.location||’’)+’ ‘+(item.custom||[]).map(f=>f.label+’ ‘+f.value).join(’ ’)).toLowerCase();
let score=0;const reasons=[];
if(area.includes(ql)){score+=50;reasons.push(‘התאמה מדויקת’);}
const cos=cosScores[dbIdx]?cosScores[dbIdx].cos:0;
const cosPts=Math.round(cos*60);
score+=cosPts;
if(cos>0.15)reasons.push(`TF-IDF ${Math.round(cos*100)}%`);
qTokens.forEach(qt=>{
const ps=phoneticSim(qt,item.k);
if(ps>=0.5){score+=Math.round(ps*22);if(!reasons.includes(‘צליל מק”ט’))reasons.push(‘צליל מק”ט’);}
tokenize(item.v).forEach(dt=>{if(dt.length<3)return;const ps2=phoneticSim(qt,dt);if(ps2>=0.5){score+=Math.round(ps2*18);if(!reasons.includes(‘צליל תיאור’))reasons.push(‘צליל תיאור’);}});
(item.custom||[]).forEach(f=>{tokenize(f.value).forEach(fv=>{if(phoneticSim(qt,fv)>=0.7)score+=8;});});
});
qTokens.forEach(qt=>{
const _kl=item.k.toLowerCase();
if(qt.length>=3){
if(_kl.includes(qt)){score+=Math.round(qt.length/_kl.length*40);if(!reasons.includes(‘חלקי’))reasons.push(‘חלקי’);}
else{const segs=*kl.split(/[-*.]/);segs.forEach(seg=>{if(!seg)return;if(seg.includes(qt)&&qt.length>=3){score+=Math.round(qt.length/seg.length*30);if(!reasons.includes(‘חלקי’))reasons.push(‘חלקי’);}else if(Math.abs(qt.length-seg.length)<=2){const edSeg=editDist(qt,seg);if(edSeg<=1&&seg.length>2){score+=Math.round((1-edSeg/Math.max(qt.length,seg.length))*25);if(!reasons.includes(‘קרוב’))reasons.push(‘קרוב’);}}});}
}
const mlk=Math.max(qt.length,_kl.length)||1;
const edk=editDist(qt,_kl);
if(edk<=2&&mlk>3)score+=Math.round((1-edk/mlk)*18);
tokenize(item.v).forEach(dt=>{if(Math.abs(qt.length-dt.length)>3)return;const ml2=Math.max(qt.length,dt.length)||1;const ed2=editDist(qt,dt);if(ed2<=1&&ml2>3)score+=Math.round((1-ed2/ml2)*12);else if(ed2<=2&&ml2>4)score+=Math.round((1-ed2/ml2)*8);});
});
if(typeof dazuraScore===‘function’){const semPts=dazuraScore(q,area);if(semPts>0){score+=Math.round(semPts*0.5);if(semPts>25&&!reasons.includes(‘🧠 סמנטי’))reasons.push(‘🧠 סמנטי’);}}
score=Math.min(score,100);
if(score>thr)emitNeuralSignal(0,dbIdx,score,0);
return{…item,score,_dbIdx:dbIdx,_reasons:reasons};
}).filter(r=>r.score>thr);

if(famSearchFilter)res=res.filter(r=>r.c===famSearchFilter);
res.sort((a,b)=>b.score-a.score);
res.slice(0,8).forEach((r,ri)=>emitNeuralSignal(r._dbIdx,ri,r.score,1));

chat.innerHTML=res.map(r=>{
const ct=(r.custom||[]).map(f=>`<span class="tag tag-custom">${esc(f.label)}:${esc(f.value)}</span>`).join(’’);
const qty=stockMap[r.k.toLowerCase()];
const sb=qty!==undefined?`<span class="stock-badge ${qty>0?'stock-ok':'stock-missing'}" style="margin-right:5px;">${qty}</span>`:’’;
const reasonsHtml=r._reasons&&r._reasons.length?`<div style="font-size:.75em;color:var(--text2);margin-top:3px;">🧠 ${r._reasons.slice(0,3).join(' · ')}</div>`:’’;
return `<div class="result-item"><span class="score-badge">${r.score}%</span><img src="${r.img||''}" class="img-preview" alt=""><div style="flex:1"><button class="btn btn-primary add-bom-btn" style="width:55px;float:left;padding:5px 6px;margin-left:2px;" data-k="${esc(r.k)}">הוסף</button><button class="btn btn-ghost param-btn" style="width:28px;float:left;padding:5px 4px;margin-left:2px;" data-k="${esc(r.k)}" title="הוסף עם פרמטרים">⚙️</button><b>${esc(r.k)}</b> ${sb}<span style="color:var(--text2);font-size:.85em;">[${esc(r.c)}]</span><br><span style="font-size:.88em;">${esc(r.v)}</span>${reasonsHtml}<div style="margin-top:6px;">${r.req.map(l=>`<span class="tag tag-req">${esc(l)}</span>`).join('')}${r.tool?`<span class="tag tag-tool">⚒ ${esc(r.tool)}</span>`:''}${r.acc.map(l=>`<span class="tag tag-acc" data-k="${esc(l)}">${esc(l)} +</span>`).join('')}${ct}</div></div></div>`;
}).join(’’);
chat.querySelectorAll(’.add-bom-btn’).forEach(b=>b.addEventListener(‘click’,()=>addToBOM(b.dataset.k)));
chat.querySelectorAll(’.tag-acc’).forEach(t=>t.addEventListener(‘click’,()=>addToBOM(t.dataset.k)));
}
document.getElementById(‘precisionRange’).addEventListener(‘input’,()=>{clearTimeout(searchDebounce);searchDebounce=setTimeout(solve,100);});

/* ══ BOM ══ */
function addToBOM(k){
const item=db.find(x=>x.k.toLowerCase()===k.toLowerCase())||{k,v:‘חסר’,img:’’,req:[],tool:’’,acc:[],custom:[],rules:[]};
if(bom.some(x=>x.k===item.k)){toast(‘כבר ב-BOM’,’’);return;}
if(bom.some(x=>x.approvedAlt&&x.approvedAlt.toLowerCase()===k.toLowerCase())){toast(‘פריט זה הוגדר כחלופה מאושרת’,’’);return;}

const children=[];
item.req.forEach(rk=>{const c=db.find(x=>x.k.toLowerCase()===rk.toLowerCase());children.push({k:rk,v:c?c.v:‘חסר’,img:c?c.img:’’,type:‘REQ’});});
(item.acc||[]).forEach(ak=>{const c=db.find(x=>x.k.toLowerCase()===ak.toLowerCase());children.push({k:ak,v:c?c.v:‘נלווה’,img:c?c.img:’’,type:‘ACC’});});
if(item.tool){
const tc=db.find(x=>x.k.toLowerCase()===item.tool.toLowerCase());
const tQty=stockMap[item.tool.toLowerCase()];
const tNote=(tQty===undefined||tQty===0)?‘חסר — להזמין 1 יח'’:’’;
children.push({k:item.tool,v:tc?tc.v:‘כלי’,img:tc?tc.img:’’,type:‘TOOL’,note:tNote});
}

let finalChildren=children;
if(item.rules&&item.rules.length>0){
const wireCount=bom.filter(b=>_isWireItem(db.find(x=>x.k===b.k)||b)).length;
if(wireCount>0){
finalChildren=_autoResolveFromBOM(item,children);
const added=finalChildren.length-children.length;
bom.push({…item,children:finalChildren,note:’’,qty:1,itemType:‘REQ’,approvedAlt:null,params:{}});
save(LS.BOM,bom);renderBOM();resetApproval();
toast(‘נוסף: ‘+k+(added?’ + ‘+added+’ אביזרים אוטומטיים 🔗’:’’),’’);
}else{
_showRulesDialog(item,children,k);
}
}else{
bom.push({…item,children:finalChildren,note:’’,qty:1,itemType:‘REQ’,approvedAlt:null,params:{}});
save(LS.BOM,bom);renderBOM();resetApproval();toast(‘נוסף: ‘+k,’’);
}

setTimeout(()=>_rescanBOMAfterWireAdded(k),100);
}

function bomHealth(){
if(!bom.length)return null;
const total=bom.length;let ok=0,hasAlt=0,missing=0;
bom.forEach(item=>{
const qty=stockMap[item.k.toLowerCase()];
if(qty===undefined){hasAlt++;return;}
if(qty>0){ok++;return;}
const a=findBestAlt(item.k);
if(a&&a.score>15)hasAlt++;else missing++;
});
return{pct:Math.round(ok/total*100),ok,hasAlt,missing,total};
}

function renderBOM(){
const body=document.getElementById(‘bom-body’);body.innerHTML=’’;
bom.forEach((item,idx)=>{
const qty=stockMap[item.k.toLowerCase()],has=qty!==undefined,inS=has&&qty>0;
const alt=findBestAlt(item.k);
const stHtml=!has?’<span style="color:var(--text2);font-size:.82em;">לא נבדק</span>’:inS?`<span class="stock-badge stock-ok">✅ ${qty}</span>`:`<span class="stock-badge stock-missing">⚠️ 0</span>`;
let altCell=’—’;
if(item.approvedAlt){
altCell=`<div style="display:flex;align-items:center;gap:5px;"><span style="font-size:.72em;font-weight:bold;padding:2px 6px;border-radius:4px;background:var(--stock-ok-bg);color:var(--success);white-space:nowrap;">✅ חלופה מאושרת</span><b style="color:var(--success);font-size:.85em;">${esc(item.approvedAlt)}</b><button class="btn btn-ghost" data-rmalt="${idx}" style="padding:1px 5px;font-size:.75em;color:var(--danger);">✖</button></div>`;
}else if(alt&&alt.score>10){
const aq=stockMap[alt.item.k.toLowerCase()];
const ab=aq!==undefined?`<span class="stock-badge ${aq>0?'stock-ok':'stock-missing'}" style="font-size:.75em;">${aq}</span>`:’’;
altCell=`<div style="min-width:130px;"><div style="font-size:.78em;color:var(--alt);font-weight:bold;">💡 ${esc(alt.item.k)} ${ab} <span style="opacity:.7;">(${alt.score}%)</span></div><div class="alt-row" style="margin:2px 0;"><div class="alt-bar"><div class="alt-fill" style="width:${alt.score}%"></div></div><span class="alt-pct">${alt.score}%</span></div><button class="btn btn-ghost" data-approve="${idx}" data-altk="${esc(alt.item.k)}" style="margin-top:2px;padding:2px 7px;font-size:.75em;color:var(--success);border-color:var(--success);">✅ אשר</button></div>`;
}
const typeBadge=’<span style="font-size:.8em;font-weight:bold;padding:3px 9px;border-radius:4px;background:var(--primary);color:#fff;white-space:nowrap;">ראשי</span>’;
const bomQty=item.qty||1;
let stockAlert=’’;
if(has&&qty<bomQty)stockAlert=`<div style="font-size:.7em;color:var(--danger);font-weight:bold;margin-top:1px;">⚠️ חסר ${bomQty-qty}</div>`;
const noteHtml=`<div class="bom-note" data-ni="${idx}">${item.note?esc(item.note):'<span style="color:var(--border);font-size:.8em;">+ הוסף הערה</span>'}</div><input class="note-input" data-ni="${idx}" placeholder="הערה..." value="${esc(item.note||'')}">`;
const tr=document.createElement(‘tr’);
if(has&&!inS)tr.className=alt&&alt.score>10?‘bom-has-alt’:‘bom-missing’;
tr.innerHTML=`<td><img src="${item.img||''}" class="img-preview" style="width:34px;height:34px;" alt=""></td><td><b>${esc(item.k)}</b></td><td style="font-size:.88em;">${esc(item.v)}</td><td style="min-width:90px;">${noteHtml}</td><td style="text-align:center;"><input type="number" class="qty-input" data-qi="${idx}" value="${bomQty}" min="1" max="9999" style="width:52px;padding:3px 4px;text-align:center;border-radius:5px;border:1px solid var(--border);background:var(--hover);color:var(--text);font-weight:bold;font-size:.9em;">${stockAlert}</td><td>${has?qty:'—'}</td><td>${stHtml}</td><td>${typeBadge}</td><td>${altCell}</td><td style="white-space:nowrap;"><button class="btn btn-ghost" data-idx="${idx}" style="padding:3px 7px;">✖</button><button class="btn btn-ghost" data-up="${idx}" style="padding:3px 6px;font-size:.75em;display:none;">↑</button><button class="btn btn-ghost" data-dn="${idx}" style="padding:3px 6px;font-size:.75em;display:none;">↓</button></td>`;
body.appendChild(tr);
const nd=tr.querySelector(’.bom-note’),ni=tr.querySelector(’.note-input’);
nd.addEventListener(‘click’,()=>{nd.style.display=‘none’;ni.style.display=‘block’;ni.focus();});
ni.addEventListener(‘blur’,()=>{bom[idx].note=ni.value;save(LS.BOM,bom);nd.innerHTML=ni.value?esc(ni.value):’<span style="color:var(--border);font-size:.8em;">+ הוסף הערה</span>’;ni.style.display=‘none’;nd.style.display=‘block’;});
tr.querySelector(’[data-idx]’).addEventListener(‘click’,()=>{bom.splice(idx,1);save(LS.BOM,bom);renderBOM();resetApproval();});
const qi=tr.querySelector(’.qty-input’);
qi.addEventListener(‘change’,e=>{const v=Math.max(1,parseInt(e.target.value)||1);bom[+e.target.dataset.qi].qty=v;e.target.value=v;save(LS.BOM,bom);renderBOM();});
const upBtn=tr.querySelector(’[data-up]’),dnBtn=tr.querySelector(’[data-dn]’);
if(upBtn)upBtn.addEventListener(‘click’,()=>{if(idx>0){const t=bom[idx];bom[idx]=bom[idx-1];bom[idx-1]=t;save(LS.BOM,bom);renderBOM();}});
if(dnBtn)dnBtn.addEventListener(‘click’,()=>{if(idx<bom.length-1){const t=bom[idx];bom[idx]=bom[idx+1];bom[idx+1]=t;save(LS.BOM,bom);renderBOM();}});
if(tr.querySelector(’[data-approve]’)){tr.querySelector(’[data-approve]’).addEventListener(‘click’,e=>{bom[+e.currentTarget.dataset.approve].approvedAlt=e.currentTarget.dataset.altk;save(LS.BOM,bom);renderBOM();toast(‘חלופה אושרה ✅’,’’);});}
if(tr.querySelector(’[data-rmalt]’)){tr.querySelector(’[data-rmalt]’).addEventListener(‘click’,e=>{bom[+e.currentTarget.dataset.rmalt].approvedAlt=null;save(LS.BOM,bom);renderBOM();});}
if(item.approvedAlt){
const ai=db.find(x=>x.k.toLowerCase()===item.approvedAlt.toLowerCase())||{k:item.approvedAlt,v:’’,img:’’};
const ar=document.createElement(‘tr’);
ar.style.cssText=‘background:var(–stock-ok-bg);border-right:4px solid var(–success);’;
ar.innerHTML=`<td><img src="${ai.img||''}" class="img-preview" style="width:28px;height:28px;border:2px solid var(--success);" alt=""></td><td colspan="2"><span style="font-size:.7em;color:var(--success);font-weight:bold;display:block;">✅ חלופה מאושרת</span><b style="color:var(--success);font-size:.88em;">${esc(ai.k)}</b> <span style="font-size:.8em;color:var(--text2);">${esc(ai.v)}</span></td><td></td><td></td><td></td><td><span style="font-size:.75em;padding:2px 6px;border-radius:4px;background:var(--stock-ok-bg);color:var(--success);border:1px solid var(--success);">חלופה</span></td><td></td><td></td><td></td>`;
body.appendChild(ar);
}
item.children.forEach(c=>{
const freshC=db.find(x=>x.k.toLowerCase()===c.k.toLowerCase());
const cs=stockMap[c.k.toLowerCase()],ci=cs!==undefined&&cs>0;
const cTypeLabel=c.type===‘TOOL’?‘כלי’:c.type===‘REQ’?‘נדרש’:‘נלווה’;
const cTypeBg=c.type===‘TOOL’?‘var(–tag-tool-bg)’:c.type===‘REQ’?‘var(–tag-req-bg)’:‘var(–tag-acc-bg)’;
const cTypeFg=c.type===‘TOOL’?‘var(–tag-tool-c)’:c.type===‘REQ’?‘var(–tag-req-c)’:‘var(–tag-acc-c)’;
const cSt=cs===undefined?’<span style="color:var(--text2);font-size:.82em;">לא נבדק</span>’:ci?`<span class="stock-badge stock-ok">✅ ${cs}</span>`:’<span class="stock-badge stock-missing">⚠️ חסר</span>’;
// Show resolved-from info
const resolvedNote=c.resolved&&c.resolvedFrom?`<div style="font-size:.7em;color:var(--text2);margin-top:1px;">🔗 ${esc(c.resolvedFrom)}${c.note?' · '+esc(c.note):''}</div>`:’’;
const cr=document.createElement(‘tr’);
cr.className=‘child-row’;
cr.innerHTML=`<td><img src="${freshC?freshC.img:c.img||''}" class="img-preview" style="width:26px;height:26px;" alt=""></td><td style="padding-right:22px;color:var(--primary);font-weight:600;font-size:.88em;">${esc(c.k)}</td><td style="font-size:.85em;">${esc(freshC?freshC.v:c.v)}${resolvedNote}</td><td></td><td></td><td>${cs!==undefined?cs:'—'}</td><td>${cSt}</td><td><span style="font-size:.75em;font-weight:bold;padding:2px 6px;border-radius:4px;background:${cTypeBg};color:${cTypeFg};">${cTypeLabel}</span></td><td></td><td></td>`;
body.appendChild(cr);
});
});
const h=bomHealth();const hw=document.getElementById(‘bomHealthWrap’);
if(h&&hw){const col=h.pct>70?‘var(–success)’:h.pct>40?‘var(–warning)’:‘var(–danger)’;hw.style.display=‘block’;hw.innerHTML=`<div style="display:flex;align-items:center;gap:7px;background:var(--hover);border-radius:7px;padding:5px 10px;font-size:.88em;border:1px solid var(--border);"><span style="color:var(--text);">בריאות:</span><div style="width:80px;height:7px;background:var(--border);border-radius:4px;overflow:hidden;"><div style="width:${h.pct}%;height:100%;background:${col};border-radius:4px;"></div></div><b style="color:${col}">${h.pct}%</b><span style="color:var(--text2);font-size:.85em;">${h.ok}/${h.total}</span></div>`;}
}

document.getElementById(‘clearBOMBtn’).addEventListener(‘click’,()=>{if(!bom.length){toast(‘BOM ריק’,’’);return;}if(!confirm(`למחוק ${bom.length} פריטים?`))return;bom=[];save(LS.BOM,bom);renderBOM();resetApproval();toast(‘BOM נוקה’,’’);});
document.getElementById(‘approveBOMBtn’).addEventListener(‘click’,()=>{isApproved=true;[‘exportBomCsvBtn’,‘exportBomXlsxBtn’,‘exportStockReportBtn’,‘exportMissingBtn’,‘exportHTMLReportBtn’].forEach(id=>{const b=document.getElementById(id);b.className=‘btn btn-success’;b.disabled=false;});document.getElementById(‘approvalBar’).classList.add(‘is-approved’);document.getElementById(‘approvalText’).textContent=‘✅ מאושר’;});
function resetApproval(){isApproved=false;[‘exportBomCsvBtn’,‘exportBomXlsxBtn’,‘exportStockReportBtn’,‘exportMissingBtn’,‘exportHTMLReportBtn’].forEach(id=>{const b=document.getElementById(id);b.className=‘btn btn-disabled’;b.disabled=true;});document.getElementById(‘approvalBar’).classList.remove(‘is-approved’);document.getElementById(‘approvalText’).textContent=‘⚠️ ממתין לבדיקה’;}

/* ══ XLSX helper ══ */
function xlCell(v,fill,fontColor,bold){return{v,t:‘s’,s:{fill:{patternType:‘solid’,fgColor:{rgb:fill||‘FFFFFFFF’}},font:{bold:!!bold,color:{rgb:fontColor||‘FF000000’}},alignment:{horizontal:‘right’}}};}
function makeWs(rows){
const ws={};let maxC=0;
rows.forEach((row,r)=>{row.forEach((cell,c)=>{if(c>maxC)maxC=c;const ref=XLSX.utils.encode_cell({r,c});if(typeof cell===‘string’||typeof cell===‘number’){ws[ref]={v:cell,t:typeof cell===‘number’?‘n’:‘s’};}else if(cell&&typeof cell===‘object’){ws[ref]=cell;}});});
ws[’!ref’]=XLSX.utils.encode_range({s:{r:0,c:0},e:{r:rows.length-1,c:maxC}});
return ws;
}

/* ══ EXPORT CSV ══ */
document.getElementById(‘exportBomCsvBtn’).addEventListener(‘click’,()=>{
if(!isApproved)return;
let csv=’\uFEFFPart Number,Description,Note,Stock,Type\n’;
bom.forEach(i=>{csv+=`"${i.k}","${i.v}","${i.note||''}","${stockMap[i.k.toLowerCase()]??''}","ראשי"\n`;i.children.forEach(c=>csv+=`"  ↳ ${c.k}","${c.v}","","${stockMap[c.k.toLowerCase()]??''}","${c.type}"\n`);});
dlBlob(csv,‘BOM.csv’,‘text/csv;charset=utf-8;’);
});

/* ══ EXPORT XLSX ══ */
document.getElementById(‘exportBomXlsxBtn’).addEventListener(‘click’,()=>{
if(window._xlsxFailed||typeof XLSX===‘undefined’){toast(‘Excel לא זמין’,’’);return;}
if(!isApproved)return;
const wb=XLSX.utils.book_new();
function xc(v,bg,fg,bold){return{v:String(v||’’),t:‘s’,s:{fill:{patternType:‘solid’,fgColor:{rgb:bg||‘FFFFFFFF’}},font:{bold:!!bold,color:{rgb:fg||‘FF1A1A1A’},name:‘Calibri’,sz:10},alignment:{horizontal:‘right’,vertical:‘center’},border:{top:{style:‘thin’,color:{rgb:‘FFD0D7DE’}},bottom:{style:‘thin’,color:{rgb:‘FFD0D7DE’}},left:{style:‘thin’,color:{rgb:‘FFD0D7DE’}},right:{style:‘thin’,color:{rgb:‘FFD0D7DE’}}}}};}
function hdr(v){return xc(v,‘FF1A2A5E’,‘FFFFFFFF’,true);}
const REQ={bg:‘FFFCE8E6’,fg:‘FFC5221F’},ACC={bg:‘FFE8F0FE’,fg:‘FF1558D6’},TOOL={bg:‘FFE6F4EA’,fg:‘FF137333’};
const ALT={bg:‘FFF3E5F5’,fg:‘FF7B1FA2’},CHILD={bg:‘FFF0F4FF’,fg:‘FF3D5170’};
const OK={bg:‘FFE6F4EA’,fg:‘FF137333’},MISS={bg:‘FFFCE8E6’,fg:‘FFC5221F’},NONE={bg:‘FFF8F9FA’,fg:‘FF9AA0A6’};
const hdrs=[‘מק”ט’,‘תיאור’,‘סוג’,‘כמות’,‘מלאי’,‘סטטוס’,‘הערה’,‘חלופה מאושרת’];
const rows=[hdrs.map(hdr)];
const rowH=[{hpt:20}];
bom.forEach(item=>{
const qty=stockMap[item.k.toLowerCase()];const inS=qty!==undefined&&qty>0;
const tp=item.itemType===‘TOOL’?TOOL:item.itemType===‘ACC’?ACC:REQ;
const tl=item.itemType===‘TOOL’?‘🔧 כלי’:item.itemType===‘ACC’?‘🔗 נלווה’:‘⚡ חובה’;
const stC=qty===undefined?NONE:inS?OK:MISS;
const stL=qty===undefined?‘לא נבדק’:inS?‘✅ ‘+qty:‘⚠️ 0’;
rows.push([xc(item.k,tp.bg,tp.fg,true),xc(item.v,tp.bg,tp.fg,false),xc(tl,tp.bg,tp.fg,true),xc(item.qty||1,‘FFFFFFFF’,‘FF333333’,true),xc(qty!=null?qty:’—’,stC.bg,stC.fg,true),xc(stL,stC.bg,stC.fg,false),xc(item.note||’’,‘FFFFFFFF’,‘FF555555’,false),xc(item.approvedAlt||’’,item.approvedAlt?ALT.bg:‘FFF8F9FA’,item.approvedAlt?ALT.fg:‘FFAAAAAA’,!!item.approvedAlt)]);
rowH.push({hpt:17});
if(item.approvedAlt){const ai=db.find(x=>x.k.toLowerCase()===item.approvedAlt.toLowerCase())||{k:item.approvedAlt,v:’’};const aq=stockMap[item.approvedAlt.toLowerCase()];const aS=aq!=null&&aq>0;rows.push([xc(‘✅ ‘+ai.k,ALT.bg,ALT.fg,true),xc(ai.v,ALT.bg,ALT.fg,false),xc(‘חלופה’,ALT.bg,ALT.fg,true),xc(’’,ALT.bg,ALT.fg,false),xc(aq!=null?aq:’—’,aS?OK.bg:MISS.bg,aS?OK.fg:MISS.fg,false),xc(aq==null?‘לא נבדק’:aS?‘✅’:‘⚠️’,aS?OK.bg:MISS.bg,aS?OK.fg:MISS.fg,false),xc(’’,ALT.bg,ALT.fg,false),xc(’’,ALT.bg,ALT.fg,false)]);rowH.push({hpt:15});}
item.children.forEach(c=>{const cs=stockMap[c.k.toLowerCase()];const ci=cs!=null&&cs>0;const cT=c.type===‘TOOL’?TOOL:ACC;const cSt=cs==null?NONE:ci?OK:MISS;rows.push([xc(’  ‘+c.k,CHILD.bg,CHILD.fg,false),xc(c.v||’’,CHILD.bg,CHILD.fg,false),xc(c.type===‘TOOL’?‘🔧 כלי’:‘🔗 נלווה’,cT.bg,cT.fg,false),xc(1,‘FFFFFFFF’,’’,false),xc(cs!=null?cs:’—’,cSt.bg,cSt.fg,false),xc(cs==null?‘לא נבדק’:ci?‘✅ ‘+cs:‘⚠️ חסר’,cSt.bg,cSt.fg,false),xc(’’,CHILD.bg,CHILD.fg,false),xc(’’,CHILD.bg,CHILD.fg,false)]);rowH.push({hpt:14});});
});
const ws={};rows.forEach((row,r)=>row.forEach((cell,c)=>{ws[XLSX.utils.encode_cell({r,c})]=cell;}));
ws[’!ref’]=XLSX.utils.encode_range({s:{r:0,c:0},e:{r:rows.length-1,c:7}});
ws[’!cols’]=[{wch:26},{wch:32},{wch:10},{wch:6},{wch:8},{wch:12},{wch:20},{wch:22}];
ws[’!rows’]=rowH;
XLSX.utils.book_append_sheet(wb,ws,‘BOM’);
XLSX.writeFile(wb,‘BOM_Dazura.xlsx’,{bookType:‘xlsx’,cellStyles:true});
toast(‘Excel הורד ✅’,’’);
});

/* ══ EXPORT STOCK REPORT ══ */
document.getElementById(‘exportStockReportBtn’).addEventListener(‘click’,()=>{
if(!isApproved)return;
const wb=XLSX.utils.book_new();
const hFill=‘FF1A73E8’,hFont=‘FFFFFFFF’;
const rows=[[‘Part Number’,‘Required’,‘Stock’,‘Status’,‘Best Alt’,‘Alt Score’,‘Alt Stock’].map(h=>xlCell(h,hFill,hFont,true))];
const allParts=[…new Set(bom.flatMap(item=>[item.k,…item.children.map(c=>c.k)]))];
allParts.forEach(k=>{
const qty=stockMap[k.toLowerCase()];const alt=findBestAlt(k);const aq=alt?stockMap[alt.item.k.toLowerCase()]:undefined;
const inS=qty!==undefined&&qty>0;const rFill=qty===undefined?‘FFFFFFFF’:inS?‘FFE6F4EA’:‘FFFCE8E6’;const rFont=qty===undefined?‘FF202124’:inS?‘FF137333’:‘FFD93025’;
rows.push([xlCell(k,rFill,rFont,true),xlCell(‘כן’,rFill,rFont,false),xlCell(qty!==undefined?String(qty):’—’,rFill,rFont,true),xlCell(qty===undefined?‘לא נבדק’:inS?‘תקין’:‘חסר’,rFill,rFont,false),xlCell(alt?alt.item.k:’—’,‘FFFDF5FF’,‘FF7B1FA2’,false),xlCell(alt?String(alt.score):’’,‘FFFDF5FF’,‘FF7B1FA2’,false),xlCell(aq!==undefined?String(aq):’—’,‘FFFDF5FF’,‘FF7B1FA2’,false)]);
});
const ws=makeWs(rows);
ws[’!cols’]=[{wch:28},{wch:10},{wch:8},{wch:10},{wch:26},{wch:10},{wch:10}];
XLSX.utils.book_append_sheet(wb,ws,‘דוח מלאי’);XLSX.writeFile(wb,‘StockReport.xlsx’);toast(‘דוח מלאי הורד ✅’,’’);
});

function dlBlob(c,f,t){const a=document.createElement(‘a’);a.href=URL.createObjectURL(new Blob([c],{type:t}));a.download=f;a.click();}

/* ══ DB TABLE ══ */
function updateMultiBar(){const bar=document.getElementById(‘multiBar’),cnt=document.getElementById(‘multiCount’);if(selectedKeys.size>0){bar.classList.add(‘show’);cnt.textContent=`${selectedKeys.size} נבחרו`;}else bar.classList.remove(‘show’);}
document.getElementById(‘masterCheck’).addEventListener(‘change’,function(){const filter=document.getElementById(‘dbSearch’).value.toLowerCase(),famF=document.getElementById(‘dbFamFilter’).value;db.filter(i=>(i.k+i.v+i.c).toLowerCase().includes(filter)&&(!famF||i.c===famF)).forEach(i=>{if(this.checked)selectedKeys.add(i.k);else selectedKeys.delete(i.k);});renderDBTable();updateMultiBar();});
document.getElementById(‘clearSelBtn’).addEventListener(‘click’,()=>{selectedKeys.clear();renderDBTable();updateMultiBar();});
document.getElementById(‘selectAllBtn’).addEventListener(‘click’,()=>{db.forEach(i=>selectedKeys.add(i.k));renderDBTable();updateMultiBar();});
function deleteSelected(){if(!selectedKeys.size)return;if(!confirm(`למחוק ${selectedKeys.size} פריטים?`))return;db=db.filter(i=>!selectedKeys.has(i.k));save(LS.DB,db);invalidateDupCache();buildTFIDF();selectedKeys.clear();updateMultiBar();renderDBTable();toast(‘נמחקו’,’’);}
document.getElementById(‘deleteSelBtn’).addEventListener(‘click’,deleteSelected);

function renderDBTable(){
const filter=document.getElementById(‘dbSearch’).value.toLowerCase(),famF=document.getElementById(‘dbFamFilter’).value;
const body=document.getElementById(‘db-table-body’);body.innerHTML=’’;
const dups=findDuplicates(),dupKeys=new Set(dups.flatMap(p=>[p.a,p.b]));
const warn=document.getElementById(‘dupWarning’);
if(dups.length){warn.style.display=‘block’;warn.innerHTML=`⚠️ ${dups.length} זוגות דומים: `+dups.map(p=>`<b>${esc(p.a)}</b>↔<b>${esc(p.b)}</b>(${p.sim}%)`).join(’ | ‘);}else warn.style.display=‘none’;
db.filter(i=>(i.k+i.v+i.c).toLowerCase().includes(filter)&&(!famF||i.c===famF)).forEach(i=>{
const isDup=dupKeys.has(i.k);
const ct=(i.custom||[]).map(f=>`<span class="tag tag-custom">${esc(f.label)}:${esc(f.value)}</span>`).join(’’);
const tr=document.createElement(‘tr’);if(isDup)tr.className=‘dup-row’;
tr.innerHTML=`<td><input type="checkbox" ${selectedKeys.has(i.k)?'checked':''} data-k="${esc(i.k)}"></td><td><img src="${i.img}" class="img-preview" style="width:32px;height:32px;" alt=""></td><td><b>${isDup?`<span class="dup-badge">כפול?</span>`:''} ${esc(i.k)}</b></td><td>${esc(i.c)}</td><td style="max-width:160px;">${ct||'—'}</td><td style="white-space:nowrap;"><button class="btn btn-ghost" data-edit="${esc(i.k)}" style="padding:4px 8px;font-size:.82em;">✏️ ערוך</button> <button class="btn btn-ghost" style="padding:4px 8px;font-size:.82em;color:var(--danger);" data-del="${esc(i.k)}">🗑</button></td>`;
body.appendChild(tr);
tr.querySelector(‘input[type=checkbox]’).addEventListener(‘change’,function(){if(this.checked)selectedKeys.add(this.dataset.k);else selectedKeys.delete(this.dataset.k);updateMultiBar();});
});
body.querySelectorAll(’[data-edit]’).forEach(b=>b.addEventListener(‘click’,()=>loadToEdit(b.dataset.edit)));
body.querySelectorAll(’[data-del]’).forEach(b=>b.addEventListener(‘click’,()=>deleteFromDB(b.dataset.del)));
}
document.getElementById(‘dbSearch’).addEventListener(‘input’,renderDBTable);
document.getElementById(‘dbFamFilter’).addEventListener(‘change’,renderDBTable);

function loadToEdit(k){
const i=db.find(x=>x.k===k);if(!i)return;
document.getElementById(‘key’).value=i.k;document.getElementById(‘val’).value=i.v;
document.getElementById(‘reqInput’).value=i.req.join(’,’);document.getElementById(‘toolInput’).value=i.tool;document.getElementById(‘accInput’).value=i.acc.join(’,’);if(document.getElementById(‘minStockInput’))document.getElementById(‘minStockInput’).value=i.minStock||0;if(document.getElementById(‘warehouseLocation’))document.getElementById(‘warehouseLocation’).value=i.location||’’;
currentBase64=i.img||’’;const p=document.getElementById(‘setupPreview’);p.src=currentBase64;p.style.display=currentBase64?‘block’:‘none’;
customFields=(i.custom||[]).map(f=>({…f}));renderCF();updateFamilyList(i.c);document.getElementById(‘catSelect’).value=i.c;
switchTab(‘setup’);window.scrollTo(0,0);setTimeout(()=>document.getElementById(‘key’).focus(),200);toast(‘ערוך: ‘+k,’’);
}

function deleteFromDB(k){if(!confirm(‘למחוק?’))return;db=db.filter(i=>i.k!==k);save(LS.DB,db);invalidateDupCache();buildTFIDF();renderDBTable();toast(‘נמחק’,’’);}
document.getElementById(‘resetDBBtn’).addEventListener(‘click’,()=>{if(!db.length){toast(‘DB ריק’,’’);return;}const count=db.length;if(!confirm(`למחוק ${count} נירונים?`))return;if(prompt(‘הקלד “אפס”:’)!==‘אפס’){toast(‘בוטל’,’’);return;}db=[];bom=[];save(LS.DB,db);save(LS.BOM,bom);invalidateDupCache();buildTFIDF();updateFamilyList();renderDBTable();toast(`${count} נמחקו`,’’);});

/* ══ JSON import/export ══ */
document.getElementById(‘exportJsonBtn’).addEventListener(‘click’,()=>{
const backup={version:‘v3’,date:new Date().toISOString(),db,bom,families,versions,stockRows,itemHistory:tryParse(ITEM_HISTORY_KEY,{}),neuronNotes:tryParse(NOTES_KEY,{}),bomTemplates:tryParse(TEMPLATES_KEY,[]),allBOMs:tryParse(MULTI_BOM_KEY,[]),theme:themeIdx,font:localStorage.getItem(LS.FONT)||‘13’};
dlBlob(JSON.stringify(backup,null,2),‘Dazura_Backup_’+new Date().toLocaleDateString(‘he-IL’).replace(/[/]/g,’-’)+’.json’,‘application/json’);
toast(‘גיבוי מלא הורד ✅’,’’);
});
document.getElementById(‘importJsonTrigger’).addEventListener(‘click’,()=>document.getElementById(‘importFile’).click());
document.getElementById(‘importFile’).addEventListener(‘change’,function(e){
const r=new FileReader();
r.onload=ev=>{
try{
const imp=JSON.parse(ev.target.result);
if(imp&&imp.version===‘v3’&&imp.db){db=imp.db||[];bom=imp.bom||[];families=imp.families||[‘Connectors’,‘Wires’,‘Tools’];versions=imp.versions||[];stockRows=imp.stockRows||[];buildStockMap();if(imp.itemHistory)localStorage.setItem(ITEM_HISTORY_KEY,JSON.stringify(imp.itemHistory));if(imp.theme!==undefined){themeIdx=imp.theme;applyTheme();}save(LS.DB,db);save(LS.BOM,bom);save(LS.FAM,families);save(LS.VERS,versions);save(LS.STOCK,stockRows);invalidateDupCache();buildTFIDF();updateFamilyList();renderBOM();renderDBTable();toast(‘✅ גיבוי שוחזר — ‘+db.length+’ פריטים’,’’);return;}
if(!Array.isArray(imp))throw 0;
db=imp;save(LS.DB,db);invalidateDupCache();buildTFIDF();
stockMap={};stockRows.forEach(r=>stockMap[r.k.toLowerCase()]=r.qty);
updateFamilyList();const info=document.getElementById(‘importInfo’);info.style.display=‘block’;info.textContent=`✅ יובאו ${db.length}`;
toast(`יובאו ${db.length}`,’’);
}catch{toast(‘שגיאה’,’’);}
};
r.readAsText(e.target.files[0]);this.value=’’;
});

/* ══ STOCK CSV ══ */
function buildStockMap(){stockMap={};stockRows.forEach(r=>stockMap[r.k.toLowerCase()]=r.qty);}
function parseStockCSV(text){const rows=[];text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).forEach((line,li)=>{const sep=line.includes(’;’)?’;’:’,’;const parts=line.split(sep).map(p=>p.replace(/^[”’]|[”’]$/g,’’).trim());if(parts.length<2)return;if(li===0&&isNaN(Number(parts[1]))&&parts[1].toLowerCase()!==‘0’)return;const k=parts[0],qty=parseInt(parts[1])||0;if(k)rows.push({k,qty});});return rows;}
function loadStockCSV(file){const r=new FileReader();r.onload=ev=>{stockRows=parseStockCSV(ev.target.result);stockMap={};stockRows.forEach(r=>stockMap[r.k.toLowerCase()]=r.qty);save(LS.STOCK,stockRows);renderStockTable();renderBOM();const info=document.getElementById(‘stockImportInfo’);info.style.display=‘block’;info.textContent=`✅ ${stockRows.length} פריטים`;const dz=document.getElementById(‘stockDropZone’);dz.classList.add(‘loaded’);dz.textContent=`✅ ${file.name} (${stockRows.length})`;const csb=document.getElementById(‘clearStockBtn’);if(csb)csb.style.display=‘block’;toast(`${stockRows.length} מלאי`,’’);};r.readAsText(file);}
setupDrop(‘stockDropZone’,‘stockCsvFile’,loadStockCSV);
[‘stockFilter’,‘stockStatusFilter’].forEach(id=>document.getElementById(id).addEventListener(‘input’,renderStockTable));

function renderStockTable(){
const filter=(document.getElementById(‘stockFilter’).value||’’).toLowerCase();
const stFilter=document.getElementById(‘stockStatusFilter’).value;
let ok=0,miss=0,unk=0;
stockRows.forEach(r=>{const inDb=db.some(x=>x.k.toLowerCase()===r.k.toLowerCase());if(!inDb)unk++;else if(r.qty>0)ok++;else miss++;});
document.getElementById(‘stockTotalItems’).textContent=stockRows.length;
document.getElementById(‘stockCountOk’).textContent=`${ok} תקינים`;
document.getElementById(‘stockCountMissing’).textContent=`${miss} חסרים`;
document.getElementById(‘stockCountUnknown’).textContent=`${unk} לא ב-DB`;
document.getElementById(‘stockOverviewCard’).style.display=‘block’;
document.getElementById(‘stockTableCard’).style.display=‘block’;
const body=document.getElementById(‘stockTableBody’);body.innerHTML=’’;
stockRows.filter(r=>{
const inDb=db.some(x=>x.k.toLowerCase()===r.k.toLowerCase());
if(filter&&!r.k.toLowerCase().includes(filter))return false;
if(stFilter===‘ok’)return inDb&&r.qty>0;if(stFilter===‘missing’)return inDb&&r.qty===0;if(stFilter===‘unknown’)return!inDb;return true;
}).forEach(r=>{
const inDb=db.some(x=>x.k.toLowerCase()===r.k.toLowerCase()),inS=r.qty>0,alt=!inS?findBestAlt(r.k):null;
let stHtml=inDb?(inS?`<span class="stock-badge stock-ok">✅ ${r.qty}</span>`:’<span class="stock-badge stock-missing">⚠️ 0</span>’):’<span class="stock-badge stock-unknown">לא ב-DB</span>’;
let altHtml=’—’;
if(alt&&alt.score>10){const aq=stockMap[alt.item.k.toLowerCase()];altHtml=`<div style="font-weight:bold;color:var(--alt);font-size:.85em;">${esc(alt.item.k)}${aq!==undefined?` (${aq})`:''}</div><div class="alt-row" style="margin-top:2px;"><div class="alt-bar"><div class="alt-fill" style="width:${alt.score}%"></div></div><span class="alt-pct">${alt.score}%</span></div><div class="alt-reasons">${alt.reasons.join(' · ')}</div>`;}
else if(!inS)altHtml=’<span style="color:var(--text2);font-size:.82em;">אין חלופה</span>’;
const tr=document.createElement(‘tr’);
if(inDb&&!inS)tr.className=alt&&alt.score>10?‘bom-has-alt’:‘bom-missing’;
tr.innerHTML=`<td><b>${esc(r.k)}</b>${inDb?'':' <span style="font-size:.78em;color:var(--text2);">(לא ב-DB)</span>'}</td><td>${r.qty}</td><td>${stHtml}</td><td>${altHtml}</td><td style="white-space:nowrap;">${alt&&alt.score>10?`<button class="btn btn-ghost" style="padding:2px 7px;font-size:.8em;" data-alt="${esc(alt.item.k)}">ל-BOM</button> `:''} ${inDb?`<button class="btn btn-ghost" style="padding:2px 7px;font-size:.8em;" data-add="${esc(r.k)}">ל-BOM</button>`:''}</td>`;
body.appendChild(tr);
tr.querySelectorAll(’[data-alt]’).forEach(b=>b.addEventListener(‘click’,()=>addToBOM(b.dataset.alt)));
tr.querySelectorAll(’[data-add]’).forEach(b=>b.addEventListener(‘click’,()=>addToBOM(b.dataset.add)));
});
}

/* ══ ATTR SEARCH ══ */
function populateAttrSuggestions(){
const labels=new Set(),values=new Set();
db.forEach(i=>(i.custom||[]).forEach(f=>{if(f.label)labels.add(f.label);if(f.value)values.add(f.value);}));
document.getElementById(‘attrLabelList’).innerHTML=[…labels].map(l=>`<option value="${esc(l)}">`).join(’’);
document.getElementById(‘attrValueList’).innerHTML=[…values].map(v=>`<option value="${esc(v)}">`).join(’’);
const chips=document.getElementById(‘attrChips’);
chips.innerHTML=’<span style="font-size:.82em;color:var(--text2);margin-left:5px;">שדות קיימים: </span>’+[…labels].map(l=>`<span class="attr-chip" data-lbl="${esc(l)}">${esc(l)}</span>`).join(’’);
chips.querySelectorAll(’.attr-chip’).forEach(c=>c.addEventListener(‘click’,()=>{document.getElementById(‘attrLabelInput’).value=c.dataset.lbl;document.getElementById(‘attrValueInput’).focus();}));
}
document.getElementById(‘attrSearchBtn’).addEventListener(‘click’,doAttrSearch);
[‘attrLabelInput’,‘attrValueInput’,‘attrFreeInput’].forEach(id=>document.getElementById(id).addEventListener(‘keydown’,e=>{if(e.key===‘Enter’)doAttrSearch();}));
function doAttrSearch(){
const lbl=document.getElementById(‘attrLabelInput’).value.trim().toLowerCase();
const val=document.getElementById(‘attrValueInput’).value.trim().toLowerCase();
const free=document.getElementById(‘attrFreeInput’).value.trim().toLowerCase();
if(!lbl&&!val&&!free){toast(‘הכנס לפחות מילה אחת’,’’);return;}
const out=document.getElementById(‘attrResults’);
const res=db.filter(i=>{
if(free){const allText=(i.k+’ ‘+i.v+’ ‘+i.c+’ ‘+(i.custom||[]).map(f=>f.label+’ ‘+f.value).join(’ ‘)).toLowerCase();if(!allText.includes(free))return false;}
if(lbl||val){const customMatch=(i.custom||[]).some(f=>(!lbl||f.label.toLowerCase().includes(lbl))&&(!val||f.value.toLowerCase().includes(val)));if(!lbl&&val){const broadMatch=(i.k+’ ‘+i.v).toLowerCase().includes(val);return customMatch||broadMatch;}return customMatch;}
return true;
});
if(!res.length){out.innerHTML=`<div style="color:var(--text2);padding:18px;text-align:center;">לא נמצאו פריטים</div>`;return;}
out.innerHTML=`<div style="margin-bottom:7px;font-size:.88em;color:var(--text2);">${res.length} פריטים נמצאו</div><table><thead><tr><th>תמונה</th><th>מק"ט</th><th>משפחה</th><th>תיאור</th><th>מאפיינים תואמים</th><th></th></tr></thead><tbody>${res.map(i=>{const allF=(i.custom||[]);const matchF=allF.filter(f=>(!lbl||f.label.toLowerCase().includes(lbl))&&(!val||f.value.toLowerCase().includes(val)));const showF=matchF.length?matchF:allF.slice(0,3);return`<tr><td><img src="${i.img}" style="width:30px;height:30px;border-radius:5px;object-fit:cover;" alt=""></td><td><b>${esc(i.k)}</b></td><td>${esc(i.c)}</td><td style="font-size:.85em;">${esc(i.v)}</td><td>${showF.map(f=>`<span class="tag tag-custom">${esc(f.label)}:${esc(f.value)}</span>`).join(’’)}</td><td><button class="btn btn-ghost" style="padding:3px 8px;font-size:.82em;" data-add="${esc(i.k)}">+ BOM</button></td></tr>`;}).join('')}</tbody></table>`;
out.querySelectorAll(’[data-add]’).forEach(b=>b.addEventListener(‘click’,()=>addToBOM(b.dataset.add)));
}

/* ══ VERSIONS ══ */
function renderVersions(){
const el=document.getElementById(‘versionsList’);
if(!versions.length){el.innerHTML=’<div style="color:var(--text2);padding:18px;text-align:center;">אין גרסאות עדיין</div>’;clearVersionDiff();return;}
el.innerHTML=versions.map((v,i)=>`<div class="ver-row"><div><b style="color:var(--text);">${esc(v.name)}</b><div class="ver-meta">${esc(v.date)} · ${v.items.length} פריטים</div></div><div style="display:flex;gap:5px;"><button class="btn btn-ghost" style="padding:4px 9px;font-size:.85em;" data-restore="${i}">↩ שחזר</button><button class="btn" style="padding:4px 9px;font-size:.85em;background:var(--tag-custom-bg);color:var(--alt);" data-diff="${i}">🔍 השווה</button><button class="btn btn-ghost" style="padding:4px 9px;font-size:.85em;color:var(--danger);" data-delver="${i}">✖</button></div></div>`).join(’’);
el.querySelectorAll(’[data-restore]’).forEach(b=>b.addEventListener(‘click’,()=>{if(!confirm(‘לשחזר?’))return;bom=JSON.parse(JSON.stringify(versions[+b.dataset.restore].items));save(LS.BOM,bom);resetApproval();toast(‘שוחזר ✅’,’’);clearVersionDiff();}));
el.querySelectorAll(’[data-diff]’).forEach(b=>b.addEventListener(‘click’,()=>showDiff(+b.dataset.diff)));
el.querySelectorAll(’[data-delver]’).forEach(b=>b.addEventListener(‘click’,()=>{versions.splice(+b.dataset.delver,1);save(LS.VERS,versions);renderVersions();clearVersionDiff();}));
}
function clearVersionDiff(){const el=document.getElementById(‘versionDiff’);el.style.display=‘none’;el.innerHTML=’’;}
function showDiff(vi){
const old=versions[vi].items,cur=bom;const oldKeys=new Set(old.map(x=>x.k)),curKeys=new Set(cur.map(x=>x.k));
const added=[…curKeys].filter(k=>!oldKeys.has(k)),removed=[…oldKeys].filter(k=>!curKeys.has(k));
const el=document.getElementById(‘versionDiff’);el.style.display=‘block’;
el.innerHTML=`<div class="card" style="border:2px solid var(--alt);"><h4 style="margin:0 0 8px;color:var(--alt);">השוואה: "${esc(versions[vi].name)}" vs נוכחי</h4>${added.length?`<div style="color:var(--success);margin-bottom:4px;">✅ נוספו: ${added.map(k=>`<b>${esc(k)}</b>`).join(’, ‘)}</div>`:''}${removed.length?`<div style="color:var(--danger);">❌ הוסרו: ${removed.map(k=>`<b>${esc(k)}</b>`).join(’, ‘)}</div>`:''}${!added.length&&!removed.length?'<span style="color:var(--text2);">אין הבדלים</span>':''}</div>`;
}
document.getElementById(‘saveBOMVersionBtn’).addEventListener(‘click’,()=>{
if(!bom.length){toast(‘BOM ריק’,’’);return;}
const name=prompt(‘שם גרסה:’,`גרסה ${versions.length+1}`);if(!name)return;
versions.unshift({name,date:new Date().toLocaleString(‘he-IL’),items:JSON.parse(JSON.stringify(bom))});
if(versions.length>20)versions.pop();save(LS.VERS,versions);toast(`"${name}" נשמרה ✅`,’’);
});

/* ══ DASHBOARD ══ */
function renderDashboard(){
const dups=findDuplicates();
document.getElementById(‘dashKpis’).innerHTML=`<div class="dash-kpi"><div class="num">${db.length}</div><div class="lbl">נירונים ב-DB</div></div><div class="dash-kpi"><div class="num">${bom.length}</div><div class="lbl">פריטים ב-BOM</div></div><div class="dash-kpi"><div class="num">${stockRows.length}</div><div class="lbl">פריטי מלאי</div></div><div class="dash-kpi"><div class="num" style="color:${dups.length>0?'var(--warning)':'var(--success)'}">${dups.length}</div><div class="lbl">זוגות כפולים</div></div><div class="dash-kpi"><div class="num">${families.length}</div><div class="lbl">משפחות</div></div><div class="dash-kpi"><div class="num">${versions.length}</div><div class="lbl">גרסאות BOM</div></div>`;
const famCounts={};db.forEach(i=>famCounts[i.c]=(famCounts[i.c]||0)+1);
const maxC=Math.max(…Object.values(famCounts),1);
document.getElementById(‘dashFamChart’).innerHTML=Object.entries(famCounts).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([f,c])=>`<div class="bar-row"><span class="bar-label" title="${esc(f)}">${esc(f)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(c/maxC*100)}%"></div></div><span class="bar-count">${c}</span></div>`).join(’’);
const attrCounts={};db.forEach(i=>(i.custom||[]).forEach(f=>{if(f.label)attrCounts[f.label]=(attrCounts[f.label]||0)+1;}));
const maxA=Math.max(…Object.values(attrCounts),1);
const attrEl=document.getElementById(‘dashAttrChart’);
attrEl.innerHTML=Object.keys(attrCounts).length?Object.entries(attrCounts).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([f,c])=>`<div class="bar-row"><span class="bar-label">${esc(f)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(c/maxA*100)}%;background:var(--alt);"></div></div><span class="bar-count">${c}</span></div>`).join(’’):’<span style="color:var(--text2);font-size:.85em;">לא הוגדרו מאפיינים עדיין</span>’;
if(stockRows.length){
let ok=0,miss=0,unk=0;
stockRows.forEach(r=>{const inDb=db.some(x=>x.k.toLowerCase()===r.k.toLowerCase());if(!inDb)unk++;else if(r.qty>0)ok++;else miss++;});
const canvas=document.getElementById(‘dashStockCanvas’);const ctx=canvas.getContext(‘2d’);canvas.width=260;canvas.height=160;
const total=ok+miss+unk||1;const slices=[{v:ok,c:’#34a853’,l:‘תקין’},{v:miss,c:’#d93025’,l:‘חסר’},{v:unk,c:’#888’,l:‘לא ב-DB’}];
let angle=-Math.PI/2;const cx=130,cy=80,r=65;ctx.clearRect(0,0,260,160);
slices.forEach(s=>{const a=2*Math.PI*s.v/total;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,angle,angle+a);ctx.closePath();ctx.fillStyle=s.c;ctx.fill();angle+=a;});
ctx.fillStyle=’#111’;ctx.font=‘bold 15px Segoe UI’;ctx.textAlign=‘center’;ctx.fillText(`${Math.round(ok/total*100)}%`,cx,cy+6);
document.getElementById(‘dashStockLegend’).innerHTML=slices.map(s=>`<span style="display:inline-flex;align-items:center;gap:3px;margin-left:8px;color:var(--text);"><span style="width:9px;height:9px;border-radius:50%;background:${s.c};display:inline-block;"></span>${s.l}: ${s.v}</span>`).join(’’);
}
const dupEl=document.getElementById(‘dashDups’);
if(!dups.length){dupEl.innerHTML=`<span style="color:var(--success);">✅ לא נמצאו כפילויות</span>`;return;}
dupEl.innerHTML=`<table><thead><tr><th>מק"ט 1</th><th>מק"ט 2</th><th>דמיון</th><th>פעולה</th></tr></thead><tbody>${dups.map(p=>`<tr class="dup-row"><td><b>${esc(p.a)}</b></td><td><b>${esc(p.b)}</b></td><td>${p.sim}%</td><td><button class="btn btn-ghost" style="padding:3px 8px;font-size:.82em;" data-e="${esc(p.a)}">ערוך</button></td></tr>`).join('')}</tbody></table>`;
dupEl.querySelectorAll(’[data-e]’).forEach(b=>b.addEventListener(‘click’,()=>loadToEdit(b.dataset.e)));
}

/* ══ NEURAL NETWORK VISUALIZER ══ */
let nnAnimTimer=null,nnAnimRunning=false,nnSignals=[];
let realSignalQueue=[];
const MAX_REAL_QUEUE=40;
function emitNeuralSignal(fromIdx,toIdx,score,layer){if(!nnAnimRunning)return;realSignalQueue.push({fromIdx,toIdx,score,layer,t:0,speed:0.018+(score/100)*0.025,color:score>60?’#ffcc00’:score>30?’#ff8800’:’#44aaff’});if(realSignalQueue.length>MAX_REAL_QUEUE)realSignalQueue.shift();}
function getNNColors(){const s=getComputedStyle(document.body);return{primary:s.getPropertyValue(’–primary’).trim()||’#1a73e8’,success:s.getPropertyValue(’–success’).trim()||’#1e8e3e’,warning:s.getPropertyValue(’–warning’).trim()||’#f29900’,text:s.getPropertyValue(’–text’).trim()||’#0d1b3e’,text2:s.getPropertyValue(’–text2’).trim()||’#3d5170’,border:s.getPropertyValue(’–border’).trim()||’#c5d1e8’,card:s.getPropertyValue(’–card’).trim()||’#ffffff’};}
function drawNeuralNet(canvasId,layerSizes,animSignals,opts){opts=opts||{};const canvas=document.getElementById(canvasId);if(!canvas)return;const W=canvas.offsetWidth||canvas.width||700;canvas.width=W;const H=canvas.height||480;const ctx=canvas.getContext(‘2d’);ctx.clearRect(0,0,W,H);const numLayers=layerSizes.length;const layerX=[];const padX=W*0.1;for(let l=0;l<numLayers;l++){layerX.push(padX+l*(W-2*padX)/(numLayers-1));}const nodePos=[];const nodeR=opts.nodeR||16;for(let l=0;l<numLayers;l++){const n=layerSizes[l];const totalH=(n-1)*(Math.max(32,Math.min(54,(H-80)/Math.max(n,1))));const startY=(H-totalH)/2;const gap=n>1?totalH/(n-1):0;const col2=[];for(let i=0;i<n;i++){col2.push({x:layerX[l],y:n===1?H/2:startY+i*gap});}nodePos.push(col2);}for(let l=0;l<numLayers-1;l++){for(let i=0;i<nodePos[l].length;i++){for(let j=0;j<nodePos[l+1].length;j++){ctx.beginPath();ctx.moveTo(nodePos[l][i].x,nodePos[l][i].y);ctx.lineTo(nodePos[l+1][j].x,nodePos[l+1][j].y);ctx.strokeStyle=‘rgba(100,160,255,0.22)’;ctx.lineWidth=1;ctx.stroke();}}}if(animSignals&&animSignals.length){animSignals.forEach(sig=>{if(sig.l>=numLayers-1)return;const fromLayer=nodePos[sig.l];const toLayer=nodePos[sig.l+1];if(!fromLayer||!toLayer)return;const from=fromLayer[sig.i%fromLayer.length];const to=toLayer[sig.j%toLayer.length];if(!from||!to)return;const t=sig.t;const sx=from.x+(to.x-from.x)*t;const sy=from.y+(to.y-from.y)*t;const dotR=sig.real?Math.max(4,8*(sig.score/100)):5;const sigColor=sig.color||(sig.real?‘rgba(255,200,0,0.98)’:‘rgba(255,220,60,0.98)’);const grd=ctx.createRadialGradient(sx,sy,0,sx,sy,dotR+3);grd.addColorStop(0,sigColor);grd.addColorStop(1,‘rgba(255,80,0,0)’);ctx.beginPath();ctx.arc(sx,sy,dotR+3,0,Math.PI*2);ctx.fillStyle=grd;ctx.fill();});}const layerTypes=layerSizes.map((_,l)=>l===0?‘input’:l===numLayers-1?‘output’:‘hidden’);for(let l=0;l<numLayers;l++){for(let i=0;i<nodePos[l].length;i++){const{x,y}=nodePos[l][i];const type=layerTypes[l];let fillColor,strokeColor,labelColor;if(type===‘input’){fillColor=’#f5d020’;strokeColor=’#e02020’;labelColor=’#333’;}else if(type===‘output’){fillColor=’#b6f5b0’;strokeColor=’#e02020’;labelColor=’#1a7a00’;}else{fillColor=’#a8d8f8’;strokeColor=’#e02020’;labelColor=’#333’;}ctx.save();ctx.shadowColor=‘rgba(0,0,0,0.18)’;ctx.shadowBlur=6;ctx.beginPath();ctx.ellipse(x,y,nodeR,nodeR*0.72,0,0,Math.PI*2);ctx.fillStyle=fillColor;ctx.fill();ctx.strokeStyle=strokeColor;ctx.lineWidth=2.5;ctx.stroke();ctx.restore();ctx.fillStyle=labelColor;ctx.font=`bold ${Math.max(9,nodeR*0.55)}px Segoe UI`;ctx.textAlign=‘center’;ctx.textBaseline=‘middle’;if(type===‘input’)ctx.fillText(`I${i+1}`,x,y);else if(type===‘output’)ctx.fillText(`O${i+1}`,x,y);else ctx.fillText(`${i+1}`,x,y);}}const labelNames=layerSizes.map((_,l)=>{if(l===0)return’Input’;if(l===numLayers-1)return’Output’;return`Hidden ${l}`;});for(let l=0;l<numLayers;l++){const topY=Math.min(…nodePos[l].map(n=>n.y));ctx.fillStyle=l===0?’#e65c00’:l===numLayers-1?’#137333’:’#7b1fa2’;ctx.font=`bold ${Math.max(11,nodeR*0.7)}px Segoe UI`;ctx.textAlign=‘center’;ctx.textBaseline=‘bottom’;ctx.fillText(labelNames[l],layerX[l],topY-14);}const infoEl=document.getElementById(canvasId===‘neuralCanvas’?‘neuralInfo’:‘neuralDbInfo’);if(infoEl){const total=layerSizes.reduce((a,b)=>a+b,0);const conns=layerSizes.slice(0,-1).reduce((s,n,i)=>s+n*layerSizes[i+1],0);infoEl.textContent=`${numLayers} שכבות · ${total} נוירונים · ${conns} חיבורים`;}}
function getLayerSizes(){const ni=Math.max(1,Math.min(10,parseInt(document.getElementById(‘nnInputs’).value)||4));const h1=Math.max(1,Math.min(20,parseInt(document.getElementById(‘nnH1’).value)||10));const h2=Math.max(0,Math.min(20,parseInt(document.getElementById(‘nnH2’).value)||0));const no=Math.max(1,Math.min(10,parseInt(document.getElementById(‘nnOutputs’).value)||2));const layers=[ni,h1];if(h2>0)layers.push(h2);layers.push(no);return layers;}
document.getElementById(‘nnDrawBtn’).addEventListener(‘click’,()=>{stopNNAnim();nnSignals=[];realSignalQueue=[];drawNeuralNet(‘neuralCanvas’,getLayerSizes(),[]);});
document.getElementById(‘nnAnimBtn’).addEventListener(‘click’,()=>{if(nnAnimRunning){stopNNAnim();document.getElementById(‘nnAnimBtn’).textContent=‘▶ הפעל’;}else{startNNAnim();document.getElementById(‘nnAnimBtn’).textContent=‘⏹ עצור’;}});
function stopNNAnim(){nnAnimRunning=false;if(nnAnimTimer){clearInterval(nnAnimTimer);nnAnimTimer=null;}}
function startNNAnim(){nnAnimRunning=true;const layers=getLayerSizes();nnSignals=[];realSignalQueue=[];nnAnimTimer=setInterval(()=>{nnSignals.forEach(s=>{s.t+=s.speed;});nnSignals=nnSignals.filter(s=>s.t<1);while(realSignalQueue.length>0&&nnSignals.length<20){const rs=realSignalQueue.shift();const l0=Math.min(rs.layer,layers.length-2);const ni=rs.fromIdx%layers[l0];const nj=rs.toIdx%layers[l0+1];nnSignals.push({l:l0,i:ni,j:nj,t:0,speed:rs.speed,real:true,score:rs.score,color:rs.color});}if(nnSignals.length<3){const l=Math.floor(Math.random()*(layers.length-1));const i=Math.floor(Math.random()*layers[l]);const j=Math.floor(Math.random()*layers[l+1]);nnSignals.push({l,i,j,t:0,speed:0.012,real:false,color:‘rgba(100,160,255,0.4)’});}drawNeuralNet(‘neuralCanvas’,layers,nnSignals);},30);}
document.getElementById(‘nnDbDrawBtn’).addEventListener(‘click’,()=>{if(!db.length){toast(‘DB ריק’,’’);return;}const famMap={};db.forEach(item=>{const f=item.c||‘General’;if(!famMap[f])famMap[f]=[];famMap[f].push(item);});const famNames=Object.keys(famMap);const inputCount=Math.min(db.length,12);const hiddenLayers=famNames.map(f=>Math.min(famMap[f].length,12));const layerSizes=[inputCount,…hiddenLayers,famNames.length];const cappedSizes=layerSizes.map(n=>Math.min(n,12));drawNeuralNet(‘neuralDbCanvas’,cappedSizes,[],{nodeR:14});const infoEl=document.getElementById(‘neuralDbInfo’);if(infoEl)infoEl.textContent=`${db.length} פריטים · ${famNames.length} משפחות: ${famNames.slice(0,5).join(', ')}${famNames.length>5?'...':''}`;toast(‘רשת DB צוירה ✅’,’’);});
function initNeuralViz(){drawNeuralNet(‘neuralCanvas’,getLayerSizes(),[]);}

/* ══ TAB SWITCH ══ */
function switchTab(t){
document.querySelectorAll(’.tab-btn’).forEach(e=>e.classList.remove(‘active’));
document.querySelectorAll(’.tab-content’).forEach(e=>e.classList.remove(‘active’));
document.querySelector(`.tab-btn[data-tab="${t}"]`).classList.add(‘active’);
document.getElementById(`${t}-tab`).classList.add(‘active’);
if(t===‘db-manage’)renderDBTable();
if(t===‘bom’){renderBOM();renderBOMTabs&&renderBOMTabs();}
if(t===‘stock’&&stockRows.length)renderStockTable();
if(t===‘dashboard’)renderDashboard();
if(t===‘versions’)renderVersions();
if(t===‘attr-search’)populateAttrSuggestions();
if(t===‘neural-viz’){setTimeout(initNeuralViz,50);}
if(t!==‘neural-viz’){stopNNAnim();document.getElementById(‘nnAnimBtn’).textContent=‘▶ הפעל’;}
}
document.querySelectorAll(’.tab-btn’).forEach(btn=>btn.addEventListener(‘click’,()=>switchTab(btn.dataset.tab)));

/* ══ INIT ══ */
const savedStock=tryParse(LS.STOCK,[]);
if(savedStock.length){stockRows=savedStock;stockMap={};stockRows.forEach(r=>stockMap[r.k.toLowerCase()]=r.qty);const dz=document.getElementById(‘stockDropZone’);dz.classList.add(‘loaded’);dz.textContent=`✅ מלאי שמור – ${stockRows.length} פריטים`;}
updateFamilyList();renderCF();
if(db.length){buildTFIDF();const badge=document.getElementById(‘engineBadge’);if(badge)badge.textContent=`🧠 Engine v2 · TF-IDF · Cosine · Phonetic · ${db.length} פריטים indexed`;}

/* ══ EXTRA KEYS ══ */
const ITEM_HISTORY_KEY=‘dazura_v45_item_history’;
const NOTES_KEY=‘dazura_v45_notes’;
const TEMPLATES_KEY=‘dazura_v45_bom_templates’;
const MULTI_BOM_KEY=‘dazura_v45_multi_bom’;
let itemHistory=tryParse(ITEM_HISTORY_KEY,{});
let neuronNotes=tryParse(NOTES_KEY,{});
let bomTemplates=tryParse(TEMPLATES_KEY,[]);
let allBOMs=tryParse(MULTI_BOM_KEY,[]);

/* ══ CLEAR STOCK ══ */
document.getElementById(‘clearStockBtn’)?.addEventListener(‘click’,()=>{if(!stockRows.length){toast(‘אין מלאי’,’’);return;}if(!confirm(‘למחוק מלאי שמור?’))return;stockRows=[];stockMap={};localStorage.removeItem(LS.STOCK);const dz=document.getElementById(‘stockDropZone’);if(dz){dz.classList.remove(‘loaded’);dz.innerHTML=‘📂 גרור CSV או לחץ לבחירה<input type="file" id="stockCsvFile" accept=".csv,.txt" style="display:none;">’;}document.getElementById(‘stockOverviewCard’).style.display=‘none’;document.getElementById(‘stockTableCard’).style.display=‘none’;document.getElementById(‘clearStockBtn’).style.display=‘none’;renderBOM();toast(‘מלאי נמחק ✅’,’’);});

/* ══ MISSING EXPORT ══ */
document.getElementById(‘exportMissingBtn’)?.addEventListener(‘click’,()=>{
if(window._xlsxFailed||typeof XLSX===‘undefined’){toast(‘Excel לא זמין’,’’);return;}
if(!isApproved)return;
const wb=XLSX.utils.book_new();
function xm(v,bg,fg,bold){return{v:String(v||’’),t:‘s’,s:{fill:{patternType:‘solid’,fgColor:{rgb:bg}},font:{bold:!!bold,color:{rgb:fg},name:‘Calibri’,sz:10},alignment:{horizontal:‘right’,vertical:‘center’}}};}
const H=‘FF1A2A5E’,HF=‘FFFFFFFF’;
const rows=[[‘מק”ט’,‘תיאור’,‘נדרש’,‘במלאי’,‘להזמין’,‘ספק’].map(h=>xm(h,H,HF,true))];
let hasRows=false;
bom.forEach(item=>{const needed=item.qty||1,inStock=stockMap[item.k.toLowerCase()]??null;const toOrder=inStock===null?needed:Math.max(0,needed-inStock);if(toOrder<=0)return;hasRows=true;const supplier=(item.custom||[]).find(f=>f.label.match(/ספק|supplier/i))?.value||’’;rows.push([xm(item.k,‘FFFCE8E6’,‘FFC5221F’,true),xm(item.v,‘FFFFFFFF’,‘FF333333’,false),xm(needed,‘FFFFFFFF’,‘FF333333’,true),xm(inStock!==null?inStock:’?’,‘FFFCE8E6’,‘FFC5221F’,false),xm(toOrder,‘FFFCE8E6’,‘FFC5221F’,true),xm(supplier,‘FFFFFFFF’,‘FF1A73E8’,false)]);item.children.forEach(c=>{const cs=stockMap[c.k.toLowerCase()]??null;const ct=cs===null?1:Math.max(0,1-cs);if(ct<=0)return;hasRows=true;rows.push([xm(’  ‘+c.k,‘FFFFF3CD’,‘FF856404’,false),xm(c.v||’’,‘FFFFFFFF’,‘FF555555’,false),xm(1,‘FFFFFFFF’,’’,false),xm(cs!==null?cs:’?’,‘FFFFF3CD’,‘FF856404’,false),xm(ct,‘FFFFF3CD’,‘FF856404’,true),xm(’’,‘FFFFFFFF’,’’,false)]);});});
if(!hasRows){toast(‘אין פריטים חסרים 🎉’,’’);return;}
const ws={};rows.forEach((row,r)=>row.forEach((cell,c)=>{ws[XLSX.utils.encode_cell({r,c})]=cell;}));
ws[’!ref’]=XLSX.utils.encode_range({s:{r:0,c:0},e:{r:rows.length-1,c:5}});
ws[’!cols’]=[{wch:26},{wch:32},{wch:8},{wch:9},{wch:9},{wch:18}];
XLSX.utils.book_append_sheet(wb,ws,‘הזמנה’);XLSX.writeFile(wb,‘OrderList.xlsx’,{bookType:‘xlsx’,cellStyles:true});toast(‘רשימת הזמנה הורדה ✅’,’’);
});

/* ══ MULTI-BOM TABS ══ */
let activeBOMIdx=0;
function renderBOMTabs(){
const bar=document.getElementById(‘bomTabsBar’);if(!bar)return;
const tabs=[{name:‘ראשי’,items:bom},…allBOMs];
bar.innerHTML=tabs.map((b,i)=>`<div class="bom-tab-btn ${activeBOMIdx===i?'active':''}" data-bti="${i}" style="display:flex;align-items:center;gap:4px;">${esc(b.name)}<span style="font-size:.72em;opacity:.7;">(${b.items.length})</span>${i>0?`<button data-del-bom="${i}" style="background:none;border:none;color:inherit;cursor:pointer;font-size:.8em;">✕</button>`:''}</div>`).join(’’)+`<button id="addBOMTab" style="padding:5px 10px;border-radius:6px;border:1px dashed var(--primary);background:transparent;color:var(--primary);cursor:pointer;font-size:.8em;margin-right:4px;">+ חדש</button>`;
bar.querySelectorAll(’[data-bti]’).forEach(btn=>{btn.addEventListener(‘click’,e=>{if(e.target.dataset.delBom)return;const i=+btn.dataset.bti;activeBOMIdx=i;if(i>0)bom=allBOMs[i-1].items;renderBOMTabs();renderBOM();});});
bar.querySelectorAll(’[data-del-bom]’).forEach(btn=>{btn.addEventListener(‘click’,e=>{e.stopPropagation();const i=+btn.dataset.delBom-1;if(!confirm(‘למחוק?’))return;allBOMs.splice(i,1);save(MULTI_BOM_KEY,allBOMs);activeBOMIdx=0;bom=tryParse(LS.BOM,[]);renderBOMTabs();renderBOM();});});
document.getElementById(‘addBOMTab’)?.addEventListener(‘click’,()=>{const name=prompt(‘שם BOM:’,‘BOM ‘+(allBOMs.length+2));if(!name)return;save(LS.BOM,bom);allBOMs.push({name,items:[]});save(MULTI_BOM_KEY,allBOMs);activeBOMIdx=allBOMs.length;bom=[];renderBOMTabs();renderBOM();resetApproval();toast(‘BOM “’+name+’” נוצר’,’’);});
}

/* ══ BOM TEMPLATE ══ */
document.getElementById(‘templateSaveBtn’)?.addEventListener(‘click’,()=>{if(!bom.length){toast(‘BOM ריק’,’’);return;}const name=prompt(‘שם תבנית:’,‘תבנית ‘+(bomTemplates.length+1));if(!name)return;bomTemplates.unshift({name,date:new Date().toLocaleString(‘he-IL’),items:JSON.parse(JSON.stringify(bom))});if(bomTemplates.length>20)bomTemplates.pop();save(TEMPLATES_KEY,bomTemplates);toast(‘תבנית נשמרה ✅’,’’);});

/* ══ DEP GRAPH ══ */
document.getElementById(‘depGraphBtn’)?.addEventListener(‘click’,()=>{const gc=document.getElementById(‘depGraphContainer’);if(gc){const visible=gc.style.display!==‘none’;gc.style.display=visible?‘none’:‘block’;if(!visible)setTimeout(renderDepGraph,50);}});

/* ══ SEARCH listeners ══ */
document.getElementById(‘q’).addEventListener(‘input’,()=>{clearTimeout(searchDebounce);searchDebounce=setTimeout(solve,80);});
document.getElementById(‘precisionRange’)?.addEventListener(‘input’,()=>{clearTimeout(searchDebounce);searchDebounce=setTimeout(solve,80);});

/* ══ KEYBOARD SHORTCUTS ══ */
document.addEventListener(‘keydown’,e=>{
if((e.ctrlKey||e.metaKey)&&e.key===‘f’){e.preventDefault();switchTab(‘search’);const q=document.getElementById(‘q’);if(q){q.focus();q.select();}return;}
if((e.ctrlKey||e.metaKey)&&e.key===‘s’){e.preventDefault();const activeTab=document.querySelector(’.tab-btn.active’);if(activeTab?.dataset.tab===‘setup’){document.getElementById(‘saveBtn’).click();}else if(activeTab?.dataset.tab===‘bom’){document.getElementById(‘saveBOMVersionBtn’).click();}return;}
if(e.key===‘Escape’){if(typeof closeNeuronCard===‘function’)closeNeuronCard();if(typeof closeScanner===‘function’)closeScanner();document.getElementById(‘scannerModal’).style.display=‘none’;return;}
if((e.ctrlKey||e.metaKey)&&e.key===‘b’){e.preventDefault();switchTab(‘bom’);return;}
if((e.ctrlKey||e.metaKey)&&e.key===‘d’){e.preventDefault();switchTab(‘dashboard’);return;}
if((e.ctrlKey||e.metaKey)&&e.key===‘n’){e.preventDefault();switchTab(‘setup’);document.getElementById(‘key’).value=’’;document.getElementById(‘val’).value=’’;document.getElementById(‘key’).focus();return;}
});

/* ══ AUTO-SAVE INDICATOR ══ */
const _origSave=save;
save=function(k,v){_origSave(k,v);showSaveIndicator();};
function showSaveIndicator(){let ind=document.getElementById(‘autoSaveInd’);if(!ind){ind=document.createElement(‘span’);ind.id=‘autoSaveInd’;ind.style.cssText=‘font-size:.75em;padding:3px 8px;border-radius:10px;margin-right:5px;transition:all .3s;font-weight:bold;’;const navRight=document.querySelector(’.nav-right’);if(navRight)navRight.insertBefore(ind,navRight.firstChild);}ind.textContent=‘💾 שומר…’;ind.style.background=‘var(–warning)’;ind.style.color=’#000’;clearTimeout(ind._t1);ind._t1=setTimeout(()=>{ind.textContent=‘✅ נשמר’;ind.style.background=‘var(–success)’;ind.style.color=’#fff’;ind._t2=setTimeout(()=>{ind.textContent=’’;ind.style.background=‘transparent’;},2000);},400);}

/* ══ HTML EXPORT ══ */
function exportHTMLReport(){
if(!bom.length){toast(‘BOM ריק’,’’);return;}
const now=new Date().toLocaleString(‘he-IL’);
const okItems=bom.filter(i=>{const q=stockMap[i.k.toLowerCase()];return q!==undefined&&q>0;});
const missingItems=bom.filter(i=>{const q=stockMap[i.k.toLowerCase()];return q!==undefined&&q===0;});
const rows=bom.map(item=>{const qty=stockMap[item.k.toLowerCase()];const inS=qty!==undefined&&qty>0;const stColor=qty===undefined?’#888’:inS?’#137333’:’#c5221f’;const stLabel=qty===undefined?‘לא נבדק’:inS?`✅ ${qty}`:`⚠️ 0`;return`<tr><td style="padding:8px 12px;font-weight:bold;">${esc(item.k)}</td><td style="padding:8px 12px;">${esc(item.v)}</td><td style="padding:8px 12px;text-align:center;">${item.qty||1}</td><td style="padding:8px 12px;color:${stColor};font-weight:bold;">${stLabel}</td><td style="padding:8px 12px;color:#7B1FA2;">${item.approvedAlt?'✅ '+esc(item.approvedAlt):'—'}</td><td style="padding:8px 12px;color:#555;">${esc(item.note||'')}</td></tr>`;}).join(’’);
const report=`<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><title>דוח BOM</title><style>body{font-family:'Segoe UI',sans-serif;margin:0;padding:24px;background:#f5f7fa;color:#1a1a2e;direction:rtl;}.header{background:linear-gradient(135deg,#1A2A5E,#0066FF);color:#fff;padding:24px 30px;border-radius:12px;margin-bottom:20px;}.header h1{margin:0 0 6px;font-size:1.6em;}.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px;}.kpi{background:#fff;border-radius:10px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.08);}.kpi .num{font-size:2em;font-weight:bold;color:#0066FF;}.kpi .lbl{font-size:.78em;color:#666;margin-top:3px;}table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);}th{background:#1A2A5E;color:#fff;padding:10px 12px;text-align:right;font-size:.88em;}tr:nth-child(even){background:#f8f9ff;}.footer{margin-top:20px;text-align:center;font-size:.78em;color:#888;}</style></head><body><div class="header"><h1>📋 דוח BOM — Dazura</h1><p>נוצר: ${now} | ${bom.length} פריטים</p></div><div class="kpis"><div class="kpi"><div class="num">${bom.length}</div><div class="lbl">סה"כ פריטים</div></div><div class="kpi"><div class="num" style="color:#137333;">${okItems.length}</div><div class="lbl">תקינים</div></div><div class="kpi"><div class="num" style="color:#c5221f;">${missingItems.length}</div><div class="lbl">חסרים</div></div></div><table><thead><tr><th>מק"ט</th><th>תיאור</th><th>כמות</th><th>מלאי</th><th>חלופה</th><th>הערה</th></tr></thead><tbody>${rows}</tbody></table><div class="footer">Dazura Neural Systems</div><script>window.print();<\/script></body></html>`;
const a=document.createElement(‘a’);a.href=URL.createObjectURL(new Blob([report],{type:‘text/html;charset=utf-8’}));a.download=‘BOM_Report.html’;a.click();toast(‘דוח HTML הורד ✅’,’’);
}
document.getElementById(‘exportHTMLReportBtn’)?.addEventListener(‘click’,exportHTMLReport);

/* ══ ITEM HISTORY ══ */
document.getElementById(‘saveBtn’)?.addEventListener(‘click’,()=>{setTimeout(()=>{const k=document.getElementById(‘key’).value.trim();if(!k)return;const item=db.find(x=>x.k===k);if(!item)return;if(!itemHistory[k])itemHistory[k]=[];itemHistory[k].unshift({date:new Date().toLocaleString(‘he-IL’),v:item.v,c:item.c});if(itemHistory[k].length>10)itemHistory[k].pop();save(ITEM_HISTORY_KEY,itemHistory);},200);},{capture:false});

/* ══ INIT TABS ══ */
setTimeout(()=>{renderBOMTabs();},300);

/* ══ WINDOW ERRORS ══ */
window.onunhandledrejection=function(e){if(e.reason&&String(e.reason).includes(‘fetch’))e.preventDefault();};

/* ══ SCANNER ══ */
let _scanTarget=null,_scanStream=null;
async function openScanner(target){
_scanTarget=target;
const modal=document.getElementById(‘scannerModal’);if(!modal)return;
modal.style.display=‘flex’;
const res=document.getElementById(‘scanResult’);
const liveWrap=document.getElementById(‘scanLiveWrap’);
const iosWrap=document.getElementById(‘scanIOSWrap’);
const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent);
const canStream=!isIOS&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia;
if(canStream){
if(liveWrap)liveWrap.style.display=‘block’;if(iosWrap)iosWrap.style.display=‘none’;
if(res)res.textContent=‘מחפש מצלמה…’;
try{_scanStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:‘environment’}});const video=document.getElementById(‘scanVideo’);if(video){video.srcObject=_scanStream;video.play();}
if(‘BarcodeDetector’ in window){const det=new BarcodeDetector({formats:[‘qr_code’,‘code_128’,‘code_39’,‘ean_13’,‘ean_8’,‘upc_a’]});if(res)res.textContent=‘📷 מכוון לברקוד…’;const loop=async()=>{if(!_scanStream)return;try{const codes=await det.detect(video);if(codes.length){_confirmScan(codes[0].rawValue);return;}}catch(e){}requestAnimationFrame(loop);};if(video)video.addEventListener(‘playing’,loop,{once:true});}
else{if(res)res.textContent=‘⚠️ הכנס ידנית’;}}catch(e){if(res)res.textContent=‘⚠️ אין גישה למצלמה’;}
}else{if(liveWrap)liveWrap.style.display=‘none’;if(iosWrap)iosWrap.style.display=‘block’;if(res)res.textContent=’’;}
}
function closeScanner(){if(_scanStream){_scanStream.getTracks().forEach(t=>t.stop());_scanStream=null;}const m=document.getElementById(‘scannerModal’);if(m)m.style.display=‘none’;}
function _confirmScan(code){closeScanner();if(_scanTarget===‘search’){document.getElementById(‘q’).value=code;clearTimeout(searchDebounce);searchDebounce=setTimeout(solve,80);switchTab(‘search’);}else if(_scanTarget===‘setup’){document.getElementById(‘key’).value=code;const ex=db.find(x=>x.k.toLowerCase()===code.toLowerCase());if(ex)loadToEdit(ex.k);}}
document.getElementById(‘scanSearchBtn’)?.addEventListener(‘click’,()=>openScanner(‘search’));
document.getElementById(‘scanOpenCameraBtn’)?.addEventListener(‘click’,()=>{document.getElementById(‘scanCaptureInput’).click();});
document.getElementById(‘scanCaptureInput’)?.addEventListener(‘change’,function(e){const file=e.target.files&&e.target.files[0];if(!file)return;const res=document.getElementById(‘scanResult’);if(‘BarcodeDetector’ in window){const img=new Image();img.onload=async()=>{try{const det=new BarcodeDetector({formats:[‘qr_code’,‘code_128’,‘code_39’,‘ean_13’,‘ean_8’,‘upc_a’,‘data_matrix’]});const codes=await det.detect(img);if(codes.length){_confirmScan(codes[0].rawValue);if(res)res.textContent=‘✅ נסרק: ‘+codes[0].rawValue;}else{if(res)res.textContent=‘⚠️ לא זוהה — הכנס ידנית’;document.getElementById(‘scanManual’).focus();}}catch(err){if(res)res.textContent=‘⚠️ שגיאת זיהוי’;}};img.src=URL.createObjectURL(file);}else{if(res)res.textContent=‘📷 הכנס ידנית’;document.getElementById(‘scanManual’).focus();}this.value=’’;});
document.getElementById(‘scanSetupBtn’)?.addEventListener(‘click’,()=>openScanner(‘setup’));
document.getElementById(‘scanCancelBtn’)?.addEventListener(‘click’,closeScanner);
document.getElementById(‘scanConfirmBtn’)?.addEventListener(‘click’,()=>{const v=document.getElementById(‘scanManual’)?.value.trim();if(v)_confirmScan(v);});
document.getElementById(‘scanManual’)?.addEventListener(‘keydown’,e=>{if(e.key===‘Enter’&&e.target.value.trim())_confirmScan(e.target.value.trim());});

/* ══ BOM DRAG ══ */
let _dragSrcIdx=null;
function enableBOMDrag(){const body=document.getElementById(‘bom-body’);if(!body)return;body.querySelectorAll(‘tr.bom-main-row’).forEach((row)=>{const i=parseInt(row.dataset.bomIdx);row.draggable=true;row.addEventListener(‘dragstart’,()=>{_dragSrcIdx=i;row.style.opacity=’.5’;});row.addEventListener(‘dragend’,()=>{row.style.opacity=‘1’;body.querySelectorAll(‘tr’).forEach(r=>r.classList.remove(‘drag-over’));});row.addEventListener(‘dragover’,e=>{e.preventDefault();row.classList.add(‘drag-over’);});row.addEventListener(‘dragleave’,()=>row.classList.remove(‘drag-over’));row.addEventListener(‘drop’,e=>{e.stopPropagation();row.classList.remove(‘drag-over’);if(_dragSrcIdx===null||_dragSrcIdx===i)return;const moved=bom.splice(_dragSrcIdx,1)[0];bom.splice(i,0,moved);_dragSrcIdx=null;save(LS.BOM,bom);renderBOM();});});}
const _origRenderBOMdrag=renderBOM;
renderBOM=function(){_origRenderBOMdrag();const body=document.getElementById(‘bom-body’);if(!body)return;let mi=0;body.querySelectorAll(‘tr’).forEach(tr=>{if(tr.querySelector(’[data-idx]’)){tr.classList.add(‘bom-main-row’);tr.dataset.bomIdx=mi++;}});enableBOMDrag();};

/* ══ DEP GRAPH ══ */
function renderDepGraph(){
const canvas=document.getElementById(‘depGraph’);if(!canvas){return;}
const gc=document.getElementById(‘depGraphContainer’);if(gc)gc.style.display=‘block’;
if(!bom.length){toast(‘הוסף פריטים ל-BOM תחילה’,’’);return;}
const ctx=canvas.getContext(‘2d’);const W=canvas.width=Math.max(canvas.parentElement?.offsetWidth||700,600);
const nodeMap={};const edges=[];const COL={main:’#0066FF’,REQ:’#E02020’,ACC:’#7C3AED’,TOOL:’#00A550’,alt:’#E91E63’};
const mainItems=[];const childUsage={};
bom.forEach(item=>{mainItems.push(item.k);item.children.forEach(c=>{if(!childUsage[c.k])childUsage[c.k]=[];childUsage[c.k].push({parent:item.k,type:c.type,v:c.v});});if(item.approvedAlt){if(!childUsage[‘ALT:’+item.approvedAlt])childUsage[‘ALT:’+item.approvedAlt]=[];childUsage[‘ALT:’+item.approvedAlt].push({parent:item.k,type:‘ALT’,v:item.approvedAlt});}});
const H=canvas.height=Math.max(350,Math.max(mainItems.length,Object.keys(childUsage).length)*75+80);
ctx.clearRect(0,0,W,H);ctx.fillStyle=getComputedStyle(document.body).getPropertyValue(’–card’).trim()||’#fff’;ctx.fillRect(0,0,W,H);
const LX=W*0.18,RX=W*0.76;
mainItems.forEach((k,i)=>{nodeMap[k]={x:LX,y:60+i*(H-100)/Math.max(mainItems.length-1,1),label:k,color:COL.main,type:‘main’};});
const allChildKeys=Object.keys(childUsage);
allChildKeys.forEach((ck,i)=>{const usage=childUsage[ck];const type=ck.startsWith(‘ALT:’)?‘ALT’:usage[0].type;const label=ck.startsWith(‘ALT:’)?ck.slice(4):ck;const isShared=usage.length>1;nodeMap[ck]={x:RX,y:60+i*(H-100)/Math.max(allChildKeys.length-1,1),label,color:COL[type]||COL.ACC,type,shared:isShared,usage:usage.length};usage.forEach(u=>{edges.push({from:u.parent,to:ck,type,dashed:type===‘ALT’});});});
edges.forEach(e=>{const f=nodeMap[e.from],t=nodeMap[e.to];if(!f||!t)return;ctx.beginPath();ctx.moveTo(f.x+50,f.y);ctx.bezierCurveTo(f.x+130,f.y,t.x-110,t.y,t.x-52,t.y);ctx.strokeStyle=COL[e.type]||’#999’;ctx.lineWidth=t.shared?2.5:1.8;if(e.dashed)ctx.setLineDash([6,4]);else ctx.setLineDash([]);ctx.globalAlpha=t.shared?0.9:0.6;ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;});
Object.values(nodeMap).forEach(n=>{const rw=n.shared?56:50,rh=n.shared?26:22;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(n.x-rw,n.y-rh/2,rw*2,rh,5);else ctx.rect(n.x-rw,n.y-rh/2,rw*2,rh);ctx.fillStyle=n.color+(n.shared?‘33’:‘18’);ctx.fill();ctx.strokeStyle=n.color;ctx.lineWidth=n.type===‘main’?2.5:n.shared?2:1.5;ctx.stroke();ctx.fillStyle=getComputedStyle(document.body).getPropertyValue(’–text’).trim()||’#111’;ctx.font=(n.type===‘main’||n.shared?‘bold ‘:’’)+Math.min(n.shared?12:10,11)+‘px Segoe UI’;ctx.textAlign=‘center’;ctx.textBaseline=‘middle’;let lbl=n.label;while(ctx.measureText(lbl+’…’).width>rw*2-10&&lbl.length>3)lbl=lbl.slice(0,-1);if(lbl!==n.label)lbl+=’…’;ctx.fillText(lbl,n.x,n.y);if(n.shared){ctx.fillStyle=n.color;ctx.font=‘bold 9px Segoe UI’;ctx.fillText(‘×’+n.usage,n.x+rw-8,n.y-rh/2+7);}});
}

/* ══════════════════════════════════════════════════════════════
WIRE DETECTION & AUTO-RESOLVE
═══════════════════════════════════════════════════════════════
תיקון מרכזי: _isWireItem ו-_rescanBOMAfterWireAdded
══════════════════════════════════════════════════════════════ */

const WIRE_FAMILIES_LC=[‘wire’,‘wires’,‘cable’,‘cables’,‘חוטים’,‘כבלים’,‘חוט’,‘כבל’,‘conductor’,‘leads’];
const WIRE_DESC_KEYWORDS=[‘wire’,‘cable’,‘חוט’,‘כבל’,‘conductor’,‘awg’,‘gauge’,‘hookup’,‘hook-up’,‘lead’];

function _isWireItem(item){
if(!item)return false;
// בדוק משפחה
const fam=(item.c||’’).toLowerCase();
if(WIRE_FAMILIES_LC.some(w=>fam.includes(w)))return true;
// בדוק תיאור
const desc=(item.v||’’).toLowerCase();
if(WIRE_DESC_KEYWORDS.some(w=>desc.includes(w)))return true;
// בדוק AWG בתיאור
if(/\d+\s*awg|\d+\s*mm[²2]/i.test(item.v||’’))return true;
// בדוק שדות custom
if((item.custom||[]).some(f=>/awg|gauge|חתך|עובי/i.test(f.label)))return true;
return false;
}

function _extractWireParams(item){
const params={};
const custom=item.custom||[];
const desc=(item.v||’’).toLowerCase();

// AWG מ-custom
const awgField=custom.find(f=>/awg|gauge/i.test(f.label));
if(awgField)params.awg=awgField.value.replace(/\D/g,’’);

// AWG מ-תיאור “14awg” או “AWG14” או “14 awg”
if(!params.awg){
const m=desc.match(/(\d+)\s*awg|awg\s*(\d+)/i);
if(m)params.awg=m[1]||m[2];
}

// mm² מ-custom
const mm2Field=custom.find(f=>/חתך|mm2|mm²|cross|area/i.test(f.label));
if(mm2Field)params.mm2=parseFloat(mm2Field.value)||0;

// mm² מ-תיאור
if(!params.mm2){const m2=desc.match(/([\d.]+)\s*mm[²2]/);if(m2)params.mm2=parseFloat(m2[1]);}

// מתח מ-custom
const vField=custom.find(f=>/מתח|voltage|volt/i.test(f.label));
if(vField)params.voltage=parseFloat(vField.value)||0;

// מתח מ-תיאור “600v”
if(!params.voltage){const vm=desc.match(/(\d{2,4})\s*v(?:olt|dc|ac)?/i);if(vm)params.voltage=parseInt(vm[1]);}

// spec מ-custom
const specField=custom.find(f=>/spec|standard|ul|mil|תקן/i.test(f.label));
if(specField)params.spec=specField.value;

// בידוד מ-custom
const insField=custom.find(f=>/insulation|בידוד|חומר/i.test(f.label));
if(insField)params.insulation=insField.value.toLowerCase();
if(!params.insulation){
if(/ptfe|teflon/i.test(item.v||’’))params.insulation=‘ptfe’;
else if(/silicone/i.test(item.v||’’))params.insulation=‘silicone’;
else if(/600\s*v/i.test(item.v||’’))params.insulation=‘pvc_600v’;
else params.insulation=‘pvc’;
}

return params;
}

/* ══ AUTO-RESOLVE: כשמוסיפים פריט ל-BOM, בדוק חוטים קיימים ══ */
function _autoResolveFromBOM(item, children){
const wire_api=window._dazuraWire;
const acc_prefixes=(item.acc||[]).map(a=>a.toUpperCase().trim());
const hasRules=item.rules&&item.rules.length>0;
if(!acc_prefixes.length&&!hasRules)return children;

const wires=bom.filter(b=>{const d=db.find(x=>x.k===b.k)||b;return _isWireItem(d);});
if(!wires.length)return children;

const resolvedChildren=[…children];

wires.forEach(wireItem=>{
const wireDB=db.find(x=>x.k===wireItem.k)||wireItem;

```
if(wire_api){
  const wireData=wire_api.dazuraSelectShrink(wireDB);
  if(wireData&&wireData.od_mm){
    acc_prefixes.forEach(prefix=>{
      if(!wire_api.SHRINK_CATALOG[prefix])return;
      const shrink=wire_api.selectShrink(prefix,wireData.od_mm);
      if(!shrink||shrink.sfx==='?')return;
      const resolvedPN=shrink.fullPN;
      const childUID=`${resolvedPN}__${wireItem.k}`;
      if(resolvedChildren.some(c=>c._uid===childUID))return;
      const existing=db.find(x=>x.k.toLowerCase()===resolvedPN.toLowerCase());
      resolvedChildren.push({
        k:resolvedPN,
        v:existing?existing.v:`Shrink ${prefix} ${shrink.sfx}`,
        img:existing?existing.img:'',
        type:'ACC',resolved:true,
        resolvedFrom:wireItem.k,
        note:`${shrink.sfx} — OD=${wireData.od_mm.toFixed(1)}mm (${wireData.specLabel||wireData.awg+'AWG'})`,
        _uid:childUID
      });
    });
    return;
  }
}

// Fallback: extractParams
const params=_extractWireParams(wireDB);
if(!params.awg)return;
if(hasRules){
  const re=window._dazuraRules;
  if(!re)return;
  const results=re.evaluateRules(item,params);
  results.forEach(r=>{
    if(resolvedChildren.some(c=>c.k===r.resolvedPN))return;
    const existing=db.find(x=>x.k.toLowerCase()===r.resolvedPN.toLowerCase());
    resolvedChildren.push({k:r.resolvedPN,v:existing?existing.v:(r.note||'מחושב'),img:existing?existing.img:'',type:'ACC',resolved:true,resolvedFrom:wireItem.k,note:r.note});
  });
}
```

});

return resolvedChildren;
}

/* ══ RE-SCAN: כשמוסיפים חוט, עדכן פריטים קיימים ב-BOM ══
זו הפונקציה המתוקנת — בודקת גם acc ולא רק rules
══ */
function _rescanBOMAfterWireAdded(newWireKey){
const wireItem=db.find(x=>x.k===newWireKey);
if(!wireItem||!_isWireItem(wireItem))return;

const wire_api=window._dazuraWire;

// נסה wire_api קודם
let wireData=null;
if(wire_api){
wireData=wire_api.dazuraSelectShrink(wireItem);
}

// Fallback: extractParams
const params=_extractWireParams(wireItem);
if(!wireData&&!params.awg)return; // לא נמצא AWG — לא ניתן לחשב

// אם wire_api הצליח — השתמש בו
// אם לא — נחשב OD מהטבלה הגנרית
let od_mm=null;
let specLabel=’’;
if(wireData&&wireData.od_mm){
od_mm=wireData.od_mm;
specLabel=wireData.specLabel||`${wireData.awg}AWG`;
} else if(params.awg){
// חשב OD גנרי לפי AWG + בידוד
const ins=params.insulation||‘pvc’;
const odTable={
‘30’:{pvc:1.14,ptfe:0.89,silicone:1.20},
‘28’:{pvc:1.27,ptfe:0.97,silicone:1.35},
‘26’:{pvc:1.42,ptfe:1.12,silicone:1.50},
‘24’:{pvc:1.60,ptfe:1.29,silicone:1.65},
‘22’:{pvc:1.80,ptfe:1.47,silicone:1.78},
‘20’:{pvc:2.03,ptfe:1.70,silicone:2.10},
‘18’:{pvc:2.39,ptfe:1.98,silicone:2.50},
‘16’:{pvc:2.77,ptfe:2.34,silicone:2.90},
‘14’:{pvc:3.18,ptfe:2.79,silicone:3.33},
‘12’:{pvc:3.81,ptfe:3.28,silicone:3.99},
‘10’:{pvc:4.57,ptfe:3.99,silicone:4.78},
};
const odRow=odTable[String(params.awg)];
if(odRow){
const insKey=ins.includes(‘ptfe’)||ins.includes(‘teflon’)?‘ptfe’:ins.includes(‘sil’)?‘silicone’:‘pvc’;
od_mm=odRow[insKey]||odRow.pvc;
specLabel=`${params.awg}AWG ${ins.toUpperCase()}`;
}
}

if(!od_mm)return; // עדיין לא הצלחנו — נפסיק

let updated=0;

bom.forEach(bomItem=>{
const dbItem=db.find(x=>x.k===bomItem.k)||bomItem;
const accPrefixes=(dbItem.acc||[]).map(a=>a.toUpperCase().trim());
const hasRules=dbItem.rules&&dbItem.rules.length>0;
if(!accPrefixes.length&&!hasRules)return;

```
// ── טפל ב-acc prefixes (RSFR, ATUM וכו') ──
accPrefixes.forEach(prefix=>{
  // בדוק שזה prefix של shrink ולא סתם acc
  const catalog=wire_api?wire_api.SHRINK_CATALOG[prefix]:null;
  if(!catalog){
    // אולי זה prefix ידוע אפילו בלי wire_api
    const knownShrinkPrefixes=['RSFR','ATUM','EPS','CGAT','SCL'];
    if(!knownShrinkPrefixes.includes(prefix))return;
  }

  let shrinkPN=null;
  let shrinkSfx='';

  if(wire_api&&catalog){
    const shrink=wire_api.selectShrink(prefix,od_mm);
    if(!shrink||shrink.sfx==='?')return;
    shrinkPN=shrink.fullPN;
    shrinkSfx=shrink.sfx;
  } else {
    // Fallback: חשב גודל RSFR ידנית
    // RSFR sizes: 3/32(2.4mm), 3/16(4.8mm), H1(6.4mm), 3/8(9.5mm)
    const rsfrSizes=[
      {sfx:'3/32',id:2.4},{sfx:'3/16',id:4.8},{sfx:'H1',id:6.4},
      {sfx:'3/8',id:9.5},{sfx:'H2',id:12.7},{sfx:'3/4',id:19.0}
    ];
    const needed=od_mm*1.10;
    const sz=rsfrSizes.find(s=>s.id>=needed);
    if(!sz)return;
    shrinkPN=`${prefix}-${sz.sfx}`;
    shrinkSfx=sz.sfx;
  }

  if(!shrinkPN)return;

  // מזהה ייחודי per (shrink, wire) — מאפשר שרוול אחד לכל חוט
  const childUID=`${shrinkPN}__${newWireKey}`;
  if(bomItem.children.some(c=>c._uid===childUID))return;

  // הסר את ה-acc הגנרי (RSFR ללא גודל) אם קיים
  const genericIdx=bomItem.children.findIndex(c=>c.k===prefix&&!c.resolved);
  if(genericIdx>=0)bomItem.children.splice(genericIdx,1);

  const existing=db.find(x=>x.k.toLowerCase()===shrinkPN.toLowerCase());
  bomItem.children.push({
    k:shrinkPN,
    v:existing?existing.v:`Shrink ${prefix} ${shrinkSfx}`,
    img:existing?existing.img:'',
    type:'ACC',
    resolved:true,
    resolvedFrom:newWireKey,
    note:`${shrinkSfx} — OD=${od_mm.toFixed(1)}mm (${specLabel})`,
    _uid:childUID
  });
  updated++;
});

// ── טפל ב-rules ──
if(hasRules&&wire_api){
  const ruleParams={
    awg:String(params.awg||wireData?.awg||''),
    voltage:String(params.voltage||wireData?.voltage||''),
    insulation:params.insulation||wireData?.insulation||'',
    od_mm:String(od_mm)
  };
  (dbItem.rules||[]).forEach(rule=>{
    const pval=ruleParams[rule.param];
    if(!pval||String(pval).toLowerCase()!==String(rule.value).toLowerCase())return;
    if(bomItem.children.some(c=>c.k===rule.then))return;
    const existing=db.find(x=>x.k.toLowerCase()===rule.then.toLowerCase());
    bomItem.children.push({k:rule.then,v:existing?existing.v:(rule.note||'מחושב'),img:existing?existing.img:'',type:'ACC',resolved:true,resolvedFrom:newWireKey,note:rule.note||''});
    updated++;
  });
}
```

});

if(updated){
save(LS.BOM,bom);
renderBOM();
toast(`🔗 נוספו ${updated} שרוולים אוטומטיים עבור ${newWireKey}`,’’);
}
}

/* ══ RULES DIALOG ══ */
function *showRulesDialog(item,children,k){
const neededParams=[…new Set((item.rules||[]).map(r=>r.param))];
const overlay=document.createElement(‘div’);
overlay.style.cssText=‘position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9800;display:flex;align-items:center;justify-content:center;’;
const paramFields=neededParams.map(p=>{const labels={awg:‘AWG’,voltage:‘מתח (V)’,mm2:‘חתך (mm²)’,temp:‘טמפ׳ (°C)’};return`<div style="margin-bottom:10px;"><label style="font-size:.85em;font-weight:bold;color:var(--text);">${labels[p]||p}</label><input type="text" id="rp_${p}" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--hover);color:var(--text);font-size:1em;direction:ltr;"></div>`;}).join(’’);
overlay.innerHTML=`<div style="background:var(--card);border-radius:14px;padding:22px;width:360px;max-width:92vw;border:2px solid var(--primary);"><h3 style="margin:0 0 14px;color:var(--text);">🔗 פרמטרים ל-${esc(k)}</h3>${paramFields}<div style="display:flex;gap:8px;margin-top:12px;"><button id="rulesConfirmBtn" class="btn btn-primary" style="flex:1;">✅ הוסף</button><button id="rulesSkipBtn" class="btn btn-ghost" style="flex:1;">דלג</button><button id="rulesCancelBtn" class="btn btn-ghost" style="padding:8px 12px;">ביטול</button></div></div>`;
document.body.appendChild(overlay);
document.getElementById(‘rulesConfirmBtn’).addEventListener(‘click’,()=>{
const params={};neededParams.forEach(p=>{const v=document.getElementById(’rp*’+p)?.value.trim();if(v)params[p]=v;});
bom.push({…item,children:[…children],note:’’,qty:1,itemType:‘REQ’,approvedAlt:null,params});
save(LS.BOM,bom);renderBOM();resetApproval();document.body.removeChild(overlay);toast(‘נוסף: ‘+k,’’);
});
document.getElementById(‘rulesSkipBtn’).addEventListener(‘click’,()=>{bom.push({…item,children,note:’’,qty:1,itemType:‘REQ’,approvedAlt:null,params:{}});save(LS.BOM,bom);renderBOM();resetApproval();document.body.removeChild(overlay);toast(‘נוסף: ‘+k,’’);});
document.getElementById(‘rulesCancelBtn’).addEventListener(‘click’,()=>document.body.removeChild(overlay));
setTimeout(()=>document.getElementById(‘rp_’+neededParams[0])?.focus(),100);
}

/* ══ IMAGE URL INPUT ══ */
(function(){
const itemImgEl=document.getElementById(‘itemImg’);
if(itemImgEl&&itemImgEl.parentNode){
const imgUrlInput=document.createElement(‘input’);
imgUrlInput.type=‘text’;imgUrlInput.placeholder=‘או הכנס URL תמונה…’;imgUrlInput.style.cssText=‘margin-bottom:11px;’;
imgUrlInput.addEventListener(‘input’,()=>{const url=imgUrlInput.value.trim();if(url.match(/^https?://.+.(jpg|jpeg|png|gif|webp|svg)/i)){currentBase64=url;const p=document.getElementById(‘setupPreview’);if(p){p.src=url;p.style.display=‘block’;}}});
itemImgEl.parentNode.insertBefore(imgUrlInput,itemImgEl.nextSibling);
}
})();

/* ══ NEURON CARD (stub — full version in separate module) ══ */
function openNeuronCard(k){
const item=db.find(x=>x.k===k);if(!item)return;
const card=document.getElementById(‘neuronCard’);if(!card)return;
document.getElementById(‘nc-key’).textContent=item.k;
document.getElementById(‘nc-desc’).textContent=item.v;
document.getElementById(‘nc-family’).textContent=item.c;
const ncImg=document.getElementById(‘nc-img’);if(item.img){ncImg.src=item.img;ncImg.style.display=‘block’;}else ncImg.style.display=‘none’;
document.getElementById(‘nc-tags’).innerHTML=(item.req||[]).map(r=>`<span class="tag tag-req">${esc(r)}</span>`).join(’’)+(item.tool?`<span class="tag tag-tool">${esc(item.tool)}</span>`:’’)+( item.acc||[]).map(a=>`<span class="tag tag-acc">${esc(a)}</span>`).join(’’);
const qty=stockMap[item.k.toLowerCase()];
document.getElementById(‘nc-stock’).innerHTML=qty!==undefined?`מלאי: <b>${qty}</b> ${qty>0?'✅':'⚠️ חסר'}`:‘מלאי: לא נבדק’;
document.getElementById(‘nc-add-bom’).onclick=()=>{addToBOM(k);closeNeuronCard();};
document.getElementById(‘nc-edit’).onclick=()=>{loadToEdit(k);closeNeuronCard();};
document.getElementById(‘nc-copy’).onclick=()=>{navigator.clipboard?.writeText(k);toast(‘הועתק: ‘+k,’’);};
card.classList.add(‘open’);
}
function closeNeuronCard(){const card=document.getElementById(‘neuronCard’);if(card)card.classList.remove(‘open’);}
document.getElementById(‘nc-close’)?.addEventListener(‘click’,closeNeuronCard);
document.getElementById(‘neuronCard’)?.addEventListener(‘click’,e=>{if(e.target===document.getElementById(‘neuronCard’))closeNeuronCard();});

/* ══ CALC BOM COST ══ */
function calcBOMCost(){let total=0;bom.forEach(item=>{const pf=(item.custom||[]).find(f=>f.label.match(/מחיר|price|cost/i));if(pf)total+=parseFloat(pf.value||0)*(item.qty||1);});return total;}

})();
