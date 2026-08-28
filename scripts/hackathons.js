const { loadContent, SITE_CONFIG } = window.HackVerseSite;

function statusLabel(status) {
  if (status === "registration_open") return "Registration Open";
  if (status === "coming_soon") return "Coming Soon";
  if (status === "completed") return "Completed";
  return status;
}

async function initHackathonsPage() {
  const upcomingRoot = document.getElementById("upcomingHackathons");
  const pastRoot = document.getElementById("pastHackathons");
  if (!upcomingRoot || !pastRoot) return;

  try {
    const content = await loadContent();
    const events = (content.hackathons || []).filter(
      (event) => event?.isActive !== false && (event?.publishStatus || "published") === "published"
    );
    const upcoming = events.filter((event) =>
      ["registration_open", "coming_soon"].includes(event.status)
    );
    const past = events.filter((event) => event.status === "completed");

    upcomingRoot.innerHTML = upcoming
      .map(
        (event) => `
      <article class="card">
        <span class="chip">${statusLabel(event.status)}</span>
        <h3>${event.name}</h3>
        <p>${event.theme}</p>
        <div class="metrics">
          <div class="metric"><strong>${event.dateDisplay}</strong><span>Date</span></div>
          <div class="metric"><strong>${event.duration}</strong><span>Duration</span></div>
          <div class="metric"><strong>${event.prizePool}</strong><span>Prize Pool</span></div>
          <div class="metric"><strong>${event.teamSize}</strong><span>Team Size</span></div>
        </div>
        <div class="cta-row">
          <a class="btn btn-primary cta-track" data-cta="hackathons_register" href="${event.registrationUrl || SITE_CONFIG.registerUrl}" target="_blank" rel="noopener noreferrer">Register</a>
          <a class="btn btn-secondary" href="/hackathons/${event.slug}/">View Details</a>
        </div>
      </article>
    `
      )
      .join("");

    if (past.length === 0) {
      pastRoot.innerHTML = `
        <article class="card">
          <h3>Past hackathons will appear here</h3>
          <p>After HackVerse #001, this section will include winners, project links, and event stats.</p>
        </article>
      `;
      return;
    }

    pastRoot.innerHTML = past
      .map(
        (event) => `
      <article class="card">
        <span class="chip warm">${statusLabel(event.status)}</span>
        <h3>${event.name}</h3>
        <p>${event.dateDisplay}</p>
      </article>
    `
      )
      .join("");
  } catch (error) {
    upcomingRoot.innerHTML = "<p>Unable to load events right now.</p>";
    pastRoot.innerHTML = "";
    console.error(error);
  }
}

initHackathonsPage();
