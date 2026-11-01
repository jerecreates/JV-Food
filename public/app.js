/* JV Food — app de nutrición de Jere y Vale */
"use strict";
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, "0");
const ds = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const pd = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addD = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const sunday = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - x.getDay()); return x; };
const monday = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const wd = d => (d.getDay() + 6) % 7; // 0 = lunes
const nf = (n, dg = 0) => Number(n).toLocaleString("es-AR", { minimumFractionDigits: dg, maximumFractionDigits: dg });
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const TODAY = new Date(), TODS = ds(TODAY);
const DN = ["L", "M", "X", "J", "V", "S", "D"], DFULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MESF = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const END = new Date(2027, 2, 31);
const other = u => (u === "jere" ? "vale" : "jere");

/* =================== Alimentos (valores por 100 g/ml, o por unidad si u = "u") =================== */
const CATS = ["Carne y pescado", "Huevos, lácteos y fiambres", "Frutas y verduras", "Congelados", "Despensa"];
const I = {
  pollo:{n:"Pechuga de pollo",u:"g",e:"🍗",cat:0,g:"pollo",p:23,c:0,f:1.5,batch:"Al horno a 200 °C, 20-25 min, con pimentón, ajo y limón."},
  contra:{n:"Contramuslo de pollo sin piel",u:"g",e:"🍗",cat:0,g:"pollo",p:19,c:0,f:6},
  pavo:{n:"Pechuga de pavo",u:"g",e:"🦃",cat:0,g:"pavo",p:24,c:0,f:1,batch:"A la plancha en tiras, 6-8 min."},
  ternera:{n:"Ternera magra picada",u:"g",e:"🥩",cat:0,g:"ternera",p:20,c:0,f:6},
  filete:{n:"Filete de ternera",u:"g",e:"🥩",cat:0,g:"ternera",p:22,c:0,f:4},
  lomo:{n:"Lomo de cerdo",u:"g",e:"🥩",cat:0,g:"cerdo",p:21,c:0,f:5},
  salmon:{n:"Salmón",u:"g",e:"🐟",cat:0,g:"salmón",p:20,c:0,f:13},
  merluza:{n:"Merluza o bacalao",u:"g",e:"🐟",cat:3,g:"pescado blanco",p:17,c:0,f:1.5},
  gambas:{n:"Gambas o langostinos pelados",u:"g",e:"🦐",cat:3,g:"gambas",p:20,c:0,f:1},
  atun:{n:"Atún al natural",u:"u",one:"lata de atún al natural",many:"latas de atún al natural",e:"🐟",cat:4,g:"atún",p:20,c:0,f:1},
  huevo:{n:"Huevos",u:"u",one:"huevo",many:"huevos",e:"🥚",cat:1,g:"huevo",p:6.5,c:0.4,f:5.5},
  claras:{n:"Claras de huevo",u:"g",e:"🥚",cat:1,g:"huevo",p:11,c:0.7,f:0.2},
  skyr:{n:"Skyr natural",u:"g",e:"🥛",cat:1,g:"yogur",p:11,c:4,f:0.2},
  cottage:{n:"Queso cottage",u:"g",e:"🧀",cat:1,g:"cottage",p:11,c:3.4,f:4},
  queso:{n:"Queso tierno en lonchas",u:"g",e:"🧀",cat:1,g:"queso",p:25,c:0.5,f:27},
  feta:{n:"Queso feta",u:"g",e:"🧀",cat:1,g:"queso",p:14,c:1,f:21},
  jamon:{n:"Jamón cocido extra",u:"g",e:"🍖",cat:1,g:"fiambre",p:19,c:1,f:3},
  salmonA:{n:"Salmón ahumado",u:"g",e:"🐟",cat:1,g:"salmón ahumado",p:22,c:0,f:5},
  leche:{n:"Leche",u:"ml",e:"🥛",cat:1,g:"leche",p:3.2,c:4.7,f:3.6},
  harAlm:{n:"Harina de almendra",u:"g",e:"🌰",cat:4,g:"harina de almendra",p:21,c:7,f:50},
  chia:{n:"Semillas de chía",u:"g",e:"🌱",cat:4,g:"semillas",p:17,c:8,f:31},
  lino:{n:"Semillas de lino",u:"g",e:"🌱",cat:4,g:"semillas",p:18,c:2,f:42},
  nueces:{n:"Nueces",u:"g",e:"🌰",cat:4,g:"frutos secos",p:15,c:4,f:65},
  almendras:{n:"Almendras",u:"g",e:"🌰",cat:4,g:"frutos secos",p:21,c:6,f:50},
  coco:{n:"Leche de coco sin azúcar",u:"ml",e:"🥥",cat:4,g:"coco",p:0.5,c:1.5,f:5},
  aguacate:{n:"Aguacate",u:"g",e:"🥑",cat:2,g:"aguacate",p:2,c:2,f:15,per:150},
  aceitunas:{n:"Aceitunas",u:"u",one:"aceituna",many:"aceitunas",e:"🫒",cat:4,g:"aceitunas",p:0.03,c:0.04,f:0.6},
  manzana:{n:"Manzanas",u:"u",one:"manzana",many:"manzanas",e:"🍎",cat:2,g:"fruta",p:0.5,c:22,f:0.3},
  pera:{n:"Peras",u:"u",one:"pera",many:"peras",e:"🍐",cat:2,g:"fruta",p:0.6,c:24,f:0.2},
  kiwi:{n:"Kiwis",u:"u",one:"kiwi",many:"kiwis",e:"🥝",cat:2,g:"fruta",p:0.8,c:9,f:0.4},
  frutos:{n:"Frutos rojos",u:"g",e:"🫐",cat:3,g:"frutos rojos",p:1,c:8,f:0.4},
  arroz:{n:"Arroz (en crudo)",u:"g",e:"🍚",cat:4,g:"arroz",p:7,c:78,f:0.6,batch:"Hervido; dura 4 días en la heladera."},
  quinoa:{n:"Quinoa (en crudo)",u:"g",e:"🍚",cat:4,g:"quinoa",p:14,c:58,f:6,batch:"Hervida, 15 min."},
  patata:{n:"Patata",u:"g",e:"🥔",cat:2,g:"patata",p:2,c:17,f:0.1,batch:"En dados, al horno a 200 °C, 35 min."},
  boniato:{n:"Boniato",u:"g",e:"🍠",cat:2,g:"boniato",p:1.6,c:20,f:0.1,batch:"En dados, al horno a 200 °C, 35 min."},
  verd:{n:"Verduras para asar (pimiento, calabacín, cebolla)",u:"g",e:"🫑",cat:2,g:"verduras",p:1.2,c:4.5,f:0.2,batch:"Bandeja al horno a 200 °C, 30-35 min."},
  calabacin:{n:"Calabacín",u:"g",e:"🥒",cat:2,g:"verduras",p:1.2,c:2.5,f:0.3},
  zanahoria:{n:"Zanahoria",u:"g",e:"🥕",cat:2,g:"verduras",p:0.9,c:7,f:0.2},
  cebolla:{n:"Cebolla",u:"g",e:"🧅",cat:2,g:"verduras",p:1.1,c:8,f:0.1},
  ens:{n:"Ensalada (lechuga, tomate, pepino)",u:"g",e:"🥗",cat:2,g:"ensalada",p:1.2,c:2.5,f:0.2},
  cherry:{n:"Tomates cherry",u:"g",e:"🍅",cat:2,g:"tomate",p:0.9,c:3.5,f:0.2},
  tomTri:{n:"Tomate triturado natural",u:"g",e:"🍅",cat:4,g:"tomate",p:1.3,c:4,f:0.2},
  champi:{n:"Champiñones",u:"g",e:"🍄",cat:2,g:"verduras",p:3,c:1,f:0.3},
  esparr:{n:"Espárragos verdes",u:"g",e:"🌿",cat:2,g:"verduras",p:2.2,c:2,f:0.1},
  brocoli:{n:"Brócoli",u:"g",e:"🥦",cat:3,g:"verduras",p:2.8,c:4,f:0.4},
  coliflor:{n:"Coliflor",u:"g",e:"🥦",cat:2,g:"verduras",p:2,c:3,f:0.3},
  espinaca:{n:"Espinaca",u:"g",e:"🥬",cat:2,g:"verduras",p:2.9,c:1.5,f:0.4},
  wok:{n:"Verdura para wok",u:"g",e:"🥦",cat:3,g:"verduras",p:2,c:4,f:0.3}
};
const GW = {pollo:3,pavo:3,ternera:3,cerdo:3,"salmón":3,"pescado blanco":3,gambas:3,"atún":3,huevo:2,fiambre:2,yogur:2,cottage:2,verduras:1,ensalada:1,tomate:1,fruta:1,"frutos rojos":1,semillas:1};

/* =================== Platos ===================
   it: [ingrediente, cantidad Vale, cantidad Jere]. carb: almidón que suma Jere solo en la cena de los días de entreno. */
const D = {
  // Desayunos
  b1:{n:"Huevos revueltos con jamón y tomate",s:["des"],it:[["huevo",2,3],["claras",0,100],["jamon",50,60],["queso",20,20],["cherry",150,150]],h:"Revuelto a fuego bajo con una pincelada de ghee o aceite de coco. Los tomates, salteados o crudos al lado."},
  b2:{n:"Pancakes sirena con frutos rojos",s:["des","mer"],it:[["huevo",1,1],["claras",33,150],["harAlm",10,15],["frutos",100,100],["skyr",100,150],["nueces",15,15]],h:"Batí huevo y claras con la harina de almendra, unas gotas de stevia y vainilla. Sartén pincelada con ghee, fuego bajo y tapado. Frutos rojos arriba (Jere, con skyr)."},
  b3:{n:"Skyr con manzana y nueces",s:["des","mer"],it:[["skyr",200,300],["manzana",1,1],["nueces",20,20]],h:"Manzana verde en cubos y nueces picadas por arriba. Canela si querés."},
  b4:{n:"Chía pudding con frutos rojos",s:["des","mer"],it:[["chia",24,24],["leche",200,200],["frutos",80,80],["almendras",15,15],["skyr",0,200]],h:"La noche anterior: chía con la leche, vainilla y unas gotas de stevia; a la heladera mínimo 2 h. Frutos rojos arriba (Jere, con skyr)."},
  b5:{n:"Pan sirenil con jamón y queso",s:["des"],it:[["lino",24,24],["huevo",1,2],["jamon",40,60],["queso",20,20],["cherry",100,100]],h:"Mezclá lino o chía molidos con el huevo y una pizca de sal. 2 min al microondas al 70 % en un bol pincelado con ghee. Abrilo y rellená."},
  b6:{n:"Revuelto con salmón ahumado y aguacate",s:["des"],it:[["huevo",2,3],["claras",0,100],["salmonA",40,60],["aguacate",40,40]],h:"Revuelto a fuego bajo. El salmón y el aguacate van al final, en frío."},
  // Meriendas
  m1:{n:"Cottage con frutos rojos y almendras",s:["mer"],it:[["cottage",200,250],["frutos",100,100],["almendras",15,15]],h:"Todo en un bowl. Las almendras, mejor tostadas."},
  m2:{n:"Atún con aguacate y tomate",s:["mer"],it:[["atun",1,2],["aguacate",70,50],["cherry",100,150]],h:"Aguacate pisado con limón y pimienta, atún escurrido y tomates."},
  m3:{n:"Skyr con kiwi y crunchi",s:["mer","des"],it:[["skyr",200,250],["kiwi",1,1],["almendras",10,10],["lino",5,5]],h:"Crunchi: almendras picadas y semillas tostadas en sartén con una cucharadita de aceite de coco; se guarda en frasco."},
  m4:{n:"Pera con jamón y queso feta",s:["mer"],it:[["pera",1,1],["jamon",50,80],["feta",30,20],["skyr",0,150]],h:"Pera en láminas con el jamón y el feta desmenuzado. Jere suma un skyr."},
  // Comidas
  l1:{n:"Cerdo salteado con zanahoria y cebolla",s:["com"],it:[["lomo",170,200],["zanahoria",100,120],["cebolla",80,80]],h:"Lomo en tiras, salteado en sartén bien caliente con ajo, la zanahoria en bastones y la cebolla. 12 min."},
  l2:{n:"Pollo al horno con verduras asadas",s:["com"],it:[["pollo",170,220],["verd",250,300]],h:"Pollo y verduras en la misma bandeja, 200 °C, 25-30 min. Sale del batch."},
  l3:{n:"Hamburguesas caseras con ensalada",s:["com"],it:[["ternera",160,200],["ens",200,250],["cebolla",30,30]],h:"Carne con ajo, perejil y sal; plancha 4 min por lado. Sin pan."},
  l4:{n:"Pavo con champiñones y espárragos",s:["com"],it:[["pavo",170,220],["champi",150,150],["esparr",150,150],["aguacate",40,0]],h:"Pavo a la plancha; champiñones y espárragos salteados con ajo."},
  l5:{n:"Ensalada completa de atún, huevo y aceitunas",s:["com"],it:[["atun",1,2],["huevo",1,1],["ens",250,250],["cherry",100,100],["aceitunas",6,4],["aguacate",40,0]],h:"Con aceitunas, sin agregar aceite. Vinagre de manzana o limón."},
  l6:{n:"Pollo al curry con verduras",s:["com"],it:[["contra",170,220],["wok",250,300],["coco",50,60]],h:"Sartén grande: pollo, verdura, leche de coco y curry. 15 min."},
  l7:{n:"Albóndigas en salsa de tomate con calabacín",s:["com"],it:[["ternera",160,200],["tomTri",150,150],["calabacin",200,250]],h:"Albóndigas al horno 15 min y después 10 min en la salsa. Calabacín en tiras salteado."},
  // Cenas
  d1:{n:"Ternera con calabacín y tomates cherry",s:["cen"],it:[["filete",170,200],["calabacin",200,200],["cherry",100,100]],carb:["patata",300],h:"Filete a la plancha; calabacín y cherry salteados."},
  d2:{n:"Salmón al horno con brócoli",s:["cen"],it:[["salmon",170,180],["brocoli",250,250]],carb:["arroz",70],h:"Horno a 200 °C, 12-15 min, todo en la misma bandeja."},
  d3:{n:"Merluza al horno con verduras",s:["cen"],it:[["merluza",200,250],["verd",250,250],["aceitunas",5,0]],carb:["boniato",250],h:"Pescado sobre la verdura, 200 °C, 15 min."},
  d4:{n:"Gambas al ajillo con espárragos y champiñones",s:["cen"],it:[["gambas",200,250],["esparr",150,150],["champi",100,100],["aguacate",40,0]],carb:["arroz",70],h:"Sartén bien caliente con ajo y guindilla, 6-8 min."},
  d5:{n:"Pollo con puré de coliflor",s:["cen"],it:[["pollo",170,220],["coliflor",300,300]],carb:["patata",300],h:"Coliflor hervida y pisada con una pizca de nuez moscada. Jere mezcla la patata en su parte del puré."},
  d6:{n:"Pavo con verduras salteadas",s:["cen"],it:[["pavo",170,220],["wok",250,250]],carb:["quinoa",70],h:"Pavo en tiras salteado con la verdura y salsa de soja sin azúcar."}
};
const SLOTS = ["des", "com", "mer", "cen"];
const LIST = Object.fromEntries(SLOTS.map(s => [s, Object.keys(D).filter(id => D[id].s.includes(s))]));

