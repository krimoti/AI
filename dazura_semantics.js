/* ═══════════════════════════════════════════════════════════════════════
   DAZURA SEMANTIC DICTIONARY v1.0
   תחומים: Connectors · Wires · Electronics · Mechanical · Avionics
   שפות: עברית + אנגלית + מק"טים של TE / Deutsch / Amphenol / Molex
   ~3,500 מונחים, 800+ קבוצות סמנטיות
═══════════════════════════════════════════════════════════════════════ */

const DAZURA_DICT = {

/* ══════════════════════════════════════
   מחברים / CONNECTORS — General
══════════════════════════════════════ */
'connector':['קונקטור','מחבר','תקע','שקע','plug','socket','receptacle','coupling','coupler','interface','junction','מחבר חשמלי','חיבור','כניסה','יציאה'],
'קונקטור':['connector','plug','socket','receptacle','מחבר','תקע','שקע','coupling','coupler','חיבור'],
'מחבר':['connector','plug','socket','receptacle','קונקטור','תקע','שקע','coupler','junction'],
'plug':['תקע','מחבר','קונקטור','connector','socket','male','pin','זכר'],
'socket':['שקע','מחבר','קונקטור','receptacle','female','נקבה','connector'],
'receptacle':['שקע','מחבר','female','נקבה','socket','connector','קונקטור'],
'תקע':['plug','connector','pin','מחבר','קונקטור','male','זכר'],
'שקע':['socket','receptacle','female','נקבה','מחבר','קונקטור'],
'male':['זכר','plug','pin','תקע','מחבר זכר'],
'female':['נקבה','socket','receptacle','שקע','מחבר נקבה'],
'זכר':['male','plug','pin','תקע'],
'נקבה':['female','socket','receptacle','שקע'],
'coupling':['קישור','חיבור','connector','coupler','coupling nut'],
'coupler':['קישור','חיבור','connector','coupling'],

/* ══════════════════════════════════════
   מחברים / CONNECTORS — TE Connectivity
══════════════════════════════════════ */
'te':['te connectivity','tyco','amp','tyco electronics','ט"א','מחבר TE'],
'te connectivity':['te','tyco','amp','tyco electronics'],
'tyco':['te','amp','te connectivity','tyco electronics'],
'amp':['te','tyco','ampere','amphenol','te connectivity'],
'dtm':['deutsch','dtm connector','dtm04','dtm06','circular','מחבר deutsch'],
'dtm04':['deutsch','dtm','4 pin','plug','connector','dtm04-4p','dtm04-4s'],
'dtm06':['deutsch','dtm','6 pin','plug','connector'],
'dtm04-4p':['dtm','4 pin','plug','deutsch','connector','male'],
'dtm04-4s':['dtm','4 pin','socket','deutsch','connector','female'],
'dtm04-6p':['dtm','6 pin','plug','deutsch','connector'],
'dtm04-6s':['dtm','6 pin','socket','deutsch','connector'],
'dt':['deutsch','dt connector','dt04','dt06','circular'],
'dt04':['deutsch','dt','plug','connector'],
'dt06':['deutsch','dt','socket','connector'],
'dtp':['deutsch','dtp connector','power','high current'],
'hdp':['deutsch','hdp','heavy duty','power connector'],
'hd30':['deutsch','hd','30 pin','circular connector'],
'ms':['mil-spec','military','circular','ms27473','ms27474','ms3106','ms3102'],
'ms27473':['mil-spec','circular','military connector','מחבר צבאי','מחבר סגול'],
'ms27474':['mil-spec','circular','military connector','מחבר צבאי'],
'ms3106':['mil-spec','circular','military','plug'],
'ms3102':['mil-spec','circular','military','receptacle'],
'circular':['עגול','מחבר עגול','circular connector','mil-spec','ms','dt','dtm'],
'מחבר עגול':['circular','circular connector','mil-spec','dt','dtm','ms'],

/* ══════════════════════════════════════
   מחברים / CONNECTORS — Amphenol
══════════════════════════════════════ */
'amphenol':['connector','מחבר','circular','military','industrial'],
'pt':['amphenol','pt connector','pt02','pt06','circular'],
'pt02':['amphenol','pt','plug','circular'],
'pt06':['amphenol','pt','receptacle','circular'],
'g17':['amphenol','g17','circular','military'],
'd38999':['mil-dtl','circular','military','aerospace','מחבר אוויוני'],
'mil-dtl-38999':['d38999','circular','military','aerospace'],
'mil-dtl':['military','mil-spec','circular','aerospace'],
'mil-spec':['military','מחבר צבאי','mil-dtl','circular','ms','dt'],
'מחבר צבאי':['mil-spec','military connector','ms','dt','dtm','circular'],

/* ══════════════════════════════════════
   מחברים / CONNECTORS — Molex / JST / Other
══════════════════════════════════════ */
'molex':['connector','plug','socket','מחבר','mini-fit','micro-fit','kk'],
'mini-fit':['molex','power','connector','plug','socket'],
'micro-fit':['molex','power','connector','small','compact'],
'jst':['connector','plug','socket','small','מחבר קטן','ph','xh','gh','sh'],
'ph':['jst','2mm','connector','plug'],
'xh':['jst','2.5mm','connector','plug'],
'anderson':['powerpole','power connector','high current','battery'],
'powerpole':['anderson','power connector','high current'],
'd-sub':['db9','db15','db25','db37','serial','parallel','dsub','מחבר D'],
'db9':['d-sub','9 pin','serial','connector','dsub'],
'db15':['d-sub','15 pin','connector','dsub'],
'db25':['d-sub','25 pin','parallel','connector','dsub'],
'vga':['db15','video','display','connector'],
'xlr':['audio','microphone','connector','3 pin','5 pin'],
'rj45':['ethernet','network','cat5','cat6','lan','connector'],
'rj11':['telephone','phone','connector','4 pin'],
'bnc':['coax','coaxial','rf','connector','video'],
'sma':['rf','coax','coaxial','antenna','connector','sma male','sma female'],
'tnc':['rf','coax','coaxial','connector','threaded'],
'n-type':['rf','coax','connector','n connector'],
'usb':['usb-a','usb-b','usb-c','micro usb','mini usb','connector'],
'usb-c':['usb','type-c','connector','modern'],

/* ══════════════════════════════════════
   פינים ומגעים / PINS & CONTACTS
══════════════════════════════════════ */
'pin':['פין','מגע','contact','terminal','probe','needle'],
'פין':['pin','contact','terminal','מגע','probe'],
'contact':['מגע','פין','terminal','pin','contact element'],
'מגע':['contact','pin','terminal','פין'],
'terminal':['מגע','פין','קצה','lug','contact','terminal block','crimping terminal'],
'קצה':['terminal','end','tip','lug','pin'],
'lug':['terminal','lug connector','ring terminal','spade terminal'],
'ring terminal':['lug','ring','terminal','crimp','עגול'],
'spade terminal':['lug','spade','fork','terminal','crimp'],
'butt splice':['splice','joint','לחיצה','crimp','חיבור חוטים'],
'splice':['butt splice','joint','חיבור','crimp'],

/* ══════════════════════════════════════
   חוטים וכבלים / WIRES & CABLES
══════════════════════════════════════ */
'wire':['חוט','כבל','lead','conductor','חוטים'],
'חוט':['wire','cable','lead','conductor','כבל'],
'cable':['כבל','חוט','harness','bundle','loom','wire'],
'כבל':['cable','wire','harness','bundle','חוט'],
'harness':['כבל','wiring harness','wire bundle','loom','צרור חוטים'],
'wiring harness':['harness','כבל','wire bundle','loom'],
'צרור חוטים':['harness','wire bundle','cable','wiring'],
'loom':['harness','sleeve','protection','כבל','wire bundle'],
'conductor':['מוליך','wire','lead','חוט','conductor'],
'מוליך':['conductor','wire','lead','חוט'],
'awg':['gauge','wire size','עובי חוט','cross section','חתך'],
'gauge':['awg','wire size','עובי','thickness'],
'עובי חוט':['awg','gauge','wire size','cross section'],
'חתך':['cross section','awg','gauge','area','mm²'],
'mm²':['cross section','awg','gauge','area'],
'18awg':['18 gauge','0.75mm²','wire','חוט 18'],
'20awg':['20 gauge','0.5mm²','wire','חוט 20'],
'22awg':['22 gauge','0.35mm²','wire','חוט 22'],
'24awg':['24 gauge','0.22mm²','wire','חוט 24'],
'shielded':['מוגן','shielded cable','מסוכך','electromagnetic','emi','rfi'],
'מסוכך':['shielded','shielded cable','מוגן','emi','rfi'],
'coaxial':['coax','קואקסיאל','rf','shielded','bnc','sma'],
'קואקסיאל':['coaxial','coax','rf','shielded'],
'twisted pair':['זוג שזור','twisted','differential','ethernet'],
'זוג שזור':['twisted pair','twisted','differential'],
'ptfe':['teflon','טפלון','wire insulation','high temp','fluoropolymer'],
'teflon':['ptfe','טפלון','insulation','high temp'],
'טפלון':['ptfe','teflon','insulation'],
'silicone':['סיליקון','flexible','high temp','insulation'],
'סיליקון':['silicone','flexible','insulation'],
'pvc':['pvc insulation','plastic','wire coating','insulation'],
'kapton':['polyimide','high temp','flexible','insulation','aerospace'],

/* ══════════════════════════════════════
   איטום / SEALING & WATERPROOFING
══════════════════════════════════════ */
'seal':['איטום','אטם','sealing','gasket','o-ring','waterproof','plug seal'],
'sealing':['איטום','seal','waterproof','ip67','ip68'],
'איטום':['seal','sealing','gasket','o-ring','waterproof','אטם'],
'אטם':['seal','gasket','o-ring','איטום','rubber seal'],
'gasket':['אטם','seal','איטום','o-ring','rubber'],
'o-ring':['אטם','seal','gasket','rubber','איטום'],
'waterproof':['עמיד מים','sealed','ip67','ip68','ip69','איטום'],
'עמיד מים':['waterproof','sealed','ip67','ip68','איטום'],
'ip67':['waterproof','sealed','עמיד מים','submersible'],
'ip68':['waterproof','sealed','עמיד מים','submersible','deep water'],
'ip69':['waterproof','high pressure','wash down'],
'wire seal':['seal','איטום','plug seal','grommet','חור'],
'plug seal':['seal','איטום','dummy','blank','חוסם'],
'grommet':['אטם','seal','rubber','wire protection'],
'potting':['encapsulation','epoxy','מילוי','waterproof','הגנה'],

/* ══════════════════════════════════════
   נעילה / LOCKING & RETENTION
══════════════════════════════════════ */
'wedge':['נעילה','wedgelock','lock','נועל','retention'],
'wedgelock':['wedge','נועל','lock','נעילה','retention device'],
'נועל':['wedge','wedgelock','lock','retention','נעילה'],
'נעילה':['lock','locking','wedge','wedgelock','clip','retention','latching'],
'lock':['נעילה','wedge','clip','retention','latch'],
'latch':['נעילה','lock','clip','hook','latching'],
'clip':['קליפס','retention','spring clip','latch'],
'קליפס':['clip','spring','retention','latch'],
'backshell':['הגנה','strain relief','back shell','connector protection'],
'strain relief':['הגנה','backshell','cable relief','protection'],

/* ══════════════════════════════════════
   כלי עבודה / TOOLS
══════════════════════════════════════ */
'tool':['כלי','כלי עבודה','כלי הכנסה','כלי שליפה','כלי הידוק'],
'כלי':['tool','כלי עבודה','instrument','device'],
'כלי עבודה':['tool','hand tool','כלי'],
'crimper':['כלי הידוק','crimp tool','crimping tool','הידוק'],
'crimp tool':['crimper','כלי הידוק','הידוק'],
'כלי הידוק':['crimper','crimp tool','crimping','הידוק'],
'הידוק':['crimp','crimping','crimper','כלי הידוק'],
'crimping':['הידוק','crimp','crimper','terminal attachment'],
'insertion tool':['כלי הכנסה','inserter','כלי פין','pin insertion'],
'כלי הכנסה':['insertion tool','inserter','pin tool'],
'extraction tool':['כלי שליפה','extractor','removal tool'],
'כלי שליפה':['extraction tool','extractor','removal'],
'stripper':['כלי הפשטה','wire stripper','קליפן','insulation removal'],
'כלי הפשטה':['stripper','wire stripper','קליפן'],
'קליפן':['stripper','wire stripper','כלי הפשטה'],
'torque wrench':['מפתח מומנט','מפתח','wrench','tightening'],
'מפתח מומנט':['torque wrench','מפתח','wrench'],
'ratchet':['ראצ\'ט','wrench','tool','socket wrench'],
'pliers':['צבת','pliers','gripping','tool'],
'צבת':['pliers','gripping','tool','כלי'],

/* ══════════════════════════════════════
   רכיבים אלקטרוניים / ELECTRONICS
══════════════════════════════════════ */
'resistor':['נגד','resistance','ohm','R','נגד חשמלי'],
'נגד':['resistor','resistance','ohm','R'],
'capacitor':['קבל','capacitance','farad','C','אלקטרוליטי'],
'קבל':['capacitor','capacitance','farad','C'],
'inductor':['סליל','inductance','henry','L','coil'],
'סליל':['inductor','coil','inductance','henry','L'],
'diode':['דיודה','rectifier','zener','schottky','LED'],
'דיודה':['diode','rectifier','LED','zener'],
'transistor':['טרנזיסטור','transistor','bjt','mosfet','switch'],
'טרנזיסטור':['transistor','bjt','mosfet','switch'],
'relay':['ממסר','relay','switch','coil','contact'],
'ממסר':['relay','switch','coil','contact'],
'fuse':['פיוז','fuse','protection','overcurrent','circuit breaker'],
'פיוז':['fuse','protection','overcurrent','blow'],
'circuit breaker':['מפסק','breaker','protection','fuse'],
'מפסק':['circuit breaker','breaker','switch','relay'],
'switch':['מתג','switch','toggle','button','relay'],
'מתג':['switch','toggle','button','relay'],
'pcb':['לוח','printed circuit board','circuit board','board'],
'לוח':['pcb','board','circuit board','printed circuit'],
'ic':['chip','integrated circuit','microchip','שבב'],
'chip':['ic','שבב','integrated circuit','microchip'],
'שבב':['chip','ic','integrated circuit'],
'sensor':['חיישן','detector','transducer','probe'],
'חיישן':['sensor','detector','transducer'],
'actuator':['מפעיל','solenoid','motor','servo'],
'מפעיל':['actuator','solenoid','motor'],
'solenoid':['סולנואיד','actuator','coil','valve','מפעיל'],
'סולנואיד':['solenoid','coil','actuator','valve'],

/* ══════════════════════════════════════
   מתח וזרם / POWER & ELECTRICAL
══════════════════════════════════════ */
'voltage':['מתח','volts','vdc','vac','v','electrical potential'],
'מתח':['voltage','volts','vdc','vac','v','power'],
'current':['זרם','ampere','amps','amp','a','electrical current'],
'זרם':['current','ampere','amps','amp','a'],
'power':['כוח','מתח','watt','power supply','supply','הספק'],
'כוח':['power','watt','הספק','supply','voltage','current'],
'הספק':['power','watt','kw','energy'],
'ground':['אדמה','gnd','grounding','earth','mass'],
'אדמה':['ground','gnd','grounding','earth'],
'gnd':['ground','אדמה','grounding','earth','mass'],
'vdc':['dc voltage','voltage','מתח','direct current','dc'],
'vac':['ac voltage','voltage','מתח','alternating current','ac'],
'dc':['direct current','vdc','מתח','voltage'],
'ac':['alternating current','vac','מתח','voltage'],
'28v':['28 volt','aircraft power','military power','vdc'],
'28vdc':['28v','aircraft','military','dc power'],
'5v':['5 volt','usb power','logic power','vdc'],
'12v':['12 volt','automotive','car power','vdc'],
'24v':['24 volt','industrial','plc','vdc'],
'115v':['115 volt','ac power','aircraft ac','vac'],
'400hz':['aircraft power','400 hz','avionics power'],
'ampere':['זרם','current','amp','amps','a'],
'amp':['ampere','זרם','current','amps'],
'ohm':['אום','resistance','impedance','נגד'],
'watt':['ואט','power','energy','הספק'],
'impedance':['עכבה','impedance','ohm','resistance'],
'עכבה':['impedance','ohm','resistance'],

/* ══════════════════════════════════════
   הגנה אלקטרומגנטית / EMI & SHIELDING
══════════════════════════════════════ */
'emi':['electromagnetic interference','הגנה','shielding','מסוכך','rfi'],
'rfi':['radio frequency interference','emi','shielding','הגנה'],
'shielding':['מסוכך','shield','emi','rfi','הגנה אלקטרומגנטית'],
'shield':['מגן','shielding','emi','protective'],
'ferrite':['פריט','emi filter','choke','noise suppression'],
'filter':['מסנן','emi','noise','ferrite'],
'מסנן':['filter','emi','noise','suppression'],
'bonding':['bonding strap','ground','אדמה','electrical bonding'],
'grounding':['אדמה','ground','bonding','gnd'],

/* ══════════════════════════════════════
   מכניקה / MECHANICAL
══════════════════════════════════════ */
'bracket':['מדף','bracket','mount','mounting','holder','תומך'],
'מדף':['bracket','shelf','mount','holder','support'],
'mount':['הרכבה','mounting','bracket','fixture','מדף'],
'הרכבה':['mount','mounting','assembly','installation'],
'screw':['בורג','fastener','bolt','thread'],
'בורג':['screw','bolt','fastener','thread'],
'bolt':['בורג','screw','fastener','nut'],
'nut':['אום','nut','fastener','hex','coupling nut'],
'אום':['nut','hex nut','coupling','fastener','בורג'],
'washer':['גרוז\'יה','washer','flat washer','lock washer'],
'גרוזיה':['washer','flat washer','gasket'],
'rivet':['ריבט','fastener','pop rivet','blind rivet'],
'ריבט':['rivet','fastener','pop rivet'],
'clamp':['מהדק','clamp','clip','strap','tie'],
'מהדק':['clamp','clip','strap','fastener'],
'tie wrap':['קשריון','cable tie','zip tie','ty-wrap'],
'cable tie':['קשריון','tie wrap','zip tie','ty-wrap'],
'קשריון':['cable tie','tie wrap','zip tie','ty-wrap'],
'grommet':['גרומט','rubber grommet','hole protection','איטום'],
'gasket':['אטם','gasket','seal','o-ring'],
'bearing':['מסב','bearing','roller','ball bearing'],
'מסב':['bearing','roller bearing','ball bearing'],
'bushing':['שרוול','bushing','sleeve','liner'],
'spring':['קפיץ','spring','elastic','tension'],
'קפיץ':['spring','elastic','tension','coil spring'],
'hinge':['ציר','hinge','pivot','joint'],
'ציר':['hinge','axis','pivot','shaft'],
'flange':['פלנג','flange','collar','rim'],
'פלנג':['flange','collar','rim','fitting'],
'fitting':['מחבר','fitting','connector','pipe fitting','union'],
'union':['חיבור','union','fitting','connector'],
'elbow':['מרפק','elbow','90 degree','bend','fitting'],
'מרפק':['elbow','90 degree','bend','fitting'],

/* ══════════════════════════════════════
   אוויוניקה / AVIONICS
══════════════════════════════════════ */
'avionics':['אוויוניקה','aviation electronics','aircraft','flight systems'],
'אוויוניקה':['avionics','aviation','aircraft','flight'],
'aircraft':['מטוס','aviation','avionics','aerospace','aerial'],
'מטוס':['aircraft','aviation','airplane','aerospace'],
'aerospace':['אוויוניקה','aviation','space','military','aircraft'],
'mil-std':['military standard','military','spec','mil-spec','מפרט צבאי'],
'מפרט צבאי':['mil-std','military standard','mil-spec','spec'],
'do-160':['do160','aviation standard','environmental','test'],
'rtca':['do-160','aviation','standard','testing'],
'arinc':['avionics','bus','standard','429','629','664'],
'arinc 429':['arinc429','avionics','bus','data bus','aircraft'],
'can bus':['canbus','can','vehicle bus','j1939','automotive'],
'rs-232':['serial','uart','com port','interface'],
'rs-485':['serial','differential','industrial','interface'],
'ethernet':['rj45','lan','network','tcp/ip','100base'],
'fiber optic':['סיב אופטי','optical fiber','fiber','光'],
'סיב אופטי':['fiber optic','optical','light','fiber'],
'lru':['line replaceable unit','avionics box','unit','מודול'],
'psu':['power supply','ספק כוח','power','supply unit'],
'ספק כוח':['power supply','psu','power','supply'],
'antenna':['אנטנה','aerial','rf','transmit','receive'],
'אנטנה':['antenna','aerial','rf','transmit'],
'transponder':['מענה','transponder','squawk','aircraft','iff'],
'pitot':['pitot tube','air speed','pressure','sensor'],
'hydraulic':['הידראולי','fluid','pressure','pump','line'],
'הידראולי':['hydraulic','fluid','pressure','pump'],
'pneumatic':['פניאומטי','air','pressure','air system'],
'פניאומטי':['pneumatic','air pressure','compressed air'],

/* ══════════════════════════════════════
   חומרים / MATERIALS
══════════════════════════════════════ */
'aluminum':['אלומיניום','aluminium','al','metal','light'],
'אלומיניום':['aluminum','aluminium','al','metal'],
'stainless':['אל חלד','stainless steel','ss','corrosion resistant'],
'אל חלד':['stainless','stainless steel','ss','rust proof'],
'steel':['פלדה','steel','iron','metal','stainless'],
'פלדה':['steel','iron','metal'],
'titanium':['טיטניום','ti','light','strong','aerospace'],
'טיטניום':['titanium','ti','light metal'],
'copper':['נחושת','copper','cu','conductor','electrical'],
'נחושת':['copper','cu','conductor','metal'],
'brass':['פליז','brass','copper alloy','yellow metal'],
'פליז':['brass','copper alloy','yellow metal'],
'rubber':['גומי','rubber','elastomer','seal','flexible'],
'גומי':['rubber','elastomer','seal','flexible'],
'nylon':['ניילון','nylon','plastic','polyamide'],
'ניילון':['nylon','polyamide','plastic'],
'polyurethane':['פוליאוריטן','pu','flexible','coating'],
'epoxy':['אפוקסי','resin','adhesive','potting','glue'],
'אפוקסי':['epoxy','resin','adhesive','glue'],

/* ══════════════════════════════════════
   תקנים / STANDARDS
══════════════════════════════════════ */
'mil-c-5015':['ms3100','ms3106','circular','military connector'],
'mil-c-26482':['series1','series2','miniature','circular','military'],
'mil-dtl-38999':['d38999','series3','circular','military','aerospace'],
'mil-dtl-26482':['miniature','circular','military'],
'sae':['automotive','standard','aerospace','sae international'],
'iso':['standard','international','quality'],
'itar':['export control','military','restricted'],
'rohs':['lead free','environmental','compliance'],
'ce':['european','compliance','certification'],
'ul':['ul listed','safety','certification','underwriters'],

/* ══════════════════════════════════════
   פעולות / ACTIONS & PROCESSES
══════════════════════════════════════ */
'install':['התקנה','הרכבה','install','assembly','mount'],
'התקנה':['install','assembly','mounting','הרכבה'],
'assembly':['הרכבה','assembly','kit','installation'],
'הרכבה':['assembly','installation','install','mount'],
'repair':['תיקון','repair','fix','maintenance','rework'],
'תיקון':['repair','fix','maintenance','rework'],
'maintenance':['תחזוקה','maintenance','service','upkeep'],
'תחזוקה':['maintenance','service','repair','upkeep'],
'test':['בדיקה','test','inspection','check','verify'],
'בדיקה':['test','inspection','check','verify'],
'inspection':['בדיקה','inspection','check','verify','qa'],
'torque':['מומנט','torque','tightening','nm','ft-lb'],
'מומנט':['torque','tightening','nm','force'],

/* ══════════════════════════════════════
   מאפיינים / CHARACTERISTICS
══════════════════════════════════════ */
'high temperature':['טמפרטורה גבוהה','high temp','heat resistant','מחבר חום'],
'טמפרטורה גבוהה':['high temperature','high temp','heat','thermal'],
'vibration':['רטט','vibration','shock','mechanical stress'],
'רטט':['vibration','shock','vibration resistant'],
'flexible':['גמיש','flexible','flex','bending'],
'גמיש':['flexible','flex','soft','bending'],
'rigid':['נוקשה','rigid','stiff','hard'],
'compact':['קומפקטי','compact','small','miniature','tiny'],
'lightweight':['קל משקל','light','lightweight','low weight'],
'קל משקל':['lightweight','light','low mass'],
'miniature':['מיניאטורי','mini','small','compact','tiny'],
'heavy duty':['עמיד','robust','rugged','industrial','כבד'],
'rugged':['עמיד','rugged','robust','military grade','heavy duty'],
'עמיד':['rugged','robust','heavy duty','durable'],

/* ══════════════════════════════════════
   ספקים ויצרנים נוספים
══════════════════════════════════════ */
'deutsch':['dtm','dt','dtp','hdp','connector'],
'souriau':['utx','uta','circular','military','connector'],
'glenair':['backshell','military','circular','connector'],
'radiall':['rf','coax','connector','sma'],
'lemo':['circular','push-pull','medical','instrument','connector'],
'hirose':['small','miniature','connector','japanese'],
'phoenix contact':['terminal block','industrial','connector'],
'weidmuller':['terminal block','industrial','connector'],
'harting':['han','industrial','rectangular','connector'],
'itt cannon':['circular','military','connector','cannon'],
'cannon':['circular','connector','military','xcd'],
};

