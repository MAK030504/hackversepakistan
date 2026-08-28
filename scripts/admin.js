const statusEl = document.getElementById("adminStatus");
const tokenInput = document.getElementById("adminToken");
const contentInput = document.getElementById("contentJson");
const loadBtn = document.getElementById("loadContentBtn");
const saveBtn = document.getElementById("saveContentBtn");
const resetBtn = document.getElementById("resetFallbackBtn");
const refreshJsonBtn = document.getElementById("refreshJsonBtn");
const applyJsonBtn = document.getElementById("applyJsonBtn");
const eventDetailsSlugSelect = document.getElementById("eventDetailsSlug");
const saveSettingsSectionBtn = document.getElementById("saveSettingsSectionBtn");
const saveHackathonsSectionBtn = document.getElementById("saveHackathonsSectionBtn");
const saveProjectsSectionBtn = document.getElementById("saveProjectsSectionBtn");
const saveSeoSectionBtn = document.getElementById("saveSeoSectionBtn");
const saveMediaSectionBtn = document.getElementById("saveMediaSectionBtn");
const seoPageKeySelect = document.getElementById("seoPageKey");
const seoHackathonUseCurrent = document.getElementById("seoHackathonUseCurrent");

let contentState = null;

function setStatus(message, type = "") {
  if (!statusEl) return;
  statusEl.className = `notify-message ${type}`.trim();
  statusEl.textContent = message;
}

function tokenValue() {
  return tokenInput?.value.trim() || localStorage.getItem("hackverse_admin_token") || "";
}

function storeToken() {
  if (!tokenInput) return;
  const value = tokenInput.value.trim();
  if (!value) return;
  localStorage.setItem("hackverse_admin_token", value);
}

function byId(id) {
  return document.getElementById(id);
}

function setValue(id, value) {
  const element = byId(id);
  if (element) element.value = value ?? "";
}

function getInputValue(id) {
  return byId(id)?.value?.trim() || "";
}

