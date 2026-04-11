/* ═══════════════════════════════════════════════════════════════════
   DAZURA NEURAL SYSTEMS — dazura_app.js
   ─────────────────────────────────────────────────────────────────
   קוד הממשק המלא: מנוע חיפוש, BOM, ייצוא, גרף, סורק ועוד
   טוען אחרי: dazura_semantics.js
═══════════════════════════════════════════════════════════════════ */

(function(){
/* ══ LS KEYS ══ */
const LS={DB:'dazura_v45_db',BOM:'dazura_v45_bom',FAM:'dazura_v45_fam',STOCK:'dazura_v45_stock',VERS:'dazura_v45_versions',THEME:'dazura_v45_theme',FONT:'dazura_v45_font'};
function tryParse(k,d){try{return JSON.parse(localStorage.getItem(k))||d;}catch{return d;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{toast('שגיאת שמירה','#e00');}}

/* ══ STATE ══ */
let db=tryParse(LS.DB,[]),bom=tryParse(LS.BOM,[]),families=tryParse(LS.FAM,['Connectors','Wires','Tools']),versions=tryParse(LS.VERS,[]);
let stockMap={},stockRows=[],isApproved=false,currentBase64='',customFields=[],searchDebounce=null,selectedKeys=new Set(),famSearchFilter=null;
let toastTimer=null;

/* ══ THEME ENGINE ══ */
const THEMES=[
  {id:'',           label:'🔵 כחול מקצועי', desc:'כחול מקצועי'},
  {id:'t-midnight', label:'🌑 Midnight',     desc:'Midnight'},
  {id:'t-slate',    label:'⬛ Slate Dark',   desc:'Slate Dark'},
  {id:'t-forest',   label:'🌲 Forest',       desc:'Forest'},
  {id:'t-amber',    label:'🟡 Amber',        desc:'Amber'},
  {id:'t-rose',     label:'🌸 Rose',         desc:'Rose'},
  {id:'t-arctic',   label:'🧊 Arctic',       desc:'Arctic'},
  {id:'t-violet',   label:'💜 Violet',       desc:'Violet Pro'},
  {id:'t-carbon',   label:'⚫ Carbon',       desc:'Carbon'},
  {id:'t-solar',    label:'☀️ Solar',        desc:'Solar'},
];
let themeIdx=parseInt(tryParse(LS.THEME,0))||0;
function applyTheme(){document.body.className=THEMES[themeIdx].id;document.getElementById('themeBtn').textContent='🎨 '+(THEMES[themeIdx].desc||THEMES[themeIdx].label.replace(/^\S+ /,''));save(LS.THEME,themeIdx);}
document.getElementById('themeBtn').addEventListener('click',()=>{themeIdx=(themeIdx+1)%THEMES.length;applyTheme();});
if(!localStorage.getItem(LS.THEME)&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){themeIdx=1;}
applyTheme();

/* ══ FONT SIZE ══ */
const fontSlider=document.getElementById('fontSlider');
const savedFont=localStorage.getItem(LS.FONT);
if(savedFont){fontSlider.value=savedFont;document.documentElement.style.setProperty('--font-base',savedFont+'px');}
fontSlider.addEventListener('input',()=>{const v=fontSlider.value;document.documentElement.style.setProperty('--font-base',v+'px');localStorage.setItem(LS.FONT,v);});

/* ══ PRINT ══ */
document.getElementById('printBOMBtn').addEventListener('click',()=>{switchTab('bom');setTimeout(()=>window.print(),200);});

/* ══ TOAST (fixed: clears previous timer) ══ */
function toast(m,c){
  if(toastTimer)clearTimeout(toastTimer);
  const t=document.getElementById('toast');
  t.textContent=m;t.style.background=c||'';
  t.classList.add('show');
  toastTimer=setTimeout(()=>{t.classList.remove('show');toastTimer=null;},2500);
}

/* ══ ESC ══ */
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

/* ══ RESIZE IMAGE ══ */
function resizeImage(file,cb){const c=document.createElement('canvas'),img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{const m=200;let w=img.width,h=img.height;if(w>m||h>m){if(w>h){h=Math.round(h*m/w);w=m;}else{w=Math.round(w*m/h);h=m;}}c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);URL.revokeObjectURL(url);cb(c.toDataURL('image/jpeg',.75));};img.onerror=()=>{URL.revokeObjectURL(url);cb('');};img.src=url;}

/* ════════════════════════════════════════════════════════
   ENGINE v2 — שלוש שכבות AI אופליין מלא
   ════════════════════════════════════════════════════════
   רמה 1 · TF-IDF  — משקל לפי נדירות מילה ב-DB
   רמה 2 · Cosine Similarity — וקטורים, מרחק קוסינוס
   רמה 3 · Soundex + Metaphone — התאמה פונטית (הגייה)
   ════════════════════════════════════════════════════════ */

/* ── עזרים בסיסיים ── */
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
  return String(s||'').toLowerCase()
    .replace(/[^\w\u0590-\u05ff\s]/g,' ')
    .split(/\s+/).filter(w=>w.length>1);
}

/* ════════════════
   רמה 3 · SOUNDEX (English) + גרסה מותאמת לאלפנומרי
════════════════ */
function soundex(s){
  s=String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(!s)return'0000';
  const map={B:'1',F:'1',P:'1',V:'1',C:'2',G:'2',J:'2',K:'2',Q:'2',S:'2',X:'2',Z:'2',
             D:'3',T:'3',L:'4',M:'5',N:'5',R:'6'};
  let code=s[0],prev=map[s[0]]||'0';
  for(let i=1;i<s.length&&code.length<4;i++){
    const c=map[s[i]]||'0';
    if(c!=='0'&&c!==prev)code+=c;
    prev=c;
  }
  return (code+'000').slice(0,4);
}

/* Metaphone — אנגלית + קידומות מק"ט */
function metaphone(s){
  s=String(s||'').toUpperCase().replace(/[^A-Z]/g,'');
  if(!s)return'';
  // מספר שינויים קלאסיים
  s=s.replace(/^AE|^GN|^KN|^PN|^WR/,'');
  let r='';
  for(let i=0;i<s.length;i++){
    const c=s[i],p=s[i-1]||'',n=s[i+1]||'',nn=s[i+2]||'';
    if('AEIOU'.includes(c)){if(i===0)r+=c;continue;}
    if(c==='B'){if(p!=='M')r+='B';continue;}
    if(c==='C'){
      if(n==='I'||n==='E'||n==='Y'){r+='S';}
      else if(n==='H'){r+='X';i++;}
      else r+='K';
      continue;
    }
    if(c==='D'){r+=n==='G'&&'IEY'.includes(nn)?'J':'T';continue;}
    if(c==='G'){
      if(n==='H'&&!'AEIOU'.includes(nn))continue;
      if(n==='N'&&(nn===''||(nn==='E'&&s[i+3]==='')))continue;
      if('IEY'.includes(n))r+='J';else r+='K';
      continue;
    }
    if(c==='H'){if('AEIOU'.includes(n)&&!'AEIOU'.includes(p))r+='H';continue;}
    if(c==='K'){if(p!=='C')r+='K';continue;}
    if(c==='P'){r+=n==='H'?'F':'P';continue;}
    if(c==='Q'){r+='K';continue;}
    if(c==='S'){r+=n==='H'||(n==='I'&&('AO'.includes(nn)))?'X':'S';continue;}
    if(c==='T'){r+=n==='H'?'0':(n==='I'&&'AO'.includes(nn))?'X':'T';continue;}
    if(c==='V'){r+='F';continue;}
    if(c==='W'||c==='Y'){if('AEIOU'.includes(n))r+=c;continue;}
    if(c==='X'){r+='KS';continue;}
    if(c==='Z'){r+='S';continue;}
    r+=c;
  }
  return r;
}

function phoneticSim(a,b){
  // מחזיר 0-1: שילוב soundex + metaphone + edit על הגרסאות הפונטיות
  const sa=soundex(a),sb=soundex(b);
  const ma=metaphone(a),mb=metaphone(b);
  let score=0;
  if(sa===sb)score+=0.4;
  if(ma&&mb&&ma===mb)score+=0.4;
  else if(ma&&mb){
    const ml=Math.max(ma.length,mb.length)||1;
    score+=0.4*Math.max(0,1-editDist(ma,mb)/ml);
  }
  // גם edit distance על המחרוזת המקורית
  const ml2=Math.max(a.length,b.length)||1;
  score+=0.2*Math.max(0,1-editDist(a,b)/ml2);
  return Math.min(score,1);
}

/* ════════════════
   רמה 1 · TF-IDF index
════════════════ */
// idf[term] = log(N / df)
let tfidfIndex={idf:{},docs:[]};

function buildItemText(item){
  // שדות משוקללים: מק"ט×3, תיאור×2, מאפיינים×1.5, משפחה×1
  return [
    ...Array(3).fill(item.k),
    ...Array(2).fill(item.v||''),
    item.c||'',
    ...(item.custom||[]).flatMap(f=>[f.label,f.label,f.value,f.value]),
    ...(item.req||[]),
    item.tool||''
  ].join(' ');
}

function buildTFIDF(){
  const N=db.length;
  if(!N){tfidfIndex={idf:{},docs:[]};return;}
  // ספור df לכל term
  const df={};
  const docTokens=db.map(item=>{
    const tokens=tokenize(buildItemText(item));
    const tf={};
    tokens.forEach(t=>{tf[t]=(tf[t]||0)+1;});
    // normalize tf
    const maxTF=Math.max(...Object.values(tf),1);
    Object.keys(tf).forEach(t=>tf[t]=tf[t]/maxTF);
    Object.keys(tf).forEach(t=>{df[t]=(df[t]||0)+1;});
    return tf;
  });
  // חשב idf
  const idf={};
  Object.keys(df).forEach(t=>{idf[t]=Math.log((N+1)/(df[t]+1))+1;});
  // בנה וקטורי tfidf + נרמל
  const docs=docTokens.map(tf=>{
    const vec={};
    Object.keys(tf).forEach(t=>{vec[t]=tf[t]*(idf[t]||1);});
    const norm=Math.sqrt(Object.values(vec).reduce((s,v)=>s+v*v,0))||1;
    Object.keys(vec).forEach(t=>vec[t]/=norm);
    return vec;
  });
  tfidfIndex={idf,docs};
  // עדכן badge
  const badge=document.getElementById('engineBadge');
  if(badge)badge.textContent=`🧠 Engine v2 · TF-IDF · Cosine · Phonetic · ${N} פריטים indexed · ${Object.keys(idf).length} terms`;
}

function queryTFIDF(qText){
  // בנה וקטור שאילתה עם idf מה-index
  const {idf,docs}=tfidfIndex;
  if(!docs.length)return[];
  const tokens=tokenize(qText);
  const tf={};
  tokens.forEach(t=>{tf[t]=(tf[t]||0)+1;});
  const maxTF=Math.max(...Object.values(tf),1);
  const qvec={};
  Object.keys(tf).forEach(t=>{qvec[t]=(tf[t]/maxTF)*(idf[t]||Math.log(2));});
  const qnorm=Math.sqrt(Object.values(qvec).reduce((s,v)=>s+v*v,0))||1;
  Object.keys(qvec).forEach(t=>qvec[t]/=qnorm);
  // cosine similarity כנגד כל מסמך
  return docs.map((dvec,i)=>{
    let dot=0;
    Object.keys(qvec).forEach(t=>{if(dvec[t])dot+=qvec[t]*dvec[t];});
    return{idx:i,cos:dot};
  });
}

/* ════════════════
   רמה 2 · Cosine Similarity בין פריטים (לחלופות)
════════════════ */
function cosineSim(vecA,vecB){
  let dot=0,na=0,nb=0;
  // union of keys
  const keys=new Set([...Object.keys(vecA),...Object.keys(vecB)]);
  keys.forEach(k=>{
    const a=vecA[k]||0,b=vecB[k]||0;
    dot+=a*b;na+=a*a;nb+=b*b;
  });
  return dot/(Math.sqrt(na)*Math.sqrt(nb)||1);
}

/* ════════════════
   INVALIDATE — rebuild on DB change
════════════════ */
let _dupCache=null,_dupCacheLen=-1;
function invalidateDupCache(){_dupCache=null;_dupCacheLen=-1;tfidfIndex={idf:{},docs:[]};}

function ensureTFIDF(){if(!tfidfIndex.docs.length&&db.length)buildTFIDF();}

/* ════════════════
   ALT SCORE v2 — TF-IDF cosine + phonetic + edit + family + custom
════════════════ */
function altScore(qi,ci,fromIdx,toIdx){
  if(!qi||!ci||qi.k.toLowerCase()===ci.k.toLowerCase())return{score:0,reasons:[]};
  let score=0;const reasons=[];

  // ── שכבה 3: פונטי (soundex+metaphone) על המק"ט ──
  const ps=phoneticSim(qi.k,ci.k);
  const phonePts=Math.round(ps*30);
  score+=phonePts;
  if(ps>0.55)reasons.push(`צליל דומה (${Math.round(ps*100)}%)`);

  // ── שכבה 1+2: TF-IDF cosine בין הפריטים ──
  ensureTFIDF();
  const {docs}=tfidfIndex;
  if(docs.length&&fromIdx!==undefined&&toIdx!==undefined&&docs[fromIdx]&&docs[toIdx]){
    const cos=cosineSim(docs[fromIdx],docs[toIdx]);
    const cosPts=Math.round(cos*40);
    score+=cosPts;
    if(cos>0.25)reasons.push(`תוכן דומה (${Math.round(cos*100)}%)`);
  } else {
    // fallback — edit distance על תיאור
    const qw=tokenize(qi.v),cw=tokenize(ci.v);
    if(qw.length&&cw.length){
      const ov=qw.filter(w=>cw.includes(w)).length;
      const ovPts=Math.round(ov/Math.max(qw.length,cw.length)*15);
      score+=ovPts;if(ovPts>3)reasons.push(`תיאור דומה`);
    }
  }

  // ── משפחה ──
  if(qi.c&&ci.c&&qi.c===ci.c){score+=20;reasons.push(`משפחה: ${esc(qi.c)}`);}

  // ── מאפיינים מותאמים (custom fields) ──
  const qf=qi.custom||[],cf=ci.custom||[];
  if(qf.length){
    let matched=0;
    qf.forEach(f=>{
      const c2=cf.find(x=>x.label.toLowerCase()===f.label.toLowerCase());
      if(c2&&f.value&&c2.value&&f.value.toLowerCase()===c2.value.toLowerCase()){
        matched++;reasons.push(`${esc(f.label)}=${esc(f.value)}`);
      }
    });
    if(matched)score+=Math.round(matched/qf.length*20);
  }

  const finalScore=Math.min(score,100);
  if(finalScore>5&&fromIdx!==undefined&&toIdx!==undefined)
    emitNeuralSignal(fromIdx,toIdx,finalScore,1);
  return{score:finalScore,reasons};
}

function findBestAlt(k){
  ensureTFIDF();
  const fromIdx=db.findIndex(x=>x.k.toLowerCase()===k.toLowerCase());
  const qi=fromIdx>=0?db[fromIdx]:null;
  if(!qi){
    // פריט לא ב-DB — פונטי בלבד על המק"ט
    const cs=db.map((c,ci)=>{
      const ps=phoneticSim(k,c.k);
      const s=Math.round(ps*60);
      if(s>5)emitNeuralSignal(0,ci,s,0);
      return{item:c,score:s,reasons:s>5?[`צליל דומה (${Math.round(ps*100)}%)`]:[]};
    }).filter(x=>x.score>5).sort((a,b)=>b.score-a.score);
    return cs.length?cs[0]:null;
  }
  const sc=db
    .map((c,ci)=>({item:c,...altScore(qi,c,fromIdx,ci)}))
    .filter(x=>x.item.k.toLowerCase()!==k.toLowerCase()&&x.score>5)
    .sort((a,b)=>b.score-a.score);
  return sc.length?sc[0]:null;
}

/* ════════════════
   DUPLICATES — cosine + phonetic (מדויק יותר מ-editDist בלבד)
════════════════ */
function findDuplicates(){
  if(_dupCacheLen===db.length&&_dupCache!==null)return _dupCache;
  ensureTFIDF();
  const {docs}=tfidfIndex;
  const p=[];
  for(let i=0;i<db.length;i++){
    for(let j=i+1;j<db.length;j++){
      // שלב א: פונטי מהיר
      const ps=phoneticSim(db[i].k,db[j].k);
      // שלב ב: cosine אם יש index
      const cos=docs[i]&&docs[j]?cosineSim(docs[i],docs[j]):0;
      const sim=(ps*0.6+cos*0.4);
      if(sim>=0.65)p.push({a:db[i].k,b:db[j].k,sim:Math.round(sim*100)});
    }
  }
  _dupCache=p;_dupCacheLen=db.length;
  return p;
}

/* ════════════════
   SEARCH v2 — TF-IDF cosine + phonetic + exact boost
════════════════ */

/* ══ FAMILY ══ */
function saveFamilies(){save(LS.FAM,families);}
function updateFamilyList(keepVal){
  const sel=document.getElementById('catSelect'),prev=keepVal||sel.value;
  families=[...new Set([...families,...db.map(x=>x.c).filter(Boolean)])].sort();
  saveFamilies();
  sel.innerHTML=families.map(f=>`<option value="${esc(f)}">${esc(f)}</option>`).join('');
  if(prev&&families.includes(prev))sel.value=prev;
  const ff=document.getElementById('dbFamFilter');
  if(ff)ff.innerHTML=`<option value="">כל המשפחות</option>`+families.map(f=>`<option value="${esc(f)}">${esc(f)}</option>`).join('');
  renderFamFilterChips();
}
document.getElementById('addFamilyBtn').addEventListener('click',()=>{
  const inp=document.getElementById('newFamilyInput'),btn=document.getElementById('addFamilyBtn');
  if(btn.textContent.trim()==='+ חדשה'){inp.style.display='block';inp.focus();btn.textContent='✔ שמור';}
  else{const n=inp.value.trim();if(!n){toast('הכנס שם משפחה','');return;}if(families.includes(n)){toast('קיים','');return;}families.push(n);saveFamilies();updateFamilyList(n);document.getElementById('catSelect').value=n;inp.value='';inp.style.display='none';btn.textContent='+ חדשה';toast(`"${n}" נוספה ✅`,'');}
});
document.getElementById('newFamilyInput').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('addFamilyBtn').click();if(e.key==='Escape'){e.target.value='';e.target.style.display='none';document.getElementById('addFamilyBtn').textContent='+ חדשה';}});
document.getElementById('delFamilyBtn').addEventListener('click',()=>{const n=document.getElementById('catSelect').value;if(db.some(x=>x.c===n)){toast(`"${n}" בשימוש`,'');return;}if(!confirm(`למחוק "${n}"?`))return;families=families.filter(f=>f!==n);saveFamilies();updateFamilyList();toast('נמחקה','');});

/* ══ FAMILY FILTER CHIPS ══ */
function renderFamFilterChips(){
  const el=document.getElementById('famFilterChips');if(!el)return;
  if(families.length>10){
    el.innerHTML=`<select id="famDropdown" style="width:100%;padding:6px 9px;border-radius:7px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:.88em;margin-bottom:8px;">
      <option value="">🔽 כל המשפחות</option>
      ${families.map(f=>`<option value="${esc(f)}" ${famSearchFilter===f?'selected':''}>${esc(f)}</option>`).join('')}
    </select>`;
    el.querySelector('#famDropdown').addEventListener('change',e=>{famSearchFilter=e.target.value||null;clearTimeout(searchDebounce);searchDebounce=setTimeout(solve,50);});
  } else {
    el.innerHTML=`<span class="fam-chip${!famSearchFilter?' active':''}" data-fam="">הכל</span>`+families.map(f=>`<span class="fam-chip${famSearchFilter===f?' active':''}" data-fam="${esc(f)}">${esc(f)}</span>`).join('');
    el.querySelectorAll('.fam-chip').forEach(c=>c.addEventListener('click',()=>{famSearchFilter=c.dataset.fam||null;renderFamFilterChips();clearTimeout(searchDebounce);searchDebounce=setTimeout(solve,50);}));
  }
}

/* ══ CUSTOM FIELDS ══ */
function renderCF(){
  const ct=document.getElementById('customFieldsList');ct.innerHTML='';
  customFields.forEach((f,i)=>{const r=document.createElement('div');r.className='cf-row';r.innerHTML=`<input type="text" placeholder="שם שדה" value="${esc(f.label)}" data-i="${i}" data-r="label"><input type="text" placeholder="ערך" value="${esc(f.value)}" data-i="${i}" data-r="value"><button class="btn-rm-field" data-i="${i}">✖</button>`;ct.appendChild(r);});
  ct.querySelectorAll('input').forEach(inp=>inp.addEventListener('input',e=>customFields[+e.target.dataset.i][e.target.dataset.r]=e.target.value));
  ct.querySelectorAll('.btn-rm-field').forEach(b=>b.addEventListener('click',e=>{customFields.splice(+e.currentTarget.dataset.i,1);renderCF();}));
}
document.getElementById('addCustomFieldBtn').addEventListener('click',()=>{customFields.push({label:'',value:''});renderCF();const ins=document.querySelectorAll('#customFieldsList input[data-r="label"]');if(ins.length)ins[ins.length-1].focus();});

/* ══ IMAGE ══ */
document.getElementById('itemImg').addEventListener('change',function(){if(this.files&&this.files[0])resizeImage(this.files[0],b=>{currentBase64=b;const p=document.getElementById('setupPreview');p.src=b;p.style.display=b?'block':'none';});});

