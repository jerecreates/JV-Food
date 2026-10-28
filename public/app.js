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
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const TODAY = new Date(), TODS = ds(TODAY);
const DN = ["L", "M", "X", "J", "V", "S", "D"], DFULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const END = new Date(2027, 2, 31);

/* =================== Ingredientes =================== */
const CATS = ["Carne y pescado", "Huevos, lácteos y fiambres", "Frutas y verduras", "Congelados", "Despensa"];
const I = {
  pollo:{n:"Pechuga de pollo",u:"g",e:"🍗",cat:0,g:"pollo",batch:"Al horno a 200 °C, 20-25 min, con pimentón, ajo y limón."},
  contra:{n:"Contramuslo de pollo sin piel",u:"g",e:"🍗",cat:0,g:"pollo"},
  pavo:{n:"Pechuga de pavo",u:"g",e:"🦃",cat:0,g:"pavo",batch:"A la plancha en tiras, 6-8 min."},
  ternera:{n:"Ternera magra picada",u:"g",e:"🥩",cat:0,g:"ternera"},
  filete:{n:"Filete de ternera",u:"g",e:"🥩",cat:0,g:"ternera"},
  lomo:{n:"Lomo de cerdo",u:"g",e:"🥩",cat:0,g:"cerdo"},
  salmon:{n:"Salmón",u:"g",e:"🐟",cat:0,g:"salmón"},
  salmonA:{n:"Salmón ahumado",u:"g",e:"🐟",cat:1,g:"salmón ahumado"},
  bacalao:{n:"Bacalao",u:"g",e:"🐟",cat:3,g:"pescado blanco"},
  pescadoB:{n:"Pescado blanco (merluza o bacalao)",u:"g",e:"🐟",cat:3,g:"pescado blanco"},
  gambas:{n:"Gambas peladas",u:"g",e:"🦐",cat:3,g:"gambas"},
  atun:{n:"Atún al natural",u:"u",one:"lata de atún al natural",many:"latas de atún al natural",e:"🐟",cat:4,g:"atún"},
  huevo:{n:"Huevos",u:"u",one:"huevo",many:"huevos",e:"🥚",cat:1,g:"huevo"},
  claras:{n:"Claras de huevo",u:"g",e:"🥚",cat:1,g:"huevo"},
  skyr:{n:"Skyr natural",u:"g",e:"🥛",cat:1,g:"yogur"},
  yogGriego:{n:"Yogur griego natural",u:"g",e:"🥛",cat:1,g:"yogur"},
  yogProt:{n:"Yogur proteico natural",u:"g",e:"🥛",cat:1,g:"yogur"},
  quesoBatido:{n:"Queso fresco batido 0 %",u:"g",e:"🥛",cat:1,g:"yogur"},
  cottage:{n:"Queso cottage",u:"g",e:"🧀",cat:1,g:"cottage"},
  pavoL:{n:"Pavo en lonchas",u:"g",e:"🦃",cat:1,g:"fiambre"},
  avena:{n:"Avena",u:"g",e:"🌾",cat:4,g:"avena"},
  arroz:{n:"Arroz (en crudo)",u:"g",e:"🍚",cat:4,g:"arroz",batch:"Hervido para todos los días."},
  quinoa:{n:"Quinoa (en crudo)",u:"g",e:"🍚",cat:4,g:"quinoa",batch:"Hervida, 15 min."},
  pasta:{n:"Pasta integral (en crudo)",u:"g",e:"🍝",cat:4,g:"pasta"},
  pan:{n:"Pan integral",u:"u",one:"rebanada de pan integral",many:"rebanadas de pan integral",e:"🍞",cat:4,g:"pan"},
  panCruj:{n:"Pan crujiente integral",u:"u",one:"tostada crujiente integral",many:"tostadas crujientes integrales",e:"🍞",cat:4,g:"pan"},
  garb:{n:"Garbanzos cocidos",u:"g",e:"🫘",cat:4,g:"garbanzos"},
  tomTri:{n:"Tomate triturado",u:"g",e:"🍅",cat:4,g:"tomate"},
  tomFrito:{n:"Tomate frito",u:"g",e:"🍅",cat:4,g:"tomate"},
  nueces:{n:"Nueces",u:"g",e:"🌰",cat:4,g:"frutos secos"},
  almendras:{n:"Almendras",u:"g",e:"🌰",cat:4,g:"frutos secos"},
  crCac:{n:"Crema de cacahuete",u:"g",e:"🥜",cat:4,g:"frutos secos"},
  coco:{n:"Leche de coco light",u:"ml",e:"🥥",cat:4,g:"coco"},
  patata:{n:"Patata",u:"g",e:"🥔",cat:2,g:"patata",batch:"En dados, al horno a 200 °C, 35 min."},
  boniato:{n:"Boniato",u:"g",e:"🍠",cat:2,g:"boniato",batch:"En dados, al horno a 200 °C, 35 min."},
  verd:{n:"Verduras para asar (pimiento, calabacín, cebolla)",u:"g",e:"🫑",cat:2,g:"verduras",batch:"Bandeja al horno a 200 °C, 30-35 min."},
  calabacin:{n:"Calabacín",u:"g",e:"🥒",cat:2,g:"verduras",batch:"En la bandeja de verduras."},
  zanahoria:{n:"Zanahoria",u:"g",e:"🥕",cat:2,g:"verduras"},
  pimiento:{n:"Pimiento",u:"g",e:"🫑",cat:2,g:"verduras"},
  ens:{n:"Ensalada (lechuga, tomate, pepino)",u:"g",e:"🥗",cat:2,g:"ensalada"},
  cherry:{n:"Tomates cherry",u:"g",e:"🍅",cat:2,g:"tomate"},
  champi:{n:"Champiñones",u:"g",e:"🍄",cat:2,g:"verduras"},
  esparr:{n:"Espárragos verdes",u:"g",e:"🌿",cat:2,g:"verduras"},
  aguacate:{n:"Aguacate",u:"g",e:"🥑",cat:2,g:"aguacate",per:150},
  manzana:{n:"Manzanas",u:"u",one:"manzana",many:"manzanas",e:"🍎",cat:2,g:"fruta"},
  pera:{n:"Peras",u:"u",one:"pera",many:"peras",e:"🍐",cat:2,g:"fruta"},
  platano:{n:"Plátanos",u:"u",one:"plátano",many:"plátanos",e:"🍌",cat:2,g:"fruta"},
  kiwi:{n:"Kiwis",u:"u",one:"kiwi",many:"kiwis",e:"🥝",cat:2,g:"fruta"},
  arandanos:{n:"Arándanos",u:"g",e:"🫐",cat:2,g:"frutos rojos"},
  wok:{n:"Verdura para wok",u:"g",e:"🥦",cat:3,g:"verduras"},
  brocoli:{n:"Brócoli",u:"g",e:"🥦",cat:3,g:"verduras"},
  guis:{n:"Guisantes",u:"g",e:"🫛",cat:3,g:"guisantes"},
  frutos:{n:"Frutos rojos",u:"g",e:"🫐",cat:3,g:"frutos rojos"}
};
const GW = {pollo:3,pavo:3,ternera:3,cerdo:3,"salmón":3,"pescado blanco":3,gambas:3,"atún":3,huevo:2,arroz:2,quinoa:2,pasta:2,patata:2,boniato:2,garbanzos:2,verduras:1,ensalada:1,avena:1,pan:1};

