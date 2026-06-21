// Netlify Function: cloud storage for ByteForce Accounting.
// Stores the whole app as ONE JSON document in Netlify Blobs (cloud, not device).
// Protected by the APP_PASSWORD environment variable you set in Netlify.
//
// Routes (same site, no CORS needed):
//   GET  /api/data  -> { value: "<json string>" | null }
//   POST /api/data  with { value: "<json string>" } -> { ok: true }

import { getStore } from "@netlify/blobs";

const STORE_NAME = "byteforce";
const DOC_KEY = "appdata";

export default async (req) => {
  // --- auth (fail CLOSED) ---
  const expected = process.env.APP_PASSWORD;
  // If APP_PASSWORD is not set, refuse all access so the ledger is never public.
  // The app shows a "finish setup" screen until you set it in Netlify + redeploy.
  if (!expected) {
    return json({ error: "not_configured", message: "Set APP_PASSWORD in Netlify, then redeploy." }, 503);
  }
  const provided = req.headers.get("x-app-key") || "";
  if (provided !== expected) {
    return json({ error: "unauthorized" }, 401);
  }

  let store;
  try {
    store = getStore({ name: STORE_NAME, consistency: "strong" });
  } catch (e) {
    return json({ error: "Blob store unavailable: " + (e?.message || e) }, 500);
  }

  try {
    if (req.method === "GET") {
      const value = await store.get(DOC_KEY); // string or null
      return json({ value: value ?? null });
    }
    if (req.method === "POST") {
      let body;
      try { body = await req.json(); } catch (e) { return json({ error: "bad json" }, 400); }
      const value = typeof body.value === "string" ? body.value : JSON.stringify(body.value ?? null);
      await store.set(DOC_KEY, value);
      return json({ ok: true });
    }
    return json({ error: "method not allowed" }, 405);
  } catch (e) {
    return json({ error: "server error: " + (e?.message || e) }, 500);
  }
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export const config = { path: "/api/data" };