/* ══ SAVE ITEM ══ */
document.getElementById('saveBtn').addEventListener('click',()=>{
  const k=document.getElementById('key').value.trim();
  if(!k){toast('נא להזין מק"ט','');return;}
    const parsedRules=[];
  const item={k,v:document.getElementById('val').value.trim(),c:document.getElementById('catSelect').value,img:currentBase64,minStock:parseInt(document.getElementById('minStockInput')?.value)||0,location:(document.getElementById('warehouseLocation')?.value||'').trim(),rules:[],
    req:document.getElementById('reqInput').value.split(',').map(s=>s.trim()).filter(Boolean),
    tool:document.getElementById('toolInput').value.trim(),
    acc:document.getElementById('accInput').value.split(',').map(s=>s.trim()).filter(Boolean),
    custom:customFields.filter(f=>f.label).map(f=>({label:f.label.trim(),value:f.value.trim()}))};
  const idx=db.findIndex(x=>x.k.toLowerCase()===k.toLowerCase());
  if(idx>-1)db[idx]=item;else db.push(item);
  save(LS.DB,db);invalidateDupCache();buildTFIDF();toast('נשמר ✅','');
  currentBase64='';customFields=[];
  document.getElementById('setupPreview').style.display='none';
  document.getElementById('itemImg').value='';
  renderCF();updateFamilyList(item.c);renderDBTable();
});

/* ══ BULK CSV ══ */
function parseBulkCSV(text){
  const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);let imported=0,skipped=0;
  lines.forEach((line,li)=>{const sep=line.includes(';')?';':',';const parts=line.split(sep).map(p=>p.replace(/^["']|["']$/g,'').trim());if(li===0&&parts[0].toLowerCase()==='partnumber')return;if(!parts[0]){skipped++;return;}const k=parts[0],v=parts[1]||'',c=parts[2]||'General',custom=[];for(let i=3;i<parts.length-1;i+=2)if(parts[i])custom.push({label:parts[i],value:parts[i+1]||''});const item={k,v,c,img:'',req:[],tool:'',acc:[],custom};const idx=db.findIndex(x=>x.k.toLowerCase()===k.toLowerCase());if(idx>-1)db[idx]=item;else db.push(item);imported++;});
  save(LS.DB,db);invalidateDupCache();buildTFIDF();updateFamilyList();return{imported,skipped};
}
function setupDrop(zoneId,fileId,cb){
  const z=document.getElementById(zoneId);
  z.addEventListener('click',()=>document.getElementById(fileId).click());
  z.addEventListener('dragover',e=>{e.preventDefault();z.style.borderColor='var(--primary)';});
  z.addEventListener('dragleave',()=>z.style.borderColor='');
  z.addEventListener('drop',e=>{e.preventDefault();z.style.borderColor='';const f=e.dataTransfer.files[0];if(f)cb(f);});
  document.getElementById(fileId).addEventListener('change',function(){if(this.files[0])cb(this.files[0]);this.value='';});
}
setupDrop('bulkDropZone','bulkCsvFile',file=>{
  if(file.name.match(/\.xlsx?$/i)){
    const r=new FileReader();r.onload=ev=>{try{
      const wb2=XLSX.read(ev.target.result,{type:'array'});
      const ws2=wb2.Sheets[wb2.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws2,{header:1,defval:''});
      let imported=0;
      rows.forEach((row,li)=>{if(li===0)return;const k=String(row[0]||'').trim();if(!k)return;const v=String(row[1]||'').trim(),c=String(row[2]||'General').trim(),custom=[];for(let i=3;i<row.length-1;i+=2)if(row[i])custom.push({label:String(row[i]).trim(),value:String(row[i+1]||'').trim()});const item={k,v,c,img:'',req:[],tool:'',acc:[],custom,minStock:0,location:''};const idx2=db.findIndex(x=>x.k.toLowerCase()===k.toLowerCase());if(idx2>-1)db[idx2]=item;else db.push(item);imported++;});
      save(LS.DB,db);invalidateDupCache();buildTFIDF();updateFamilyList();renderDBTable();
      const info=document.getElementById('importInfo');if(info){info.style.display='block';info.textContent='✅ יובאו מ-Excel '+imported;}
      toast('יובאו '+imported+' מ-Excel','');
    }catch(e){toast('שגיאת Excel','');}};r.readAsArrayBuffer(file);
  } else {
    const r=new FileReader();r.onload=ev=>{const{imported,skipped}=parseBulkCSV(ev.target.result);const info=document.getElementById('importInfo');if(info){info.style.display='block';info.textContent='✅ יובאו '+imported+(skipped?' ('+skipped+' דולגו)':'');}toast('יובאו '+imported,'');};r.readAsText(file);
  }
});

/* ════════════════
   SEARCH v2 — TF-IDF cosine + phonetic + exact boost
════════════════ */
function solve(){
  const q=document.getElementById('q').value.trim();
  const thr=parseInt(document.getElementById('precisionRange').value);
  const chat=document.getElementById('chat');
  if(!q){chat.innerHTML='';return;}
  ensureTFIDF();
  const ql=q.toLowerCase();
  const _semExpanded=typeof dazuraExpand==='function'?dazuraExpand(q):[];
  const qTokens=tokenize(q);

  // ── TF-IDF cosine scores ──
  const cosScores=queryTFIDF(q);

  const res=db.map((item,dbIdx)=>{
    const area=(item.k+' '+item.v+' '+item.c+' '+(item.location||'')+' '+(item.custom||[]).map(f=>f.label+' '+f.value).join(' ')).toLowerCase();
    let score=0;
    const reasons=[];

    // 1. Exact substring boost (highest priority)
    if(area.includes(ql)){score+=50;reasons.push('התאמה מדויקת');}

    // 2. TF-IDF cosine
    const cos=cosScores[dbIdx]?cosScores[dbIdx].cos:0;
    const cosPts=Math.round(cos*60);
    score+=cosPts;
    if(cos>0.15)reasons.push(`TF-IDF ${Math.round(cos*100)}%`);

    // 3. Phonetic match — part number AND description
    qTokens.forEach(qt=>{
      // Part number phonetic
      const ps=phoneticSim(qt,item.k);
      if(ps>=0.5){score+=Math.round(ps*22);if(!reasons.includes('צליל מק"ט'))reasons.push('צליל מק"ט');}

      // Description word phonetic — threshold 0.5 (catches grey/gray, colour/color etc.)
      tokenize(item.v).forEach(dt=>{
        if(dt.length<3)return;
        const ps2=phoneticSim(qt,dt);
        if(ps2>=0.5){
          score+=Math.round(ps2*18);
          if(!reasons.includes('צליל תיאור'))reasons.push('צליל תיאור');
        }
      });

      // Custom field phonetic
      (item.custom||[]).forEach(f=>{
        tokenize(f.value).forEach(fv=>{
          if(phoneticSim(qt,fv)>=0.7)score+=8;
        });
      });
    });

    // 4. Edit distance — part number AND description words
    qTokens.forEach(qt=>{
      // Part number — partial match + edit distance
      const _kl=item.k.toLowerCase();
      // Partial: query contained in part number (e.g. "dtm4" finds "DTM04-4P")
      if(qt.length>=3){
        if(_kl.includes(qt)){score+=Math.round(qt.length/_kl.length*40);if(!reasons.includes('חלקי'))reasons.push('חלקי');}
        // Also check each segment (split by dash/dot)
        else{
          const segs=_kl.split(/[-_.]/);
          segs.forEach(seg=>{
            if(!seg)return;
            // partial: query in segment
            if(seg.includes(qt)&&qt.length>=3){score+=Math.round(qt.length/seg.length*30);if(!reasons.includes('חלקי'))reasons.push('חלקי');}
            // edit distance against each segment (catches dtm4→dtm04)
            else if(Math.abs(qt.length-seg.length)<=2){
              const edSeg=editDist(qt,seg);
              if(edSeg<=1&&seg.length>2){score+=Math.round((1-edSeg/Math.max(qt.length,seg.length))*25);if(!reasons.includes('קרוב'))reasons.push('קרוב');}
            }
          });
        }
      }
      // Edit distance on full part number
      const mlk=Math.max(qt.length,_kl.length)||1;
      const edk=editDist(qt,_kl);
      if(edk<=2&&mlk>3)score+=Math.round((1-edk/mlk)*18);

      // Description words
      tokenize(item.v).forEach(dt=>{
        if(Math.abs(qt.length-dt.length)>3)return;
        const ml2=Math.max(qt.length,dt.length)||1;
        const ed2=editDist(qt,dt);
        if(ed2<=1&&ml2>3)score+=Math.round((1-ed2/ml2)*12);
        else if(ed2<=2&&ml2>4)score+=Math.round((1-ed2/ml2)*8);
      });
    });

    // 5. Semantic expansion score (from dazura_semantics.js)
    if(typeof dazuraScore==='function'){
      const semPts=dazuraScore(q,area);
      if(semPts>0){score+=Math.round(semPts*0.5);if(semPts>25&&!reasons.includes('🧠 סמנטי'))reasons.push('🧠 סמנטי');}
    }

    score=Math.min(score,100);
    if(score>thr)emitNeuralSignal(0,dbIdx,score,0);
    return{...item,score,_dbIdx:dbIdx,_reasons:reasons};
  }).filter(r=>r.score>thr);

  if(famSearchFilter)res=res.filter(r=>r.c===famSearchFilter);
  res.sort((a,b)=>b.score-a.score);
  res.slice(0,8).forEach((r,ri)=>emitNeuralSignal(r._dbIdx,ri,r.score,1));

  chat.innerHTML=res.map(r=>{
    const ct=(r.custom||[]).map(f=>`<span class="tag tag-custom">${esc(f.label)}:${esc(f.value)}</span>`).join('');
    const qty=stockMap[r.k.toLowerCase()];
    const sb=qty!==undefined?`<span class="stock-badge ${qty>0?'stock-ok':'stock-missing'}" style="margin-right:5px;">${qty}</span>`:'';
    const reasonsHtml=r._reasons&&r._reasons.length?`<div style="font-size:.75em;color:var(--text2);margin-top:3px;">🧠 ${r._reasons.slice(0,3).join(' · ')}</div>`:'';
    return `<div class="result-item"><span class="score-badge">${r.score}%</span><img src="${r.img||''}" class="img-preview" alt=""><div style="flex:1"><button class="btn btn-primary add-bom-btn" style="width:55px;float:left;padding:5px 6px;margin-left:2px;" data-k="${esc(r.k)}">הוסף</button><button class="btn btn-ghost param-btn" style="width:28px;float:left;padding:5px 4px;margin-left:2px;" data-k="${esc(r.k)}" title="הוסף עם פרמטרים">⚙️</button><b>${esc(r.k)}</b> ${sb}<span style="color:var(--text2);font-size:.85em;">[${esc(r.c)}]</span><br><span style="font-size:.88em;">${esc(r.v)}</span>${reasonsHtml}<div style="margin-top:6px;">${r.req.map(l=>`<span class="tag tag-req">${esc(l)}</span>`).join('')}${r.tool?`<span class="tag tag-tool">⚒ ${esc(r.tool)}</span>`:''}${r.acc.map(l=>`<span class="tag tag-acc" data-k="${esc(l)}">${esc(l)} +</span>`).join('')}${ct}</div></div></div>`;
  }).join('');
  chat.querySelectorAll('.add-bom-btn').forEach(b=>b.addEventListener('click',()=>addToBOM(b.dataset.k)));
  chat.querySelectorAll('.tag-acc').forEach(t=>t.addEventListener('click',()=>addToBOM(t.dataset.k)));
}
document.getElementById('precisionRange').addEventListener('input',()=>{clearTimeout(searchDebounce);searchDebounce=setTimeout(solve,100);});

/* ══ BOM ══ */
function addToBOM(k){
  const item=db.find(x=>x.k.toLowerCase()===k.toLowerCase())||{k,v:'חסר',img:'',req:[],tool:'',acc:[],custom:[],rules:[]};
  if(bom.some(x=>x.k===item.k)){toast('כבר ב-BOM','');return;}
  if(bom.some(x=>x.approvedAlt&&x.approvedAlt.toLowerCase()===k.toLowerCase())){toast('פריט זה הוגדר כחלופה מאושרת','');return;}

  // Build base children
  const children=[];
  item.req.forEach(rk=>{const c=db.find(x=>x.k.toLowerCase()===rk.toLowerCase());children.push({k:rk,v:c?c.v:'חסר',img:c?c.img:'',type:'REQ'});});
  // Add acc items — skip raw shrink prefixes (they'll be resolved by wire scan)
  const SHRINK_PREFIXES_SET=new Set(['rsfr','atum','rt','fp301','rsfr-h','rsf','mwtm','cbit']);
  (item.acc||[]).forEach(ak=>{
    const akl=ak.toLowerCase().replace(/[-\s]/g,'');
    const isShrinkPrefix=SHRINK_PREFIXES_SET.has(akl)||SHRINK_PREFIXES_SET.has(ak.toLowerCase());
    const existsInDB=db.some(x=>x.k.toLowerCase()===ak.toLowerCase());
    if(isShrinkPrefix&&!existsInDB){
      // Will be resolved by _autoResolveFromBOM — skip adding raw prefix now
      return;
    }
    const c=db.find(x=>x.k.toLowerCase()===ak.toLowerCase());
    children.push({k:ak,v:c?c.v:'נלווה',img:c?c.img:'',type:'ACC'});
  });
  if(item.tool){
    const tc=db.find(x=>x.k.toLowerCase()===item.tool.toLowerCase());
    const tQty=stockMap[item.tool.toLowerCase()];
    const tNote=(tQty===undefined||tQty===0)?'חסר — להזמין 1 יח\'':'';
    children.push({k:item.tool,v:tc?tc.v:'כלי',img:tc?tc.img:'',type:'TOOL',note:tNote});
  }

  // Auto-resolve: if item has acc shrink prefixes OR rules → check for wires
  let finalChildren=children;
  const SHRINK_PFX=new Set(['rsfr','atum','rt','fp301','rsf']);
  const hasAccPrefixes=(item.acc||[]).some(ak=>SHRINK_PFX.has(ak.toLowerCase().replace(/[-\s]/g,'')));
  const hasRules=item.rules&&item.rules.length>0;

  // Try auto-resolve, always push to BOM regardless
  if(hasAccPrefixes||hasRules){
    try{finalChildren=_autoResolveFromBOM(item,children);}
    catch(e){console.warn('[Dazura] autoResolve error:',e);finalChildren=children;}
  }
  bom.push({...item,children:finalChildren,note:'',qty:1,itemType:'REQ',approvedAlt:null,params:{}});
  save(LS.BOM,bom);renderBOM();resetApproval();
  const added=finalChildren.length-children.length;
  toast('נוסף: '+k+(added?' + '+added+' 🔗':''),'');

  // If this item IS a wire → re-scan existing BOM items for rules
  setTimeout(()=>{try{_rescanBOMAfterWireAdded(k);}catch(e){console.warn('[Dazura] rescan error:',e);}},300);
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
  const body=document.getElementById('bom-body');body.innerHTML='';

  bom.forEach((item,idx)=>{
    const qty=stockMap[item.k.toLowerCase()],has=qty!==undefined,inS=has&&qty>0;
    const alt=findBestAlt(item.k);

    // ── Status badge ──
    const stHtml=!has
      ?'<span style="color:var(--text2);font-size:.82em;">לא נבדק</span>'
      :inS?`<span class="stock-badge stock-ok">✅ ${qty}</span>`
          :`<span class="stock-badge stock-missing">⚠️ 0</span>`;

    // ── Alt cell ──
    let altCell='—';
    if(item.approvedAlt){
      altCell=`<div style="display:flex;align-items:center;gap:5px;">
        <span style="font-size:.72em;font-weight:bold;padding:2px 6px;border-radius:4px;background:var(--stock-ok-bg);color:var(--success);white-space:nowrap;">✅ חלופה מאושרת</span>
        <b style="color:var(--success);font-size:.85em;">${esc(item.approvedAlt)}</b>
        <button class="btn btn-ghost" data-rmalt="${idx}" style="padding:1px 5px;font-size:.75em;color:var(--danger);">✖</button>
      </div>`;
    } else if(alt&&alt.score>10){
      const aq=stockMap[alt.item.k.toLowerCase()];
      const ab=aq!==undefined?`<span class="stock-badge ${aq>0?'stock-ok':'stock-missing'}" style="font-size:.75em;">${aq}</span>`:'';
      altCell=`<div style="min-width:130px;">
        <div style="font-size:.78em;color:var(--alt);font-weight:bold;">💡 ${esc(alt.item.k)} ${ab} <span style="opacity:.7;">(${alt.score}%)</span></div>
        <div class="alt-row" style="margin:2px 0;"><div class="alt-bar"><div class="alt-fill" style="width:${alt.score}%"></div></div><span class="alt-pct">${alt.score}%</span></div>
        <button class="btn btn-ghost" data-approve="${idx}" data-altk="${esc(alt.item.k)}" style="margin-top:2px;padding:2px 7px;font-size:.75em;color:var(--success);border-color:var(--success);">✅ אשר</button>
      </div>`;
    }

    // ── Type badge (ראשי — static) ──
    const typeBadge='<span style="font-size:.8em;font-weight:bold;padding:3px 9px;border-radius:4px;background:var(--primary);color:#fff;white-space:nowrap;">ראשי</span>';

    // ── Stock alert for qty ──
    const bomQty=item.qty||1;
    let stockAlert='';
    if(has&&qty<bomQty)stockAlert=`<div style="font-size:.7em;color:var(--danger);font-weight:bold;margin-top:1px;">⚠️ חסר ${bomQty-qty}</div>`;

    // ── Note ──
    const noteHtml=`<div class="bom-note" data-ni="${idx}">${item.note?esc(item.note):'<span style="color:var(--border);font-size:.8em;">+ הוסף הערה</span>'}</div><input class="note-input" data-ni="${idx}" placeholder="הערה..." value="${esc(item.note||'')}">`;

    // ── Main row ──
    const tr=document.createElement('tr');
    if(has&&!inS)tr.className=alt&&alt.score>10?'bom-has-alt':'bom-missing';
    tr.innerHTML=`
      <td><img src="${item.img||''}" class="img-preview" style="width:34px;height:34px;" alt=""></td>
      <td><b>${esc(item.k)}</b></td>
      <td style="font-size:.88em;">${esc(item.v)}</td>
      <td style="min-width:90px;">${noteHtml}</td>
      <td style="text-align:center;">
        <input type="number" class="qty-input" data-qi="${idx}" value="${bomQty}" min="1" max="9999"
          style="width:52px;padding:3px 4px;text-align:center;border-radius:5px;border:1px solid var(--border);background:var(--hover);color:var(--text);font-weight:bold;font-size:.9em;">
        ${stockAlert}
      </td>
      <td>${has?qty:'—'}</td>
      <td>${stHtml}</td>
      <td>${typeBadge}</td>
      <td>${altCell}</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-ghost" data-idx="${idx}" style="padding:3px 7px;">✖</button>
        <button class="btn btn-ghost" data-up="${idx}" style="padding:3px 6px;font-size:.75em;display:none;">↑</button>
        <button class="btn btn-ghost" data-dn="${idx}" style="padding:3px 6px;font-size:.75em;display:none;">↓</button>
      </td>`;
    body.appendChild(tr);

    // Listeners
    const nd=tr.querySelector('.bom-note'),ni=tr.querySelector('.note-input');
    nd.addEventListener('click',()=>{nd.style.display='none';ni.style.display='block';ni.focus();});
    ni.addEventListener('blur',()=>{bom[idx].note=ni.value;save(LS.BOM,bom);nd.innerHTML=ni.value?esc(ni.value):'<span style="color:var(--border);font-size:.8em;">+ הוסף הערה</span>';ni.style.display='none';nd.style.display='block';});

    tr.querySelector('[data-idx]').addEventListener('click',()=>{bom.splice(idx,1);save(LS.BOM,bom);renderBOM();resetApproval();});

    const qi=tr.querySelector('.qty-input');
    qi.addEventListener('change',e=>{const v=Math.max(1,parseInt(e.target.value)||1);bom[+e.target.dataset.qi].qty=v;e.target.value=v;save(LS.BOM,bom);renderBOM();});

    const upBtn=tr.querySelector('[data-up]'),dnBtn=tr.querySelector('[data-dn]');
    if(upBtn)upBtn.addEventListener('click',()=>{if(idx>0){const t=bom[idx];bom[idx]=bom[idx-1];bom[idx-1]=t;save(LS.BOM,bom);renderBOM();}});
    if(dnBtn)dnBtn.addEventListener('click',()=>{if(idx<bom.length-1){const t=bom[idx];bom[idx]=bom[idx+1];bom[idx+1]=t;save(LS.BOM,bom);renderBOM();}});

    if(tr.querySelector('[data-approve]')){
      tr.querySelector('[data-approve]').addEventListener('click',e=>{
        bom[+e.currentTarget.dataset.approve].approvedAlt=e.currentTarget.dataset.altk;
        save(LS.BOM,bom);renderBOM();toast('חלופה אושרה ✅','');
      });
    }
    if(tr.querySelector('[data-rmalt]')){
      tr.querySelector('[data-rmalt]').addEventListener('click',e=>{
        bom[+e.currentTarget.dataset.rmalt].approvedAlt=null;
        save(LS.BOM,bom);renderBOM();
      });
    }

    // ── Approved alt row ──
    if(item.approvedAlt){
      const ai=db.find(x=>x.k.toLowerCase()===item.approvedAlt.toLowerCase())||{k:item.approvedAlt,v:'',img:''};
      const ar=document.createElement('tr');
      ar.style.cssText='background:var(--stock-ok-bg);border-right:4px solid var(--success);';
      ar.innerHTML=`
        <td><img src="${ai.img||''}" class="img-preview" style="width:28px;height:28px;border:2px solid var(--success);" alt=""></td>
        <td colspan="2"><span style="font-size:.7em;color:var(--success);font-weight:bold;display:block;">✅ חלופה מאושרת</span><b style="color:var(--success);font-size:.88em;">${esc(ai.k)}</b> <span style="font-size:.8em;color:var(--text2);">${esc(ai.v)}</span></td>
        <td></td><td></td><td></td>
        <td><span style="font-size:.75em;padding:2px 6px;border-radius:4px;background:var(--stock-ok-bg);color:var(--success);border:1px solid var(--success);">חלופה</span></td>
        <td></td><td></td><td></td>`;
      body.appendChild(ar);
    }

    // ── Children rows ──
    item.children.forEach(c=>{
      const freshC=db.find(x=>x.k.toLowerCase()===c.k.toLowerCase());
      const cs=stockMap[c.k.toLowerCase()],ci=cs!==undefined&&cs>0;
      const cTypeLabel=c.type==='TOOL'?'כלי':c.type==='REQ'?'נדרש':'נלווה';
      const cTypeBg=c.type==='TOOL'?'var(--tag-tool-bg)':c.type==='REQ'?'var(--tag-req-bg)':'var(--tag-acc-bg)';
      const cTypeFg=c.type==='TOOL'?'var(--tag-tool-c)':c.type==='REQ'?'var(--tag-req-c)':'var(--tag-acc-c)';
      // Dynamic stock note — recalculated every render from current stockMap
      const dynamicNote=c.type==='TOOL'?(cs===undefined||cs===0?'⚠️ חסר — להזמין 1 יח\'':''):
                        c.type==='REQ'?(cs===0?'⚠️ חסר':''):
                        (c.resolved&&c.note?c.note:c.note||'');
      const cSt=cs===undefined?'<span style="color:var(--text2);font-size:.82em;">לא נבדק</span>':ci?`<span class="stock-badge stock-ok">✅ ${cs}</span>`:'<span class="stock-badge stock-missing">⚠️ חסר</span>';
      const cr=document.createElement('tr');
      cr.className='child-row';
      const resolvedLabel=c.resolved?`<div style="font-size:.68em;color:var(--success);margin-top:1px;">🔗 ${esc(c.resolvedFrom||'מחושב')}</div>`:'';
      const noteCell=dynamicNote?`<span style="color:var(--danger);font-size:.82em;font-weight:bold;">${esc(dynamicNote)}</span>`:'';
      cr.innerHTML=`
        <td><img src="${freshC?freshC.img:c.img||''}" class="img-preview" style="width:26px;height:26px;" alt=""></td>
        <td style="padding-right:22px;color:${c.resolved?'var(--success)':'var(--primary)'};font-weight:600;font-size:.88em;">${esc(c.k)}${resolvedLabel}</td>
        <td style="font-size:.85em;">${esc(freshC?freshC.v:c.v)}</td>
        <td style="font-size:.82em;">${noteCell}</td><td></td>
        <td>${cs!==undefined?cs:'—'}</td>
        <td>${cSt}</td>
        <td><span style="font-size:.75em;font-weight:bold;padding:2px 6px;border-radius:4px;background:${cTypeBg};color:${cTypeFg};">${cTypeLabel}</span></td>
        <td></td><td></td>`;
      body.appendChild(cr);
    });
  });

  // ── Health bar ──
  const h=bomHealth();const hw=document.getElementById('bomHealthWrap');
  if(h&&hw){const col=h.pct>70?'var(--success)':h.pct>40?'var(--warning)':'var(--danger)';hw.style.display='block';hw.innerHTML=`<div style="display:flex;align-items:center;gap:7px;background:var(--hover);border-radius:7px;padding:5px 10px;font-size:.88em;border:1px solid var(--border);"><span style="color:var(--text);">בריאות:</span><div style="width:80px;height:7px;background:var(--border);border-radius:4px;overflow:hidden;"><div style="width:${h.pct}%;height:100%;background:${col};border-radius:4px;"></div></div><b style="color:${col}">${h.pct}%</b><span style="color:var(--text2);font-size:.85em;">${h.ok}/${h.total}</span></div>`;}
}


document.getElementById('clearBOMBtn').addEventListener('click',()=>{if(!bom.length){toast('BOM ריק','');return;}if(!confirm(`למחוק ${bom.length} פריטים?`))return;bom=[];save(LS.BOM,bom);renderBOM();resetApproval();toast('BOM נוקה','');});
document.getElementById('approveBOMBtn').addEventListener('click',()=>{isApproved=true;['exportBomCsvBtn','exportBomXlsxBtn','exportStockReportBtn','exportMissingBtn','exportHTMLReportBtn'].forEach(id=>{const b=document.getElementById(id);b.className='btn btn-success';b.disabled=false;});document.getElementById('approvalBar').classList.add('is-approved');document.getElementById('approvalText').textContent='✅ מאושר';});
function resetApproval(){isApproved=false;['exportBomCsvBtn','exportBomXlsxBtn','exportStockReportBtn','exportMissingBtn','exportHTMLReportBtn'].forEach(id=>{const b=document.getElementById(id);b.className='btn btn-disabled';b.disabled=true;});document.getElementById('approvalBar').classList.remove('is-approved');document.getElementById('approvalText').textContent='⚠️ ממתין לבדיקה';}

/* ══ XLSX helper ══ */
function xlCell(v,fill,fontColor,bold){return{v,t:'s',s:{fill:{patternType:'solid',fgColor:{rgb:fill||'FFFFFFFF'}},font:{bold:!!bold,color:{rgb:fontColor||'FF000000'}},alignment:{horizontal:'right'}}};}
function makeWs(rows){
  const ws={};let maxC=0;
  rows.forEach((row,r)=>{row.forEach((cell,c)=>{if(c>maxC)maxC=c;const ref=XLSX.utils.encode_cell({r,c});if(typeof cell==='string'||typeof cell==='number'){ws[ref]={v:cell,t:typeof cell==='number'?'n':'s'};}else if(cell&&typeof cell==='object'){ws[ref]=cell;}});});
  ws['!ref']=XLSX.utils.encode_range({s:{r:0,c:0},e:{r:rows.length-1,c:maxC}});
  return ws;
}

/* ══ EXPORT CSV ══ */
document.getElementById('exportBomCsvBtn').addEventListener('click',()=>{
  if(!isApproved)return;
  let csv='\uFEFFPart Number,Description,Note,Stock,Type\n';
  bom.forEach(i=>{csv+=`"${i.k}","${i.v}","${i.note||''}","${stockMap[i.k.toLowerCase()]??''}","ראשי"\n`;i.children.forEach(c=>csv+=`"  ↳ ${c.k}","${c.v}","","${stockMap[c.k.toLowerCase()]??''}","${c.type}"\n`);});
  dlBlob(csv,'BOM.csv','text/csv;charset=utf-8;');
});

/* ══ EXPORT XLSX ══ */
document.getElementById('exportBomXlsxBtn').addEventListener('click',()=>{
  if(window._xlsxFailed||typeof XLSX==='undefined'){toast('Excel לא זמין — פתח מדפדפן עם חיבור אינטרנט','');return;}
  if(!isApproved)return;
  const wb=XLSX.utils.book_new();
  function xc(v,bg,fg,bold){return{v:String(v||''),t:'s',s:{
    fill:{patternType:'solid',fgColor:{rgb:bg||'FFFFFFFF'}},
    font:{bold:!!bold,color:{rgb:fg||'FF1A1A1A'},name:'Calibri',sz:10},
    alignment:{horizontal:'right',vertical:'center'},
    border:{top:{style:'thin',color:{rgb:'FFD0D7DE'}},bottom:{style:'thin',color:{rgb:'FFD0D7DE'}},left:{style:'thin',color:{rgb:'FFD0D7DE'}},right:{style:'thin',color:{rgb:'FFD0D7DE'}}}
  }};}
  function hdr(v){return xc(v,'FF1A2A5E','FFFFFFFF',true);}
  const REQ={bg:'FFFCE8E6',fg:'FFC5221F'},ACC={bg:'FFE8F0FE',fg:'FF1558D6'},TOOL={bg:'FFE6F4EA',fg:'FF137333'};
  const ALT={bg:'FFF3E5F5',fg:'FF7B1FA2'},CHILD={bg:'FFF0F4FF',fg:'FF3D5170'};
  const OK={bg:'FFE6F4EA',fg:'FF137333'},MISS={bg:'FFFCE8E6',fg:'FFC5221F'},NONE={bg:'FFF8F9FA',fg:'FF9AA0A6'};
  const hdrs=['מק"ט','תיאור','סוג','כמות','מלאי','סטטוס','הערה','חלופה מאושרת'];
  const rows=[hdrs.map(hdr)];
  const rowH=[{hpt:20}];
  bom.forEach(item=>{
    const qty=stockMap[item.k.toLowerCase()];
    const inS=qty!==undefined&&qty>0;
    const tp=item.itemType==='TOOL'?TOOL:item.itemType==='ACC'?ACC:REQ;
    const tl=item.itemType==='TOOL'?'🔧 כלי':item.itemType==='ACC'?'🔗 נלווה':'⚡ חובה';
    const stC=qty===undefined?NONE:inS?OK:MISS;
    const stL=qty===undefined?'לא נבדק':inS?'✅ '+qty:'⚠️ 0';
    rows.push([xc(item.k,tp.bg,tp.fg,true),xc(item.v,tp.bg,tp.fg,false),xc(tl,tp.bg,tp.fg,true),xc(item.qty||1,'FFFFFFFF','FF333333',true),xc(qty!=null?qty:'—',stC.bg,stC.fg,true),xc(stL,stC.bg,stC.fg,false),xc(item.note||'','FFFFFFFF','FF555555',false),xc(item.approvedAlt||'',item.approvedAlt?ALT.bg:'FFF8F9FA',item.approvedAlt?ALT.fg:'FFAAAAAA',!!item.approvedAlt)]);
    rowH.push({hpt:17});
    if(item.approvedAlt){const ai=db.find(x=>x.k.toLowerCase()===item.approvedAlt.toLowerCase())||{k:item.approvedAlt,v:''};const aq=stockMap[item.approvedAlt.toLowerCase()];const aS=aq!=null&&aq>0;rows.push([xc('✅ '+ai.k,ALT.bg,ALT.fg,true),xc(ai.v,ALT.bg,ALT.fg,false),xc('חלופה',ALT.bg,ALT.fg,true),xc('',ALT.bg,ALT.fg,false),xc(aq!=null?aq:'—',aS?OK.bg:MISS.bg,aS?OK.fg:MISS.fg,false),xc(aq==null?'לא נבדק':aS?'✅':'⚠️',aS?OK.bg:MISS.bg,aS?OK.fg:MISS.fg,false),xc('',ALT.bg,ALT.fg,false),xc('',ALT.bg,ALT.fg,false)]);rowH.push({hpt:15});}
    item.children.forEach(c=>{const cs=stockMap[c.k.toLowerCase()];const ci=cs!=null&&cs>0;const cT=c.type==='TOOL'?TOOL:ACC;const cSt=cs==null?NONE:ci?OK:MISS;rows.push([xc('  '+c.k,CHILD.bg,CHILD.fg,false),xc(c.v||'',CHILD.bg,CHILD.fg,false),xc(c.type==='TOOL'?'🔧 כלי':'🔗 נלווה',cT.bg,cT.fg,false),xc(1,'FFFFFFFF','',false),xc(cs!=null?cs:'—',cSt.bg,cSt.fg,false),xc(cs==null?'לא נבדק':ci?'✅ '+cs:'⚠️ חסר',cSt.bg,cSt.fg,false),xc('',CHILD.bg,CHILD.fg,false),xc('',CHILD.bg,CHILD.fg,false)]);rowH.push({hpt:14});});
  });
  const ws={};rows.forEach((row,r)=>row.forEach((cell,c)=>{ws[XLSX.utils.encode_cell({r,c})]=cell;}));
  ws['!ref']=XLSX.utils.encode_range({s:{r:0,c:0},e:{r:rows.length-1,c:7}});
  ws['!cols']=[{wch:26},{wch:32},{wch:10},{wch:6},{wch:8},{wch:12},{wch:20},{wch:22}];
  ws['!rows']=rowH;
  XLSX.utils.book_append_sheet(wb,ws,'BOM');
  XLSX.writeFile(wb,'BOM_Dazura.xlsx',{bookType:'xlsx',cellStyles:true});
  toast('Excel הורד ✅','');
});

/* ══ EXPORT STOCK REPORT ══ */
document.getElementById('exportStockReportBtn').addEventListener('click',()=>{
  if(!isApproved)return;
  const wb=XLSX.utils.book_new();
  const hFill='FF1A73E8',hFont='FFFFFFFF';
  const rows=[['Part Number','Required','Stock','Status','Best Alt','Alt Score','Alt Stock'].map(h=>xlCell(h,hFill,hFont,true))];
  const allParts=[...new Set(bom.flatMap(item=>[item.k,...item.children.map(c=>c.k)]))];
  allParts.forEach(k=>{
    const qty=stockMap[k.toLowerCase()];const alt=findBestAlt(k);const aq=alt?stockMap[alt.item.k.toLowerCase()]:undefined;
    const inS=qty!==undefined&&qty>0;const rFill=qty===undefined?'FFFFFFFF':inS?'FFE6F4EA':'FFFCE8E6';const rFont=qty===undefined?'FF202124':inS?'FF137333':'FFD93025';
    rows.push([xlCell(k,rFill,rFont,true),xlCell('כן',rFill,rFont,false),xlCell(qty!==undefined?String(qty):'—',rFill,rFont,true),xlCell(qty===undefined?'לא נבדק':inS?'תקין':'חסר',rFill,rFont,false),xlCell(alt?alt.item.k:'—','FFFDF5FF','FF7B1FA2',false),xlCell(alt?String(alt.score):'','FFFDF5FF','FF7B1FA2',false),xlCell(aq!==undefined?String(aq):'—','FFFDF5FF','FF7B1FA2',false)]);
  });
  const ws=makeWs(rows);
  ws['!cols']=[{wch:28},{wch:10},{wch:8},{wch:10},{wch:26},{wch:10},{wch:10}];
  XLSX.utils.book_append_sheet(wb,ws,'דוח מלאי');XLSX.writeFile(wb,'StockReport.xlsx');toast('דוח מלאי הורד ✅','');
});

function dlBlob(c,f,t){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([c],{type:t}));a.download=f;a.click();}

/* ══ DB TABLE ══ */
function updateMultiBar(){const bar=document.getElementById('multiBar'),cnt=document.getElementById('multiCount');if(selectedKeys.size>0){bar.classList.add('show');cnt.textContent=`${selectedKeys.size} נבחרו`;}else bar.classList.remove('show');}
document.getElementById('masterCheck').addEventListener('change',function(){const filter=document.getElementById('dbSearch').value.toLowerCase(),famF=document.getElementById('dbFamFilter').value;db.filter(i=>(i.k+i.v+i.c).toLowerCase().includes(filter)&&(!famF||i.c===famF)).forEach(i=>{if(this.checked)selectedKeys.add(i.k);else selectedKeys.delete(i.k);});renderDBTable();updateMultiBar();});
document.getElementById('clearSelBtn').addEventListener('click',()=>{selectedKeys.clear();renderDBTable();updateMultiBar();});
document.getElementById('selectAllBtn').addEventListener('click',()=>{db.forEach(i=>selectedKeys.add(i.k));renderDBTable();updateMultiBar();});
function deleteSelected(){if(!selectedKeys.size)return;if(!confirm(`למחוק ${selectedKeys.size} פריטים?`))return;db=db.filter(i=>!selectedKeys.has(i.k));save(LS.DB,db);invalidateDupCache();buildTFIDF();selectedKeys.clear();updateMultiBar();renderDBTable();toast('נמחקו','');}
document.getElementById('deleteSelBtn').addEventListener('click',deleteSelected);

function renderDBTable(){
  const filter=document.getElementById('dbSearch').value.toLowerCase(),famF=document.getElementById('dbFamFilter').value;
  const body=document.getElementById('db-table-body');body.innerHTML='';
  const dups=findDuplicates(),dupKeys=new Set(dups.flatMap(p=>[p.a,p.b]));
  const warn=document.getElementById('dupWarning');
  if(dups.length){warn.style.display='block';warn.innerHTML=`⚠️ ${dups.length} זוגות דומים: `+dups.map(p=>`<b>${esc(p.a)}</b>↔<b>${esc(p.b)}</b>(${p.sim}%)`).join(' | ');}else warn.style.display='none';
  db.filter(i=>(i.k+i.v+i.c).toLowerCase().includes(filter)&&(!famF||i.c===famF)).forEach(i=>{
    const isDup=dupKeys.has(i.k);
    const ct=(i.custom||[]).map(f=>`<span class="tag tag-custom">${esc(f.label)}:${esc(f.value)}</span>`).join('');
    const tr=document.createElement('tr');if(isDup)tr.className='dup-row';
    tr.innerHTML=`<td><input type="checkbox" ${selectedKeys.has(i.k)?'checked':''} data-k="${esc(i.k)}"></td><td><img src="${i.img}" class="img-preview" style="width:32px;height:32px;" alt=""></td><td><b>${isDup?`<span class="dup-badge">כפול?</span>`:''} ${esc(i.k)}</b></td><td>${esc(i.c)}</td><td style="max-width:160px;">${ct||'—'}</td><td style="white-space:nowrap;"><button class="btn btn-ghost" data-edit="${esc(i.k)}" style="padding:4px 8px;font-size:.82em;" title="ערוך">✏️ ערוך</button> <button class="btn btn-ghost" style="padding:4px 8px;font-size:.82em;color:var(--danger);" data-del="${esc(i.k)}" title="מחק">🗑</button></td>`;
    body.appendChild(tr);
    tr.querySelector('input[type=checkbox]').addEventListener('change',function(){if(this.checked)selectedKeys.add(this.dataset.k);else selectedKeys.delete(this.dataset.k);updateMultiBar();});
  });
  body.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>loadToEdit(b.dataset.edit)));
  body.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>deleteFromDB(b.dataset.del)));
}
document.getElementById('dbSearch').addEventListener('input',renderDBTable);
document.getElementById('dbFamFilter').addEventListener('change',renderDBTable);

