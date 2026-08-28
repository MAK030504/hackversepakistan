const statusEl = document.getElementById("adminStatus");
const tokenInput = document.getElementById("adminToken");
const loadBtn = document.getElementById("loadContentBtn");
const eventDetailsSlugSelect = document.getElementById("eventDetailsSlug");
const saveHackathonsSectionBtn = document.getElementById("saveHackathonsSectionBtn");
const saveProjectsSectionBtn = document.getElementById("saveProjectsSectionBtn");

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

function renderRepeaters(content) {
  renderList("hackathonsList", content.hackathons, (item, index) => `
    <div class="admin-list-item" id="hackathon-item-${index}">
      <h4>${htmlEscape(item.name || item.shortName || `Hackathon ${index + 1}`)}</h4>
      <div class="admin-grid">
        <div><label>Name</label><input data-list="hackathons" data-index="${index}" data-field="name" type="text" value="${htmlEscape(item.name)}" placeholder="HackVerse #002" /></div>
        <div><label>Short name</label><input data-list="hackathons" data-index="${index}" data-field="shortName" type="text" value="${htmlEscape(item.shortName)}" placeholder="#002" /></div>
        <div><label>Slug (URL)</label><input data-list="hackathons" data-index="${index}" data-field="slug" type="text" value="${htmlEscape(item.slug)}" placeholder="002" /></div>
        <div><label>ID</label><input data-list="hackathons" data-index="${index}" data-field="id" type="text" value="${htmlEscape(item.id)}" placeholder="hv-002" /></div>
        <div><label>Status label</label><input data-list="hackathons" data-index="${index}" data-field="status" type="text" value="${htmlEscape(item.status)}" placeholder="Registration open" /></div>
        <div><label>Published</label><select data-list="hackathons" data-index="${index}" data-field="publishStatus"><option value="draft" ${item.publishStatus === "draft" ? "selected" : ""}>Draft</option><option value="published" ${item.publishStatus === "published" ? "selected" : ""}>Published</option><option value="archived" ${item.publishStatus === "archived" ? "selected" : ""}>Archived</option></select></div>
        <div><label>Visible on site</label><select data-list="hackathons" data-index="${index}" data-field="isActive"><option value="true" ${item.isActive !== false ? "selected" : ""}>Yes</option><option value="false" ${item.isActive === false ? "selected" : ""}>No</option></select></div>
        <div><label>Event date</label><input data-list="hackathons" data-index="${index}" data-field="dateDisplay" type="text" value="${htmlEscape(item.dateDisplay)}" placeholder="19 Sep 2026" /></div>
        <div><label>Date (ISO)</label><input data-list="hackathons" data-index="${index}" data-field="dateIso" type="text" value="${htmlEscape(item.dateIso)}" placeholder="2026-09-19" /></div>
        <div><label>Duration</label><input data-list="hackathons" data-index="${index}" data-field="duration" type="text" value="${htmlEscape(item.duration)}" placeholder="48 hours" /></div>
        <div><label>Prize pool</label><input data-list="hackathons" data-index="${index}" data-field="prizePool" type="text" value="${htmlEscape(item.prizePool)}" placeholder="PKR 100,000" /></div>
        <div><label>Entry fee</label><input data-list="hackathons" data-index="${index}" data-field="entryFee" type="text" value="${htmlEscape(item.entryFee)}" placeholder="Free" /></div>
        <div><label>Team size</label><input data-list="hackathons" data-index="${index}" data-field="teamSize" type="text" value="${htmlEscape(item.teamSize)}" placeholder="2–4 members" /></div>
        <div><label>Location</label><input data-list="hackathons" data-index="${index}" data-field="location" type="text" value="${htmlEscape(item.location)}" placeholder="Online" /></div>
        <div class="admin-col-span-2"><label>Theme</label><input data-list="hackathons" data-index="${index}" data-field="theme" type="text" value="${htmlEscape(item.theme)}" placeholder="AI for social good" /></div>
        <div><label>Registration URL</label><input data-list="hackathons" data-index="${index}" data-field="registrationUrl" type="text" value="${htmlEscape(item.registrationUrl)}" /></div>
        <div><label>Community URL</label><input data-list="hackathons" data-index="${index}" data-field="communityUrl" type="text" value="${htmlEscape(item.communityUrl)}" /></div>
      </div>
      ${toolbarTemplate("hackathons", index, "Remove")}
    </div>
  `);

  renderList("projectsList", content.projects, (item, index) => `
    <div class="admin-list-item" id="project-item-${index}">
      <h4>${htmlEscape(item.name || `Project ${index + 1}`)}</h4>
      <div class="admin-grid">
        <div><label>Project name</label><input data-list="projects" data-index="${index}" data-field="name" type="text" value="${htmlEscape(item.name)}" placeholder="EcoTrack" /></div>
        <div><label>Team name</label><input data-list="projects" data-index="${index}" data-field="team" type="text" value="${htmlEscape(item.team)}" placeholder="Team Alpha" /></div>
        <div><label>Hackathon ID</label><input data-list="projects" data-index="${index}" data-field="hackathonId" type="text" value="${htmlEscape(item.hackathonId)}" placeholder="hv-001" /></div>
        <div><label>Award</label><input data-list="projects" data-index="${index}" data-field="award" type="text" value="${htmlEscape(item.award)}" placeholder="1st Place" /></div>
        <div><label>Published</label><select data-list="projects" data-index="${index}" data-field="publishStatus"><option value="draft" ${item.publishStatus === "draft" ? "selected" : ""}>Draft</option><option value="published" ${item.publishStatus === "published" ? "selected" : ""}>Published</option><option value="archived" ${item.publishStatus === "archived" ? "selected" : ""}>Archived</option></select></div>
        <div><label>Visible on site</label><select data-list="projects" data-index="${index}" data-field="isActive"><option value="true" ${item.isActive !== false ? "selected" : ""}>Yes</option><option value="false" ${item.isActive === false ? "selected" : ""}>No</option></select></div>
        <div class="admin-col-span-2"><label>Description</label><textarea data-list="projects" data-index="${index}" data-field="description" rows="3">${htmlEscape(item.description)}</textarea></div>
        <div><label>GitHub URL</label><input data-list="projects" data-index="${index}" data-field="githubUrl" type="text" value="${htmlEscape(item.githubUrl)}" /></div>
        <div><label>Demo URL</label><input data-list="projects" data-index="${index}" data-field="demoUrl" type="text" value="${htmlEscape(item.demoUrl)}" /></div>
        <div><label>Members (comma separated)</label><input data-list="projects" data-index="${index}" data-field="members" type="text" value="${htmlEscape((item.members || []).join(", "))}" /></div>
        <div><label>Tech stack (comma separated)</label><input data-list="projects" data-index="${index}" data-field="techStack" type="text" value="${htmlEscape((item.techStack || []).join(", "))}" /></div>
      </div>
      ${toolbarTemplate("projects", index, "Remove")}
    </div>
  `);

  updateListEmptyStates(content);
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

function renderFromState() {
  if (!contentState) return;
  renderRepeaters(contentState);
  renderEventSlugOptions(contentState);
  renderEventDetails(contentState);
  updateDashboard(contentState);
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

function collectContentFromForm() {
  const base = ensureContentDefaults(structuredClone(contentState || {}));

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

async function saveHackathonsSection() {
  setStatus("Saving hackathons...");
  try {
    contentState = collectContentFromForm();
    await postAdminSection(
      "/api/admin/hackathons",
      {
        hackathons: contentState.hackathons,
        eventDetails: contentState.eventDetails,
        seo: contentState.seo,
      },
      "Hackathons saved"
    );
  } catch (error) {
    setStatus(error.message, "is-error");
  }
}

async function saveProjectsSection() {
  setStatus("Saving projects...");
  try {
    contentState = collectContentFromForm();
    await postAdminSection(
      "/api/admin/projects",
      { projects: contentState.projects },
      "Projects saved"
    );
  } catch (error) {
    setStatus(error.message, "is-error");
  }
}

function updateListEmptyStates(content = contentState) {
  const hackathons = Array.isArray(content?.hackathons) ? content.hackathons : [];
  const projects = Array.isArray(content?.projects) ? content.projects : [];

  const hackathonsEmpty = byId("hackathonsEmpty");
  const projectsEmpty = byId("projectsEmpty");
  const hackathonsList = byId("hackathonsList");
  const projectsList = byId("projectsList");

  if (hackathonsEmpty) hackathonsEmpty.hidden = hackathons.length > 0;
  if (projectsEmpty) projectsEmpty.hidden = projects.length > 0;
  if (hackathonsList) hackathonsList.hidden = hackathons.length === 0;
  if (projectsList) projectsList.hidden = projects.length === 0;
}

function publishStatusLabel(status) {
  if (status === "published") return "Published";
  if (status === "archived") return "Archived";
  return "Draft";
}

function renderDashboardTables(content = contentState) {
  const hackathons = Array.isArray(content?.hackathons) ? content.hackathons : [];
  const projects = Array.isArray(content?.projects) ? content.projects : [];

  const hackathonsBody = byId("dashboardHackathonsTable")?.querySelector("tbody");
  const projectsBody = byId("dashboardProjectsTable")?.querySelector("tbody");
  const hackathonsEmpty = byId("dashboardHackathonsEmpty");
  const projectsEmpty = byId("dashboardProjectsEmpty");
  const hackathonsTable = byId("dashboardHackathonsTable");

  if (hackathonsBody) {
    hackathonsBody.innerHTML = hackathons
      .map(
        (item, index) => `
        <tr>
          <td><strong>${htmlEscape(item.name || item.shortName || "Untitled")}</strong></td>
          <td>${htmlEscape(item.dateDisplay || "—")}</td>
          <td>${htmlEscape(item.status || "—")}</td>
          <td><span class="admin-badge admin-badge--${htmlEscape(item.publishStatus || "draft")}">${publishStatusLabel(item.publishStatus)}</span></td>
          <td><button class="btn btn-secondary btn-sm" type="button" data-admin-edit="hackathon" data-index="${index}">Edit</button></td>
        </tr>`
      )
      .join("");
  }

  if (projectsBody) {
    projectsBody.innerHTML = projects
      .map(
        (item, index) => `
        <tr>
          <td><strong>${htmlEscape(item.name || "Untitled")}</strong></td>
          <td>${htmlEscape(item.team || "—")}</td>
          <td>${htmlEscape(item.hackathonId || "—")}</td>
          <td><span class="admin-badge admin-badge--${htmlEscape(item.publishStatus || "draft")}">${publishStatusLabel(item.publishStatus)}</span></td>
          <td><button class="btn btn-secondary btn-sm" type="button" data-admin-edit="project" data-index="${index}">Edit</button></td>
        </tr>`
      )
      .join("");
  }

  if (hackathonsEmpty) hackathonsEmpty.hidden = hackathons.length > 0;
  if (projectsEmpty) projectsEmpty.hidden = projects.length > 0;
  if (hackathonsTable) {
    hackathonsTable.hidden = hackathons.length === 0;
    const wrap = hackathonsTable.closest(".table-wrap");
    if (wrap) wrap.hidden = hackathons.length === 0;
  }
  const projectsTable = byId("dashboardProjectsTable");
  if (projectsTable) {
    projectsTable.hidden = projects.length === 0;
    const wrap = projectsTable.closest(".table-wrap");
    if (wrap) wrap.hidden = projects.length === 0;
  }
}

function updateDashboard(content = contentState) {
  const hackathons = Array.isArray(content?.hackathons) ? content.hackathons : [];
  const projects = Array.isArray(content?.projects) ? content.projects : [];

  const statHackathons = byId("statHackathons");
  const statProjects = byId("statProjects");
  if (statHackathons) statHackathons.textContent = String(hackathons.length);
  if (statProjects) statProjects.textContent = String(projects.length);

  renderDashboardTables(content);
}

function showAdminPanel(panelId) {
  document.querySelectorAll("[data-admin-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.getAttribute("data-admin-panel") === panelId);
  });
  document.querySelectorAll("[data-admin-nav]").forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("data-admin-nav") === panelId);
  });
}

