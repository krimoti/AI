/* ═══════════════════════════════════════════════════════════════════
   DAZURA SEMANTIC DICTIONARY v2.0
   ─────────────────────────────────────────────────────────────────
   תחומים: Connectors · Wires · Electronics · Mechanical · Avionics
   שפות: עברית + אנגלית + מק"טים TE / Deutsch / Amphenol / Molex
   קבוצות: ~350 | מונחים: ~2,800
   ─────────────────────────────────────────────────────────────────
   הוסף מונחים בפורמט:
     'מונח': ['מילה1', 'מילה2', 'word3'],
═══════════════════════════════════════════════════════════════════ */

const DAZURA_DICT = {

/* ══ CONNECTORS — General ══ */
'connector':['קונקטור','מחבר','תקע','שקע','plug','socket','receptacle','coupling','coupler','interface','junction','חיבור','כניסה','יציאה'],
'קונקטור':['connector','plug','socket','receptacle','מחבר','תקע','שקע','coupling','coupler','חיבור'],
'מחבר':['connector','plug','socket','receptacle','קונקטור','תקע','שקע','coupler','junction'],
'plug':['תקע','מחבר','קונקטור','connector','socket','male','pin','זכר'],
'socket':['שקע','מחבר','קונקטור','receptacle','female','נקבה','connector'],
'receptacle':['שקע','מחבר','female','נקבה','socket','connector','קונקטור'],
'תקע':['plug','connector','pin','מחבר','קונקטור','male','זכר'],
'שקע':['socket','receptacle','female','נקבה','מחבר','קונקטור'],
'male':['זכר','plug','pin','תקע','מחבר זכר'],'female':['נקבה','socket','receptacle','שקע','מחבר נקבה'],
'זכר':['male','plug','pin','תקע'],'נקבה':['female','socket','receptacle','שקע'],
'coupling':['קישור','חיבור','connector','coupler','coupling nut'],'coupler':['קישור','חיבור','connector','coupling'],
'circular':['עגול','מחבר עגול','circular connector','mil-spec','dt','dtm','ms','round'],
'מחבר עגול':['circular','circular connector','mil-spec','dt','dtm','ms'],
'עגול':['circular','round','circular connector'],
'rectangular':['מלבני','rectangular connector','מחבר מלבני','square'],
'מלבני':['rectangular','rectangular connector'],

/* ══ CONNECTORS — Deutsch ══ */
'deutsch':['dtm','dt','dtp','hdp','hd','connector','מחבר deutsch'],
'dtm':['deutsch','dtm connector','dtm04','dtm06','circular','מחבר deutsch'],
'dt':['deutsch','dt04','dt06','circular','מחבר deutsch'],
'dtp':['deutsch','power','high current','connector'],
'hdp':['deutsch','heavy duty','power connector','hd'],
'dtm04':['deutsch','dtm','4 pin','4p','plug','connector','male'],
'dtm06':['deutsch','dtm','6 pin','6s','socket','connector','female'],
'dtm04-4p':['dtm','4 pin','plug','deutsch','connector','male','4p'],
'dtm04-4s':['dtm','4 pin','socket','deutsch','connector','female','4s'],
'dtm04-6p':['dtm','6 pin','plug','deutsch','connector'],
'dtm04-6s':['dtm','6 pin','socket','deutsch','connector'],
'dtm04-12p':['dtm','12 pin','plug','deutsch'],
'dtm04-12s':['dtm','12 pin','socket','deutsch'],
'dt04-2p':['dt','2 pin','plug','deutsch'],'dt04-3p':['dt','3 pin','plug','deutsch'],
'dt04-4p':['dt','4 pin','plug','deutsch'],'dt04-6p':['dt','6 pin','plug','deutsch'],
'dt06-2s':['dt','2 pin','socket','deutsch'],'dt06-3s':['dt','3 pin','socket','deutsch'],
'dt06-4s':['dt','4 pin','socket','deutsch'],'dt06-6s':['dt','6 pin','socket','deutsch'],

/* ══ CONNECTORS — TE Connectivity / AMP / Tyco ══ */
'te':['te connectivity','tyco','amp','tyco electronics','te conn'],
'te connectivity':['te','tyco','amp','tyco electronics'],
'tyco':['te','amp','te connectivity','tyco electronics'],
'amp':['te','tyco','amphenol','te connectivity','connector'],
'superseal':['te','superseal 1.5','waterproof','sealed connector','אטום'],
'econoseal':['te','econoseal','connector','sealed'],
'metrimate':['te','metrimate','connector'],
'multilock':['te','multilock','connector'],
'mcp':['te','mcp connector','mini car plug'],
'hd10':['te','hd10','heavy duty','circular'],
'certi-crimp':['te','certicrimp','crimp tool','crimping'],

/* ══ CONNECTORS — Amphenol ══ */
'amphenol':['connector','מחבר','circular','military','industrial','amp'],
'pt':['amphenol','pt02','pt06','circular','bayonet'],
'pt02':['amphenol','pt','plug','circular','bayonet'],'pt06':['amphenol','pt','receptacle','circular'],
'ms':['mil-spec','military','circular','ms27473','ms27474','ms3106','ms3102','ms3100'],
'ms27473':['mil-spec','circular','military connector','מחבר צבאי'],
'ms27474':['mil-spec','circular','military connector','מחבר צבאי'],
'ms3106':['mil-spec','circular','military','plug'],'ms3102':['mil-spec','circular','military','receptacle'],
'ms3100':['mil-spec','circular','military'],'ms3116':['mil-spec','circular','military'],
'd38999':['mil-dtl','circular','military','aerospace','מחבר אוויוני','series iii'],
'mil-dtl-38999':['d38999','circular','military','aerospace'],
'mil-c-5015':['ms3100','ms3106','circular','military'],
'mil-c-26482':['miniature','circular','military'],

/* ══ CONNECTORS — Molex ══ */
'molex':['connector','plug','socket','מחבר','mini-fit','micro-fit','kk','sl'],
'mini-fit':['molex','power','connector','plug','socket','5557','5559'],
'micro-fit':['molex','power','connector','small','compact','430','3mm'],
'kk':['molex','kk connector','2.54mm','0.1 inch','connector'],
'sl':['molex','sl connector','2.54mm','connector'],
'micro-clasp':['molex','micro-clasp','small','connector'],

/* ══ CONNECTORS — JST ══ */
'jst':['connector','plug','socket','small','מחבר קטן','ph','xh','gh','sh','zh','nh'],
'ph':['jst','2mm','ph connector','plug'],'xh':['jst','2.5mm','xh connector','plug'],
'gh':['jst','1.25mm','gh connector'],'sh':['jst','1mm','sh connector'],
'zh':['jst','1.5mm','zh connector'],'nh':['jst','2.54mm','nh connector'],
'sm':['jst','sm connector','2.5mm','housing'],

/* ══ CONNECTORS — Other ══ */
'anderson':['powerpole','power connector','high current','battery','אנדרסון'],
'powerpole':['anderson','power connector','high current','30A','45A','75A'],
'xlr':['audio','microphone','connector','3 pin','5 pin','cannon','xlr3','xlr5'],
'd-sub':['db9','db15','db25','db37','serial','parallel','dsub','מחבר D'],
'db9':['d-sub','9 pin','serial','connector','dsub','rs232'],
'db15':['d-sub','15 pin','connector','dsub','vga'],
'db25':['d-sub','25 pin','parallel','connector','dsub'],
'db37':['d-sub','37 pin','connector','dsub'],
'vga':['db15','video','display','connector','15 pin'],
'hdmi':['video','display','connector','audio video'],
'rj45':['ethernet','network','cat5','cat6','lan','connector','8p8c'],
'rj11':['telephone','phone','connector','4 pin','6p4c'],
'bnc':['coax','coaxial','rf','connector','video','50 ohm','75 ohm'],
'sma':['rf','coax','coaxial','antenna','connector','sma male','sma female','2.4ghz'],
'smb':['rf','coax','connector','push-on','antenna'],
'smc':['rf','coax','connector','screw','antenna'],
'tnc':['rf','coax','coaxial','connector','threaded'],
'n-type':['rf','coax','connector','n connector','n male','n female'],
'f-type':['rf','coax','connector','tv','antenna','cable tv'],
'mcx':['rf','coax','connector','mini','antenna'],
'mmcx':['rf','coax','connector','micro mini','antenna'],
'usb':['usb-a','usb-b','usb-c','micro usb','mini usb','connector','usb2','usb3'],
'usb-a':['usb','type-a','connector','host'],'usb-b':['usb','type-b','connector','device'],
'usb-c':['usb','type-c','connector','modern','usb3.1'],'micro-usb':['usb','micro','connector'],
'mini-usb':['usb','mini','connector'],'usb3':['usb','superspeed','blue','connector'],
'lemo':['circular','push-pull','medical','instrument','connector','lemo 00','lemo 0b'],
'hirose':['small','miniature','connector','japanese','hr10','hr30'],
'souriau':['utx','uta','circular','military','connector'],
'glenair':['backshell','military','circular','connector'],
'radiall':['rf','coax','connector','sma','n-type'],
'itt-cannon':['circular','military','connector','cannon','xcd'],
'harting':['han','industrial','rectangular','connector','han 16','han 24'],
'phoenix-contact':['terminal block','industrial','connector','spring','screwless'],
'weidmuller':['terminal block','industrial','connector','spring clamp'],

/* ══ PINS & CONTACTS ══ */
'pin':['פין','מגע','contact','terminal','probe','needle','pin connector'],
'פין':['pin','contact','terminal','מגע','probe'],
'contact':['מגע','פין','terminal','pin','contact element','crimp contact'],
'מגע':['contact','pin','terminal','פין'],
'terminal':['מגע','פין','קצה','lug','contact','terminal block','ring terminal','spade terminal'],
'קצה':['terminal','end','tip','lug','pin'],
'lug':['terminal','lug connector','ring terminal','spade terminal','crimp lug'],
'ring terminal':['lug','ring','terminal','crimp','עגול','eye terminal'],
'spade terminal':['lug','spade','fork','terminal','crimp','blade'],
'butt splice':['splice','joint','לחיצה','crimp','wire joint'],
'splice':['butt splice','joint','חיבור','crimp','inline connector'],
'ferrule':['wire end','ferrule','end sleeve','bootlace','בוש חוט'],
'socket contact':['female contact','socket pin','נקבה מגע'],
'pin contact':['male contact','pin','זכר מגע'],

/* ══ SEALING & WATERPROOFING ══ */
'seal':['איטום','אטם','sealing','gasket','o-ring','waterproof','plug seal','wire seal'],
'sealing':['איטום','seal','waterproof','ip67','ip68','ip69'],
'איטום':['seal','sealing','gasket','o-ring','waterproof','אטם'],
'אטם':['seal','gasket','o-ring','איטום','rubber seal','gasket seal'],
'gasket':['אטם','seal','איטום','o-ring','rubber gasket','face seal'],
'o-ring':['אטם','seal','gasket','rubber','o ring','oring','איטום'],
'waterproof':['עמיד מים','sealed','ip67','ip68','ip69','water resistant','weatherproof'],
'עמיד מים':['waterproof','sealed','ip67','ip68','weatherproof','water resistant'],
'ip67':['waterproof','sealed','עמיד מים','submersible','1 meter'],
'ip68':['waterproof','sealed','עמיד מים','submersible','deep water'],
'ip69':['waterproof','high pressure','wash down','steam clean'],
'ip54':['splash proof','dust resistant','עמיד אבק'],
'ip65':['dust tight','water jet','nema 4','weatherproof'],
'wire seal':['seal','איטום','plug seal','grommet','rubber seal','wire grommet'],
'plug seal':['seal','איטום','dummy','blank','blocker','hole plug'],
'grommet':['אטם','seal','rubber','wire protection','wire grommet','edge grommet'],
'potting':['encapsulation','epoxy','מילוי','waterproof','embedding','casting'],
'cavity plug':['plug seal','dummy','blank','blocker','spare cavity'],

/* ══ LOCKING & RETENTION ══ */
'wedge':['נעילה','wedgelock','lock','נועל','retention','wedge lock'],
'wedgelock':['wedge','נועל','lock','נעילה','retention device','secondary lock'],
'נועל':['wedge','wedgelock','lock','נעילה','retention'],
'נעילה':['lock','locking','wedge','wedgelock','clip','retention','latching','secondary lock'],
'lock':['נעילה','wedge','clip','retention','latch','locking ring'],
'latch':['נעילה','lock','clip','hook','latching mechanism','snap'],
'clip':['קליפס','retention','spring clip','latch','snap clip'],
'קליפס':['clip','spring','retention','latch','snap'],
'backshell':['הגנה','strain relief','back shell','connector protection','cable clamp'],
'strain relief':['הגנה','backshell','cable relief','protection','כבל הגנה'],
'coupling nut':['nut','lock ring','coupling','connector lock','bayonet nut'],
'secondary lock':['wedge','wedgelock','TPA','terminal position assurance'],
'CPA':['connector position assurance','lock','secondary lock','anti vibration'],

/* ══ TOOLS ══ */
'tool':['כלי','כלי עבודה','כלי הכנסה','כלי שליפה','כלי הידוק','hand tool'],
'כלי':['tool','כלי עבודה','instrument','device','כלי יד'],
'כלי עבודה':['tool','hand tool','כלי'],
'crimper':['כלי הידוק','crimp tool','crimping tool','הידוק','ratchet crimper'],
'crimp tool':['crimper','כלי הידוק','הידוק','ratchet'],
'כלי הידוק':['crimper','crimp tool','crimping','הידוק','ratchet crimper'],
'הידוק':['crimp','crimping','crimper','כלי הידוק'],
'crimping':['הידוק','crimp','crimper','terminal attachment','wire termination'],
'insertion tool':['כלי הכנסה','inserter','כלי פין','pin insertion','pin tool'],
'כלי הכנסה':['insertion tool','inserter','pin tool','insertion probe'],
'extraction tool':['כלי שליפה','extractor','removal tool','pin extractor'],
'כלי שליפה':['extraction tool','extractor','removal tool','pin removal'],
'stripper':['כלי הפשטה','wire stripper','קליפן','insulation removal','stripping tool'],
'wire stripper':['stripper','כלי הפשטה','קליפן','insulation removal'],
'כלי הפשטה':['stripper','wire stripper','קליפן','insulation stripper'],
'קליפן':['stripper','wire stripper','כלי הפשטה'],
'torque wrench':['מפתח מומנט','מפתח','wrench','tightening tool','nm wrench'],
'מפתח מומנט':['torque wrench','מפתח','wrench','nm'],
'ratchet':['ראצ\'ט','ratchet wrench','socket wrench','tool'],
'pliers':['צבת','pliers','gripping tool','needle nose','long nose'],
'צבת':['pliers','gripping','tool','כלי','needle nose pliers'],
'heat gun':['מייבש חם','heat gun','shrink tool','shrink tubing tool'],
'מייבש חם':['heat gun','hot air','shrink tool'],
'soldering iron':['מלחם','soldering','iron','solder tool'],
'מלחם':['soldering iron','solder','soldering'],

/* ══ WIRES & CABLES ══ */
'wire':['חוט','כבל','lead','conductor','חוטים','electric wire'],
'חוט':['wire','cable','lead','conductor','כבל'],
'cable':['כבל','חוט','harness','bundle','loom','wire','cable assembly'],
'כבל':['cable','wire','harness','bundle','חוט'],
'harness':['כבל','wiring harness','wire bundle','loom','צרור חוטים','cable harness'],
'wiring harness':['harness','כבל','wire bundle','loom','cable assembly'],
'צרור חוטים':['harness','wire bundle','cable','wiring','cable loom'],
'loom':['harness','sleeve','protection','כבל','wire bundle','braided sleeving'],
'conductor':['מוליך','wire','lead','חוט','electrical conductor'],
'מוליך':['conductor','wire','lead','חוט'],
'awg':['gauge','wire size','עובי חוט','cross section','חתך','american wire gauge'],
'gauge':['awg','wire size','עובי','thickness','cross section'],
'עובי חוט':['awg','gauge','wire size','cross section','mm2'],
'חתך':['cross section','awg','gauge','area','mm²','mm2'],
'mm²':['cross section','awg','gauge','area','square mm'],
'mm2':['cross section','awg','gauge','area','mm²','square mm'],
'18awg':['18 gauge','18awg','0.75mm²','0.75mm2','wire 18'],
'20awg':['20 gauge','20awg','0.5mm²','0.5mm2','wire 20'],
'22awg':['22 gauge','22awg','0.35mm²','0.35mm2','wire 22'],
'24awg':['24 gauge','24awg','0.22mm²','0.22mm2','wire 24'],
'26awg':['26 gauge','26awg','0.14mm²','wire 26'],
'28awg':['28 gauge','28awg','0.08mm²','wire 28'],
'0.5mm':['0.5mm²','20awg','wire size','cross section'],
'0.75mm':['0.75mm²','18awg','wire size','cross section'],
'1mm':['1mm²','17awg','wire size','cross section'],
'1.5mm':['1.5mm²','15awg','16awg','wire size'],
'2.5mm':['2.5mm²','13awg','14awg','wire size'],
'4mm':['4mm²','11awg','12awg','wire size'],
'6mm':['6mm²','10awg','wire size'],
'shielded':['מוגן','shielded cable','מסוכך','electromagnetic','emi','rfi','screened'],
'מסוכך':['shielded','shielded cable','מוגן','emi','rfi','screened cable'],
'screened':['shielded','מסוכך','emi','screened cable'],
'coaxial':['coax','קואקסיאל','rf','shielded','bnc','sma','rg'],
'קואקסיאל':['coaxial','coax','rf','shielded','קואקסיאל'],
'coax':['coaxial','rf cable','bnc','sma','rg58','rg174','rg316'],
'rg58':['coax','50 ohm','coaxial','antenna cable'],
'rg174':['coax','50 ohm','thin','coaxial'],'rg316':['coax','50 ohm','ptfe','coaxial'],
'twisted pair':['זוג שזור','twisted','differential','ethernet','cat5','cat6'],
'זוג שזור':['twisted pair','twisted','differential','ethernet'],
'ptfe':['teflon','טפלון','wire insulation','high temp','fluoropolymer','m27500'],
'teflon':['ptfe','טפלון','insulation','high temp','fluoropolymer'],
'טפלון':['ptfe','teflon','insulation','high temperature'],
'silicone':['סיליקון','flexible','high temp','insulation','silicone wire'],
'סיליקון':['silicone','flexible','insulation','גמיש'],
'pvc':['pvc insulation','plastic','wire coating','insulation','vinyl'],
'kapton':['polyimide','high temp','flexible','insulation','aerospace','du pont'],
'tefzel':['etfe','wire insulation','aerospace','m22759'],
'xlpe':['cross linked','xlpe','wire insulation','high voltage'],
'spec44':['spec 44','raychem','wire','aerospace','m22759'],
'm22759':['spec44','mil-w','aerospace wire','ptfe','tefzel'],
'm27500':['shielded cable','mil-c','aerospace','shielded'],
'raychem':['spec44','wire','aerospace','heat shrink'],

/* ══ HEAT SHRINK ══ */
'heat shrink':['גלישה חום','shrink tubing','כיווץ חום','shrink tube','heat tube'],
'גלישה חום':['heat shrink','shrink tubing','כיווץ חום'],
'shrink tubing':['heat shrink','גלישה חום','כיווץ חום','tubing'],
'כיווץ חום':['heat shrink','shrink tubing','גלישה חום'],
'2:1':['heat shrink','shrink ratio','2:1 ratio'],
'3:1':['heat shrink','shrink ratio','3:1 ratio','adhesive lined'],
'4:1':['heat shrink','shrink ratio','4:1 ratio','heavy wall'],
'adhesive':['דבק','glue','adhesive lined','bonded','epoxy'],
'dual wall':['adhesive lined','heat shrink','3:1','4:1','waterproof shrink'],

/* ══ EMI & SHIELDING ══ */
'emi':['electromagnetic interference','הגנה','shielding','מסוכך','rfi','emcd'],
'rfi':['radio frequency interference','emi','shielding','הגנה'],
'shielding':['מסוכך','shield','emi','rfi','הגנה אלקטרומגנטית','screening'],
'shield':['מגן','shielding','emi','protective','ground plane'],
'ferrite':['פריט','emi filter','choke','noise suppression','bead','ferrite bead'],
'filter':['מסנן','emi','noise','ferrite','suppressor'],
'מסנן':['filter','emi','noise','suppression','ferrite'],
'bonding':['bonding strap','ground','אדמה','electrical bonding','earth bonding'],
'grounding':['אדמה','ground','bonding','gnd','earth','earthing'],
'drain wire':['שיט','drain','shield ground','emi','coax shield'],
'braid':['mesh','shielding','braided','copper braid','שיט'],

/* ══ ELECTRONICS ══ */
'resistor':['נגד','resistance','ohm','R','נגד חשמלי','fixed resistor'],
'נגד':['resistor','resistance','ohm','R','potentiometer'],
'capacitor':['קבל','capacitance','farad','C','אלקטרוליטי','cap'],
'קבל':['capacitor','capacitance','farad','C','electrolytic'],
'inductor':['סליל','inductance','henry','L','coil','choke'],
'סליל':['inductor','coil','inductance','henry','L','choke coil'],
'diode':['דיודה','rectifier','zener','schottky','LED','TVS'],
'דיודה':['diode','rectifier','LED','zener','schottky'],
'transistor':['טרנזיסטור','transistor','bjt','mosfet','switch','FET'],
'טרנזיסטור':['transistor','bjt','mosfet','switch','FET'],
'relay':['ממסר','relay','switch','coil','contact','solid state relay'],
'ממסר':['relay','switch','coil','contact','power relay'],
'fuse':['פיוז','fuse','protection','overcurrent','circuit breaker','slow blow','fast blow'],
'פיוז':['fuse','protection','overcurrent','blow fuse','slow blow'],
'circuit breaker':['מפסק','breaker','protection','fuse','MCB','thermal breaker'],
'מפסק':['circuit breaker','breaker','switch','relay','MCB'],
'switch':['מתג','switch','toggle','button','relay','SPST','SPDT','DPDT'],
'מתג':['switch','toggle','button','relay','SPDT','DPST'],
'pcb':['לוח','printed circuit board','circuit board','board','PWB'],
'לוח':['pcb','board','circuit board','printed circuit','PCB assembly'],
'ic':['chip','integrated circuit','microchip','שבב','IC chip'],
'chip':['ic','שבב','integrated circuit','microchip','component'],
'שבב':['chip','ic','integrated circuit','microchip'],
'sensor':['חיישן','detector','transducer','probe','sensing'],
'חיישן':['sensor','detector','transducer','sensing element'],
'actuator':['מפעיל','solenoid','motor','servo','driver'],
'מפעיל':['actuator','solenoid','motor','driver'],
'solenoid':['סולנואיד','actuator','coil','valve','electromagnet'],
'סולנואיד':['solenoid','coil','actuator','valve','electromagnet'],
'LED':['נורית','light','diode','indicator','LED lamp'],
'נורית':['LED','indicator','lamp','light','pilot light'],
'transformer':['שנאי','transformer','power','isolation','step up','step down'],
'שנאי':['transformer','power transformer','isolation'],
'voltage regulator':['מייצב מתח','regulator','LDO','7805','78xx'],
'מייצב מתח':['voltage regulator','LDO','regulator','stabilizer'],
'oscillator':['מתנד','crystal','oscillator','clock','quartz'],
'מתנד':['oscillator','crystal','clock','quartz oscillator'],
'crystal':['קריסטל','quartz','oscillator','clock crystal','xtal'],

/* ══ POWER ══ */
'voltage':['מתח','volts','vdc','vac','v','electrical potential','volt'],
'מתח':['voltage','volts','vdc','vac','v','power','volt'],
'current':['זרם','ampere','amps','amp','a','electrical current','amperage'],
'זרם':['current','ampere','amps','amp','a','amperage'],
'power':['כוח','מתח','watt','power supply','supply','הספק','electrical power'],
'כוח':['power','watt','הספק','supply','voltage','current','energy'],
'הספק':['power','watt','kw','energy','output power'],
'ground':['אדמה','gnd','grounding','earth','mass','reference'],
'אדמה':['ground','gnd','grounding','earth','reference ground'],
'gnd':['ground','אדמה','grounding','earth','mass'],
'vdc':['dc voltage','voltage','מתח','direct current','dc power'],
'vac':['ac voltage','voltage','מתח','alternating current','ac power'],
'dc':['direct current','vdc','מתח','voltage','battery','DC power'],
'ac':['alternating current','vac','מתח','voltage','mains','AC power'],
'28v':['28 volt','28vdc','aircraft power','military power'],
'28vdc':['28v','aircraft','military','dc power','avionics power'],
'5v':['5 volt','5vdc','usb power','logic power','TTL'],
'12v':['12 volt','12vdc','automotive','car power','lead acid'],
'24v':['24 volt','24vdc','industrial','plc','automation'],
'48v':['48 volt','48vdc','POE','telecom'],
'115v':['115 volt','115vac','ac power','aircraft ac','avionics'],
'220v':['220 volt','220vac','mains','ac power','domestic'],
'400hz':['400 hz','aircraft power','avionics power','military ac'],
'ampere':['זרם','current','amp','amps','A','amperage'],
'amp':['ampere','זרם','current','amps'],
'ohm':['אום','resistance','impedance','R','ohms'],
'watt':['ואט','power','energy','הספק','W'],
'impedance':['עכבה','impedance','ohm','resistance','Z'],
'עכבה':['impedance','ohm','resistance','Z'],
'psu':['power supply','ספק כוח','power','supply unit','SMPS'],
'ספק כוח':['power supply','psu','power','supply'],

/* ══ MECHANICAL ══ */
'bracket':['מדף','bracket','mount','mounting','holder','תומך','support bracket'],
'מדף':['bracket','shelf','mount','holder','support','shelf bracket'],
'mount':['הרכבה','mounting','bracket','fixture','מדף','mounting plate'],
'הרכבה':['mount','mounting','assembly','installation','fitting'],
'screw':['בורג','fastener','bolt','thread','screw bolt'],
'בורג':['screw','bolt','fastener','thread','machine screw'],
'bolt':['בורג','screw','fastener','nut','hex bolt'],
'nut':['אום','nut','fastener','hex','hex nut'],
'אום':['nut','hex nut','coupling','fastener','בורג'],
'washer':['גרוזיה','washer','flat washer','lock washer','spring washer'],
'גרוזיה':['washer','flat washer','gasket','lock washer'],
'rivet':['ריבט','fastener','pop rivet','blind rivet','cherry rivet'],
'ריבט':['rivet','fastener','pop rivet','blind rivet'],
'clamp':['מהדק','clamp','clip','strap','cable clamp'],
'מהדק':['clamp','clip','strap','fastener','cable clamp'],
'cable tie':['קשריון','tie wrap','zip tie','ty-wrap','nylon tie'],
'קשריון':['cable tie','tie wrap','zip tie','ty-wrap','nylon strap'],
'tie wrap':['קשריון','cable tie','zip tie','ty-wrap'],
'zip tie':['קשריון','cable tie','tie wrap','nylon tie'],
'bearing':['מסב','bearing','roller','ball bearing','sleeve bearing'],
'מסב':['bearing','roller bearing','ball bearing','plain bearing'],
'bushing':['שרוול','bushing','sleeve','liner','plain bearing'],
'spring':['קפיץ','spring','elastic','tension','compression spring'],
'קפיץ':['spring','elastic','tension','coil spring','compression'],
'hinge':['ציר','hinge','pivot','joint','door hinge'],
'ציר':['hinge','axis','pivot','shaft','axle'],
'flange':['פלנג','flange','collar','rim','mounting flange'],
'פלנג':['flange','collar','rim','fitting','pipe flange'],
'fitting':['מחבר','fitting','connector','pipe fitting','union','elbow','tee'],
'union':['חיבור','union','fitting','connector','pipe union'],
'elbow':['מרפק','elbow','90 degree','bend','fitting','L fitting'],
'מרפק':['elbow','90 degree','bend','fitting','L-shaped'],
'tee':['T-fitting','tee','branch','three-way','T connector'],
'panel':['פנל','panel','plate','chassis','mounting panel'],
'פנל':['panel','plate','chassis','front panel'],
'chassis':['שלדה','chassis','frame','enclosure','housing'],
'שלדה':['chassis','frame','enclosure','structure'],
'rack':['מדף רכבה','rack','19 inch','equipment rack','DIN rail'],
'din rail':['din','rail','mounting rail','35mm','omega rail'],

/* ══ AVIONICS & MILITARY ══ */
'avionics':['אוויוניקה','aviation electronics','aircraft','flight systems'],
'אוויוניקה':['avionics','aviation','aircraft','flight','aerospace'],
'aircraft':['מטוס','aviation','avionics','aerospace','aerial','airplane'],
'מטוס':['aircraft','aviation','airplane','aerospace','jet'],
'aerospace':['אוויוניקה','aviation','space','military','aircraft','aero'],
'mil-spec':['military','מפרט צבאי','mil-dtl','mil-std','circular','MS'],
'מפרט צבאי':['mil-spec','military standard','mil-std','spec'],
'mil-std':['military standard','mil-spec','MIL-STD','standard'],
'do-160':['do160','aviation standard','environmental','RTCA','test standard'],
'arinc':['avionics','bus','standard','arinc 429','arinc 629','arinc 664'],
'arinc 429':['arinc429','avionics','data bus','aircraft','label'],
'can bus':['canbus','can','vehicle bus','j1939','automotive bus','SAE'],
'j1939':['can bus','truck','heavy vehicle','SAE J1939'],
'rs-232':['serial','uart','com port','interface','db9'],
'rs-485':['serial','differential','industrial','modbus','interface'],
'rs-422':['serial','differential','avionics','data bus'],
'milcan':['can bus','military','avionics','vehicle'],
'ethernet':['rj45','lan','network','tcp/ip','100base','gigabit'],
'fiber optic':['סיב אופטי','optical fiber','fiber','FOC','fibre'],
'סיב אופטי':['fiber optic','optical','light','fiber','FOC'],
'lru':['line replaceable unit','avionics box','unit','module','black box'],
'antenna':['אנטנה','aerial','rf','transmit','receive','aerial'],
'אנטנה':['antenna','aerial','rf','transmit','receiver'],
'transponder':['מענה','transponder','squawk','aircraft','iff','atc'],
'pitot':['pitot tube','air speed','pressure','sensor','airspeed'],
'hydraulic':['הידראולי','fluid','pressure','pump','hydraulic line'],
'הידראולי':['hydraulic','fluid','pressure','pump','hydraulic system'],
'pneumatic':['פניאומטי','air','pressure','air system','compressed air'],
'פניאומטי':['pneumatic','air pressure','compressed air','air system'],
'iff':['identification','friend','foe','transponder','military','interrogator'],
'atc':['air traffic','transponder','aviation','radar'],
'tcas':['collision avoidance','traffic alert','aviation','safety'],
'gpws':['ground proximity','warning','aviation','safety'],
'fddr':['flight data recorder','black box','avionics'],
'cvr':['cockpit voice recorder','black box','aviation'],

/* ══ MATERIALS ══ */
'aluminum':['אלומיניום','aluminium','al','metal','light','alloy'],
'אלומיניום':['aluminum','aluminium','al','metal','light metal'],
'stainless':['אל חלד','stainless steel','ss','corrosion resistant','304','316'],
'אל חלד':['stainless','stainless steel','ss','rust proof','corrosion free'],
'steel':['פלדה','steel','iron','metal','stainless','carbon steel'],
'פלדה':['steel','iron','metal','carbon steel'],
'titanium':['טיטניום','ti','light','strong','aerospace','grade 5'],
'טיטניום':['titanium','ti','light metal','aerospace material'],
'copper':['נחושת','copper','cu','conductor','electrical conductor'],
'נחושת':['copper','cu','conductor','metal','electrical'],
'brass':['פליז','brass','copper alloy','yellow metal'],
'פליז':['brass','copper alloy','yellow metal','CuZn'],
'rubber':['גומי','rubber','elastomer','seal','flexible','EPDM','Neoprene'],
'גומי':['rubber','elastomer','seal','flexible','synthetic rubber'],
'nylon':['ניילון','nylon','plastic','polyamide','PA66','PA6'],
'ניילון':['nylon','polyamide','plastic','PA66'],
'polyurethane':['פוליאוריטן','pu','flexible','coating','PU'],
'epoxy':['אפוקסי','resin','adhesive','potting','glue','two-part'],
'אפוקסי':['epoxy','resin','adhesive','glue','two-component'],
'peek':['peek','high performance','plastic','aerospace','high temp plastic'],
'delrin':['acetal','delrin','pom','plastic','engineering plastic'],
'ultem':['PEI','high temp','plastic','amber','engineering plastic'],
'inconel':['nickel alloy','high temp','aerospace','superalloy'],
'kovar':['sealing','glass to metal','electronic packaging'],
'gold':['זהב','gold plated','Au','plating','contact plating'],
'זהב':['gold','gold plated','Au','plating'],
'silver':['כסף','silver plated','Ag','plating','conductive'],
'nickel':['ניקל','nickel plated','Ni','plating','corrosion'],
'tin':['בדיל','tin plated','Sn','plating','solder'],

/* ══ STANDARDS ══ */
'rohs':['lead free','environmental','compliance','directive','EU directive'],
'ce':['european','compliance','certification','EU mark'],
'ul':['ul listed','safety','certification','underwriters','UL94'],
'itar':['export control','military','restricted','US export'],
'as9100':['aerospace quality','quality management','aviation quality'],
'iso9001':['quality','ISO','quality system','certification'],
'nadcap':['aerospace','special process','certification','heat treat'],
'sae':['automotive','standard','aerospace','SAE international'],
'iso':['standard','international','quality','ISO standard'],
'ansi':['american','standard','national','ANSI standard'],
'iec':['international','electrotechnical','IEC standard','electrical'],
'nema':['enclosure','rating','IP rating','US standard'],
'rtca':['do-160','aviation','standard','FAA','testing'],

/* ══ COLORS ══ */
'grey':['gray','אפור','silver','light grey','dark grey','slate'],
'gray':['grey','אפור','silver','light gray','dark gray'],
'אפור':['grey','gray','silver','charcoal'],
'black':['שחור','noir','dark','BLK'],
'שחור':['black','dark','noir','BLK'],
'white':['לבן','blanc','WHT','ivory'],
'לבן':['white','ivory','WHT','off-white'],
'red':['אדום','rouge','RED'],
'אדום':['red','rouge','RED'],
'blue':['כחול','bleu','BLU'],
'כחול':['blue','bleu','BLU','navy'],
'green':['ירוק','GRN','lime'],
'ירוק':['green','GRN','lime green'],
'yellow':['צהוב','YEL','amber','gold'],
'צהוב':['yellow','YEL','amber'],
'orange':['כתום','ORG','amber'],
'כתום':['orange','ORG'],
'brown':['חום','BRN'],
'חום':['brown','BRN','tan'],
'violet':['סגול','purple','VIO'],
'סגול':['violet','purple','VIO'],
'pink':['ורוד','PNK'],
'ורוד':['pink','PNK','rose'],
'silver':['כסוף','silver grey','metallic','אפור'],
'כסוף':['silver','metallic','silver grey'],
'natural':['טבעי','natural color','translucent','clear'],
'transparent':['שקוף','clear','transparent','translucent'],
'שקוף':['transparent','clear','translucent'],

/* ══ DIMENSIONS ══ */
'2 pin':['2p','2 way','2 position','dual','2-pin'],
'3 pin':['3p','3 way','3 position','triple','3-pin'],
'4 pin':['4p','4 way','4 position','quad','4-pin'],
'6 pin':['6p','6 way','6 position','6-pin'],
'8 pin':['8p','8 way','8 position','8-pin'],
'9 pin':['9p','9 way','db9','9-pin'],
'12 pin':['12p','12 way','12 position','12-pin'],
'16 pin':['16p','16 way','16 position','16-pin'],
'24 pin':['24p','24 way','24 position','24-pin'],
'2p':['2 pin','2 way','2 position'],'3p':['3 pin','3 way','3 position'],
'4p':['4 pin','4 way','4 position'],'6p':['6 pin','6 way','6 position'],
'8p':['8 pin','8 way','8 position'],'12p':['12 pin','12 way','12 position'],
'4s':['4 socket','4 pin female','4 way socket'],
'6s':['6 socket','6 pin female','6 way socket'],

/* ══ PROCESS ══ */
'install':['התקנה','הרכבה','install','assembly','mount','mounting'],
'התקנה':['install','assembly','mounting','הרכבה','installation'],
'assembly':['הרכבה','assembly','kit','installation','build'],
'הרכבה':['assembly','installation','install','mount','assy'],
'repair':['תיקון','repair','fix','maintenance','rework','refurbish'],
'תיקון':['repair','fix','maintenance','rework'],
'maintenance':['תחזוקה','maintenance','service','upkeep','overhaul'],
'תחזוקה':['maintenance','service','repair','overhaul','PM'],
'inspection':['בדיקה','inspection','check','verify','QA','QC'],
'בדיקה':['test','inspection','check','verify','testing'],
'test':['בדיקה','test','inspection','check','verify','testing'],
'torque':['מומנט','torque','tightening','nm','ft-lb','in-lb'],
'מומנט':['torque','tightening','nm','force','torque spec'],
'calibration':['כיול','calibration','cal','adjustment','tuning'],
'כיול':['calibration','cal','adjustment'],

/* ══ CHARACTERISTICS ══ */
'high temperature':['טמפרטורה גבוהה','high temp','heat resistant','high heat'],
'טמפרטורה גבוהה':['high temperature','high temp','heat','thermal'],
'vibration':['רטט','vibration','shock','mechanical stress','vibration resistant'],
'רטט':['vibration','shock','vibration resistant','anti-vibration'],
'flexible':['גמיש','flexible','flex','bending','pliable'],
'גמיש':['flexible','flex','soft','bending','pliable'],
'rigid':['נוקשה','rigid','stiff','hard','inflexible'],
'compact':['קומפקטי','compact','small','miniature','tiny','low profile'],
'lightweight':['קל משקל','light','lightweight','low weight','low mass'],
'קל משקל':['lightweight','light','low mass','light weight'],
'miniature':['מיניאטורי','mini','small','compact','tiny','micro'],
'מיניאטורי':['miniature','mini','micro','small','compact'],
'heavy duty':['עמיד','robust','rugged','industrial','heavy','כבד'],
'rugged':['עמיד','rugged','robust','military grade','heavy duty','harsh'],
'עמיד':['rugged','robust','heavy duty','durable','reliable'],
'high current':['זרם גבוה','high amperage','power connector','heavy current'],
'זרם גבוה':['high current','high amperage','power','heavy duty'],
'high voltage':['מתח גבוה','HV','high volt'],
'מתח גבוה':['high voltage','HV'],
'low profile':['שטוח','low profile','flat','slim','thin connector'],
'שטוח':['low profile','flat','slim','thin'],
'surface mount':['SMD','SMT','surface mount','chip component'],
'through hole':['through hole','DIP','PCB through','axial'],
};

