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
                <span class="media-zoom-trigger" aria-hidden="true">⤢</span>
                <img src="${item.src}" alt="${item.alt}" loading="lazy" />
              </figure>
            `,
          )
          .join("")}
      </div>
    `;
  }

  return `
    <figure class="project-thumb-frame"${project.imageRatio ? ` style="--thumb-ratio: ${project.imageRatio};"` : ""}>
      <span class="media-zoom-trigger" aria-hidden="true">⤢</span>
      <img class="project-thumb" src="${project.image}" alt="${project.title} preview" loading="lazy" />
    </figure>
  `;
}

function renderProjectCard(project) {
  const tags = project.tags.map((tag) => `<span class="meta-chip">${tag}</span>`).join("");
  const tech = project.technologies.map((item) => `<span class="meta-chip">${item}</span>`).join("");
  const githubLink = project.github && project.github !== "#"
    ? `<a class="button button-secondary external-link" href="${project.github}" target="_blank" rel="noreferrer">GitHub</a>`
    : "";
  const reportLink = project.report && project.report !== "#"
    ? `<a class="button button-secondary external-link" href="${project.report}" target="_blank" rel="noreferrer">Report</a>`
    : "";
  const linksBlock = (githubLink || reportLink)
    ? `<div class="project-links">
        ${githubLink}
        ${reportLink}
      </div>`
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
      ${linksBlock}
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

function ensureLightbox() {
  let lightbox = document.getElementById("media-lightbox");
  if (lightbox) return lightbox;

  lightbox = document.createElement("div");
  lightbox.id = "media-lightbox";
  lightbox.className = "media-lightbox";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <div class="media-lightbox-backdrop" data-close="true"></div>
    <div class="media-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Expanded project image">
      <button class="media-lightbox-close" type="button" aria-label="Close expanded image">×</button>
      <img class="media-lightbox-image" src="" alt="" />
      <p class="media-lightbox-caption"></p>
    </div>
  `;
  document.body.appendChild(lightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target.dataset.close === "true" || event.target.closest(".media-lightbox-close")) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });

  return lightbox;
}

function openLightbox(src, alt) {
  const lightbox = ensureLightbox();
  const image = lightbox.querySelector(".media-lightbox-image");
  const caption = lightbox.querySelector(".media-lightbox-caption");

  image.src = src;
  image.alt = alt || "Expanded project image";
  caption.textContent = alt || "";

  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  const lightbox = document.getElementById("media-lightbox");
  if (!lightbox) return;

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
}

function bindLightbox() {
  const grid = document.getElementById("projects-grid");
  grid.addEventListener("click", (event) => {
    const frame = event.target.closest(".project-gallery-item, .project-thumb-frame");
    if (!frame) return;

    const image = frame.querySelector("img");
    if (!image) return;

    openLightbox(image.currentSrc || image.src, image.alt);
  });
}

async function main() {
  const projects = await loadProjects();
  const grid = document.getElementById("projects-grid");
  grid.innerHTML = projects.map(renderProjectCard).join("");
  buildFilters(projects);
  bindFilters();
  bindLightbox();
}

main().catch((error) => {
  console.error(error);
});