function splitLines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function htmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function ensureContentDefaults(content = {}) {
  const safe = structuredClone(content || {});
  safe.globalSettings = safe.globalSettings || {};
  safe.siteConfig = safe.siteConfig || {};
  safe.navigation = safe.navigation || {};
  safe.home = safe.home || {};
  safe.about = safe.about || {};
  safe.hackathons = Array.isArray(safe.hackathons) ? safe.hackathons : [];
  safe.projects = Array.isArray(safe.projects) ? safe.projects : [];
  safe.eventDetails = safe.eventDetails || {};
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
  safe.siteConfig.socialLinks = safe.siteConfig.socialLinks.map((item) => ({
    ...item,
    isActive: item?.isActive !== false,
  }));

  safe.navigation.items = Array.isArray(safe.navigation.items)
    ? safe.navigation.items
    : [
        { label: "Home", href: "/", visible: true },
        { label: "Hackathons", href: "/hackathons/", visible: true },
        { label: "Projects", href: "/projects/", visible: true },
        { label: "About", href: "/about/", visible: true },
        { label: "Admin", href: "/admin/", visible: true },
      ];

  safe.home.sections = Array.isArray(safe.home.sections)
    ? safe.home.sections
    : [
        { key: "hero", label: "Hero", enabled: true },
        { key: "featuredHackathon", label: "Featured Hackathon", enabled: true },
        { key: "notify", label: "Notify Section", enabled: true },
        { key: "valueCards", label: "Value Cards", enabled: true },
        { key: "projectsTeaser", label: "Projects Teaser", enabled: true },
      ];
  safe.home.valueCards = Array.isArray(safe.home.valueCards) ? safe.home.valueCards : [];
  safe.home.valueCards = safe.home.valueCards.map((item) => ({ ...item, isActive: item?.isActive !== false }));
  safe.home.primaryCtaText = safe.home.primaryCtaText || "Register";
  safe.home.primaryCtaUrl = safe.home.primaryCtaUrl || safe.siteConfig.registerUrl;
  safe.home.secondaryCtaText = safe.home.secondaryCtaText || "Join the Community";
  safe.home.secondaryCtaUrl = safe.home.secondaryCtaUrl || safe.siteConfig.communityUrl;

  safe.about.cards = Array.isArray(safe.about.cards) ? safe.about.cards : [];
  safe.about.cards = safe.about.cards.map((item) => ({ ...item, isActive: item?.isActive !== false }));

  safe.hackathons = safe.hackathons.map((item) => ({
    ...item,
    isActive: item?.isActive !== false,
    publishStatus: item?.publishStatus || "published",
  }));
  safe.projects = safe.projects.map((item) => ({
    ...item,
    isActive: item?.isActive !== false,
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

function renderList(containerId, items, templateFn) {
  const container = byId(containerId);
  if (!container) return;
  container.innerHTML = items.map((item, index) => templateFn(item, index)).join("");
}

function toolbarTemplate(listName, index, removeLabel = "Remove") {
  return `<div class="admin-item-toolbar">
    <button class="btn btn-secondary" data-move-list="${listName}" data-direction="up" data-index="${index}" type="button">Up</button>
    <button class="btn btn-secondary" data-move-list="${listName}" data-direction="down" data-index="${index}" type="button">Down</button>
    <button class="btn btn-danger" data-remove-list="${listName}" data-index="${index}" type="button">${removeLabel}</button>
  </div>`;
}

function renderSimpleFields(content) {
  setValue("siteName", content.globalSettings.siteName);
  setValue("siteTagline", content.globalSettings.tagline);
  setValue("siteShortDescription", content.globalSettings.shortDescription);
  setValue("contactEmail", content.globalSettings.contactEmail);
  setValue("registerUrl", content.siteConfig.registerUrl);
  setValue("communityUrl", content.siteConfig.communityUrl);
  setValue("ga4MeasurementId", content.siteConfig.ga4MeasurementId);
  setValue("footerText", content.globalSettings.footerText);
  setValue("logoUrl", content.globalSettings.logoUrl || "");
  setValue("faviconUrl", content.globalSettings.faviconUrl || "");
  setValue("socialPreviewImage", content.globalSettings.socialPreviewImage || "");

  setValue("announcementEnabled", content.globalSettings.announcement.enabled ? "true" : "false");
  setValue("announcementText", content.globalSettings.announcement.text || "");
  setValue("announcementLinkUrl", content.globalSettings.announcement.linkUrl || "");
  setValue("announcementLinkText", content.globalSettings.announcement.linkText || "");
  setValue("announcementStartAt", content.globalSettings.announcement.startAtIso || "");
  setValue("announcementEndAt", content.globalSettings.announcement.endAtIso || "");

  setValue("homeKicker", content.home.kicker || "");
  setValue("homeTitle", content.home.title || "");
  setValue("homeLead", content.home.lead || "");
  setValue("homeCountdownLabel", content.home.countdownLabel || "");
  setValue("homePrimaryCtaText", content.home.primaryCtaText || "");
  setValue("homePrimaryCtaUrl", content.home.primaryCtaUrl || "");
  setValue("homeSecondaryCtaText", content.home.secondaryCtaText || "");
  setValue("homeSecondaryCtaUrl", content.home.secondaryCtaUrl || "");

  setValue("aboutKicker", content.about.kicker || "");
  setValue("aboutTitle", content.about.title || "");
  setValue("aboutLead", content.about.lead || "");
}

function renderRepeaters(content) {
  renderList("socialLinksList", content.siteConfig.socialLinks, (item, index) => `
    <div class="admin-list-item">
      <div class="admin-grid">
        <div><label>Label</label><input data-list="social" data-index="${index}" data-field="label" type="text" value="${htmlEscape(item.label)}" /></div>
        <div><label>URL</label><input data-list="social" data-index="${index}" data-field="url" type="text" value="${htmlEscape(item.url)}" /></div>
        <div><label>Visible</label><select data-list="social" data-index="${index}" data-field="isActive"><option value="true" ${item.isActive !== false ? "selected" : ""}>Yes</option><option value="false" ${item.isActive === false ? "selected" : ""}>No</option></select></div>
      </div>
      ${toolbarTemplate("social", index)}
    </div>
  `);

  renderList("navigationList", content.navigation.items, (item, index) => `
    <div class="admin-list-item">
      <div class="admin-grid">
        <div><label>Label</label><input data-list="nav" data-index="${index}" data-field="label" type="text" value="${htmlEscape(item.label)}" /></div>
        <div><label>Href</label><input data-list="nav" data-index="${index}" data-field="href" type="text" value="${htmlEscape(item.href)}" /></div>
        <div><label>Visible</label><select data-list="nav" data-index="${index}" data-field="visible"><option value="true" ${item.visible !== false ? "selected" : ""}>Yes</option><option value="false" ${item.visible === false ? "selected" : ""}>No</option></select></div>
      </div>
      ${toolbarTemplate("nav", index)}
    </div>
  `);

  renderList("mediaLibraryList", content.mediaLibrary, (item, index) => `
    <div class="admin-list-item">
      <div class="admin-grid">
        <div><label>Asset Key</label><input data-list="media" data-index="${index}" data-field="key" type="text" value="${htmlEscape(item.key)}" /></div>
        <div><label>Label</label><input data-list="media" data-index="${index}" data-field="label" type="text" value="${htmlEscape(item.label)}" /></div>
        <div><label>Type</label><input data-list="media" data-index="${index}" data-field="type" type="text" value="${htmlEscape(item.type)}" /></div>
        <div><label>Visible</label><select data-list="media" data-index="${index}" data-field="isActive"><option value="true" ${item.isActive !== false ? "selected" : ""}>Yes</option><option value="false" ${item.isActive === false ? "selected" : ""}>No</option></select></div>
        <div class="admin-col-span-2"><label>URL</label><input data-list="media" data-index="${index}" data-field="url" type="text" value="${htmlEscape(item.url)}" /></div>
        <div class="admin-col-span-2"><label>Alt Text</label><input data-list="media" data-index="${index}" data-field="alt" type="text" value="${htmlEscape(item.alt)}" /></div>
        <div class="admin-col-span-2"><label>Tags (comma separated)</label><input data-list="media" data-index="${index}" data-field="tags" type="text" value="${htmlEscape((item.tags || []).join(", "))}" /></div>
      </div>
      ${toolbarTemplate("media", index, "Remove Asset")}
    </div>
  `);

  renderList("homeCardsList", content.home.valueCards, (item, index) => `
    <div class="admin-list-item">
      <div class="admin-grid">
        <div><label>Title</label><input data-list="homeCards" data-index="${index}" data-field="title" type="text" value="${htmlEscape(item.title)}" /></div>
        <div><label>Description</label><input data-list="homeCards" data-index="${index}" data-field="description" type="text" value="${htmlEscape(item.description)}" /></div>
        <div><label>Visible</label><select data-list="homeCards" data-index="${index}" data-field="isActive"><option value="true" ${item.isActive !== false ? "selected" : ""}>Yes</option><option value="false" ${item.isActive === false ? "selected" : ""}>No</option></select></div>
      </div>
      ${toolbarTemplate("homeCards", index)}
    </div>
  `);

  renderList("homeSectionsList", content.home.sections, (item, index) => `
    <div class="admin-list-item">
      <div class="admin-grid">
        <div><label>Key</label><input data-list="homeSections" data-index="${index}" data-field="key" type="text" value="${htmlEscape(item.key)}" /></div>
        <div><label>Label</label><input data-list="homeSections" data-index="${index}" data-field="label" type="text" value="${htmlEscape(item.label)}" /></div>
        <div><label>Enabled</label><select data-list="homeSections" data-index="${index}" data-field="enabled"><option value="true" ${item.enabled !== false ? "selected" : ""}>Yes</option><option value="false" ${item.enabled === false ? "selected" : ""}>No</option></select></div>
      </div>
      ${toolbarTemplate("homeSections", index)}
    </div>
  `);

  renderList("aboutCardsList", content.about.cards, (item, index) => `
    <div class="admin-list-item">
      <div class="admin-grid">
        <div><label>Title</label><input data-list="aboutCards" data-index="${index}" data-field="title" type="text" value="${htmlEscape(item.title)}" /></div>
        <div><label>Description</label><input data-list="aboutCards" data-index="${index}" data-field="description" type="text" value="${htmlEscape(item.description)}" /></div>
        <div><label>Visible</label><select data-list="aboutCards" data-index="${index}" data-field="isActive"><option value="true" ${item.isActive !== false ? "selected" : ""}>Yes</option><option value="false" ${item.isActive === false ? "selected" : ""}>No</option></select></div>
      </div>
      ${toolbarTemplate("aboutCards", index)}
    </div>
  `);

  renderList("hackathonsList", content.hackathons, (item, index) => `
    <div class="admin-list-item">
      <h4>Hackathon ${index + 1}</h4>
      <div class="admin-grid">
        <div><label>ID</label><input data-list="hackathons" data-index="${index}" data-field="id" type="text" value="${htmlEscape(item.id)}" /></div>
        <div><label>Slug</label><input data-list="hackathons" data-index="${index}" data-field="slug" type="text" value="${htmlEscape(item.slug)}" /></div>
        <div><label>Short Name</label><input data-list="hackathons" data-index="${index}" data-field="shortName" type="text" value="${htmlEscape(item.shortName)}" /></div>
        <div><label>Name</label><input data-list="hackathons" data-index="${index}" data-field="name" type="text" value="${htmlEscape(item.name)}" /></div>
        <div><label>Status</label><input data-list="hackathons" data-index="${index}" data-field="status" type="text" value="${htmlEscape(item.status)}" /></div>
        <div><label>Publish Status</label><select data-list="hackathons" data-index="${index}" data-field="publishStatus"><option value="draft" ${item.publishStatus === "draft" ? "selected" : ""}>Draft</option><option value="published" ${item.publishStatus !== "draft" ? "selected" : ""}>Published</option><option value="archived" ${item.publishStatus === "archived" ? "selected" : ""}>Archived</option></select></div>
        <div><label>Visible</label><select data-list="hackathons" data-index="${index}" data-field="isActive"><option value="true" ${item.isActive !== false ? "selected" : ""}>Yes</option><option value="false" ${item.isActive === false ? "selected" : ""}>No</option></select></div>
        <div><label>Date ISO</label><input data-list="hackathons" data-index="${index}" data-field="dateIso" type="text" value="${htmlEscape(item.dateIso)}" /></div>
        <div><label>Date Display</label><input data-list="hackathons" data-index="${index}" data-field="dateDisplay" type="text" value="${htmlEscape(item.dateDisplay)}" /></div>
        <div><label>Duration</label><input data-list="hackathons" data-index="${index}" data-field="duration" type="text" value="${htmlEscape(item.duration)}" /></div>
        <div><label>Prize Pool</label><input data-list="hackathons" data-index="${index}" data-field="prizePool" type="text" value="${htmlEscape(item.prizePool)}" /></div>
        <div><label>Entry Fee</label><input data-list="hackathons" data-index="${index}" data-field="entryFee" type="text" value="${htmlEscape(item.entryFee)}" /></div>
        <div><label>Team Size</label><input data-list="hackathons" data-index="${index}" data-field="teamSize" type="text" value="${htmlEscape(item.teamSize)}" /></div>
        <div><label>Location</label><input data-list="hackathons" data-index="${index}" data-field="location" type="text" value="${htmlEscape(item.location)}" /></div>
        <div class="admin-col-span-2"><label>Theme</label><input data-list="hackathons" data-index="${index}" data-field="theme" type="text" value="${htmlEscape(item.theme)}" /></div>
        <div><label>Registration URL</label><input data-list="hackathons" data-index="${index}" data-field="registrationUrl" type="text" value="${htmlEscape(item.registrationUrl)}" /></div>
        <div><label>Community URL</label><input data-list="hackathons" data-index="${index}" data-field="communityUrl" type="text" value="${htmlEscape(item.communityUrl)}" /></div>
      </div>
      ${toolbarTemplate("hackathons", index, "Remove Hackathon")}
    </div>
  `);

  renderList("projectsList", content.projects, (item, index) => `
    <div class="admin-list-item">
      <h4>Project ${index + 1}</h4>
      <div class="admin-grid">
        <div><label>Name</label><input data-list="projects" data-index="${index}" data-field="name" type="text" value="${htmlEscape(item.name)}" /></div>
        <div><label>Hackathon ID</label><input data-list="projects" data-index="${index}" data-field="hackathonId" type="text" value="${htmlEscape(item.hackathonId)}" /></div>
        <div><label>Team</label><input data-list="projects" data-index="${index}" data-field="team" type="text" value="${htmlEscape(item.team)}" /></div>
        <div><label>Award</label><input data-list="projects" data-index="${index}" data-field="award" type="text" value="${htmlEscape(item.award)}" /></div>
        <div><label>Publish Status</label><select data-list="projects" data-index="${index}" data-field="publishStatus"><option value="draft" ${item.publishStatus === "draft" ? "selected" : ""}>Draft</option><option value="published" ${item.publishStatus !== "draft" ? "selected" : ""}>Published</option><option value="archived" ${item.publishStatus === "archived" ? "selected" : ""}>Archived</option></select></div>
        <div><label>Visible</label><select data-list="projects" data-index="${index}" data-field="isActive"><option value="true" ${item.isActive !== false ? "selected" : ""}>Yes</option><option value="false" ${item.isActive === false ? "selected" : ""}>No</option></select></div>
        <div><label>GitHub URL</label><input data-list="projects" data-index="${index}" data-field="githubUrl" type="text" value="${htmlEscape(item.githubUrl)}" /></div>
        <div><label>Demo URL</label><input data-list="projects" data-index="${index}" data-field="demoUrl" type="text" value="${htmlEscape(item.demoUrl)}" /></div>
        <div class="admin-col-span-2"><label>Description</label><input data-list="projects" data-index="${index}" data-field="description" type="text" value="${htmlEscape(item.description)}" /></div>
        <div><label>Members (comma separated)</label><input data-list="projects" data-index="${index}" data-field="members" type="text" value="${htmlEscape((item.members || []).join(", "))}" /></div>
        <div><label>Tech Stack (comma separated)</label><input data-list="projects" data-index="${index}" data-field="techStack" type="text" value="${htmlEscape((item.techStack || []).join(", "))}" /></div>
      </div>
      ${toolbarTemplate("projects", index, "Remove Project")}
    </div>
  `);
}

function ensureEventDetails(content, slug) {
  if (!slug) return;
  if (!content.eventDetails[slug]) {
    content.eventDetails[slug] = {
      overview: "",
      timeline: [],
      rules: [],
      eligibility: [],
      judgingCriteria: [],
      judges: [],
      mentors: [],
      faq: [],
    };
  }
}

function currentSlug() {
  return eventDetailsSlugSelect?.value || "";
}

function renderEventSlugOptions(content) {
  const slugs = content.hackathons.map((item) => item.slug).filter(Boolean);
  eventDetailsSlugSelect.innerHTML = slugs
    .map((slug) => `<option value="${htmlEscape(slug)}">${htmlEscape(slug)}</option>`)
    .join("");
  if (!eventDetailsSlugSelect.value && slugs.length) eventDetailsSlugSelect.value = slugs[0];
}

function renderEventDetails(content) {
  const slug = currentSlug();
  ensureEventDetails(content, slug);
  const event = content.eventDetails[slug] || {};
  setValue("eventOverview", event.overview || "");
  setValue("timelineText", (event.timeline || []).join("\n"));
  setValue("rulesText", (event.rules || []).join("\n"));
  setValue("eligibilityText", (event.eligibility || []).join("\n"));
  setValue("judgingText", (event.judgingCriteria || []).join("\n"));

  renderList("judgesList", event.judges || [], (item, index) => `
    <div class="admin-list-item">
      <div class="admin-grid">
        <div><label>Name</label><input data-list="judges" data-index="${index}" data-field="name" type="text" value="${htmlEscape(item.name)}" /></div>
        <div><label>Role</label><input data-list="judges" data-index="${index}" data-field="role" type="text" value="${htmlEscape(item.role)}" /></div>
      </div>
      ${toolbarTemplate("judges", index)}
    </div>
  `);
  renderList("mentorsList", event.mentors || [], (item, index) => `
    <div class="admin-list-item">
      <div class="admin-grid">
        <div><label>Name</label><input data-list="mentors" data-index="${index}" data-field="name" type="text" value="${htmlEscape(item.name)}" /></div>
        <div><label>Role</label><input data-list="mentors" data-index="${index}" data-field="role" type="text" value="${htmlEscape(item.role)}" /></div>
      </div>
      ${toolbarTemplate("mentors", index)}
    </div>
  `);
  renderList("faqList", event.faq || [], (item, index) => `
    <div class="admin-list-item">
      <div class="admin-grid">
        <div><label>Question</label><input data-list="faq" data-index="${index}" data-field="question" type="text" value="${htmlEscape(item.question)}" /></div>
        <div><label>Answer</label><input data-list="faq" data-index="${index}" data-field="answer" type="text" value="${htmlEscape(item.answer)}" /></div>
      </div>
      ${toolbarTemplate("faq", index)}
    </div>
  `);
}

function currentSeoHackathonSlug() {
  if (seoHackathonUseCurrent?.value === "true") return currentSlug();
  return getInputValue("seoHackathonSlug");
}

function renderSeoFields(content) {
  setValue("seoTitleSuffix", content.seo.global.titleSuffix || "");
  setValue("seoDefaultDescription", content.seo.global.defaultDescription || "");
  setValue("seoDefaultOgImage", content.seo.global.defaultOgImage || "");

  const pageKey = getInputValue("seoPageKey") || "home";
  const pageSeo = content.seo.pages[pageKey] || {};
  setValue("seoPageTitle", pageSeo.title || "");
  setValue("seoPageDescription", pageSeo.description || "");
  setValue("seoPageOgImage", pageSeo.ogImage || "");

  const hackSlug = currentSeoHackathonSlug();
  if (seoHackathonUseCurrent?.value === "true") setValue("seoHackathonSlug", hackSlug || "");
  const hackSeo = content.seo.hackathonPages[hackSlug] || {};
  setValue("seoHackathonTitle", hackSeo.title || "");
  setValue("seoHackathonDescription", hackSeo.description || "");
  setValue("seoHackathonOgImage", hackSeo.ogImage || "");
}

function renderFromState() {
  if (!contentState) return;
  renderSimpleFields(contentState);
  renderRepeaters(contentState);
  renderEventSlugOptions(contentState);
  renderEventDetails(contentState);
  renderSeoFields(contentState);
  contentInput.value = JSON.stringify(contentState, null, 2);
}

function collectListValues(listName) {
  const rows = [...document.querySelectorAll(`[data-list="${listName}"]`)];
  const grouped = new Map();
  rows.forEach((input) => {
    const index = Number(input.dataset.index);
    const field = input.dataset.field;
    if (!grouped.has(index)) grouped.set(index, {});
    grouped.get(index)[field] = input.value;
  });
  return [...grouped.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, value]) => value);
}

function collectEventPeople(listName) {
  return collectListValues(listName).map((entry) => ({
    name: (entry.name || "").trim(),
    role: (entry.role || "").trim(),
  }));
}

function collectSeoFromFields(base) {
  base.seo.global = {
    titleSuffix: getInputValue("seoTitleSuffix"),
    defaultDescription: getInputValue("seoDefaultDescription"),
    defaultOgImage: getInputValue("seoDefaultOgImage"),
  };
  const pageKey = getInputValue("seoPageKey") || "home";
  base.seo.pages[pageKey] = {
    title: getInputValue("seoPageTitle"),
    description: getInputValue("seoPageDescription"),
    ogImage: getInputValue("seoPageOgImage"),
  };
  const hackSlug = currentSeoHackathonSlug();
  if (hackSlug) {
    base.seo.hackathonPages[hackSlug] = {
      title: getInputValue("seoHackathonTitle"),
      description: getInputValue("seoHackathonDescription"),
      ogImage: getInputValue("seoHackathonOgImage"),
    };
  }
}

function collectContentFromForm() {
  const base = ensureContentDefaults(contentState || {});
  base.globalSettings.siteName = getInputValue("siteName");
  base.globalSettings.tagline = getInputValue("siteTagline");
  base.globalSettings.shortDescription = getInputValue("siteShortDescription");
  base.globalSettings.contactEmail = getInputValue("contactEmail");
  base.globalSettings.footerText = getInputValue("footerText");
  base.globalSettings.logoUrl = getInputValue("logoUrl");
  base.globalSettings.faviconUrl = getInputValue("faviconUrl");
  base.globalSettings.socialPreviewImage = getInputValue("socialPreviewImage");
  base.globalSettings.announcement = {
    enabled: getInputValue("announcementEnabled") !== "false",
    text: getInputValue("announcementText"),
    linkUrl: getInputValue("announcementLinkUrl"),
    linkText: getInputValue("announcementLinkText"),
    startAtIso: getInputValue("announcementStartAt"),
    endAtIso: getInputValue("announcementEndAt"),
  };

  base.siteConfig.registerUrl = getInputValue("registerUrl");
  base.siteConfig.communityUrl = getInputValue("communityUrl");
  base.siteConfig.ga4MeasurementId = getInputValue("ga4MeasurementId");
  base.siteConfig.socialLinks = collectListValues("social").map((entry) => ({
    label: (entry.label || "").trim(),
    url: (entry.url || "").trim(),
    isActive: entry.isActive !== "false",
  }));

  base.navigation.items = collectListValues("nav").map((entry) => ({
    label: (entry.label || "").trim(),
    href: (entry.href || "").trim(),
    visible: entry.visible !== "false",
  }));
  base.mediaLibrary = collectListValues("media").map((entry) => ({
    key: (entry.key || "").trim(),
    label: (entry.label || "").trim(),
    url: (entry.url || "").trim(),
    alt: (entry.alt || "").trim(),
    type: (entry.type || "image").trim(),
    tags: splitLines(String(entry.tags || "").replaceAll(",", "\n")),
    isActive: entry.isActive !== "false",
  }));

  base.home.kicker = getInputValue("homeKicker");
  base.home.title = getInputValue("homeTitle");
  base.home.lead = getInputValue("homeLead");
  base.home.countdownLabel = getInputValue("homeCountdownLabel");
  base.home.primaryCtaText = getInputValue("homePrimaryCtaText");
  base.home.primaryCtaUrl = getInputValue("homePrimaryCtaUrl");
  base.home.secondaryCtaText = getInputValue("homeSecondaryCtaText");
  base.home.secondaryCtaUrl = getInputValue("homeSecondaryCtaUrl");
  base.home.valueCards = collectListValues("homeCards").map((entry) => ({
    title: (entry.title || "").trim(),
    description: (entry.description || "").trim(),
    isActive: entry.isActive !== "false",
  }));
  base.home.sections = collectListValues("homeSections").map((entry) => ({
    key: (entry.key || "").trim(),
    label: (entry.label || "").trim(),
    enabled: entry.enabled !== "false",
  }));

  base.about.kicker = getInputValue("aboutKicker");
  base.about.title = getInputValue("aboutTitle");
  base.about.lead = getInputValue("aboutLead");
  base.about.cards = collectListValues("aboutCards").map((entry) => ({
    title: (entry.title || "").trim(),
    description: (entry.description || "").trim(),
    isActive: entry.isActive !== "false",
  }));

  base.hackathons = collectListValues("hackathons").map((entry) => ({
    id: (entry.id || "").trim(),
    slug: (entry.slug || "").trim(),
    shortName: (entry.shortName || "").trim(),
    name: (entry.name || "").trim(),
    status: (entry.status || "").trim(),
    publishStatus: (entry.publishStatus || "published").trim(),
    dateIso: (entry.dateIso || "").trim(),
    dateDisplay: (entry.dateDisplay || "").trim(),
    duration: (entry.duration || "").trim(),
    prizePool: (entry.prizePool || "").trim(),
    entryFee: (entry.entryFee || "").trim(),
    teamSize: (entry.teamSize || "").trim(),
    theme: (entry.theme || "").trim(),
    location: (entry.location || "").trim(),
    registrationUrl: (entry.registrationUrl || "").trim(),
    communityUrl: (entry.communityUrl || "").trim(),
    isActive: entry.isActive !== "false",
  }));

  base.projects = collectListValues("projects").map((entry) => ({
    name: (entry.name || "").trim(),
    description: (entry.description || "").trim(),
    hackathonId: (entry.hackathonId || "").trim(),
    team: (entry.team || "").trim(),
    members: splitLines(String(entry.members || "").replaceAll(",", "\n")),
    techStack: splitLines(String(entry.techStack || "").replaceAll(",", "\n")),
    githubUrl: (entry.githubUrl || "").trim(),
    demoUrl: (entry.demoUrl || "").trim(),
    award: (entry.award || "").trim(),
    publishStatus: (entry.publishStatus || "published").trim(),
    isActive: entry.isActive !== "false",
  }));

  const slug = currentSlug();
  ensureEventDetails(base, slug);
  base.eventDetails[slug] = {
    overview: getInputValue("eventOverview"),
    timeline: splitLines(getInputValue("timelineText")),
    rules: splitLines(getInputValue("rulesText")),
    eligibility: splitLines(getInputValue("eligibilityText")),
    judgingCriteria: splitLines(getInputValue("judgingText")),
    judges: collectEventPeople("judges"),
    mentors: collectEventPeople("mentors"),
    faq: collectListValues("faq").map((entry) => ({
      question: (entry.question || "").trim(),
      answer: (entry.answer || "").trim(),
    })),
  };

  collectSeoFromFields(base);
  return ensureContentDefaults(base);
}

function moveItemInArray(items, fromIndex, direction) {
  const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
  if (toIndex < 0 || toIndex >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function addListItem(listName) {
  contentState = collectContentFromForm();
  if (listName === "social") contentState.siteConfig.socialLinks.push({ label: "", url: "", isActive: true });
  if (listName === "media")
    contentState.mediaLibrary.push({
      key: "",
      label: "",
      url: "",
      alt: "",
      type: "image",
      tags: [],
      isActive: true,
    });
  if (listName === "nav") contentState.navigation.items.push({ label: "", href: "/", visible: true });
  if (listName === "homeCards") contentState.home.valueCards.push({ title: "", description: "", isActive: true });
  if (listName === "homeSections") contentState.home.sections.push({ key: "section", label: "Section", enabled: true });
  if (listName === "aboutCards") contentState.about.cards.push({ title: "", description: "", isActive: true });
  if (listName === "hackathons") {
    contentState.hackathons.push({
      id: "",
      slug: "",
      shortName: "",
      name: "",
      status: "coming_soon",
      publishStatus: "draft",
      dateIso: "",
      dateDisplay: "",
      duration: "",
      prizePool: "",
      entryFee: "",
      teamSize: "",
      theme: "",
      location: "",
      registrationUrl: "",
      communityUrl: "",
      isActive: true,
    });
  }
  if (listName === "projects") {
    contentState.projects.push({
      name: "",
      description: "",
      hackathonId: "",
      team: "",
      members: [],
      techStack: [],
      githubUrl: "",
      demoUrl: "",
      award: "",
      publishStatus: "draft",
      isActive: true,
    });
  }
  if (listName === "judges" || listName === "mentors") {
    const slug = currentSlug();
    ensureEventDetails(contentState, slug);
    contentState.eventDetails[slug][listName].push({ name: "", role: "" });
  }
  if (listName === "faq") {
    const slug = currentSlug();
    ensureEventDetails(contentState, slug);
    contentState.eventDetails[slug].faq.push({ question: "", answer: "" });
  }
  renderFromState();
}

function removeListItem(listName, index) {
  contentState = collectContentFromForm();
  const idx = Number(index);
  if (listName === "social") contentState.siteConfig.socialLinks.splice(idx, 1);
  if (listName === "media") contentState.mediaLibrary.splice(idx, 1);
  if (listName === "nav") contentState.navigation.items.splice(idx, 1);
  if (listName === "homeCards") contentState.home.valueCards.splice(idx, 1);
  if (listName === "homeSections") contentState.home.sections.splice(idx, 1);
  if (listName === "aboutCards") contentState.about.cards.splice(idx, 1);
  if (listName === "hackathons") contentState.hackathons.splice(idx, 1);
  if (listName === "projects") contentState.projects.splice(idx, 1);
  if (listName === "judges" || listName === "mentors" || listName === "faq") {
    const slug = currentSlug();
    ensureEventDetails(contentState, slug);
    contentState.eventDetails[slug][listName].splice(idx, 1);
  }
  renderFromState();
}

function moveListItem(listName, index, direction) {
  contentState = collectContentFromForm();
  const idx = Number(index);
  if (Number.isNaN(idx)) return;
  if (listName === "social") contentState.siteConfig.socialLinks = moveItemInArray(contentState.siteConfig.socialLinks, idx, direction);
  if (listName === "media") contentState.mediaLibrary = moveItemInArray(contentState.mediaLibrary, idx, direction);
  if (listName === "nav") contentState.navigation.items = moveItemInArray(contentState.navigation.items, idx, direction);
  if (listName === "homeCards") contentState.home.valueCards = moveItemInArray(contentState.home.valueCards, idx, direction);
  if (listName === "homeSections") contentState.home.sections = moveItemInArray(contentState.home.sections, idx, direction);
  if (listName === "aboutCards") contentState.about.cards = moveItemInArray(contentState.about.cards, idx, direction);
  if (listName === "hackathons") contentState.hackathons = moveItemInArray(contentState.hackathons, idx, direction);
  if (listName === "projects") contentState.projects = moveItemInArray(contentState.projects, idx, direction);
  if (listName === "judges" || listName === "mentors" || listName === "faq") {
    const slug = currentSlug();
    ensureEventDetails(contentState, slug);
    contentState.eventDetails[slug][listName] = moveItemInArray(
      contentState.eventDetails[slug][listName],
      idx,
      direction
    );
  }
  renderFromState();
}

async function loadFromFallbackFile() {
  const response = await fetch("/data/site-content.json", { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Unable to load fallback content file.");
  return response.json();
}

async function loadFromAdminApi() {
  const response = await fetch("/api/admin/content", {
    headers: { "x-admin-token": tokenValue(), Accept: "application/json" },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Failed to load admin content.");
  return payload.content;
}

async function handleLoad() {
  setStatus("Loading content...");
  storeToken();
  try {
    let content = await loadFromAdminApi();
    if (!content) content = await loadFromFallbackFile();
    contentState = ensureContentDefaults(content);
    renderFromState();
    setStatus("Content loaded successfully.", "is-success");
  } catch (error) {
    setStatus(error.message, "is-error");
  }
}

async function handleReset() {
  setStatus("Loading fallback content...");
  try {
    const content = await loadFromFallbackFile();
    contentState = ensureContentDefaults(content);
    renderFromState();
    setStatus("Fallback JSON loaded. Save to publish.", "is-success");
  } catch (error) {
    setStatus(error.message, "is-error");
  }
}

function refreshJsonFromForms() {
  try {
    contentState = collectContentFromForm();
    contentInput.value = JSON.stringify(contentState, null, 2);
    setStatus("JSON refreshed from form values.", "is-success");
  } catch (error) {
    setStatus(`Unable to refresh JSON: ${error.message}`, "is-error");
  }
}

function applyJsonToForms() {
  try {
    const parsed = JSON.parse(contentInput.value);
    contentState = ensureContentDefaults(parsed);
    renderFromState();
    setStatus("JSON applied to form controls.", "is-success");
  } catch {
    setStatus("Invalid JSON. Fix it before applying.", "is-error");
  }
}

async function postAdminSection(url, payload, successMessage) {
  storeToken();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": tokenValue(),
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to save section.");
  setStatus(`${successMessage} (${result.updatedAt || "updated"})`, "is-success");
}

async function handleSave() {
  setStatus("Saving content...");
  storeToken();
  try {
    contentState = collectContentFromForm();
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": tokenValue(),
      },
      body: JSON.stringify(contentState),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Failed to save content.");
    contentInput.value = JSON.stringify(contentState, null, 2);
    setStatus(`Saved successfully at ${payload.updatedAt}.`, "is-success");
  } catch (error) {
    setStatus(error.message, "is-error");
  }
}

async function saveSettingsSection() {
  setStatus("Saving settings section...");
  try {
    contentState = collectContentFromForm();
    await postAdminSection(
      "/api/admin/settings",
      {
        globalSettings: contentState.globalSettings,
        siteConfig: contentState.siteConfig,
        navigation: contentState.navigation,
        seo: contentState.seo,
      },
      "Settings section saved"
    );
  } catch (error) {
    setStatus(error.message, "is-error");
  }
}

async function saveHackathonsSection() {
  setStatus("Saving hackathons section...");
  try {
    contentState = collectContentFromForm();
    await postAdminSection(
      "/api/admin/hackathons",
      {
        hackathons: contentState.hackathons,
        eventDetails: contentState.eventDetails,
        seo: contentState.seo,
      },
      "Hackathons section saved"
    );
  } catch (error) {
    setStatus(error.message, "is-error");
  }
}

async function saveProjectsSection() {
  setStatus("Saving projects section...");
  try {
    contentState = collectContentFromForm();
    await postAdminSection(
      "/api/admin/projects",
      { projects: contentState.projects },
      "Projects section saved"
    );
  } catch (error) {
    setStatus(error.message, "is-error");
  }
}

async function saveMediaSection() {
  setStatus("Saving media section...");
  try {
    contentState = collectContentFromForm();
    await postAdminSection(
      "/api/admin/media",
      {
        mediaLibrary: contentState.mediaLibrary,
        globalMedia: {
          logoUrl: contentState.globalSettings.logoUrl,
          faviconUrl: contentState.globalSettings.faviconUrl,
          socialPreviewImage: contentState.globalSettings.socialPreviewImage,
        },
      },
      "Media section saved"
    );
  } catch (error) {
    setStatus(error.message, "is-error");
  }
}

async function saveSeoSection() {
  setStatus("Saving SEO section...");
  try {
    contentState = collectContentFromForm();
    await postAdminSection(
      "/api/admin/settings",
      {
        globalSettings: contentState.globalSettings,
        siteConfig: contentState.siteConfig,
        navigation: contentState.navigation,
        seo: contentState.seo,
      },
      "SEO section saved"
    );
  } catch (error) {
    setStatus(error.message, "is-error");
  }
}

function bindButtons() {
  byId("addSocialLinkBtn")?.addEventListener("click", () => addListItem("social"));
  byId("addMediaAssetBtn")?.addEventListener("click", () => addListItem("media"));
  byId("addNavItemBtn")?.addEventListener("click", () => addListItem("nav"));
  byId("addHomeCardBtn")?.addEventListener("click", () => addListItem("homeCards"));
  byId("addHomeSectionBtn")?.addEventListener("click", () => addListItem("homeSections"));
  byId("addAboutCardBtn")?.addEventListener("click", () => addListItem("aboutCards"));
  byId("addHackathonBtn")?.addEventListener("click", () => addListItem("hackathons"));
  byId("addProjectBtn")?.addEventListener("click", () => addListItem("projects"));
  byId("addJudgeBtn")?.addEventListener("click", () => addListItem("judges"));
  byId("addMentorBtn")?.addEventListener("click", () => addListItem("mentors"));
  byId("addFaqBtn")?.addEventListener("click", () => addListItem("faq"));

  document.addEventListener("click", (event) => {
    const removeBtn = event.target.closest("[data-remove-list]");
    if (removeBtn) {
      removeListItem(removeBtn.getAttribute("data-remove-list"), removeBtn.getAttribute("data-index"));
      return;
    }
    const moveBtn = event.target.closest("[data-move-list]");
    if (moveBtn) {
      moveListItem(
        moveBtn.getAttribute("data-move-list"),
        moveBtn.getAttribute("data-index"),
        moveBtn.getAttribute("data-direction")
      );
    }
  });

  eventDetailsSlugSelect?.addEventListener("change", () => {
    contentState = collectContentFromForm();
    renderEventDetails(contentState);
    renderSeoFields(contentState);
  });
  seoPageKeySelect?.addEventListener("change", () => {
    contentState = collectContentFromForm();
    renderSeoFields(contentState);
  });
  seoHackathonUseCurrent?.addEventListener("change", () => {
    contentState = collectContentFromForm();
    renderSeoFields(contentState);
  });
  byId("seoHackathonSlug")?.addEventListener("change", () => {
    contentState = collectContentFromForm();
    renderSeoFields(contentState);
  });
}

function init() {
  const remembered = localStorage.getItem("hackverse_admin_token");
  if (tokenInput && remembered) tokenInput.value = remembered;

  loadBtn?.addEventListener("click", handleLoad);
  saveBtn?.addEventListener("click", handleSave);
  resetBtn?.addEventListener("click", handleReset);
  refreshJsonBtn?.addEventListener("click", refreshJsonFromForms);
  applyJsonBtn?.addEventListener("click", applyJsonToForms);
  saveSettingsSectionBtn?.addEventListener("click", saveSettingsSection);
  saveHackathonsSectionBtn?.addEventListener("click", saveHackathonsSection);
  saveProjectsSectionBtn?.addEventListener("click", saveProjectsSection);
  saveSeoSectionBtn?.addEventListener("click", saveSeoSection);
  saveMediaSectionBtn?.addEventListener("click", saveMediaSection);
  bindButtons();
  handleLoad();
}

init();