/* =================== Platos =================== */
const D = {
  // Jere
  d1:{n:"Bowl de skyr, frutos rojos y nueces",it:[["skyr",300],["frutos",100],["avena",20],["nueces",20]],p:40,c:33,f:15,h:"Todo en un bowl. Sacá los frutos rojos del freezer la noche anterior."},
  d2:{n:"Tortilla con pavo y tostada",it:[["huevo",3],["claras",100],["pavoL",50],["pan",1],["cherry",100]],p:43,c:20,f:17,h:"Batí huevos y claras y sumá el pavo en tiras. Sartén antiadherente, 5 min."},
  d3:{n:"Revuelto con salmón ahumado",it:[["huevo",3],["claras",100],["salmonA",50],["aguacate",40]],p:41,c:3,f:23,h:"Revuelto a fuego bajo. El salmón y el aguacate van al final, en frío."},
  d4:{n:"Tortitas proteicas",it:[["avena",40],["huevo",1],["claras",150],["skyr",150],["frutos",50]],p:44,c:35,f:9,h:"Licuá avena, huevo, claras y canela. Vuelta y vuelta; skyr y frutos rojos arriba."},
  c1:{n:"Pollo con arroz y verduras",it:[["pollo",180],["arroz",50],["verd",200]],p:48,c:49,f:13,h:"Pollo, arroz y verduras salen del batch. Solo calentar."},
  c2:{n:"Pavo con quinoa y verduras",it:[["pavo",180],["quinoa",50],["verd",200]],p:53,c:42,f:16,h:"Pavo y quinoa del batch, con un chorrito de limón."},
  c3:{n:"Guiso de pollo y garbanzos",it:[["pollo",170],["garb",120],["patata",100],["verd",150]],p:52,c:42,f:11,h:"Olla única, 25 min. Rinde para varios días."},
  c4:{n:"Pasta integral con ternera y champiñones",it:[["ternera",160],["pasta",60],["champi",100],["tomTri",80]],p:45,c:42,f:10,h:"Dorá la carne con cebolla, sumá champiñones y tomate. 15 min mientras hierve la pasta."},
  c5:{n:"Lomo de cerdo con ensalada y aguacate",it:[["lomo",200],["ens",200],["aguacate",40]],p:45,c:7,f:21,h:"Lomo especiado a la plancha, 4 min por lado."},
  c6:{n:"Pollo al curry con verduras",it:[["contra",200],["wok",250],["coco",60]],p:44,c:17,f:18,h:"Sartén grande: pollo, verdura, coco y curry. 15 min."},
  c7:{n:"Ensalada completa de atún y huevo",it:[["atun",2],["huevo",2],["ens",250]],p:43,c:9,f:17,h:"Cero cocina si tenés huevos duros hechos."},
  c8:{n:"Ternera con champiñones y espárragos",it:[["filete",180],["champi",150],["esparr",150]],p:47,c:6,f:18,h:"Filete a la plancha; champiñones y espárragos salteados con ajo."},
  m1:{n:"Skyr con manzana y avena",it:[["skyr",200],["manzana",1],["avena",20]],p:25,c:45,f:2,h:"1-2 h antes de entrenar. La manzana en trozos."},
  m2:{n:"Tostada con pavo y pera",it:[["pan",1],["pavoL",100],["pera",1]],p:25,c:44,f:4,h:"1-2 h antes de entrenar. Liviana para el estómago."},
  m4:{n:"Huevos duros con pavo",it:[["huevo",2],["pavoL",100],["cherry",100]],p:33,c:7,f:12,h:"Ideal para llevar."},
  m5:{n:"Cottage con atún",it:[["cottage",150],["atun",1]],p:31,c:7,f:7,h:"Con pimienta, limón y pepino si tenés."},
  m6:{n:"Skyr con nueces y canela",it:[["skyr",250],["nueces",15]],p:30,c:12,f:11,h:"Canela a gusto y edulcorante si querés."},
  n1:{n:"Salmón con patata y brócoli",it:[["salmon",170],["patata",150],["brocoli",200]],p:42,c:34,f:23,h:"Todo en la misma bandeja, 200 °C, 15 min."},
  n2:{n:"Bacalao con boniato",it:[["bacalao",250],["boniato",200],["verd",150]],p:50,c:48,f:13,h:"Boniato del batch; el bacalao al horno 15 min."},
  n3:{n:"Gambas salteadas con arroz",it:[["gambas",250],["arroz",60],["guis",80],["verd",100]],p:54,c:60,f:13,h:"Arroz del batch, salteado con todo. 10 min."},
  n4:{n:"Pollo con boniato y ensalada",it:[["pollo",180],["boniato",200],["ens",150]],p:46,c:45,f:13,h:"Pollo y boniato del batch."},
  n5:{n:"Salmón con verduras asadas",it:[["salmon",170],["verd",300]],p:39,c:18,f:23,h:"Horno a 200 °C, 12 min sobre la verdura."},
  n6:{n:"Bacalao al horno con verduras",it:[["bacalao",250],["verd",250]],p:49,c:15,f:13,h:"Horno a 200 °C, 15 min sobre la verdura."},
  n7:{n:"Gambas al ajillo con espárragos",it:[["gambas",250],["esparr",200]],p:49,c:5,f:12,h:"Sartén bien caliente con ajo y guindilla, 6-8 min."},
  n8:{n:"Pavo con champiñones y ensalada",it:[["pavo",200],["champi",200],["ens",150]],p:55,c:7,f:13,h:"Pavo a la plancha y champiñones salteados."},
  // Vale (plan de la nutricionista)
  vd1:{n:"Yogur griego con avena, plátano y nueces",it:[["yogGriego",200],["avena",40],["platano",1],["nueces",10]],p:16,c:53,f:25,h:"Todo en un bowl."},
  vd2:{n:"Tostada con huevos, aguacate y cherry",it:[["pan",1],["huevo",2],["aguacate",30],["cherry",100]],p:18,c:22,f:16,h:"Huevos a la plancha o revueltos."},
  vd3:{n:"Tostada con queso batido y salmón",it:[["pan",1],["quesoBatido",100],["salmonA",50]],p:23,c:21,f:4,h:"Queso batido untado y salmón ahumado arriba."},
  vd4:{n:"Tortitas de avena y plátano",it:[["avena",40],["huevo",1],["claras",100],["platano",1],["yogProt",100]],p:33,c:55,f:8,h:"Licuá avena, huevo, claras y plátano. Yogur arriba."},
  vm1:{n:"Yogur proteico con kiwi y avena",it:[["yogProt",200],["kiwi",1],["avena",20]],p:24,c:30,f:2,h:"El kiwi en trozos."},
  vm2:{n:"Pan crujiente con cottage y manzana",it:[["panCruj",2],["cottage",150],["manzana",1]],p:20,c:39,f:7,h:"Cottage untado en las tostadas, manzana aparte."},
  vm3:{n:"Huevos con tostada y cherry",it:[["huevo",2],["pan",1],["cherry",100]],p:18,c:21,f:11,h:"Huevos a la plancha o duros."},
  vm4:{n:"Yogur griego con arándanos y nueces",it:[["yogGriego",200],["arandanos",100],["nueces",10]],p:10,c:21,f:23,h:"Todo en un bowl."},
  vm5:{n:"Huevos duros con almendras y tomate",it:[["huevo",2],["almendras",10],["cherry",150]],p:16,c:6,f:15,h:"Ideal para llevar."},
  vm6:{n:"Plátano con crema de cacahuete",it:[["platano",1],["crCac",15]],p:5,c:30,f:8,h:"El plátano mediano, en rodajas."},
  vm7:{n:"Aguacate con atún, limón y pimienta",it:[["aguacate",60],["atun",1]],p:15,c:2,f:10,h:"Medio aguacate pequeño con la lata escurrida."},
  vc1:{n:"Pollo con arroz, calabacín y zanahoria",it:[["pollo",150],["arroz",65],["calabacin",150],["zanahoria",80]],p:42,c:59,f:3,h:"Pollo y arroz del batch; verdura salteada."},
  vc2:{n:"Pollo con garbanzos, patata y verduras",it:[["pollo",130],["garb",120],["patata",50],["zanahoria",60],["pimiento",80]],p:41,c:39,f:5,h:"Salteado o guiso en una olla, con cebolla."},
  vc3:{n:"Pasta integral con ternera y champiñones",it:[["ternera",140],["pasta",60],["tomFrito",60],["champi",100]],p:40,c:44,f:11,h:"Ternera dorada con champiñones y tomate frito."},
  vc4:{n:"Pavo con quinoa, calabacín y pimiento",it:[["pavo",150],["quinoa",65],["calabacin",150],["pimiento",80]],p:46,c:48,f:6,h:"Pavo a la plancha, quinoa del batch."},
  vn1:{n:"Salmón con verduras asadas",it:[["salmon",150],["verd",250]],p:33,c:12,f:19,h:"Plancha u horno; verduras asadas o salteadas."},
  vn2:{n:"Gambas con guisantes, zanahoria y pimiento",it:[["gambas",180],["guis",80],["zanahoria",70],["pimiento",80]],p:42,c:20,f:2,h:"Marinadas con limón y ajo, salteadas."},
  vn3:{n:"Pollo con ensalada completa y patata",it:[["pollo",150],["ens",200],["patata",30]],p:37,c:11,f:3,h:"Pollo a la plancha."},
  vn4:{n:"Pescado blanco con quinoa y verduras",it:[["pescadoB",150],["quinoa",40],["verd",200]],p:35,c:33,f:4,h:"Pescado al horno o plancha."}
};

