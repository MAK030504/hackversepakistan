const { loadContent } = window.HackVerseSite;

async function initProjectsPage() {
  const root = document.getElementById("projectsRoot");
  if (!root) return;
  try {
    const content = await loadContent();
    const projects = (content.projects || []).filter(
      (project) =>
        project?.isActive !== false && (project?.publishStatus || "published") === "published"
    );
    if (!projects.length) {
      root.innerHTML = `
        <article class="card">
          <h3>Project showcase structure is ready</h3>
          <p>After HackVerse #001, this page will publish submissions with team names, stack, GitHub links, demos, and awards.</p>
        </article>
      `;
      return;
    }
    root.innerHTML = projects
      .map(
        (project) => `
      <article class="card">
        <span class="chip warm">${project.award || "Participant Project"}</span>
        <h3>${project.name}</h3>
        <p>${project.description}</p>
        <p><strong>Tech:</strong> ${project.techStack.join(", ")}</p>
        <div class="cta-row">
          ${
            project.githubUrl
              ? `<a class="btn btn-secondary" href="${project.githubUrl}" target="_blank" rel="noopener noreferrer">GitHub</a>`
              : ""
          }
          ${
            project.demoUrl
              ? `<a class="btn btn-primary" href="${project.demoUrl}" target="_blank" rel="noopener noreferrer">Live Demo</a>`
              : ""
          }
        </div>
      </article>
    `
      )
      .join("");
  } catch (error) {
    root.innerHTML = `<p>Unable to load projects right now.</p>`;
    console.error(error);
  }
}

initProjectsPage();
