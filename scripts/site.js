const SITE_CONFIG = {
  registerUrl: "https://forms.gle/hackverse-001-register",
  communityUrl: "https://discord.gg/hackversepakistan",
  socialLinks: [],
  ga4MeasurementId: "",
  siteName: "HackVerse Pakistan",
  tagline: "Build. Compete. Connect.",
  shortDescription: "Building a hackathon culture in Pakistan.",
  footerText: "Building a hackathon culture in Pakistan.",
  navigation: [],
  announcement: null,
  seo: null,
  logoUrl: "",
  faviconUrl: "",
  socialPreviewImage: "/social-preview.svg",
};
let cachedContent = null;

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function navLinks() {
  if (Array.isArray(SITE_CONFIG.navigation) && SITE_CONFIG.navigation.length) {
    return SITE_CONFIG.navigation
      .filter((item) => item.visible !== false)
      .map((item) => ({ href: item.href || "/", label: item.label || "Link" }));
  }
  return [
    { href: "/", label: "Home" },
    { href: "/hackathons/", label: "Hackathons" },
    { href: "/projects/", label: "Projects" },
    { href: "/about/", label: "About" },
    { href: "/admin/", label: "Admin" },
  ];
}

function renderHeader() {
  const container = document.querySelector("[data-site-header]");
  if (!container) return;
  const current = normalizePath(window.location.pathname);
  const links = navLinks()
    .map((link) => {
      const linkPath = normalizePath(link.href);
      const active = current === linkPath ? "is-active" : "";
      return `<a class="${active}" href="${link.href}">${link.label}</a>`;
    })
    .join("");

  container.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand-link" href="/" aria-label="HackVerse Pakistan">
          ${
            SITE_CONFIG.logoUrl
              ? `<img src="${SITE_CONFIG.logoUrl}" alt="${SITE_CONFIG.siteName}" class="brand-logo" />`
              : `<span class="brand-pill">HackVerse</span>`
          }
          <span>${SITE_CONFIG.siteName.replace(/^HackVerse\s*/i, "") || "Pakistan"}</span>
        </a>
        <nav class="site-nav" aria-label="Primary navigation">
          ${links}
        </nav>
        <div class="header-ctas">
          <a class="btn btn-secondary cta-track" data-cta="join_community" href="${SITE_CONFIG.communityUrl}" target="_blank" rel="noopener noreferrer">Join Community</a>
          <a class="btn btn-primary cta-track" data-cta="register_now" href="${SITE_CONFIG.registerUrl}" target="_blank" rel="noopener noreferrer">Register</a>
        </div>
      </div>
      <div id="siteAnnouncement"></div>
    </header>
  `;
  renderAnnouncement();
}

function renderFooter() {
  const container = document.querySelector("[data-site-footer]");
  if (!container) return;
  const social = (SITE_CONFIG.socialLinks || [])
    .map(
      (item) =>
        `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.label}</a>`
    )
    .join("");
  const year = new Date().getFullYear();
  container.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-inner">
        <p><strong>${SITE_CONFIG.siteName}</strong> - ${SITE_CONFIG.footerText}</p>
        <div class="footer-links" aria-label="Social links">
          ${social}
        </div>
        <p>&copy; ${year} HackVerse Pakistan</p>
      </div>
    </footer>
  `;
}