/* =================== Usuarios =================== */
const JT = [["Desayuno","8:30",["d1","d2","d4"]],["Comida","13:30",["c1","c2","c3","c4"]],["Merienda · pre-entreno","16:30",["m1","m2"]],["Cena · post-entreno","20:45",["n1","n2","n3","n4"]]];
const JR = [["Desayuno","9:00",["d1","d3","d2"]],["Comida","13:30",["c5","c6","c7","c8"]],["Merienda","17:00",["m4","m5","m6"]],["Cena","20:45",["n5","n6","n7","n8"]]];
const VM = [["Desayuno","8:00",["vd1","vd2","vd3","vd4"]],["Media mañana","11:00",["vm1","vm3","vm5","vm7","vm2","vm4","vm6"]],["Comida","14:00",["vc1","vc2","vc3","vc4"]],["Merienda","17:30",["vm2","vm4","vm6","vm1","vm3","vm5","vm7"]],["Cena","21:00",["vn1","vn2","vn3","vn4"]]];
// Ranura equivalente entre usuarios para "Juntos": desayuno, comida, merienda, cena
const SLOT = { jere: { des: 0, com: 1, mer: 2, cen: 3 }, vale: { des: 0, mm: 1, com: 2, mer: 3, cen: 4 } };

const U = {
  jere: {
    name: "Jere", types: {
      calis: { lab: "Calistenia", dot: "t-calis", k: 1900, p: 165, c: 160, f: 55, water: 12, train: true, meals: JT, note: "Calistenia a la tarde: la merienda es tu pre-entreno y la cena, el post." },
      fit: { lab: "Fitboxing", dot: "t-fit", k: 1950, p: 165, c: 175, f: 55, water: 14, train: true, meals: JT, note: "Fitboxing: merienda 1-2 h antes. Agua con una pizca de sal; meta de 3,5 L." },
      rest: { lab: "Descanso", dot: "t-rest", k: 1550, p: 165, c: 60, f: 70, water: 12, train: false, meals: JR, note: "Descanso: sin almidones, los carbos salen de verdura y fruta." }
    },
    sched: ["calis", "fit", "rest", "calis", "fit", "rest", "rest"],
    start: 104.2, goal: 85.6, h: 176, age: 30, male: true, ffm: 68.5,
    goalTxt: "85,6 kg · 20 % de grasa"
  },
  vale: {
    name: "Vale", types: {
      gym: { lab: "Gimnasio", dot: "t-gym", k: 1900, water: 12, train: true, meals: VM, note: "Día de gimnasio. Las meriendas pueden ir antes o después de entrenar." },
      rest: { lab: "Descanso", dot: "t-rest", k: 1750, water: 10, train: false, meals: VM, note: "Día de descanso: mismo plan, 10.000 pasos igual." }
    },
    sched: ["gym", "gym", "rest", "gym", "gym", "rest", "rest"],
    start: 74, goal: 58, h: 167, male: false,
    goalTxt: "58 kg"
  }
};

/* =================== Estado y sincronización =================== */
const CK = "jsfood-v3";
let C = { auth: null, docs: { jere: {}, vale: {}, shared: {} }, pending: [] };
try { Object.assign(C, JSON.parse(localStorage.getItem(CK) || "{}")); } catch (e) {}
let MODE = "remote", ME = null, view = "hoy", syncErr = false;
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
    saveC(); setSync(false); render();
    flush();
  } catch (e) { setSync(true); }
}
function setSync(err) { syncErr = err; const el = $("#sync"); if (el) el.textContent = err ? "● sin conexión" : ""; }

