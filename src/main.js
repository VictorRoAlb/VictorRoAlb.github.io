async function loadProjects() {
  const response = await fetch("./data/projects.json");
  return response.json();
}

function renderProjectCard(project) {
  const tags = project.tags.map((tag) => `<span class="meta-chip">${tag}</span>`).join("");
  const tech = project.technologies.map((item) => `<span class="meta-chip">${item}</span>`).join("");
  const reportLink = project.report && project.report !== "#"
    ? `<a class="button button-secondary" href="${project.report}">Report</a>`
    : "";
  return `
    <article class="project-card">
      <img class="project-thumb" src="${project.image}" alt="${project.title} preview" loading="lazy" />
      <p class="project-subtitle">${project.subtitle}</p>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <p>${project.details}</p>
      <div class="meta-row">${tags}</div>
      <div class="meta-row">${tech}</div>
      <div class="meta-row">
        <span class="meta-chip">Status: ${project.status}</span>
      </div>
      <div class="project-links">
        <a class="button button-secondary" href="${project.github}">GitHub</a>
        ${reportLink}
      </div>
    </article>
  `;
}

async function main() {
  const projects = await loadProjects();
  const grid = document.getElementById("projects-grid");
  grid.innerHTML = projects.map(renderProjectCard).join("");
}

main().catch((error) => {
  console.error(error);
});