/* =================== Usuarios =================== */
const MEALS = {
  jere: [["Desayuno", "8:30"], ["Comida", "13:30"], ["Merienda", "16:30"], ["Cena", "21:00"]],
  vale: [["Desayuno", "8:30"], ["Comida", "13:30"], ["Merienda", "17:00"], ["Cena", "21:00"]]
};
const U = {
  jere: {
    name: "Jere", oil: 20, types: {
      calis: { lab: "Calistenia", dot: "t-calis", k: 1850, p: 170, c: 110, f: 70, water: 12, train: true, note: "Calistenia a la tarde: la merienda es tu pre-entreno y la cena, con almidón, el post." },
      fit: { lab: "Fitboxing", dot: "t-fit", k: 1900, p: 170, c: 110, f: 75, water: 14, train: true, note: "Fitboxing: merienda con fruta 1-2 h antes y almidón en la cena. Agua con una pizca de sal; meta de 3,5 L." },
      rest: { lab: "Descanso", dot: "t-rest", k: 1550, p: 170, c: 60, f: 65, water: 12, train: false, note: "Descanso: mismos platos que Vale, sin almidón en la cena. 10.000 pasos." }
    },
    sched: ["calis", "fit", "rest", "calis", "fit", "rest", "rest"],
    start: 104.2, goal: 85.6, h: 176, age: 30, male: true, ffm: 68.5, goalTxt: "85,6 kg · 20 % de grasa"
  },
  vale: {
    name: "Vale", oil: 20, sirenas: true, types: {
      gym: { lab: "Gimnasio", dot: "t-gym", water: 12, train: true, note: "Día de gimnasio. Plato: ¼ proteína, ½ vegetales y la grasa de la cocción." },
      rest: { lab: "Descanso", dot: "t-rest", water: 12, train: false, note: "Día de descanso: mismo plan Sirenas y 10.000 pasos." }
    },
    sched: ["gym", "gym", "rest", "gym", "gym", "rest", "rest"],
    start: 74, goal: 58, h: 167, male: false, goalTxt: "58 kg"
  }
};

/* =================== Estado y sincronización =================== */
const CK = "jsfood-v3";
let C = { auth: null, docs: { jere: {}, vale: {}, shared: {} }, pending: [] };
try { Object.assign(C, JSON.parse(localStorage.getItem(CK) || "{}")); } catch (e) {}
let MODE = "remote", ME = null, view = "hoy";
const saveC = () => { try { localStorage.setItem(CK, JSON.stringify(C)); } catch (e) {} };
const doc = u => (C.docs[u] ||= {});
const get = (u, key, sub) => (doc(u)[key] || {})[sub];
function put(u, key, sub, val) {
  const d = doc(u); d[key] ||= {};
  if (val === null || val === undefined) delete d[key][sub]; else d[key][sub] = val;
  C.pending.push({ doc: u, key, sub, val: val ?? null });
  saveC(); scheduleFlush();
}
const hdrs = () => ({ "content-type": "application/json", "x-user": C.auth?.user || "", "x-pin": C.auth?.pin || "" });
let flushT = null;
function scheduleFlush() { if (MODE !== "remote") { C.pending = []; saveC(); return; } clearTimeout(flushT); flushT = setTimeout(flush, 500); }
async function flush() {
  if (MODE !== "remote" || !C.pending.length) return;
  const ops = C.pending.slice(0, 400);
  try {
    const r = await fetch("/api/ops", { method: "POST", headers: hdrs(), body: JSON.stringify({ ops }) });
    if (r.status === 401) return logout();
    if (!r.ok) throw new Error(r.status);
    C.pending = C.pending.slice(ops.length); saveC(); setSync(false);
    if (C.pending.length) flush();
  } catch (e) { setSync(true); }
}
async function pull() {
  if (MODE !== "remote") return;
  try {
    const r = await fetch("/api/state", { headers: hdrs() });
    if (r.status === 401) return logout();
    if (!r.ok) throw new Error(r.status);
    const data = await r.json();
    C.docs = { jere: data.jere || {}, vale: data.vale || {}, shared: data.shared || {} };
    for (const op of C.pending) { const d = doc(op.doc); d[op.key] ||= {}; if (op.val === null) delete d[op.key][op.sub]; else d[op.key][op.sub] = op.val; }
    saveC(); setSync(false);
    if (!$("#m-log").hidden || !$("#m-day").hidden) return; // no repintar con un modal abierto
    render(); flush();
  } catch (e) { setSync(true); }
}
function setSync(err) { const el = $("#sync"); if (el) el.textContent = err ? "● sin conexión" : ""; }

