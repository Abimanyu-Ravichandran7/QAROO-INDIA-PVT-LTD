# Deploying Qaroo India

Everything in the repository is deploy-ready. What remains needs accounts and
DNS, which is why it is written as steps rather than done for you.

Run the check before and after each attempt:

```bash
cd backend
NODE_ENV=production node tools/preflight.mjs
```

It exits non-zero while anything is still blocking, and it never prints a secret.

---

## 1. Decide the domain first

Everything else depends on this, so settle it before touching a host.

| Domain | DNS | Notes |
| --- | --- | --- |
| `qaroo.in`, `www.qaroo.in` | resolves to `68.178.153.15` (GoDaddy) | also hosts the `support@qaroo.in` mailbox |
| `qarootech.in` | **no A record, no NS records** | cannot serve a site in this state |

The project now uses **`https://www.qaroo.in`**, because it is the domain that
resolves and the one the mail is on. Your social handles are `qarootech`, so if
the intended public domain is really `qarootech.in`, you must first point its
DNS at a host — then change it in exactly three places:

1. `src/data/site.js` — `SITE_URL` (frontend canonicals, og:url, sitemap)
2. `backend/config/site.js` — `SITE_URL` (canonicals written onto records)
3. `index.html` and `public/robots.txt` — static literals

then re-run:

```bash
node tools/build-sitemap.mjs                                   # regenerate the 34 URLs
cd backend && node tools/retarget-domain.mjs --apply           # rewrite stored canonicalUrl
cd .. && npm run build
```

`retarget-domain.mjs` is idempotent and reversible — swap `--from`/`--to` to go
back.

---

## 2. Pick one hosting shape

Three configs are in the repo because three shapes are possible. **Only one
applies**; the others are inert.

### Shape A — split hosting (recommended for your setup)

Static site on GoDaddy cPanel, API on a Node host, both under `qaroo.in`.

- Uses `public/.htaccess` (already correct). `vercel.json` is ignored.
- `api.qaroo.in` and `www.qaroo.in` share a registrable domain, so they are
  **same-site**: cookies work with the default `SameSite=Lax` and you do
  **not** set `COOKIE_SAMESITE`.
- GoDaddy shared hosting runs PHP/Apache well and Node poorly, which is why the
  API goes elsewhere.

### Shape B — single origin

One Node host serves both the API and `dist/`. Set `SERVE_STATIC=true` and point
`qaroo.in` at it. No CORS and no cookie subtleties at all — the simplest and
tightest option if you are willing to move off GoDaddy hosting for the website
(the mailbox can stay).

### Shape C — Vercel frontend

Uses `vercel.json`; delete `public/.htaccess` so it cannot confuse anyone. If
the frontend lands on `*.vercel.app` rather than a `qaroo.in` subdomain it is
**cross-site**, and you must set `COOKIE_SAMESITE=none` or admin login will
appear to succeed and immediately log out. Attaching `www.qaroo.in` to Vercel
avoids this entirely.

The rest of this document assumes **Shape A**.

---

## 3. Backend

### 3.1 Environment

`backend/.env.production` has been generated for you and is gitignored. It
contains a fresh 96-character `JWT_SECRET`, the correct `CLIENT_URL`, and your
existing database and mail settings.

Paste those values into your host's environment settings. Do **not** upload the
file — a host's env store is not in a web root and is not in a backup.

Still blank, and only you can fill them:

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Without Cloudinary, uploaded resumes and CMS images are written to the
container's local disk and **lost on every redeploy**. Job applications are the
one thing on this site you cannot regenerate, so set it before you take real
applications.

### 3.2 Atlas network access

A Node host's outbound IP is not fixed, so `0.0.0.0/0` plus a strong database
password is the normal configuration for Render/Railway. If your host publishes
static egress IPs, allowlist those instead.

Your own IP rotates (`223.185.23.8` → `223.185.23.40` during this work), so
re-add it whenever local tooling stops connecting. Atlas signals a blocked IP as
a **TLS alert 80 / "tlsv1 alert internal error"**, not as an auth failure.

### 3.3 Deploy

Root directory `backend`, build `npm ci`, start `npm start` (not `npm run dev` —
`nodemon` is a dev dependency and carries the only outstanding advisories).

