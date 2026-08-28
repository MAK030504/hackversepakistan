const { loadContent, SITE_CONFIG } = window.HackVerseSite;

function list(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function peopleCards(items) {
  if (!items.length) {
    return `<article class="card"><h3>To be announced</h3><p>Names will be updated before the event starts.</p></article>`;
  }
  return items
    .map(
      (person) => `
    <article class="card">
      <h3>${person.name}</h3>
      <p>${person.role}</p>
    </article>
  `
    )
    .join("");
}

async function initEventPage() {
  const root = document.getElementById("eventDetailsRoot");
  if (!root) return;

  try {
    const content = await loadContent();
    const events = (content.hackathons || []).filter(
      (entry) => entry?.isActive !== false && (entry?.publishStatus || "published") === "published"
    );
    const eventDetails = content.eventDetails?.["001"] || {};
    const event = events.find((entry) => entry.slug === "001");
    if (!event) throw new Error("Event metadata missing");

    root.innerHTML = `
      <section class="section section-tight">
        <div class="container">
          <span class="chip">Registration Open</span>
          <h1>${event.name}</h1>
          <p class="lead">${eventDetails.overview || ""}</p>
          <div class="metrics">
            <div class="metric"><strong>${event.dateDisplay}</strong><span>Date</span></div>
            <div class="metric"><strong>${event.duration}</strong><span>Duration</span></div>
            <div class="metric"><strong>${event.prizePool}</strong><span>Prize Pool</span></div>
            <div class="metric"><strong>${event.entryFee}</strong><span>Entry Fee</span></div>
          </div>
          <div class="metrics">
            <div class="metric"><strong>${event.teamSize}</strong><span>Team Size</span></div>
            <div class="metric"><strong>${event.location}</strong><span>Location</span></div>
            <div class="metric"><strong>${event.theme}</strong><span>Theme</span></div>
            <div class="metric"><strong>Students + Early Builders</strong><span>Eligibility</span></div>
          </div>
          <div class="cta-row">
            <a class="btn btn-primary cta-track" data-cta="event_page_register" href="${event.registrationUrl || SITE_CONFIG.registerUrl}" target="_blank" rel="noopener noreferrer">Register for ${event.shortName}</a>
            <a class="btn btn-secondary cta-track" data-cta="event_page_community" href="${SITE_CONFIG.communityUrl}" target="_blank" rel="noopener noreferrer">Join Community</a>
          </div>
        </div>
      </section>
      <section class="section section-tight">
        <div class="container grid grid-2">
          <article class="card">
            <h2>Timeline</h2>
            <ul class="timeline">${list(eventDetails.timeline || [])}</ul>
          </article>
          <article class="card">
            <h2>Judging Criteria</h2>
            <ul class="timeline">${list(eventDetails.judgingCriteria || [])}</ul>
          </article>
          <article class="card">
            <h2>Rules</h2>
            <ul class="timeline">${list(eventDetails.rules || [])}</ul>
          </article>
          <article class="card">
            <h2>Eligibility</h2>
            <ul class="timeline">${list(eventDetails.eligibility || [])}</ul>
          </article>
        </div>
      </section>
      <section class="section section-tight">
        <div class="container">
          <h2>Judges</h2>
          <div class="grid grid-3">${peopleCards(eventDetails.judges || [])}</div>
        </div>
      </section>
      <section class="section section-tight">
        <div class="container">
          <h2>Mentors</h2>
          <div class="grid grid-3">${peopleCards(eventDetails.mentors || [])}</div>
        </div>
      </section>
      <section class="section section-tight">
        <div class="container">
          <h2>FAQ</h2>
          <div class="card">
            ${(eventDetails.faq || [])
              .map(
                (faq) => `
              <article class="faq-item">
                <h3>${faq.question}</h3>
                <p>${faq.answer}</p>
              </article>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  } catch (error) {
    root.innerHTML = `<section class="section"><div class="container"><p>Unable to load event details right now.</p></div></section>`;
    console.error(error);
  }
}

initEventPage();