function dazuraExpand(query){
  const tokens=String(query||'').toLowerCase()
    .replace(/[^\w\u0590-\u05ff\s]/g,' ')
    .split(/\s+/).filter(w=>w.length>1);
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
  expanded.forEach(term=>{
    if(term.length<2)return;
    if(text.includes(term))score+=Math.min(40,term.length*4);
  });
  return Math.min(score,100);
}

if(typeof window!=='undefined')window._dazuraSemanticsLoaded=true;

/* ═══════════════════════════════════════════════════════════════════
   DAZURA PARAMETRIC ENGINE — dazura_semantics.js
   ─────────────────────────────────────────────────────────────────
   מנוע פרמטרי: AWG↔OD, בחירת shrink tube, כלים, חוטים
   ─────────────────────────────────────────────────────────────────
   שימוש: כשמוסיפים פריט ל-BOM עם params (awg, voltage, insulation)
   המערכת מחשבת ומציעה את הרכיבים התואמים אוטומטית
═══════════════════════════════════════════════════════════════════ */

/* ══ AWG ↔ Physical Properties Table ══ */
const DAZURA_AWG = {
  // awg: { od_mm (outer diameter with insulation PVC), od_ptfe, od_silicone,
  //        area_mm2, max_A_chassis, max_A_bundle, max_V }
  '30': { od_pvc:1.0, od_ptfe:0.9,  od_sil:1.1, area:0.05, A_chassis:0.86, A_bundle:0.5  },
  '28': { od_pvc:1.1, od_ptfe:1.0,  od_sil:1.2, area:0.08, A_chassis:0.96, A_bundle:0.7  },
  '26': { od_pvc:1.3, od_ptfe:1.1,  od_sil:1.4, area:0.13, A_chassis:1.36, A_bundle:1.0  },
  '24': { od_pvc:1.5, od_ptfe:1.3,  od_sil:1.6, area:0.20, A_chassis:2.1,  A_bundle:1.5  },
  '22': { od_pvc:1.7, od_ptfe:1.5,  od_sil:1.9, area:0.33, A_chassis:3.0,  A_bundle:2.1  },
  '20': { od_pvc:2.0, od_ptfe:1.8,  od_sil:2.2, area:0.50, A_chassis:4.0,  A_bundle:2.8  },
  '18': { od_pvc:2.3, od_ptfe:2.0,  od_sil:2.6, area:0.75, A_chassis:6.0,  A_bundle:4.0  },
  '16': { od_pvc:2.6, od_ptfe:2.3,  od_sil:2.9, area:1.31, A_chassis:9.0,  A_bundle:6.0  },
  '14': { od_pvc:3.0, od_ptfe:2.7,  od_sil:3.3, area:2.08, A_chassis:13.0, A_bundle:9.0  },
  '12': { od_pvc:3.6, od_ptfe:3.2,  od_sil:4.0, area:3.31, A_chassis:18.0, A_bundle:13.0 },
  '10': { od_pvc:4.2, od_ptfe:3.8,  od_sil:4.7, area:5.26, A_chassis:24.0, A_bundle:17.0 },
  '8':  { od_pvc:5.0, od_ptfe:4.5,  od_sil:5.5, area:8.37, A_chassis:32.0, A_bundle:23.0 },
  '6':  { od_pvc:6.0, od_ptfe:5.5,  od_sil:6.5, area:13.3, A_chassis:41.0, A_bundle:29.0 },
  '4':  { od_pvc:7.2, od_ptfe:6.5,  od_sil:8.0, area:21.1, A_chassis:55.0, A_bundle:38.0 },
  '2':  { od_pvc:8.6, od_ptfe:7.8,  od_sil:9.5, area:33.6, A_chassis:70.0, A_bundle:49.0 },
};

