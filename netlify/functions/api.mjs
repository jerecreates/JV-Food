// API de JV Food: login con PIN por usuario, lectura del estado compartido y escritura por operaciones.
import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

const USERS = ["jere", "vale"];
const DOCS = ["jere", "vale", "shared"];
const SALT = "jsfood-v1";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

const hash = (user, pin) => createHash("sha256").update(`${SALT}:${user}:${pin}`).digest("hex");

const store = () => getStore({ name: "jsfood", consistency: "strong" });

async function checkAuth(req, s) {
  const user = (req.headers.get("x-user") || "").toLowerCase();
  const pin = req.headers.get("x-pin") || "";
  if (!USERS.includes(user) || !/^\d{4}$/.test(pin)) return null;
  const auth = await s.get(`auth:${user}`, { type: "json" });
  if (!auth || auth.hash !== hash(user, pin)) return null;
  return user;
}

// Aplica operaciones {doc, key, sub, val} sobre un documento con control de concurrencia (etag).
async function applyOps(s, doc, ops) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const cur = await s.getWithMetadata(`doc:${doc}`, { type: "json" });
    const data = cur?.data && typeof cur.data === "object" ? cur.data : {};
    for (const { key, sub, val } of ops) {
      if (typeof key !== "string" || typeof sub !== "string") continue;
      if (!data[key] || typeof data[key] !== "object") data[key] = {};
      if (val === null || val === undefined) delete data[key][sub];
      else data[key][sub] = val;
    }
    const res = cur
      ? await s.setJSON(`doc:${doc}`, data, { onlyIfMatch: cur.etag })
      : await s.setJSON(`doc:${doc}`, data, { onlyIfNew: true });
    if (res.modified) return data;
  }
  throw new Error("conflict");
}

// Estimación de macros con Claude a través del AI Gateway de Netlify (las credenciales las inyecta Netlify).
const MODELS = ["claude-haiku-4-5", "claude-haiku-5-5", "claude-sonnet-4-5"];
const PROMPT = `Sos un nutricionista que estima macros de comidas reales en España (porciones típicas de casa, bar o restaurante).
Te paso la descripción y/o la foto de lo que comió una persona. Estimá cada alimento con su cantidad aproximada.
Respondé SOLO con JSON válido, sin texto antes ni después, con esta forma:
{"nombre":"nombre corto del plato","items":[{"alimento":"","cantidad":"ej. 150 g","p":0,"c":0,"g":0,"alcohol":0}],"dulce":false,"nota":""}
p = proteína en gramos, c = carbohidratos en gramos, g = grasa en gramos, alcohol = gramos de alcohol (0 si no hay).
"dulce" es true si incluye postre, chocolate, helado, bollería o algo con mucho azúcar.
"nota" es una frase corta solo si una suposición importante cambia mucho el resultado; si no, vacía.
Si no podés identificar comida, devolvé items vacío y explicalo en "nota".`;

async function estimate(text, image) {
  const key = process.env.ANTHROPIC_API_KEY, base = (process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");
  if (!key) return json({ error: "La IA no está activada en Netlify" }, 503);
  if (!text && !image) return json({ error: "Falta la descripción" }, 400);
  const content = [];
  if (image) {
    const m = image.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
    if (!m || m[2].length > 2_000_000) return json({ error: "La foto es demasiado grande" }, 400);
    content.push({ type: "image", source: { type: "base64", media_type: m[1], data: m[2] } });
  }
  content.push({ type: "text", text: text ? `Lo que comí: ${text}` : "Estimá lo que se ve en la foto." });
  let lastErr = "";
  for (const model of MODELS) {
    const r = await fetch(`${base}/v1/messages`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: 800, system: PROMPT, messages: [{ role: "user", content }] })
    });
    if (!r.ok) { lastErr = `${r.status} ${(await r.text()).slice(0, 200)}`; if (r.status === 404 || r.status === 400) continue; break; }
    const data = await r.json();
    const out = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    const j = parseJSON(out);
    if (!j) return json({ error: "No entendí la respuesta de la IA" }, 502);
    const items = (Array.isArray(j.items) ? j.items : []).slice(0, 12).map(x => {
      const p = num(x.p), c = num(x.c), f = num(x.g ?? x.f), a = num(x.alcohol);
      return { n: String(x.alimento || "").slice(0, 60), q: String(x.cantidad || "").slice(0, 30), p, c, f, a, k: Math.round(p * 4 + c * 4 + f * 9 + a * 7) };
    });
    if (!items.length) return json({ error: j.nota || "No reconocí comida" }, 422);
    const sum = k => Math.round(items.reduce((s, x) => s + x[k], 0));
    return json({ n: String(j.nombre || "").slice(0, 60), items, p: sum("p"), c: sum("c"), f: sum("f"), a: sum("a"), sweet: !!j.dulce, nota: String(j.nota || "").slice(0, 200), model });
  }
  return json({ error: "La IA no respondió" + (lastErr ? ` (${lastErr.slice(0, 80)})` : "") }, 502);
}
const num = v => { const x = parseFloat(v); return isFinite(x) && x >= 0 ? Math.round(x * 10) / 10 : 0; };
function parseJSON(t) { try { return JSON.parse(t); } catch (e) {} const m = t.match(/\{[\s\S]*\}/); if (!m) return null; try { return JSON.parse(m[0]); } catch (e) { return null; } }

export default async (req) => {
  const url = new URL(req.url);
  const route = url.pathname.replace(/^\/api\/?/, "");
  const s = store();

  try {
    if (route === "status" && req.method === "GET") {
      const out = {};
      for (const u of USERS) out[u] = !!(await s.get(`auth:${u}`, { type: "json" }));
      return json({ users: out });
    }

    if (route === "login" && req.method === "POST") {
      const { user, pin } = await req.json();
      const u = String(user || "").toLowerCase();
      if (!USERS.includes(u) || !/^\d{4}$/.test(String(pin))) return json({ error: "PIN de 4 números" }, 400);
      const auth = await s.get(`auth:${u}`, { type: "json" });
      if (!auth) {
        await s.setJSON(`auth:${u}`, { hash: hash(u, pin), created: new Date().toISOString() });
        return json({ ok: true, created: true });
      }
      if (auth.hash !== hash(u, pin)) return json({ error: "PIN incorrecto" }, 401);
      return json({ ok: true });
    }

    if (route === "state" && req.method === "GET") {
      if (!(await checkAuth(req, s))) return json({ error: "auth" }, 401);
      const out = {};
      for (const d of DOCS) out[d] = (await s.get(`doc:${d}`, { type: "json" })) || {};
      return json(out);
    }

    if (route === "ops" && req.method === "POST") {
      if (!(await checkAuth(req, s))) return json({ error: "auth" }, 401);
      const { ops } = await req.json();
      if (!Array.isArray(ops) || ops.length > 500) return json({ error: "ops" }, 400);
      const byDoc = {};
      for (const op of ops) {
        if (!op || !DOCS.includes(op.doc)) continue;
        (byDoc[op.doc] ||= []).push(op);
      }
      for (const [doc, list] of Object.entries(byDoc)) await applyOps(s, doc, list);
      return json({ ok: true, applied: ops.length });
    }

    if (route === "estimate" && req.method === "POST") {
      if (!(await checkAuth(req, s))) return json({ error: "auth" }, 401);
      const { text, image } = await req.json();
      return await estimate(String(text || "").slice(0, 600), typeof image === "string" ? image : null);
    }

    return json({ error: "not found" }, 404);
  } catch (err) {
    return json({ error: String(err.message || err) }, 500);
  }
};

export const config = { path: "/api/*" };
