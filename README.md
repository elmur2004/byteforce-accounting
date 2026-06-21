# ByteForce Accounting — cloud web app

Income, expenses, payroll, media buying, loans, treasury, P&L, targets — in
English + Arabic. Your data is stored **in the cloud (Netlify Blobs)**, not on
your device, so it follows you across browsers, incognito windows, and devices.
Access is protected by a password only you know.

## What's in this folder

```
index.html               the app (front-end)
netlify/functions/data.mjs   the cloud storage API (reads/writes Netlify Blobs)
netlify.toml             Netlify config
package.json             function dependency (@netlify/blobs)
.gitignore
```

## How the memory works

- The whole app is saved as one JSON document in **Netlify Blobs** (Netlify's
  built-in cloud store).
- The front-end talks to it through `/api/data` (a Netlify Function).
- A password you set in Netlify (`APP_PASSWORD`) guards read/write access. Your
  browser remembers the password locally so you only type it once per device.
- **Backups:** use **Data ▾ → Export to Excel** any time for a file you control.

> ⚠️ This app needs the Netlify Function to run, so it can't just be opened as a
> file or via a plain static host — it must be deployed to **Netlify** (steps
> below), which runs the function for free.

---

## Deploy to Netlify (via GitHub — no terminal needed)

You chose the "Netlify only" option, which uses Netlify's own cloud storage. That
needs a build step, so deploy through GitHub (one-time setup, then every change
auto-deploys).

### 1. Put these files on GitHub (folder structure matters!)
1. Create a free account at https://github.com (if you don't have one).
2. Click **New repository** → name it `byteforce-accounting` → **Create**.
3. On the repo page click **uploading an existing file**.
4. **Drag the `netlify` FOLDER ICON itself** onto the page (do **not** open it and
   select the files inside) — then drag the loose files `index.html`,
   `netlify.toml`, `package.json` too. This keeps the `netlify/functions/`
   structure intact.
5. ✅ **Check before committing:** GitHub should show a **`netlify`** folder; click
   into it and you should see **`functions/data.mjs`**. If you only see loose
   files, delete them and re-drag the `netlify` folder.
   *(Easiest alternative if dragging is fiddly: install **GitHub Desktop** and
   drag the whole project folder into a repo — it always keeps the structure.)*
6. Scroll down and click the green **Commit changes** button.

### 2. Set your password FIRST, then connect to Netlify
> Do this before entering any real data, so your ledger is never public.

1. Go to https://app.netlify.com → **Add new site → Import an existing project**.
2. Choose **GitHub**, authorize, and pick your `byteforce-accounting` repo.
3. Build settings (auto-filled from `netlify.toml`): **Build command** empty,
   **Publish directory** `.`
4. **Before clicking Deploy**, open **Add environment variables** (or
   *Site configuration → Environment variables* right after) and add:
   - Key: `APP_PASSWORD`  ·  Value: *(choose a strong password)*
5. Click **Deploy**. You'll get a URL like `https://your-site.netlify.app`.
   *(If you added the password after the first deploy, go to
   **Deploys → Trigger deploy → Deploy site** so it takes effect.)*

### 3. Check it works
1. Open `https://your-site.netlify.app/api/data` directly. You should see
   `{"error":"unauthorized"}` — that means the function is live **and** locked
   (good!). If you instead get a **404**, the `netlify/functions/` folder didn't
   upload correctly — redo step 1.4.
2. Open your site URL. The first time you save/load it asks for the password —
   enter your `APP_PASSWORD`. Done: type on your laptop, open the same URL on your
   phone or in incognito, enter the password, and your data is there.

> If you ever see a red **"Finish setup"** screen, `APP_PASSWORD` isn't set —
> add it in Netlify and redeploy.

---

## Updating the app later
Edit the files on GitHub (or re-upload) → Netlify redeploys automatically.

## Optional: run it locally
Local use needs Netlify's dev tools so the function works:
```bash
npm install
npx netlify dev
```
Then open the URL it prints. (Plain double-click / static server won't have the
cloud function.)

## Moving old data in
If you typed data into the old (device-only) version, open that old version,
**Data ▾ → Export to Excel**, then in the new cloud app **Data ▾ → Import from
Excel**.