Then add a CNAME `api` → your host, and confirm:

```bash
curl -sS https://api.qaroo.in/api/health
```

### 3.4 Seed, once

```bash
cd backend && NODE_ENV=production npm run seed
```

Safe to run on an empty database. **It is not safe to re-run casually once
admins have edited content** — the seeders differ:

| Seeder | Re-run behaviour |
| --- | --- |
| `seedAdmin` | creates the admin only if absent — safe |
| `seedCSR` | skipped entirely if any project exists — safe |
| `seedMous` | skipped if any MOU exists, only fills missing logos — safe |
| `seedContent` | merges missing keys, leaves existing values — safe |
| `seedCareers` | overwrites every field **except** `status` |
| `seedLearning` | **overwrites the whole record**, discarding admin edits |
| `seedBusiness` | **overwrites the whole record**, discarding admin edits |

So after launch, treat `npm run seed` as a content reset for learning programmes
and business solutions, not a top-up. Edit those through the admin panel, or
change `backend/data/seedData.js` and re-seed deliberately.

**Do not run `seed/clearMOUImages.js`** (destructive, one-off repair) or
`seed/cleanupLegacyLearning.js` (`deleteMany`). Neither is called by
`npm run seed`.

---

## 4. Frontend

`API_BASE` is used as `` `${BASE}/auth/refresh` ``, so the variable must
**include `/api`**. This is the single easiest thing to get wrong:

```bash
# correct
VITE_API_BASE_URL=https://api.qaroo.in/api
# wrong - every request 404s
VITE_API_BASE_URL=https://api.qaroo.in
```

Build and upload:

```bash
VITE_API_BASE_URL=https://api.qaroo.in/api npm run build
```

Upload the **contents** of `dist/` to `public_html/`, including the dotfile
`.htaccess` — SPA deep links such as `/learning-programs/full-stack-development`
return 404 without it. Many FTP clients hide dotfiles by default.

Enable HTTPS and force a redirect in cPanel. The admin cookies are `Secure` in
production, so they are never sent over plain HTTP and the admin panel cannot
log in on an `http://` origin.

---

## 5. After the first deploy

```bash
curl -sI https://www.qaroo.in | head -20                  # 200, HTTPS
curl -sI https://www.qaroo.in/learning-programs | head -5 # 200, not 404 (SPA fallback)
curl -sS https://api.qaroo.in/api/health                  # API reachable
curl -sS https://www.qaroo.in/robots.txt                  # points at the right sitemap
```

Then, in a browser: log in to `/admin`, reload the page (proves the refresh
cookie survives), submit a contact form and a brochure request, and download a
resume from the applications table.

Submit the sitemap at `https://www.qaroo.in/sitemap.xml` to Google Search
Console. Set up SPF and DKIM for `qaroo.in` at GoDaddy — without them,
verification and password-reset mail is usually filtered as spam even though
SMTP authentication succeeds.

---

## 6. Rotate these

Both were typed into a chat transcript during development and should be
considered disclosed:

- the Atlas database user's password (rotate in Atlas, then update
  `MONGODB_URI`)
- the `support@qaroo.in` mailbox password (rotate in GoDaddy, then update
  `EMAIL_PASSWORD`)

`JWT_SECRET` in `.env.production` is freshly generated and was never printed.

---

## 7. Known, accepted

- **New admins are emailed a plaintext password.** `initialPassword` holds it
  until approval, then it is cleared. It is `select: false` and stripped from
  JSON, so it is not exposed over the API, but a set-password link would be the
  correct design. Changing it is a flow redesign, not a patch.
- **`Admin.password` has no `select: false`.** `toJSON` deletes the hash and no
  query uses `.lean()`, so there is no path by which it reaches a response.
  Adding it would make every `admin.save()` on a document loaded without
  `+password` a validation risk across the approve/verify/reset flows.
- **3 dev-only advisories** (`nodemon`, `source-map-js`). Neither ships: the
  production dependency audit is clean on both sides.
- **Equal-height solution cards are not pixel-verified.** The page's WebGL
  carousel does not survive test stubbing; check them by eye.
