const CONTENT_KEY = "main";

function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function isoNow() {
  return new Date().toISOString();
}

export function ensurePayloadDefaults(payload = {}) {
  const safe = structuredClone(payload || {});
  safe.globalSettings = safe.globalSettings || {};
  safe.siteConfig = safe.siteConfig || {};
  safe.navigation = safe.navigation || {};
  safe.home = safe.home || {};
  safe.about = safe.about || {};
  safe.hackathons = Array.isArray(safe.hackathons) ? safe.hackathons : [];
  safe.eventDetails = safe.eventDetails || {};
  safe.projects = Array.isArray(safe.projects) ? safe.projects : [];
  safe.seo = safe.seo || {};
  safe.mediaLibrary = Array.isArray(safe.mediaLibrary) ? safe.mediaLibrary : [];

  safe.globalSettings.siteName = safe.globalSettings.siteName || "HackVerse Pakistan";
  safe.globalSettings.tagline = safe.globalSettings.tagline || "Build. Compete. Connect.";
  safe.globalSettings.shortDescription =
    safe.globalSettings.shortDescription || "Building a hackathon culture in Pakistan.";
  safe.globalSettings.contactEmail = safe.globalSettings.contactEmail || "";
  safe.globalSettings.footerText =
    safe.globalSettings.footerText || "Building a hackathon culture in Pakistan.";
  safe.globalSettings.copyrightYear =
    safe.globalSettings.copyrightYear || String(new Date().getFullYear());
  safe.globalSettings.logoUrl = safe.globalSettings.logoUrl || "";
  safe.globalSettings.faviconUrl = safe.globalSettings.faviconUrl || "";
  safe.globalSettings.socialPreviewImage =
    safe.globalSettings.socialPreviewImage || "/social-preview.svg";
  safe.globalSettings.announcement = safe.globalSettings.announcement || {
    enabled: false,
    text: "",
    linkUrl: "",
    linkText: "Learn more",
    startAtIso: "",
    endAtIso: "",
  };

  safe.siteConfig.registerUrl = safe.siteConfig.registerUrl || "";
  safe.siteConfig.communityUrl = safe.siteConfig.communityUrl || "";
  safe.siteConfig.ga4MeasurementId = safe.siteConfig.ga4MeasurementId || "";
  safe.siteConfig.socialLinks = Array.isArray(safe.siteConfig.socialLinks)
    ? safe.siteConfig.socialLinks
    : [];

  safe.navigation.items = Array.isArray(safe.navigation.items) ? safe.navigation.items : [];

  safe.home.kicker = safe.home.kicker || "HackVerse Pakistan";
  safe.home.title = safe.home.title || "Building a hackathon culture in Pakistan.";
  safe.home.lead = safe.home.lead || "";
  safe.home.countdownLabel = safe.home.countdownLabel || "Next launch date";
  safe.home.primaryCtaText = safe.home.primaryCtaText || "Register";
  safe.home.primaryCtaUrl = safe.home.primaryCtaUrl || safe.siteConfig.registerUrl || "";
  safe.home.secondaryCtaText = safe.home.secondaryCtaText || "Join Community";
  safe.home.secondaryCtaUrl = safe.home.secondaryCtaUrl || safe.siteConfig.communityUrl || "";
  safe.home.sections =
    Array.isArray(safe.home.sections) && safe.home.sections.length
      ? safe.home.sections
      : [
        { key: "hero", label: "Hero", enabled: true },
        { key: "featuredHackathon", label: "Featured Hackathon", enabled: true },
        { key: "notify", label: "Notify Section", enabled: true },
        { key: "valueCards", label: "Value Cards", enabled: true },
        { key: "projectsTeaser", label: "Projects Teaser", enabled: true },
      ];
  safe.home.valueCards = Array.isArray(safe.home.valueCards) ? safe.home.valueCards : [];

  safe.about.kicker = safe.about.kicker || "About HackVerse";
  safe.about.title = safe.about.title || "";
  safe.about.lead = safe.about.lead || "";
  safe.about.cards = Array.isArray(safe.about.cards) ? safe.about.cards : [];
  safe.siteConfig.socialLinks = safe.siteConfig.socialLinks.map((item) => ({
    ...item,
    isActive: item?.isActive !== false,
  }));
  safe.home.valueCards = safe.home.valueCards.map((item) => ({
    ...item,
    isActive: item?.isActive !== false,
  }));
  safe.about.cards = safe.about.cards.map((item) => ({
    ...item,
    isActive: item?.isActive !== false,
  }));
  safe.hackathons = safe.hackathons.map((item) => ({ ...item, isActive: item?.isActive !== false }));
  safe.projects = safe.projects.map((item) => ({ ...item, isActive: item?.isActive !== false }));
  safe.hackathons = safe.hackathons.map((item) => ({
    ...item,
    publishStatus: item?.publishStatus || "published",
  }));
  safe.projects = safe.projects.map((item) => ({
    ...item,
    publishStatus: item?.publishStatus || "published",
  }));
  safe.seo.global = safe.seo.global || {
    titleSuffix: "HackVerse Pakistan",
    defaultDescription: safe.globalSettings.shortDescription || "",
    defaultOgImage: "/social-preview.svg",
  };
  safe.seo.pages = safe.seo.pages || {};
  safe.seo.hackathonPages = safe.seo.hackathonPages || {};
  safe.mediaLibrary = safe.mediaLibrary.map((asset) => ({
    key: asset?.key || "",
    label: asset?.label || "",
    url: asset?.url || "",
    alt: asset?.alt || "",
    type: asset?.type || "image",
    tags: Array.isArray(asset?.tags) ? asset.tags : [],
    isActive: asset?.isActive !== false,
  }));

  return safe;
}