/* =================== Lógica de plan =================== */
const kcal = o => Math.round(o.p * 4 + o.c * 4 + o.f * 9);
const weekNo = d => Math.round((monday(d) - new Date(2026, 0, 5)) / 604800000);
const defType = (u, date) => U[u].sched[wd(pd(date))];
const typeKey = (u, date) => { const t = get(u, "tipo", date); return U[u].types[t] ? t : defType(u, date); };
const typeOf = (u, date) => U[u].types[typeKey(u, date)];
function choice(u, date, mi) {
  const t = typeOf(u, date), list = t.meals[mi][2], s = get(u, "sel", date + ":" + mi);
  if (list.includes(s)) return s;
  return list[(Math.abs(weekNo(pd(date))) + wd(pd(date)) * (u === "vale" ? 2 : 1) + mi) % list.length];
}
const OIL = { jere: 0, vale: 15 }; // g de aceite de oliva para cocinar que no figuran en los platos de la nutricionista
function totals(u, date) { const t = { p: 0, c: 0, f: OIL[u] }; typeOf(u, date).meals.forEach((_, mi) => { const o = D[choice(u, date, mi)]; t.p += o.p; t.c += o.c; t.f += o.f; }); t.k = kcal(t); return t; }
const emos = d => [...new Set(d.it.map(([k]) => I[k].e))].slice(0, 4).join("");
function ingTxt([k, q]) { const it = I[k]; if (it.u === "u") return `${q} ${q === 1 ? it.one : it.many}`; return `${q} ${it.u} de ${it.n.charAt(0).toLowerCase() + it.n.slice(1)}`; }
function ring(frac, col, size = 112, sw = 11) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, frac));
  return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="trk" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${sw}"/><circle class="arc" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${sw}" stroke="${col}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - f)}"/></svg>`;
}
function dayNote(u, date) {
  const t = typeOf(u, date), k = wd(pd(date));
  let n = t.note;
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

/* =================== Equivalentes =================== */
const EQ = {
  pollo:[["pechuga de pavo",1],["lomo de cerdo",1],["merluza",1.2],["gambas",1.2]],
  contra:[["pechuga de pollo",1],["muslo de pavo sin piel",1]],
  pavo:[["pechuga de pollo",1],["lomo de cerdo",1],["merluza",1.2]],
  ternera:[["pavo picado",1],["pollo picado",1]],
  filete:[["lomo de cerdo",1],["pechuga de pollo",1]],
  lomo:[["pechuga de pollo",1],["solomillo de cerdo",1],["filete de ternera",1]],
  salmon:[["caballa",1],["trucha",1],["sardinas",1]],
  salmonA:[["pavo en lonchas",1],["atún al natural",1]],
  bacalao:[["merluza",1],["abadejo",1],["gallo",1]],
  pescadoB:[["bacalao",1],["merluza",1],["gallo",1]],
  gambas:[["langostinos pelados",1],["sepia o calamar",1.1],["merluza",1]],
  atun:[["caballa al natural (lata)",1,"u"],["pechuga de pollo cocida",60,"g"]],
  huevo:[["claras de huevo",60,"g"]],
  claras:[["huevo entero",1/60,"u"]],
  skyr:[["yogur griego 0 %",1],["queso fresco batido 0 %",1],["yogur proteico natural",1]],
  yogGriego:[["skyr natural",1],["yogur natural",1]],
  yogProt:[["skyr natural",1],["queso fresco batido 0 %",1]],
  quesoBatido:[["skyr natural",1],["queso cottage",1]],
  cottage:[["queso fresco batido 0 %",1],["requesón",1]],
  pavoL:[["jamón cocido extra",1],["pechuga de pollo en lonchas",1]],
  avena:[["copos de espelta",1],["rebanada de pan integral",1/40,"u"]],
  arroz:[["quinoa",1],["pasta integral",1],["cuscús",1],["patata",3.6]],
  quinoa:[["arroz",1],["cuscús",1],["patata",3.6]],
  pasta:[["arroz",1],["quinoa",1]],
  pan:[["tostada de pan crujiente integral",2,"u"],["avena",30,"g"]],
  panCruj:[["rebanada de pan integral",0.5,"u"]],
  garb:[["lentejas cocidas",1],["alubias cocidas",1]],
  tomTri:[["tomate natural rallado",1.3]],
  tomFrito:[["tomate triturado",1.3]],
  nueces:[["almendras",1],["avellanas",1],["crema de cacahuete",1]],
  almendras:[["nueces",1],["avellanas",1]],
  crCac:[["crema de almendra",1],["nueces",1]],
  coco:[["yogur griego 0 %",1,"g"]],
  patata:[["boniato",0.85],["arroz (en crudo)",0.28]],
  boniato:[["patata",1.15],["arroz (en crudo)",0.25]],
  verd:[["berenjena, judías verdes o coliflor",1]],
  calabacin:[["berenjena",1],["judías verdes",1]],
  zanahoria:[["calabaza",1],["pimiento",1]],
  pimiento:[["calabacín",1],["cebolla",1]],
  ens:[["rúcula, canónigos o espinaca",1]],
  cherry:[["tomate común",1],["pepino",1]],
  champi:[["setas",1],["berenjena",1]],
  esparr:[["judías verdes",1],["brócoli",1],["calabacín",1]],
  aguacate:[["aceite de oliva",0.15,"ml"],["nueces",0.25],["aceitunas",0.15,"u"]],
  manzana:[["pera",1,"u"],["mandarina",2,"u"],["kiwi",1,"u"],["frutos rojos",150,"g"],["melón o sandía",250,"g"]],
  pera:[["manzana",1,"u"],["mandarina",2,"u"],["kiwi",1,"u"],["frutos rojos",150,"g"],["melón o sandía",250,"g"]],
  platano:[["manzana",1,"u"],["pera",1,"u"],["mango",120,"g"]],
  kiwi:[["mandarina",2,"u"],["manzana",1,"u"],["fresas",150,"g"]],
  arandanos:[["frutos rojos",1],["fresas",1.3]],
  wok:[["verdura congelada mixta",1],["brócoli",1]],
  brocoli:[["coliflor",1],["judías verdes",1]],
  guis:[["edamame",1],["habas",1]],
  frutos:[["kiwi",1/100,"u"],["manzana o pera",1/150,"u"],["melón o sandía",1.5]]
};
function fq(v, u, lab) {
  if (u === "u") { const n = Math.max(1, Math.round(v * 2) / 2); return `${nf(n, n % 1 ? 1 : 0)} × ${lab}`; }
  const r = v < 20 ? Math.round(v) : v < 100 ? Math.round(v / 5) * 5 : Math.round(v / 10) * 10;
  return `${r} ${u} de ${lab}`;
}
function eqLine(k, q) {
  const it = I[k], list = EQ[k]; if (!list) return "";
  const subs = list.map(([lab, f, u]) => fq(q * f, u || it.u, lab));
  const base = it.u === "u" ? `${q} × ${it.one}` : `${q} ${it.u} de ${it.n.charAt(0).toLowerCase() + it.n.slice(1)}`;
  return `<li><span class="eq-from">${it.e} ${base}</span><span class="eq-to">${subs.join(" · ")}</span></li>`;
}
const eqBlock = o => `<details class="eq"><summary>⇄ ¿Te falta algo? Equivalentes</summary><ul>${o.it.map(([k, q]) => eqLine(k, q)).join("")}</ul></details>`;
function eqCard() {
  const groups = CATS.map((c, ci) => {
    const ks = Object.keys(I).filter(k => I[k].cat === ci && EQ[k]); if (!ks.length) return "";
    return `<div class="lbl" style="margin-top:6px">${c}</div><ul>${ks.map(k => eqLine(k, I[k].u === "u" ? 1 : (k === "aguacate" ? 40 : 100))).join("")}</ul>`;
  }).join("");
  return `<div class="card"><details class="eq eq-all"><summary>⇄ Equivalentes de alimentos</summary><p class="small muted">Si no conseguís algo, cambialo por cualquiera de estas opciones en la cantidad indicada: rinde igual en proteína, carbos y calorías.</p>${groups}</details></div>`;
}

/* =================== Navegación de semana =================== */
let weekStart = sunday(TODAY), dayIdx = TODAY.getDay(), semUser = null;
const curDate = () => ds(addD(weekStart, dayIdx));
function strip(sel, attr, u) {
  const days = [...Array(7)].map((_, i) => {
    const d = addD(weekStart, i), s = ds(d), k = wd(d);
    const dot = u ? typeOf(u, s).dot : "";
    return `<button class="day${s === TODS ? " today" : ""}" id="${attr}-${i}" data-${attr}="${i}" aria-pressed="${i === sel}" aria-label="${DFULL[k]} ${d.getDate()}"><span class="dn">${DN[k]}</span><span class="dd">${d.getDate()}</span>${u ? `<span class="dt ${dot}"></span>` : `<span class="dt"></span>`}</button>`;
  }).join("");
  return `<div class="strip"><button class="nav" data-wk="-1" aria-label="Semana anterior">‹</button><div class="days">${days}</div><button class="nav" data-wk="1" aria-label="Semana siguiente">›</button></div>`;
}

/* =================== HOY (cocina compartida) =================== */
const SLOTS = [["des", "Desayuno"], ["mm", "Media mañana"], ["com", "Comida"], ["mer", "Merienda"], ["cen", "Cena"]];
const other = u => (u === "jere" ? "vale" : "jere");
function renderHoy() {
  const u = ME, o = other(u), cfg = U[u], date = curDate(), dObj = pd(date), k = wd(dObj), tk = typeKey(u, date), t = cfg.types[tk], tot = totals(u, date);
  const nMeals = t.meals.length, done = t.meals.filter((_, mi) => get(u, "done", date + ":" + mi)).length;
  const changed = tk !== defType(u, date);
  const seg = Object.entries(cfg.types).map(([key, ty]) => `<button data-type="${key}" aria-pressed="${key === tk}"><span class="dt ${ty.dot}"></span>${ty.lab}</button>`).join("");
  const mb = (lab, v, tg, col) => tg
    ? `<div class="mrow"><div class="mt"><span class="muted">${lab}</span><span><b>${v}</b><span class="muted"> / ${tg} g</span></span></div><div class="bar"><i style="width:${Math.min(100, v / tg * 100)}%;background:${col}"></i></div></div>`
    : `<div class="mrow"><div class="mt"><span class="muted">${lab}</span><span><b>${v}</b><span class="muted"> g</span></span></div><div class="bar"><i style="width:${Math.min(100, v / (lab === "Grasa" ? 80 : lab === "Carbos" ? 220 : 140) * 100)}%;background:${col}"></i></div></div>`;
  const vasos = get(u, "agua", date) || 0;
  const glasses = [...Array(t.water)].map((_, i) => `<button class="glass${i < vasos ? " on" : ""}" data-g="${i}" aria-label="Vaso ${i + 1}"></button>`).join("");
  const kTxt = u === "vale" ? "1.750-1.900" : nf(t.k);
  const to = typeOf(o, date);

  const meals = SLOTS.map(([s, slotLab]) => {
    const mi = SLOT[u][s], omi = SLOT[o][s];
    if (mi === undefined && omi === undefined) return "";
    const mine = mi !== undefined ? D[choice(u, date, mi)] : null, theirs = omi !== undefined ? D[choice(o, date, omi)] : null;
    const lab = mi !== undefined ? t.meals[mi][0] : to.meals[omi][0], hora = mi !== undefined ? t.meals[mi][1] : to.meals[omi][1];
    const isDone = mi !== undefined && !!get(u, "done", date + ":" + mi);
    const oDone = omi !== undefined && !!get(o, "done", date + ":" + omi);
    const col = (who, d, me, dn) => d
      ? `<div class="pc${me ? " me" : ""}"><span class="who-l"><i style="background:var(--${who})"></i>${me ? "Vos" : U[who].name}${dn ? " · ✓" : ""}${!(mine && theirs) ? " · solo" : ""}</span><span class="emo">${emos(d)}</span><b>${d.n}</b><span class="mono small muted">${kcal(d)} kcal</span></div>`
      : `<div class="pc empty"><span class="who-l"><i style="background:var(--${who})"></i>${me ? "Vos" : U[who].name}</span><span class="small muted">No tiene esta comida</span></div>`;
    const pair = mine && theirs ? `<div class="pair">${col(u, mine, true, isDone)}${col(o, theirs, false, oDone)}</div>` : `<div class="pair one">${mine ? col(u, mine, true, isDone) : col(o, theirs, false, oDone)}</div>`;
    let detail = "";
    if (mine) {
      const carbo = mine.c >= 30 ? `<span class="chip c">carbo</span>` : "";
      const opts = t.meals[mi][2].map(id => {
        const d = D[id], sel = id === choice(u, date, mi);
        return `<button class="opt mini${sel ? " sel" : ""}" id="o-${mi}-${id}" data-mi="${mi}" data-id="${id}" aria-pressed="${sel}"><span class="row"><span class="emo">${emos(d)}</span><span class="nm">${d.n}</span><span class="kc">${kcal(d)}</span></span></button>`;
      }).join("");
      detail = `<div class="mine">
        <span class="chips"><span class="chip p">P ${mine.p}</span><span class="chip c">C ${mine.c}</span><span class="chip f">G ${mine.f}</span>${carbo}</span>
        <span class="ing">${mine.it.map(ingTxt).join(" · ")}</span><span class="how">${mine.h}</span></div>
        <details class="eq chg-opts"><summary>↻ Cambiar mi plato (${t.meals[mi][2].length} opciones)</summary><div class="opts">${opts}</div></details>
        ${eqBlock(mine)}`;
    }
    let cook = "";
    if (mine && theirs) {
      const ov = overlap(mine, theirs);
      if (s === "com" || s === "cen") cook = cookBox(s, date, mine, theirs) + suggestions(date, s);
      else if (ov >= 1) cook = cookBox(s, date, mine, theirs);
    }
    return `<div class="card meal${isDone ? " isdone" : ""}"><div class="mh"><div><div class="lbl">${hora} h</div><h3>${lab}</h3></div>
      ${mi !== undefined ? `<button class="toggle" data-done="${mi}" aria-pressed="${isDone}">${isDone ? "✓ Hecho" : "Marcar hecho"}</button>` : ""}</div>
      ${pair}${cook}${detail}</div>`;
  }).join("");

  $("#v-hoy").innerHTML = `
   ${strip(dayIdx, "day", u)}
   <div class="card">
     <div class="dayinfo"><h2>${DFULL[k]} ${dObj.getDate()}</h2>
       ${t.train ? `<button class="toggle" id="ent" aria-pressed="${!!get(u, "ent", date)}">${get(u, "ent", date) ? "✓ Entrené" : "Entrené"}</button>` : ""}</div>
     <div><div class="seg">${seg}</div>${changed ? `<div class="chg" style="margin-top:6px">Cambiado: era ${cfg.types[defType(u, date)].lab.toLowerCase()}. Las comidas ya se ajustaron.</div>` : ""}</div>
     <div class="sum"><div class="ring">${ring(tot.k / t.k, "var(--accent)")}<div class="ctr"><span class="big">${nf(tot.k)}</span><span class="of">de ${kTxt} kcal</span></div></div>
       <div class="macros">${mb("Proteína", tot.p, t.p, "var(--prot)")}${mb("Carbos", tot.c, t.c, "var(--carb)")}${mb("Grasa", tot.f, t.f, "var(--fat)")}</div></div>
     ${OIL[u] ? `<p class="small muted">Incluye ${OIL[u]} g de aceite de oliva para cocinar. Calorías estimadas.</p>` : ""}
     <p class="note">${dayNote(u, date)} <span class="muted">${U[o].name} hoy: ${to.lab.toLowerCase()}.</span></p>
     <div class="wh"><span class="lbl">💧 Agua</span><span class="mono small"><b>${nf(vasos * 0.25, 2)}</b><span class="muted"> / ${nf(t.water * 0.25, 1)} L</span></span></div>
     <div class="glasses">${glasses}</div>
   </div>
   ${meals}
   ${u === "jere" ? sweetCard(date, t, tot, done, nMeals) : ""}`;
}
function sweetCard(date, t, tot, done, nMeals) {
  const sw = premio(date);
  if (!sw) {
    let nx = null; for (let n = 1; n <= 7 && !nx; n++) { const d = ds(addD(pd(date), n)); if (premio(d)) nx = d; }
    return `<div class="card sweet"><div class="sw-main"><div class="lock">😴</div><div><div class="lbl" style="color:var(--sweet)">Premio de hoy</div><div class="sw-n">Hoy no hay premio</div><p class="small muted">Día de descanso.${nx ? ` El próximo premio es el ${DFULL[wd(pd(nx))].toLowerCase()}.` : ""}</p></div></div></div>`;
  }
  const s = SW[sw], margin = t.k - tot.k, needM = s.k > 0, mOk = !needM || margin >= s.k, mealsOk = done === nMeals, open = mOk && mealsOk;
  const cond = (ok, txt) => `<div class="cond${ok ? " ok" : ""}"><span class="ck">${ok ? "✓" : ""}</span><span>${txt}</span></div>`;
  if (open) return `<div class="card sweet open"><div class="sw-main"><div class="lock">${s.e}</div><div><div class="lbl" style="color:var(--sweet)">🔓 Premio desbloqueado</div><div class="sw-n">${s.n}</div></div></div>
    <p class="small">${s.d}</p>${needM ? `<p class="small muted mono">~${s.k} kcal · te quedaban ${margin} kcal de margen</p>` : ""}</div>`;
  return `<div class="card sweet"><div class="sw-main"><div class="lock">🔒</div><div><div class="lbl" style="color:var(--sweet)">Premio de hoy</div><div class="sw-n blur" aria-hidden="true">Premio sorpresa</div></div></div>
    <div class="conds">${cond(mealsOk, `Completá las ${nMeals} comidas del plan (${done}/${nMeals})`)}${needM ? cond(mOk, mOk ? `Tenés margen de calorías (${margin} kcal)` : `Falta margen: elegí platos más livianos (tenés ${Math.max(0, margin)} kcal)`) : ""}</div></div>`;
}
$("#v-hoy").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const u = ME, date = curDate();
  if (b.dataset.day !== undefined) { dayIdx = +b.dataset.day; renderHoy(); }
  else if (b.dataset.wk) { weekStart = addD(weekStart, 7 * b.dataset.wk); renderHoy(); }
  else if (b.dataset.type) { setType(u, date, b.dataset.type); renderHoy(); }
  else if (b.dataset.g !== undefined) { const g = +b.dataset.g + 1, cur = get(u, "agua", date) || 0; put(u, "agua", date, cur === g ? g - 1 : g); renderHoy(); }
  else if (b.dataset.done !== undefined) { const k = date + ":" + b.dataset.done; put(u, "done", k, get(u, "done", k) ? null : true); renderHoy(); }
  else if (b.dataset.id) { put(u, "sel", date + ":" + b.dataset.mi, b.dataset.id); renderHoy(); }
  else if (b.dataset.sug) { put(b.dataset.sug, "sel", b.dataset.sdate + ":" + b.dataset.smi, b.dataset.sid); renderHoy(); }
  else if (b.id === "ent") { put(u, "ent", date, get(u, "ent", date) ? null : true); renderHoy(); }
});
function setType(u, date, key) {
  const before = typeOf(u, date);
  put(u, "tipo", date, key === defType(u, date) ? null : key);
  const after = typeOf(u, date);
  if (before.meals !== after.meals) after.meals.forEach((_, mi) => { if (get(u, "sel", date + ":" + mi)) put(u, "sel", date + ":" + mi, null); });
}

/* =================== SEMANA =================== */
function shopFor(u, dates) { const a = {}; dates.forEach(d => typeOf(u, d).meals.forEach((_, mi) => D[choice(u, d, mi)].it.forEach(([k, q]) => { a[k] = (a[k] || 0) + q; }))); return a; }
function qty(k, q) {
  const it = I[k];
  if (it.per) return `${Math.ceil(q / it.per)} ud`;
  if (it.u === "u") return `${q} ud`;
  const r = q < 100 ? Math.ceil(q / 10) * 10 : Math.ceil(q / 50) * 50;
  return r >= 1000 ? `${nf(r / 1000, r % 1000 ? 1 : 0)} k${it.u}` : `${r} ${it.u}`;
}
const qShort = (k, q) => I[k].u === "u" ? q : I[k].per ? q + "g" : q;
function shopList(id, title, sub, dates) {
  const a = shopFor("jere", dates), b = shopFor("vale", dates), wk = ds(weekStart);
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  const groups = CATS.map((c, ci) => {
    const ks = keys.filter(k => I[k].cat === ci).sort((x, y) => I[x].n.localeCompare(I[y].n)); if (!ks.length) return "";
    return `<div class="cat"><div class="lbl" style="margin-top:8px">${c}</div>${ks.map(k => {
      const sk = `${wk}:${id}:${k}`, got = !!get("shared", "shop", sk), qa = a[k] || 0, qb = b[k] || 0;
      const br = qa && qb ? `<small>J ${qShort(k, qa)} · V ${qShort(k, qb)}</small>` : `<small>${qa ? "solo Jere" : "solo Vale"}</small>`;
      return `<label class="it${got ? " got" : ""}"><input type="checkbox" id="s-${id}-${k}" data-sk="${sk}"${got ? " checked" : ""}><span>${I[k].e}</span><span class="tx">${I[k].n}</span><span class="q">${qty(k, qa + qb)}${br}</span></label>`;
    }).join("")}</div>`;
  }).join("");
  return `<div class="card shop"><h3>${title}<span class="lbl">${sub}</span></h3><p class="small muted">Para los dos. Lo que tildás se ve tildado en los dos celulares.</p>${groups}<p class="small muted">En casa: aceite de oliva, ajo, cebolla, especias, limón y sal.</p></div>`;
}
function batchCard(title, sub, dates) {
  const a = shopFor("jere", dates), b = shopFor("vale", dates);
  const ks = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(k => I[k].batch);
  if (!ks.length) return "";
  return `<div class="card batch"><h3>${title} <span class="lbl">${sub} · para los dos</span></h3><ul>${ks.map(k => `<li><b class="mono">${qty(k, (a[k] || 0) + (b[k] || 0))}</b> ${I[k].n.toLowerCase()}: ${I[k].batch}</li>`).join("")}</ul>
   <p class="small muted">El pescado y las gambas se hacen en el momento: 10-15 min.</p></div>`;
}
function renderSem() {
  const su = semUser || ME, cfg = U[su];
  const dts = [...Array(7)].map((_, i) => ds(addD(weekStart, i))), e = addD(weekStart, 6);
  const plan = dts.map((d, i) => {
    const dO = pd(d), k = wd(dO), tk = typeKey(su, d), t = cfg.types[tk];
    const tsel = `<select class="selx tsel" id="t-${su}-${i}" data-tdate="${d}" aria-label="Tipo de día ${DFULL[k]}">${Object.entries(cfg.types).map(([key, ty]) => `<option value="${key}"${key === tk ? " selected" : ""}>${ty.lab}</option>`).join("")}</select>`;
    const rows = t.meals.map((m, mi) => {
      const c = choice(su, d, mi);
      return `<label class="sel-row"><span class="lbl">${m[0].split(" · ")[0]}</span><select class="selx" id="m-${su}-${i}-${mi}" data-mdate="${d}" data-mi="${mi}">${m[2].map(id => `<option value="${id}"${id === c ? " selected" : ""}>${emos(D[id]).slice(0, 4)} ${esc(D[id].n)}</option>`).join("")}</select></label>`;
    }).join("");
    return `<div class="pday"><div class="pday-h"><b>${DFULL[k]} ${dO.getDate()}${d === TODS ? " · hoy" : ""}</b>${tsel}</div>${rows}</div>`;
  }).join("");
  $("#v-sem").innerHTML = `
   <div class="wnav"><button data-wk="-1" aria-label="Semana anterior">‹</button><div style="text-align:center"><div class="lbl">Semana</div><h2>${weekStart.getDate()} ${MES[weekStart.getMonth()]} – ${e.getDate()} ${MES[e.getMonth()]}</h2></div><button data-wk="1" aria-label="Semana siguiente">›</button></div>
   ${weekShareCard()}
   <div class="card"><h3>Menú de la semana</h3><p class="small muted">El domingo eligen juntos. Podés cambiar el menú de cualquiera de los dos desde acá; la compra se recalcula sola.</p>
     <div class="who-sw">${["jere", "vale"].map(x => `<button data-su="${x}" aria-pressed="${x === su}"><span class="av ${x}">${U[x].name[0]}</span>${U[x].name}</button>`).join("")}</div>
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
  else if (b.dataset.su) { semUser = b.dataset.su; renderSem(); }
});
$("#v-sem").addEventListener("change", e => {
  const el = e.target, su = semUser || ME;
  if (el.dataset.sk) { put("shared", "shop", el.dataset.sk, el.checked ? true : null); el.closest(".it").classList.toggle("got", el.checked); }
  else if (el.dataset.tdate) { setType(su, el.dataset.tdate, el.value); renderSem(); }
  else if (el.dataset.mdate) { put(su, "sel", el.dataset.mdate + ":" + el.dataset.mi, el.value); renderSem(); }
});

