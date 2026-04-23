import { projects } from "../data/projects.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTechList(tech) {
  return tech.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
}

export function renderProjects() {
  const track = document.querySelector("#projects-track");
  if (!track) return;

  track.innerHTML = projects
    .map((project, index) => {
      const buildDirection = index % 2 === 0 ? "left" : "right";

      return `
        <article class="project-card" data-build="${buildDirection}">
          <div class="project-card-surface">
            <div class="project-media">
              <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.imageAlt)}" loading="lazy" />
              <span class="project-index">${String(index + 1).padStart(2, "0")}</span>
            </div>
            <div class="project-content">
              <div class="project-meta-row">
                <span class="project-chip">${escapeHtml(project.type)}</span>
                <span>${escapeHtml(project.label)}</span>
              </div>
              <h3>${escapeHtml(project.title)}</h3>
              <p>${escapeHtml(project.description)}</p>
              <div class="project-tech-list" aria-label="Tecnologias usadas">${renderTechList(project.tech)}</div>
              <a class="project-card-link" href="${escapeHtml(project.href)}" target="_blank" rel="noreferrer">
                Ver no GitHub <i data-lucide="arrow-up-right" class="size-4"></i>
              </a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

export function initProjectCards() {
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!canHover) return;

  document.querySelectorAll(".project-card").forEach((card) => {
    const surface = card.querySelector(".project-card-surface");
    if (!surface) return;

    card.addEventListener(
      "pointermove",
      (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        surface.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
        surface.style.setProperty("--tilt-y", `${(x * 7).toFixed(2)}deg`);
        surface.style.setProperty("--shine-x", `${(x + 0.5) * 100}%`);
        surface.style.setProperty("--shine-y", `${(y + 0.5) * 100}%`);
      },
      { passive: true },
    );

    card.addEventListener("pointerleave", () => {
      surface.style.setProperty("--tilt-x", "0deg");
      surface.style.setProperty("--tilt-y", "0deg");
      surface.style.setProperty("--shine-x", "50%");
      surface.style.setProperty("--shine-y", "0%");
    });
  });
}
