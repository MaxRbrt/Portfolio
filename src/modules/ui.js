export function initUi() {
  initCurrentYear();
  initMobileMenu();
  initScrollHeader();
  initContactForm();
  initServiceCards();
}

function initCurrentYear() {
  const year = document.querySelector("#year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

function initMobileMenu() {
  const menuToggle = document.querySelector("#menu-toggle");
  const mobileNav = document.querySelector("#mobile-nav");

  if (!menuToggle || !mobileNav) return;

  const closeMenu = () => {
    mobileNav.classList.add("hidden");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = !mobileNav.classList.contains("hidden");
    mobileNav.classList.toggle("hidden", isOpen);
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  document.querySelectorAll("#mobile-nav a, #desktop-nav a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

function initScrollHeader() {
  const header = document.querySelector("#site-header");
  const progress = document.querySelector("#progress");
  let lastScrollY = window.scrollY;

  window.addEventListener(
    "scroll",
    () => {
      const current = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const amount = documentHeight > 0 ? (current / documentHeight) * 100 : 0;

      if (progress) {
        progress.style.width = `${amount}%`;
      }

      if (header) {
        header.style.transform = current > lastScrollY && current > 140 ? "translateY(-100%)" : "translateY(0)";
      }

      lastScrollY = Math.max(current, 0);
    },
    { passive: true },
  );
}

function initContactForm() {
  document.querySelector("#portfolio-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    window.alert(`Mensagem pronta para envio:\n\n${JSON.stringify(data, null, 2)}`);
    form.reset();
  });
}

function initServiceCards() {
  const cards = Array.from(document.querySelectorAll("[data-service-card]"));
  if (!cards.length) return;

  const setActiveCard = (selectedCard) => {
    cards.forEach((card) => {
      const isActive = card === selectedCard;
      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-expanded", String(isActive));
      card.querySelector(".service-detail")?.setAttribute("aria-hidden", String(!isActive));
    });
  };

  cards.forEach((card, index) => {
    if (index === 0) {
      setActiveCard(card);
    }

    card.addEventListener("click", () => {
      setActiveCard(card.classList.contains("is-active") ? null : card);
    });

    card.addEventListener(
      "pointermove",
      (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
      },
      { passive: true },
    );
  });
}