/* =================== Cocina compartida (helpers) =================== */
function groupsOf(dish) { const g = {}; dish.it.forEach(([k, q]) => { const gg = I[k].g; (g[gg] ||= []).push([k, q]); }); return g; }
function overlap(a, b) { const ga = groupsOf(a), gb = groupsOf(b); let s = 0; for (const g in ga) if (gb[g]) s += GW[g] || 0.5; return s; }
const fmtQ = (k, q) => I[k].u === "u" ? `${q} ud` : `${q} ${I[k].u}`;
function cookBox(slot, date, dj, dv) {
  const ga = groupsOf(dj), gb = groupsOf(dv);
  const common = Object.keys(ga).filter(g => gb[g] && (GW[g] || 0) >= 1);
  if (!common.length) return `<div class="cook none"><span class="ct">Platos distintos</span><span class="small muted">No comparten base. Si quieren cocinar una sola vez, probá una sugerencia.</span></div>`;
  const nm = { [ME]: "Vos", [other(ME)]: U[other(ME)].name };
  const lines = common.map(g => {
    const all = [...ga[g].map(x => [ME, ...x]), ...gb[g].map(x => [other(ME), ...x])];
    const sameKey = new Set(all.map(x => x[1])).size === 1;
    const tot = sameKey ? ` → <b>${fmtQ(all[0][1], all.reduce((s, x) => s + x[2], 0))}</b>` : "";
    return `<li>${I[all[0][1]].e} <b>${g.charAt(0).toUpperCase() + g.slice(1)}</b> <span class="mono">${all.map(x => `${nm[x[0]]} ${fmtQ(x[1], x[2])}`).join(" + ")}${tot}</span></li>`;
  }).join("");
  return `<div class="cook"><span class="ct">🍳 Cocinen juntos</span><ul>${lines}</ul><span class="small muted">Una sola tanda; después cada uno se sirve su porción.</span></div>`;
}
function suggestions(date, slot) {
  const u = ME, o = other(u), mu = SLOT[u][slot], mo = SLOT[o][slot];
  const cu = choice(u, date, mu), co = choice(o, date, mo), cur = overlap(D[cu], D[co]);
  let bestU = null, bestO = null;
  typeOf(u, date).meals[mu][2].forEach(id => { const s = overlap(D[id], D[co]); if (s > cur && (!bestU || s > bestU.s)) bestU = { id, s }; });
  typeOf(o, date).meals[mo][2].forEach(id => { const s = overlap(D[cu], D[id]); if (s > cur && (!bestO || s > bestO.s)) bestO = { id, s }; });
  const out = [];
  if (bestU) out.push(`<button data-sug="${u}" data-sdate="${date}" data-smi="${mu}" data-sid="${bestU.id}">Vos → ${esc(D[bestU.id].n)}</button>`);
  if (bestO) out.push(`<button data-sug="${o}" data-sdate="${date}" data-smi="${mo}" data-sid="${bestO.id}">${U[o].name} → ${esc(D[bestO.id].n)}</button>`);
  return out.length ? `<div class="sug"><span class="small muted" style="width:100%">Para cocinar una sola vez:</span>${out.join("")}</div>` : "";
}
function weekShareCard() {
  let shared = 0, total = 0;
  for (let i = 0; i < 7; i++) {
    const d = ds(addD(weekStart, i));
    for (const s of ["com", "cen"]) { total++; if (overlap(D[choice("jere", d, SLOT.jere[s])], D[choice("vale", d, SLOT.vale[s])]) >= 3) shared++; }
  }
  const bars = [...Array(total)].map((_, i) => `<i class="${i < shared ? "on" : ""}"></i>`).join("");
  return `<div class="card"><div class="wh"><h3>👩‍🍳 Cocinan juntos esta semana</h3><span class="mono"><b>${shared}</b><span class="muted"> / ${total}</span></span></div>
    <div class="mmatch">${bars}</div>
    <p class="small muted">Comidas y cenas en las que comparten la proteína. En Hoy, cada comida trae sugerencias para igualar platos.</p></div>`;
}