function timelineToString(item) {
  if (typeof item === "string") return item;
  const title = String(item?.title || "").trim();
  const date = String(item?.eventTime || item?.date || "").trim();
  const description = String(item?.description || "").trim();
  const parts = [title];
  if (date) parts.push(`(${date})`);
  if (description) parts.push(`- ${description}`);
  return parts.join(" ").trim();
}

function criteriaToString(item) {
  if (typeof item === "string") return item;
  const title = String(item?.criterion || item?.title || "").trim();
  const weight = String(item?.weight || "").trim();
  const description = String(item?.description || "").trim();
  const main = weight ? `${title} (${weight}%)` : title;
  return description ? `${main}: ${description}` : main;
}

export async function buildContentFromNormalized(env) {
  let settings;
  let socialLinks;
  let navigationItems;
  let homeCards;
  let homeSections;
  let aboutCards;
  let hackathons;
  let projects;
  let mediaAssets;
  let detailSlugsRows;
  try {
    settings = await env.DB.prepare("SELECT * FROM site_settings WHERE id = 1 LIMIT 1").first();
    socialLinks = await env.DB.prepare(
      "SELECT label, url, is_active FROM social_links ORDER BY display_order ASC, id ASC"
    ).all();
    navigationItems = await env.DB.prepare(
      "SELECT label, href, is_visible FROM navigation_items ORDER BY display_order ASC, id ASC"
    ).all();
    homeCards = await env.DB.prepare(
      "SELECT heading, description, is_enabled FROM site_sections WHERE page_key = 'home' AND section_type = 'value_card' ORDER BY display_order ASC, id ASC"
    ).all();
    homeSections = await env.DB.prepare(
      "SELECT heading, description, is_enabled FROM site_sections WHERE page_key = 'home' AND section_type = 'home_section' ORDER BY display_order ASC, id ASC"
    ).all();
    aboutCards = await env.DB.prepare(
      "SELECT heading, description, is_enabled FROM site_sections WHERE page_key = 'about' AND section_type = 'about_card' ORDER BY display_order ASC, id ASC"
    ).all();
    hackathons = await env.DB.prepare("SELECT * FROM hackathons ORDER BY date_iso ASC, id ASC").all();
    projects = await env.DB.prepare(
      "SELECT * FROM projects ORDER BY display_order ASC, id ASC"
    ).all();
    mediaAssets = await env.DB.prepare(
      "SELECT asset_key, label, url, alt_text, asset_type, tags_json, is_active FROM media_assets ORDER BY display_order ASC, id ASC"
    ).all();
    detailSlugsRows = await env.DB.prepare(
      "SELECT hackathon_slug FROM hackathon_details UNION SELECT slug AS hackathon_slug FROM hackathons"
    ).all();
  } catch {
    return null;
  }

  const hasNormalizedData =
    Boolean(settings) ||
    (socialLinks.results?.length || 0) > 0 ||
    (hackathons.results?.length || 0) > 0 ||
    (projects.results?.length || 0) > 0 ||
    (mediaAssets.results?.length || 0) > 0;
  if (!hasNormalizedData) return null;

  const eventDetails = {};
  for (const row of detailSlugsRows.results || []) {
    const slug = row.hackathon_slug;
    if (!slug) continue;
    const detail = await env.DB.prepare(
      "SELECT overview FROM hackathon_details WHERE hackathon_slug = ?1 LIMIT 1"
    )
      .bind(slug)
      .first();
    const timelineRows = await env.DB.prepare(
      "SELECT title, description, event_time FROM hackathon_timeline_items WHERE hackathon_slug = ?1 AND is_active = 1 ORDER BY display_order ASC, id ASC"
    )
      .bind(slug)
      .all();
    const rulesRows = await env.DB.prepare(
      "SELECT rule_type, content FROM hackathon_rules WHERE hackathon_slug = ?1 AND is_active = 1 ORDER BY display_order ASC, id ASC"
    )
      .bind(slug)
      .all();
    const criteriaRows = await env.DB.prepare(
      "SELECT criterion, weight, description FROM judging_criteria WHERE hackathon_slug = ?1 AND is_active = 1 ORDER BY display_order ASC, id ASC"
    )
      .bind(slug)
      .all();
    const peopleRows = await env.DB.prepare(
      "SELECT person_type, name, role FROM people WHERE hackathon_slug = ?1 AND is_active = 1 ORDER BY display_order ASC, id ASC"
    )
      .bind(slug)
      .all();
    const faqRows = await env.DB.prepare(
      "SELECT question, answer FROM hackathon_faqs WHERE hackathon_slug = ?1 AND is_active = 1 ORDER BY display_order ASC, id ASC"
    )
      .bind(slug)
      .all();

    eventDetails[slug] = {
      overview: detail?.overview || "",
      timeline: (timelineRows.results || []).map((item) =>
        timelineToString({ title: item.title, description: item.description, eventTime: item.event_time })
      ),
      rules: (rulesRows.results || [])
        .filter((item) => item.rule_type === "rule")
        .map((item) => item.content),
      eligibility: (rulesRows.results || [])
        .filter((item) => item.rule_type === "eligibility")
        .map((item) => item.content),
      judgingCriteria: (criteriaRows.results || []).map((item) =>
        criteriaToString({
          criterion: item.criterion,
          weight: item.weight,
          description: item.description,
        })
      ),
      judges: (peopleRows.results || [])
        .filter((item) => item.person_type === "judge")
        .map((item) => ({ name: item.name, role: item.role })),
      mentors: (peopleRows.results || [])
        .filter((item) => item.person_type === "mentor")
        .map((item) => ({ name: item.name, role: item.role })),
      faq: (faqRows.results || []).map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
    };
  }

  return ensurePayloadDefaults({
    globalSettings: {
      siteName: settings?.site_name || "HackVerse Pakistan",
      tagline: settings?.tagline || "Build. Compete. Connect.",
      shortDescription: settings?.short_description || "Building a hackathon culture in Pakistan.",
      contactEmail: settings?.contact_email || "",
      footerText: settings?.footer_text || "Building a hackathon culture in Pakistan.",
      copyrightYear: settings?.copyright_year || String(new Date().getFullYear()),
      logoUrl: settings?.logo_url || "",
      faviconUrl: settings?.favicon_url || "",
      socialPreviewImage: settings?.social_preview_url || "/social-preview.svg",
      announcement: parseJson(settings?.announcement_json, {
        enabled: false,
        text: "",
        linkUrl: "",
        linkText: "Learn more",
        startAtIso: "",
        endAtIso: "",
      }),
    },
    siteConfig: {
      registerUrl: settings?.register_url || "",
      communityUrl: settings?.community_url || "",
      ga4MeasurementId: settings?.ga4_measurement_id || "",
      socialLinks: (socialLinks.results || []).map((item) => ({
        label: item.label,
        url: item.url,
        isActive: item.is_active === 1,
      })),
    },
    navigation: {
      items: (navigationItems.results || []).map((item) => ({
        label: item.label,
        href: item.href,
        visible: item.is_visible === 1,
      })),
    },
    home: {
      kicker: settings?.home_kicker || "HackVerse Pakistan",
      title: settings?.home_title || "",
      lead: settings?.home_lead || "",
      countdownLabel: settings?.home_countdown_label || "Next launch date",
      primaryCtaText: settings?.home_primary_cta_text || "Register",
      primaryCtaUrl: settings?.home_primary_cta_url || settings?.register_url || "",
      secondaryCtaText: settings?.home_secondary_cta_text || "Join Community",
      secondaryCtaUrl: settings?.home_secondary_cta_url || settings?.community_url || "",
      sections:
        (homeSections.results || []).map((item) => ({
          key: item.heading,
          label: item.description || item.heading,
          enabled: item.is_enabled === 1,
        })) || [],
      valueCards: (homeCards.results || []).map((item) => ({
        title: item.heading,
        description: item.description,
        isActive: item.is_enabled === 1,
      })),
    },
    about: {
      kicker: settings?.about_kicker || "About HackVerse",
      title: settings?.about_title || "",
      lead: settings?.about_lead || "",
      cards: (aboutCards.results || []).map((item) => ({
        title: item.heading,
        description: item.description,
        isActive: item.is_enabled === 1,
      })),
    },
    hackathons: (hackathons.results || []).map((item) => ({
      id: item.id,
      slug: item.slug,
      shortName: item.short_name,
      name: item.name,
      status: item.status,
      publishStatus: item.publish_status || "published",
      dateIso: item.date_iso,
      dateDisplay: item.date_display,
      duration: item.duration,
      prizePool: item.prize_pool,
      entryFee: item.entry_fee,
      teamSize: item.team_size,
      theme: item.theme,
      location: item.location,
      registrationUrl: item.registration_url,
      communityUrl: item.community_url,
      isActive: item.is_active === 1,
    })),
    eventDetails,
    projects: (projects.results || []).map((item) => ({
      name: item.name,
      description: item.description,
      hackathonId: item.hackathon_id,
      team: item.team_name,
      members: parseJson(item.team_members_json, []),
      techStack: parseJson(item.tech_stack_json, []),
      githubUrl: item.github_url || "",
      demoUrl: item.demo_url || "",
      award: item.awards_label || "",
      publishStatus: item.publish_status || "published",
      isActive: item.is_active === 1,
    })),
    mediaLibrary: (mediaAssets.results || []).map((asset) => ({
      key: asset.asset_key,
      label: asset.label,
      url: asset.url,
      alt: asset.alt_text || "",
      type: asset.asset_type || "image",
      tags: parseJson(asset.tags_json, []),
      isActive: asset.is_active === 1,
    })),
    seo: parseJson(settings?.seo_json, {}),
  });
}