/* ══ mm² ↔ AWG mapping ══ */
const DAZURA_MM2_TO_AWG = {
  '0.05':'30','0.08':'28','0.13':'26','0.20':'24','0.22':'24',
  '0.33':'22','0.35':'22','0.50':'20','0.75':'18','1.0':'17',
  '1.31':'16','1.5':'16','2.08':'14','2.5':'13','3.31':'12',
  '4.0':'12','5.26':'10','6.0':'9','8.37':'8','10.0':'7',
  '13.3':'6','16.0':'5','21.1':'4','25.0':'3','33.6':'2',
};

/* ══ Shrink Tube Selector ══
   Input: od_mm (outer diameter of wire/bundle), ratio (2:1 or 3:1), temp
   Returns: recommended shrink tube size
*/
const DAZURA_SHRINK = {
  // Standard 2:1 RSFR-H series (Raychem / equivalent)
  // expanded_id → { fits_od_min, fits_od_max, recovered_id, part_suffix }
  sizes_2to1: [
    { id:'3/32"', id_mm:2.4,  min:0.8,  max:1.2, rec_mm:1.2,  suffix:'3/32' },
    { id:'1/8"',  id_mm:3.2,  min:1.0,  max:1.6, rec_mm:1.6,  suffix:'H' },  // 1/8
    { id:'3/16"', id_mm:4.8,  min:1.5,  max:2.4, rec_mm:2.4,  suffix:'3/16' },
    { id:'1/4"',  id_mm:6.4,  min:2.0,  max:3.2, rec_mm:3.2,  suffix:'1/4' },
    { id:'3/8"',  id_mm:9.5,  min:3.0,  max:4.8, rec_mm:4.8,  suffix:'3/8' },
    { id:'1/2"',  id_mm:12.7, min:4.0,  max:6.4, rec_mm:6.4,  suffix:'1/2' },
    { id:'3/4"',  id_mm:19.1, min:6.0,  max:9.5, rec_mm:9.5,  suffix:'3/4' },
    { id:'1"',    id_mm:25.4, min:8.0,  max:12.7,rec_mm:12.7, suffix:'1' },
  ],
  // 3:1 adhesive lined (waterproof)
  sizes_3to1: [
    { id:'3/16"', id_mm:4.8,  min:1.0,  max:1.6, suffix:'3/16-3X' },
    { id:'1/4"',  id_mm:6.4,  min:1.3,  max:2.1, suffix:'1/4-3X'  },
    { id:'3/8"',  id_mm:9.5,  min:2.0,  max:3.2, suffix:'3/8-3X'  },
    { id:'1/2"',  id_mm:12.7, min:2.7,  max:4.2, suffix:'1/2-3X'  },
    { id:'3/4"',  id_mm:19.1, min:4.0,  max:6.4, suffix:'3/4-3X'  },
    { id:'1"',    id_mm:25.4, min:5.3,  max:8.5, suffix:'1-3X'    },
  ],
};

