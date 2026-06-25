// Cloudflare Pages Function — cloud storage for ByteForce Accounting.
// Served at /api/data. Stores the whole app as ONE JSON document in
// Cloudflare KV (cloud, not your device). Protected by the APP_PASSWORD
// environment variable. Requires a KV namespace bound as BYTEFORCE_KV.
//
//   GET  /api/data  -> { value: "<json string>" | null }
//   POST /api/data  with { value: "<json string>" } -> { ok: true }

const DOC_KEY = "appdata";

export async function onRequest(context) {
  const { request, env } = context;

  // --- auth (fail CLOSED) ---
  const expected = env.APP_PASSWORD;
  if (!expected) {
    return json({ error: "not_configured", message: "Set APP_PASSWORD in Cloudflare Pages settings, then redeploy." }, 503);
  }
  const provided = request.headers.get("x-app-key") || "";
  if (provided !== expected) {
    return json({ error: "unauthorized" }, 401);
  }

  // --- storage (Cloudflare KV) ---
  const kv = env.BYTEFORCE_KV;
  if (!kv) {
    return json({ error: "not_configured", message: "Bind a KV namespace named BYTEFORCE_KV in Cloudflare Pages settings, then redeploy." }, 503);
  }

  try {
    if (request.method === "GET") {
      const value = await kv.get(DOC_KEY);   // string or null
      return json({ value: value ?? null });
    }
    if (request.method === "POST") {
      let body;
      try { body = await request.json(); } catch (e) { return json({ error: "bad json" }, 400); }
      const value = typeof body.value === "string" ? body.value : JSON.stringify(body.value ?? null);
      await kv.put(DOC_KEY, value);
      return json({ ok: true });
    }
    return json({ error: "method not allowed" }, 405);
  } catch (e) {
    return json({ error: "server error: " + (e && e.message ? e.message : String(e)) }, 500);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
