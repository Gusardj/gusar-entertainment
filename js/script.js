const nav = document.querySelector("nav");
const heroLabel = document.querySelector(".hero-label");

function updateNavState() {
  if (!nav) return;

  const threshold = heroLabel
    ? heroLabel.getBoundingClientRect().top + window.scrollY - nav.offsetHeight
    : 120;

  if (window.scrollY >= threshold) {
    nav.classList.add("scrolled");
    document.body.classList.add("page-scrolled");
  } else {
    nav.classList.remove("scrolled");
    document.body.classList.remove("page-scrolled");
  }
}

window.addEventListener("scroll", updateNavState, { passive: true });
window.addEventListener("resize", updateNavState);
updateNavState();

(function initServicesEditorial() {
  const section = document.getElementById("services-editorial");
  if (!section) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function startCountUp(el) {
    const finalNum = Number.parseInt(el.getAttribute("data-target"), 10);
    if (!Number.isFinite(finalNum)) return;

    let frame = 0;
    const totalFrames = 18;
    const timer = window.setInterval(() => {
      frame += 1;
      if (frame < totalFrames) {
        const converging = frame > totalFrames - 4;
        const nextValue = converging ? finalNum : Math.floor(Math.random() * 9) + 1;
        el.textContent = String(nextValue).padStart(2, "0");
        return;
      }

      el.textContent = String(finalNum).padStart(2, "0");
      window.clearInterval(timer);
    }, 42);
  }

  const revealTargets = section.querySelectorAll(".ed-header, .ed-card, .ed-cta-block");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        el.classList.add("ed-visible");

        if (!prefersReduced && el.classList.contains("ed-card")) {
          const numEl = el.querySelector(".ed-num");
          if (numEl) {
            const delay = Number.parseFloat(window.getComputedStyle(el).transitionDelay || "0") * 1000;
            window.setTimeout(() => startCountUp(numEl), delay + 350);
          }
        }

        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12 });

    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("ed-visible"));
  }

  if (!prefersReduced && "IntersectionObserver" in window) {
    const shimmerTargets = section.querySelectorAll(".ed-heading, .ed-cta-title");
    const shimmerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("ed-shimmer");
        shimmerObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    shimmerTargets.forEach((el) => shimmerObserver.observe(el));
  }

  if (!prefersReduced) {
    section.querySelectorAll(".ed-card").forEach((card) => {
      card.addEventListener("touchstart", (event) => {
        const touch = event.touches[0];
        if (!touch) return;

        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2.2;
        const ripple = document.createElement("span");
        ripple.className = "ed-ripple";
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${touch.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${touch.clientY - rect.top - size / 2}px`;
        card.appendChild(ripple);

        window.setTimeout(() => ripple.remove(), 850);
      }, { passive: true });
    });

    const ctaButton = section.querySelector(".ed-btn");
    if (ctaButton) {
      window.setTimeout(() => ctaButton.classList.add("ed-pulse-active"), 2200);
    }
  }
})();
