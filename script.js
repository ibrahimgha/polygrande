document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".masthead-toggle");
const siteNavShell = document.querySelector(".masthead-nav-shell");
const siteNav = document.querySelector(".masthead-nav");
const navLinks = document.querySelectorAll(".masthead-nav a, .masthead-cta");
const yearNode = document.querySelector("#year");
const revealNodes = Array.from(document.querySelectorAll(".reveal"));
const sectionNodes = Array.from(document.querySelectorAll("main > section"));
const firstSection = sectionNodes[0] ?? null;
const parallaxMedia = Array.from(
  document.querySelectorAll(
    ".hero-shot img, .ribbon-card img, .photo-card img, .standard-photo img, .mobile-factory-image img, .mobile-factory-poster img, .partner-image img, .partner-poster img"
  )
);
const videoStories = Array.from(document.querySelectorAll("[data-video-story]")).map((stage) => ({
  stage,
  scrollArea: stage.closest(".video-story-scroll"),
  cards: Array.from(stage.querySelectorAll("[data-story-card]")),
  media: stage.querySelector("video")
}));
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

if (menuToggle && siteNav && siteNavShell) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNavShell.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNavShell.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function buildKaraokeHeading(node) {
  if (!node || node.dataset.karaokeReady === "true") {
    return null;
  }

  const text = node.textContent.trim();

  if (!text) {
    return null;
  }

  const fragment = document.createDocumentFragment();
  const chars = [];

  text.split(/(\s+)/).forEach((part) => {
    if (!part) {
      return;
    }

    if (/^\s+$/.test(part)) {
      const spacer = document.createElement("span");
      spacer.className = "karaoke-space";
      spacer.setAttribute("aria-hidden", "true");
      spacer.textContent = "\u00a0";
      fragment.append(spacer);
      return;
    }

    const word = document.createElement("span");
    word.className = "karaoke-word";
    word.setAttribute("aria-hidden", "true");

    Array.from(part).forEach((char) => {
      const span = document.createElement("span");
      span.className = "karaoke-char";
      span.setAttribute("aria-hidden", "true");
      span.textContent = char;
      chars.push(span);
      word.append(span);
    });

    fragment.append(word);
  });

  node.textContent = "";
  node.classList.add("scroll-karaoke");
  node.dataset.karaokeReady = "true";
  node.setAttribute("aria-label", text);
  node.append(fragment);

  return {
    node,
    chars
  };
}

const karaokeTargets = Array.from(
  document.querySelectorAll(".hero h1, .section-heading h2, .about-card h2, .cta h2")
)
  .map((node) => buildKaraokeHeading(node))
  .filter(Boolean);

function getEntryProgress(rect, startRatio = 0.96, travelRatio = 0.58) {
  const viewportHeight = window.innerHeight || 1;
  const start = viewportHeight * startRatio;
  const travel = viewportHeight * travelRatio;

  return clamp((start - rect.top) / travel, 0, 1);
}

function updateScrollMotion() {
  sectionNodes.forEach((section, index) => {
    const progress = index === 0 ? 1 : getEntryProgress(section.getBoundingClientRect(), 1.02, 0.72);
    section.style.setProperty("--section-progress", progress.toFixed(3));
  });

  revealNodes.forEach((node) => {
    const progress = firstSection && firstSection.contains(node)
      ? 1
      : getEntryProgress(node.getBoundingClientRect(), 0.98, 0.54);
    node.style.setProperty("--reveal-progress", progress.toFixed(3));
    node.classList.toggle("is-visible", progress > 0.08);
  });

  parallaxMedia.forEach((image) => {
    const frame = image.closest("figure, article, div");

    if (!frame) {
      return;
    }

    const rect = frame.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;
    const offset = ((rect.top + rect.height / 2) - viewportHeight / 2) / viewportHeight;
    const shift = clamp(offset * -24, -18, 18);
    image.style.setProperty("--media-shift", `${shift.toFixed(2)}px`);
  });

  karaokeTargets.forEach(({ node, chars }) => {
    const progress = firstSection && firstSection.contains(node)
      ? 1
      : getEntryProgress(node.getBoundingClientRect(), 0.9, 0.48);
    const activeChars = Math.round(progress * chars.length);

    chars.forEach((char, index) => {
      char.classList.toggle("is-active", index < activeChars);
    });
  });

  videoStories.forEach((story) => {
    if (!story.scrollArea || !story.cards.length) {
      return;
    }

    const rect = story.scrollArea.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;
    const totalScroll = Math.max(rect.height - viewportHeight, 1);
    const scrolled = clamp(-rect.top, 0, totalScroll);
    const progress = scrolled / totalScroll;
    const motion = progress * Math.max(story.cards.length - 1, 0);

    story.stage.style.setProperty("--story-progress", progress.toFixed(3));

    story.cards.forEach((card, index) => {
      const offset = index - motion;
      const distance = Math.min(Math.abs(offset), 1.8);
      const opacity = clamp(1 - (distance * 1.35), 0, 1);

      card.style.setProperty("--card-offset", offset.toFixed(3));
      card.style.setProperty("--card-distance", distance.toFixed(3));
      card.style.opacity = opacity.toFixed(3);
      card.classList.toggle("is-current", distance < 0.55);
    });
  });
}

function resetMotionState() {
  sectionNodes.forEach((section) => {
    section.style.setProperty("--section-progress", "1");
  });

  revealNodes.forEach((node) => {
    node.style.setProperty("--reveal-progress", "1");
    node.classList.add("is-visible");
  });

  parallaxMedia.forEach((image) => {
    image.style.setProperty("--media-shift", "0px");
  });

  karaokeTargets.forEach(({ chars }) => {
    chars.forEach((char) => char.classList.add("is-active"));
  });

  videoStories.forEach((story) => {
    story.stage.style.setProperty("--story-progress", "1");

    story.cards.forEach((card, index) => {
      card.style.setProperty("--card-offset", "0");
      card.style.setProperty("--card-distance", "0");
      card.style.opacity = index === 0 ? "1" : "0";
      card.classList.toggle("is-current", index === 0);
    });
  });
}

let frameId = 0;

function requestMotionFrame() {
  if (frameId || reducedMotionQuery.matches) {
    return;
  }

  frameId = window.requestAnimationFrame(() => {
    frameId = 0;
    updateScrollMotion();
  });
}

function handleMotionPreferenceChange() {
  if (reducedMotionQuery.matches) {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }

    resetMotionState();
    return;
  }

  requestMotionFrame();
}

if (reducedMotionQuery.matches) {
  resetMotionState();
} else {
  videoStories.forEach(({ media }) => {
    if (media && typeof media.play === "function") {
      media.play().catch(() => {});
    }
  });

  updateScrollMotion();
  window.addEventListener("scroll", requestMotionFrame, { passive: true });
  window.addEventListener("resize", requestMotionFrame);
  window.addEventListener("load", requestMotionFrame);
  window.addEventListener("hashchange", requestMotionFrame);
  window.addEventListener("pageshow", requestMotionFrame);
  window.setTimeout(requestMotionFrame, 120);

  if (document.fonts && typeof document.fonts.ready?.then === "function") {
    document.fonts.ready.then(requestMotionFrame).catch(() => {});
  }
}

if (typeof reducedMotionQuery.addEventListener === "function") {
  reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);
} else if (typeof reducedMotionQuery.addListener === "function") {
  reducedMotionQuery.addListener(handleMotionPreferenceChange);
}