/* =================== Lógica de plan =================== */
const kcalOf = o => Math.round(o.p * 4 + o.c * 4 + o.f * 9 + (o.a || 0) * 7);
const weekNo = d => Math.round((monday(d) - new Date(2026, 0, 5)) / 604800000);
const defType = (u, date) => U[u].sched[wd(pd(date))];
const typeKey = (u, date) => { const t = get(u, "tipo", date); return U[u].types[t] ? t : defType(u, date); };
const typeOf = (u, date) => U[u].types[typeKey(u, date)];
const isTrain = (u, date) => typeOf(u, date).train;
function defChoice(date, mi) { const l = LIST[SLOTS[mi]], w = Math.abs(weekNo(pd(date))); return l[(w * 3 + wd(pd(date)) + mi * 2) % l.length]; }
function choice(u, date, mi) {
  const l = LIST[SLOTS[mi]], own = get(u, "sel2", date + ":" + mi), sh = get("shared", "menu", date + ":" + mi);
  if (l.includes(own)) return own;
  if (l.includes(sh)) return sh;
  return defChoice(date, mi);
}
// Ingredientes de un plato para una persona en una fecha (incluye el almidón de Jere en la cena de entreno)
function portion(id, u, date, mi) {
  const d = D[id], col = u === "vale" ? 1 : 2;
  const out = d.it.filter(x => x[col] > 0).map(x => [x[0], x[col]]);
  if (u === "jere" && d.carb && SLOTS[mi] === "cen" && isTrain("jere", date)) out.push([d.carb[0], d.carb[1]]);
  return out;
}
function macros(list) {
  const t = { p: 0, c: 0, f: 0 };
  list.forEach(([k, q]) => { const it = I[k], m = it.u === "u" ? q : q / 100; t.p += it.p * m; t.c += it.c * m; t.f += it.f * m; });
  t.p = Math.round(t.p); t.c = Math.round(t.c); t.f = Math.round(t.f); t.k = kcalOf(t); return t;
}
const logOf = (u, date, mi) => get(u, "log", date + ":" + mi);
const extrasOf = (u, date) => get(u, "extra", date) || [];
function mealMacros(u, date, mi) { const lg = logOf(u, date, mi); if (lg) return lg; return macros(portion(choice(u, date, mi), u, date, mi)); }
function totals(u, date) {
  const t = { p: 0, c: 0, f: U[u].oil, a: 0 };
  for (let mi = 0; mi < 4; mi++) { const m = mealMacros(u, date, mi); t.p += m.p; t.c += m.c; t.f += m.f; t.a += m.a || 0; }
  extrasOf(u, date).forEach(x => { t.p += x.p; t.c += x.c; t.f += x.f; t.a += x.a || 0; });
  t.p = Math.round(t.p); t.c = Math.round(t.c); t.f = Math.round(t.f); t.k = kcalOf(t); return t;
}
const isDone = (u, date, mi) => !!(get(u, "done", date + ":" + mi) || logOf(u, date, mi));
const mealsDone = (u, date) => [0, 1, 2, 3].filter(mi => isDone(u, date, mi)).length;
function eggCount(u, date) { let n = 0; for (let mi = 0; mi < 4; mi++) { if (logOf(u, date, mi)) continue; portion(choice(u, date, mi), u, date, mi).forEach(([k, q]) => { if (k === "huevo") n += q; }); } return n; }
const emos = list => [...new Set(list.map(([k]) => I[k].e))].slice(0, 4).join("");
function ingTxt([k, q]) { const it = I[k]; if (it.u === "u") return `${q} ${q === 1 ? it.one : it.many}`; return `${q} ${it.u} de ${it.n.charAt(0).toLowerCase() + it.n.slice(1)}`; }
function ring(frac, col, size = 112, sw = 11) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, frac));
  return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="trk" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${sw}"/><circle class="arc" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${sw}" stroke="${col}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - f)}"/></svg>`;
}
function dayNote(u, date) {
  const k = wd(pd(date));
  let n = typeOf(u, date).note;
  if (k === 6) n += " Hoy toca planificar la semana, la compra y el batch grande.";
  if (k === 2) n += " Compra 2 y batch corto.";
  if (u === "jere" && k === 5) n += " Comida libre: una comida a elección, sin compensar.";
  return n;
}
function premio(date) {
  const k = wd(pd(date)), t = typeKey("jere", date);
  if (k === 5) return "hfree";
  if (t === "calis") return "merc";
  if (t === "fit") return k === 4 ? "h1" : "c85";
  return null;
}
const SW = {
  merc: { n: "Chocolate cero azúcares", k: 100, e: "🍫", d: "2 onzas (unos 20 g) del de Mercadona, después de la cena." },
  c85: { n: "Chocolate negro 85 %", k: 120, e: "🍫", d: "2 onzas, unos 20 g. Dejalo derretir en la boca." },
  h1: { n: "Helado en Chocolates · 1 bocha", k: 150, e: "🍨", d: "1 bocha chica en vasito, sin cono ni toppings. Cierre de la semana de entreno." },
  hfree: { n: "Helado en Chocolates · libre", k: 0, e: "🍨", d: "Es tu comida libre: el sabor y el tamaño que quieras, sin culpa y sin compensar." }
};
// Círculo del día (Sirenas para Vale; versión corta para Jere)
function circle(u, date) {
  const t = typeOf(u, date), vasos = get(u, "agua", date) || 0;
  const items = [
    { k: "agua", i: "💧", l: "3 L agua", on: vasos >= 12, auto: true },
    { k: "comidas", i: "🍽️", l: "4 comidas", on: mealsDone(u, date) === 4, auto: true },
    { k: "sueno", i: "😴", l: "Sueño", on: !!get(u, "sueno", date) },
    { k: "ent", i: t.train ? "🏋️" : "🚶", l: t.train ? "Entreno" : "10.000 pasos", on: !!get(u, "ent", date) }
  ];
  if (U[u].sirenas) items.push({ k: "extras", i: "✨", l: "Extras", on: !!get(u, "extras", date) });
  return items;
}

/* =================== Equivalentes =================== */
const EQ = {
  pollo:[["pechuga de pavo",1],["lomo de cerdo",1],["merluza",1.2],["gambas",1.2]],
  contra:[["pechuga de pollo",1],["muslo de pavo sin piel",1]],
  pavo:[["pechuga de pollo",1],["lomo de cerdo",1],["merluza",1.2]],
  ternera:[["pavo picado",1],["pollo picado",1],["cerdo magro picado",1]],
  filete:[["lomo de cerdo",1],["pechuga de pollo",1],["solomillo de cerdo",1]],
  lomo:[["pechuga de pollo",1],["solomillo de cerdo",1],["filete de ternera",1]],
  salmon:[["caballa",1],["trucha",1],["sardinas",1]],
  salmonA:[["jamón cocido extra",1],["atún al natural",1]],
  merluza:[["abadejo",1],["lenguado",1],["gallo",1]],
  gambas:[["langostinos",1],["mejillones (sin cáscara)",1.2],["merluza",1]],
  atun:[["caballa al natural (lata)",1,"u"],["sardinas al natural (lata)",1,"u"],["pechuga de pollo cocida",60,"g"]],
  huevo:[["claras de huevo",60,"g"]],
  claras:[["huevo entero",1/60,"u"]],
  skyr:[["yogur griego natural sin azúcar",1],["queso fresco batido 0 %",1]],
  cottage:[["queso fresco batido 0 %",1],["ricota",0.8]],
  queso:[["queso feta",1],["queso fresco",1.5]],
  feta:[["queso tierno",1],["ricota",1.5]],
  jamon:[["pechuga de pavo en lonchas",1],["lomo embuchado",0.7]],
  leche:[["leche de almendras sin azúcar",1],["leche de coco sin azúcar",1]],
  harAlm:[["harina de coco",1],["coco rallado",1]],
  chia:[["lino molido",1]],
  lino:[["chía",1]],
  nueces:[["almendras",1],["avellanas",1],["castañas de cajú",1]],
  almendras:[["nueces",1],["avellanas",1],["pistachos",1]],
  coco:[["yogur griego natural",1,"g"]],
  aguacate:[["aceite de oliva",0.15,"ml"],["aceitunas",0.15,"u"],["nueces",0.25]],
  aceitunas:[["aguacate",7,"g"]],
  manzana:[["pera",1,"u"],["2 mandarinas",1,"u"],["kiwi",1,"u"],["frutos rojos",150,"g"]],
  pera:[["manzana",1,"u"],["2 mandarinas",1,"u"],["kiwi",1,"u"],["frutos rojos",150,"g"]],
  kiwi:[["mandarina",1,"u"],["frutos rojos",100,"g"],["fresas",120,"g"]],
  frutos:[["fresas",1],["arándanos",0.7],["kiwi",1/100,"u"]],
  arroz:[["quinoa",1],["pasta integral",1],["patata",4]],
  quinoa:[["arroz",1],["cuscús",1],["patata",3.6]],
  patata:[["boniato",0.85],["arroz (en crudo)",0.23]],
  boniato:[["patata",1.15],["arroz (en crudo)",0.25]],
  verd:[["berenjena, judías verdes o coliflor",1]],
  calabacin:[["berenjena",1],["judías verdes",1]],
  zanahoria:[["pimiento",1],["calabaza (máx. 3 veces por semana)",1]],
  cebolla:[["puerro",1],["pimiento",1]],
  ens:[["rúcula, canónigos o espinaca",1]],
  cherry:[["tomate común",1],["pepino",1]],
  tomTri:[["tomate natural rallado",1.3]],
  champi:[["setas o portobellos",1],["berenjena",1]],
  esparr:[["judías verdes",1],["brócoli",1],["calabacín",1]],
  brocoli:[["coliflor",1],["judías verdes",1]],
  coliflor:[["brócoli",1],["calabacín",1]],
  espinaca:[["acelga",1],["kale",1]],
  wok:[["verdura congelada mixta",1],["brócoli",1]]
};
const SIR_BAD = /patata|boniato|arroz|quinoa|pasta|cuscús|plátano/i;
function fq(v, u, lab) {
  if (u === "u") { const n = Math.max(1, Math.round(v * 2) / 2); return `${nf(n, n % 1 ? 1 : 0)} × ${lab}`; }
  const r = v < 20 ? Math.round(v) : v < 100 ? Math.round(v / 5) * 5 : Math.round(v / 10) * 10;
  return `${r} ${u} de ${lab}`;
}
function eqLine(k, q, u) {
  const it = I[k]; let list = EQ[k]; if (!list) return "";
  if (u && U[u].sirenas) list = list.filter(x => !SIR_BAD.test(x[0]));
  if (!list.length) return "";
  const subs = list.map(([lab, f, uu]) => fq(q * f, uu || it.u, lab));
  const base = it.u === "u" ? `${q} × ${it.one}` : `${q} ${it.u} de ${it.n.charAt(0).toLowerCase() + it.n.slice(1)}`;
  return `<li><span class="eq-from">${it.e} ${base}</span><span class="eq-to">${subs.join(" · ")}</span></li>`;
}
const eqBlock = (list, u) => `<details class="eq"><summary>⇄ ¿Te falta algo? Equivalentes</summary><ul>${list.map(([k, q]) => eqLine(k, q, u)).join("")}</ul></details>`;
function eqCard() {
  const groups = CATS.map((c, ci) => {
    const ks = Object.keys(I).filter(k => I[k].cat === ci && EQ[k]); if (!ks.length) return "";
    return `<div class="lbl" style="margin-top:6px">${c}</div><ul>${ks.map(k => eqLine(k, I[k].u === "u" ? 1 : (k === "aguacate" ? 40 : 100))).join("")}</ul>`;
  }).join("");
  return `<div class="card"><details class="eq eq-all"><summary>⇄ Equivalentes de alimentos</summary><p class="small muted">Si no conseguís algo, cambialo por cualquiera de estas opciones en la cantidad indicada. Patata, boniato, arroz y similares son solo para Jere.</p>${groups}</details></div>`;
}

/* =================== Navegación de semana =================== */
let weekStart = sunday(TODAY), dayIdx = TODAY.getDay(), pickMode = "both";
const curDate = () => ds(addD(weekStart, dayIdx));
function strip(sel, attr, u) {
  const days = [...Array(7)].map((_, i) => {
    const d = addD(weekStart, i), s = ds(d), k = wd(d);
    return `<button class="day${s === TODS ? " today" : ""}" id="${attr}-${i}" data-${attr}="${i}" aria-pressed="${i === sel}" aria-label="${DFULL[k]} ${d.getDate()}"><span class="dn">${DN[k]}</span><span class="dd">${d.getDate()}</span><span class="dt ${typeOf(u, s).dot}"></span></button>`;
  }).join("");
  return `<div class="strip"><button class="nav" data-wk="-1" aria-label="Semana anterior">‹</button><div class="days">${days}</div><button class="nav" data-wk="1" aria-label="Semana siguiente">›</button></div>`;
}

/* =================== HOY =================== */
function renderHoy() {
  const u = ME, o = other(u), cfg = U[u], date = curDate(), dObj = pd(date), k = wd(dObj), tk = typeKey(u, date), t = cfg.types[tk], tot = totals(u, date);
  const done = mealsDone(u, date), changed = tk !== defType(u, date);
  const seg = Object.entries(cfg.types).map(([key, ty]) => `<button data-type="${key}" aria-pressed="${key === tk}"><span class="dt ${ty.dot}"></span>${ty.lab}</button>`).join("");
  const mb = (lab, v, tg, col, ref) => `<div class="mrow"><div class="mt"><span class="muted">${lab}</span><span><b>${v}</b><span class="muted">${tg ? ` / ${tg}` : ""} g</span></span></div><div class="bar"><i style="width:${Math.min(100, v / (tg || ref) * 100)}%;background:${col}"></i></div></div>`;
  const vasos = get(u, "agua", date) || 0;
  const glasses = [...Array(t.water)].map((_, i) => `<button class="glass${i < vasos ? " on" : ""}" data-g="${i}" aria-label="Vaso ${i + 1}"></button>`).join("");
  const circ = circle(u, date), cOn = circ.filter(x => x.on).length;
  const circHTML = `<div class="circ${circ.length === 4 ? " c4" : ""}">${circ.map(x => `<button class="cb${x.on ? " on" : ""}${x.auto ? " auto" : ""}" ${x.auto ? `data-auto="${x.k}"` : `data-circ="${x.k}"`} aria-pressed="${x.on}"><span class="ci">${x.i}</span>${x.l}</button>`).join("")}</div>`;
  const ringHTML = cfg.sirenas
    ? `<div class="ring">${ring(cOn / circ.length, "var(--accent)")}<div class="ctr"><span class="big">${cOn}/${circ.length}</span><span class="of">círculo de luces</span></div></div>`
    : `<div class="ring">${ring(tot.k / t.k, "var(--accent)")}<div class="ctr"><span class="big">${nf(tot.k)}</span><span class="of">de ${nf(t.k)} kcal</span></div></div>`;
  const macroHTML = cfg.sirenas
    ? `${mb("Proteína", tot.p, 0, "var(--prot)", 130)}${mb("Carbos", tot.c, 0, "var(--carb)", 150)}${mb("Grasa", tot.f, 0, "var(--fat)", 100)}<div class="small muted mono">≈ ${nf(tot.k)} kcal estimadas</div>`
    : `${mb("Proteína", tot.p, t.p, "var(--prot)")}${mb("Carbos", tot.c, t.c, "var(--carb)")}${mb("Grasa", tot.f, t.f, "var(--fat)")}`;
  const eggs = cfg.sirenas ? eggCount(u, date) : 0;

  const meals = [0, 1, 2, 3].map(mi => mealCard(u, o, date, mi)).join("");
  const ex = extrasOf(u, date);
  const exHTML = `<div class="card"><div class="wh"><h3>Fuera del plan</h3><button class="pill" data-addx="1">＋ Agregar</button></div>
    ${ex.length ? `<div class="extras">${ex.map((x, i) => `<div class="xrow"><span>${x.sweet ? "🍫 " : ""}${esc(x.n)} <span class="mono small muted">${x.k} kcal · P ${x.p}</span></span><button class="del" data-delx="${i}" aria-label="Borrar">×</button></div>`).join("")}</div>`
      : `<p class="small muted">Un picoteo, una bebida o algo que comiste aparte. Contalo y la IA estima las calorías.</p>`}</div>`;

  $("#v-hoy").innerHTML = `
   ${strip(dayIdx, "day", u)}
   <div class="card">
     <div class="dayinfo"><h2>${DFULL[k]} ${dObj.getDate()}</h2><span class="small muted">${U[o].name}: ${typeOf(o, date).lab.toLowerCase()}</span></div>
     <div><div class="seg">${seg}</div>${changed ? `<div class="chg" style="margin-top:6px">Cambiado: era ${cfg.types[defType(u, date)].lab.toLowerCase()}. Las comidas ya se ajustaron.</div>` : ""}</div>
     <div class="sum">${ringHTML}<div class="macros">${macroHTML}</div></div>
     ${circHTML}
     ${eggs > 2 ? `<p class="warnchip">Hoy suman ${eggs} huevos; Sirenas sugiere 2 por día. Cambiá algún plato.</p>` : ""}
     <p class="note">${dayNote(u, date)}</p>
     <div class="wh"><span class="lbl">💧 Agua</span><span class="mono small"><b>${nf(vasos * 0.25, 2)}</b><span class="muted"> / ${nf(t.water * 0.25, 1)} L</span></span></div>
     <div class="glasses">${glasses}</div>
   </div>
   ${meals}
   ${exHTML}
   ${u === "jere" ? sweetCard(date, t, tot, done) : ""}`;
}
function mealCard(u, o, date, mi) {
  const [lab, hora] = MEALS[u][mi], done = isDone(u, date, mi), lg = logOf(u, date, mi);
  const head = `<div class="mh"><div><div class="lbl">${hora} h${u === "jere" && mi === 2 && isTrain(u, date) ? " · pre-entreno" : ""}</div><h3>${lab}</h3></div>
    ${lg ? "" : `<button class="toggle" data-done="${mi}" aria-pressed="${done}">${done ? "✓ Hecho" : "Marcar hecho"}</button>`}</div>`;
  if (lg) {
    return `<div class="card meal"><div class="mh"><div><div class="lbl">${hora} h</div><h3>${lab}</h3></div><span class="toggle" aria-hidden="true">✓ Registrado</span></div>
      <div class="logged"><div class="lt"><b>${lg.sweet ? "🍫 " : ""}${esc(lg.n)}</b><span class="mono small">${lg.k} kcal</span></div>
      <span class="chips"><span class="chip p">P ${lg.p}</span><span class="chip c">C ${lg.c}</span><span class="chip f">G ${lg.f}</span></span>
      ${lg.txt ? `<span class="small muted">"${esc(lg.txt)}"</span>` : ""}
      <button class="linkbtn" data-log="${mi}">Editar o volver al plato del plan</button></div></div>`;
  }
  const id = choice(u, date, mi), dish = D[id], mine = portion(id, u, date, mi), mm = macros(mine);
  const oid = choice(o, date, mi), olog = logOf(o, date, mi), same = oid === id && !olog;
  const carbX = u === "jere" && dish.carb && SLOTS[mi] === "cen" && isTrain(u, date) ? `<span class="extra-j">＋ ${ingTxt(dish.carb)} (día de entreno)</span>` : "";
  let together;
  if (same) {
    const theirs = portion(id, o, date, mi), sum = {};
    [...mine, ...theirs].forEach(([k, q]) => { sum[k] = (sum[k] || 0) + q; });
    const om = macros(theirs);
    together = `<div class="cook"><span class="ct">🍳 Cocinan juntos</span>
      <ul>${Object.entries(sum).map(([k, q]) => `<li>${I[k].e} <span class="mono">${fmtQ(k, q)}</span> ${I[k].n.toLowerCase()}${mine.find(x => x[0] === k) && theirs.find(x => x[0] === k) ? "" : ` <span class="muted">(solo ${mine.find(x => x[0] === k) ? "vos" : U[o].name})</span>`}</li>`).join("")}</ul>
      <span class="small muted">${U[o].name}: ${theirs.map(ingTxt).join(" · ")} · ${om.k} kcal</span></div>`;
  } else {
    const od = olog ? null : D[oid];
    together = `<div class="cook none"><span class="ct">${U[o].name} come otra cosa</span><span class="small">${olog ? `Registró: ${esc(olog.n)}` : `${emos(portion(oid, o, date, mi))} ${od.n}`}</span>
      ${olog ? "" : `<div class="sug"><button data-same="${mi}" data-sid="${id}">Igualar: los dos ${esc(dish.n.toLowerCase())}</button></div>`}</div>`;
  }
  const opts = LIST[SLOTS[mi]].map(x => {
    const sel = x === id, pm = macros(portion(x, u, date, mi));
    return `<button class="opt mini${sel ? " sel" : ""}" id="o-${mi}-${x}" data-mi="${mi}" data-id="${x}" aria-pressed="${sel}"><span class="row"><span class="emo">${emos(portion(x, u, date, mi))}</span><span class="nm">${D[x].n}</span><span class="kc">${pm.k}</span></span></button>`;
  }).join("");
  return `<div class="card meal${done ? " isdone" : ""}">${head}
    <div class="dish"><div class="dn"><span class="emo">${emos(mine)}</span><b>${dish.n}</b><span class="kc mono small muted">${mm.k} kcal</span></div>
      <span class="chips"><span class="chip p">P ${mm.p}</span><span class="chip c">C ${mm.c}</span><span class="chip f">G ${mm.f}</span></span>
      <span class="ing"><b>Tu porción:</b> ${mine.map(ingTxt).join(" · ")}</span>${carbX}
      <span class="how">${dish.h}</span></div>
    ${together}
    <details class="eq chg-opts"><summary>↻ Cambiar plato</summary>
      <div class="seg" style="margin-top:8px"><button data-pm="both" aria-pressed="${pickMode === "both"}">Para los dos</button><button data-pm="me" aria-pressed="${pickMode === "me"}">Solo para mí</button></div>
      <div class="opts">${opts}</div></details>
    ${eqBlock(mine, u)}
    <button class="linkbtn" data-log="${mi}">✏️ Comí otra cosa</button></div>`;
}
const fmtQ = (k, q) => I[k].u === "u" ? `${q} ud` : `${q} ${I[k].u}`;
function sweetCard(date, t, tot, done) {
  const sw = premio(date), eaten = get("jere", "dulce", date);
  if (!sw) {
    let nx = null; for (let n = 1; n <= 7 && !nx; n++) { const d = ds(addD(pd(date), n)); if (premio(d)) nx = d; }
    return `<div class="card sweet"><div class="sw-main"><div class="lock">😴</div><div><div class="lbl" style="color:var(--sweet)">Premio de hoy</div><div class="sw-n">Hoy no hay premio</div><p class="small muted">Día de descanso.${nx ? ` El próximo premio es el ${DFULL[wd(pd(nx))].toLowerCase()}.` : ""}</p></div></div></div>`;
  }
  const s = SW[sw], margin = t.k - tot.k, needM = s.k > 0, mOk = !needM || margin >= s.k || eaten, mealsOk = done === 4, open = mOk && mealsOk;
  const cond = (ok, txt) => `<div class="cond${ok ? " ok" : ""}"><span class="ck">${ok ? "✓" : ""}</span><span>${txt}</span></div>`;
  if (open) return `<div class="card sweet open"><div class="sw-main"><div class="lock">${s.e}</div><div><div class="lbl" style="color:var(--sweet)">🔓 Premio desbloqueado</div><div class="sw-n">${s.n}</div></div></div>
    <p class="small">${s.d}</p>${needM && !eaten ? `<p class="small muted mono">~${s.k} kcal · te quedan ${margin} kcal de margen</p>` : ""}
    <button class="toggle" id="eat" aria-pressed="${!!eaten}">${eaten ? "✓ Me lo comí" : "Me lo comí"}</button></div>`;
  return `<div class="card sweet"><div class="sw-main"><div class="lock">🔒</div><div><div class="lbl" style="color:var(--sweet)">Premio de hoy</div><div class="sw-n blur" aria-hidden="true">Premio sorpresa</div></div></div>
    <div class="conds">${cond(mealsOk, `Completá las 4 comidas (${done}/4)`)}${needM ? cond(mOk, mOk ? `Tenés margen de calorías (${margin} kcal)` : `Falta margen: elegí platos más livianos (tenés ${Math.max(0, margin)} kcal)`) : ""}</div></div>`;
}
function pick(u, date, mi, id, mode) {
  if (mode === "both") { put("shared", "menu", date + ":" + mi, id); for (const x of ["jere", "vale"]) if (get(x, "sel2", date + ":" + mi)) put(x, "sel2", date + ":" + mi, null); }
  else put(u, "sel2", date + ":" + mi, id);
}
$("#v-hoy").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const u = ME, date = curDate();
  if (b.dataset.day !== undefined) { dayIdx = +b.dataset.day; renderHoy(); }
  else if (b.dataset.wk) { weekStart = addD(weekStart, 7 * b.dataset.wk); renderHoy(); }
  else if (b.dataset.type) { put(u, "tipo", date, b.dataset.type === defType(u, date) ? null : b.dataset.type); renderHoy(); }
  else if (b.dataset.g !== undefined) { const g = +b.dataset.g + 1, cur = get(u, "agua", date) || 0; put(u, "agua", date, cur === g ? g - 1 : g); renderHoy(); }
  else if (b.dataset.done !== undefined) { const k = date + ":" + b.dataset.done; put(u, "done", k, get(u, "done", k) ? null : true); renderHoy(); }
  else if (b.dataset.circ) { put(u, b.dataset.circ, date, get(u, b.dataset.circ, date) ? null : true); renderHoy(); }
  else if (b.dataset.pm) { pickMode = b.dataset.pm; b.parentElement.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); }
  else if (b.dataset.id) { pick(u, date, +b.dataset.mi, b.dataset.id, pickMode); renderHoy(); }
  else if (b.dataset.same !== undefined) { pick(u, date, +b.dataset.same, b.dataset.sid, "both"); renderHoy(); }
  else if (b.dataset.log !== undefined) openLog(u, date, +b.dataset.log);
  else if (b.dataset.addx) openLog(u, date, "x");
  else if (b.dataset.delx !== undefined) { const ex = extrasOf(u, date).slice(); ex.splice(+b.dataset.delx, 1); put(u, "extra", date, ex.length ? ex : null); renderHoy(); }
  else if (b.id === "eat") { put("jere", "dulce", date, get("jere", "dulce", date) ? null : premio(date)); renderHoy(); }
});

/* =================== SEMANA =================== */
function shopFor(u, dates) { const a = {}; dates.forEach(d => [0, 1, 2, 3].forEach(mi => { if (logOf(u, d, mi)) return; portion(choice(u, d, mi), u, d, mi).forEach(([k, q]) => { a[k] = (a[k] || 0) + q; }); })); return a; }
function qty(k, q) {
  const it = I[k];
  if (it.per) return `${Math.ceil(q / it.per)} ud`;
  if (it.u === "u") return `${q} ud`;
  const r = q < 100 ? Math.ceil(q / 10) * 10 : Math.ceil(q / 50) * 50;
  return r >= 1000 ? `${nf(r / 1000, r % 1000 ? 1 : 0)} k${it.u === "ml" ? "l" : "g"}`.replace("kl", "L") : `${r} ${it.u}`;
}
function shopList(id, title, sub, dates) {
  const a = shopFor("jere", dates), b = shopFor("vale", dates), wk = ds(weekStart);
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  const groups = CATS.map((c, ci) => {
    const ks = keys.filter(k => I[k].cat === ci).sort((x, y) => I[x].n.localeCompare(I[y].n)); if (!ks.length) return "";
    return `<div class="cat"><div class="lbl" style="margin-top:8px">${c}</div>${ks.map(k => {
      const sk = `${wk}:${id}:${k}`, got = !!get("shared", "shop", sk), qa = a[k] || 0, qb = b[k] || 0;
      const br = qa && qb ? `<small>J ${qa} · V ${qb}</small>` : `<small>${qa ? "solo Jere" : "solo Vale"}</small>`;
      return `<label class="it${got ? " got" : ""}"><input type="checkbox" id="s-${id}-${k}" data-sk="${sk}"${got ? " checked" : ""}><span>${I[k].e}</span><span class="tx">${I[k].n}</span><span class="q">${qty(k, qa + qb)}${br}</span></label>`;
    }).join("")}</div>`;
  }).join("");
  return `<div class="card shop"><h3>${title}<span class="lbl">${sub}</span></h3><p class="small muted">Para los dos. Lo que tildás aparece tildado en los dos celulares.</p>${groups}<p class="small muted">En casa: ghee o aceite de coco, aceite de oliva, ajo, especias, vinagre de manzana, limón, stevia y sal.</p></div>`;
}
function batchCard(title, sub, dates) {
  const a = shopFor("jere", dates), b = shopFor("vale", dates);
  const ks = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(k => I[k].batch);
  if (!ks.length) return "";
  return `<div class="card batch"><h3>${title} <span class="lbl">${sub} · para los dos</span></h3><ul>${ks.map(k => `<li><b class="mono">${qty(k, (a[k] || 0) + (b[k] || 0))}</b> ${I[k].n.toLowerCase()}: ${I[k].batch}</li>`).join("")}</ul>
   <p class="small muted">El pescado y las gambas se hacen en el momento: 10-15 min. El chía pudding, la noche anterior.</p></div>`;
}
function weekShareCard() {
  let same = 0, total = 0;
  for (let i = 0; i < 7; i++) { const d = ds(addD(weekStart, i)); for (let mi = 0; mi < 4; mi++) { total++; if (choice("jere", d, mi) === choice("vale", d, mi) && !logOf("jere", d, mi) && !logOf("vale", d, mi)) same++; } }
  const bars = [...Array(total)].map((_, i) => `<i class="${i < same ? "on" : ""}"></i>`).join("");
  return `<div class="card"><div class="wh"><h3>👩‍🍳 Comen lo mismo</h3><span class="mono"><b>${same}</b><span class="muted"> / ${total}</span></span></div>
    <div class="mmatch">${bars}</div>
    <p class="small muted">Comidas de la semana en las que comen el mismo plato, cada uno con su porción.</p></div>`;
}
function renderSem() {
  const dts = [...Array(7)].map((_, i) => ds(addD(weekStart, i))), e = addD(weekStart, 6);
  const plan = dts.map((d, i) => {
    const dO = pd(d), k = wd(dO);
    const tsel = u => `<select class="selx tsel" id="t-${u}-${i}" data-tu="${u}" data-tdate="${d}" aria-label="Tipo de día de ${U[u].name}, ${DFULL[k]}">${Object.entries(U[u].types).map(([key, ty]) => `<option value="${key}"${key === typeKey(u, d) ? " selected" : ""}>${U[u].name[0]} · ${ty.lab}</option>`).join("")}</select>`;
    const rows = [0, 1, 2, 3].map(mi => {
      const sh = get("shared", "menu", d + ":" + mi), cur = LIST[SLOTS[mi]].includes(sh) ? sh : defChoice(d, mi);
      const oj = get("jere", "sel2", d + ":" + mi), ov = get("vale", "sel2", d + ":" + mi);
      const note = [oj && oj !== cur ? `Jere: ${D[oj]?.n || ""}` : "", ov && ov !== cur ? `Vale: ${D[ov]?.n || ""}` : ""].filter(Boolean).join(" · ");
      return `<label class="sel-row"><span class="lbl">${MEALS.jere[mi][0]}</span><select class="selx" id="m-${i}-${mi}" data-mdate="${d}" data-mi="${mi}">${LIST[SLOTS[mi]].map(id => `<option value="${id}"${id === cur ? " selected" : ""}>${emos(D[id].it.map(x => [x[0], 1]))} ${esc(D[id].n)}</option>`).join("")}</select></label>${note ? `<span class="small muted" style="padding-left:100px">${esc(note)}</span>` : ""}`;
    }).join("");
    return `<div class="pday"><div class="pday-h"><b>${DFULL[k]} ${dO.getDate()}${d === TODS ? " · hoy" : ""}</b><span style="display:flex;gap:4px">${tsel("jere")}${tsel("vale")}</span></div>${rows}</div>`;
  }).join("");
  $("#v-sem").innerHTML = `
   <div class="wnav"><button data-wk="-1" aria-label="Semana anterior">‹</button><div style="text-align:center"><div class="lbl">Semana</div><h2>${weekStart.getDate()} ${MES[weekStart.getMonth()]} – ${e.getDate()} ${MES[e.getMonth()]}</h2></div><button data-wk="1" aria-label="Semana siguiente">›</button></div>
   ${weekShareCard()}
   <div class="card"><h3>Menú de la semana</h3><p class="small muted">El domingo eligen juntos: cada plato es para los dos, con la porción de cada uno. Si uno lo cambia "solo para mí" desde Hoy, aparece abajo del plato.</p>
     ${plan}</div>
   ${shopList("a", "🛒 Compra del domingo", "dom-mié", dts.slice(0, 4))}
   ${batchCard("🔥 Batch del domingo", "1 h", dts.slice(0, 4))}
   ${shopList("b", "🛒 Compra del miércoles", "jue-sáb", dts.slice(4))}
   ${batchCard("🔥 Batch del miércoles", "40 min", dts.slice(4))}
   ${eqCard()}`;
}
$("#v-sem").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.wk) { weekStart = addD(weekStart, 7 * b.dataset.wk); renderSem(); }
});
$("#v-sem").addEventListener("change", e => {
  const el = e.target;
  if (el.dataset.sk) { put("shared", "shop", el.dataset.sk, el.checked ? true : null); el.closest(".it").classList.toggle("got", el.checked); }
  else if (el.dataset.tdate) { const u = el.dataset.tu, d = el.dataset.tdate; put(u, "tipo", d, el.value === defType(u, d) ? null : el.value); renderSem(); }
  else if (el.dataset.mdate) { pick(ME, el.dataset.mdate, +el.dataset.mi, el.value, "both"); renderSem(); }
});

/* =================== PROGRESO =================== */
function wlog(u) { return Object.entries(doc(u).peso || {}).map(([d, kg]) => ({ d, kg })).sort((a, b) => a.d.localeCompare(b.d)); }
function clog(u) { return Object.entries(doc(u).comp || {}).map(([d, c]) => ({ d, ...c })).sort((a, b) => a.d.localeCompare(b.d)); }
function ffmAt(u, date) { let f = U[u].ffm || null; clog(u).forEach(c => { if (c.d <= date && c.ffm) f = c.ffm; }); return f; }
function fatAt(u, kg, date) { const c = get(u, "comp", date); if (c && c.pct) return { v: c.pct, m: true }; const f = ffmAt(u, date); return f ? { v: Math.max(0, (1 - f / kg) * 100), m: false } : null; }
const imc = (u, kg) => kg / Math.pow(U[u].h / 100, 2);
function weightChart(u) {
  const cfg = U[u], log = wlog(u), W = 340, Hh = 190, L = 30, R = 10, Tp = 10, B = 24;
  const s0 = log.length ? pd(log[0].d) : monday(TODAY), w0 = log.length ? log[0].kg : cfg.start;
  const kgs = log.map(e => e.kg);
  const yMin = Math.floor(Math.min(cfg.goal, ...kgs) - 2), yMax = Math.ceil(Math.max(w0, ...kgs) + 1);
  const t0 = +s0, t1 = +END, x = t => L + (t - t0) / (t1 - t0) * (W - L - R), y = v => Tp + (yMax - v) / (yMax - yMin) * (Hh - Tp - B);
  let g = "";
  const step = yMax - yMin > 20 ? 5 : 2;
  for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 3}" text-anchor="end">${v}</text>`;
  for (let d = new Date(s0.getFullYear(), s0.getMonth() + 1, 1); d <= END; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) g += `<text x="${x(+d)}" y="${Hh - 6}" text-anchor="middle">${MES[d.getMonth()]}</text>`;
  const plan = `<line class="plan" x1="${x(t0)}" y1="${y(w0)}" x2="${x(t1)}" y2="${y(cfg.goal)}"/>`;
  const goal = `<line class="goal" x1="${L}" x2="${W - R}" y1="${y(cfg.goal)}" y2="${y(cfg.goal)}"/><text x="${W - R}" y="${y(cfg.goal) - 5}" text-anchor="end" style="fill:var(--accent)">meta ${nf(cfg.goal, cfg.goal % 1 ? 1 : 0)}</text>`;
  let act = "";
  if (log.length) {
    const pts = log.map(e => `${x(+pd(e.d))},${y(e.kg)}`);
    act = `<polyline class="act" points="${pts.join(" ")}"/>` + log.map((e, i) => `<circle class="dot" cx="${x(+pd(e.d))}" cy="${y(e.kg)}" r="${i === log.length - 1 ? 5 : get(u, "comp", e.d) ? 4 : 2.5}"${get(u, "comp", e.d) ? ' style="fill:var(--fat)"' : ""}/>`).join("");
  }
  return `<svg class="chart" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Peso real frente al plan">${g}${goal}${plan}${act}</svg>`;
}
function compChart(u) {
  const cl = clog(u); if (cl.length < 2) return "";
  const W = 340, Hh = 150, L = 30, R = 10, Tp = 12, B = 22;
  const all = cl.flatMap(c => [c.fm, c.ffm]);
  const yMin = Math.floor(Math.min(...all) - 3), yMax = Math.ceil(Math.max(...all) + 3);
  const t0 = +pd(cl[0].d), t1 = Math.max(+pd(cl[cl.length - 1].d), t0 + 86400000);
  const x = t => L + (t - t0) / (t1 - t0) * (W - L - R - 10) + 5, y = v => Tp + (yMax - v) / (yMax - yMin) * (Hh - Tp - B);
  let g = "";
  const step = yMax - yMin > 30 ? 10 : 5;
  for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 3}" text-anchor="end">${v}</text>`;
  cl.forEach(c => { g += `<text x="${x(+pd(c.d))}" y="${Hh - 6}" text-anchor="middle">${+c.d.slice(8)} ${MES[+c.d.slice(5, 7) - 1]}</text>`; });
  const line = (key, col) => `<polyline points="${cl.map(c => `${x(+pd(c.d))},${y(c[key])}`).join(" ")}" style="fill:none;stroke:${col};stroke-width:2.5"/>` + cl.map(c => `<circle cx="${x(+pd(c.d))}" cy="${y(c[key])}" r="3.5" style="fill:${col}"/>`).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Masa grasa y masa sin grasa">${g}${line("ffm", "var(--accent)")}${line("fm", "var(--fat)")}</svg>
    <div class="legend"><span><i style="background:var(--accent)"></i>Masa sin grasa (kg)</span><span><i style="background:var(--fat)"></i>Masa grasa (kg)</span></div>`;
}
function compCard(u) {
  const cl = clog(u);
  if (!cl.length) return `<div class="card"><h3>Composición corporal</h3><p class="small muted">Cuando te midas en la farmacia, cargá el peso con el % de grasa, la masa grasa y la masa sin grasa. Así ves si lo que bajás es grasa y no músculo.</p></div>`;
  const last = cl[cl.length - 1], first = cl[0], tot = last.fm + last.ffm, pf = last.fm / tot * 100;
  let delta = "";
  if (cl.length >= 2) {
    const dF = last.fm - first.fm, dM = last.ffm - first.ffm, warn = dM < -1;
    delta = `<div class="kpis">
      <div class="kpi"><div class="v" style="color:var(--fat)">${dF > 0 ? "+" : ""}${nf(dF, 1)} kg</div><div class="k">grasa desde el ${+first.d.slice(8)} ${MES[+first.d.slice(5, 7) - 1]}</div></div>
      <div class="kpi"><div class="v" style="color:${warn ? "var(--warn)" : "var(--accent)"}">${dM > 0 ? "+" : ""}${nf(dM, 1)} kg</div><div class="k">masa sin grasa</div></div></div>
      ${warn ? `<p class="note" style="color:var(--warn)">Estás perdiendo masa sin grasa. Revisá que llegues a la proteína y que no se caigan los entrenos de fuerza.</p>` : ""}`;
  }
  const rows = [...cl].reverse().map(c => `<tr><td class="mono">${c.d.slice(8)}/${c.d.slice(5, 7)}</td><td class="r mono">${nf(c.pct, 1)} %</td><td class="r mono">${nf(c.fm, 1)}</td><td class="r mono">${nf(c.ffm, 1)}</td><td class="r"><button class="del" data-delc="${c.d}" aria-label="Borrar medición">×</button></td></tr>`).join("");
  return `<div class="card"><div class="wh"><h3>Composición corporal</h3><span class="lbl">farmacia · ${+last.d.slice(8)} ${MES[+last.d.slice(5, 7) - 1]}</span></div>
    <div class="cbar"><i class="cf" style="width:${pf}%"><span>${nf(last.fm, 1)} kg</span></i><i class="cm" style="width:${100 - pf}%"><span>${nf(last.ffm, 1)} kg</span></i></div>
    <div class="legend"><span><i style="background:var(--fat)"></i>Grasa ${nf(last.pct, 1)} %</span><span><i style="background:var(--accent)"></i>Sin grasa ${nf(100 - last.pct, 1)} %</span></div>
    ${delta}${compChart(u)}
    <details><summary>Mediciones (${cl.length})</summary><div style="overflow-x:auto"><table><thead><tr><th>Fecha</th><th class="r">% grasa</th><th class="r">Grasa kg</th><th class="r">Sin grasa kg</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></details></div>`;
}

/* ---------- Historial ---------- */
let hView = "mes", hUser = null, hAnchor = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()), hMetric = "plan";
function dayData(u, date) {
  const dd = doc(u), has = k => dd[k] && Object.keys(dd[k]).some(s => s === date || s.startsWith(date + ":"));
  const any = ["done", "agua", "ent", "log", "extra", "sueno", "extras", "peso", "dulce"].some(has) || (u === "jere" && has("dulce"));
  const t = typeOf(u, date), tot = totals(u, date), vasos = get(u, "agua", date) || 0, md = mealsDone(u, date);
  const ent = !!get(u, "ent", date), dulce = !!get(u, "dulce", date) || extrasOf(u, date).some(x => x.sweet) || [0, 1, 2, 3].some(mi => logOf(u, date, mi)?.sweet);
  const logged = [0, 1, 2, 3].filter(mi => logOf(u, date, mi)).length + extrasOf(u, date).length;
  const plan = (md / 4) * 0.5 + Math.min(1, vasos / t.water) * 0.25 + (ent ? 1 : 0) * 0.25;
  return { any, t, tot, vasos, md, ent, dulce, logged, plan, sueno: !!get(u, "sueno", date), peso: get(u, "peso", date) };
}
const HCOL = ["var(--line)", "color-mix(in srgb,var(--accent) 25%,var(--surface-2))", "color-mix(in srgb,var(--accent) 50%,var(--surface-2))", "color-mix(in srgb,var(--accent) 75%,var(--surface-2))", "var(--accent)"];
function metricVal(u, date, dd) {
  if (!dd.any) return null;
  if (hMetric === "plan") return dd.plan;
  if (hMetric === "kcal") { const tg = U[u].sirenas ? 1600 : dd.t.k; return Math.max(0, 1 - Math.abs(dd.tot.k - tg) / tg * 2.5); }
  if (hMetric === "agua") return Math.min(1, dd.vasos / dd.t.water);
  if (hMetric === "ent") return dd.ent ? 1 : 0;
  return 0;
}
const lvl = v => v === null ? 0 : v >= 0.95 ? 4 : v >= 0.7 ? 3 : v >= 0.4 ? 2 : 1;
function histCard() {
  const u = hUser || ME, a = hAnchor;
  let title = "", body = "", from, to;
  if (hView === "sem") {
    from = sunday(a); to = addD(from, 6);
    title = `${from.getDate()} ${MES[from.getMonth()]} – ${to.getDate()} ${MES[to.getMonth()]}`;
    const rows = [...Array(7)].map((_, i) => {
      const d = ds(addD(from, i)), dd = dayData(u, d), fut = d > TODS, tg = U[u].sirenas ? 1600 : dd.t.k;
      if (fut || !dd.any) return `<tr data-hday="${d}"><td><b>${DN[wd(pd(d))]} ${pd(d).getDate()}</b> <span class="tdot ${dd.t.dot}"></span></td><td colspan="5" class="muted small">${fut ? "" : "sin registro"}</td></tr>`;
      return `<tr data-hday="${d}"><td><b>${DN[wd(pd(d))]} ${pd(d).getDate()}</b> <span class="tdot ${dd.t.dot}"></span></td>
        <td>${dd.t.train ? (dd.ent ? "🏋️" : "—") : (dd.ent ? "🚶" : "")}</td>
        <td class="mono">${nf(dd.tot.k)}<div class="minibar"><i style="width:${Math.min(100, dd.tot.k / tg * 100)}%;background:${dd.tot.k > tg * 1.08 ? "var(--warn)" : "var(--accent)"}"></i></div></td>
        <td class="mono">${dd.md}/4${dd.logged ? "<span class='muted'>✎</span>" : ""}</td><td class="mono">${nf(dd.vasos * 0.25, 1)}</td><td>${dd.dulce ? "🍫" : ""}</td></tr>`;
    }).join("");
    body = `<div style="overflow-x:auto"><table class="wtab"><thead><tr><th>Día</th><th>Entreno</th><th>kcal</th><th>Comidas</th><th>Agua L</th><th>Dulce</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  } else if (hView === "mes") {
    from = new Date(a.getFullYear(), a.getMonth(), 1); to = new Date(a.getFullYear(), a.getMonth() + 1, 0);
    title = `${MESF[from.getMonth()]} ${from.getFullYear()}`;
    const start = monday(from), cells = [];
    for (let d = start; d <= to || wd(d) !== 0; d = addD(d, 1)) {
      const s = ds(d), out = d.getMonth() !== from.getMonth(), fut = s > TODS, dd = dayData(u, s);
      const v = fut ? null : metricVal(u, s, dd);
      const ic = dd.any && !fut ? `${dd.t.train ? (dd.ent ? "🏋️" : "") : ""}${dd.dulce ? "🍫" : ""}${dd.logged ? "✏️" : ""}${dd.peso ? "⚖️" : ""}` : "";
      cells.push(`<button class="cell${out ? " out" : ""}${fut ? " fut" : ""}${s === TODS ? " today" : ""}" data-hday="${s}" ${fut ? "disabled" : ""} aria-label="${d.getDate()} de ${MESF[d.getMonth()]}"><span class="fill" style="height:${v === null ? 0 : Math.round(v * 100)}%"></span><span class="cd">${d.getDate()}</span><span class="ic">${ic}</span></button>`);
      if (cells.length > 42) break;
    }
    body = `<div class="cal">${DN.map(x => `<span class="hd">${x}</span>`).join("")}${cells.join("")}</div>
      <div class="hlegend"><span>🏋️ entrenó</span><span>🍫 dulce</span><span>✏️ comió fuera del plan</span><span>⚖️ se pesó</span></div>`;
  } else {
    from = new Date(a.getFullYear(), 0, 1); to = new Date(a.getFullYear(), 11, 31);
    title = String(a.getFullYear());
    const cells = [];
    for (let d = monday(from); d <= to; d = addD(d, 1)) {
      const s = ds(d), fut = s > TODS, inY = d.getFullYear() === a.getFullYear();
      const v = fut || !inY ? null : metricVal(u, s, dayData(u, s));
      cells.push(`<i style="background:${inY ? HCOL[lvl(v)] : "transparent"}" ${inY && !fut ? `data-hday="${s}"` : ""} title="${s}"></i>`);
    }
    body = `<div class="heat">${cells.join("")}</div>
      <div class="hlegend">Menos <span class="scale">${HCOL.map(c => `<i style="background:${c}"></i>`).join("")}</span> Más</div>`;
  }
  // totales del período
  let ent = 0, entT = 0, dul = 0, kc = 0, kd = 0, md = 0, dayN = 0;
  for (let d = new Date(from); d <= to; d = addD(d, 1)) {
    const s = ds(d); if (s > TODS) break;
    const dd = dayData(u, s); if (dd.t.train) { entT++; if (dd.ent) ent++; } if (!dd.any) continue;
    dayN++; if (dd.dulce) dul++; kc += dd.tot.k; kd++; md += dd.md;
  }
  const metrics = [["plan", "Cumplimiento"], ["kcal", "Calorías"], ["agua", "Agua"], ["ent", "Entrenos"]];
  return `<div class="card" id="hist"><div class="wh"><h3>Historial</h3>
      <div class="who-sw" style="min-width:150px">${["jere", "vale"].map(x => `<button data-hu="${x}" aria-pressed="${x === u}"><span class="av ${x}">${U[x].name[0]}</span>${U[x].name}</button>`).join("")}</div></div>
    <div class="hseg">${[["sem", "Semana"], ["mes", "Mes"], ["anio", "Año"]].map(([k, l]) => `<button data-hv="${k}" aria-pressed="${k === hView}">${l}</button>`).join("")}</div>
    <div class="hnav"><button data-hn="-1" aria-label="Anterior">‹</button><b style="text-transform:capitalize">${title}</b><button data-hn="1" aria-label="Siguiente">›</button></div>
    ${hView !== "sem" ? `<div class="seg">${metrics.map(([k, l]) => `<button data-hm="${k}" aria-pressed="${k === hMetric}">${l}</button>`).join("")}</div>` : ""}
    ${body}
    <div class="hstats">
      <div class="kpi"><div class="v">${ent}<span class="muted" style="font-size:13px">/${entT}</span></div><div class="k">entrenos</div></div>
      <div class="kpi"><div class="v">${kd ? nf(kc / kd) : "—"}</div><div class="k">kcal/día prom.</div></div>
      <div class="kpi"><div class="v">${dayN ? nf(md / dayN, 1) : "—"}</div><div class="k">comidas/día</div></div>
      <div class="kpi"><div class="v">${dul}</div><div class="k">dulces</div></div>
    </div>
    <p class="small muted">Tocá un día para ver el detalle. Las calorías salen del plan y de lo que registraron fuera de él: son estimaciones.</p></div>`;
}
function openDay(u, date) {
  const dd = dayData(u, date), dO = pd(date);
  const rows = [0, 1, 2, 3].map(mi => {
    const lg = logOf(u, date, mi), m = mealMacros(u, date, mi);
    const name = lg ? `✏️ ${esc(lg.n)}` : D[choice(u, date, mi)].n;
    return `<div class="dd-row"><span><b>${MEALS[u][mi][0]}</b> ${isDone(u, date, mi) ? "✓" : "<span class='muted'>· no marcada</span>"}<br><span class="small">${name}</span></span><span class="mono small">${m.k} kcal<br>P ${m.p}</span></div>`;
  }).join("");
  const ex = extrasOf(u, date).map(x => `<div class="dd-row"><span>${x.sweet ? "🍫 " : "＋ "}${esc(x.n)}</span><span class="mono small">${x.k} kcal</span></div>`).join("");
  $("#day-t").textContent = `${U[u].name} · ${DFULL[wd(dO)]} ${dO.getDate()} de ${MESF[dO.getMonth()]}`;
  $("#day-body").innerHTML = `
    <div class="dd-row"><span>Tipo de día</span><span>${dd.t.lab} · ${dd.ent ? (dd.t.train ? "entrenó ✓" : "caminó ✓") : (dd.t.train ? "sin entreno marcado" : "")}</span></div>
    <div class="dd-row"><span>Total estimado</span><span class="mono">${nf(dd.tot.k)} kcal · P ${dd.tot.p} · C ${dd.tot.c} · G ${dd.tot.f}</span></div>
    <div class="dd-row"><span>Agua</span><span class="mono">${nf(dd.vasos * 0.25, 2)} L</span></div>
    <div class="dd-row"><span>Sueño</span><span>${dd.sueno ? "✓" : "—"}</span></div>
    ${u === "jere" ? `<div class="dd-row"><span>Dulce</span><span>${dd.dulce ? "🍫 sí" : "no"}</span></div>` : ""}
    ${dd.peso ? `<div class="dd-row"><span>Peso</span><span class="mono">${nf(dd.peso, 1)} kg</span></div>` : ""}
    <div class="lbl" style="margin-top:6px">Comidas</div>${rows}${ex}
    ${u === ME ? `<button class="btn ghost" data-goday="${date}">Abrir este día en Hoy</button>` : ""}`;
  openM("m-day");
}
$("#m-day").addEventListener("click", e => {
  const b = e.target.closest("[data-goday]"); if (!b) return;
  const d = pd(b.dataset.goday); weekStart = sunday(d); dayIdx = d.getDay(); closeM(); show("hoy");
});
function renderPro() {
  const u = ME, cfg = U[u], log = wlog(u);
  const cur = log.length ? log[log.length - 1].kg : null, curD = log.length ? log[log.length - 1].d : TODS;
  const lost = cur !== null ? cfg.start - cur : 0, left = cur !== null ? Math.max(0, cur - cfg.goal) : cfg.start - cfg.goal;
  const pct = Math.max(0, Math.min(1, lost / (cfg.start - cfg.goal)));
  let pace = null;
  const recent = log.filter(e => (pd(log[log.length - 1].d) - pd(e.d)) / 86400000 <= 28);
  if (recent.length >= 2) { const days = (pd(recent[recent.length - 1].d) - pd(recent[0].d)) / 86400000; if (days >= 7) pace = (recent[0].kg - recent[recent.length - 1].kg) / (days / 7); }
  const planPace = (cfg.start - cfg.goal) / ((END - new Date(2026, 9, 27)) / 604800000);
  const usePace = pace && pace > 0.2 ? pace : planPace, eta = addD(TODAY, Math.ceil(left / usePace * 7));
  const fNow = fatAt(u, cur ?? cfg.start, curD);
  const third = fNow
    ? `<div class="kpi"><div class="v">${fNow.m ? "" : "~"}${nf(fNow.v, 1)} %</div><div class="k">grasa ${fNow.m ? "medida" : "estimada"}</div></div>`
    : `<div class="kpi"><div class="v">${nf(imc(u, cur ?? cfg.start), 1)}</div><div class="k">IMC (meta ${nf(imc(u, cfg.goal), 1)})</div></div>`;
  const ffmNow = ffmAt(u, TODS);
  const goal20 = u === "jere" && ffmNow && Math.abs(ffmNow - 68.5) > 0.3 ? ` Con tu masa sin grasa actual (${nf(ffmNow, 1)} kg), el 20 % de grasa sería ${nf(ffmNow / 0.8, 1)} kg.` : "";
  const hist = [...log].reverse().map(e => { const f = fatAt(u, e.kg, e.d); return `<tr><td class="mono">${e.d.slice(8)}/${e.d.slice(5, 7)}</td><td class="r mono">${nf(e.kg, 1)}</td><td class="r mono">${f ? (f.m ? `<b>${nf(f.v, 1)} %</b>` : `<span class="muted">~${nf(f.v, 1)} %</span>`) : nf(imc(u, e.kg), 1)}</td><td class="r"><button class="del" data-del="${e.d}" aria-label="Borrar">×</button></td></tr>`; }).join("");
  $("#v-pro").innerHTML = `
   <div class="card"><div class="hero">
     <div class="ring">${ring(pct, "var(--accent)", 132, 12)}<div class="ctr"><span class="big">${cur !== null ? nf(cur, 1) : "—"}</span><span class="of">kg hoy</span><span class="mono" style="font-size:12px;color:var(--accent);margin-top:4px">${Math.round(pct * 100)} %</span></div></div>
     <div class="kpis">
       <div class="kpi"><div class="v">${cur !== null ? nf(lost, 1) : "—"}</div><div class="k">kg bajados</div></div>
       <div class="kpi"><div class="v">${nf(left, 1)}</div><div class="k">kg para la meta</div></div>
       ${third}
       <div class="kpi"><div class="v">${pace !== null ? nf(pace, 1) : "—"}</div><div class="k">kg por semana</div></div>
     </div></div>
     <p class="note">${cur === null ? `Cargá tu primer peso para arrancar. Meta: ${cfg.goalTxt}.` : left === 0 ? "¡Llegaste a la meta!" : `Al ritmo ${pace && pace > 0.2 ? "actual" : "del plan"} llegás a ${nf(cfg.goal, cfg.goal % 1 ? 1 : 0)} kg hacia el <b>${eta.getDate()} de ${MES[eta.getMonth()]}${eta.getFullYear() > 2027 ? " de " + eta.getFullYear() : ""}</b>.${goal20}`}</p>
     <form id="wform" class="wform">
       <label class="fld"><span class="lbl">Fecha</span><input type="date" id="w-date" class="inp" value="${TODS}"></label>
       <label class="fld"><span class="lbl">Peso (kg)</span><input type="number" id="w-kg" class="inp mono" step="0.1" min="35" max="180" inputmode="decimal" placeholder="${nf(cur ?? cfg.start, 1)}"></label>
       <details class="farm"><summary>＋ Datos de la farmacia (opcional)</summary>
         <div class="wform3">
           <label class="fld"><span class="lbl">% grasa</span><input type="number" id="w-pct" class="inp mono" step="0.1" inputmode="decimal" placeholder="%"></label>
           <label class="fld"><span class="lbl">Masa grasa</span><input type="number" id="w-fm" class="inp mono" step="0.1" inputmode="decimal" placeholder="kg"></label>
           <label class="fld"><span class="lbl">Sin grasa</span><input type="number" id="w-ffm" class="inp mono" step="0.1" inputmode="decimal" placeholder="kg"></label>
         </div>
         <p class="small muted">Con uno de los tres alcanza: la app calcula los otros a partir del peso.</p></details>
       <button type="submit" class="btn">Guardar</button>
     </form>
   </div>
   ${histCard()}
   ${compCard(u)}
   <div class="card"><div class="wh"><h3>Peso vs. plan</h3><span class="lbl">hasta el 31 mar</span></div>${weightChart(u)}
     <div class="legend"><span><i style="background:var(--accent)"></i>Tu peso</span><span><i style="background:var(--fat)"></i>Con medición de farmacia</span><span><i style="background:var(--muted)"></i>Ritmo para fin de marzo</span></div>
     ${log.length ? `<details><summary>Historial de peso (${log.length})</summary><div style="overflow-x:auto"><table><thead><tr><th>Fecha</th><th class="r">kg</th><th class="r">${fNow ? "Grasa" : "IMC"}</th><th></th></tr></thead><tbody>${hist}</tbody></table></div><p class="small muted">En negrita, % medido en farmacia; con ~, estimado con tu última masa sin grasa.</p></details>` : ""}
   </div>
   ${u === "jere" ? `<div class="card"><details><summary>Hitos y cómo ajustar</summary>
     <div style="overflow-x:auto"><table><thead><tr><th>Fecha</th><th class="r">Objetivo</th></tr></thead><tbody>
      <tr><td>30 nov</td><td class="r mono">≈99 kg</td></tr><tr><td>31 dic</td><td class="r mono">≈95 kg</td></tr><tr><td>31 ene</td><td class="r mono">≈91 kg</td></tr><tr><td>28 feb</td><td class="r mono">≈88 kg</td></tr><tr><td>31 mar</td><td class="r mono">≈85,6 kg · 20 %</td></tr></tbody></table></div>
     <ul class="small" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:5px">
      <li>Pesate 3 mañanas por semana, en ayunas, y mirá la tendencia, no el dato suelto.</li>
      <li>Si bajás menos de 0,7 kg por semana dos semanas seguidas, achicá el almidón de la cena.</li>
      <li>Si bajás más de 1,3 kg por semana o el Fitboxing se te hace cuesta arriba, sumá una fruta a la merienda.</li>
      <li>Medite en farmacia cada 4 semanas. Si la masa sin grasa cae más de 1 kg, subí 150 kcal.</li></ul>
   </details></div>`
   : `<div class="card"><details><summary>Sobre tu meta</summary>
     <p class="small">De 74 a 58 kg son 16 kg. Para fin de marzo haría falta bajar unos 0,7 kg por semana, que es exigente. La app muestra a qué fecha llegás según tu ritmo real.</p>
     <p class="small muted">Con 1,67 m, 58 kg es un IMC de ${nf(imc("vale", 58), 1)}, dentro del rango saludable. Pesate 2-3 mañanas por semana, en ayunas, y medite en la farmacia cada 3-4 semanas.</p>
   </details></div>`}`;
}
const num = id => { const v = parseFloat(String($(id).value).replace(",", ".")); return isNaN(v) ? null : v; };
$("#v-pro").addEventListener("submit", e => {
  if (e.target.id !== "wform") return; e.preventDefault();
  const d = $("#w-date").value, kg = num("#w-kg");
  if (!d || !(kg > 30 && kg < 200)) return;
  let pct = num("#w-pct"), fm = num("#w-fm"), ffm = num("#w-ffm");
  if (pct !== null || fm !== null || ffm !== null) {
    if (fm === null && pct !== null) fm = kg * pct / 100;
    if (fm === null && ffm !== null) fm = kg - ffm;
    if (ffm === null) ffm = kg - fm;
    if (pct === null) pct = fm / kg * 100;
    const r1 = v => Math.round(v * 10) / 10;
    put(ME, "comp", d, { pct: r1(pct), fm: r1(fm), ffm: r1(ffm) });
  }
  put(ME, "peso", d, kg); renderPro();
});
$("#v-pro").addEventListener("click", e => {
  const b = e.target.closest("button, [data-hday]"); if (!b) return;
  if (b.dataset.del) { put(ME, "peso", b.dataset.del, null); put(ME, "comp", b.dataset.del, null); renderPro(); }
  else if (b.dataset.delc) { put(ME, "comp", b.dataset.delc, null); renderPro(); }
  else if (b.dataset.hv) { hView = b.dataset.hv; renderHist(); }
  else if (b.dataset.hu) { hUser = b.dataset.hu; renderHist(); }
  else if (b.dataset.hm) { hMetric = b.dataset.hm; renderHist(); }
  else if (b.dataset.hn) {
    const n = +b.dataset.hn, a = hAnchor;
    hAnchor = hView === "sem" ? addD(a, 7 * n) : hView === "mes" ? new Date(a.getFullYear(), a.getMonth() + n, 1) : new Date(a.getFullYear() + n, 0, 1);
    renderHist();
  }
  else if (b.dataset.hday) openDay(hUser || ME, b.dataset.hday);
});
function renderHist() { const el = $("#hist"); if (el) el.outerHTML = histCard(); }