function loadToEdit(k){
  const i=db.find(x=>x.k===k);if(!i)return;
  document.getElementById('key').value=i.k;document.getElementById('val').value=i.v;
  document.getElementById('reqInput').value=i.req.join(',');document.getElementById('toolInput').value=i.tool;document.getElementById('accInput').value=i.acc.join(',');if(document.getElementById('minStockInput'))document.getElementById('minStockInput').value=i.minStock||0;if(document.getElementById('warehouseLocation'))document.getElementById('warehouseLocation').value=i.location||'';
  currentBase64=i.img||'';const p=document.getElementById('setupPreview');p.src=currentBase64;p.style.display=currentBase64?'block':'none';
  customFields=(i.custom||[]).map(f=>({...f}));renderCF();updateFamilyList(i.c);document.getElementById('catSelect').value=i.c;
  switchTab('setup');
  switchTab('setup');
  window.scrollTo(0,0);
  setTimeout(()=>document.getElementById('key').focus(),200);
  toast('ערוך: '+k,'');
}

function deleteFromDB(k){if(!confirm('למחוק?'))return;db=db.filter(i=>i.k!==k);save(LS.DB,db);invalidateDupCache();buildTFIDF();renderDBTable();toast('נמחק','');}
document.getElementById('resetDBBtn').addEventListener('click',()=>{if(!db.length){toast('DB ריק','');return;}const count=db.length;if(!confirm(`למחוק ${count} נירונים?`))return;if(prompt('הקלד "אפס":')!=='אפס'){toast('בוטל','');return;}db=[];bom=[];save(LS.DB,db);save(LS.BOM,bom);invalidateDupCache();buildTFIDF();updateFamilyList();renderDBTable();toast(`${count} נמחקו`,'');});

/* ══ JSON import/export ══ */
document.getElementById('exportJsonBtn').addEventListener('click',()=>{
  const backup={version:'v3',date:new Date().toISOString(),db,bom,families,versions,stockRows,
    itemHistory:tryParse(ITEM_HISTORY_KEY,{}),neuronNotes:tryParse(NOTES_KEY,{}),
    bomTemplates:tryParse(TEMPLATES_KEY,[]),allBOMs:tryParse(MULTI_BOM_KEY,[]),
    theme:themeIdx,font:localStorage.getItem(LS.FONT)||'13'};
  dlBlob(JSON.stringify(backup,null,2),'Dazura_Backup_'+new Date().toLocaleDateString('he-IL').replace(/[/]/g,'-')+'.json','application/json');
  toast('גיבוי מלא הורד ✅','');
});
document.getElementById('importJsonTrigger').addEventListener('click',()=>document.getElementById('importFile').click());
document.getElementById('importFile').addEventListener('change',function(e){
  const r=new FileReader();
  r.onload=ev=>{
    try{
      const imp=JSON.parse(ev.target.result);
      if(imp&&imp.version==='v3'&&imp.db){db=imp.db||[];bom=imp.bom||[];families=imp.families||['Connectors','Wires','Tools'];versions=imp.versions||[];stockRows=imp.stockRows||[];buildStockMap();if(imp.itemHistory)localStorage.setItem(ITEM_HISTORY_KEY,JSON.stringify(imp.itemHistory));if(imp.theme!==undefined){themeIdx=imp.theme;applyTheme();}save(LS.DB,db);save(LS.BOM,bom);save(LS.FAM,families);save(LS.VERS,versions);save(LS.STOCK,stockRows);invalidateDupCache();buildTFIDF();updateFamilyList();renderBOM();renderDBTable();toast('✅ גיבוי שוחזר — '+db.length+' פריטים','');return;}
if(!Array.isArray(imp))throw 0;
      db=imp;
      save(LS.DB,db);
      invalidateDupCache();
      buildTFIDF();
      /* FIX: rebuild stockMap after import */
      stockMap={};stockRows.forEach(r=>stockMap[r.k.toLowerCase()]=r.qty);
      updateFamilyList();
      const info=document.getElementById('importInfo');info.style.display='block';info.textContent=`✅ יובאו ${db.length}`;
      toast(`יובאו ${db.length}`,'');
    }catch{toast('שגיאה','');}
  };
  r.readAsText(e.target.files[0]);this.value='';
});

