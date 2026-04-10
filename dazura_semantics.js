/* ═══════════════════════════════════════════════════════════════════
   DAZURA SEMANTIC DICTIONARY — dazura_semantics.js
   ─────────────────────────────────────────────────────────────────
   קובץ זה נפרד מהממשק הראשי.
   הוסף מונחים חדשים ישירות כאן בפורמט:
     'מונח': ['מילה_קשורה_1', 'מילה_קשורה_2', ...],
   
   תחומים: Connectors · Wires · Electronics · Mechanical · Avionics
   שפות: עברית + אנגלית + מק"טים TE / Deutsch / Amphenol / Molex
═══════════════════════════════════════════════════════════════════ */

const DAZURA_DICT={
'connector':['קונקטור','מחבר','תקע','שקע','plug','socket','receptacle','coupling'],
'קונקטור':['connector','plug','socket','receptacle','מחבר','תקע','שקע'],
'מחבר':['connector','plug','socket','receptacle','קונקטור','תקע','שקע'],
'plug':['תקע','מחבר','קונקטור','connector','socket','male','זכר'],
'socket':['שקע','מחבר','קונקטור','receptacle','female','נקבה'],
'receptacle':['שקע','מחבר','female','נקבה','socket','connector'],
'תקע':['plug','connector','pin','מחבר','קונקטור','male','זכר'],
'שקע':['socket','receptacle','female','נקבה','מחבר','קונקטור'],
'male':['זכר','plug','pin','תקע'],'female':['נקבה','socket','receptacle','שקע'],
'זכר':['male','plug','pin','תקע'],'נקבה':['female','socket','receptacle','שקע'],
'wire':['חוט','כבל','lead','conductor'],'חוט':['wire','cable','lead','conductor'],
'cable':['כבל','חוט','harness','bundle'],'כבל':['cable','wire','harness','חוט'],
'harness':['כבל','wiring harness','wire bundle','צרור חוטים'],
'awg':['gauge','wire size','עובי חוט','cross section','חתך'],
'gauge':['awg','wire size','עובי','thickness'],'חתך':['cross section','awg','gauge'],
'shielded':['מוגן','מסוכך','shielded cable','emi','rfi'],
'מסוכך':['shielded','מוגן','emi','rfi'],'emi':['electromagnetic','מסוכך','shielding'],
'seal':['איטום','אטם','sealing','gasket','o-ring','waterproof'],
'איטום':['seal','sealing','gasket','o-ring','waterproof','אטם'],
'waterproof':['עמיד מים','sealed','ip67','ip68','איטום'],
'עמיד מים':['waterproof','sealed','ip67','ip68','איטום'],
'ip67':['waterproof','sealed','עמיד מים'],'ip68':['waterproof','sealed','עמיד מים'],
'wedge':['נועל','wedgelock','lock','נעילה'],'wedgelock':['wedge','נועל','lock'],
'נועל':['wedge','wedgelock','lock','נעילה'],'נעילה':['lock','wedge','clip','retention'],
'tool':['כלי','כלי עבודה','כלי הכנסה','כלי שליפה','כלי הידוק'],
'כלי':['tool','כלי עבודה','instrument'],'crimper':['כלי הידוק','crimp tool'],
'כלי הידוק':['crimper','crimp tool','הידוק'],'הידוק':['crimp','crimping','crimper'],
'insertion tool':['כלי הכנסה','inserter'],'כלי הכנסה':['insertion tool','inserter'],
'extraction tool':['כלי שליפה','extractor'],'כלי שליפה':['extraction tool','extractor'],
'pin':['פין','מגע','contact','terminal'],'פין':['pin','contact','terminal','מגע'],
'contact':['מגע','פין','terminal','pin'],'מגע':['contact','pin','terminal','פין'],
'terminal':['מגע','פין','קצה','lug','contact'],
'deutsch':['dtm','dt','dtp','hdp','connector'],
'dtm':['deutsch','dtm connector','circular','מחבר deutsch'],
'dtm04':['deutsch','dtm','4 pin','plug','connector'],
'dtm06':['deutsch','dtm','6 pin','socket','connector'],
'dt':['deutsch','dt connector','dt04','dt06','circular'],
'te':['te connectivity','tyco','amp','tyco electronics'],
'amphenol':['connector','מחבר','circular','military'],
'molex':['connector','plug','socket','mini-fit','micro-fit'],
'mil-spec':['military','מחבר צבאי','mil-dtl','circular','ms'],
'מחבר צבאי':['mil-spec','military connector','ms','dt','dtm'],
'circular':['עגול','מחבר עגול','circular connector','mil-spec','dt','dtm'],
'מחבר עגול':['circular','circular connector','mil-spec','dt','dtm'],
'resistor':['נגד','resistance','ohm','R'],'נגד':['resistor','resistance','ohm'],
'capacitor':['קבל','capacitance','farad','C'],'קבל':['capacitor','capacitance','farad'],
'relay':['ממסר','switch','coil','contact'],'ממסר':['relay','switch','coil'],
'fuse':['פיוז','protection','overcurrent'],'פיוז':['fuse','protection','overcurrent'],
'voltage':['מתח','volts','vdc','vac'],'מתח':['voltage','volts','vdc','vac'],
'current':['זרם','ampere','amps'],'זרם':['current','ampere','amps'],
'ground':['אדמה','gnd','grounding','earth'],'אדמה':['ground','gnd','grounding'],
'gnd':['ground','אדמה','grounding','earth'],
'bracket':['מדף','bracket','mount','holder'],'מדף':['bracket','shelf','mount','holder'],
'screw':['בורג','fastener','bolt'],'בורג':['screw','bolt','fastener'],
'aluminum':['אלומיניום','al','metal'],'אלומיניום':['aluminum','al','metal'],
'stainless':['אל חלד','stainless steel','ss'],'אל חלד':['stainless','ss'],
'avionics':['אוויוניקה','aviation','aircraft'],'אוויוניקה':['avionics','aviation'],
'mil-std':['military standard','mil-spec'],'ptfe':['teflon','טפלון','insulation'],
'teflon':['ptfe','טפלון','insulation'],'טפלון':['ptfe','teflon','insulation'],
};

function dazuraExpand(query){
  const tokens=String(query||'').toLowerCase().replace(/[^\w\u0590-\u05ff\s]/g,' ').split(/\s+/).filter(w=>w.length>1);
  const all=new Set(tokens);
  tokens.forEach(t=>{
    if(DAZURA_DICT[t])DAZURA_DICT[t].forEach(s=>all.add(s.toLowerCase()));
    Object.keys(DAZURA_DICT).forEach(key=>{
      if(key.length>=3&&t.length>=3&&(key.startsWith(t)||t.startsWith(key))){
        all.add(key);
        DAZURA_DICT[key].forEach(s=>all.add(s.toLowerCase()));
      }
    });
  });
  return[...all];
}

function dazuraScore(query,itemText){
  const expanded=dazuraExpand(query);
  const text=itemText.toLowerCase();
  let score=0;
  expanded.forEach(term=>{if(term.length<2)return;if(text.includes(term))score+=Math.min(40,term.length*4);});
  return Math.min(score,100);
}

// Signal to main app that semantics are loaded
if(typeof window !== 'undefined') window._dazuraSemanticsLoaded = true;