async function replaceTable(env, tableName) {
  await env.DB.prepare(`DELETE FROM ${tableName}`).run();
}

export async function saveNormalizedContent(env, payload) {
  const safe = ensurePayloadDefaults(payload);
  const now = isoNow();

  await env.DB.prepare(
    "INSERT INTO site_settings (id, site_name, tagline, short_description, contact_email, footer_text, copyright_year, register_url, community_url, ga4_measurement_id, home_kicker, home_title, home_lead, home_countdown_label, home_primary_cta_text, home_primary_cta_url, home_secondary_cta_text, home_secondary_cta_url, about_kicker, about_title, about_lead, logo_url, favicon_url, social_preview_url, announcement_json, seo_json, updated_at) VALUES (1, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26) ON CONFLICT(id) DO UPDATE SET site_name=excluded.site_name, tagline=excluded.tagline, short_description=excluded.short_description, contact_email=excluded.contact_email, footer_text=excluded.footer_text, copyright_year=excluded.copyright_year, register_url=excluded.register_url, community_url=excluded.community_url, ga4_measurement_id=excluded.ga4_measurement_id, home_kicker=excluded.home_kicker, home_title=excluded.home_title, home_lead=excluded.home_lead, home_countdown_label=excluded.home_countdown_label, home_primary_cta_text=excluded.home_primary_cta_text, home_primary_cta_url=excluded.home_primary_cta_url, home_secondary_cta_text=excluded.home_secondary_cta_text, home_secondary_cta_url=excluded.home_secondary_cta_url, about_kicker=excluded.about_kicker, about_title=excluded.about_title, about_lead=excluded.about_lead, logo_url=excluded.logo_url, favicon_url=excluded.favicon_url, social_preview_url=excluded.social_preview_url, announcement_json=excluded.announcement_json, seo_json=excluded.seo_json, updated_at=excluded.updated_at"
  )
    .bind(
      safe.globalSettings.siteName,
      safe.globalSettings.tagline,
      safe.globalSettings.shortDescription,
      safe.globalSettings.contactEmail,
      safe.globalSettings.footerText,
      safe.globalSettings.copyrightYear,
      safe.siteConfig.registerUrl,
      safe.siteConfig.communityUrl,
      safe.siteConfig.ga4MeasurementId,
      safe.home.kicker,
      safe.home.title,
      safe.home.lead,
      safe.home.countdownLabel,
      safe.home.primaryCtaText,
      safe.home.primaryCtaUrl,
      safe.home.secondaryCtaText,
      safe.home.secondaryCtaUrl,
      safe.about.kicker,
      safe.about.title,
      safe.about.lead,
      safe.globalSettings.logoUrl || "",
      safe.globalSettings.faviconUrl || "",
      safe.globalSettings.socialPreviewImage || "",
      JSON.stringify(safe.globalSettings.announcement || {}),
      JSON.stringify(safe.seo || {}),
      now
    )
    .run();

  await replaceTable(env, "social_links");
  for (let i = 0; i < safe.siteConfig.socialLinks.length; i += 1) {
    const link = safe.siteConfig.socialLinks[i];
    await env.DB.prepare(
      "INSERT INTO social_links (label, url, display_order, is_active, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)"
    )
      .bind(link.label || "", link.url || "", i, link.isActive === false ? 0 : 1, now)
      .run();
  }

  await replaceTable(env, "media_assets");
  for (let i = 0; i < safe.mediaLibrary.length; i += 1) {
    const asset = safe.mediaLibrary[i];
    await env.DB.prepare(
      "INSERT INTO media_assets (asset_key, label, url, alt_text, asset_type, tags_json, display_order, is_active, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)"
    )
      .bind(
        asset.key || `asset-${i + 1}`,
        asset.label || "",
        asset.url || "",
        asset.alt || "",
        asset.type || "image",
        JSON.stringify(Array.isArray(asset.tags) ? asset.tags : []),
        i,
        asset.isActive === false ? 0 : 1,
        now
      )
      .run();
  }

  await replaceTable(env, "navigation_items");
  for (let i = 0; i < safe.navigation.items.length; i += 1) {
    const item = safe.navigation.items[i];
    await env.DB.prepare(
      "INSERT INTO navigation_items (label, href, display_order, is_visible, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)"
    )
      .bind(item.label || "", item.href || "/", i, item.visible === false ? 0 : 1, now)
      .run();
  }

  await replaceTable(env, "site_sections");
  for (let i = 0; i < safe.home.valueCards.length; i += 1) {
    const card = safe.home.valueCards[i];
    await env.DB.prepare(
      "INSERT INTO site_sections (page_key, section_type, heading, description, display_order, is_enabled, updated_at) VALUES ('home', 'value_card', ?1, ?2, ?3, ?4, ?5)"
    )
      .bind(card.title || "", card.description || "", i, card.isActive === false ? 0 : 1, now)
      .run();
  }
  for (let i = 0; i < safe.home.sections.length; i += 1) {
    const section = safe.home.sections[i];
    await env.DB.prepare(
      "INSERT INTO site_sections (page_key, section_type, heading, description, display_order, is_enabled, updated_at) VALUES ('home', 'home_section', ?1, ?2, ?3, ?4, ?5)"
    )
      .bind(
        section.key || "",
        section.label || section.key || "",
        i,
        section.enabled === false ? 0 : 1,
        now
      )
      .run();
  }
  for (let i = 0; i < safe.about.cards.length; i += 1) {
    const card = safe.about.cards[i];
    await env.DB.prepare(
      "INSERT INTO site_sections (page_key, section_type, heading, description, display_order, is_enabled, updated_at) VALUES ('about', 'about_card', ?1, ?2, ?3, ?4, ?5)"
    )
      .bind(card.title || "", card.description || "", i, card.isActive === false ? 0 : 1, now)
      .run();
  }

  await replaceTable(env, "hackathons");
  for (const item of safe.hackathons) {
    await env.DB.prepare(
      "INSERT INTO hackathons (id, slug, short_name, name, status, publish_status, date_iso, date_display, duration, prize_pool, entry_fee, team_size, theme, location, registration_url, community_url, is_active, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18)"
    )
      .bind(
        item.id || `hackathon-${item.slug || "new"}`,
        item.slug || "",
        item.shortName || "",
        item.name || "",
        item.status || "coming_soon",
        item.publishStatus || "published",
        item.dateIso || "",
        item.dateDisplay || "",
        item.duration || "",
        item.prizePool || "",
        item.entryFee || "",
        item.teamSize || "",
        item.theme || "",
        item.location || "",
        item.registrationUrl || "",
        item.communityUrl || "",
        item.isActive === false ? 0 : 1,
        now
      )
      .run();
  }

  await replaceTable(env, "hackathon_details");
  await replaceTable(env, "hackathon_timeline_items");
  await replaceTable(env, "hackathon_rules");
  await replaceTable(env, "judging_criteria");
  await replaceTable(env, "people");
  await replaceTable(env, "hackathon_faqs");
  for (const [slug, details] of Object.entries(safe.eventDetails || {})) {
    await env.DB.prepare(
      "INSERT INTO hackathon_details (hackathon_slug, overview, updated_at) VALUES (?1, ?2, ?3)"
    )
      .bind(slug, details.overview || "", now)
      .run();

    const timeline = Array.isArray(details.timeline) ? details.timeline : [];
    for (let i = 0; i < timeline.length; i += 1) {
      const raw = timeline[i];
      const title = typeof raw === "string" ? raw : raw?.title || "";
      const description = typeof raw === "string" ? "" : raw?.description || "";
      const eventTime = typeof raw === "string" ? "" : raw?.eventTime || raw?.date || "";
      const linkUrl = typeof raw === "string" ? "" : raw?.linkUrl || "";
      await env.DB.prepare(
        "INSERT INTO hackathon_timeline_items (hackathon_slug, title, description, event_time, link_url, display_order, is_active, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 1, ?7)"
      )
        .bind(slug, title, description, eventTime, linkUrl, i, now)
        .run();
    }

    const rules = Array.isArray(details.rules) ? details.rules : [];
    for (let i = 0; i < rules.length; i += 1) {
      await env.DB.prepare(
        "INSERT INTO hackathon_rules (hackathon_slug, rule_type, content, display_order, is_active, updated_at) VALUES (?1, 'rule', ?2, ?3, 1, ?4)"
      )
        .bind(slug, String(rules[i] || ""), i, now)
        .run();
    }

    const eligibility = Array.isArray(details.eligibility) ? details.eligibility : [];
    for (let i = 0; i < eligibility.length; i += 1) {
      await env.DB.prepare(
        "INSERT INTO hackathon_rules (hackathon_slug, rule_type, content, display_order, is_active, updated_at) VALUES (?1, 'eligibility', ?2, ?3, 1, ?4)"
      )
        .bind(slug, String(eligibility[i] || ""), i, now)
        .run();
    }

    const criteria = Array.isArray(details.judgingCriteria) ? details.judgingCriteria : [];
    for (let i = 0; i < criteria.length; i += 1) {
      const raw = criteria[i];
      const criterion = typeof raw === "string" ? raw : raw?.criterion || raw?.title || "";
      const weight = typeof raw === "string" ? null : Number(raw?.weight || 0);
      const description = typeof raw === "string" ? "" : raw?.description || "";
      await env.DB.prepare(
        "INSERT INTO judging_criteria (hackathon_slug, criterion, weight, description, display_order, is_active, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, 1, ?6)"
      )
        .bind(slug, criterion, weight, description, i, now)
        .run();
    }

    const judges = Array.isArray(details.judges) ? details.judges : [];
    for (let i = 0; i < judges.length; i += 1) {
      const person = judges[i] || {};
      await env.DB.prepare(
        "INSERT INTO people (hackathon_slug, person_type, name, role, display_order, is_active, updated_at) VALUES (?1, 'judge', ?2, ?3, ?4, 1, ?5)"
      )
        .bind(slug, person.name || "", person.role || "", i, now)
        .run();
    }

    const mentors = Array.isArray(details.mentors) ? details.mentors : [];
    for (let i = 0; i < mentors.length; i += 1) {
      const person = mentors[i] || {};
      await env.DB.prepare(
        "INSERT INTO people (hackathon_slug, person_type, name, role, display_order, is_active, updated_at) VALUES (?1, 'mentor', ?2, ?3, ?4, 1, ?5)"
      )
        .bind(slug, person.name || "", person.role || "", i, now)
        .run();
    }

    const faq = Array.isArray(details.faq) ? details.faq : [];
    for (let i = 0; i < faq.length; i += 1) {
      const item = faq[i] || {};
      await env.DB.prepare(
        "INSERT INTO hackathon_faqs (hackathon_slug, question, answer, display_order, is_active, updated_at) VALUES (?1, ?2, ?3, ?4, 1, ?5)"
      )
        .bind(slug, item.question || "", item.answer || "", i, now)
        .run();
    }
  }

  await replaceTable(env, "projects");
  for (let i = 0; i < safe.projects.length; i += 1) {
    const project = safe.projects[i];
    await env.DB.prepare(
      "INSERT INTO projects (name, description, thumbnail_url, demo_url, github_url, video_url, tech_stack_json, hackathon_id, team_name, team_members_json, winner_position, awards_label, publish_status, is_featured, display_order, is_active, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)"
    )
      .bind(
        project.name || "",
        project.description || "",
        project.thumbnailUrl || "",
        project.demoUrl || "",
        project.githubUrl || "",
        project.videoUrl || "",
        JSON.stringify(Array.isArray(project.techStack) ? project.techStack : []),
        project.hackathonId || "",
        project.team || "",
        JSON.stringify(Array.isArray(project.members) ? project.members : []),
        project.winnerPosition || "",
        project.award || "",
        project.publishStatus || "published",
        project.featured ? 1 : 0,
        i,
        project.isActive === false ? 0 : 1,
        now
      )
      .run();
  }

  await env.DB.prepare(
    "INSERT INTO site_content (content_key, content, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(content_key) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at"
  )
    .bind(CONTENT_KEY, JSON.stringify(safe), now)
    .run();

  return { content: safe, updatedAt: now };
}

export async function saveLegacyContent(env, payload) {
  const safe = ensurePayloadDefaults(payload);
  const now = isoNow();
  await env.DB.prepare(
    "INSERT INTO site_content (content_key, content, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(content_key) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at"
  )
    .bind(CONTENT_KEY, JSON.stringify(safe), now)
    .run();
  return { content: safe, updatedAt: now };
}

export async function loadLegacyContent(env) {
  const row = await env.DB.prepare(
    "SELECT content, updated_at FROM site_content WHERE content_key = ?1 LIMIT 1"
  )
    .bind(CONTENT_KEY)
    .first();
  if (!row) return null;
  return {
    content: ensurePayloadDefaults(parseJson(row.content, {})),
    updatedAt: row.updated_at,
  };
}
