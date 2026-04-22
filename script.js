document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".masthead-toggle");
const siteNavShell = document.querySelector(".masthead-nav-shell");
const siteNav = document.querySelector(".masthead-nav");
const navLinks = document.querySelectorAll(".masthead-nav a, .masthead-cta");
const mobileMenuItems = siteNavShell
  ? Array.from(siteNavShell.querySelectorAll(".masthead-nav a, .masthead-cta"))
  : [];
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
const mobileWidthQuery = window.matchMedia("(max-width: 900px)");

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

function closeMenu() {
  if (!menuToggle || !siteNavShell) {
    return;
  }

  siteNavShell.classList.remove("is-open");
  siteNavShell.setAttribute("aria-hidden", "true");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  document.body.classList.remove("menu-open");
  syncMenuVisualState(false);
}

function openMenu() {
  if (!menuToggle || !siteNavShell) {
    return;
  }

  siteNavShell.classList.add("is-open");
  siteNavShell.setAttribute("aria-hidden", "false");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close menu");
  document.body.classList.add("menu-open");
  syncMenuVisualState(true);
}

function syncMenuVisualState(isOpen) {
  if (!siteNavShell) {
    return;
  }

  if (!mobileWidthQuery.matches) {
    [
      "display",
      "opacity",
      "visibility",
      "pointer-events",
      "transform"
    ].forEach((property) => siteNavShell.style.removeProperty(property));

    mobileMenuItems.forEach((item) => {
      ["opacity", "transform", "transition-delay"].forEach((property) =>
        item.style.removeProperty(property)
      );
    });

    return;
  }

  siteNavShell.style.display = "flex";

  if (isOpen) {
    window.requestAnimationFrame(() => {
      siteNavShell.style.opacity = "1";
      siteNavShell.style.visibility = "visible";
      siteNavShell.style.pointerEvents = "auto";
      siteNavShell.style.transform = "translate3d(0, 0, 0)";

      mobileMenuItems.forEach((item, index) => {
        item.style.transitionDelay = `${40 + (index * 40)}ms`;
        item.style.opacity = "1";
        item.style.transform = "translate3d(0, 0, 0)";
      });
    });

    return;
  }

  siteNavShell.style.opacity = "0";
  siteNavShell.style.visibility = "hidden";
  siteNavShell.style.pointerEvents = "none";
  siteNavShell.style.transform = "translate3d(0, -1rem, 0)";

  mobileMenuItems.forEach((item) => {
    item.style.transitionDelay = "0ms";
    item.style.opacity = "0";
    item.style.transform = "translate3d(0, 1.15rem, 0)";
  });
}

if (menuToggle && siteNav && siteNavShell) {
  siteNavShell.setAttribute("aria-hidden", "true");
  syncMenuVisualState(false);

  menuToggle.addEventListener("click", () => {
    const isOpen = !siteNavShell.classList.contains("is-open");

    if (isOpen) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  siteNavShell.addEventListener("click", (event) => {
    if (event.target === siteNavShell) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  mobileWidthQuery.addEventListener("change", (event) => {
    if (!event.matches) {
      closeMenu();
      syncMenuVisualState(false);
      return;
    }

    syncMenuVisualState(false);
  });
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const shouldUseStaticMotionFallback = () => reducedMotionQuery.matches && !mobileWidthQuery.matches;

function setViewportHeightVar() {
  const viewportHeight = window.visualViewport?.height || window.innerHeight || 0;

  if (!viewportHeight) {
    return;
  }

  document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
}

function playVideoStories() {
  videoStories.forEach(({ media }) => {
    if (!media || typeof media.play !== "function") {
      return;
    }

    media.muted = true;
    media.defaultMuted = true;
    media.autoplay = true;
    media.playsInline = true;
    media.setAttribute("muted", "");
    media.setAttribute("autoplay", "");
    media.setAttribute("playsinline", "");
    media.setAttribute("webkit-playsinline", "");

    const tryPlay = () => {
      media.play().catch(() => {});
    };

    if (media.readyState >= 2) {
      tryPlay();
    } else {
      media.addEventListener("loadedmetadata", tryPlay, { once: true });
      media.addEventListener("canplay", tryPlay, { once: true });
    }
  });
}

let videoWakeBound = false;

function bindVideoWakeEvents() {
  if (videoWakeBound) {
    return;
  }

  const wakeVideoPlayback = () => {
    playVideoStories();
    requestMotionFrame();
  };

  ["touchstart", "pointerdown", "click"].forEach((eventName) => {
    document.addEventListener(eventName, wakeVideoPlayback, { passive: true });
  });

  videoWakeBound = true;
}

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
  const reducedMobileMotion = reducedMotionQuery.matches && mobileWidthQuery.matches;
  const viewportHeight = window.visualViewport?.height || window.innerHeight || 1;

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
    if (reducedMobileMotion) {
      image.style.setProperty("--media-shift", "0px");
      return;
    }

    const frame = image.closest("figure, article, div");

    if (!frame) {
      return;
    }

    const rect = frame.getBoundingClientRect();
    const offset = ((rect.top + rect.height / 2) - viewportHeight / 2) / viewportHeight;
    const shift = clamp(offset * -24, -18, 18);
    image.style.setProperty("--media-shift", `${shift.toFixed(2)}px`);
  });

  karaokeTargets.forEach(({ node, chars }) => {
    if (reducedMotionQuery.matches) {
      chars.forEach((char) => char.classList.add("is-active"));
      return;
    }

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
      card.style.opacity = reducedMotionQuery.matches ? "1" : index === 0 ? "1" : "0";
      card.classList.toggle("is-current", index === 0);
    });
  });
}

let frameId = 0;

function requestMotionFrame() {
  if (frameId || shouldUseStaticMotionFallback()) {
    return;
  }

  frameId = window.requestAnimationFrame(() => {
    frameId = 0;
    updateScrollMotion();
  });
}

function handleMotionPreferenceChange() {
  if (shouldUseStaticMotionFallback()) {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }

    resetMotionState();
    return;
  }

  playVideoStories();
  requestMotionFrame();
}

playVideoStories();
bindVideoWakeEvents();
setViewportHeightVar();

if (shouldUseStaticMotionFallback()) {
  resetMotionState();
} else {
  updateScrollMotion();
  window.addEventListener("scroll", requestMotionFrame, { passive: true });
  window.addEventListener("resize", () => {
    setViewportHeightVar();
    requestMotionFrame();
  });
  window.addEventListener("load", requestMotionFrame);
  window.addEventListener("hashchange", requestMotionFrame);
  window.addEventListener("pageshow", requestMotionFrame);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      playVideoStories();
      requestMotionFrame();
    }
  });
  window.setTimeout(requestMotionFrame, 120);
  window.setTimeout(playVideoStories, 320);

  if (document.fonts && typeof document.fonts.ready?.then === "function") {
    document.fonts.ready.then(requestMotionFrame).catch(() => {});
  }
}

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    setViewportHeightVar();
    requestMotionFrame();
  });

  window.visualViewport.addEventListener("scroll", () => {
    setViewportHeightVar();
    requestMotionFrame();
  });
}

if (typeof reducedMotionQuery.addEventListener === "function") {
  reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);
} else if (typeof reducedMotionQuery.addListener === "function") {
  reducedMotionQuery.addListener(handleMotionPreferenceChange);
}