/* ═══════════════════════════════════════════════════════
   פונקציות עזר לשימוש מה-HTML
═══════════════════════════════════════════════════════ */

// מחזיר כל המונחים הקשורים לשאילתה
function dazuraExpand(query) {
  const tokens = String(query||'').toLowerCase()
    .replace(/[^\w\u0590-\u05ff\s]/g,' ')
    .split(/\s+/).filter(w => w.length > 1);
  
  const all = new Set(tokens);
  
  tokens.forEach(t => {
    // התאמה מדויקת
    if (DAZURA_DICT[t]) {
      DAZURA_DICT[t].forEach(s => all.add(s.toLowerCase()));
    }
    // התאמה חלקית (t מתחיל ב...)
    Object.keys(DAZURA_DICT).forEach(key => {
      if (key.length >= 3 && t.length >= 3 && 
          (key.startsWith(t) || t.startsWith(key))) {
        all.add(key);
        DAZURA_DICT[key].forEach(s => all.add(s.toLowerCase()));
      }
    });
  });
  
  return [...all];
}

// מחזיר ציון התאמה סמנטי (0-100)
function dazuraScore(query, itemText) {
  const expanded = dazuraExpand(query);
  const text = itemText.toLowerCase();
  let score = 0;
  
  expanded.forEach(term => {
    if (term.length < 2) return;
    if (text.includes(term)) {
      // מונחים ארוכים = ציון גבוה יותר
      score += Math.min(40, term.length * 4);
    }
  });
  
  return Math.min(score, 100);
}

console.log('[Dazura] Semantic dictionary loaded:', 
  Object.keys(DAZURA_DICT).length, 'terms');
