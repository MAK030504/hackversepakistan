const { loadContent } = window.HackVerseSite;

async function initAboutPage() {
  const root = document.getElementById("aboutRoot");
  if (!root) return;
  try {
    const content = await loadContent();
    const about = content.about || {};
    const cards = (Array.isArray(about.cards) ? about.cards : []).filter(
      (card) => card?.isActive !== false
    );
    root.innerHTML = `
      <section class="section section-tight">
        <div class="container">
          <p class="kicker">${about.kicker || "About HackVerse"}</p>
          <h1>${about.title || ""}</h1>
          <p class="lead">${about.lead || ""}</p>
        </div>
      </section>
      <section class="section section-tight">
        <div class="container grid grid-3">
          ${cards
            .map(
              (card) => `
            <article class="card">
              <h3>${card.title}</h3>
              <p>${card.description}</p>
            </article>
          `
            )
            .join("")}
        </div>
      </section>
    `;
  } catch (error) {
    root.innerHTML = `<section class="section"><div class="container"><p>Unable to load about content right now.</p></div></section>`;
    console.error(error);
  }
}

initAboutPage();
