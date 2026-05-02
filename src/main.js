async function loadProjects() {
  const response = await fetch("./data/projects.json");
  return response.json();
}

function statusClass(status) {
  const normalized = status.toLowerCase();
  if (normalized.includes("published")) return "status-published";
  if (normalized.includes("preparation")) return "status-draft";
  return "status-draft";
}

function renderProjectMedia(project) {
  if (project.gallery && project.gallery.length) {
    const hasExplicitWide = project.gallery.some((item) => item.wide);
    return `
      <div class="project-gallery-grid">
        ${project.gallery
          .map(
            (item, index) => `
              <figure class="project-gallery-item ${(item.wide || (!hasExplicitWide && index === 0)) ? "is-wide" : ""}"${item.ratio ? ` style="--gallery-ratio: ${item.ratio};"` : ""}>
                <img src="${item.src}" alt="${item.alt}" loading="lazy" />
              </figure>
            `,
          )
          .join("")}
      </div>
    `;
  }

  return `<img class="project-thumb" src="${project.image}" alt="${project.title} preview" loading="lazy" />`;
}

function renderProjectCard(project) {
  const tags = project.tags.map((tag) => `<span class="meta-chip">${tag}</span>`).join("");
  const tech = project.technologies.map((item) => `<span class="meta-chip">${item}</span>`).join("");
  const reportLink = project.report && project.report !== "#"
    ? `<a class="button button-secondary" href="${project.report}">Report</a>`
    : "";

  return `
    <article class="project-card" data-cluster="${project.cluster}">
      ${renderProjectMedia(project)}
      <div class="project-status-row">
        <p class="project-subtitle">${project.subtitle}</p>
        <span class="status-badge ${statusClass(project.status)}">${project.status}</span>
      </div>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <p>${project.details}</p>
      <p class="cluster-label">${project.cluster}</p>
      <div class="meta-row">${tags}</div>
      <div class="meta-row">${tech}</div>
      <div class="project-links">
        <a class="button button-secondary" href="${project.github}">GitHub</a>
        ${reportLink}
      </div>
    </article>
  `;
}

function buildFilters(projects) {
  const filters = ["All", ...new Set(projects.map((project) => project.cluster))];
  const wrapper = document.getElementById("project-filters");
  wrapper.innerHTML = filters
    .map((filter, index) => `
      <button class="filter-pill ${index === 0 ? "is-active" : ""}" data-filter="${filter}">
        ${filter}
      </button>
    `)
    .join("");
}

function applyFilter(filter) {
  const cards = document.querySelectorAll(".project-card");
  cards.forEach((card) => {
    const shouldShow = filter === "All" || card.dataset.cluster === filter;
    card.classList.toggle("is-hidden", !shouldShow);
  });

  document.querySelectorAll(".filter-pill").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filter);
  });
}

function bindFilters() {
  const wrapper = document.getElementById("project-filters");
  wrapper.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-pill");
    if (!button) return;
    applyFilter(button.dataset.filter);
  });
}

async function main() {
  const projects = await loadProjects();
  const grid = document.getElementById("projects-grid");
  grid.innerHTML = projects.map(renderProjectCard).join("");
  buildFilters(projects);
  bindFilters();
}

main().catch((error) => {
  console.error(error);
});