/* =================== Registro de comidas fuera del plan =================== */
const COMMON = [
  ["Pizza, 1 porción", 11, 33, 10], ["Hamburguesa con pan", 28, 40, 25], ["Empanada", 9, 25, 12], ["Tortilla de patatas, porción", 9, 18, 14],
  ["Paella, ración", 20, 70, 12], ["Croquetas, 4", 8, 24, 16], ["Sushi, 8 piezas", 14, 55, 6], ["Kebab", 30, 45, 25],
  ["Patatas fritas, ración", 4, 40, 17], ["Ensalada césar", 20, 15, 25], ["Pan, 1 rebanada", 3, 15, 1], ["Jamón serrano, 50 g", 15, 0, 7],
  ["Queso curado, 40 g", 10, 0, 13], ["Helado, 1 bocha", 2, 20, 7], ["Chocolate 85 %, 20 g", 2, 4, 9], ["Café con leche", 4, 5, 4],
  ["Cerveza, caña", 1, 4, 0, 5], ["Cerveza, botellín", 1, 13, 0, 13], ["Vino, copa", 0, 4, 0, 14], ["Gin tonic", 0, 15, 0, 16]
];
let LG = null;
function openLog(u, date, mi) {
  const ex = mi === "x", lg = ex ? null : logOf(u, date, mi);
  LG = { u, date, mi, a: lg?.a || 0, items: lg?.items || [], img: null };
  $("#log-t").textContent = ex ? "Agregar algo fuera del plan" : "Comí otra cosa";
  $("#log-sub").textContent = ex ? `${DFULL[wd(pd(date))]} ${pd(date).getDate()}. Se suma al total del día.` : `${MEALS[u][mi][0]} del ${DFULL[wd(pd(date))].toLowerCase()} ${pd(date).getDate()}. Reemplaza al plato del plan.`;
  $("#log-txt").value = lg?.txt || "";
  $("#log-n").value = lg?.n || ""; $("#log-p").value = lg?.p ?? ""; $("#log-c").value = lg?.c ?? ""; $("#log-f").value = lg?.f ?? "";
  $("#log-sweet").checked = !!lg?.sweet;
  $("#log-res").hidden = !lg; $("#log-prev").hidden = true; $("#log-prev").innerHTML = ""; $("#log-img").value = "";
  $("#log-del").hidden = !lg;
  $("#log-msg").textContent = MODE === "local" ? "Sin servidor: cargalo a mano o con los alimentos comunes." : "Contalo como se lo dirías a alguien, con cantidades si las sabés. También podés sacarle una foto.";
  $("#log-commons").innerHTML = COMMON.map((c, i) => `<button data-cm="${i}">${c[0]}</button>`).join("") + `<button data-cm="clear">Borrar todo</button>`;
  renderLogItems(); updK(); openM("m-log");
}
function updK() {
  const p = num("#log-p") || 0, c = num("#log-c") || 0, f = num("#log-f") || 0;
  $("#log-k").textContent = nf(kcalOf({ p, c, f, a: LG?.a || 0 }));
}
function renderLogItems() {
  $("#log-items").innerHTML = (LG.items || []).map(x => `<li>• ${esc(x.n)}${x.q ? ` (${esc(x.q)})` : ""} — ${x.k ?? kcalOf(x)} kcal</li>`).join("");
}
["#log-p", "#log-c", "#log-f"].forEach(id => $(id).addEventListener("input", updK));
$("#log-commons").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.cm === "clear") { LG.items = []; LG.a = 0; ["#log-p", "#log-c", "#log-f"].forEach(id => $(id).value = ""); $("#log-n").value = ""; renderLogItems(); updK(); return; }
  const [n, p, c, f, a = 0] = COMMON[+b.dataset.cm];
  $("#log-res").hidden = false;
  $("#log-p").value = (num("#log-p") || 0) + p; $("#log-c").value = (num("#log-c") || 0) + c; $("#log-f").value = (num("#log-f") || 0) + f;
  LG.a += a; LG.items.push({ n, p, c, f, a, k: kcalOf({ p, c, f, a }) });
  $("#log-n").value = LG.items.map(x => x.n.split(",")[0]).join(" + ");
  renderLogItems(); updK();
});
$("#log-img").addEventListener("change", async e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  try {
    const url = await shrink(f, 1024, 0.72);
    LG.img = url; $("#log-prev").innerHTML = `<img src="${url}" alt="Foto del plato">`; $("#log-prev").hidden = false;
    $("#log-msg").textContent = "Foto lista. Sumá un texto si querés aclarar cantidades y tocá Estimar.";
  } catch (err) { $("#log-msg").textContent = "No pude leer la foto. Probá con otra."; }
});
function shrink(file, max, q) {
  return new Promise((res, rej) => {
    const img = new Image(), fr = new FileReader();
    fr.onload = () => { img.onload = () => { const s = Math.min(1, max / Math.max(img.width, img.height)), cv = document.createElement("canvas"); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s); cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); res(cv.toDataURL("image/jpeg", q)); }; img.onerror = rej; img.src = fr.result; };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}