/* ══ Connector → Wire Range Table ══
   Maps connector series to compatible wire ranges
*/
const DAZURA_CONN_WIRE = {
  // Deutsch DTM — 20-16AWG
  'DTM': { awg_min:16, awg_max:20, note:'Deutsch DTM series' },
  'DT':  { awg_min:12, awg_max:20, note:'Deutsch DT series' },
  'DTP': { awg_min:10, awg_max:14, note:'Deutsch DTP power' },
  // TE Superseal
  'SUPERSEAL': { awg_min:16, awg_max:20, note:'TE Superseal 1.5mm' },
  // Mil-spec MS
  'MS27': { awg_min:20, awg_max:26, note:'MIL-DTL-38999 contacts' },
  'MS36': { awg_min:16, awg_max:22, note:'MS circular' },
  // Anderson Powerpole
  'APP15':  { awg_min:14, awg_max:18, note:'Anderson 15A' },
  'APP30':  { awg_min:12, awg_max:16, note:'Anderson 30A' },
  'APP45':  { awg_min:10, awg_max:14, note:'Anderson 45A' },
  // JST
  'PH':  { awg_min:24, awg_max:28, note:'JST PH 2.0mm' },
  'XH':  { awg_min:22, awg_max:26, note:'JST XH 2.5mm' },
  'VH':  { awg_min:18, awg_max:22, note:'JST VH 3.96mm' },
  // Molex Mini-Fit
  'MINIFIT': { awg_min:14, awg_max:22, note:'Molex Mini-Fit Jr' },
};

