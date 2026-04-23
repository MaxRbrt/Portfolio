import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initMotion({ prefersReducedMotion }) {
  splitBuildTitles();

  if (prefersReducedMotion) {
    return;
  }

  initHeroIntro();
  initConstructionReveals();
  initProjectScroller();

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}

function initHeroIntro() {
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

  intro
    .from("#site-header", { y: -80, autoAlpha: 0, duration: 0.9 })
    .from(".hero-line", { yPercent: 110, autoAlpha: 0, stagger: 0.13, duration: 1.05 }, "-=0.45")
    .from(".hero-content .reveal", { y: 28, autoAlpha: 0, stagger: 0.08, duration: 0.75 }, "-=0.6")
    .from("aside.reveal", { x: 36, autoAlpha: 0, duration: 0.8 }, "-=0.62");

  gsap.to(".hero-content", {
    yPercent: 10,
    autoAlpha: 0.54,
    ease: "none",
    scrollTrigger: {
      trigger: "#inicio",
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });
}

function splitBuildTitles() {
  document.querySelectorAll(".build-title").forEach((title) => {
    if (title.dataset.split === "true") return;

    const words = title.textContent.trim().split(/\s+/);
    title.innerHTML = words
      .map((word, index) => `<span class="build-word" data-side="${index % 2 === 0 ? "left" : "right"}">${word}</span>`)
      .join(" ");
    title.dataset.split = "true";
  });
}

function initConstructionReveals() {
  const isCompact = window.matchMedia("(max-width: 900px)").matches;
  const directions = isCompact
    ? {
        left: { x: 0, y: 46 },
        right: { x: 0, y: 46 },
        up: { x: 0, y: 46 },
        down: { x: 0, y: -36 },
        scale: { x: 0, y: 28, scale: 0.92 },
      }
    : {
    left: { x: -92, y: 0 },
    right: { x: 92, y: 0 },
    up: { x: 0, y: 56 },
    down: { x: 0, y: -44 },
    scale: { x: 0, y: 28, scale: 0.92 },
      };

  gsap.utils.toArray("[data-build]").forEach((element) => {
    const from = directions[element.dataset.build] ?? directions.up;

    gsap.fromTo(
      element,
      { ...from, autoAlpha: 0 },
      {
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 86%",
          once: true,
        },
      },
    );
  });

  document.querySelectorAll(".build-title").forEach((title) => {
    const words = title.querySelectorAll(".build-word");

    gsap.fromTo(
      words,
      {
        xPercent: (index, word) => (isCompact ? 0 : word.dataset.side === "left" ? -42 : 42),
        y: 18,
        autoAlpha: 0,
        filter: "blur(10px)",
      },
      {
        xPercent: 0,
        y: 0,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.82,
        stagger: 0.055,
        ease: "power3.out",
        scrollTrigger: {
          trigger: title,
          start: "top 82%",
          once: true,
        },
      },
    );
  });

}

function initProjectScroller() {
  gsap.matchMedia().add("(min-width: 901px)", () => {
    const stage = document.querySelector(".project-stage");
    const track = document.querySelector(".projects-track");
    const cards = Array.from(document.querySelectorAll(".project-card"));

    if (!stage || !track || !cards.length) return undefined;

    const getTrackStart = () => track.getBoundingClientRect().left;
    const getDistance = () => {
      const start = getTrackStart();
      const rightGutter = Math.max(32, start);
      const targetRight = window.innerWidth - rightGutter;

      return Math.max(0, track.scrollWidth + start - targetRight);
    };

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: () => `+=${getDistance() + window.innerWidth * 0.28}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    timeline.to(track, { x: () => -getDistance(), ease: "none", duration: 0.86 });
    timeline.to({}, { duration: 0.14 });

    return () => timeline.kill();
  });
}
