const deck = document.querySelector("#deck");
const slides = Array.from(document.querySelectorAll(".slide"));
const thumbs = Array.from(document.querySelectorAll(".thumb"));
const currentSlide = document.querySelector("#currentSlide");
const totalSlides = document.querySelector("#totalSlides");
const previousButton = document.querySelector("#prevSlide");
const nextButton = document.querySelector("#nextSlide");
const fullscreenButton = document.querySelector("#toggleFullscreen");

let activeIndex = 0;

totalSlides.textContent = String(slides.length).padStart(2, "0");

function setActive(index, shouldScroll = false) {
  activeIndex = Math.max(0, Math.min(index, slides.length - 1));

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeIndex);
  });

  thumbs.forEach((thumb, thumbIndex) => {
    thumb.classList.toggle("is-current", thumbIndex === activeIndex);
  });

  currentSlide.textContent = String(activeIndex + 1).padStart(2, "0");
  previousButton.disabled = activeIndex === 0;
  nextButton.disabled = activeIndex === slides.length - 1;

  if (shouldScroll) {
    slides[activeIndex].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }
}

function goTo(offset) {
  setActive(activeIndex + offset, true);
}

previousButton.addEventListener("click", () => goTo(-1));
nextButton.addEventListener("click", () => goTo(1));

thumbs.forEach((thumb, index) => {
  thumb.addEventListener("click", (event) => {
    event.preventDefault();
    setActive(index, true);
  });
});

fullscreenButton.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
    return;
  }

  await document.exitFullscreen();
});

document.addEventListener("fullscreenchange", () => {
  document.body.classList.toggle("is-fullscreen", Boolean(document.fullscreenElement));
});

document.addEventListener("keydown", (event) => {
  if (event.defaultPrevented) return;

  const keys = {
    ArrowRight: 1,
    ArrowDown: 1,
    PageDown: 1,
    " ": 1,
    ArrowLeft: -1,
    ArrowUp: -1,
    PageUp: -1
  };

  if (event.key === "Home") {
    event.preventDefault();
    setActive(0, true);
    return;
  }

  if (event.key === "End") {
    event.preventDefault();
    setActive(slides.length - 1, true);
    return;
  }

  if (Object.hasOwn(keys, event.key)) {
    event.preventDefault();
    goTo(keys[event.key]);
  }
});

deck.addEventListener(
  "wheel",
  (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    deck.scrollBy({ left: event.deltaY, behavior: "smooth" });
  },
  { passive: false }
);

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    const index = slides.indexOf(visible.target);
    if (index !== -1 && index !== activeIndex) {
      setActive(index);
    }
  },
  {
    root: deck,
    threshold: [0.58, 0.75, 0.9]
  }
);

slides.forEach((slide) => observer.observe(slide));
setActive(0);