/* ══ Voltage Derating Table ══ */
const DAZURA_VOLTAGE = {
  // insulation type → max voltage
  'PVC_300V':  { max_v:300,  temp_c:80,  standard:'UL' },
  'PVC_600V':  { max_v:600,  temp_c:80,  standard:'UL' },
  'PTFE_600V': { max_v:600,  temp_c:200, standard:'MIL' },
  'PTFE_1000V':{ max_v:1000, temp_c:200, standard:'MIL' },
  'SILICONE':  { max_v:600,  temp_c:150, standard:'UL' },
  'XLPE':      { max_v:600,  temp_c:90,  standard:'UL' },
};

/* ══ PARAMETRIC RECOMMENDATION ENGINE ══ */
const DAZURA_PARAMS = {

  /* Get wire OD given AWG and insulation type */
  wireOD(awg, insulation='pvc') {
    const row = DAZURA_AWG[String(awg)];
    if(!row) return null;
    const key = insulation.toLowerCase().includes('ptfe') || insulation.toLowerCase().includes('teflon')
      ? 'od_ptfe'
      : insulation.toLowerCase().includes('sil') ? 'od_sil' : 'od_pvc';
    return row[key];
  },

  /* Convert mm² to AWG */
  mm2toAWG(mm2) {
    const key = String(parseFloat(mm2).toFixed(2));
    return DAZURA_MM2_TO_AWG[key] || null;
  },

  /* Select correct shrink tube size for a wire/bundle */
  selectShrink(od_mm, ratio='2:1', waterproof=false) {
    const table = (ratio==='3:1' || waterproof)
      ? DAZURA_SHRINK.sizes_3to1
      : DAZURA_SHRINK.sizes_2to1;
    // Find smallest size that fits (od_mm × 1.1 safety factor inside expanded ID)
    const target = od_mm * 1.1;
    const match = table.find(s => target <= s.id_mm * 0.8); // recovered must grip
    return match || table[table.length-1];
  },

  /* Given a connector part number prefix, get compatible AWG range */
  connectorWireRange(partNum) {
    const k = String(partNum).toUpperCase();
    for(const [prefix, data] of Object.entries(DAZURA_CONN_WIRE)) {
      if(k.startsWith(prefix) || k.includes(prefix)) return data;
    }
    return null;
  },

  /* MAIN RECOMMENDATION: given a base item + params, suggest compatible accessories */
  recommend(baseItem, params={}) {
    // params: { awg, mm2, insulation, voltage, od_mm, waterproof, bundle_od }
    const suggestions = [];
    const warnings    = [];

    // Resolve AWG from mm2 if needed
    let awg = params.awg ? String(params.awg) : null;
    if(!awg && params.mm2) awg = this.mm2toAWG(params.mm2);

    // Get wire OD
    const insType = params.insulation || 'pvc';
    let od = params.od_mm || (awg ? this.wireOD(awg, insType) : null);

    // If bundle, use bundle OD instead
    if(params.bundle_od) od = params.bundle_od;

    const awgData = awg ? DAZURA_AWG[awg] : null;

    // ── Shrink tube recommendations ──
    if(od && baseItem) {
      const bk = baseItem.k ? baseItem.k.toUpperCase() : '';
      const bv = (baseItem.v||'').toUpperCase();
      const isShrinkParent = bk.includes('RSFR') || bk.includes('SHRINK') ||
                             bv.includes('SHRINK') || bv.includes('גלישה');

      if(isShrinkParent || (baseItem.acc||[]).some(a=>a.toUpperCase().includes('RSFR'))) {
        const ratio = params.waterproof ? '3:1' : '2:1';
        const sz = this.selectShrink(od, ratio, params.waterproof);
        if(sz) {
          suggestions.push({
            type: 'shrink',
            label: `Shrink Tube ${sz.id} (${ratio})`,
            reason: `${awg ? awg+'AWG' : od+'mm OD'} → fits ${sz.min}–${sz.id_mm*0.8}mm expanded`,
            searchFor: `RSFR ${sz.suffix}`,
            params: { size: sz.id, ratio, od_mm: od },
          });
          if(params.waterproof) {
            suggestions.push({
              type: 'shrink_adhesive',
              label: `Adhesive-Lined Shrink ${sz.id} (3:1)`,
              reason: 'Waterproof/sealed application',
              searchFor: `RSFR ${sz.suffix} adhesive`,
            });
          }
        }
      }

      // ── Crimp tool recommendation by AWG ──
      if(awgData && (baseItem.req||[]).length > 0) {
        if(parseInt(awg) >= 20) suggestions.push({ type:'tool', label:'Crimp tool — small wire 20-28AWG', searchFor:'crimp 20awg' });
        else if(parseInt(awg) >= 14) suggestions.push({ type:'tool', label:'Crimp tool — medium 14-18AWG', searchFor:'crimp 14awg' });
        else suggestions.push({ type:'tool', label:'Crimp tool — heavy 8-12AWG', searchFor:'crimp 8awg' });
      }
    }

    // ── Connector–Wire compatibility check ──
    if(awg) {
      const range = this.connectorWireRange(baseItem.k||'');
      if(range) {
        const awgN = parseInt(awg);
        if(awgN < range.awg_max || awgN > range.awg_min) {
          // All good (lower AWG number = thicker wire)
          suggestions.push({
            type: 'compat',
            label: `✅ ${baseItem.k} תואם ${awg}AWG`,
            reason: `טווח מאושר: ${range.awg_max}–${range.awg_min} AWG`,
          });
        } else {
          warnings.push(`⚠️ ${baseItem.k} מיועד ל-${range.awg_max}–${range.awg_min}AWG — ${awg}AWG לא בטווח!`);
        }
      }
    }

    // ── Voltage insulation check ──
    if(params.voltage && awgData) {
      const v = parseInt(params.voltage);
      if(insType.includes('pvc') && v > 300 && !insType.includes('600')) {
        warnings.push(`⚠️ PVC 300V — לא מתאים ל-${v}V! השתמש ב-PVC 600V או PTFE`);
        suggestions.push({ type:'upgrade', label:'שדרג לבידוד PVC 600V', searchFor:'pvc 600v wire '+awg+'awg' });
      }
      if(v > 600 && !insType.includes('ptfe')) {
        warnings.push(`⚠️ מתח ${v}V דורש PTFE/XLPE — לא PVC!`);
        suggestions.push({ type:'upgrade', label:'שדרג לבידוד PTFE', searchFor:'ptfe wire '+awg+'awg' });
      }
    }

    // ── Current capacity check ──
    if(awgData && params.current) {
      const A = parseFloat(params.current);
      if(A > awgData.A_bundle) {
        warnings.push(`⚠️ ${awg}AWG — זרם מקסימלי בצרור: ${awgData.A_bundle}A, נדרש: ${A}A`);
        // Find bigger wire
        const bigger = Object.entries(DAZURA_AWG)
          .filter(([g,d])=>parseInt(g)<parseInt(awg)&&d.A_bundle>=A)
          .sort((a,b)=>parseInt(b[0])-parseInt(a[0]))[0];
        if(bigger) suggestions.push({ type:'upsize', label:`שדרג ל-${bigger[0]}AWG (${bigger[1].A_bundle}A)`, searchFor:`wire ${bigger[0]}awg` });
      } else if(A > awgData.A_chassis) {
        warnings.push(`⚠️ ${awg}AWG — זרם מקסימלי חופשי: ${awgData.A_chassis}A (בצרור: ${awgData.A_bundle}A)`);
      }
    }

    return { suggestions, warnings, awg, od, awgData };
  }
};