/* ══ STOCK CSV ══ */
function parseStockCSV(text){const rows=[];text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).forEach((line,li)=>{const sep=line.includes(';')?';':',';const parts=line.split(sep).map(p=>p.replace(/^["']|["']$/g,'').trim());if(parts.length<2)return;if(li===0&&isNaN(Number(parts[1]))&&parts[1].toLowerCase()!=='0')return;const k=parts[0],qty=parseInt(parts[1])||0;if(k)rows.push({k,qty});});return rows;}
function loadStockCSV(file){const r=new FileReader();r.onload=ev=>{stockRows=parseStockCSV(ev.target.result);stockMap={};stockRows.forEach(r=>stockMap[r.k.toLowerCase()]=r.qty);save(LS.STOCK,stockRows);renderStockTable();renderBOM();const info=document.getElementById('stockImportInfo');info.style.display='block';info.textContent=`✅ ${stockRows.length} פריטים`;const dz=document.getElementById('stockDropZone');dz.classList.add('loaded');dz.textContent=`✅ ${file.name} (${stockRows.length})`;const csb=document.getElementById('clearStockBtn');if(csb)csb.style.display='block';toast(`${stockRows.length} מלאי`,'');};r.readAsText(file);}
setupDrop('stockDropZone','stockCsvFile',loadStockCSV);
['stockFilter','stockStatusFilter'].forEach(id=>document.getElementById(id).addEventListener('input',renderStockTable));

function renderStockTable(){
  const filter=(document.getElementById('stockFilter').value||'').toLowerCase();
  const stFilter=document.getElementById('stockStatusFilter').value;
  let ok=0,miss=0,unk=0;
  stockRows.forEach(r=>{const inDb=db.some(x=>x.k.toLowerCase()===r.k.toLowerCase());if(!inDb)unk++;else if(r.qty>0)ok++;else miss++;});
  document.getElementById('stockTotalItems').textContent=stockRows.length;
  document.getElementById('stockCountOk').textContent=`${ok} תקינים`;
  document.getElementById('stockCountMissing').textContent=`${miss} חסרים`;
  document.getElementById('stockCountUnknown').textContent=`${unk} לא ב-DB`;
  document.getElementById('stockOverviewCard').style.display='block';
  document.getElementById('stockTableCard').style.display='block';
  const body=document.getElementById('stockTableBody');body.innerHTML='';
  stockRows.filter(r=>{
    const inDb=db.some(x=>x.k.toLowerCase()===r.k.toLowerCase());
    if(filter&&!r.k.toLowerCase().includes(filter))return false;
    if(stFilter==='ok')return inDb&&r.qty>0;if(stFilter==='missing')return inDb&&r.qty===0;if(stFilter==='unknown')return!inDb;return true;
  }).forEach(r=>{
    const inDb=db.some(x=>x.k.toLowerCase()===r.k.toLowerCase()),inS=r.qty>0,alt=!inS?findBestAlt(r.k):null;
    let stHtml=inDb?(inS?`<span class="stock-badge stock-ok">✅ ${r.qty}</span>`:'<span class="stock-badge stock-missing">⚠️ 0</span>'):'<span class="stock-badge stock-unknown">לא ב-DB</span>';
    let altHtml='—';
    if(alt&&alt.score>10){const aq=stockMap[alt.item.k.toLowerCase()];altHtml=`<div style="font-weight:bold;color:var(--alt);font-size:.85em;">${esc(alt.item.k)}${aq!==undefined?` (${aq})`:''}</div><div class="alt-row" style="margin-top:2px;"><div class="alt-bar"><div class="alt-fill" style="width:${alt.score}%"></div></div><span class="alt-pct">${alt.score}%</span></div><div class="alt-reasons">${alt.reasons.join(' · ')}</div>`;}
    else if(!inS)altHtml='<span style="color:var(--text2);font-size:.82em;">אין חלופה</span>';
    const tr=document.createElement('tr');
    if(inDb&&!inS)tr.className=alt&&alt.score>10?'bom-has-alt':'bom-missing';
    tr.innerHTML=`<td><b>${esc(r.k)}</b>${inDb?'':' <span style="font-size:.78em;color:var(--text2);">(לא ב-DB)</span>'}</td><td>${r.qty}</td><td>${stHtml}</td><td>${altHtml}</td><td style="white-space:nowrap;">${alt&&alt.score>10?`<button class="btn btn-ghost" style="padding:2px 7px;font-size:.8em;" data-alt="${esc(alt.item.k)}">ל-BOM</button> `:''} ${inDb?`<button class="btn btn-ghost" style="padding:2px 7px;font-size:.8em;" data-add="${esc(r.k)}">ל-BOM</button>`:''}</td>`;
    body.appendChild(tr);
    tr.querySelectorAll('[data-alt]').forEach(b=>b.addEventListener('click',()=>addToBOM(b.dataset.alt)));
    tr.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>addToBOM(b.dataset.add)));
  });
}

/* ══ ATTR SEARCH ══ */
function populateAttrSuggestions(){
  const labels=new Set(),values=new Set();
  db.forEach(i=>(i.custom||[]).forEach(f=>{if(f.label)labels.add(f.label);if(f.value)values.add(f.value);}));
  document.getElementById('attrLabelList').innerHTML=[...labels].map(l=>`<option value="${esc(l)}">`).join('');
  document.getElementById('attrValueList').innerHTML=[...values].map(v=>`<option value="${esc(v)}">`).join('');
  const chips=document.getElementById('attrChips');
  chips.innerHTML='<span style="font-size:.82em;color:var(--text2);margin-left:5px;">שדות קיימים: </span>'+[...labels].map(l=>`<span class="attr-chip" data-lbl="${esc(l)}">${esc(l)}</span>`).join('');
  chips.querySelectorAll('.attr-chip').forEach(c=>c.addEventListener('click',()=>{document.getElementById('attrLabelInput').value=c.dataset.lbl;document.getElementById('attrValueInput').focus();}));
}
document.getElementById('attrSearchBtn').addEventListener('click',doAttrSearch);
['attrLabelInput','attrValueInput','attrFreeInput'].forEach(id=>document.getElementById(id).addEventListener('keydown',e=>{if(e.key==='Enter')doAttrSearch();}));
function doAttrSearch(){
  const lbl=document.getElementById('attrLabelInput').value.trim().toLowerCase();
  const val=document.getElementById('attrValueInput').value.trim().toLowerCase();
  const free=document.getElementById('attrFreeInput').value.trim().toLowerCase();
  if(!lbl&&!val&&!free){toast('הכנס לפחות מילה אחת','');return;}
  const out=document.getElementById('attrResults');
  const res=db.filter(i=>{
    if(free){const allText=(i.k+' '+i.v+' '+i.c+' '+(i.custom||[]).map(f=>f.label+' '+f.value).join(' ')).toLowerCase();if(!allText.includes(free))return false;}
    if(lbl||val){const customMatch=(i.custom||[]).some(f=>(!lbl||f.label.toLowerCase().includes(lbl))&&(!val||f.value.toLowerCase().includes(val)));if(!lbl&&val){const broadMatch=(i.k+' '+i.v).toLowerCase().includes(val);return customMatch||broadMatch;}return customMatch;}
    return true;
  });
  if(!res.length){out.innerHTML=`<div style="color:var(--text2);padding:18px;text-align:center;">לא נמצאו פריטים</div>`;return;}
  out.innerHTML=`<div style="margin-bottom:7px;font-size:.88em;color:var(--text2);">${res.length} פריטים נמצאו</div>
  <table><thead><tr><th>תמונה</th><th>מק"ט</th><th>משפחה</th><th>תיאור</th><th>מאפיינים תואמים</th><th></th></tr></thead>
  <tbody>${res.map(i=>{const allF=(i.custom||[]);const matchF=allF.filter(f=>(!lbl||f.label.toLowerCase().includes(lbl))&&(!val||f.value.toLowerCase().includes(val)));const showF=matchF.length?matchF:allF.slice(0,3);return`<tr><td><img src="${i.img}" style="width:30px;height:30px;border-radius:5px;object-fit:cover;" alt=""></td><td><b>${esc(i.k)}</b></td><td>${esc(i.c)}</td><td style="font-size:.85em;">${esc(i.v)}</td><td>${showF.map(f=>`<span class="tag tag-custom">${esc(f.label)}:${esc(f.value)}</span>`).join('')}</td><td><button class="btn btn-ghost" style="padding:3px 8px;font-size:.82em;" data-add="${esc(i.k)}">+ BOM</button></td></tr>`;}).join('')}</tbody></table>`;
  out.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>addToBOM(b.dataset.add)));
}

/* ══ VERSIONS ══ */
function renderVersions(){
  const el=document.getElementById('versionsList');
  if(!versions.length){el.innerHTML='<div style="color:var(--text2);padding:18px;text-align:center;">אין גרסאות עדיין</div>';clearVersionDiff();return;}
  el.innerHTML=versions.map((v,i)=>`<div class="ver-row"><div><b style="color:var(--text);">${esc(v.name)}</b><div class="ver-meta">${esc(v.date)} · ${v.items.length} פריטים</div></div><div style="display:flex;gap:5px;"><button class="btn btn-ghost" style="padding:4px 9px;font-size:.85em;" data-restore="${i}">↩ שחזר</button><button class="btn" style="padding:4px 9px;font-size:.85em;background:var(--tag-custom-bg);color:var(--alt);" data-diff="${i}">🔍 השווה</button><button class="btn btn-ghost" style="padding:4px 9px;font-size:.85em;color:var(--danger);" data-delver="${i}">✖</button></div></div>`).join('');
  el.querySelectorAll('[data-restore]').forEach(b=>b.addEventListener('click',()=>{if(!confirm('לשחזר?'))return;bom=JSON.parse(JSON.stringify(versions[+b.dataset.restore].items));save(LS.BOM,bom);resetApproval();toast('שוחזר ✅','');clearVersionDiff();}));
  el.querySelectorAll('[data-diff]').forEach(b=>b.addEventListener('click',()=>showDiff(+b.dataset.diff)));
  el.querySelectorAll('[data-delver]').forEach(b=>b.addEventListener('click',()=>{versions.splice(+b.dataset.delver,1);save(LS.VERS,versions);renderVersions();clearVersionDiff();}));
}
function clearVersionDiff(){const el=document.getElementById('versionDiff');el.style.display='none';el.innerHTML='';}
function showDiff(vi){
  const old=versions[vi].items,cur=bom;const oldKeys=new Set(old.map(x=>x.k)),curKeys=new Set(cur.map(x=>x.k));
  const added=[...curKeys].filter(k=>!oldKeys.has(k)),removed=[...oldKeys].filter(k=>!curKeys.has(k));
  const el=document.getElementById('versionDiff');el.style.display='block';
  el.innerHTML=`<div class="card" style="border:2px solid var(--alt);"><h4 style="margin:0 0 8px;color:var(--alt);">השוואה: "${esc(versions[vi].name)}" vs נוכחי</h4>${added.length?`<div style="color:var(--success);margin-bottom:4px;">✅ נוספו: ${added.map(k=>`<b>${esc(k)}</b>`).join(', ')}</div>`:''}${removed.length?`<div style="color:var(--danger);">❌ הוסרו: ${removed.map(k=>`<b>${esc(k)}</b>`).join(', ')}</div>`:''}${!added.length&&!removed.length?'<span style="color:var(--text2);">אין הבדלים</span>':''}</div>`;
}
document.getElementById('saveBOMVersionBtn').addEventListener('click',()=>{
  if(!bom.length){toast('BOM ריק','');return;}
  const name=prompt('שם גרסה:',`גרסה ${versions.length+1}`);if(!name)return;
  versions.unshift({name,date:new Date().toLocaleString('he-IL'),items:JSON.parse(JSON.stringify(bom))});
  if(versions.length>20)versions.pop();save(LS.VERS,versions);toast(`"${name}" נשמרה ✅`,'');
});

/* ══ DASHBOARD ══ */
function renderDashboard(){
  const dups=findDuplicates();
  document.getElementById('dashKpis').innerHTML=`
    <div class="dash-kpi"><div class="num">${db.length}</div><div class="lbl">נירונים ב-DB</div></div>
    <div class="dash-kpi"><div class="num">${bom.length}</div><div class="lbl">פריטים ב-BOM</div></div>
    <div class="dash-kpi"><div class="num">${stockRows.length}</div><div class="lbl">פריטי מלאי</div></div>
    <div class="dash-kpi"><div class="num" style="color:${dups.length>0?'var(--warning)':'var(--success)'}">${dups.length}</div><div class="lbl">זוגות כפולים</div></div>
    <div class="dash-kpi"><div class="num">${families.length}</div><div class="lbl">משפחות</div></div>
    <div class="dash-kpi"><div class="num">${versions.length}</div><div class="lbl">גרסאות BOM</div></div>`;
  const famCounts={};db.forEach(i=>famCounts[i.c]=(famCounts[i.c]||0)+1);
  const maxC=Math.max(...Object.values(famCounts),1);
  document.getElementById('dashFamChart').innerHTML=Object.entries(famCounts).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([f,c])=>`<div class="bar-row"><span class="bar-label" title="${esc(f)}">${esc(f)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(c/maxC*100)}%"></div></div><span class="bar-count">${c}</span></div>`).join('');
  const attrCounts={};db.forEach(i=>(i.custom||[]).forEach(f=>{if(f.label)attrCounts[f.label]=(attrCounts[f.label]||0)+1;}));
  const maxA=Math.max(...Object.values(attrCounts),1);
  const attrEl=document.getElementById('dashAttrChart');
  attrEl.innerHTML=Object.keys(attrCounts).length?Object.entries(attrCounts).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([f,c])=>`<div class="bar-row"><span class="bar-label">${esc(f)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(c/maxA*100)}%;background:var(--alt);"></div></div><span class="bar-count">${c}</span></div>`).join(''):'<span style="color:var(--text2);font-size:.85em;">לא הוגדרו מאפיינים עדיין</span>';
  if(stockRows.length){
    let ok=0,miss=0,unk=0;
    stockRows.forEach(r=>{const inDb=db.some(x=>x.k.toLowerCase()===r.k.toLowerCase());if(!inDb)unk++;else if(r.qty>0)ok++;else miss++;});
    const canvas=document.getElementById('dashStockCanvas');const ctx=canvas.getContext('2d');canvas.width=260;canvas.height=160;
    const total=ok+miss+unk||1;const slices=[{v:ok,c:'#34a853',l:'תקין'},{v:miss,c:'#d93025',l:'חסר'},{v:unk,c:'#888',l:'לא ב-DB'}];
    let angle=-Math.PI/2;const cx=130,cy=80,r=65;ctx.clearRect(0,0,260,160);
    slices.forEach(s=>{const a=2*Math.PI*s.v/total;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,angle,angle+a);ctx.closePath();ctx.fillStyle=s.c;ctx.fill();angle+=a;});
    const isDark=document.body.classList.contains('t-dark')||document.body.classList.contains('t-military')||document.body.classList.contains('t-purple')||document.body.classList.contains('t-red');
    ctx.fillStyle=isDark?'#fff':'#111';ctx.font='bold 15px Segoe UI';ctx.textAlign='center';ctx.fillText(`${Math.round(ok/total*100)}%`,cx,cy+6);
    document.getElementById('dashStockLegend').innerHTML=slices.map(s=>`<span style="display:inline-flex;align-items:center;gap:3px;margin-left:8px;color:var(--text);"><span style="width:9px;height:9px;border-radius:50%;background:${s.c};display:inline-block;"></span>${s.l}: ${s.v}</span>`).join('');
  }
  const dupEl=document.getElementById('dashDups');
  if(!dups.length){dupEl.innerHTML=`<span style="color:var(--success);">✅ לא נמצאו כפילויות</span>`;return;}
  dupEl.innerHTML=`<table><thead><tr><th>מק"ט 1</th><th>מק"ט 2</th><th>דמיון</th><th>פעולה</th></tr></thead><tbody>${dups.map(p=>`<tr class="dup-row"><td><b>${esc(p.a)}</b></td><td><b>${esc(p.b)}</b></td><td>${p.sim}%</td><td><button class="btn btn-ghost" style="padding:3px 8px;font-size:.82em;" data-e="${esc(p.a)}">ערוך</button></td></tr>`).join('')}</tbody></table>`;
  dupEl.querySelectorAll('[data-e]').forEach(b=>b.addEventListener('click',()=>loadToEdit(b.dataset.e)));
}

/* ══════════════════════════════════════════
   NEURAL NETWORK VISUALIZER
   Real signals = driven by altScore() comparisons from live search
   Architecture: Input → Hidden1 → [Hidden2] → Output
═══════════════════════════════════════════ */
let nnAnimTimer=null,nnAnimRunning=false,nnSignals=[];

// Queue of REAL signal events produced by solve() / altScore()
// Each entry: {fromItem, toItem, score, layer} → gets translated to canvas coords
let realSignalQueue=[];
const MAX_REAL_QUEUE=40;

// Called by solve() every time a real comparison is made
function emitNeuralSignal(fromIdx, toIdx, score, layer){
  if(!nnAnimRunning)return;
  realSignalQueue.push({fromIdx, toIdx, score, layer, t:0,
    speed: 0.018 + (score/100)*0.025,   // faster = higher score
    color: score>60?'#ffcc00': score>30?'#ff8800':'#44aaff'
  });
  if(realSignalQueue.length>MAX_REAL_QUEUE) realSignalQueue.shift();
}

function getNNColors(){
  const s=getComputedStyle(document.body);
  return{
    primary:s.getPropertyValue('--primary').trim()||'#1a73e8',
    success:s.getPropertyValue('--success').trim()||'#1e8e3e',
    warning:s.getPropertyValue('--warning').trim()||'#f29900',
    text:s.getPropertyValue('--text').trim()||'#0d1b3e',
    text2:s.getPropertyValue('--text2').trim()||'#3d5170',
    border:s.getPropertyValue('--border').trim()||'#c5d1e8',
    card:s.getPropertyValue('--card').trim()||'#ffffff',
  };
}

function drawNeuralNet(canvasId,layerSizes,animSignals,opts){
  opts=opts||{};
  const canvas=document.getElementById(canvasId);
  if(!canvas)return;
  const W=canvas.offsetWidth||canvas.width||700;
  canvas.width=W;
  const H=canvas.height||480;
  const ctx=canvas.getContext('2d');
  const col=getNNColors();
  ctx.clearRect(0,0,W,H);

  // Layer positions
  const numLayers=layerSizes.length;
  const layerX=[];
  const padX=W*0.1;
  for(let l=0;l<numLayers;l++){
    layerX.push(padX + l*(W-2*padX)/(numLayers-1));
  }

  // Node positions
  const nodePos=[];
  const nodeR=opts.nodeR||16;
  for(let l=0;l<numLayers;l++){
    const n=layerSizes[l];
    const totalH=(n-1)*(Math.max(32,Math.min(54,(H-80)/Math.max(n,1))));
    const startY=(H-totalH)/2;
    const gap=n>1?totalH/(n-1):0;
    const col2=[];
    for(let i=0;i<n;i++){
      col2.push({x:layerX[l],y:n===1?H/2:startY+i*gap});
    }
    nodePos.push(col2);
  }

  // Draw connections
  for(let l=0;l<numLayers-1;l++){
    for(let i=0;i<nodePos[l].length;i++){
      for(let j=0;j<nodePos[l+1].length;j++){
        ctx.beginPath();
        ctx.moveTo(nodePos[l][i].x,nodePos[l][i].y);
        ctx.lineTo(nodePos[l+1][j].x,nodePos[l+1][j].y);
        ctx.strokeStyle='rgba(100,160,255,0.22)';
        ctx.lineWidth=1;
        ctx.stroke();
      }
    }
  }

  // Draw animated signals
  if(animSignals&&animSignals.length){
    animSignals.forEach(sig=>{
      if(sig.l>=numLayers-1)return;
      const fromLayer=nodePos[sig.l];
      const toLayer=nodePos[sig.l+1];
      if(!fromLayer||!toLayer)return;
      const from=fromLayer[sig.i%fromLayer.length];
      const to=toLayer[sig.j%toLayer.length];
      if(!from||!to)return;
      const t=sig.t;
      const sx=from.x+(to.x-from.x)*t;
      const sy=from.y+(to.y-from.y)*t;
      const dotR=sig.real?Math.max(4,8*(sig.score/100)):5;
      const sigColor=sig.color||(sig.real?'rgba(255,200,0,0.98)':'rgba(255,220,60,0.98)');
      const grd=ctx.createRadialGradient(sx,sy,0,sx,sy,dotR+3);
      grd.addColorStop(0,sigColor);
      grd.addColorStop(0.5,sigColor.replace('0.98','0.5').replace('0.6','0.3'));
      grd.addColorStop(1,'rgba(255,80,0,0)');
      ctx.beginPath();ctx.arc(sx,sy,dotR+3,0,Math.PI*2);ctx.fillStyle=grd;ctx.fill();
      // Real signals also draw the active connection line brighter
      if(sig.real&&sig.score>20){
        ctx.beginPath();
        ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);
        ctx.strokeStyle=`rgba(255,180,0,${0.08+sig.score/300})`;
        ctx.lineWidth=1.5;ctx.stroke();
      }
    });
  }

  // Node colors per layer type
  const layerTypes=layerSizes.map((_,l)=>l===0?'input':l===numLayers-1?'output':'hidden');

  // Draw nodes
  for(let l=0;l<numLayers;l++){
    for(let i=0;i<nodePos[l].length;i++){
      const {x,y}=nodePos[l][i];
      const type=layerTypes[l];
      let fillColor,strokeColor,labelColor;
      if(type==='input'){fillColor='#f5d020';strokeColor='#e02020';labelColor=col.text;}
      else if(type==='output'){fillColor='#b6f5b0';strokeColor='#e02020';labelColor='#1a7a00';}
      else{fillColor='#a8d8f8';strokeColor='#e02020';labelColor=col.text;}

      ctx.save();
      ctx.shadowColor='rgba(0,0,0,0.18)';ctx.shadowBlur=6;ctx.shadowOffsetY=2;
      ctx.beginPath();
      ctx.ellipse(x,y,nodeR,nodeR*0.72,0,0,Math.PI*2);
      ctx.fillStyle=fillColor;ctx.fill();
      ctx.strokeStyle=strokeColor;ctx.lineWidth=2.5;ctx.stroke();
      ctx.restore();

      ctx.fillStyle=labelColor;
      ctx.font=`bold ${Math.max(9,nodeR*0.55)}px Segoe UI`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      if(type==='input')ctx.fillText(`I${i+1}`,x,y);
      else if(type==='output')ctx.fillText(`O${i+1}`,x,y);
      else ctx.fillText(`${i+1}`,x,y);
    }
  }

  // Layer labels
  const labelNames=layerSizes.map((_,l)=>{
    if(l===0)return'Input';if(l===numLayers-1)return'Output';return`Hidden ${l}`;
  });
  for(let l=0;l<numLayers;l++){
    const topY=Math.min(...nodePos[l].map(n=>n.y));
    ctx.fillStyle=l===0?'#e65c00':l===numLayers-1?'#137333':'#7b1fa2';
    ctx.font=`bold ${Math.max(11,nodeR*0.7)}px Segoe UI`;
    ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillText(labelNames[l],layerX[l],topY-14);
  }

  const infoEl=document.getElementById(canvasId==='neuralCanvas'?'neuralInfo':'neuralDbInfo');
  if(infoEl){
    const total=layerSizes.reduce((a,b)=>a+b,0);
    const conns=layerSizes.slice(0,-1).reduce((s,n,i)=>s+n*layerSizes[i+1],0);
    const live=nnAnimRunning&&realSignalQueue.length?` · ${realSignalQueue.length} אותות חיים`:'';
    infoEl.textContent=`${numLayers} שכבות · ${total} נוירונים · ${conns} חיבורים${live}`;
  }
}