/* =================== PROGRESO =================== */
function wlog(u) { return Object.entries(doc(u).peso || {}).map(([d, kg]) => ({ d, kg })).sort((a, b) => a.d.localeCompare(b.d)); }
function clog(u) { return Object.entries(doc(u).comp || {}).map(([d, c]) => ({ d, ...c, kg: get(u, "peso", d) ?? (c.fm + c.ffm) })).sort((a, b) => a.d.localeCompare(b.d)); }
function wAt(u, date) { let w = U[u].start; wlog(u).forEach(e => { if (e.d <= date) w = e.kg; }); return w; }
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
  if (!cl.length) return `<div class="card"><h3>Composición corporal</h3><p class="small muted">Cuando te midas en la farmacia, cargá el peso con el % de grasa, la masa grasa y la masa sin grasa. Con eso ves si lo que bajás es grasa y no músculo.</p></div>`;
  const last = cl[cl.length - 1], first = cl[0], tot = last.fm + last.ffm;
  const pf = last.fm / tot * 100;
  let delta = "";
  if (cl.length >= 2) {
    const dF = last.fm - first.fm, dM = last.ffm - first.ffm;
    const warn = dM < -1;
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
function last7() { return [...Array(7)].map((_, i) => ds(addD(TODAY, i - 6))); }
function deficitChart(u) {
  const cfg = U[u], days = last7(), W = 340, Hh = 150, L = 34, R = 8, Tp = 10, B = 22, TG = 1100;
  const vals = days.map(d => {
    const h = get(u, "health", d); if (!h) return null;
    const kg = wAt(u, d), bmr = 10 * kg + 6.25 * cfg.h - 5 * cfg.age + 5, intake = totals(u, d).k;
    return Math.round(bmr + (h.kcal || 0) + 0.1 * intake - intake);
  });
  const mx = Math.max(1400, ...vals.filter(v => v !== null).map(Math.abs)), bw = (W - L - R) / 7, y = v => Tp + (mx - v) / mx * (Hh - Tp - B);
  let g = `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}"/><line class="tline" x1="${L}" x2="${W - R}" y1="${y(TG)}" y2="${y(TG)}"/><text x="${L - 5}" y="${y(TG) + 3}" text-anchor="end">1100</text><text x="${L - 5}" y="${y(0) + 3}" text-anchor="end">0</text>`;
  vals.forEach((v, i) => {
    const cx = L + bw * i + bw / 2; g += `<text x="${cx}" y="${Hh - 6}" text-anchor="middle">${DN[wd(pd(days[i]))]}</text>`;
    if (v === null) { g += `<text x="${cx}" y="${y(0) - 6}" text-anchor="middle">–</text>`; return; }
    const v2 = Math.max(0, v); g += `<rect class="${v >= 0 ? "bdef" : "bneg"}" x="${cx - bw * 0.32}" y="${y(v2)}" width="${bw * 0.64}" height="${Math.max(2, y(0) - y(v2))}" rx="4"/>`;
  });
  const ok = vals.filter(v => v !== null), avg = ok.length ? Math.round(ok.reduce((a, b) => a + b, 0) / ok.length) : null;
  return { svg: `<svg class="chart" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Déficit estimado de los últimos 7 días">${g}</svg>`, avg };
}
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
  const wk = [...Array(7)].map((_, i) => ds(addD(sunday(TODAY), i)));
  const trainDays = wk.filter(d => typeOf(u, d).train), entN = trainDays.filter(d => get(u, "ent", d)).length;
  const mealsN = wk.reduce((a, d) => a + typeOf(u, d).meals.filter((_, mi) => get(u, "done", d + ":" + mi)).length, 0);
  const mealsT = wk.reduce((a, d) => a + typeOf(u, d).meals.length, 0);
  const aguaL = wk.reduce((a, d) => a + (get(u, "agua", d) || 0), 0) * 0.25;
  const hd = last7().map(d => get(u, "health", d)).filter(Boolean);
  const avgSteps = hd.length ? Math.round(hd.reduce((a, h) => a + (h.steps || 0), 0) / hd.length) : null;
  const avgK = hd.length ? Math.round(hd.reduce((a, h) => a + (h.kcal || 0), 0) / hd.length) : null;
  const dc = cfg.male ? deficitChart(u) : null;
  const fNow = fatAt(u, cur ?? cfg.start, curD);
  const third = fNow
    ? `<div class="kpi"><div class="v">${fNow.m ? "" : "~"}${nf(fNow.v, 1)} %</div><div class="k">grasa ${fNow.m ? "medida" : "estimada"}</div></div>`
    : `<div class="kpi"><div class="v">${nf(imc(u, cur ?? cfg.start), 1)}</div><div class="k">IMC (meta ${nf(imc(u, cfg.goal), 1)})</div></div>`;
  const ffmNow = ffmAt(u, TODS);
  const goal20 = u === "jere" && ffmNow && Math.abs(ffmNow - 68.5) > 0.3 ? ` Con tu masa sin grasa actual (${nf(ffmNow, 1)} kg), el 20 % de grasa sería ${nf(ffmNow / 0.8, 1)} kg.` : "";
  const hist = [...log].reverse().map(e => { const f = fatAt(u, e.kg, e.d); return `<tr><td class="mono">${e.d.slice(8)}/${e.d.slice(5, 7)}</td><td class="r mono">${nf(e.kg, 1)}</td><td class="r mono">${f ? (f.m ? `<b>${nf(f.v, 1)} %</b>` : `<span class="muted">~${nf(f.v, 1)} %</span>`) : nf(imc(u, e.kg), 1)}</td><td class="r"><button class="del" data-del="${e.d}" aria-label="Borrar">×</button></td></tr>`; }).join("");
  const nTrain = trainDays.length;
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
           <label class="fld"><span class="lbl">% grasa</span><input type="number" id="w-pct" class="inp mono" step="0.1" inputmode="decimal" placeholder="34,3"></label>
           <label class="fld"><span class="lbl">Masa grasa</span><input type="number" id="w-fm" class="inp mono" step="0.1" inputmode="decimal" placeholder="kg"></label>
           <label class="fld"><span class="lbl">Sin grasa</span><input type="number" id="w-ffm" class="inp mono" step="0.1" inputmode="decimal" placeholder="kg"></label>
         </div>
         <p class="small muted">Con uno de los tres alcanza: la app calcula los otros a partir del peso.</p></details>
       <button type="submit" class="btn">Guardar</button>
     </form>
   </div>
   ${compCard(u)}
   <div class="card"><div class="wh"><h3>Peso vs. plan</h3><span class="lbl">hasta el 31 mar</span></div>${weightChart(u)}
     <div class="legend"><span><i style="background:var(--accent)"></i>Tu peso</span><span><i style="background:var(--fat)"></i>Con medición de farmacia</span><span><i style="background:var(--muted)"></i>Ritmo para fin de marzo</span></div>
     ${log.length ? `<details><summary>Historial de peso (${log.length})</summary><div style="overflow-x:auto"><table><thead><tr><th>Fecha</th><th class="r">kg</th><th class="r">${fNow ? "Grasa" : "IMC"}</th><th></th></tr></thead><tbody>${hist}</tbody></table></div><p class="small muted">En negrita, % medido en farmacia; con ~, estimado con tu última masa sin grasa.</p></details>` : ""}
   </div>
   <div class="card"><h3>Esta semana</h3>
     <div class="stats3">
       <div class="kpi"><div class="dots">${[...Array(nTrain)].map((_, i) => `<i class="${i < entN ? "on" : ""}"></i>`).join("")}</div><div class="k" style="margin-top:6px">entrenos ${entN}/${nTrain}</div></div>
       <div class="kpi"><div class="v">${mealsN}<span class="muted" style="font-size:13px">/${mealsT}</span></div><div class="k">comidas del plan</div></div>
       <div class="kpi"><div class="v">${nf(aguaL, 1)}<span class="muted" style="font-size:13px"> L</span></div><div class="k">agua total</div></div>
     </div></div>
   <div class="card"><div class="wh"><h3>Actividad · Apple Health</h3><button class="pill" id="btn-health">＋ Importar</button></div>
     ${hd.length ? `<div class="stats3">
       <div class="kpi"><div class="v">${nf(avgSteps)}</div><div class="k">pasos/día</div></div>
       <div class="kpi"><div class="v">${nf(avgK)}</div><div class="k">kcal activas/día</div></div>
       ${dc ? `<div class="kpi"><div class="v" style="color:var(--accent)">${dc.avg !== null ? nf(dc.avg * 7 / 7700, 1) : "—"}</div><div class="k">kg/sem estimados</div></div>` : `<div class="kpi"><div class="v">${hd.length}</div><div class="k">días cargados</div></div>`}</div>
       ${dc ? `<div><div class="lbl" style="margin-bottom:4px">Déficit estimado por día (kcal)</div>${dc.svg}
       <div class="legend"><span><i style="background:var(--accent)"></i>Déficit</span><span><i style="background:var(--carb)"></i>Objetivo para 1 kg/sem</span></div></div>
       <p class="small muted">Estimación: metabolismo basal (Mifflin-St Jeor) + kcal activas de Salud, contra lo que marca tu plan del día. Usala como tendencia; la balanza manda.</p>` : ""}`
      : `<p class="small muted">Todavía no hay datos. Importá pasos y kcal activas desde Salud.</p>`}
   </div>
   ${u === "jere" ? `<div class="card"><details><summary>Hitos y cómo ajustar</summary>
     <div style="overflow-x:auto"><table><thead><tr><th>Fecha</th><th class="r">Objetivo</th></tr></thead><tbody>
      <tr><td>30 nov</td><td class="r mono">≈99 kg</td></tr><tr><td>31 dic</td><td class="r mono">≈95 kg</td></tr><tr><td>31 ene</td><td class="r mono">≈91 kg</td></tr><tr><td>28 feb</td><td class="r mono">≈88 kg</td></tr><tr><td>31 mar</td><td class="r mono">≈85,6 kg · 20 %</td></tr></tbody></table></div>
     <ul class="small" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:5px">
      <li>Pesate 3 mañanas por semana, en ayunas, y mirá la tendencia, no el dato suelto.</li>
      <li>Si bajás menos de 0,7 kg por semana dos semanas seguidas, elegí las cenas más livianas los días de entreno.</li>
      <li>Si bajás más de 1,3 kg por semana o el Fitboxing se te hace cuesta arriba, sumá una fruta a la merienda.</li>
      <li>Medite en farmacia cada 4 semanas. Si la masa sin grasa cae más de 1 kg, subí 150 kcal.</li></ul>
   </details></div>`
   : `<div class="card"><details><summary>Sobre tu meta</summary>
     <p class="small">De 74 a 58 kg son 16 kg. Para fin de marzo haría falta bajar unos 0,7 kg por semana, que es exigente. Seguí el ritmo que marque la nutricionista: la app muestra a qué fecha llegás según tu ritmo real.</p>
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
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.del) { put(ME, "peso", b.dataset.del, null); put(ME, "comp", b.dataset.del, null); renderPro(); }
  if (b.dataset.delc) { put(ME, "comp", b.dataset.delc, null); renderPro(); }
  if (b.id === "btn-health") openM("m-health");
});

/* =================== Salud =================== */
function parseHealth(txt) {
  const m = String(txt).match(/JSFOOD;([^;\n]*);([^;\n]*);?([^;\n]*)/i); if (!m) return null;
  const n = v => { const x = parseInt(String(v).replace(/[^\d]/g, ""), 10); return isNaN(x) ? "" : x; };
  return { steps: n(m[1]), kcal: n(m[2]), min: n(m[3]) };
}
function fillHealth(txt) {
  const h = parseHealth(txt); if (!h) { $("#h-msg").textContent = "No reconozco el formato. Tiene que empezar con JSFOOD;"; return; }
  $("#h-steps").value = h.steps; $("#h-kcal").value = h.kcal; $("#h-min").value = h.min; $("#h-msg").textContent = "Listo, revisá los datos y guardá.";
}
$("#h-raw").addEventListener("input", e => { if (e.target.value.trim()) fillHealth(e.target.value); });
$("#h-paste").addEventListener("click", async () => {
  try { const t = await navigator.clipboard.readText(); $("#h-raw").value = t; fillHealth(t); }
  catch (err) { $("#h-msg").textContent = "El navegador no deja leer el portapapeles: mantené apretado el cuadro de texto y elegí Pegar."; $("#h-raw").focus(); }
});
$("#h-save").addEventListener("click", () => {
  const d = $("#h-date").value, s = +$("#h-steps").value || 0, k = +$("#h-kcal").value || 0, m = +$("#h-min").value || 0;
  if (!d || (!s && !k)) { $("#h-msg").textContent = "Cargá al menos pasos o kcal activas."; return; }
  put(ME, "health", d, { steps: s, kcal: k, min: m }); closeM(); renderPro();
});

/* =================== Reglas =================== */
function rulesHTML() {
  if (ME === "vale") return `<div class="rules">
      <div class="rule"><b>5 comidas</b>Desayuno, media mañana, comida, merienda y cena, del plan de la nutricionista.</div>
      <div class="rule"><b>1.750-1.900 kcal</b>Lo que marca el plan. Los días de gimnasio, la parte alta.</div>
      <div class="rule"><b>Gimnasio 4 días</b>Lunes, martes, jueves y viernes; se puede mover desde Hoy.</div>
      <div class="rule"><b>10.000 pasos</b>Todos los días.</div>
      <div class="rule"><b>Agua</b>2,5 L; 3 L los días de gimnasio.</div>
      <div class="rule"><b>Revisión</b>La nutricionista revisa el menú cada 3 semanas.</div></div>
    <p class="small muted">Las meriendas del plan se usan dos veces al día (media mañana y merienda). Con las cantidades del plan más 15 g de aceite para cocinar, el día suma unas 1.500-1.900 kcal según lo que elijas; las calorías de cada plato son estimaciones.</p>`;
  return `<div class="rules">
      <div class="rule"><b>4 comidas</b>3-5 h entre comidas y 12 h de ayuno nocturno.</div>
      <div class="rule"><b>≈40 g de proteína por comida</b>Es lo único que no se negocia.</div>
      <div class="rule"><b>Verdura libre</b>Medí el aceite: 1 cucharada son 10 g.</div>
      <div class="rule"><b>Pesos en crudo</b>Carne, arroz, pasta y quinoa.</div>
      <div class="rule"><b>3 L de agua</b>3,5 L los días de Fitboxing, con una pizca de sal.</div>
      <div class="rule"><b>Una comida libre</b>El sábado, sin compensar después.</div></div>
    <h3>¿Por qué los carbos van cerca del entreno?</h3>
    <p class="small">Para bajar grasa lo que más pesa es el déficit total de calorías y comer suficiente proteína. Con las mismas calorías y proteína, las dietas altas y bajas en carbos dan una pérdida de grasa parecida. Donde los carbos sí suman es en el rendimiento de entrenos intensos como el Fitboxing.</p>
    <p class="small">Por eso el plan los concentra en la merienda (antes de entrenar, a las 17-20 h) y en la cena (después). Si un día cambiás el tipo de entreno desde Hoy, las comidas se ajustan solas.</p>`;
}

/* =================== Modales y navegación =================== */
let lastFocus = null;
function openM(id) {
  lastFocus = document.activeElement; const m = $("#" + id); m.hidden = false;
  if (id === "m-health") { $("#h-date").value = TODS; ["h-raw", "h-steps", "h-kcal", "h-min"].forEach(i => $("#" + i).value = ""); $("#h-msg").textContent = ""; }
  if (id === "m-rules") $("#rules-body").innerHTML = rulesHTML();
  if (id === "m-user") $("#user-info").textContent = `Entraste como ${U[ME].name}${MODE === "local" ? " (modo local: los datos quedan solo en este dispositivo)" : ""}.`;
  m.querySelector(".x").focus();
}
function closeM() { document.querySelectorAll(".ov").forEach(o => o.hidden = true); if (lastFocus) lastFocus.focus(); }
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
    const st = JSON.parse(localStorage.getItem("jsfood-v2") || "{}");
    for (const key of ["sel", "done", "agua", "ent", "health"]) for (const [sub, val] of Object.entries(st[key] || {})) if (val && get("jere", key, sub) === undefined) put("jere", key, sub, val);
    if (!doc("jere").comp || !Object.keys(doc("jere").comp).length) { put("jere", "comp", "2026-09-08", { pct: 34.3, fm: 35.7, ffm: 68.5 }); if (get("jere", "peso", "2026-09-08") === undefined) put("jere", "peso", "2026-09-08", 104.2); }
    localStorage.setItem("jsfood-migrated", "1");
  } catch (e) {}
}
async function enter(u, pin) {
  C.auth = { user: u, pin }; saveC();
  ME = u; semUser = null;
  document.documentElement.classList.toggle("u-vale", u === "vale");
  $("#v-login").hidden = true; $("#hdr").hidden = false; $("#tabbar").hidden = false;
  const me = $("#btn-me"); me.className = "av " + u; me.textContent = U[u].name[0];
  $("#hdate").textContent = `${U[u].name} · ${DFULL[wd(TODAY)]} ${TODAY.getDate()} de ${MES[TODAY.getMonth()]}`;
  show("hoy");
  if (MODE === "remote") { await pull(); migrateLegacy(u); }
  else migrateLegacy(u);
  const hh = location.hash.match(/JSFOOD[^#]*/i);
  if (hh) { const h = parseHealth(decodeURIComponent(hh[0])); if (h) put(u, "health", TODS, { steps: +h.steps || 0, kcal: +h.kcal || 0, min: +h.min || 0 }); }
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
  catch (e) { MODE = C.auth?.pin ? "remote" : "local"; setSync(MODE === "remote"); return; } // sin red: si ya había sesión, sigue en modo servidor y sincroniza después
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