/* ══ BOM PARAM DIALOG ══
   Called when adding an item to BOM that has parametric accessories
   Shows a small dialog asking for AWG/voltage/insulation
   Returns promise resolving to params object
*/
function dazuraParamDialog(item) {
  return new Promise(resolve => {
    // Check if item or its accessories need parametric input
    const needsParams = (item.acc||[]).some(a => {
      const al = a.toLowerCase();
      return al.includes('rsfr') || al.includes('shrink') || al.includes('tube');
    }) || (item.req||[]).length > 0;

    if(!needsParams) { resolve({}); return; }

    // Build dialog HTML
    const dlg = document.createElement('div');
    dlg.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9990;display:flex;align-items:center;justify-content:center;';
    dlg.innerHTML = `
      <div style="background:var(--card);border-radius:12px;padding:20px;width:340px;max-width:93vw;border:2px solid var(--primary);box-shadow:0 8px 32px rgba(0,0,0,.3);">
        <h3 style="margin:0 0 4px;color:var(--text);font-size:1em;">⚙️ פרמטרים ל-${esc(item.k)}</h3>
        <p style="margin:0 0 14px;font-size:.8em;color:var(--text2);">לחישוב אביזרים מתאימים:</p>

        <label style="font-size:.82em;color:var(--text2);">AWG / חתך</label>
        <select id="_dp_awg" style="margin-bottom:10px;font-size:.88em;">
          <option value="">-- בחר AWG --</option>
          ${Object.keys(DAZURA_AWG).sort((a,b)=>parseInt(b)-parseInt(a)).map(g=>`<option value="${g}">${g} AWG (${DAZURA_AWG[g].area}mm²)</option>`).join('')}
        </select>

        <label style="font-size:.82em;color:var(--text2);">סוג בידוד</label>
        <select id="_dp_ins" style="margin-bottom:10px;font-size:.88em;">
          <option value="pvc">PVC</option>
          <option value="ptfe">PTFE / Teflon</option>
          <option value="silicone">Silicone</option>
          <option value="xlpe">XLPE</option>
        </select>

        <label style="font-size:.82em;color:var(--text2);">מתח מערכת (V)</label>
        <select id="_dp_volt" style="margin-bottom:10px;font-size:.88em;">
          <option value="">לא ידוע</option>
          <option value="12">12V DC</option>
          <option value="24">24V DC</option>
          <option value="28">28V DC (Aviation)</option>
          <option value="48">48V DC</option>
          <option value="115">115V AC</option>
          <option value="220">220V AC</option>
          <option value="600">600V</option>
        </select>

        <label style="font-size:.82em;color:var(--text2);">זרם נדרש (A) <span style="opacity:.6;">אופציונלי</span></label>
        <input type="number" id="_dp_curr" placeholder="0" min="0" step="0.1" style="margin-bottom:12px;font-size:.88em;">

        <label style="display:flex;align-items:center;gap:6px;font-size:.82em;color:var(--text2);margin-bottom:14px;">
          <input type="checkbox" id="_dp_wp"> עמיד מים (adhesive lined 3:1)
        </label>

        <div style="display:flex;gap:8px;">
          <button id="_dp_ok" class="btn btn-primary" style="flex:1;padding:10px;">✅ המלץ</button>
          <button id="_dp_skip" class="btn btn-ghost" style="width:auto;padding:10px 14px;">דלג</button>
        </div>
      </div>`;

    document.body.appendChild(dlg);

    dlg.querySelector('#_dp_ok').addEventListener('click',()=>{
      const params = {
        awg:       document.getElementById('_dp_awg').value  || null,
        insulation:document.getElementById('_dp_ins').value,
        voltage:   document.getElementById('_dp_volt').value || null,
        current:   parseFloat(document.getElementById('_dp_curr').value)||null,
        waterproof:document.getElementById('_dp_wp').checked,
      };
      document.body.removeChild(dlg);
      resolve(params);
    });
    dlg.querySelector('#_dp_skip').addEventListener('click',()=>{
      document.body.removeChild(dlg);
      resolve({});
    });
    dlg.addEventListener('click',e=>{if(e.target===dlg){document.body.removeChild(dlg);resolve({});}});
  });
}

