ALTER TABLE site_settings ADD COLUMN announcement_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE site_settings ADD COLUMN seo_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE hackathons ADD COLUMN publish_status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE projects ADD COLUMN publish_status TEXT NOT NULL DEFAULT 'published';
