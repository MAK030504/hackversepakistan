# HackVerse Pakistan - Phase 1 Website

Static multi-page website deployed on Cloudflare Pages, with Cloudflare Pages Functions and D1 for:
- `/api/notify` subscriber signups (email + WhatsApp)
- `/api/content` public dynamic website content
- `/api/admin/content` admin content updates

## 1) Install dependencies

```bash
npm install
```

## 2) Login to Cloudflare

```bash
npm run cf:login
```

## 3) Create D1 database

```bash
npm run db:create
```

Copy the returned `database_id` and paste it into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "hackversepakistan"
database_id = "YOUR_DATABASE_ID_HERE"
```

## 4) Apply migrations

```bash
npm run db:migrate:remote
```

This applies:
- `0001_create_subscribers.sql`
- `0002_create_site_content.sql`
- `0003_create_normalized_cms_tables.sql`
- `0004_add_phaseb2_cms_fields.sql`
- `0005_add_media_library.sql`

## 4.1) Configure admin token secret

Set a secret used by the admin API and admin page:

```bash
wrangler secret put ADMIN_TOKEN
```

Use the same value in `/admin/` when editing content.

## 5) Run local preview with Cloudflare runtime

```bash
npm run dev
```

Then open:
- `/` public site
- `/admin/` content management panel

## 6) Deploy

```bash
npm run deploy
```

## 7) Connect Cloudflare domain

In Cloudflare dashboard:
- Add your custom domain to the Pages project.
- Set DNS records Cloudflare suggests (usually `CNAME` for `www` and apex mapping).
- Keep SSL/TLS enabled (Full/Strict recommended once origin cert is valid).

## 8) Enable auto-deploy from GitHub

This repo includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` that deploys on every push to `main`.

Add these repository secrets in GitHub:
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Pages and D1 permissions
- `CLOUDFLARE_ACCOUNT_ID` - your Cloudflare account id

Then push to `main` and the deploy runs automatically.

## Content editing workflow

1. Open `/admin/`
2. Enter `ADMIN_TOKEN`
3. Load content (DB or fallback file)
4. Edit JSON and save
5. Public pages immediately read from `/api/content` (fallback is `data/site-content.json` if DB has no content yet)

## Phase B CMS APIs

Normalized CMS-backed endpoints are now available:
- Public: `/api/content` (returns assembled payload from normalized tables, falls back to legacy content)
- Admin (full compatibility): `/api/admin/content`
- Admin (modular): `/api/admin/settings`, `/api/admin/hackathons`, `/api/admin/projects`
- Admin (media): `/api/admin/media`