$("#log-ai").addEventListener("click", async () => {
  const txt = $("#log-txt").value.trim();
  if (!txt && !LG.img) { $("#log-msg").textContent = "Escribí qué comiste o sacale una foto."; return; }
  if (MODE !== "remote") { $("#log-msg").textContent = "La estimación necesita el servidor. Cargalo a mano."; return; }
  const btn = $("#log-ai"); btn.disabled = true; btn.textContent = "Estimando…"; $("#log-msg").textContent = "";
  try {
    const r = await fetch("/api/estimate", { method: "POST", headers: hdrs(), body: JSON.stringify({ text: txt, image: LG.img }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "No se pudo estimar");
    LG.items = j.items || []; LG.a = j.a || 0;
    $("#log-n").value = j.n || txt.slice(0, 60); $("#log-p").value = j.p; $("#log-c").value = j.c; $("#log-f").value = j.f;
    if (j.sweet) $("#log-sweet").checked = true;
    $("#log-res").hidden = false; renderLogItems(); updK();
    $("#log-msg").textContent = j.nota ? `Nota: ${j.nota}` : "Revisá los números y guardá.";
  } catch (err) { $("#log-msg").textContent = `${err.message}. Podés cargarlo a mano abajo.`; $("#log-manual").open = true; }
  finally { btn.disabled = false; btn.textContent = "✨ Estimar"; }
});
$("#log-save").addEventListener("click", () => {
  const p = Math.round(num("#log-p") || 0), c = Math.round(num("#log-c") || 0), f = Math.round(num("#log-f") || 0);
  const n = $("#log-n").value.trim() || $("#log-txt").value.trim().slice(0, 60);
  if (!n || (!p && !c && !f && !LG.a)) { $("#log-msg").textContent = "Falta el nombre o los valores. Estimá con IA o cargalo a mano."; $("#log-res").hidden = false; return; }
  const rec = { n, p, c, f, a: Math.round(LG.a || 0), k: kcalOf({ p, c, f, a: LG.a || 0 }), txt: $("#log-txt").value.trim().slice(0, 300), sweet: $("#log-sweet").checked, items: (LG.items || []).slice(0, 12) };
  if (LG.mi === "x") put(LG.u, "extra", LG.date, [...extrasOf(LG.u, LG.date), rec]);
  else put(LG.u, "log", LG.date + ":" + LG.mi, rec);
  closeM(); render();
});
$("#log-del").addEventListener("click", () => { if (LG.mi !== "x") put(LG.u, "log", LG.date + ":" + LG.mi, null); closeM(); render(); });

/* =================== Reglas =================== */
function rulesHTML() {
  if (ME === "vale") return `<div class="rules">
      <div class="rule"><b>Círculo de luces</b>3 L de agua, 4 comidas, sueño, ejercicio y extras. Lo marcás arriba en Hoy.</div>
      <div class="rule"><b>El plato</b>¼ proteína, ½ vegetales y la grasa de la cocción. Plato normal en comida y cena; mediano en desayuno y merienda.</div>
      <div class="rule"><b>Entre comidas</b>Entre 3 y 5 horas, y 12 horas entre la cena y el desayuno.</div>
      <div class="rule"><b>Fuera</b>Azúcares, harinas, fritos y ultraprocesados. Tampoco patata, boniato, choclo ni mandioca.</div>
      <div class="rule"><b>Fruta</b>Solo en desayuno y merienda, máximo 2 por día y siempre con proteína.</div>
      <div class="rule"><b>Huevos</b>2 por día. Las claras aparte suman sin problema.</div>
      <div class="rule"><b>Quesos y fiambres</b>Poca cantidad, en una sola comida y no todos los días.</div>
      <div class="rule"><b>Frutos secos</b>Un puño, en desayuno o merienda. No como snack. Maní no.</div>
      <div class="rule"><b>Grasas</b>Cocinar con ghee o aceite de coco, pincelado. Oliva para aliñar. Aguacate: ½ día por medio.</div>
      <div class="rule"><b>Pescado</b>Al menos 2-3 veces por semana.</div></div>
    <p class="small muted">Resumen de la guía de Proyecto Sirenas. Ante cualquier duda manda la nutricionista. Las calorías que muestra la app son estimaciones; Sirenas no cuenta calorías.</p>`;
  return `<div class="rules">
      <div class="rule"><b>Mismos platos que Vale</b>Con más proteína en tu porción.</div>
      <div class="rule"><b>≈40 g de proteína por comida</b>Es lo único que no se negocia.</div>
      <div class="rule"><b>Almidón solo en la cena</b>Los días de entreno: patata, boniato, arroz o quinoa.</div>
      <div class="rule"><b>Fruta</b>En desayuno y merienda, como Vale. Antes de entrenar te da energía.</div>
      <div class="rule"><b>3 L de agua</b>3,5 L los días de Fitboxing, con una pizca de sal.</div>
      <div class="rule"><b>Una comida libre</b>El sábado, sin compensar después.</div></div>
    <h3>¿El carbohidrato sirve solo después de entrenar?</h3>
    <p class="small">No solo, pero es donde mejor encaja. Para bajar grasa lo que más pesa es el total de calorías y la proteína; el momento importa poco. Como entrenás a la tarde, la cena con almidón te sirve para recuperar. Si en el Fitboxing te falta nafta, la fruta de la merienda es la que ayuda.</p>`;
}

/* =================== Modales y navegación =================== */
let lastFocus = null;
function openM(id) {
  lastFocus = document.activeElement; const m = $("#" + id); m.hidden = false;
  if (id === "m-rules") $("#rules-body").innerHTML = rulesHTML();
  if (id === "m-user") $("#user-info").textContent = `Entraste como ${U[ME].name}${MODE === "local" ? " (modo local: los datos quedan solo en este dispositivo)" : ""}.`;
  m.querySelector(".x").focus();
}
function closeM() { document.querySelectorAll(".ov").forEach(o => o.hidden = true); if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus(); }
document.querySelectorAll(".ov").forEach(o => o.addEventListener("click", e => { if (e.target === o || e.target.closest("[data-close]")) closeM(); }));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeM(); });
$("#btn-rules").addEventListener("click", () => openM("m-rules"));
$("#btn-me").addEventListener("click", () => openM("m-user"));
$("#btn-logout").addEventListener("click", () => { closeM(); logout(); });
function render() {
  if (!ME) return;
  if (view === "hoy") renderHoy(); if (view === "sem") renderSem(); if (view === "pro") renderPro();
}
function show(v) {
  view = v;
  document.querySelectorAll(".tabbar button").forEach(b => b.setAttribute("aria-selected", b.dataset.v === v));
  ["hoy", "sem", "pro"].forEach(x => { const s = $("#v-" + x); s.hidden = x !== v; if (x === v) s.style.display = "flex"; });
  render(); window.scrollTo(0, 0);
}
document.querySelectorAll(".tabbar button").forEach(b => b.addEventListener("click", () => show(b.dataset.v)));

