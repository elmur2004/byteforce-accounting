# ByteForce Accounting — cloud web app (Cloudflare Pages)

Income, expenses, payroll, media buying, loans, treasury, P&L, targets — in
English + Arabic. Data is stored **in the cloud (Cloudflare KV)**, not on your
device, so it follows you across browsers, incognito windows, and devices.
Access is protected by a password only you know.

## Two companies (multi-tenant)

On first load you pick a company — **ByteForce** or **B-Systems** — each with its
own branding and its **own separate data**. Switch anytime via **Data ▾ → Switch
company**. The same `APP_PASSWORD` and the same `BYTEFORCE_KV` namespace serve
both; each company's data is stored under its own key (`appdata:byteforce`,
`appdata:bsystems`) automatically — no extra setup.

## What's in this folder

```
index.html               the app (front-end)
functions/api/data.js    the cloud storage API (Cloudflare Pages Function, uses KV)
README.md
(netlify.toml, netlify/, package.json are leftovers from Netlify — Cloudflare ignores them)
```

## How the memory works

- The whole app is saved as one JSON document in **Cloudflare KV** (Cloudflare's
  cloud key/value store).
- The front-end talks to it through `/api/data` (a Cloudflare Pages Function).
- A password you set in Cloudflare (`APP_PASSWORD`) guards read/write access.
- **Backups:** use **Data ▾ → Export to Excel** any time for a file you control.

---

## Deploy to Cloudflare Pages (no build, no terminal)

### 1. Create the storage (KV namespace)
1. Sign in at https://dash.cloudflare.com (free account).
2. Left sidebar: **Storage & Databases → KV** → **Create a namespace**.
3. Name it `byteforce` → **Add**.

### 2. Create the Pages project from GitHub
1. Left sidebar: **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**.
2. Authorize GitHub and pick your **byteforce-accounting** repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
4. Click **Save and Deploy**. Wait for the first deploy to finish — you'll get a
   URL like `https://byteforce-accounting.pages.dev`.

### 3. Wire up the password + storage, then redeploy
1. Open your new Pages project → **Settings**.
2. **Variables and Secrets** (Environment variables) → add:
   - **Variable name:** `APP_PASSWORD`  ·  **Value:** *(a strong password)* → Save.
3. **Functions → KV namespace bindings** (or **Bindings → Add → KV namespace**):
   - **Variable name:** `BYTEFORCE_KV`  (must be exactly this)
   - **KV namespace:** select `byteforce` → Save.
4. **Deployments** tab → on the latest deploy click **⋯ → Retry deploy**
   (so the new password + binding take effect).

### 4. Check it works
1. Open `https://your-project.pages.dev/api/data` directly.
   - You should see `{"error":"unauthorized"}` — the function is live and locked. ✅
   - `{"error":"not_configured"}` → `APP_PASSWORD` or the `BYTEFORCE_KV` binding is
     missing (redo step 3, then retry the deploy).
2. Open your site URL. It asks for the password once — enter your `APP_PASSWORD`.
   Type on your laptop, open the same URL on your phone/incognito, enter the
   password, and your data is there.

## Updating later
Edit files on GitHub (or push) → Cloudflare Pages auto-redeploys in ~1 minute.

## Moving old data in
On any device: **Data ▾ → Export to Excel**, then on another **Data ▾ → Import
from Excel**.
