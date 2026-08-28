const analyticsMessage = document.querySelector("[data-analytics-note]");

if (analyticsMessage) {
  const isEnabled = Boolean(window.HackVerseSite?.SITE_CONFIG?.ga4MeasurementId);
  analyticsMessage.textContent = isEnabled
    ? "Analytics enabled."
    : "Analytics is ready. Add your GA4 measurement ID in scripts/site.js to activate.";
}