/* =================== Login =================== */
let pinBuf = "", loginUser = null, status = { jere: false, vale: false };
function renderLogin(msg = "") {
  const L = $("#v-login");
  if (!loginUser) {
    L.innerHTML = `<div class="logo" style="width:56px;height:56px;font-size:22px;margin:0 auto">JV</div><div><h1>JV Food</h1><p class="muted" style="margin-top:6px">¿Quién sos?</p></div>
      <div class="who">${["jere", "vale"].map(x => `<button data-who="${x}"><span class="av ${x}">${U[x].name[0]}</span>${U[x].name}</button>`).join("")}</div>
      ${MODE === "local" ? `<p class="small muted">Modo local: sin servidor, los datos quedan en este dispositivo.</p>` : ""}`;
    return;
  }
  const first = !status[loginUser];
  L.innerHTML = `<div><span class="av ${loginUser}" style="width:56px;height:56px;font-size:22px;margin:0 auto">${U[loginUser].name[0]}</span></div>
    <div><h2>${first ? `Creá tu PIN, ${U[loginUser].name}` : `Hola, ${U[loginUser].name}`}</h2><p class="muted small" style="margin-top:4px">${first ? "4 números. Lo vas a usar para entrar desde cualquier celular." : "Ingresá tu PIN"}</p></div>
    <div class="pdots">${[0, 1, 2, 3].map(i => `<i class="${i < pinBuf.length ? "on" : ""}"></i>`).join("")}</div>
    <div class="err">${msg}</div>
    <div class="keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join("")}<button data-k="back" aria-label="Volver" style="font-size:16px">←</button><button data-k="0">0</button><button data-k="del" aria-label="Borrar" style="font-size:18px">⌫</button></div>`;
}
$("#v-login").addEventListener("click", async e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.who) {
    loginUser = b.dataset.who; pinBuf = "";
    if (MODE === "local") return enter(loginUser, null);
    return renderLogin();
  }
  const k = b.dataset.k; if (!k) return;
  if (k === "back") { loginUser = null; pinBuf = ""; return renderLogin(); }
  if (k === "del") { pinBuf = pinBuf.slice(0, -1); return renderLogin(); }
  if (pinBuf.length < 4) pinBuf += k;
  renderLogin();
  if (pinBuf.length === 4) {
    try {
      const r = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ user: loginUser, pin: pinBuf }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { pinBuf = ""; return renderLogin(j.error || "No se pudo entrar"); }
      enter(loginUser, pinBuf);
    } catch (err) { pinBuf = ""; renderLogin("Sin conexión. Probá de nuevo."); }
  }
});
document.addEventListener("keydown", e => {
  if ($("#v-login").hidden || !loginUser || MODE === "local") return;
  if (/^\d$/.test(e.key)) { const b = document.querySelector(`[data-k="${e.key}"]`); b && b.click(); }
  if (e.key === "Backspace") { const b = document.querySelector(`[data-k="del"]`); b && b.click(); }
});
function migrateLegacy(u) {
  if (u !== "jere") return;
  let done = false; try { done = localStorage.getItem("jsfood-migrated") === "1"; } catch (e) {}
  if (done) return;
  try {
    const w = JSON.parse(localStorage.getItem("planjere-peso") || "[]");
    w.forEach(e => { if (e && e.d && e.kg && get("jere", "peso", e.d) === undefined) put("jere", "peso", e.d, e.kg); });
    if (!doc("jere").comp || !Object.keys(doc("jere").comp).length) { put("jere", "comp", "2026-09-08", { pct: 34.3, fm: 35.7, ffm: 68.5 }); if (get("jere", "peso", "2026-09-08") === undefined) put("jere", "peso", "2026-09-08", 104.2); }
    localStorage.setItem("jsfood-migrated", "1");
  } catch (e) {}
}
async function enter(u, pin) {
  C.auth = { user: u, pin }; saveC();
  ME = u; hUser = null;
  document.documentElement.classList.toggle("u-vale", u === "vale");
  $("#v-login").hidden = true; $("#hdr").hidden = false; $("#tabbar").hidden = false;
  const me = $("#btn-me"); me.className = "av " + u; me.textContent = U[u].name[0];
  $("#hdate").textContent = `${U[u].name} · ${DFULL[wd(TODAY)]} ${TODAY.getDate()} de ${MES[TODAY.getMonth()]}`;
  show("hoy");
  if (MODE === "remote") { await pull(); migrateLegacy(u); }
  else migrateLegacy(u);
  render();
}
function logout() {
  C.auth = null; saveC(); ME = null; loginUser = null; pinBuf = "";
  document.documentElement.classList.remove("u-vale");
  ["v-hoy", "v-sem", "v-pro"].forEach(id => $("#" + id).hidden = true);
  $("#hdr").hidden = true; $("#tabbar").hidden = true; $("#v-login").hidden = false;
  refreshStatus().then(() => renderLogin());
}
async function refreshStatus() {
  let r;
  try { r = await fetch("/api/status", { cache: "no-store" }); }
  catch (e) { MODE = C.auth?.pin ? "remote" : "local"; setSync(MODE === "remote"); return; }
  try {
    if (!r.ok) throw new Error(r.status);
    const j = await r.json(); if (!j.users) throw new Error("bad");
    status = j.users; MODE = "remote";
  } catch (e) { MODE = "local"; }
}
(async function boot() {
  await refreshStatus();
  if (C.auth && C.auth.user && (MODE === "local" || C.auth.pin)) return enter(C.auth.user, C.auth.pin);
  $("#v-login").hidden = false; renderLogin();
})();
document.addEventListener("visibilitychange", () => { if (!document.hidden && ME) { pull(); flush(); } });
setInterval(() => { if (!document.hidden && ME) pull(); }, 30000);
