CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  site_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  short_description TEXT NOT NULL,
  contact_email TEXT NOT NULL DEFAULT '',
  footer_text TEXT NOT NULL,
  copyright_year TEXT NOT NULL,
  register_url TEXT NOT NULL DEFAULT '',
  community_url TEXT NOT NULL DEFAULT '',
  ga4_measurement_id TEXT NOT NULL DEFAULT '',
  home_kicker TEXT NOT NULL DEFAULT '',
  home_title TEXT NOT NULL DEFAULT '',
  home_lead TEXT NOT NULL DEFAULT '',
  home_countdown_label TEXT NOT NULL DEFAULT '',
  home_primary_cta_text TEXT NOT NULL DEFAULT '',
  home_primary_cta_url TEXT NOT NULL DEFAULT '',
  home_secondary_cta_text TEXT NOT NULL DEFAULT '',
  home_secondary_cta_url TEXT NOT NULL DEFAULT '',
  about_kicker TEXT NOT NULL DEFAULT '',
  about_title TEXT NOT NULL DEFAULT '',
  about_lead TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS social_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS navigation_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_key TEXT NOT NULL,
  section_type TEXT NOT NULL,
  heading TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hackathons (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  short_name TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  date_iso TEXT NOT NULL DEFAULT '',
  date_display TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  prize_pool TEXT NOT NULL DEFAULT '',
  entry_fee TEXT NOT NULL DEFAULT '',
  team_size TEXT NOT NULL DEFAULT '',
  theme TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  registration_url TEXT NOT NULL DEFAULT '',
  community_url TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hackathon_details (
  hackathon_slug TEXT PRIMARY KEY,
  overview TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hackathon_timeline_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hackathon_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  event_time TEXT NOT NULL DEFAULT '',
  link_url TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hackathon_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hackathon_slug TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  content TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS judging_criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hackathon_slug TEXT NOT NULL,
  criterion TEXT NOT NULL,
  weight INTEGER,
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hackathon_slug TEXT NOT NULL,
  person_type TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hackathon_faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hackathon_slug TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT NOT NULL DEFAULT '',
  demo_url TEXT NOT NULL DEFAULT '',
  github_url TEXT NOT NULL DEFAULT '',
  video_url TEXT NOT NULL DEFAULT '',
  tech_stack_json TEXT NOT NULL DEFAULT '[]',
  hackathon_id TEXT NOT NULL DEFAULT '',
  team_name TEXT NOT NULL DEFAULT '',
  team_members_json TEXT NOT NULL DEFAULT '[]',
  winner_position TEXT NOT NULL DEFAULT '',
  awards_label TEXT NOT NULL DEFAULT '',
  is_featured INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);
