CREATE TABLE IF NOT EXISTS media_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  asset_type TEXT NOT NULL DEFAULT 'image',
  tags_json TEXT NOT NULL DEFAULT '[]',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

ALTER TABLE site_settings ADD COLUMN logo_url TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN favicon_url TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN social_preview_url TEXT NOT NULL DEFAULT '';
