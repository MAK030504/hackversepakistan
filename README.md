# HackVerse Pakistan - Coming Soon

Static coming-soon page deployed on Cloudflare Pages, with a Cloudflare Pages Function (`/api/notify`) storing signups (email + WhatsApp) in Cloudflare D1.

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

## 5) Run local preview with Cloudflare runtime

```bash
npm run dev
```

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