/* NN Controls */
function getLayerSizes(){
  const ni=Math.max(1,Math.min(10,parseInt(document.getElementById('nnInputs').value)||4));
  const h1=Math.max(1,Math.min(20,parseInt(document.getElementById('nnH1').value)||10));
  const h2=Math.max(0,Math.min(20,parseInt(document.getElementById('nnH2').value)||0));
  const no=Math.max(1,Math.min(10,parseInt(document.getElementById('nnOutputs').value)||2));
  const layers=[ni,h1];
  if(h2>0)layers.push(h2);
  layers.push(no);
  return layers;
}

document.getElementById('nnDrawBtn').addEventListener('click',()=>{
  stopNNAnim();nnSignals=[];realSignalQueue=[];
  drawNeuralNet('neuralCanvas',getLayerSizes(),[]);
});

document.getElementById('nnAnimBtn').addEventListener('click',()=>{
  if(nnAnimRunning){stopNNAnim();document.getElementById('nnAnimBtn').textContent='▶ הפעל';}
  else{startNNAnim();document.getElementById('nnAnimBtn').textContent='⏹ עצור';}
});

function stopNNAnim(){nnAnimRunning=false;if(nnAnimTimer){clearInterval(nnAnimTimer);nnAnimTimer=null;}}

function startNNAnim(){
  nnAnimRunning=true;
  const layers=getLayerSizes();
  nnSignals=[];realSignalQueue=[];

  nnAnimTimer=setInterval(()=>{
    // 1. Advance existing signals
    nnSignals.forEach(s=>{s.t+=s.speed;});
    nnSignals=nnSignals.filter(s=>s.t<1);

    // 2. Inject real signals from queue (produced by actual altScore calls)
    while(realSignalQueue.length>0&&nnSignals.length<20){
      const rs=realSignalQueue.shift();
      // Map real item indices to node positions:
      // layer 0 = input nodes (query item position in DB, mod layerSize)
      // layer 1 = hidden (candidate index mod hidden size)
      // last layer = output (family index mod output size)
      const l0=Math.min(rs.layer, layers.length-2);
      const ni=rs.fromIdx%layers[l0];
      const nj=rs.toIdx%layers[l0+1];
      nnSignals.push({l:l0,i:ni,j:nj,t:0,speed:rs.speed,real:true,score:rs.score,color:rs.color});
    }

    // 3. If queue empty and few signals, add subtle idle signals so canvas isn't blank
    if(nnSignals.length<3){
      const l=Math.floor(Math.random()*(layers.length-1));
      const i=Math.floor(Math.random()*layers[l]);
      const j=Math.floor(Math.random()*layers[l+1]);
      nnSignals.push({l,i,j,t:0,speed:0.012,real:false,color:'rgba(100,160,255,0.4)'});
    }

    drawNeuralNet('neuralCanvas',layers,nnSignals);
  },30);
}

/* NN from DB */
document.getElementById('nnDbDrawBtn').addEventListener('click',()=>{
  if(!db.length){toast('DB ריק','');return;}
  const famMap={};
  db.forEach(item=>{const f=item.c||'General';if(!famMap[f])famMap[f]=[];famMap[f].push(item);});
  const famNames=Object.keys(famMap);
  const inputCount=Math.min(db.length,12);
  const hiddenLayers=famNames.map(f=>Math.min(famMap[f].length,12));
  const layerSizes=[inputCount,...hiddenLayers,famNames.length];
  const cappedSizes=layerSizes.map(n=>Math.min(n,12));
  drawNeuralNet('neuralDbCanvas',cappedSizes,[],{nodeR:14});
  const infoEl=document.getElementById('neuralDbInfo');
  if(infoEl)infoEl.textContent=`${db.length} פריטים · ${famNames.length} משפחות: ${famNames.slice(0,5).join(', ')}${famNames.length>5?'...':''}`;
  toast('רשת DB צוירה ✅','');
});

// Initial draw on tab open
function initNeuralViz(){
  drawNeuralNet('neuralCanvas',getLayerSizes(),[]);
}

