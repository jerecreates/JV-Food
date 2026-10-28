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

    return json({ error: "not found" }, 404);
  } catch (err) {
    return json({ error: String(err.message || err) }, 500);
  }
};

export const config = { path: "/api/*" };
