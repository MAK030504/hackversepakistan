const { SITE_CONFIG, trackEvent, loadContent } = window.HackVerseSite;

function pad(value) {
  return String(value).padStart(2, "0");
}

function renderCountdown(eventDateIso) {
  const root = document.getElementById("countdownRoot");
  if (!root) return;
  const targetTime = new Date(eventDateIso).getTime();
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  const tick = () => {
    const now = Date.now();
    const remaining = targetTime - now;
    if (remaining <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      return;
    }
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;
    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  };

  tick();
  setInterval(tick, 1000);
}

function renderHomeCards(cards = []) {
  const root = document.getElementById("valueCardsRoot");
  if (!root) return;
  root.innerHTML = cards
    .filter((card) => card?.isActive !== false)
    .map(
      (card) => `
    <article class="card">
      <h3>${card.title}</h3>
      <p>${card.description}</p>
    </article>
  `
    )
    .join("");
}

function applyHomeSectionLayout(homeConfig = {}) {
  const sectionSettings = Array.isArray(homeConfig.sections) ? homeConfig.sections : [];
  if (!sectionSettings.length) return;
  const main = document.querySelector(".site-main");
  if (!main) return;

  sectionSettings.forEach((section) => {
    const node = document.querySelector(`[data-home-section="${section.key}"]`);
    if (!node) return;
    node.style.display = section.enabled === false ? "none" : "";
    main.appendChild(node);
  });
}

async function renderHomeSpotlight(content) {
  const eventRoot = document.getElementById("nextEventRoot");
  const projectRoot = document.getElementById("projectTeaserRoot");
  if (!eventRoot || !projectRoot) return;

  try {
    const hackathons = (content.hackathons || []).filter(
      (event) => event?.isActive !== false && (event?.publishStatus || "published") === "published"
    );
    const projects = (content.projects || []).filter(
      (project) =>
        project?.isActive !== false && (project?.publishStatus || "published") === "published"
    );
    const nextEvent = hackathons.find((event) => event.status === "registration_open");
    if (nextEvent) {
      eventRoot.innerHTML = `
        <article class="card">
          <span class="chip">Next Hackathon</span>
          <h3>${nextEvent.name}</h3>
          <p>${nextEvent.theme}</p>
          <div class="metrics">
            <div class="metric"><strong>${nextEvent.dateDisplay}</strong><span>Date</span></div>
            <div class="metric"><strong>${nextEvent.duration}</strong><span>Duration</span></div>
            <div class="metric"><strong>${nextEvent.prizePool}</strong><span>Prize Pool</span></div>
            <div class="metric"><strong>${nextEvent.entryFee}</strong><span>Entry Fee</span></div>
          </div>
          <div class="cta-row">
            <a class="btn btn-primary cta-track" data-cta="event_register" href="${nextEvent.registrationUrl || SITE_CONFIG.registerUrl}" target="_blank" rel="noopener noreferrer">Register for ${nextEvent.shortName}</a>
            <a class="btn btn-secondary" href="/hackathons/001/">View Event Details</a>
          </div>
        </article>
      `;
    }

    const preview = projects.slice(0, 3);
    if (preview.length === 0) {
      projectRoot.innerHTML = `
        <article class="card">
          <h3>Project Showcase launches after HackVerse #001</h3>
          <p>Winning projects and selected builds will be published here with team details, tech stacks, and demo links.</p>
          <div class="cta-row">
            <a class="btn btn-secondary" href="/projects/">See showcase structure</a>
          </div>
        </article>
      `;
      return;
    }

    projectRoot.innerHTML = preview
      .map(
        (project) => `
      <article class="card">
        <span class="chip warm">${project.award || "Upcoming Entry"}</span>
        <h3>${project.name}</h3>
        <p>${project.description}</p>
      </article>
    `
      )
      .join("");
  } catch (error) {
    eventRoot.innerHTML = `<p>Unable to load event details right now.</p>`;
    projectRoot.innerHTML = `<p>Unable to load project teaser right now.</p>`;
    console.error(error);
  }
}

function isValidWhatsapp(value) {
  return /^\+?[0-9]{10,15}$/.test(value.replace(/\s+/g, ""));
}

function initNotifyForm() {
  const form = document.getElementById("notifyForm");
  const emailInput = document.getElementById("notifyEmail");
  const whatsappInput = document.getElementById("notifyWhatsapp");
  const message = document.getElementById("notifyMessage");
  if (!form || !emailInput || !whatsappInput || !message) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.className = "notify-message";
    message.textContent = "";

    const email = emailInput.value.trim().toLowerCase();
    const whatsapp = whatsappInput.value.trim();

    if (!email) {
      message.classList.add("is-error");
      message.textContent = "Please enter your email address.";
      return;
    }
    if (!whatsapp || !isValidWhatsapp(whatsapp)) {
      message.classList.add("is-error");
      message.textContent = "Please provide a valid WhatsApp number.";
      return;
    }

    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, whatsapp }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Subscription failed.");
      }
      message.classList.add("is-success");
      message.textContent = payload.message || "Thanks, we will notify you soon.";
      form.reset();
      trackEvent("notify_form_submit", { page_path: window.location.pathname });
    } catch (error) {
      message.classList.add("is-error");
      message.textContent = error.message || "Unable to submit right now.";
    }
  });
}

function wireDynamicLinks() {
  document.querySelectorAll("[data-dynamic-link='register']").forEach((link) => {
    link.href = SITE_CONFIG.registerUrl;
  });
  document.querySelectorAll("[data-dynamic-link='community']").forEach((link) => {
    link.href = SITE_CONFIG.communityUrl;
  });
}

async function initHome() {
  try {
    const content = await loadContent();
    const home = content.home || {};
    applyHomeSectionLayout(home);
    const hackathons = (content.hackathons || []).filter(
      (event) => event?.isActive !== false && (event?.publishStatus || "published") === "published"
    );
    const kicker = document.getElementById("homeKicker");
    const title = document.getElementById("homeTitle");
    const lead = document.getElementById("homeLead");
    const countdownLabel = document.getElementById("countdownLabel");
    if (kicker) kicker.textContent = home.kicker || kicker.textContent;
    if (title) title.textContent = home.title || title.textContent;
    if (lead) lead.textContent = home.lead || lead.textContent;
    if (countdownLabel) countdownLabel.textContent = home.countdownLabel || countdownLabel.textContent;
    const primaryCta = document.getElementById("homePrimaryCta");
    const secondaryCta = document.getElementById("homeSecondaryCta");
    if (primaryCta) {
      primaryCta.textContent = home.primaryCtaText || primaryCta.textContent;
      primaryCta.href = home.primaryCtaUrl || SITE_CONFIG.registerUrl;
    }
    if (secondaryCta) {
      secondaryCta.textContent = home.secondaryCtaText || secondaryCta.textContent;
      secondaryCta.href = home.secondaryCtaUrl || SITE_CONFIG.communityUrl;
    }

    const nextEvent = hackathons.find((event) => event.status === "registration_open");
    if (nextEvent?.dateIso) {
      renderCountdown(nextEvent.dateIso);
      const launchDate = document.getElementById("launchDate");
      if (launchDate) launchDate.textContent = nextEvent.dateDisplay;
    }
    renderHomeCards(home.valueCards || []);
    await renderHomeSpotlight(content);
  } catch (error) {
    console.error(error);
  }
  wireDynamicLinks();
  initNotifyForm();
}

initHome();