function focusListItem(type, index) {
  const elementId = type === "hackathon" ? `hackathon-item-${index}` : `project-item-${index}`;
  const element = byId(elementId);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
  element.classList.add("is-highlight");
  window.setTimeout(() => element.classList.remove("is-highlight"), 1600);
}

function addHackathon() {
  showAdminPanel("hackathons");
  addListItem("hackathons");
  const index = (contentState?.hackathons?.length || 1) - 1;
  focusListItem("hackathon", index);
  setStatus("New hackathon added. Fill in the details and click Save Hackathons.", "is-success");
}

function addProject() {
  showAdminPanel("projects");
  addListItem("projects");
  const index = (contentState?.projects?.length || 1) - 1;
  focusListItem("project", index);
  setStatus("New project added. Fill in the details and click Save Projects.", "is-success");
}

function initAdminNavigation() {
  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-admin-action]");
    if (actionButton) {
      const action = actionButton.getAttribute("data-admin-action");
      if (action === "add-hackathon") {
        addHackathon();
        return;
      }
      if (action === "add-project") {
        addProject();
        return;
      }
    }

    const editButton = event.target.closest("[data-admin-edit]");
    if (editButton) {
      const type = editButton.getAttribute("data-admin-edit");
      const index = Number(editButton.getAttribute("data-index"));
      if (type === "hackathon") {
        showAdminPanel("hackathons");
        focusListItem("hackathon", index);
        return;
      }
      if (type === "project") {
        showAdminPanel("projects");
        focusListItem("project", index);
      }
      return;
    }

    const navButton = event.target.closest("[data-admin-nav]");
    if (!navButton) return;
    const panelId = navButton.getAttribute("data-admin-nav");
    if (!panelId) return;
    showAdminPanel(panelId);
  });
}

function bindButtons() {
  byId("addJudgeBtn")?.addEventListener("click", () => addListItem("judges"));
  byId("addMentorBtn")?.addEventListener("click", () => addListItem("mentors"));
  byId("addFaqBtn")?.addEventListener("click", () => addListItem("faq"));
  byId("addHackathonBtn")?.addEventListener("click", () => addHackathon());
  byId("addProjectBtn")?.addEventListener("click", () => addProject());

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
  });
}

function init() {
  const remembered = localStorage.getItem("hackverse_admin_token");
  if (tokenInput && remembered) tokenInput.value = remembered;

  loadBtn?.addEventListener("click", handleLoad);
  saveHackathonsSectionBtn?.addEventListener("click", saveHackathonsSection);
  saveProjectsSectionBtn?.addEventListener("click", saveProjectsSection);
  initAdminNavigation();
  bindButtons();
  handleLoad();
}

init();