/* ══ TAB SWITCH ══ */
function switchTab(t){
  document.querySelectorAll('.tab-btn').forEach(e=>e.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(e=>e.classList.remove('active'));
  document.querySelector(`.tab-btn[data-tab="${t}"]`).classList.add('active');
  document.getElementById(`${t}-tab`).classList.add('active');
  if(t==='db-manage')renderDBTable();
  if(t==='bom')renderBOM();
  if(t==='stock'&&stockRows.length)renderStockTable();
  if(t==='dashboard')renderDashboard();
  if(t==='versions')renderVersions();
  if(t==='attr-search')populateAttrSuggestions();
  if(t==='neural-viz'){setTimeout(initNeuralViz,50);}
  // Stop animation if leaving neural tab
  if(t!=='neural-viz'){stopNNAnim();document.getElementById('nnAnimBtn').textContent='▶ הפעל';}
}
document.querySelectorAll('.tab-btn').forEach(btn=>btn.addEventListener('click',()=>switchTab(btn.dataset.tab)));

/* ══ INIT ══ */
const savedStock=tryParse(LS.STOCK,[]);
if(savedStock.length){
  stockRows=savedStock;
  stockMap={};
  stockRows.forEach(r=>stockMap[r.k.toLowerCase()]=r.qty);
  const dz=document.getElementById('stockDropZone');
  dz.classList.add('loaded');
  dz.textContent=`✅ מלאי שמור – ${stockRows.length} פריטים`;
}
updateFamilyList();
renderCF();
// בנה index TF-IDF על נתונים קיימים
if(db.length){
  buildTFIDF();
  const badge=document.getElementById('engineBadge');
  if(badge)badge.textContent=`🧠 Engine v2 · TF-IDF · Cosine · Phonetic · ${db.length} פריטים indexed`;
}


/* ══ EXTRA KEYS ══ */
const ITEM_HISTORY_KEY='dazura_v45_item_history';
const NOTES_KEY='dazura_v45_notes';
const TEMPLATES_KEY='dazura_v45_bom_templates';
const MULTI_BOM_KEY='dazura_v45_multi_bom';
let itemHistory=tryParse(ITEM_HISTORY_KEY,{});
let neuronNotes=tryParse(NOTES_KEY,{});
let bomTemplates=tryParse(TEMPLATES_KEY,[]);
let allBOMs=tryParse(MULTI_BOM_KEY,[]);

/* ══ CLEAR STOCK ══ */
document.getElementById('clearStockBtn')?.addEventListener('click',()=>{
  if(!stockRows.length){toast('אין מלאי','');return;}
  if(!confirm('למחוק מלאי שמור?'))return;
  stockRows=[];stockMap={};localStorage.removeItem(LS.STOCK);
  const dz=document.getElementById('stockDropZone');
  if(dz){dz.classList.remove('loaded');dz.innerHTML='📂 גרור CSV או לחץ לבחירה<input type="file" id="stockCsvFile" accept=".csv,.txt" style="display:none;">';}
  document.getElementById('stockOverviewCard').style.display='none';
  document.getElementById('stockTableCard').style.display='none';
  document.getElementById('clearStockBtn').style.display='none';
  renderBOM();toast('מלאי נמחק ✅','');
});

/* ══ MISSING EXPORT BUTTON LISTENER ══ */
document.getElementById('exportMissingBtn')?.addEventListener('click',()=>{
  if(window._xlsxFailed||typeof XLSX==='undefined'){toast('Excel לא זמין — פתח מדפדפן עם חיבור אינטרנט','');return;}
  if(!isApproved)return;
  const wb=XLSX.utils.book_new();
  function xm(v,bg,fg,bold){return{v:String(v||''),t:'s',s:{fill:{patternType:'solid',fgColor:{rgb:bg}},font:{bold:!!bold,color:{rgb:fg},name:'Calibri',sz:10},alignment:{horizontal:'right',vertical:'center'}}};}
  const H='FF1A2A5E',HF='FFFFFFFF';
  const rows=[['מק"ט','תיאור','נדרש','במלאי','להזמין','ספק'].map(h=>xm(h,H,HF,true))];
  let hasRows=false;
  bom.forEach(item=>{
    const needed=item.qty||1,inStock=stockMap[item.k.toLowerCase()]??null;
    const toOrder=inStock===null?needed:Math.max(0,needed-inStock);
    if(toOrder<=0)return;hasRows=true;
    const supplier=(item.custom||[]).find(f=>f.label.match(/ספק|supplier/i))?.value||'';
    rows.push([xm(item.k,'FFFCE8E6','FFC5221F',true),xm(item.v,'FFFFFFFF','FF333333',false),xm(needed,'FFFFFFFF','FF333333',true),xm(inStock!==null?inStock:'?','FFFCE8E6','FFC5221F',false),xm(toOrder,'FFFCE8E6','FFC5221F',true),xm(supplier,'FFFFFFFF','FF1A73E8',false)]);
    item.children.forEach(c=>{const cs=stockMap[c.k.toLowerCase()]??null;const ct=cs===null?1:Math.max(0,1-cs);if(ct<=0)return;hasRows=true;rows.push([xm('  '+c.k,'FFFFF3CD','FF856404',false),xm(c.v||'','FFFFFFFF','FF555555',false),xm(1,'FFFFFFFF','',false),xm(cs!==null?cs:'?','FFFFF3CD','FF856404',false),xm(ct,'FFFFF3CD','FF856404',true),xm('','FFFFFFFF','',false)]);});
  });
  if(!hasRows){toast('אין פריטים חסרים 🎉','');return;}
  const ws={};rows.forEach((row,r)=>row.forEach((cell,c)=>{ws[XLSX.utils.encode_cell({r,c})]=cell;}));
  ws['!ref']=XLSX.utils.encode_range({s:{r:0,c:0},e:{r:rows.length-1,c:5}});
  ws['!cols']=[{wch:26},{wch:32},{wch:8},{wch:9},{wch:9},{wch:18}];
  XLSX.utils.book_append_sheet(wb,ws,'הזמנה');
  XLSX.writeFile(wb,'OrderList.xlsx',{bookType:'xlsx',cellStyles:true});
  toast('רשימת הזמנה הורדה ✅','');
});

/* ══ MULTI-BOM TABS ══ */
let activeBOMIdx=0;
function renderBOMTabs(){
  const bar=document.getElementById('bomTabsBar');if(!bar)return;
  const tabs=[{name:'ראשי',items:bom},...allBOMs];
  bar.innerHTML=tabs.map((b,i)=>`<div class="bom-tab-btn ${activeBOMIdx===i?'active':''}" data-bti="${i}" style="display:flex;align-items:center;gap:4px;">${esc(b.name)}<span style="font-size:.72em;opacity:.7;">(${b.items.length})</span>${i>0?`<button data-del-bom="${i}" style="background:none;border:none;color:inherit;cursor:pointer;font-size:.8em;">✕</button>`:''}</div>`).join('')+`<button id="addBOMTab" style="padding:5px 10px;border-radius:6px;border:1px dashed var(--primary);background:transparent;color:var(--primary);cursor:pointer;font-size:.8em;margin-right:4px;">+ חדש</button>`;
  bar.querySelectorAll('[data-bti]').forEach(btn=>{
    btn.addEventListener('click',e=>{if(e.target.dataset.delBom)return;const i=+btn.dataset.bti;activeBOMIdx=i;if(i>0)bom=allBOMs[i-1].items;renderBOMTabs();renderBOM();});
  });
  bar.querySelectorAll('[data-del-bom]').forEach(btn=>{
    btn.addEventListener('click',e=>{e.stopPropagation();const i=+btn.dataset.delBom-1;if(!confirm('למחוק?'))return;allBOMs.splice(i,1);save(MULTI_BOM_KEY,allBOMs);activeBOMIdx=0;bom=tryParse(LS.BOM,[]);renderBOMTabs();renderBOM();});
  });
  document.getElementById('addBOMTab')?.addEventListener('click',()=>{const name=prompt('שם BOM:','BOM '+(allBOMs.length+2));if(!name)return;save(LS.BOM,bom);allBOMs.push({name,items:[]});save(MULTI_BOM_KEY,allBOMs);activeBOMIdx=allBOMs.length;bom=[];renderBOMTabs();renderBOM();resetApproval();toast('BOM "'+name+'" נוצר','');});
}

/* ══ BOM TEMPLATE BUTTONS ══ */
document.getElementById('templateSaveBtn')?.addEventListener('click',()=>{
  if(!bom.length){toast('BOM ריק','');return;}
  const name=prompt('שם תבנית:','תבנית '+(bomTemplates.length+1));if(!name)return;
  bomTemplates.unshift({name,date:new Date().toLocaleString('he-IL'),items:JSON.parse(JSON.stringify(bom))});
  if(bomTemplates.length>20)bomTemplates.pop();save(TEMPLATES_KEY,bomTemplates);toast('תבנית נשמרה ✅','');
});

/* ══ DEP GRAPH ══ */
document.getElementById('depGraphBtn')?.addEventListener('click',()=>{
  const gc=document.getElementById('depGraphContainer');
  if(!gc){
    const bomCard=document.getElementById('clearBOMBtn')?.closest('.card');
    if(!bomCard)return;
    const div=document.createElement('div');div.id='depGraphContainer';div.style.cssText='margin-top:14px;';
    div.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><h4 style="margin:0;color:var(--text);">🔗 גרף תלויות</h4><button id="closeGraphBtn" class="btn btn-ghost" style="padding:4px 9px;font-size:.82em;">✕</button></div><canvas id="depGraph" style="width:100%;border-radius:9px;border:1px solid var(--border);"></canvas>';
    bomCard.appendChild(div);
    document.getElementById('closeGraphBtn')?.addEventListener('click',()=>div.remove());
  }
  renderDepGraph&&renderDepGraph();
});

/* ══ SEARCH: add q listener (if missing) ══ */
if(!document.getElementById('q')._hasListener){
  document.getElementById('q').addEventListener('input',()=>{clearTimeout(searchDebounce);searchDebounce=setTimeout(solve,80);});
  document.getElementById('q')._hasListener=true;
}
document.getElementById('precisionRange')?.addEventListener('input',()=>{clearTimeout(searchDebounce);searchDebounce=setTimeout(solve,80);});

/* ══ ITEM HISTORY tracking ══ */
const _origSaveBtnForHist=document.getElementById('saveBtn');
_origSaveBtnForHist?.addEventListener('click',()=>{
  setTimeout(()=>{
    const k=document.getElementById('key').value.trim();if(!k)return;
    const item=db.find(x=>x.k===k);if(!item)return;
    if(!itemHistory[k])itemHistory[k]=[];
    itemHistory[k].unshift({date:new Date().toLocaleString('he-IL'),v:item.v,c:item.c,minStock:item.minStock||0});
    if(itemHistory[k].length>10)itemHistory[k].pop();
    save(ITEM_HISTORY_KEY,itemHistory);
  },200);
},{capture:false});

/* ══ INIT ══ */
setTimeout(()=>{renderBOMTabs();},300);

/* ════════════════════════════════════════════════════════════════
   NEXT LEVEL FEATURES — Round 3
   F. Keyboard Shortcuts
   G. Auto-save indicator
   H. Family Statistics
   B. Print/HTML Report
   C. Smart Duplicate Merge
   D. Multi-notes per item
   E. BOM Templates
   A. Dependency Graph (Canvas)
   J. Formatted HTML Export
════════════════════════════════════════════════════════════════ */

/* ══ F: KEYBOARD SHORTCUTS ══ */
document.addEventListener('keydown', e => {
  // Ctrl/Cmd + F → focus search
  if((e.ctrlKey||e.metaKey) && e.key==='f'){
    e.preventDefault();
    switchTab('search');
    const q=document.getElementById('q');
    if(q){q.focus();q.select();}
    toast('🔍 חיפוש מהיר (Ctrl+F)','');
    return;
  }
  // Ctrl+S → save current item (if in setup tab)
  if((e.ctrlKey||e.metaKey) && e.key==='s'){
    e.preventDefault();
    const activeTab=document.querySelector('.tab-btn.active');
    if(activeTab?.dataset.tab==='setup'){
      document.getElementById('saveBtn').click();
    } else if(activeTab?.dataset.tab==='bom'){
      document.getElementById('saveBOMVersionBtn').click();
    }
    return;
  }
  // Escape → close popups
  if(e.key==='Escape'){
    closeNeuronCard();
    closeScanner();
    document.getElementById('scannerModal').style.display='none';
    return;
  }
  // Ctrl+B → go to BOM
  if((e.ctrlKey||e.metaKey) && e.key==='b'){
    e.preventDefault();switchTab('bom');return;
  }
  // Ctrl+D → go to Dashboard
  if((e.ctrlKey||e.metaKey) && e.key==='d'){
    e.preventDefault();switchTab('dashboard');return;
  }
  // Ctrl+N → new item (go to setup, clear form)
  if((e.ctrlKey||e.metaKey) && e.key==='n'){
    e.preventDefault();
    switchTab('setup');
    document.getElementById('key').value='';
    document.getElementById('val').value='';
    document.getElementById('key').focus();
    return;
  }
});

// Show shortcuts help button in nav
const navRight=document.querySelector('.nav-right');
if(navRight){
  const helpBtn=document.createElement('button');
  helpBtn.className='icon-btn';
  helpBtn.title='קיצורי מקלדת';
  helpBtn.textContent='⌨️';
  helpBtn.addEventListener('click',()=>{
    alert('קיצורי מקלדת:\n\nCtrl+F — חיפוש מהיר\nCtrl+S — שמור\nCtrl+B — BOM\nCtrl+D — דשבורד\nCtrl+N — נירון חדש\nEsc — סגור popup');
  });
  navRight.appendChild(helpBtn);
}

/* ══ G: AUTO-SAVE INDICATOR ══ */
const _origSave = save;
save = function(k, v) {
  _origSave(k, v);
  showSaveIndicator();
};

function showSaveIndicator(){
  let ind = document.getElementById('autoSaveInd');
  if(!ind){
    ind = document.createElement('span');
    ind.id = 'autoSaveInd';
    ind.style.cssText = 'font-size:.75em;padding:3px 8px;border-radius:10px;margin-right:5px;transition:all .3s;font-weight:bold;';
    const navRight = document.querySelector('.nav-right');
    if(navRight) navRight.insertBefore(ind, navRight.firstChild);
  }
  ind.textContent = '💾 שומר...';
  ind.style.background = 'var(--warning)';
  ind.style.color = '#000';
  clearTimeout(ind._t1);
  ind._t1 = setTimeout(()=>{
    ind.textContent = '✅ נשמר';
    ind.style.background = 'var(--success)';
    ind.style.color = '#fff';
    ind._t2 = setTimeout(()=>{
      ind.textContent = '';
      ind.style.background = 'transparent';
    }, 2000);
  }, 400);
}

/* ══ H: FAMILY STATISTICS PANEL ══ */
function renderFamilyStats(){
  const el = document.getElementById('dashFamChart');
  if(!el) return;

  const famData = {};
  db.forEach(item => {
    if(!famData[item.c]) famData[item.c] = {total:0, inStock:0, missing:0, noData:0, cost:0};
    famData[item.c].total++;
    const qty = stockMap[item.k.toLowerCase()];
    if(qty === undefined) famData[item.c].noData++;
    else if(qty > 0) famData[item.c].inStock++;
    else famData[item.c].missing++;
    const pf = (item.custom||[]).find(f=>f.label.match(/מחיר|price|cost/i));
    famData[item.c].cost += parseFloat(pf?.value||0);
  });

  const maxTotal = Math.max(...Object.values(famData).map(d=>d.total), 1);

  el.innerHTML = Object.entries(famData)
    .sort((a,b) => b[1].total - a[1].total)
    .slice(0, 12)
    .map(([fam, d]) => {
      const okPct  = Math.round(d.inStock/d.total*100);
      const missPct= Math.round(d.missing/d.total*100);
      const noDataPct=Math.round(d.noData/d.total*100);
      return `
      <div class="bar-row" style="flex-direction:column;align-items:stretch;gap:2px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="bar-label" style="width:auto;max-width:140px;" title="${esc(fam)}">${esc(fam)}</span>
          <span style="font-size:.75em;color:var(--text2);">${d.total} פריטים${d.cost>0?' · ₪'+Math.round(d.cost).toLocaleString():''}</span>
        </div>
        <div style="height:12px;border-radius:6px;overflow:hidden;display:flex;background:var(--hover);">
          <div style="width:${okPct}%;background:var(--success);transition:.4s;" title="תקין: ${d.inStock}"></div>
          <div style="width:${missPct}%;background:var(--danger);transition:.4s;" title="חסר: ${d.missing}"></div>
          <div style="width:${noDataPct}%;background:var(--text2);opacity:.3;transition:.4s;" title="לא נבדק: ${d.noData}"></div>
        </div>
        <div style="font-size:.7em;color:var(--text2);display:flex;gap:8px;">
          ${d.inStock?`<span style="color:var(--success);">✅ ${d.inStock}</span>`:''}
          ${d.missing?`<span style="color:var(--danger);">⚠️ ${d.missing}</span>`:''}
          ${d.noData?`<span>❓ ${d.noData}</span>`:''}
        </div>
      </div>`;
    }).join('');
}

// Hook into renderDashboard
const _origRenderDashboard2 = renderDashboard;
renderDashboard = function(){
  _origRenderDashboard2();
  renderFamilyStats();
};

/* ══ C: SMART DUPLICATE MERGE ══ */
function mergeDuplicates(keepKey, removeKey){
  const keepIdx = db.findIndex(x=>x.k===keepKey);
  const removeIdx = db.findIndex(x=>x.k===removeKey);
  if(keepIdx<0||removeIdx<0) return;

  const keep = db[keepIdx];
  const remove = db[removeIdx];

  // Merge custom fields (add missing ones)
  (remove.custom||[]).forEach(rf=>{
    if(!keep.custom.find(kf=>kf.label.toLowerCase()===rf.label.toLowerCase())){
      keep.custom.push({...rf});
    }
  });
  // Merge image if keep has none
  if(!keep.img && remove.img) keep.img = remove.img;
  // Merge req/acc
  remove.req.forEach(r=>{ if(!keep.req.includes(r)) keep.req.push(r); });
  remove.acc.forEach(a=>{ if(!keep.acc.includes(a)) keep.acc.push(a); });

  // Remove the duplicate
  db.splice(removeIdx, 1);

  // Update BOM references
  bom.forEach(item=>{
    if(item.k===removeKey) item.k=keepKey;
    item.children.forEach(c=>{ if(c.k===removeKey) c.k=keepKey; });
  });

  save(LS.DB, db); save(LS.BOM, bom);
  invalidateDupCache(); buildTFIDF();
  toast(`✅ מוזג: ${removeKey} → ${keepKey}`, '');
  renderDBTable(); renderDashboard();
}

// Add merge button to dashboard dup table
const _origRenderDashboard3 = renderDashboard;
renderDashboard = function(){
  _origRenderDashboard3();
  // Enhance dup table with merge button
  const dupEl = document.getElementById('dashDups');
  if(!dupEl) return;
  dupEl.querySelectorAll('[data-e]').forEach(editBtn=>{
    const row = editBtn.closest('tr');
    if(!row||row.querySelector('[data-merge]')) return;
    const dups = findDuplicates();
    const k = editBtn.dataset.e;
    const dup = dups.find(p=>p.a===k||p.b===k);
    if(!dup) return;
    const other = dup.a===k ? dup.b : dup.a;
    const mergeBtn = document.createElement('button');
    mergeBtn.className='btn btn-ghost';
    mergeBtn.style.cssText='padding:3px 8px;font-size:.78em;color:var(--alt);border-color:var(--alt);margin-right:4px;';
    mergeBtn.textContent='🔀 מזג';
    mergeBtn.dataset.merge='1';
    mergeBtn.title=`מזג ${other} לתוך ${k}`;
    mergeBtn.addEventListener('click',()=>{
      if(confirm(`למזג "${other}" לתוך "${k}"?\n\nהמק"ט "${other}" יימחק והמאפיינים שלו יועברו ל-"${k}".`)){
        mergeDuplicates(k, other);
      }
    });
    editBtn.parentNode.insertBefore(mergeBtn, editBtn);
  });
};

/* ══ D: MULTI-NOTES PER NEURON ══ */
/* NOTES_KEY already declared */ // {partNum: [{date, text, author}]}

function addNeuronNote(k, text){
  if(!text.trim()) return;
  if(!neuronNotes[k]) neuronNotes[k] = [];
  neuronNotes[k].unshift({
    date: new Date().toLocaleString('he-IL'),
    text: text.trim(),
    id: Date.now()
  });
  save(NOTES_KEY, neuronNotes);
}

function renderNeuronNotes(k){
  const notes = neuronNotes[k] || [];
  return `
    <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px;">
      <div style="font-size:.8em;font-weight:bold;color:var(--text2);margin-bottom:7px;">💬 הערות (${notes.length})</div>
      <div style="display:flex;gap:6px;margin-bottom:8px;">
        <input type="text" id="note-input-${esc(k)}" placeholder="הוסף הערה..." style="flex:1;margin-bottom:0;padding:6px 9px;font-size:.85em;">
        <button onclick="(function(){const v=document.getElementById('note-input-${esc(k)}').value;addNeuronNote('${esc(k)}',v);document.getElementById('note-input-${esc(k)}').value='';openNeuronCard('${esc(k)}');})()" style="padding:6px 12px;background:var(--primary);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:.85em;">+</button>
      </div>
      <div style="max-height:140px;overflow-y:auto;">
        ${notes.length ? notes.map(n=>`
          <div style="background:var(--hover);border-radius:7px;padding:7px 10px;margin-bottom:5px;border:1px solid var(--border);">
            <div style="font-size:.72em;color:var(--text2);margin-bottom:3px;">${n.date}</div>
            <div style="font-size:.85em;color:var(--text);">${esc(n.text)}</div>
            <button onclick="(function(){neuronNotes['${esc(k)}']=(neuronNotes['${esc(k)}']||[]).filter(x=>x.id!=${n.id});save('${NOTES_KEY}',neuronNotes);openNeuronCard('${esc(k)}');})()" style="font-size:.7em;background:none;border:none;color:var(--danger);cursor:pointer;margin-top:3px;">מחק</button>
          </div>`).join('') : '<span style="font-size:.82em;color:var(--text2);">אין הערות עדיין</span>'}
      </div>
    </div>`;
}

// Inject notes into neuron card
const _origOpenCard = openNeuronCard;
openNeuronCard = function(k){
  _origOpenCard(k);
  // Append notes section
  const inner = document.querySelector('.neuron-card-inner');
  if(!inner) return;
  let notesDiv = inner.querySelector('.nc-notes');
  if(!notesDiv){
    notesDiv = document.createElement('div');
    notesDiv.className = 'nc-notes';
    inner.appendChild(notesDiv);
  }
  notesDiv.innerHTML = renderNeuronNotes(k);
};

/* ══ E: BOM TEMPLATES ══ */
/* TEMPLATES_KEY already declared */

function saveBOMTemplate(){
  if(!bom.length){ toast('BOM ריק',''); return; }
  const name = prompt('שם תבנית:', `תבנית ${bomTemplates.length+1}`);
  if(!name) return;
  bomTemplates.unshift({
    name,
    date: new Date().toLocaleString('he-IL'),
    items: JSON.parse(JSON.stringify(bom))
  });
  if(bomTemplates.length > 20) bomTemplates.pop();
  save(TEMPLATES_KEY, bomTemplates);
  toast(`תבנית "${name}" נשמרה ✅`, '');
}

function loadBOMTemplate(idx){
  if(!confirm('טעינת תבנית תחליף את ה-BOM הנוכחי. להמשיך?')) return;
  bom = JSON.parse(JSON.stringify(bomTemplates[idx].items));
  save(LS.BOM, bom);
  renderBOM(); renderBOMTabs(); resetApproval();
  toast(`תבנית "${bomTemplates[idx].name}" נטענה ✅`, '');
}

// Add template buttons to BOM tab
const saveBOMVersionBtn = document.getElementById('saveBOMVersionBtn');
if(saveBOMVersionBtn){
  const templateSaveBtn = document.createElement('button');
  templateSaveBtn.className = 'btn btn-ghost';
  templateSaveBtn.style.cssText = 'padding:6px 11px;';
  templateSaveBtn.innerHTML = '📐 שמור תבנית';
  templateSaveBtn.addEventListener('click', saveBOMTemplate);
  saveBOMVersionBtn.parentNode.insertBefore(templateSaveBtn, saveBOMVersionBtn);

  const templateLoadBtn = document.createElement('button');
  templateLoadBtn.className = 'btn btn-ghost';
  templateLoadBtn.style.cssText = 'padding:6px 11px;';
  templateLoadBtn.innerHTML = '📂 טען תבנית';
  templateLoadBtn.addEventListener('click', ()=>{
    if(!bomTemplates.length){ toast('אין תבניות שמורות',''); return; }
    const list = bomTemplates.map((t,i)=>`${i+1}. ${t.name} (${t.items.length} פריטים) — ${t.date}`).join('\n');
    const idx = parseInt(prompt(`בחר תבנית:\n${list}\n\nהכנס מספר:`)) - 1;
    if(idx>=0 && idx<bomTemplates.length) loadBOMTemplate(idx);
  });
  saveBOMVersionBtn.parentNode.insertBefore(templateLoadBtn, saveBOMVersionBtn);
}

/* ══ A: DEPENDENCY GRAPH (Canvas) ══ */
// Add graph tab/button to BOM
function renderDependencyGraph(){
  const container = document.getElementById('depGraphContainer');
  if(!container) return;
  container.style.display = 'block';

  const canvas = document.getElementById('depGraph');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = container.offsetWidth || 700;
  const H = canvas.height = Math.max(400, bom.length * 80);

  // Build nodes & edges
  const nodes = {};
  const edges = [];
  const colors = {
    REQ: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#0066FF',
    TOOL: getComputedStyle(document.documentElement).getPropertyValue('--success').trim() || '#00A550',
    ACC: getComputedStyle(document.documentElement).getPropertyValue('--alt').trim() || '#7C3AED',
  };

  bom.forEach((item, i) => {
    nodes[item.k] = {
      x: W * 0.25,
      y: 60 + i * 90,
      label: item.k,
      type: 'main',
      color: colors.REQ
    };
    item.children.forEach((c, j) => {
      const key = c.k + '_' + i + '_' + j;
      nodes[key] = {
        x: W * 0.7,
        y: 60 + i * 90 + (j - (item.children.length-1)/2) * 40,
        label: c.k,
        type: c.type,
        color: c.type==='TOOL' ? colors.TOOL : colors.ACC
      };
      edges.push({from: item.k, to: key, type: c.type});
    });
    if(item.approvedAlt){
      const altKey = 'alt_' + item.k;
      nodes[altKey] = {
        x: W * 0.25,
        y: nodes[item.k].y + 35,
        label: '✅ ' + item.approvedAlt,
        type: 'alt',
        color: '#7B1FA2'
      };
      edges.push({from: item.k, to: altKey, type: 'alt', dashed: true});
    }
  });

  // Draw
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--card').trim() || '#fff';
  ctx.fillRect(0, 0, W, H);

  // Draw edges
  edges.forEach(e => {
    const from = nodes[e.from];
    const to = nodes[e.to];
    if(!from||!to) return;
    ctx.beginPath();
    ctx.moveTo(from.x + 50, from.y);
    // Bezier curve
    ctx.bezierCurveTo(from.x + 120, from.y, to.x - 80, to.y, to.x - 55, to.y);
    ctx.strokeStyle = e.type==='TOOL' ? colors.TOOL : e.type==='alt' ? '#7B1FA2' : colors.ACC;
    ctx.lineWidth = e.type==='alt' ? 1 : 2;
    if(e.dashed){ ctx.setLineDash([5,4]); } else { ctx.setLineDash([]); }
    ctx.globalAlpha = 0.7;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  });

  // Draw nodes
  Object.values(nodes).forEach(n => {
    const r = n.type==='main' ? 48 : 40;
    const h = 26;

    // Node box
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(n.x - r, n.y - h/2, r*2, h, 6);
    else ctx.rect(n.x - r, n.y - h/2, r*2, h);
    ctx.fillStyle = n.color + (n.type==='main'?'22':'15');
    ctx.fill();
    ctx.strokeStyle = n.color;
    ctx.lineWidth = n.type==='main' ? 2.5 : 1.5;
    ctx.stroke();

    // Label
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#000';
    ctx.font = `${n.type==='main'?'bold ':''} ${n.type==='main'?11:9}px Segoe UI`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const maxLen = r*2 - 8;
    let label = n.label;
    if(ctx.measureText(label).width > maxLen){
      while(ctx.measureText(label+'…').width > maxLen && label.length > 3) label = label.slice(0,-1);
      label += '…';
    }
    ctx.fillText(label, n.x, n.y);
  });

  // Legend
  ctx.font = '10px Segoe UI';
  ctx.textAlign = 'left';
  [[colors.REQ,'ראשי'],[colors.TOOL,'כלי'],[colors.ACC,'נלווה'],['#7B1FA2','חלופה']].forEach(([c,l],i)=>{
    ctx.fillStyle = c;
    ctx.fillRect(12, H-60+i*13, 10, 9);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text2').trim()||'#666';
    ctx.fillText(l, 26, H-55+i*13);
  });
}

// Add graph toggle button to BOM tab
const clearBOMBtn = document.getElementById('clearBOMBtn');
if(clearBOMBtn){
  // Add graph container to BOM tab
  const bomCard = clearBOMBtn.closest('.card');
  if(bomCard && !document.getElementById('depGraphContainer')){
    const graphContainer = document.createElement('div');
    graphContainer.id = 'depGraphContainer';
    graphContainer.style.cssText = 'display:none;margin-top:14px;';
    graphContainer.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <h4 style="margin:0;color:var(--text);">🔗 גרף תלויות</h4>
        <button id="closeGraphBtn" class="btn btn-ghost" style="padding:4px 10px;font-size:.82em;">סגור ✕</button>
      </div>
      <canvas id="depGraph" style="width:100%;border-radius:10px;border:1px solid var(--border);background:var(--card);"></canvas>`;
    bomCard.appendChild(graphContainer);
    document.getElementById('closeGraphBtn').addEventListener('click',()=>{
      document.getElementById('depGraphContainer').style.display='none';
    });
  }

  const graphBtn = document.createElement('button');
  graphBtn.className = 'btn btn-ghost';
  graphBtn.style.cssText = 'padding:6px 11px;';
  graphBtn.innerHTML = '🔗 גרף תלויות';
  graphBtn.addEventListener('click',()=>{
    renderDependencyGraph();
  });
  clearBOMBtn.parentNode.insertBefore(graphBtn, clearBOMBtn);
}

/* ══ J: EXPORT FORMATTED HTML REPORT ══ */
function exportHTMLReport(){
  if(!bom.length){ toast('BOM ריק',''); return; }
  const now = new Date().toLocaleString('he-IL');
  const okItems = bom.filter(i=>{ const q=stockMap[i.k.toLowerCase()]; return q!==undefined&&q>0; });
  const missingItems = bom.filter(i=>{ const q=stockMap[i.k.toLowerCase()]; return q!==undefined&&q===0; });
  const totalCost = calcBOMCost();

  const rows = bom.map(item=>{
    const qty = stockMap[item.k.toLowerCase()];
    const inS = qty!==undefined&&qty>0;
    const typeLabel = item.itemType==='TOOL'?'🔧 כלי':item.itemType==='ACC'?'🔗 נלווה':'⚡ חובה';
    const stColor = qty===undefined?'#888':inS?'#137333':'#c5221f';
    const stLabel = qty===undefined?'לא נבדק':inS?`✅ ${qty}`:`⚠️ 0`;
    return `<tr style="border-bottom:1px solid #eee;">
      <td style="padding:8px 12px;font-weight:bold;">${esc(item.k)}</td>
      <td style="padding:8px 12px;">${esc(item.v)}</td>
      <td style="padding:8px 12px;">${typeLabel}</td>
      <td style="padding:8px 12px;text-align:center;font-weight:bold;">${item.qty||1}</td>
      <td style="padding:8px 12px;color:${stColor};font-weight:bold;">${stLabel}</td>
      <td style="padding:8px 12px;color:#7B1FA2;">${item.approvedAlt?'✅ '+esc(item.approvedAlt):'—'}</td>
      <td style="padding:8px 12px;color:#555;">${esc(item.note||'')}</td>
    </tr>`;
  }).join('');

  const report = `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8">
<title>דוח BOM — Dazura</title>
<style>
body{font-family:'Segoe UI',sans-serif;margin:0;padding:24px;background:#f5f7fa;color:#1a1a2e;direction:rtl;}
.header{background:linear-gradient(135deg,#1A2A5E,#0066FF);color:#fff;padding:24px 30px;border-radius:12px;margin-bottom:20px;}
.header h1{margin:0 0 6px;font-size:1.6em;}
.header p{margin:0;opacity:.8;font-size:.9em;}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px;}
.kpi{background:#fff;border-radius:10px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.08);border:1px solid #e0e0e0;}
.kpi .num{font-size:2em;font-weight:bold;color:#0066FF;}
.kpi .lbl{font-size:.78em;color:#666;margin-top:3px;}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);}
th{background:#1A2A5E;color:#fff;padding:10px 12px;text-align:right;font-size:.88em;}
tr:nth-child(even){background:#f8f9ff;}
.footer{margin-top:20px;text-align:center;font-size:.78em;color:#888;}
@media print{body{padding:10px;}button{display:none!important;}}
</style></head><body>
<div class="header">
  <h1>📋 דוח BOM — Dazura Neural Systems</h1>
  <p>נוצר: ${now} | ${bom.length} פריטים</p>
</div>
<div class="kpis">
  <div class="kpi"><div class="num">${bom.length}</div><div class="lbl">סה"כ פריטים</div></div>
  <div class="kpi"><div class="num" style="color:#137333;">${okItems.length}</div><div class="lbl">תקינים</div></div>
  <div class="kpi"><div class="num" style="color:#c5221f;">${missingItems.length}</div><div class="lbl">חסרים</div></div>
  ${totalCost>0?`<div class="kpi"><div class="num" style="color:#7B1FA2;">₪${Math.round(totalCost).toLocaleString()}</div><div class="lbl">עלות כוללת</div></div>`:''}
</div>
<table>
  <thead><tr><th>מק"ט</th><th>תיאור</th><th>סוג</th><th>כמות</th><th>מלאי</th><th>חלופה מאושרת</th><th>הערה</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="footer">Dazura Neural Systems | דוח זה נוצר אוטומטית</div>
<script>window.print();<\/script>
</body></html>`;

  const blob = new Blob([report], {type:'text/html;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'BOM_Report_Dazura.html';
  a.click();
  toast('דוח HTML הורד ✅','');
}

// Add HTML export button to BOM
const exportStockBtn = document.getElementById('exportStockReportBtn');
if(exportStockBtn){
  const htmlReportBtn = document.createElement('button');
  htmlReportBtn.id = 'exportHTMLReportBtn';
  htmlReportBtn.className = 'btn btn-disabled';
  htmlReportBtn.disabled = true;
  htmlReportBtn.innerHTML = '📄 דוח HTML';
  htmlReportBtn.addEventListener('click', exportHTMLReport);
  exportStockBtn.parentNode.appendChild(htmlReportBtn);

  // Enable with approval
  const _origApprove = document.getElementById('approveBOMBtn');
  if(_origApprove){
    const _origClick = _origApprove.onclick;
    _origApprove.addEventListener('click',()=>{
      htmlReportBtn.className='btn btn-success';
      htmlReportBtn.disabled=false;
    });
  }
}

/* ══ FINAL INIT ══ */
// Rebuild advanced search when DB changes
const _rebuildAdv = ()=>{ const p=document.getElementById('advSearchPanel'); if(p)p.remove(); const t=document.getElementById('advToggleBtn'); if(t)t.remove(); };



/* ══ WINDOW ERROR HANDLER ══ */
/* Error handling moved to <head> — runs before any external scripts */
window.onunhandledrejection=function(e){
  if(e.reason){var r=String(e.reason);if(r.indexOf('fetch')>=0||r.indexOf('NetworkError')>=0)e.preventDefault();}
};
window.onunhandledrejection=function(e){
  if(e.reason&&String(e.reason).includes('fetch'))return;
};

/* ══ SEMANTIC DICTIONARY ══ */
/* DAZURA_DICT, dazuraExpand, dazuraScore — loaded from dazura_semantics.js */

/* ══ BARCODE SCANNER ══ */
let _scanTarget=null,_scanStream=null;

async function openScanner(target){
  _scanTarget=target;
  const modal=document.getElementById('scannerModal');
  if(!modal)return;
  modal.style.display='flex';
  const res=document.getElementById('scanResult');
  const liveWrap=document.getElementById('scanLiveWrap');
  const iosWrap=document.getElementById('scanIOSWrap');

  // Detect iOS Safari (no getUserMedia on file://)
  const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent);
  const canStream=!isIOS&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia;

  if(canStream){
    // Desktop / Android Chrome — live video
    if(liveWrap)liveWrap.style.display='block';
    if(iosWrap)iosWrap.style.display='none';
    if(res)res.textContent='מחפש מצלמה...';
    try{
      _scanStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
      const video=document.getElementById('scanVideo');
      if(video){video.srcObject=_scanStream;video.play();}
      if('BarcodeDetector' in window){
        const det=new BarcodeDetector({formats:['qr_code','code_128','code_39','ean_13','ean_8','upc_a']});
        if(res)res.textContent='📷 מכוון לברקוד...';
        const loop=async()=>{
          if(!_scanStream)return;
          try{const codes=await det.detect(video);if(codes.length){_confirmScan(codes[0].rawValue);return;}}catch(e){}
          requestAnimationFrame(loop);
        };
        if(video)video.addEventListener('playing',loop,{once:true});
      } else {
        if(res)res.textContent='⚠️ הכנס ידנית';
      }
    }catch(e){if(res)res.textContent='⚠️ אין גישה למצלמה';}
  } else {
    // iOS Safari — use input[capture] which ALWAYS works
    if(liveWrap)liveWrap.style.display='none';
    if(iosWrap)iosWrap.style.display='block';
    if(res)res.textContent='';
  }
}

function _closeScanner(){
  if(_scanStream){_scanStream.getTracks().forEach(t=>t.stop());_scanStream=null;}
  const m=document.getElementById('scannerModal');
  if(m)m.style.display='none';
}

function _confirmScan(code){
  _closeScanner();
  if(_scanTarget==='search'){
    document.getElementById('q').value=code;
    clearTimeout(searchDebounce);searchDebounce=setTimeout(solve,80);
    switchTab('search');
  } else if(_scanTarget==='setup'){
    document.getElementById('key').value=code;
    const ex=db.find(x=>x.k.toLowerCase()===code.toLowerCase());
    if(ex)loadToEdit(ex.k);
  }
}

document.getElementById('scanSearchBtn')?.addEventListener('click',()=>openScanner('search'));

// iOS capture input handler — reads image and decodes barcode
document.getElementById('scanOpenCameraBtn')?.addEventListener('click',()=>{
  document.getElementById('scanCaptureInput').click();
});

document.getElementById('scanCaptureInput')?.addEventListener('change',function(e){
  const file=e.target.files&&e.target.files[0];
  if(!file)return;
  const res=document.getElementById('scanResult');

  // Try BarcodeDetector on captured image (Chrome Android supports this)
  if('BarcodeDetector' in window){
    const img=new Image();
    img.onload=async()=>{
      try{
        const det=new BarcodeDetector({formats:['qr_code','code_128','code_39','ean_13','ean_8','upc_a','data_matrix']});
        const codes=await det.detect(img);
        if(codes.length){
          _confirmScan(codes[0].rawValue);
          if(res)res.textContent='✅ נסרק: '+codes[0].rawValue;
        } else {
          if(res)res.textContent='⚠️ לא זוהה ברקוד — הכנס ידנית';
          document.getElementById('scanManual').focus();
        }
      }catch(err){
        if(res)res.textContent='⚠️ שגיאת זיהוי — הכנס ידנית';
      }
    };
    img.src=URL.createObjectURL(file);
  } else {
    // No BarcodeDetector — show manual input
    if(res)res.textContent='📷 תמונה נלכדה — הכנס מק"ט ידנית';
    document.getElementById('scanManual').focus();
    const iosWrap=document.getElementById('scanIOSWrap');
    if(iosWrap)iosWrap.style.display='none';
  }
  this.value=''; // reset for next capture
});
document.getElementById('scanSetupBtn')?.addEventListener('click',()=>openScanner('setup'));
document.getElementById('scanCancelBtn')?.addEventListener('click',_closeScanner);
document.getElementById('scanConfirmBtn')?.addEventListener('click',()=>{
  const v=document.getElementById('scanManual')?.value.trim();
  if(v)_confirmScan(v);
});
document.getElementById('scanManual')?.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&e.target.value.trim())_confirmScan(e.target.value.trim());
});

/* ══ DRAG & DROP BOM (+ ↑↓ mobile) ══ */
let _dragSrcIdx=null;

function enableBOMDrag(){
  const body=document.getElementById('bom-body');
  if(!body)return;
  body.querySelectorAll('tr.bom-main-row').forEach((row)=>{
    const i=parseInt(row.dataset.bomIdx);
    row.draggable=true;
    row.addEventListener('dragstart',()=>{_dragSrcIdx=i;row.style.opacity='.5';});
    row.addEventListener('dragend',()=>{row.style.opacity='1';body.querySelectorAll('tr').forEach(r=>r.classList.remove('drag-over'));});
    row.addEventListener('dragover',e=>{e.preventDefault();row.classList.add('drag-over');});
    row.addEventListener('dragleave',()=>row.classList.remove('drag-over'));
    row.addEventListener('drop',e=>{
      e.stopPropagation();row.classList.remove('drag-over');
      if(_dragSrcIdx===null||_dragSrcIdx===i)return;
      const moved=bom.splice(_dragSrcIdx,1)[0];
      bom.splice(i,0,moved);_dragSrcIdx=null;
      save(LS.BOM,bom);renderBOM();
    });
  });
}

// Wrap renderBOM to tag main rows + enable drag
const _origRenderBOMdrag=renderBOM;
renderBOM=function(){
  _origRenderBOMdrag();
  const body=document.getElementById('bom-body');
  if(!body)return;
  let mi=0;
  body.querySelectorAll('tr').forEach(tr=>{
    if(tr.querySelector('[data-idx]')){
      tr.classList.add('bom-main-row');
      tr.dataset.bomIdx=mi++;
    }
  });
  enableBOMDrag();
};

/* ══ ADVANCED SEARCH FILTERS ══ */
function buildAdvancedSearch(){
  if(document.getElementById('advSearchPanel'))return;
  const el=document.getElementById('famFilterChips');
  if(!el||!el.parentNode)return;

  const toggleBtn=document.createElement('button');
  toggleBtn.id='advToggleBtn2';
  toggleBtn.className='btn btn-ghost';
  toggleBtn.style.cssText='width:100%;margin-bottom:8px;font-size:.82em;';
  toggleBtn.textContent='🔬 פילטרים מתקדמים ▼';

  const panel=document.createElement('div');
  panel.id='advSearchPanel';
  panel.style.cssText='display:none;padding:10px;background:var(--hover);border-radius:8px;border:1px solid var(--border);margin-bottom:8px;';
  panel.innerHTML=
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">'+
    '<div><label style="font-size:.78em;margin-bottom:2px;">ספק</label>'+
    '<input type="text" id="adv-supplier" placeholder="TE, Amphenol..." style="margin-bottom:0;padding:5px;font-size:.85em;"></div>'+
    '<div><label style="font-size:.78em;margin-bottom:2px;">AWG / חתך</label>'+
    '<input type="text" id="adv-awg" placeholder="22AWG, 0.5mm²..." style="margin-bottom:0;padding:5px;font-size:.85em;"></div>'+
    '<div><label style="font-size:.78em;margin-bottom:2px;">מלאי מינימום</label>'+
    '<input type="number" id="adv-stock-min" placeholder="0" min="0" style="margin-bottom:0;padding:5px;font-size:.85em;"></div>'+
    '<div><label style="font-size:.78em;margin-bottom:2px;">מיקום במחסן</label>'+
    '<input type="text" id="adv-location" placeholder="A3, מדף..." style="margin-bottom:0;padding:5px;font-size:.85em;"></div>'+
    '</div>'+
    '<div style="display:flex;gap:6px;margin-top:8px;">'+
    '<button id="adv-apply" class="btn btn-primary" style="padding:7px 14px;">🔍 חפש</button>'+
    '<button id="adv-clear" class="btn btn-ghost" style="padding:7px 14px;width:auto;">נקה</button></div>';

  toggleBtn.addEventListener('click',()=>{
    const open=panel.style.display!=='none';
    panel.style.display=open?'none':'block';
    toggleBtn.textContent=open?'🔬 פילטרים מתקדמים ▼':'🔬 פילטרים מתקדמים ▲';
  });

  el.parentNode.insertBefore(panel,el);
  el.parentNode.insertBefore(toggleBtn,panel);

  panel.querySelector('#adv-apply').addEventListener('click',()=>{
    const sup=(document.getElementById('adv-supplier')?.value||'').toLowerCase();
    const awg=(document.getElementById('adv-awg')?.value||'').toLowerCase();
    const stMin=parseInt(document.getElementById('adv-stock-min')?.value||0)||0;
    const loc=(document.getElementById('adv-location')?.value||'').toLowerCase();
    let res=db.filter(item=>{
      const cf=item.custom||[];
      if(sup&&!cf.find(f=>f.label.match(/ספק|supplier/i)&&f.value.toLowerCase().includes(sup)))return false;
      if(awg&&!cf.find(f=>f.label.match(/awg|gauge|חתך/i)&&f.value.toLowerCase().includes(awg)))return false;
      if(stMin>0&&(stockMap[item.k.toLowerCase()]??0)<stMin)return false;
      if(loc&&!(item.location||'').toLowerCase().includes(loc))return false;
      return true;
    }).map(r=>({...r,score:50,_reasons:['פילטר']}));
    if(famSearchFilter)res=res.filter(r=>r.c===famSearchFilter);
    const chat=document.getElementById('chat');
    if(!chat)return;
    chat.innerHTML=res.length
      ?res.map(r=>`<div class="result-item" style="cursor:pointer;" data-card="${esc(r.k)}"><span class="score-badge">${r.score}%</span><img src="${r.img||''}" class="img-preview" alt=""><div style="flex:1"><button class="btn btn-primary add-bom-btn" style="width:62px;float:left;padding:5px 8px;" data-k="${esc(r.k)}">הוסף</button><b>${esc(r.k)}</b><span style="color:var(--text2);font-size:.85em;"> [${esc(r.c)}]</span><br><span style="font-size:.88em;">${esc(r.v)}</span>${r.location?`<span class="loc-badge" style="margin-right:4px;">📍${esc(r.location)}</span>`:''}</div></div>`).join('')
      :'<div style="padding:20px;text-align:center;color:var(--text2);">לא נמצאו תוצאות</div>';
    chat.querySelectorAll('.add-bom-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();addToBOM(b.dataset.k);}));
  chat.querySelectorAll('.param-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();addToBOM(b.dataset.k,null);}));
    chat.querySelectorAll('[data-card]').forEach(el2=>el2.addEventListener('click',()=>openNeuronCard&&openNeuronCard(el2.dataset.card)));
    toast(res.length+' תוצאות לפילטר','');
  });

  panel.querySelector('#adv-clear').addEventListener('click',()=>{
    panel.querySelectorAll('input').forEach(i=>i.value='');
    solve();
  });
}

// Hook switchTab to build adv search
const _origSwitchTabAdv2=switchTab;
switchTab=function(t){
  _origSwitchTabAdv2(t);
  if(t==='search')setTimeout(buildAdvancedSearch,120);
  if(t==='bom'){renderBOMTabs&&renderBOMTabs();}
};

// Also init on first load

// ── Image URL input ──
(function(){
  const itemImgEl=document.getElementById('itemImg');
  if(itemImgEl&&itemImgEl.parentNode){
    const imgUrlInput=document.createElement('input');
    imgUrlInput.type='text';imgUrlInput.placeholder='או הכנס URL תמונה...';
    imgUrlInput.style.cssText='margin-bottom:11px;';
    imgUrlInput.addEventListener('input',()=>{
      const url=imgUrlInput.value.trim();
      if(url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i)){
        currentBase64=url;
        const p=document.getElementById('setupPreview');
        if(p){p.src=url;p.style.display='block';}
      }
    });
    itemImgEl.parentNode.insertBefore(imgUrlInput,itemImgEl.nextSibling);
  }
})();

// ── compareBOMWithVersion ──
function compareBOMWithVersion(vi){
  if(vi===undefined||!versions[vi])return;
  const old2=versions[vi].items||[];
  const cur=bom;
  const oldMap=Object.fromEntries(old2.map(x=>[x.k,x]));
  const curMap=Object.fromEntries(cur.map(x=>[x.k,x]));
  const allKeys=[...new Set([...Object.keys(oldMap),...Object.keys(curMap)])];
  let tbl='<table style="width:100%;border-collapse:collapse;font-size:.85em;">';
  tbl+=`<tr style="background:var(--th)"><th style="padding:6px;text-align:right;">מק"ט</th><th>ישן</th><th>נוכחי</th><th>שינוי</th></tr>`;
  allKeys.forEach(k=>{
    const o=oldMap[k],c2=curMap[k];
    let change='',bg='';
    if(!o){change='✅ נוסף';bg='var(--stock-ok-bg)';}
    else if(!c2){change='❌ הוסר';bg='var(--stock-miss-bg)';}
    else if((o.qty||1)!==(c2.qty||1)){change='כמות: '+(o.qty||1)+'→'+(c2.qty||1);bg='var(--bom-alt)';}
    else{change='ללא שינוי';}
    tbl+=`<tr style="background:${bg};border-bottom:1px solid var(--border);"><td style="padding:5px 8px;font-weight:bold;">${esc(k)}</td><td style="padding:5px 8px;">${o?esc(o.v):'-'}</td><td style="padding:5px 8px;">${c2?esc(c2.v):'-'}</td><td style="padding:5px 8px;">${change}</td></tr>`;
  });
  tbl+='</table>';
  const el2=document.getElementById('versionDiff');
  if(el2){el2.style.display='block';el2.innerHTML='<div class="card" style="border:2px solid var(--alt);margin-top:10px;"><h4 style="margin:0 0 9px;color:var(--alt);">📊 השוואה: '+esc(versions[vi].name)+' vs נוכחי</h4>'+tbl+'</div>';}
}

// ── bomCostBadge in renderBOM ──
const _origRenderBOM_cost2=renderBOM;
renderBOM=function(){
  _origRenderBOM_cost2();
  const cost=typeof calcBOMCost==='function'?calcBOMCost():0;
  if(cost>0){
    let badge=document.getElementById('bomCostBadge');
    if(!badge){badge=document.createElement('span');badge.id='bomCostBadge';badge.style.cssText='font-size:.82em;padding:4px 10px;border-radius:6px;background:var(--tag-custom-bg);color:var(--tag-custom-c);font-weight:bold;margin-right:6px;';const hw=document.getElementById('bomHealthWrap');if(hw&&hw.parentNode)hw.parentNode.insertBefore(badge,hw);}
    badge.textContent='💰 ₪'+Math.round(cost).toLocaleString();
  }
};

// ── Min stock alerts in dashboard ──
const _origRenderDash_alerts=renderDashboard;
renderDashboard=function(){
  _origRenderDash_alerts();
  const alerts=db.filter(item=>{
    if(!item.minStock||item.minStock<=0)return false;
    const qty=stockMap[item.k.toLowerCase()];
    return qty!==undefined&&qty<item.minStock;
  });
  if(!alerts.length)return;
  const el3=document.getElementById('dashDups');
  if(!el3)return;
  const div=document.createElement('div');
  div.style.cssText='margin-top:14px;';
  div.innerHTML='<h4 style="margin:0 0 8px;color:var(--danger);">⚠️ התראות מלאי מינימום ('+alerts.length+')</h4><table style="width:100%;border-collapse:collapse;font-size:.85em;"><tr style="background:var(--th)"><th style="padding:5px 8px;text-align:right;">מק"ט</th><th>תיאור</th><th>במלאי</th><th>מינימום</th><th>להזמין</th></tr>'+
    alerts.map(item=>{const qty=stockMap[item.k.toLowerCase()];return '<tr style="background:var(--stock-miss-bg);border-bottom:1px solid var(--border);"><td style="padding:4px 8px;font-weight:bold;color:var(--danger);">'+esc(item.k)+'</td><td style="padding:4px 8px;">'+esc(item.v)+'</td><td style="padding:4px 8px;color:var(--danger);font-weight:bold;">'+qty+'</td><td style="padding:4px 8px;">'+item.minStock+'</td><td style="padding:4px 8px;color:var(--danger);font-weight:bold;">'+(item.minStock-qty)+'</td></tr>';}).join('')+
    '</table>';
  el3.appendChild(div);
};

document.getElementById('q')?.addEventListener('input',()=>{clearTimeout(searchDebounce);searchDebounce=setTimeout(solve,80);});
document.getElementById('precisionRange')?.addEventListener('input',()=>{clearTimeout(searchDebounce);searchDebounce=setTimeout(solve,80);});




/* ══ DEPENDENCY GRAPH ══ */
function renderDepGraph(){
  const canvas=document.getElementById('depGraph');
  if(!canvas){return;}
  const gc=document.getElementById('depGraphContainer');
  if(gc)gc.style.display='block';
  if(!bom.length){toast('הוסף פריטים ל-BOM תחילה','');return;}

  const ctx=canvas.getContext('2d');
  const W=canvas.width=Math.max(canvas.parentElement?.offsetWidth||700,600);

  // ── Build SHARED node graph ──
  // Collect all unique child keys across ALL BOM items
  const nodeMap={};   // key → node data
  const edges=[];     // {from, to, type, label}

  const COL={main:'#0066FF',REQ:'#E02020',ACC:'#7C3AED',TOOL:'#00A550',alt:'#E91E63'};

  // Layout: BOM items on left, shared children on right
  const mainItems=[];
  const childUsage={};  // childKey → [{parentKey, type}]

  bom.forEach(item=>{
    mainItems.push(item.k);
    item.children.forEach(c=>{
      if(!childUsage[c.k])childUsage[c.k]=[];
      childUsage[c.k].push({parent:item.k,type:c.type,v:c.v,img:c.img});
    });
    if(item.approvedAlt){
      if(!childUsage['ALT:'+item.approvedAlt])childUsage['ALT:'+item.approvedAlt]=[];
      childUsage['ALT:'+item.approvedAlt].push({parent:item.k,type:'ALT',v:item.approvedAlt});
    }
  });

  // Group children: shared (used by >1) vs unique
  const sharedKeys=Object.keys(childUsage).filter(k=>childUsage[k].length>1);
  const uniqueKeys=Object.keys(childUsage).filter(k=>childUsage[k].length===1);

  // Compute height
  const leftCount=mainItems.length;
  const rightCount=Object.keys(childUsage).length;
  const H=canvas.height=Math.max(350, Math.max(leftCount,rightCount)*75+80);

  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--card').trim()||'#fff';
  ctx.fillRect(0,0,W,H);

  // Assign positions
  const LX=W*0.18, RX=W*0.76;
  mainItems.forEach((k,i)=>{
    nodeMap[k]={x:LX,y:60+i*(H-100)/Math.max(leftCount-1,1),label:k,color:COL.main,type:'main'};
  });

  const allChildKeys=Object.keys(childUsage);
  allChildKeys.forEach((ck,i)=>{
    const usage=childUsage[ck];
    const type=ck.startsWith('ALT:')?'ALT':usage[0].type;
    const label=ck.startsWith('ALT:')?ck.slice(4):ck;
    const isShared=usage.length>1;
    nodeMap[ck]={
      x:RX,
      y:60+i*(H-100)/Math.max(allChildKeys.length-1,1),
      label,
      color:COL[type]||COL.ACC,
      type,
      shared:isShared,
      usage:usage.length
    };
    // Edges from each parent
    usage.forEach(u=>{
      edges.push({from:u.parent,to:ck,type,dashed:type==='ALT'});
    });
  });

  // Draw edges
  edges.forEach(e=>{
    const f=nodeMap[e.from],t=nodeMap[e.to];
    if(!f||!t)return;
    ctx.beginPath();
    ctx.moveTo(f.x+50,f.y);
    ctx.bezierCurveTo(f.x+130,f.y, t.x-110,t.y, t.x-52,t.y);
    ctx.strokeStyle=COL[e.type]||'#999';
    ctx.lineWidth=t.shared?2.5:1.8;
    if(e.dashed)ctx.setLineDash([6,4]);else ctx.setLineDash([]);
    ctx.globalAlpha=t.shared?0.9:0.6;
    ctx.stroke();
    ctx.setLineDash([]);ctx.globalAlpha=1;
  });

  // Draw nodes
  Object.values(nodeMap).forEach(n=>{
    const rw=n.shared?56:50,rh=n.shared?26:22;
    ctx.beginPath();
    if(ctx.roundRect)ctx.roundRect(n.x-rw,n.y-rh/2,rw*2,rh,5);
    else ctx.rect(n.x-rw,n.y-rh/2,rw*2,rh);
    ctx.fillStyle=n.color+(n.shared?'33':'18');
    ctx.fill();
    ctx.strokeStyle=n.color;
    ctx.lineWidth=n.type==='main'?2.5:n.shared?2:1.5;
    // Shared nodes get double border
    if(n.shared){
      ctx.stroke();
      ctx.beginPath();
      if(ctx.roundRect)ctx.roundRect(n.x-rw+3,n.y-rh/2+3,rw*2-6,rh-6,3);
      else ctx.rect(n.x-rw+3,n.y-rh/2+3,rw*2-6,rh-6);
    }
    ctx.stroke();

    // Label
    ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--text').trim()||'#111';
    ctx.font=(n.type==='main'||n.shared?'bold ':'')+Math.min(n.shared?12:10,11)+'px Segoe UI';
    ctx.textAlign='center';ctx.textBaseline='middle';
    let lbl=n.label;
    while(ctx.measureText(lbl+'…').width>rw*2-10&&lbl.length>3)lbl=lbl.slice(0,-1);
    if(lbl!==n.label)lbl+='…';
    ctx.fillText(lbl,n.x,n.y);

    // Shared badge
    if(n.shared){
      ctx.fillStyle=n.color;ctx.font='bold 9px Segoe UI';
      ctx.fillText('×'+n.usage,n.x+rw-8,n.y-rh/2+7);
    }

    // Stock dot
    const qtyVal=stockMap[n.label.toLowerCase()];
    if(qtyVal!==undefined){
      ctx.beginPath();ctx.arc(n.x+rw-5,n.y-rh/2+5,4,0,Math.PI*2);
      ctx.fillStyle=qtyVal>0?'#00A550':'#E02020';ctx.fill();
    }
  });

  // Column headers
  ctx.font='bold 11px Segoe UI';ctx.textAlign='center';ctx.globalAlpha=0.5;
  ctx.fillStyle=COL.main;ctx.fillText('פריטים ראשיים',LX,28);
  ctx.fillStyle='#444';ctx.fillText('תלויות',RX,28);
  ctx.globalAlpha=1;

  // Legend
  const legendItems=[[COL.main,'ראשי'],[COL.REQ,'נדרש'],[COL.ACC,'נלווה'],[COL.TOOL,'כלי'],[COL.alt,'חלופה']];
  ctx.font='10px Segoe UI';ctx.textAlign='left';ctx.globalAlpha=0.8;
  legendItems.forEach(([c,l],i)=>{
    ctx.fillStyle=c;ctx.fillRect(10,H-60+i*11,8,8);
    ctx.fillStyle='#444';ctx.fillText(l,22,H-55+i*11);
  });
  ctx.globalAlpha=1;

  // Shared note
  if(sharedKeys.length>0){
    ctx.font='10px Segoe UI';ctx.textAlign='right';ctx.fillStyle='#666';
    ctx.fillText('מסגרת כפולה = תלות משותפת',W-10,H-10);
  }
}


// Hook depGraphBtn
document.getElementById('depGraphBtn')?.addEventListener('click',()=>{
  const gc=document.getElementById('depGraphContainer');
  if(!gc)return;
  const visible=gc.style.display!=='none';
  gc.style.display=visible?'none':'block';
  if(!visible)setTimeout(renderDepGraph,50);
});




/* ══ RULES DIALOG — when item has dynamic rules ══ */
function _showRulesDialog(item, children, k){
  // Collect unique params needed
  const neededParams=[...new Set((item.rules||[]).map(r=>r.param))];

  // Build a simple dialog
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9800;display:flex;align-items:center;justify-content:center;';

  const paramFields=neededParams.map(p=>{
    const labels={awg:'AWG (עובי חוט)',voltage:'מתח (V)',mm2:'חתך (mm²)',temp:'טמפ׳ (°C)',shrink_ratio:'יחס כיווץ'};
    const hints={awg:'14, 16, 18, 20, 22...', voltage:'300, 600, 1000', mm2:'0.5, 0.75, 1, 1.5, 2.5', temp:'85, 105, 125'};
    return `<div style="margin-bottom:10px;">
      <label style="font-size:.85em;font-weight:bold;color:var(--text);">${labels[p]||p}</label>
      <input type="text" id="rp_${p}" placeholder="${hints[p]||p}" 
        style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--hover);color:var(--text);font-size:1em;direction:ltr;text-align:left;">
    </div>`;
  }).join('');

  overlay.innerHTML=`
    <div style="background:var(--card);border-radius:14px;padding:22px;width:360px;max-width:92vw;border:2px solid var(--primary);box-shadow:0 8px 40px rgba(0,0,0,.3);">
      <h3 style="margin:0 0 5px;color:var(--text);">🔗 תלויות דינמיות</h3>
      <p style="font-size:.82em;color:var(--text2);margin:0 0 14px;">
        הנירון <b>${esc(k)}</b> דורש פרמטרים לבחירת אביזרים מתאימים:
      </p>
      ${paramFields}
      <div id="rulesPreview" style="margin:10px 0;padding:8px;background:var(--hover);border-radius:7px;min-height:30px;font-size:.82em;"></div>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button id="rulesConfirmBtn" class="btn btn-primary" style="flex:1;">✅ הוסף ל-BOM</button>
        <button id="rulesSkipBtn" class="btn btn-ghost" style="flex:1;">דלג על פרמטרים</button>
        <button id="rulesCancelBtn" class="btn btn-ghost" style="padding:8px 12px;">ביטול</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  // Live preview as user types
  function updatePreview(){
    const params={};
    neededParams.forEach(p=>{const v=document.getElementById('rp_'+p)?.value.trim();if(v)params[p]=v;});
    if(!Object.keys(params).length){document.getElementById('rulesPreview').innerHTML='';return;}

    const re=window._dazuraRules;
    if(!re){document.getElementById('rulesPreview').innerHTML='<span style="color:var(--text2)">טוען...</span>';return;}

    const results=re.evaluateRules(item,params);
    if(!results.length){
      document.getElementById('rulesPreview').innerHTML='<span style="color:var(--text2)">אין התאמה לפרמטרים שהוזנו</span>';
      return;
    }
    document.getElementById('rulesPreview').innerHTML=
      '<b style="color:var(--primary)">💡 מומלץ להוסיף:</b><br>'+
      results.map(r=>`
        <div style="display:flex;align-items:center;gap:6px;margin-top:5px;">
          <span style="background:var(--tag-acc-bg);color:var(--tag-acc-c);padding:2px 8px;border-radius:4px;font-weight:bold;">${esc(r.resolvedPN)}</span>
          <span style="color:var(--text2);font-size:.9em;">${esc(r.note)}</span>
        </div>`).join('');
  }

  neededParams.forEach(p=>document.getElementById('rp_'+p)?.addEventListener('input',updatePreview));

  // Confirm — add item + resolved children
  document.getElementById('rulesConfirmBtn').addEventListener('click',()=>{
    const params={};
    neededParams.forEach(p=>{const v=document.getElementById('rp_'+p)?.value.trim();if(v)params[p]=v;});

    // Evaluate rules and inject resolved items as children
    const re=window._dazuraRules;
    const resolvedChildren=[...children];
    if(re&&Object.keys(params).length){
      const results=re.evaluateRules(item,params);
      results.forEach(r=>{
        const existing=db.find(x=>x.k.toLowerCase()===r.resolvedPN.toLowerCase());
        resolvedChildren.push({
          k:r.resolvedPN,
          v:existing?existing.v:(r.note||'נלווה מחושב'),
          img:existing?existing.img:'',
          type:'ACC',
          resolved:true,
          resolvedFrom:r.rule.param+'='+r.rule.value
        });
      });
    }

    bom.push({...item,children:resolvedChildren,note:'',qty:1,itemType:'REQ',approvedAlt:null,params});
    save(LS.BOM,bom);renderBOM();resetApproval();
    document.body.removeChild(overlay);
    toast('נוסף: '+k+(resolvedChildren.length>children.length?' + '+( resolvedChildren.length-children.length)+' אביזרים מחושבים':''),'');
  });

  document.getElementById('rulesSkipBtn').addEventListener('click',()=>{
    bom.push({...item,children,note:'',qty:1,itemType:'REQ',approvedAlt:null,params:{}});
    save(LS.BOM,bom);renderBOM();resetApproval();
    document.body.removeChild(overlay);
    toast('נוסף: '+k,'');
  });
  document.getElementById('rulesCancelBtn').addEventListener('click',()=>document.body.removeChild(overlay));

  // Focus first field
  setTimeout(()=>document.getElementById('rp_'+neededParams[0])?.focus(),100);
}




/* ══════════════════════════════════════════════════════════════
   AUTO-RESOLVE ENGINE — סריקת BOM ורזולוציה אוטומטית
   ─────────────────────────────────────────────────────────────
   כשמוסיפים נעל כבל ל-BOM:
   1. סרוק את ה-BOM לחוטים/כבלים
   2. חלץ AWG/מתח מכל חוט
   3. חשב שרוול מתאים
   4. הוסף כ-child צמוד לנעל הכבל
══════════════════════════════════════════════════════════════ */

// Wire family keywords
const WIRE_FAMILIES=['wire','wires','cable','cables','חוטים','כבלים','חוט','כבל','conductor'];
const WIRE_KEYWORDS=['wire','cable','חוט','כבל','conductor','awg','gauge'];

function _isWireItem(item){
  if(!item)return false;
  const fam=(item.c||'').toLowerCase();
  const desc=(item.v||'').toLowerCase();
  const key=(item.k||'').toLowerCase();
  const allText=fam+' '+desc+' '+key;
  // Exclude non-wire items even if they mention AWG (terminals, connectors, shrink)
  const NON_WIRE=['terminal','connector','contact','lug','splice','ferrule',
    'shrink','heat shrink','קונקטור','מחבר','נעל','נעלי','מגע'];
  if(NON_WIRE.some(w=>fam.includes(w)||desc.includes(w)))return false;
  // Family check
  if(WIRE_FAMILIES.some(w=>fam.includes(w)))return true;
  // Description / key keywords
  if(WIRE_KEYWORDS.some(w=>allText.includes(w)))return true;
  // AWG custom field
  if((item.custom||[]).some(f=>f.label.match(/awg|gauge|חתך|עובי|mm2|mm²/i)))return true;
  // AWG pattern in description or key
  if(/\d+\s*awg|awg\s*\d+|\d+\s*ga(?:uge)?|\d+\.?\d*\s*mm[²2]/i.test(allText))return true;
  // UL wire spec in key or description
  if(/ul1015|ul1569|ul1007|m22759|li55|hookup|hook.up/i.test(allText))return true;
  return false;
}

function _extractWireParams(item){
  const params={};
  const text=((item.v||'')+' '+(item.custom||[]).map(f=>f.label+' '+f.value).join(' ')).toLowerCase();

  // AWG from custom field
  const awgField=(item.custom||[]).find(f=>f.label.match(/awg|gauge/i));
  if(awgField)params.awg=awgField.value.replace(/\D/g,'');

  // AWG from description "18AWG" or "AWG18"
  if(!params.awg){
    const m=text.match(/(\d+)\s*awg|awg\s*(\d+)/);
    if(m)params.awg=m[1]||m[2];
  }

  // mm² from custom field
  const mmField=(item.custom||[]).find(f=>f.label.match(/חתך|mm2|mm²|cross|area/i));
  if(mmField){
    params.mm2=parseFloat(mmField.value)||0;
    // Convert to AWG if not set
    if(!params.awg&&window._dazuraRules){
      const awgData=window._dazuraRules.AWG;
      const entry=Object.entries(awgData||{}).find(([,d])=>Math.abs((d.area_mm2||d.area||0)-params.mm2)<0.3);
      if(entry)params.awg=entry[0];
    }
  }

  // mm² from description
  if(!params.mm2){
    const m2=text.match(/([\d.]+)\s*mm[²2]/);
    if(m2){
      params.mm2=parseFloat(m2[1]);
      if(!params.awg&&window._dazuraRules){
        const awgData=window._dazuraRules.AWG;
        const entry=Object.entries(awgData||{}).find(([,d])=>Math.abs((d.area_mm2||d.area||0)-params.mm2)<0.3);
        if(entry)params.awg=entry[0];
      }
    }
  }

  // Voltage from custom field
  const vField=(item.custom||[]).find(f=>f.label.match(/מתח|voltage|volt|v$/i));
  if(vField)params.voltage=parseFloat(vField.value)||0;

  // Voltage from description "600V" "300V"
  if(!params.voltage){
    const vm=text.match(/(\d{2,4})\s*v(?:olt|dc|ac)?/i);
    if(vm)params.voltage=parseInt(vm[1]);
  }

  // Insulation type (affects OD)
  const insField=(item.custom||[]).find(f=>f.label.match(/insulation|בידוד|חומר/i));
  if(insField)params.insulation=insField.value.toLowerCase();
  if(!params.insulation){
    if(/ptfe|teflon/i.test(text))params.insulation='ptfe';
    else if(/silicone/i.test(text))params.insulation='silicone';
    else if(/pvc/i.test(text))params.insulation='pvc';
  }

  return params;
}

// Get OD based on AWG + insulation type
function _getWireOD(awg, insulation){
  const re=window._dazuraRules;
  if(!re||!re.AWG)return null;
  const d=re.AWG[String(awg)];
  if(!d)return null;
  // Different insulations have different ODs
  if(insulation==='ptfe'&&d.od_ptfe)return d.od_ptfe;
  if(insulation==='silicone'&&d.od_sil)return d.od_sil;
  return d.od_mm||d.od_pvc||2.5; // default PVC
}

// Main function: when item with rules is added, auto-resolve from BOM wires
function _autoResolveFromBOM(item, children){
  const SHRINK_PFX=new Set(['rsfr','atum','rt','fp301','rsf']);
  const accPrefixes=(item.acc||[]).filter(a=>SHRINK_PFX.has(a.toLowerCase().replace(/[-\s]/g,'')));
  if(!accPrefixes.length)return children;

  const wires=bom.filter(b=>{const d=db.find(x=>x.k===b.k)||b;return _isWireItem(d);});
  if(!wires.length){
    // No wires yet — add placeholder per prefix
    const ph=[...children];
    accPrefixes.forEach(prefix=>{
      const pfx=prefix.toUpperCase();
      if(!ph.some(c=>c.k.toUpperCase().startsWith(pfx)))
        ph.push({k:pfx+'-(לחישוב)',v:'שרוול — יחושב עם הוספת חוט',
                 img:'',type:'ACC',resolved:true,resolvedFrom:'ממתין לחוט'});
    });
    return ph;
  }

  // Check if global functions from semantics are available
  const canResolve=typeof dazuraSelectShrink==='function'&&
                   typeof selectShrink==='function'&&
                   typeof SHRINK_CATALOG!=='undefined';

  const result=[...children];
  wires.forEach(wireItem=>{
    const wireDB=db.find(x=>x.k===wireItem.k)||wireItem;
    let od_mm=null, wireLabel=wireItem.k;

    if(canResolve){
      const wd=dazuraSelectShrink(wireDB);
      if(wd&&wd.od_mm){
        od_mm=wd.od_mm;
        wireLabel=`${wireItem.k} (${wd.awg}AWG${wd.specLabel?' '+wd.specLabel:''})`;
      }
    }
    // Fallback: extract AWG from description
    if(!od_mm){
      const p=_extractWireParams(wireDB);
      if(p.awg){
        const OD={'10':5.00,'12':4.19,'14':3.51,'16':3.23,'18':2.77,
                  '20':2.34,'22':2.06,'24':1.83,'26':1.65,'28':1.47,'30':1.35};
        od_mm=OD[String(p.awg)]||null;
        wireLabel=`${wireItem.k} (${p.awg}AWG)`;
      }
    }
    if(!od_mm)return;

    accPrefixes.forEach(prefix=>{
      const pfx=prefix.toUpperCase();
      let shrink=null;
      if(canResolve&&SHRINK_CATALOG[pfx]){
        shrink=selectShrink(pfx,od_mm);
      } else {
        // Built-in minimal selector
        const SIZES=[{sfx:'3/32',id:2.40},{sfx:'3/16',id:4.80},{sfx:'H1',id:6.40},{sfx:'3/8',id:9.50}];
        const sz=SIZES.find(s=>s.id>=od_mm*1.10)||SIZES[SIZES.length-1];
        shrink={sfx:sz.sfx,fullPN:`${pfx}-${sz.sfx}`};
      }
      if(!shrink||!shrink.sfx)return;
      if(result.some(c=>c.k===shrink.fullPN))return;
      const ex=db.find(x=>x.k.toLowerCase()===shrink.fullPN.toLowerCase());
      result.push({k:shrink.fullPN,
        v:ex?ex.v:`Shrink ${pfx} ${shrink.sfx}`,img:ex?ex.img:'',
        type:'ACC',resolved:true,resolvedFrom:wireLabel,
        note:`${shrink.sfx} — OD=${od_mm.toFixed(1)}mm`});
    });
  });
  return result;
}

function _rescanBOMAfterWireAdded(newWireKey){
  const wireItem=db.find(x=>x.k===newWireKey);
  if(!wireItem||!_isWireItem(wireItem))return;

  const canResolve=typeof dazuraSelectShrink==='function'&&
                   typeof selectShrink==='function'&&
                   typeof SHRINK_CATALOG!=='undefined';

  let od_mm=null, wireLabel=newWireKey;
  if(canResolve){
    const wd=dazuraSelectShrink(wireItem);
    if(wd&&wd.od_mm){
      od_mm=wd.od_mm;
      wireLabel=`${newWireKey} (${wd.awg}AWG${wd.specLabel?' '+wd.specLabel:''})`;
    }
  }
  if(!od_mm){
    const p=_extractWireParams(wireItem);
    if(p.awg){
      const OD={'10':5.00,'12':4.19,'14':3.51,'16':3.23,'18':2.77,
                '20':2.34,'22':2.06,'24':1.83,'26':1.65,'28':1.47,'30':1.35};
      od_mm=OD[String(p.awg)]||null;
      wireLabel=`${newWireKey} (${p.awg}AWG)`;
    }
  }
  if(!od_mm)return;

  const SHRINK_PFX=new Set(['rsfr','atum','rt','fp301','rsf']);
  let updated=0;

  bom.forEach(bomItem=>{
    const dbItem=db.find(x=>x.k===bomItem.k)||bomItem;
    const prefixes=(dbItem.acc||[]).filter(a=>SHRINK_PFX.has(a.toLowerCase().replace(/[-\s]/g,'')));
    if(!prefixes.length)return;

    prefixes.forEach(prefix=>{
      const pfx=prefix.toUpperCase();
      let shrink=null;
      if(canResolve&&SHRINK_CATALOG[pfx]){
        shrink=selectShrink(pfx,od_mm);
      } else {
        const SIZES=[{sfx:'3/32',id:2.40},{sfx:'3/16',id:4.80},{sfx:'H1',id:6.40},{sfx:'3/8',id:9.50}];
        const sz=SIZES.find(s=>s.id>=od_mm*1.10)||SIZES[SIZES.length-1];
        shrink={sfx:sz.sfx,fullPN:`${pfx}-${sz.sfx}`};
      }
      if(!shrink||!shrink.sfx)return;

      // Remove any placeholder
      const plIdx=bomItem.children.findIndex(c=>c.k.startsWith(pfx+'-('));
      if(plIdx>=0)bomItem.children.splice(plIdx,1);

      if(bomItem.children.some(c=>c.k===shrink.fullPN))return;
      const ex=db.find(x=>x.k.toLowerCase()===shrink.fullPN.toLowerCase());
      bomItem.children.push({k:shrink.fullPN,
        v:ex?ex.v:`Shrink ${pfx} ${shrink.sfx}`,img:ex?ex.img:'',
        type:'ACC',resolved:true,resolvedFrom:wireLabel,
        note:`${shrink.sfx} — OD=${od_mm.toFixed(1)}mm`});
      updated++;
    });
  });

  if(updated){save(LS.BOM,bom);renderBOM();toast(`🔗 ${updated} שרוולים עודכנו — ${newWireKey}`,'');}
}


function _showRulesDialog(item, children, k){
  // Collect unique params needed
  const neededParams=[...new Set((item.rules||[]).map(r=>r.param))];

  // Build a simple dialog
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9800;display:flex;align-items:center;justify-content:center;';

  const paramFields=neededParams.map(p=>{
    const labels={awg:'AWG (עובי חוט)',voltage:'מתח (V)',mm2:'חתך (mm²)',temp:'טמפ׳ (°C)',shrink_ratio:'יחס כיווץ'};
    const hints={awg:'14, 16, 18, 20, 22...', voltage:'300, 600, 1000', mm2:'0.5, 0.75, 1, 1.5, 2.5', temp:'85, 105, 125'};
    return `<div style="margin-bottom:10px;">
      <label style="font-size:.85em;font-weight:bold;color:var(--text);">${labels[p]||p}</label>
      <input type="text" id="rp_${p}" placeholder="${hints[p]||p}" 
        style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--hover);color:var(--text);font-size:1em;direction:ltr;text-align:left;">
    </div>`;
  }).join('');

  overlay.innerHTML=`
    <div style="background:var(--card);border-radius:14px;padding:22px;width:360px;max-width:92vw;border:2px solid var(--primary);box-shadow:0 8px 40px rgba(0,0,0,.3);">
      <h3 style="margin:0 0 5px;color:var(--text);">🔗 תלויות דינמיות</h3>
      <p style="font-size:.82em;color:var(--text2);margin:0 0 14px;">
        הנירון <b>${esc(k)}</b> דורש פרמטרים לבחירת אביזרים מתאימים:
      </p>
      ${paramFields}
      <div id="rulesPreview" style="margin:10px 0;padding:8px;background:var(--hover);border-radius:7px;min-height:30px;font-size:.82em;"></div>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button id="rulesConfirmBtn" class="btn btn-primary" style="flex:1;">✅ הוסף ל-BOM</button>
        <button id="rulesSkipBtn" class="btn btn-ghost" style="flex:1;">דלג על פרמטרים</button>
        <button id="rulesCancelBtn" class="btn btn-ghost" style="padding:8px 12px;">ביטול</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  // Live preview as user types
  function updatePreview(){
    const params={};
    neededParams.forEach(p=>{const v=document.getElementById('rp_'+p)?.value.trim();if(v)params[p]=v;});
    if(!Object.keys(params).length){document.getElementById('rulesPreview').innerHTML='';return;}

    const re=window._dazuraRules;
    if(!re){document.getElementById('rulesPreview').innerHTML='<span style="color:var(--text2)">טוען...</span>';return;}

    const results=re.evaluateRules(item,params);
    if(!results.length){
      document.getElementById('rulesPreview').innerHTML='<span style="color:var(--text2)">אין התאמה לפרמטרים שהוזנו</span>';
      return;
    }
    document.getElementById('rulesPreview').innerHTML=
      '<b style="color:var(--primary)">💡 מומלץ להוסיף:</b><br>'+
      results.map(r=>`
        <div style="display:flex;align-items:center;gap:6px;margin-top:5px;">
          <span style="background:var(--tag-acc-bg);color:var(--tag-acc-c);padding:2px 8px;border-radius:4px;font-weight:bold;">${esc(r.resolvedPN)}</span>
          <span style="color:var(--text2);font-size:.9em;">${esc(r.note)}</span>
        </div>`).join('');
  }

  neededParams.forEach(p=>document.getElementById('rp_'+p)?.addEventListener('input',updatePreview));

  // Confirm — add item + resolved children
  document.getElementById('rulesConfirmBtn').addEventListener('click',()=>{
    const params={};
    neededParams.forEach(p=>{const v=document.getElementById('rp_'+p)?.value.trim();if(v)params[p]=v;});

    // Evaluate rules and inject resolved items as children
    const re=window._dazuraRules;
    const resolvedChildren=[...children];
    if(re&&Object.keys(params).length){
      const results=re.evaluateRules(item,params);
      results.forEach(r=>{
        const existing=db.find(x=>x.k.toLowerCase()===r.resolvedPN.toLowerCase());
        resolvedChildren.push({
          k:r.resolvedPN,
          v:existing?existing.v:(r.note||'נלווה מחושב'),
          img:existing?existing.img:'',
          type:'ACC',
          resolved:true,
          resolvedFrom:r.rule.param+'='+r.rule.value
        });
      });
    }

    bom.push({...item,children:resolvedChildren,note:'',qty:1,itemType:'REQ',approvedAlt:null,params});
    save(LS.BOM,bom);renderBOM();resetApproval();
    document.body.removeChild(overlay);
    toast('נוסף: '+k+(resolvedChildren.length>children.length?' + '+( resolvedChildren.length-children.length)+' אביזרים מחושבים':''),'');
  });

  document.getElementById('rulesSkipBtn').addEventListener('click',()=>{
    bom.push({...item,children,note:'',qty:1,itemType:'REQ',approvedAlt:null,params:{}});
    save(LS.BOM,bom);renderBOM();resetApproval();
    document.body.removeChild(overlay);
    toast('נוסף: '+k,'');
  });
  document.getElementById('rulesCancelBtn').addEventListener('click',()=>document.body.removeChild(overlay));

  // Focus first field
  setTimeout(()=>document.getElementById('rp_'+neededParams[0])?.focus(),100);
}




})();