/* ══ PARAMETRIC RESULT PANEL ══
   Shows recommendations after param dialog
*/
function dazuraShowRecommendations(item, result) {
  const { suggestions, warnings } = result;
  if(!suggestions.length && !warnings.length) return;

  const panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--card);border:2px solid var(--primary);border-radius:12px;padding:14px 18px;z-index:9980;max-width:420px;width:90vw;box-shadow:0 4px 24px rgba(0,0,0,.25);animation:fadeIn .2s;';

  let html2 = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
    <b style="color:var(--text);font-size:.9em;">⚙️ המלצות פרמטריות ל-${esc(item.k)}</b>
    <button onclick="this.closest('div[style]').remove()" style="background:none;border:none;font-size:1.2em;cursor:pointer;color:var(--text2);">✕</button>
  </div>`;

  // AWG summary
  if(result.awg && result.awgData) {
    const d = result.awgData;
    html2 += `<div style="font-size:.78em;color:var(--text2);background:var(--hover);border-radius:6px;padding:6px 10px;margin-bottom:8px;">
      <b>${result.awg}AWG</b> · OD ${result.od}mm · ${d.area}mm² · עד ${d.A_chassis}A (חופשי) / ${d.A_bundle}A (צרור)
    </div>`;
  }

  // Warnings
  warnings.forEach(w => {
    html2 += `<div style="font-size:.82em;color:var(--danger);font-weight:bold;margin-bottom:6px;padding:5px 9px;background:var(--stock-miss-bg);border-radius:6px;">${w}</div>`;
  });

  // Suggestions
  suggestions.forEach(s => {
    html2 += `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);">
      <div>
        <div style="font-size:.85em;font-weight:bold;color:var(--text);">${esc(s.label)}</div>
        ${s.reason?`<div style="font-size:.75em;color:var(--text2);">${esc(s.reason)}</div>`:''}
      </div>
      ${s.searchFor?`<button class="_param_search btn btn-ghost" data-q="${esc(s.searchFor)}" style="font-size:.75em;padding:4px 9px;white-space:nowrap;margin-right:6px;">🔍 חפש</button>`:''}
    </div>`;
  });

  panel.innerHTML = html2;
  document.body.appendChild(panel);

  // Wire up search buttons
  panel.querySelectorAll('._param_search').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      if(typeof switchTab === 'function') switchTab('search');
      const qEl = document.getElementById('q');
      if(qEl) { qEl.value = q; qEl.dispatchEvent(new Event('input')); }
      panel.remove();
    });
  });

  // Auto-remove after 15 seconds
  setTimeout(() => panel.remove && panel.remove(), 15000);
}

if(typeof window !== 'undefined') window._dazuraSemanticsLoaded = true;

/*
 * DAZURA WIRE OD TABLE
 * מקור: MIL-W-22759, UL specs, manufacturer datasheets
 * 
 * מבנה: WIRE_OD[spec][awg] = { od_mm, od_max_mm, source }
 * 
 * OD = קוטר חיצוני כולל בידוד (insulated OD)
 * כל הערכים ב-mm
 */

const WIRE_SPECS = {

  /* ══ UL1015 — 600V PVC, chassis wiring ══ */
  'ul1015': {
    label: 'UL1015 600V PVC',
    voltage: 600,
    insulation: 'pvc',
    awg: {
      '30': {od:1.14, od_max:1.27},
      '28': {od:1.24, od_max:1.37},
      '26': {od:1.40, od_max:1.55},
      '24': {od:1.57, od_max:1.73},
      '22': {od:1.78, od_max:1.96},  // ← UL1015 22AWG
      '20': {od:2.03, od_max:2.24},
      '18': {od:2.39, od_max:2.64},
      '16': {od:2.77, od_max:3.05},
      '14': {od:3.18, od_max:3.51},
      '12': {od:3.81, od_max:4.19},
      '10': {od:4.57, od_max:5.00},
    }
  },

  /* ══ UL1569 — 300V PVC, thinner insulation ══ */
  'ul1569': {
    label: 'UL1569 300V PVC',
    voltage: 300,
    insulation: 'pvc',
    awg: {
      '30': {od:1.02, od_max:1.14},
      '28': {od:1.14, od_max:1.27},
      '26': {od:1.27, od_max:1.42},
      '24': {od:1.45, od_max:1.60},
      '22': {od:1.63, od_max:1.80},  // ← UL1569 22AWG — דקה יותר מ-UL1015
      '20': {od:1.85, od_max:2.03},
      '18': {od:2.18, od_max:2.39},
      '16': {od:2.54, od_max:2.79},
      '14': {od:2.95, od_max:3.25},
      '12': {od:3.56, od_max:3.91},
      '10': {od:4.22, od_max:4.62},
    }
  },

  /* ══ UL1007 — 300V PVC, standard hookup ══ */
  'ul1007': {
    label: 'UL1007 300V PVC',
    voltage: 300,
    insulation: 'pvc',
    awg: {
      '30': {od:1.02, od_max:1.14},
      '28': {od:1.14, od_max:1.27},
      '26': {od:1.27, od_max:1.42},
      '24': {od:1.45, od_max:1.60},
      '22': {od:1.63, od_max:1.80},
      '20': {od:1.85, od_max:2.03},
      '18': {od:2.18, od_max:2.39},
      '16': {od:2.54, od_max:2.79},
      '14': {od:2.95, od_max:3.25},
      '12': {od:3.56, od_max:3.91},
    }
  },

  /* ══ MIL-W-22759/32 — 600V PTFE, aerospace ══ */
  'mil-w-22759/32': {
    label: 'M22759/32 600V PTFE',
    voltage: 600,
    insulation: 'ptfe',
    awg: {
      '30': {od:0.81, od_max:0.89},
      '28': {od:0.89, od_max:0.97},
      '26': {od:1.02, od_max:1.12},
      '24': {od:1.17, od_max:1.29},
      '22': {od:1.35, od_max:1.47},  // ← M22759 22AWG PTFE — דק בהרבה
      '20': {od:1.57, od_max:1.70},
      '18': {od:1.83, od_max:1.98},
      '16': {od:2.16, od_max:2.34},
      '14': {od:2.57, od_max:2.79},
      '12': {od:3.02, od_max:3.28},
      '10': {od:3.68, od_max:3.99},
    }
  },

  /* ══ MIL-W-22759/34 — 600V PTFE silver plated ══ */
  'mil-w-22759/34': {
    label: 'M22759/34 600V PTFE Ag',
    voltage: 600,
    insulation: 'ptfe',
    awg: {
      '28': {od:0.89, od_max:0.97},
      '26': {od:1.02, od_max:1.12},
      '24': {od:1.17, od_max:1.29},
      '22': {od:1.35, od_max:1.47},
      '20': {od:1.57, od_max:1.70},
      '18': {od:1.83, od_max:1.98},
      '16': {od:2.16, od_max:2.34},
      '14': {od:2.57, od_max:2.79},
      '12': {od:3.02, od_max:3.28},
    }
  },

  /* ══ LI 55A0111 (Lapp / similar) — thin silicone ══ */
  'li55a0111': {
    label: 'LI 55A0111 Silicone',
    voltage: 300,
    insulation: 'silicone',
    awg: {
      '26': {od:1.10, od_max:1.22},
      '24': {od:1.30, od_max:1.44},
      '22': {od:1.50, od_max:1.65},  // ← LI55A0111 22AWG — דק מאוד
      '20': {od:1.75, od_max:1.90},
      '18': {od:2.10, od_max:2.28},
      '16': {od:2.50, od_max:2.70},
      '14': {od:3.00, od_max:3.25},
    }
  },

  /* ══ MIL-C-13777 — shielded cable ══ */
  'mil-c-13777': {
    label: 'MIL-C-13777 Shielded',
    voltage: 600,
    insulation: 'ptfe_shielded',
    awg: {
      '22': {od:3.30, od_max:3.60},  // includes shield + jacket
      '20': {od:3.70, od_max:4.00},
      '18': {od:4.20, od_max:4.55},
    }
  },

  /* ══ Generic fallback — PVC standard ══ */
  'generic_pvc_300v': {
    label: 'Generic PVC 300V',
    voltage: 300,
    insulation: 'pvc',
    awg: {
      '30': {od:1.10, od_max:1.25},
      '28': {od:1.20, od_max:1.35},
      '26': {od:1.35, od_max:1.52},
      '24': {od:1.52, od_max:1.70},
      '22': {od:1.70, od_max:1.90},
      '20': {od:1.95, od_max:2.15},
      '18': {od:2.30, od_max:2.55},
      '16': {od:2.65, od_max:2.95},
      '14': {od:3.10, od_max:3.45},
      '12': {od:3.70, od_max:4.10},
      '10': {od:4.40, od_max:4.85},
    }
  },

  'generic_pvc_600v': {
    label: 'Generic PVC 600V',
    voltage: 600,
    insulation: 'pvc',
    awg: {
      '30': {od:1.20, od_max:1.35},
      '28': {od:1.32, od_max:1.47},
      '26': {od:1.47, od_max:1.65},
      '24': {od:1.65, od_max:1.83},
      '22': {od:1.85, od_max:2.06},
      '20': {od:2.11, od_max:2.34},
      '18': {od:2.49, od_max:2.77},
      '16': {od:2.90, od_max:3.23},
      '14': {od:3.33, od_max:3.71},
      '12': {od:3.99, od_max:4.44},
      '10': {od:4.78, od_max:5.33},
    }
  },

  'generic_ptfe_600v': {
    label: 'Generic PTFE 600V',
    voltage: 600,
    insulation: 'ptfe',
    awg: {
      '30': {od:0.84, od_max:0.94},
      '28': {od:0.94, od_max:1.04},
      '26': {od:1.07, od_max:1.19},
      '24': {od:1.22, od_max:1.35},
      '22': {od:1.40, od_max:1.55},
      '20': {od:1.63, od_max:1.80},
      '18': {od:1.91, od_max:2.11},
      '16': {od:2.26, od_max:2.49},
      '14': {od:2.67, od_max:2.95},
      '12': {od:3.15, od_max:3.48},
      '10': {od:3.84, od_max:4.24},
    }
  },
};

/* ═══════════════════════════════════════════════════════════
   SPEC ALIASES — כינויים נפוצים → spec key
═══════════════════════════════════════════════════════════ */
const WIRE_SPEC_ALIASES = {
  // UL
  'ul1015':['ul-1015','ul 1015','1015'],
  'ul1569':['ul-1569','ul 1569','1569'],
  'ul1007':['ul-1007','ul 1007','1007'],
  'ul1061':['ul-1061','ul 1061','1061'],
  // MIL
  'mil-w-22759/32':['m22759/32','m22759-32','22759/32','mil22759'],
  'mil-w-22759/34':['m22759/34','m22759-34','22759/34'],
  'mil-w-22759/16':['m22759/16','m22759-16'],
  'mil-w-22759/18':['m22759/18','m22759-18'],
  'mil-w-22759/86':['m22759/86','m22759-86'],
  'mil-c-13777':['m13777','mil13777'],
  // LI / Silicone
  'li55a0111':['li-55a0111','55a0111','lapp silicone'],
};

function resolveWireSpec(specStr) {
  if(!specStr)return null;
  const s=specStr.toLowerCase().replace(/\s+/g,'');
  // Direct match
  if(WIRE_SPECS[s])return s;
  // Alias match
  for(const[key,aliases]of Object.entries(WIRE_SPEC_ALIASES)){
    if(aliases.some(a=>s.includes(a.replace(/\s+/g,''))))return key;
  }
  // Guess from insulation + voltage
  if(s.includes('ptfe')||s.includes('teflon')){
    return s.includes('600')?'generic_ptfe_600v':'generic_ptfe_600v';
  }
  if(s.includes('600'))return 'generic_pvc_600v';
  if(s.includes('300'))return 'generic_pvc_300v';
  return 'generic_pvc_300v'; // safest default
}

function getWireOD(awg, specStr) {
  const spec=resolveWireSpec(specStr);
  if(!spec)return null;
  const specData=WIRE_SPECS[spec];
  if(!specData)return null;
  const awgData=specData.awg[String(awg)];
  if(!awgData)return null;
  return { od_mm: awgData.od_max, spec, specLabel: specData.label };
  // Use od_max for shrink — always size for worst case
}

/* ═══════════════════════════════════════════════════════════
   SHRINK TUBE SELECTORS
   Use od_max of wire → shrink inner diameter must be > od_max
   shrink installed ID must accommodate od_max
═══════════════════════════════════════════════════════════ */
const SHRINK_CATALOG = {
  // Raychem RSFR-H (2:1, 125°C, 600V)
  'RSFR': {
    ratio: '2:1',
    sizes: [
      {sfx:'3/32',  id_mm:2.40,  od_rec_max:2.00},
      {sfx:'3/16',  id_mm:4.80,  od_rec_max:4.00},
      {sfx:'H1',    id_mm:6.40,  od_rec_max:5.30},
      {sfx:'3/8',   id_mm:9.50,  od_rec_max:7.90},
      {sfx:'H2',    id_mm:12.70, od_rec_max:10.50},
      {sfx:'3/4',   id_mm:19.05, od_rec_max:15.80},
    ]
  },
  // Raychem ATUM (3:1 adhesive, 125°C)
  'ATUM': {
    ratio: '3:1',
    adhesive: true,
    sizes: [
      {sfx:'3/16',  id_mm:4.80,  od_rec_max:3.90},
      {sfx:'1/4',   id_mm:6.40,  od_rec_max:5.20},
      {sfx:'3/8',   id_mm:9.50,  od_rec_max:7.70},
      {sfx:'1/2',   id_mm:12.70, od_rec_max:10.30},
    ]
  },
  // Generic 2:1
  'GENERIC_2_1': {
    ratio: '2:1',
    sizes: [
      {sfx:'1.5mm',  id_mm:1.50, od_rec_max:1.20},
      {sfx:'2mm',    id_mm:2.00, od_rec_max:1.60},
      {sfx:'2.4mm',  id_mm:2.40, od_rec_max:2.00},
      {sfx:'3mm',    id_mm:3.00, od_rec_max:2.50},
      {sfx:'4mm',    id_mm:4.00, od_rec_max:3.30},
      {sfx:'5mm',    id_mm:5.00, od_rec_max:4.20},
      {sfx:'6mm',    id_mm:6.00, od_rec_max:5.00},
      {sfx:'8mm',    id_mm:8.00, od_rec_max:6.70},
      {sfx:'10mm',   id_mm:10.0, od_rec_max:8.30},
      {sfx:'12mm',   id_mm:12.0, od_rec_max:10.0},
    ]
  }
};

function selectShrink(prefix, wire_od_max_mm) {
  const catalog=SHRINK_CATALOG[prefix.toUpperCase()]||SHRINK_CATALOG['GENERIC_2_1'];
  // Find smallest size that fits (id_mm > wire_od_max + 10% clearance)
  const needed=wire_od_max_mm * 1.10;
  const size=catalog.sizes.find(s=>s.id_mm>=needed);
  if(!size)return {sfx:'?', id_mm:0, note:'חורג מהטבלה'};
  return {...size, prefix, fullPN:`${prefix}-${size.sfx}`};
}

/* ═══════════════════════════════════════════════════════════
   MAIN API
═══════════════════════════════════════════════════════════ */
function dazuraSelectShrink(wireItem) {
  const custom=wireItem.custom||[];
  const full=((wireItem.k||'')+' '+(wireItem.v||'')+' '+
    custom.map(f=>f.label+' '+f.value).join(' ')).toLowerCase();

  // ── AWG — broad pattern matching ──
  let awg=null;
  const awgPatterns=[
    /(\d+)\s*awg/,/awg\s*[#\-]?\s*(\d+)/,/#\s*(\d+)\s*wire/,
    /(\d+)\s*ga(?:uge)?/,/gauge\s*[:\-]?\s*(\d+)/
  ];
  for(const p of awgPatterns){const m=full.match(p);if(m){awg=m[1];break;}}
  // From custom field
  if(!awg){
    const f=custom.find(f=>/awg|gauge|חתך|עובי/.test(f.label.toLowerCase()));
    if(f)awg=(f.value.match(/\d+/)||[])[0];
  }
  // From mm² conversion
  if(!awg){
    const mm2Match=full.match(/([\d.]+)\s*mm[²2]/);
    if(mm2Match){
      const mm2=parseFloat(mm2Match[1]);
      const AWG_MM2={'0.05':'30','0.08':'28','0.14':'26','0.22':'24',
        '0.35':'22','0.5':'20','0.75':'18','1.0':'17','1.5':'16',
        '2.5':'14','4.0':'12','6.0':'10','10.0':'8'};
      const best=Object.keys(AWG_MM2).reduce((a,b)=>
        Math.abs(parseFloat(a)-mm2)<Math.abs(parseFloat(b)-mm2)?a:b);
      if(Math.abs(parseFloat(best)-mm2)<0.2)awg=AWG_MM2[best];
    }
  }
  if(!awg)return null;

  // ── Voltage ──
  let voltage=300;
  const vf=custom.find(f=>/voltage|volt|מתח|rating/i.test(f.label));
  if(vf)voltage=parseInt((vf.value.match(/\d+/)||[])[0])||300;
  else{const vm=full.match(/(\d{2,4})\s*v(?:olt|dc|ac|\/)?(?:\s|$)/);
    if(vm)voltage=parseInt(vm[1]);}

  // ── Insulation ──
  let insulation='pvc';
  const inf=custom.find(f=>/insulation|בידוד|material|חומר/i.test(f.label));
  if(inf){const iv=inf.value.toLowerCase();
    if(/ptfe|teflon/.test(iv))insulation='ptfe';
    else if(/silicone|סיליקון/.test(iv))insulation='silicone';}
  else if(/ptfe|teflon/.test(full))insulation='ptfe';
  else if(/silicone|סיליקון/.test(full))insulation='silicone';

  // ── Spec ──
  let specStr='';
  const sf=custom.find(f=>/spec|standard|תקן|ul|mil|norm/i.test(f.label));
  if(sf)specStr=sf.value.toLowerCase().replace(/\s/g,'');
  if(!specStr){
    const sm=full.match(/ul\d{4}|m22759[\/\-]\d+|li\s*55\w+|vde\s*\d+/i);
    if(sm)specStr=sm[0].replace(/\s/g,'');
  }
  if(!specStr)specStr=`generic_${insulation}_${voltage}v`;

  const odData=getWireOD(awg,specStr)||getWireOD(awg,`generic_${insulation}_${voltage}v`);
  if(!odData)return null;

  return{awg,spec:odData.spec,specLabel:odData.specLabel,
         od_mm:odData.od_mm,voltage,insulation};
}

if(typeof window!=='undefined'){
  window._dazuraWire={
    WIRE_SPECS, WIRE_SPEC_ALIASES, SHRINK_CATALOG,
    resolveWireSpec, getWireOD, selectShrink, dazuraSelectShrink
  };
}