function trackEvent(eventName, params = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

function initCTATracking() {
  document.addEventListener("click", (event) => {
    const element = event.target.closest(".cta-track");
    if (element) {
      const ctaName = element.getAttribute("data-cta") || "unknown_cta";
      trackEvent("cta_click", {
        cta_name: ctaName,
        page_path: window.location.pathname,
      });
    }
  });
}

function initAnalytics() {
  if (!SITE_CONFIG.ga4MeasurementId) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${SITE_CONFIG.ga4MeasurementId}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", SITE_CONFIG.ga4MeasurementId);
}

function setMetaTag(attribute, key, value) {
  if (!value) return;
  const selector = attribute === "name" ? `meta[name="${key}"]` : `meta[property="${key}"]`;
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
}

function resolvePageKey(pathname) {
  const clean = normalizePath(pathname);
  if (clean === "/") return { kind: "page", key: "home" };
  if (clean === "/hackathons") return { kind: "page", key: "hackathons" };
  if (clean === "/about") return { kind: "page", key: "about" };
  if (clean === "/projects") return { kind: "page", key: "projects" };
  if (clean.startsWith("/hackathons/")) {
    const slug = clean.replace("/hackathons/", "");
    return { kind: "hackathon", key: slug };
  }
  return { kind: "page", key: "home" };
}

function applySeoFromConfig() {
  if (!SITE_CONFIG.seo) return;
  const map = resolvePageKey(window.location.pathname);
  const globalSeo = SITE_CONFIG.seo.global || {};
  const pageSeo = SITE_CONFIG.seo.pages || {};
  const hackSeo = SITE_CONFIG.seo.hackathonPages || {};
  let seo = pageSeo[map.key] || {};
  if (map.kind === "hackathon") seo = hackSeo[map.key] || {};

  const title = seo.title || `${SITE_CONFIG.siteName} | ${SITE_CONFIG.tagline}`;
  const description = seo.description || globalSeo.defaultDescription || SITE_CONFIG.shortDescription;
  const ogImage =
    seo.ogImage || globalSeo.defaultOgImage || SITE_CONFIG.socialPreviewImage || "/social-preview.svg";

  document.title = title;
  setMetaTag("name", "description", description);
  setMetaTag("property", "og:title", title);
  setMetaTag("property", "og:description", description);
  setMetaTag("property", "og:image", ogImage);
  setMetaTag("name", "twitter:title", title);
  setMetaTag("name", "twitter:description", description);
  setMetaTag("name", "twitter:image", ogImage);
}

function renderAnnouncement() {
  const root = document.getElementById("siteAnnouncement");
  if (!root) return;
  const banner = SITE_CONFIG.announcement;
  if (!banner || banner.enabled === false || !banner.text) {
    root.innerHTML = "";
    return;
  }
  const now = Date.now();
  const startOk = !banner.startAtIso || Number.isNaN(Date.parse(banner.startAtIso)) || now >= Date.parse(banner.startAtIso);
  const endOk = !banner.endAtIso || Number.isNaN(Date.parse(banner.endAtIso)) || now <= Date.parse(banner.endAtIso);
  if (!startOk || !endOk) {
    root.innerHTML = "";
    return;
  }
  const link = banner.linkUrl
    ? `<a href="${banner.linkUrl}" target="_blank" rel="noopener noreferrer">${banner.linkText || "Learn more"}</a>`
    : "";
  root.innerHTML = `<div class="announcement-bar"><div class="container"><span>${banner.text}</span>${link}</div></div>`;
}

function applySiteConfig(config = {}) {
  SITE_CONFIG.registerUrl = config.registerUrl || SITE_CONFIG.registerUrl;
  SITE_CONFIG.communityUrl = config.communityUrl || SITE_CONFIG.communityUrl;
  SITE_CONFIG.socialLinks = Array.isArray(config.socialLinks) ? config.socialLinks : [];
  SITE_CONFIG.ga4MeasurementId = config.ga4MeasurementId || "";
}

function applyGlobalSettings(globalSettings = {}, navigation = {}) {
  SITE_CONFIG.siteName = globalSettings.siteName || SITE_CONFIG.siteName;
  SITE_CONFIG.tagline = globalSettings.tagline || SITE_CONFIG.tagline;
  SITE_CONFIG.shortDescription = globalSettings.shortDescription || SITE_CONFIG.shortDescription;
  SITE_CONFIG.footerText = globalSettings.footerText || SITE_CONFIG.footerText;
  SITE_CONFIG.navigation = Array.isArray(navigation.items) ? navigation.items : [];
  SITE_CONFIG.announcement = globalSettings.announcement || null;
  SITE_CONFIG.logoUrl = globalSettings.logoUrl || "";
  SITE_CONFIG.faviconUrl = globalSettings.faviconUrl || "";
  SITE_CONFIG.socialPreviewImage =
    globalSettings.socialPreviewImage || SITE_CONFIG.socialPreviewImage;

  if (SITE_CONFIG.faviconUrl) {
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.setAttribute("href", SITE_CONFIG.faviconUrl);
  }

  applySeoFromConfig();
  renderAnnouncement();
}

async function loadContent() {
  if (cachedContent) return cachedContent;
  try {
    const response = await fetch("/api/content", { headers: { Accept: "application/json" } });
    if (response.ok) {
      const payload = await response.json();
      cachedContent = payload.content;
      return cachedContent;
    }
  } catch (error) {
    console.warn("API content unavailable, trying static file.", error);
  }
  const fallbackResponse = await fetch("/data/site-content.json", {
    headers: { Accept: "application/json" },
  });
  if (!fallbackResponse.ok) {
    throw new Error("Unable to load site content.");
  }
  cachedContent = await fallbackResponse.json();
  return cachedContent;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return response.json();
}

window.HackVerseSite = {
  SITE_CONFIG,
  fetchJson,
  trackEvent,
  loadContent,
};

async function initializeSiteChrome() {
  renderHeader();
  renderFooter();
  initCTATracking();
  try {
    const content = await loadContent();
    applySiteConfig(content.siteConfig || {});
    SITE_CONFIG.seo = content.seo || null;
    applyGlobalSettings(content.globalSettings || {}, content.navigation || {});
    renderHeader();
    renderFooter();
    applySeoFromConfig();
    initAnalytics();
  } catch (error) {
    console.warn("Using default site config only.", error);
  }
}

initializeSiteChrome();
