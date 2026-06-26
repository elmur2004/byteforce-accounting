// Cloudflare Worker — serves the static app (from /public via the ASSETS binding)
// and the cloud storage API at /api/data (backed by Workers KV).
//
//   GET  /api/data  -> { value: "<json string>" | null }
//   POST /api/data  with { value: "<json string>" } -> { ok: true }
//
// Multi-tenant: the app sends x-tenant (byteforce | bsystems); each company's
// data lives under its own KV key "appdata:<tenant>". Protected by APP_PASSWORD.

const docKey = t => "appdata:" + (String(t || "byteforce").replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "byteforce");

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

async function handleData(request, env) {
  // auth — fail CLOSED
  const expected = env.APP_PASSWORD;
  if (!expected) return json({ error: "not_configured", message: "Set APP_PASSWORD, then redeploy." }, 503);
  const provided = request.headers.get("x-app-key") || "";
  if (provided !== expected) return json({ error: "unauthorized" }, 401);

  const kv = env.BYTEFORCE_KV;
  if (!kv) return json({ error: "not_configured", message: "Bind a KV namespace named BYTEFORCE_KV, then redeploy." }, 503);

  const key = docKey(request.headers.get("x-tenant"));
  try {
    if (request.method === "GET") {
      const value = await kv.get(key);
      return json({ value: value ?? null });
    }
    if (request.method === "POST") {
      let body;
      try { body = await request.json(); } catch (e) { return json({ error: "bad json" }, 400); }
      const value = typeof body.value === "string" ? body.value : JSON.stringify(body.value ?? null);
      await kv.put(key, value);
      return json({ ok: true });
    }
    return json({ error: "method not allowed" }, 405);
  } catch (e) {
    return json({ error: "server error: " + (e && e.message ? e.message : String(e)) }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/data") return handleData(request, env);
    return env.ASSETS.fetch(request); // serve static files from /public
  },
};
