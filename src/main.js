import "./styles.css";
import { initMotion } from "./modules/animations.js";
import { initIcons } from "./modules/icons.js";
import { initProjectCards, renderProjects } from "./modules/projects.js";
import { createHeroScene, createLabScene } from "./modules/three-scenes.js";
import { initUi } from "./modules/ui.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

renderProjects();
initIcons();
initUi();
initProjectCards();
initMotion({ prefersReducedMotion });
createHeroScene({ prefersReducedMotion });
createLabScene();
