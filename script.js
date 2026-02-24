const animatedItems = document.querySelectorAll("[data-animate]");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!prefersReducedMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  animatedItems.forEach((item) => observer.observe(item));
} else {
  animatedItems.forEach((item) => item.classList.add("is-visible"));
}

const navLinks = Array.from(document.querySelectorAll(".nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const setActiveLink = () => {
  const scrollPosition = window.scrollY + 120;
  let activeSection = sections[0];

  sections.forEach((section) => {
    if (section.offsetTop <= scrollPosition) {
      activeSection = section;
    }
  });

  navLinks.forEach((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    link.classList.toggle("is-active", target === activeSection);
  });
};

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const progressBar = document.querySelector(".scroll-progress span");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const statItems = document.querySelectorAll("[data-count]");

const updateScrollProgress = () => {
  if (!progressBar) return;
  const scrollHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
};

const updateParallax = () => {
  if (prefersReducedMotion) return;
  parallaxItems.forEach((item) => {
    const speed = Number.parseFloat(item.dataset.parallax) || 0.08;
    const offset = window.scrollY * speed;
    item.style.transform = `translateY(${offset}px)`;
  });
};

const animateCount = (element) => {
  const target = Number.parseInt(element.dataset.count, 10) || 0;
  const suffix = element.dataset.suffix || "";
  const duration = 1200;
  let start = null;

  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const value = Math.floor(progress * target);
    element.textContent = `${value}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = `${target}${suffix}`;
    }
  };

  window.requestAnimationFrame(step);
};

if (prefersReducedMotion) {
  statItems.forEach((item) => {
    const suffix = item.dataset.suffix || "";
    item.textContent = `${item.dataset.count}${suffix}`;
  });
} else if (statItems.length) {
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = "true";
          animateCount(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statItems.forEach((item) => statObserver.observe(item));
}

const tiltCards = document.querySelectorAll("[data-tilt]");

const handleSpotlight = (event) => {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  card.style.setProperty("--spot-x", `${x}%`);
  card.style.setProperty("--spot-y", `${y}%`);
};

const resetSpotlight = (event) => {
  const card = event.currentTarget;
  card.style.removeProperty("--spot-x");
  card.style.removeProperty("--spot-y");
};

if (!prefersReducedMotion) {
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", handleSpotlight);
    card.addEventListener("mouseleave", resetSpotlight);
  });
}

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxClose = document.querySelector(".lightbox-close");
const galleryItems = document.querySelectorAll(".gallery-item");

const openLightbox = (src) => {
  if (!lightbox || !lightboxImage) return;
  lightboxImage.src = src;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
};

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
};

galleryItems.forEach((item) => {
  item.addEventListener("click", () => openLightbox(item.dataset.full));
});

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});

let ticking = false;
const handleScroll = () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    updateScrollProgress();
    setActiveLink();
    updateParallax();
    ticking = false;
  });
};

setActiveLink();
updateScrollProgress();
updateParallax();
window.addEventListener("scroll", handleScroll, { passive: true });
